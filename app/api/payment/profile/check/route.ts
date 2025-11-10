// 프로필 열람 결제 상태 확인 API

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Service Role Key 사용 (RLS 우회)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 클라이언트용 Supabase (auth 확인용)
import { supabase } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  try {
    const { talentId } = await request.json();

    if (!talentId) {
      return NextResponse.json(
        { error: '프로필 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { hasPaid: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { hasPaid: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 결제 내역 확인 (Service Role Key로 RLS 우회)
    const { data: payment, error } = await supabaseAdmin
      .from('profile_view_payments')
      .select('id, payment_status, payment_paid_at')
      .eq('company_id', user.id)
      .eq('talent_id', talentId)
      .eq('payment_status', 'paid')
      .single();

    if (error || !payment) {
      return NextResponse.json({
        hasPaid: false
      });
    }

    return NextResponse.json({
      hasPaid: true,
      paidAt: payment.payment_paid_at
    });
  } catch (error: any) {
    console.error('Payment check error:', error);
    return NextResponse.json(
      { hasPaid: false, error: error.message },
      { status: 500 }
    );
  }
}
