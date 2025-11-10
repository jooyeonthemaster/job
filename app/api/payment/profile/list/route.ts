// 기업이 결제한 프로필 목록 조회 API

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

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');
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

    // 2. 결제 내역 조회 (Service Role Key로 RLS 우회)
    const { data: payments, error } = await supabaseAdmin
      .from('profile_view_payments')
      .select(`
        id,
        talent_id,
        payment_status,
        payment_amount,
        payment_paid_at,
        created_at,
        users!talent_id (
          id,
          full_name,
          email,
          headline,
          profile_image_url
        )
      `)
      .eq('company_id', user.id)
      .eq('payment_status', 'paid')
      .order('payment_paid_at', { ascending: false });

    if (error) {
      console.error('Payment list fetch error:', error);
      return NextResponse.json(
        { error: '결제 내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 3. 결제 내역 반환
    return NextResponse.json({
      payments: payments || [],
      total: payments?.length || 0
    });
  } catch (error: any) {
    console.error('Payment list error:', error);
    return NextResponse.json(
      { error: error.message || '결제 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
