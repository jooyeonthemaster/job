// 환불 요청 API
// 기업 회원이 결제 내역에서 환불을 요청할 때 사용

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/config';
import {
  PaymentType,
  RefundReasonType,
  RefundStatus,
  REFUND_POLICY
} from '@/types/payment.types';

export const dynamic = 'force-dynamic';

// Service Role Key 사용 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RefundRequestBody {
  paymentId: string;
  paymentType: PaymentType;
  reasonType: RefundReasonType;
  reasonDetail?: string;
}

interface RefundEligibilityResult {
  canRefund: boolean;
  refundRate: number;
  refundAmount: number;
  reason: RefundReasonType | null;
  message: string;
}

/**
 * 채용공고 환불 가능 여부 확인
 */
async function checkJobPostingRefundEligibility(
  jobId: string,
  paymentAmount: number
): Promise<RefundEligibilityResult> {
  // 채용공고 정보 조회
  const { data: job, error } = await supabaseAdmin
    .from('jobs')
    .select('id, status, published_at, created_at')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return {
      canRefund: false,
      refundRate: 0,
      refundAmount: 0,
      reason: null,
      message: '채용공고를 찾을 수 없습니다.'
    };
  }

  // 1. 게시 전 (status가 pending 또는 draft)
  if (job.status === 'pending' || job.status === 'draft') {
    return {
      canRefund: true,
      refundRate: REFUND_POLICY.JOB_POSTING.BEFORE_PUBLISH.rate,
      refundAmount: Math.floor(paymentAmount * REFUND_POLICY.JOB_POSTING.BEFORE_PUBLISH.rate),
      reason: 'before_publish',
      message: REFUND_POLICY.JOB_POSTING.BEFORE_PUBLISH.description
    };
  }

  // 2. 게시 후 - 날짜 계산
  if (job.published_at) {
    const publishedDate = new Date(job.published_at);
    const now = new Date();
    const diffTime = now.getTime() - publishedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= REFUND_POLICY.JOB_POSTING.WITHIN_3_DAYS.daysLimit) {
      return {
        canRefund: true,
        refundRate: REFUND_POLICY.JOB_POSTING.WITHIN_3_DAYS.rate,
        refundAmount: Math.floor(paymentAmount * REFUND_POLICY.JOB_POSTING.WITHIN_3_DAYS.rate),
        reason: 'within_3days',
        message: REFUND_POLICY.JOB_POSTING.WITHIN_3_DAYS.description
      };
    }
  }

  // 3. 게시 후 3일 초과 - 환불 불가
  return {
    canRefund: false,
    refundRate: REFUND_POLICY.JOB_POSTING.AFTER_3_DAYS.rate,
    refundAmount: 0,
    reason: null,
    message: REFUND_POLICY.JOB_POSTING.AFTER_3_DAYS.description
  };
}

/**
 * 프로필 열람 환불 가능 여부 확인
 */
async function checkProfileViewRefundEligibility(
  paymentRecordId: string,
  paymentAmount: number
): Promise<RefundEligibilityResult> {
  // 프로필 열람 결제 정보 조회
  const { data: payment, error } = await supabaseAdmin
    .from('profile_view_payments')
    .select('id, talent_id, company_id, payment_status, created_at')
    .eq('id', paymentRecordId)
    .single();

  if (error || !payment) {
    return {
      canRefund: false,
      refundRate: 0,
      refundAmount: 0,
      reason: null,
      message: '결제 정보를 찾을 수 없습니다.'
    };
  }

  // 프로필 열람 결제는 결제 완료 시점에 바로 열람이 가능하므로
  // 기본적으로 환불 불가 (디지털 콘텐츠 특성)
  // 단, 서비스 오류나 중복 결제의 경우 관리자가 수동 처리
  return {
    canRefund: false,
    refundRate: REFUND_POLICY.PROFILE_VIEW.AFTER_VIEW.rate,
    refundAmount: 0,
    reason: null,
    message: REFUND_POLICY.PROFILE_VIEW.AFTER_VIEW.description
  };
}

/**
 * 환불 가능 여부 확인 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const paymentType = searchParams.get('paymentType') as PaymentType;

    if (!paymentId || !paymentType) {
      return NextResponse.json(
        { error: '결제 ID와 결제 유형이 필요합니다.' },
        { status: 400 }
      );
    }

    // 인증 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    let eligibility: RefundEligibilityResult;

    if (paymentType === 'job_posting') {
      // 채용공고 결제 정보 조회
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('id, company_id, posting_total_amount')
        .eq('id', paymentId)
        .single();

      if (jobError || !job) {
        return NextResponse.json(
          { error: '결제 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 권한 확인
      if (job.company_id !== user.id) {
        return NextResponse.json(
          { error: '해당 결제에 대한 권한이 없습니다.' },
          { status: 403 }
        );
      }

      eligibility = await checkJobPostingRefundEligibility(
        paymentId,
        job.posting_total_amount || 0
      );
    } else {
      // 프로필 열람 결제 정보 조회
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('profile_view_payments')
        .select('id, company_id, payment_amount')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        return NextResponse.json(
          { error: '결제 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 권한 확인
      if (payment.company_id !== user.id) {
        return NextResponse.json(
          { error: '해당 결제에 대한 권한이 없습니다.' },
          { status: 403 }
        );
      }

      eligibility = await checkProfileViewRefundEligibility(
        paymentId,
        payment.payment_amount || 0
      );
    }

    return NextResponse.json({
      paymentId,
      paymentType,
      eligibility
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '환불 가능 여부 확인 중 오류가 발생했습니다.';
    console.error('Refund eligibility check error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 환불 요청 생성 (POST)
 */
export async function POST(request: NextRequest) {
  try {
    const body: RefundRequestBody = await request.json();
    const { paymentId, paymentType, reasonType, reasonDetail } = body;

    if (!paymentId || !paymentType || !reasonType) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 인증 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    let originalAmount: number;
    let eligibility: RefundEligibilityResult;
    let relatedId: string;

    if (paymentType === 'job_posting') {
      // 채용공고 결제 정보 조회
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('id, company_id, posting_total_amount, payment_status')
        .eq('id', paymentId)
        .single();

      if (jobError || !job) {
        return NextResponse.json(
          { error: '결제 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 권한 확인
      if (job.company_id !== user.id) {
        return NextResponse.json(
          { error: '해당 결제에 대한 권한이 없습니다.' },
          { status: 403 }
        );
      }

      // 결제 완료 상태인지 확인
      if (job.payment_status !== 'paid' && job.payment_status !== 'confirmed') {
        return NextResponse.json(
          { error: '결제가 완료된 건만 환불 요청이 가능합니다.' },
          { status: 400 }
        );
      }

      originalAmount = job.posting_total_amount || 0;
      eligibility = await checkJobPostingRefundEligibility(paymentId, originalAmount);
      relatedId = job.id;
    } else {
      // 프로필 열람 결제 정보 조회
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('profile_view_payments')
        .select('id, company_id, payment_amount, payment_status')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        return NextResponse.json(
          { error: '결제 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 권한 확인
      if (payment.company_id !== user.id) {
        return NextResponse.json(
          { error: '해당 결제에 대한 권한이 없습니다.' },
          { status: 403 }
        );
      }

      // 결제 완료 상태인지 확인
      if (payment.payment_status !== 'paid') {
        return NextResponse.json(
          { error: '결제가 완료된 건만 환불 요청이 가능합니다.' },
          { status: 400 }
        );
      }

      originalAmount = payment.payment_amount || 0;
      eligibility = await checkProfileViewRefundEligibility(paymentId, originalAmount);
      relatedId = payment.id;
    }

    // 서비스 오류/중복 결제는 무조건 환불 요청 가능 (관리자가 판단)
    const isSpecialCase = reasonType === 'service_error' || reasonType === 'duplicate_payment';

    if (!eligibility.canRefund && !isSpecialCase) {
      return NextResponse.json(
        { error: eligibility.message },
        { status: 400 }
      );
    }

    // 특수 케이스의 경우 100% 환불로 설정
    if (isSpecialCase) {
      eligibility.refundRate = 1.0;
      eligibility.refundAmount = originalAmount;
      eligibility.reason = reasonType;
    }

    // 이미 환불 요청이 있는지 확인
    const { data: existingRequest } = await supabaseAdmin
      .from('refund_requests')
      .select('id, status')
      .eq('payment_id', relatedId)
      .eq('payment_type', paymentType)
      .in('status', ['pending', 'approved'])
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: '이미 처리 중인 환불 요청이 있습니다.' },
        { status: 400 }
      );
    }

    // 환불 요청 생성
    const { data: refundRequest, error: insertError } = await supabaseAdmin
      .from('refund_requests')
      .insert({
        payment_id: relatedId,
        payment_type: paymentType,
        company_id: user.id,
        original_amount: originalAmount,
        refund_amount: eligibility.refundAmount,
        refund_rate: eligibility.refundRate,
        reason_type: reasonType,
        reason_detail: reasonDetail || null,
        status: 'pending' as RefundStatus,
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Refund request insert error:', insertError);
      return NextResponse.json(
        { error: '환불 요청 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refundRequest: {
        id: refundRequest.id,
        paymentId: relatedId,
        paymentType,
        originalAmount,
        refundAmount: eligibility.refundAmount,
        refundRate: eligibility.refundRate,
        reasonType,
        status: 'pending',
        message: '환불 요청이 접수되었습니다. 관리자 검토 후 처리됩니다.'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '환불 요청 중 오류가 발생했습니다.';
    console.error('Refund request error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
