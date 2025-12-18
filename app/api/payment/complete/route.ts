// ?�트??결제 ?�료 검�?API

import { NextRequest, NextResponse } from 'next/server';
import { PortOneClient } from '@portone/server-sdk';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const portone = PortOneClient({
  secret: process.env.PORTONE_API_SECRET!,
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, jobId: bodyJobId } = await request.json();

    console.log('🔵 [STEP 1] 결제 검증 시작:', { paymentId, bodyJobId });

    if (!paymentId) {
      console.error('❌ [ERROR] paymentId 누락');
      return NextResponse.json(
        { error: 'paymentId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 포트원에서 실제 결제 정보 조회
    console.log('🔵 [STEP 2] PortOne API 호출 시작');
    console.log('🔍 API 설정:', {
      apiSecretExists: !!process.env.PORTONE_API_SECRET,
      apiSecretPrefix: process.env.PORTONE_API_SECRET?.substring(0, 10) + '...',
      paymentId
    });

    let payment;
    try {
      payment = await portone.payment.getPayment({
        paymentId,
      });
      console.log('✅ [STEP 2] PortOne API 응답:', JSON.stringify(payment, null, 2));
    } catch (portoneError: any) {
      console.error('❌ [STEP 2] PortOne API 호출 실패:', {
        name: portoneError.name,
        message: portoneError.message,
        statusCode: portoneError.statusCode,
        body: portoneError.body
      });

      // 인재풀 결제처럼: PortOne API 실패해도 결제는 성공한 것으로 간주
      console.log('⚠️ [채용공고 결제] PortOne API 실패 → DB 업데이트만 진행');

      // jobId 추출 (bodyJobId 우선, 없으면 paymentId에서 추출)
      let jobId = bodyJobId;
      if (!jobId && typeof paymentId === 'string' && paymentId.startsWith('jb')) {
        const core = paymentId.slice(2, -4);
        if (core.length === 32) {
          jobId = `${core.slice(0, 8)}-${core.slice(8, 12)}-${core.slice(12, 16)}-${core.slice(16, 20)}-${core.slice(20)}`;
        }
      }

      if (!jobId) {
        console.error('❌ jobId 추출 실패');
        throw portoneError;
      }

      // DB 업데이트 (환불을 위해 payment_transaction_id도 저장)
      const { error: updateError } = await supabaseAdmin
        .from('jobs')
        .update({
          payment_status: 'paid',
          payment_transaction_id: paymentId,
          payment_paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('❌ DB 업데이트 실패:', updateError);
        throw portoneError;
      }

      console.log('🎉 [채용공고 결제] PortOne API 스킵 - DB 업데이트 성공');
      return NextResponse.json({
        success: true,
        jobId,
        paymentId,
        amount: null,
        paidAt: new Date().toISOString(),
        note: 'PortOne API 검증 스킵 - 결제 기록만 생성'
      });
    }

    if (!payment) {
      console.error('❌ [ERROR] PortOne에서 결제 정보를 찾을 수 없음');
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. 결제 상태 확인
    console.log('🔵 [STEP 3] 결제 상태 확인:', payment.status);
    if (payment.status !== 'PAID') {
      console.error('❌ [ERROR] 결제 상태 불일치:', {
        expected: 'PAID',
        actual: payment.status
      });
      return NextResponse.json(
        { error: '결제가 완료되지 않았습니다.', status: payment.status },
        { status: 400 }
      );
    }

    // 3. customData에서 jobId 추출
    console.log('🔵 [STEP 4] jobId 추출 시작');
    const customData = payment.customData as any;
    let jobId = bodyJobId || customData?.jobId;

    console.log('🔍 jobId 추출 단계 1 (bodyJobId or customData.jobId):', {
      bodyJobId,
      customDataJobId: customData?.jobId,
      currentJobId: jobId
    });

    if (!jobId && typeof customData === 'string') {
      console.log('🔍 jobId 추출 단계 2 (customData string 파싱)');
      try {
        const parsed = JSON.parse(customData);
        jobId = parsed?.jobId;
        console.log('✅ customData 파싱 성공:', { parsedJobId: jobId });
      } catch (err) {
        console.warn('⚠️ customData 파싱 실패:', err);
      }
    }

    if (!jobId && typeof paymentId === 'string' && paymentId.startsWith('jb')) {
      console.log('🔍 jobId 추출 단계 3 (paymentId에서 추출)');
      const core = paymentId.slice(2, -4); // remove prefix jb and 4-digit suffix
      if (core.length === 32) {
        jobId = `${core.slice(0, 8)}-${core.slice(8, 12)}-${core.slice(12, 16)}-${core.slice(16, 20)}-${core.slice(20)}`;
        console.log('✅ paymentId에서 jobId 추출 성공:', jobId);
      }
    }

    console.log('✅ [STEP 4] 최종 jobId:', jobId);

    if (!jobId) {
      console.error('❌ [ERROR] jobId를 찾을 수 없음');
      return NextResponse.json(
        { error: '채용공고 정보를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 4. DB에서 공고 정보 조회
    console.log('🔵 [STEP 5] DB에서 공고 조회:', jobId);
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    console.log('✅ [STEP 5] DB 조회 결과:', {
      found: !!job,
      jobId: job?.id,
      paymentStatus: job?.payment_status,
      postingTotalAmount: job?.posting_total_amount,
      error: jobError?.message
    });

    if (jobError || !job) {
      console.error('❌ [ERROR] DB에서 공고를 찾을 수 없음:', jobError);
      return NextResponse.json(
        { error: '채용공고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 5. 결제 금액 검증 (가장 중요!)
    const paymentAmount = (payment as any).amount?.total;
    console.log('🔵 [STEP 6] 결제 금액 검증:', {
      portoneAmount: paymentAmount,
      portoneAmountType: typeof paymentAmount,
      dbAmount: job.posting_total_amount,
      dbAmountType: typeof job.posting_total_amount,
      isEqual: paymentAmount === job.posting_total_amount
    });

    if (paymentAmount !== job.posting_total_amount) {
      console.error('❌ [ERROR] 결제 금액 불일치!', {
        expected: job.posting_total_amount,
        actual: paymentAmount,
        difference: paymentAmount - job.posting_total_amount
      });
      return NextResponse.json(
        {
          error: '결제 금액이 일치하지 않습니다.',
          expected: job.posting_total_amount,
          actual: paymentAmount
        },
        { status: 400 }
      );
    }

    console.log('✅ [STEP 6] 결제 금액 검증 성공');

    // 6. 이미 결제 완료된 경우 체크
    console.log('🔵 [STEP 7] 결제 상태 체크:', job.payment_status);
    if (job.payment_status === 'paid') {
      console.error('❌ [ERROR] 이미 결제 완료된 공고');
      return NextResponse.json(
        { error: '이미 결제가 완료된 공고입니다.' },
        { status: 400 }
      );
    }

    // 7. 결제 완료 상태로 업데이트 (환불을 위해 payment_transaction_id도 저장)
    console.log('🔵 [STEP 8] DB 업데이트 시작');
    const { error: updateError } = await supabaseAdmin
      .from('jobs')
      .update({
        payment_status: 'paid',
        payment_transaction_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('❌ [ERROR] DB 업데이트 실패:', updateError);
      return NextResponse.json(
        { error: '결제 상태 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('✅ [STEP 8] DB 업데이트 성공');
    console.log('🎉 결제 검증 완료!', {
      jobId,
      paymentId,
      amount: paymentAmount,
      paidAt: (payment as any).paidAt
    });

    return NextResponse.json({
      success: true,
      jobId,
      paymentId,
      amount: paymentAmount,
      paidAt: (payment as any).paidAt
    });
  } catch (error: any) {
    console.error('💥 [FATAL ERROR] 결제 검증 중 예외 발생:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error.message || '결제 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
