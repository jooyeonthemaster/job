// 포트원 결제 완료 검증 API

import { NextRequest, NextResponse } from 'next/server';
import { PortOneClient } from '@portone/server-sdk';
import { supabase } from '@/lib/supabase/config';

const portone = PortOneClient({
  secret: process.env.PORTONE_API_SECRET!,
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 포트원에서 실제 결제 정보 조회
    const payment = await portone.payment.getPayment({
      paymentId,
    });

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. 결제 상태 확인
    if (payment.status !== 'PAID') {
      return NextResponse.json(
        { error: '결제가 완료되지 않았습니다.', status: payment.status },
        { status: 400 }
      );
    }

    // 3. customData에서 jobId 추출
    const customData = payment.customData as any;
    const jobId = customData?.jobId;

    if (!jobId) {
      return NextResponse.json(
        { error: '채용공고 정보를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 4. DB에서 공고 정보 조회
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: '채용공고를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 5. 결제 금액 검증
    if (payment.amount.total !== job.posting_total_amount) {
      return NextResponse.json(
        {
          error: '결제 금액이 일치하지 않습니다.',
          expected: job.posting_total_amount,
          actual: payment.amount.total
        },
        { status: 400 }
      );
    }

    // 6. 이미 결제 완료된 경우 체크
    if (job.payment_status === 'paid') {
      return NextResponse.json(
        { error: '이미 결제가 완료된 공고입니다.' },
        { status: 400 }
      );
    }

    // 7. 결제 완료 상태로 업데이트
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        payment_status: 'paid',
        payment_paid_at: new Date().toISOString(),
        payment_transaction_id: payment.id,
        payment_method: payment.method?.type || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Payment update error:', updateError);
      return NextResponse.json(
        { error: '결제 상태 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      paymentId,
      amount: payment.amount.total,
      paidAt: payment.paidAt
    });
  } catch (error: any) {
    console.error('Payment complete error:', error);
    return NextResponse.json(
      { error: error.message || '결제 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
