// 포트원 웹훅 API

import { NextRequest, NextResponse } from 'next/server';
import { PortOneClient } from '@portone/server-sdk';
import { supabase } from '@/lib/supabase/config';

const portone = PortOneClient({
  secret: process.env.PORTONE_API_SECRET!,
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. 웹훅 데이터 수신
    const webhookData = await request.json();
    const { type, data } = webhookData;

    // 2. 웹훅 서명 검증 (선택사항 - 테스트 환경에서는 skip)
    // TODO: 프로덕션 환경에서는 서명 검증 필수
    const signature = request.headers.get('portone-signature');
    // if (!signature) {
    //   return NextResponse.json(
    //     { error: 'Webhook signature missing' },
    //     { status: 401 }
    //   );
    // }

    // 4. Transaction.Paid 이벤트 처리
    if (type === 'Transaction.Paid') {
      const paymentId = data.paymentId;

      // 실제 결제 정보 조회
      const payment = await portone.payment.getPayment({
        paymentId,
      });

      if (!payment || payment.status !== 'PAID') {
        return NextResponse.json(
          { error: 'Payment not found or not paid' },
          { status: 400 }
        );
      }

      // customData에서 jobId 추출
      const customData = payment.customData as any;
      const jobId = customData?.jobId;

      if (!jobId) {
        return NextResponse.json(
          { error: 'Job ID not found in customData' },
          { status: 400 }
        );
      }

      // DB에서 공고 조회
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      // 이미 결제 완료된 경우 스킵
      if (job.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Already paid' });
      }

      // 결제 완료 상태로 업데이트 (jobs 테이블에는 payment_method, payment_paid_at 컬럼 없음)
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          payment_status: 'paid',
          payment_transaction_id: payment.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('Webhook payment update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update payment status' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 5. 다른 이벤트 타입 처리 (필요 시)
    return NextResponse.json({ success: true, message: `Event ${type} received` });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing error' },
      { status: 500 }
    );
  }
}
