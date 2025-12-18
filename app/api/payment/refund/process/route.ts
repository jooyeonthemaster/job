// 환불 처리 API (관리자용)
// 관리자가 환불 요청을 승인/거절하고 실제 환불을 처리

import { NextRequest, NextResponse } from 'next/server';
import { PortOneClient } from '@portone/server-sdk';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/config';
import { RefundStatus } from '@/types/payment.types';

export const dynamic = 'force-dynamic';

// PortOne 클라이언트
const portone = PortOneClient({
  secret: process.env.PORTONE_API_SECRET!,
});

// Service Role Key 사용 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 관리자 이메일 목록 (환경변수나 DB에서 관리하는 것이 좋음)
const ADMIN_EMAILS = [
  'admin@ssmhr.com',
  'yjpark@ssmhr.com',
  'joo.y.oh.ko@gmail.com',
  'nadr110619@gmail.com',
  'admin@gmail.com'
];

interface ProcessRefundBody {
  refundRequestId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

/**
 * 환불 요청 목록 조회 (GET) - 관리자용
 */
export async function GET(request: NextRequest) {
  try {
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

    // 관리자 권한 확인
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 환불 요청 목록 조회 (companies와 직접 JOIN하지 않고 별도 조회)
    let query = supabaseAdmin
      .from('refund_requests')
      .select('*', { count: 'exact' })
      .order('requested_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: refundRequests, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Refund requests fetch error:', fetchError);
      return NextResponse.json(
        { error: '환불 요청 목록 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 각 환불 요청에 대한 추가 정보 조회 (회사 정보 + 결제 상세)
    const enrichedRequests = await Promise.all(
      (refundRequests || []).map(async (req) => {
        // 회사 정보 조회
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id, name, email')
          .eq('id', req.company_id)
          .single();

        // 결제 상세 정보 조회
        let paymentDetails = null;

        if (req.payment_type === 'job_posting') {
          const { data: job } = await supabaseAdmin
            .from('jobs')
            .select('id, title, status, published_at, payment_transaction_id')
            .eq('id', req.payment_id)
            .single();
          paymentDetails = job;
        } else {
          const { data: payment } = await supabaseAdmin
            .from('profile_view_payments')
            .select(`
              id,
              payment_transaction_id,
              talents:talent_id (
                id,
                name,
                email
              )
            `)
            .eq('id', req.payment_id)
            .single();
          paymentDetails = payment;
        }

        return {
          ...req,
          companies: company,
          paymentDetails
        };
      })
    );

    return NextResponse.json({
      refundRequests: enrichedRequests,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '환불 요청 목록 조회 중 오류가 발생했습니다.';
    console.error('Refund requests list error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 환불 처리 (POST) - 관리자용
 */
export async function POST(request: NextRequest) {
  try {
    const body: ProcessRefundBody = await request.json();
    const { refundRequestId, action, rejectionReason } = body;

    if (!refundRequestId || !action) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: '유효하지 않은 처리 유형입니다.' },
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

    // 관리자 권한 확인
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 환불 요청 조회
    const { data: refundRequest, error: fetchError } = await supabaseAdmin
      .from('refund_requests')
      .select('*')
      .eq('id', refundRequestId)
      .single();

    if (fetchError || !refundRequest) {
      return NextResponse.json(
        { error: '환불 요청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 처리된 요청인지 확인
    if (refundRequest.status !== 'pending') {
      return NextResponse.json(
        { error: '이미 처리된 환불 요청입니다.' },
        { status: 400 }
      );
    }

    // 거절 처리
    if (action === 'reject') {
      const { error: updateError } = await supabaseAdmin
        .from('refund_requests')
        .update({
          status: 'rejected' as RefundStatus,
          rejection_reason: rejectionReason || '관리자에 의해 거절됨',
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', refundRequestId);

      if (updateError) {
        console.error('Refund rejection update error:', updateError);
        return NextResponse.json(
          { error: '환불 거절 처리에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '환불 요청이 거절되었습니다.',
        refundRequestId,
        status: 'rejected'
      });
    }

    // 승인 처리 - 포트원 환불 API 호출
    let transactionId: string | null = null;

    if (refundRequest.payment_type === 'job_posting') {
      const { data: job } = await supabaseAdmin
        .from('jobs')
        .select('payment_transaction_id')
        .eq('id', refundRequest.payment_id)
        .single();
      transactionId = job?.payment_transaction_id;
    } else {
      const { data: payment } = await supabaseAdmin
        .from('profile_view_payments')
        .select('payment_transaction_id')
        .eq('id', refundRequest.payment_id)
        .single();
      transactionId = payment?.payment_transaction_id;
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: '결제 트랜잭션 정보를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 포트원 환불 API 호출
    let portoneResult = null;
    try {
      // 환불 요청 (부분 환불 지원)
      portoneResult = await portone.payment.cancelPayment({
        paymentId: transactionId,
        amount: refundRequest.refund_amount,
        reason: `환불 요청: ${refundRequest.reason_type} - ${refundRequest.reason_detail || ''}`,
      });

      console.log('PortOne refund result:', portoneResult);
    } catch (portoneError: unknown) {
      console.error('PortOne refund error:', portoneError);

      // 포트원 API 실패 시에도 환불 요청은 승인 상태로 변경
      // (수동 처리 필요 표시)
      const { error: updateError } = await supabaseAdmin
        .from('refund_requests')
        .update({
          status: 'approved' as RefundStatus,
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          rejection_reason: 'PG사 환불 API 호출 실패 - 수동 처리 필요'
        })
        .eq('id', refundRequestId);

      if (updateError) {
        console.error('Refund approval update error:', updateError);
      }

      const portoneErrorMessage = portoneError instanceof Error ? portoneError.message : 'PG사 환불 처리 실패';
      return NextResponse.json({
        success: false,
        message: 'PG사 환불 처리에 실패했습니다. 수동 처리가 필요합니다.',
        error: portoneErrorMessage,
        refundRequestId,
        status: 'approved'
      });
    }

    // 환불 성공 - 상태 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('refund_requests')
      .update({
        status: 'completed' as RefundStatus,
        processed_at: new Date().toISOString(),
        processed_by: user.id,
        portone_cancellation_id: (portoneResult as { cancellationId?: string })?.cancellationId || null
      })
      .eq('id', refundRequestId);

    if (updateError) {
      console.error('Refund completion update error:', updateError);
      return NextResponse.json(
        { error: '환불 상태 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 원본 결제 상태 업데이트
    if (refundRequest.payment_type === 'job_posting') {
      await supabaseAdmin
        .from('jobs')
        .update({
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', refundRequest.payment_id);
    } else {
      await supabaseAdmin
        .from('profile_view_payments')
        .update({
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', refundRequest.payment_id);
    }

    return NextResponse.json({
      success: true,
      message: '환불이 완료되었습니다.',
      refundRequestId,
      status: 'completed',
      refundAmount: refundRequest.refund_amount
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '환불 처리 중 오류가 발생했습니다.';
    console.error('Refund process error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
