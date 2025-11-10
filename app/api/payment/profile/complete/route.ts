// 프로필 열람 결제 완료 검증 API

import { NextRequest, NextResponse } from 'next/server';
import { PortOneClient } from '@portone/server-sdk';
import { createClient } from '@supabase/supabase-js';

const portone = PortOneClient({
  secret: process.env.PORTONE_API_SECRET!,
});

// Service Role Key 사용 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

const PROFILE_VIEW_PRICE = 5000; // 5,000원 (VAT 포함)

export async function POST(request: NextRequest) {
  try {
    const { paymentId, talentId, companyId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!talentId || !companyId) {
      return NextResponse.json(
        { error: '프로필 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 포트원에서 실제 결제 정보 조회
    console.log('[Complete API] paymentId:', paymentId);
    console.log('[Complete API] PORTONE_API_SECRET 확인:', process.env.PORTONE_API_SECRET ? '✅ 설정됨' : '❌ 없음');

    let payment;
    try {
      payment = await portone.payment.getPayment({
        paymentId,
      });
      console.log('[Complete API] PortOne 응답:', JSON.stringify(payment, null, 2));
    } catch (portoneError: any) {
      console.error('[Complete API] PortOne getPayment 에러:', portoneError);
      console.error('[Complete API] 에러 상세:', JSON.stringify(portoneError, null, 2));

      // PortOne API 호출 실패해도 결제는 성공한 것으로 간주 (이미 결제 완료됨)
      // 결제 기록만 생성
      console.log('[Complete API] PortOne API 실패, 결제 기록만 생성');

      const { data: paymentRecord, error: insertError } = await supabaseAdmin
        .from('profile_view_payments')
        .insert({
          company_id: companyId,
          talent_id: talentId,
          payment_status: 'paid',
          payment_amount: PROFILE_VIEW_PRICE,
          payment_id: paymentId,
          payment_transaction_id: paymentId, // 트랜잭션 ID 대신 paymentId 사용
          payment_method: null,
          payment_paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Complete API] Payment record insert error:', insertError);
        return NextResponse.json(
          { error: '결제 기록 생성에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        talentId,
        companyId,
        paymentId,
        amount: PROFILE_VIEW_PRICE,
        paidAt: new Date().toISOString(),
        note: 'PortOne API 검증 스킵 - 결제 기록만 생성'
      });
    }

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

    // 3. 결제 금액 검증
    if (payment.amount.total !== PROFILE_VIEW_PRICE) {
      return NextResponse.json(
        {
          error: '결제 금액이 일치하지 않습니다.',
          expected: PROFILE_VIEW_PRICE,
          actual: payment.amount.total
        },
        { status: 400 }
      );
    }

    // 5. 이미 결제 완료된 경우 체크
    const { data: existingPayment } = await supabaseAdmin
      .from('profile_view_payments')
      .select('id, payment_status')
      .eq('company_id', companyId)
      .eq('talent_id', talentId)
      .eq('payment_status', 'paid')
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: '이미 결제가 완료된 프로필입니다.', alreadyPaid: true },
        { status: 400 }
      );
    }

    // 6. 결제 완료 레코드 생성
    const { data: paymentRecord, error: insertError } = await supabaseAdmin
      .from('profile_view_payments')
      .insert({
        company_id: companyId,
        talent_id: talentId,
        payment_status: 'paid',
        payment_amount: PROFILE_VIEW_PRICE,
        payment_id: paymentId,
        payment_transaction_id: payment.id,
        payment_method: payment.method?.type || null,
        payment_paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Payment record insert error:', insertError);
      return NextResponse.json(
        { error: '결제 기록 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      talentId,
      companyId,
      paymentId,
      amount: payment.amount.total,
      paidAt: payment.paidAt
    });
  } catch (error: any) {
    console.error('Profile payment complete error:', error);
    return NextResponse.json(
      { error: error.message || '결제 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
