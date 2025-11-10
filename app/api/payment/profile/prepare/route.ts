// 프로필 열람 결제 준비 API

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

const PROFILE_VIEW_PRICE = 5000; // 5,000원 (VAT 포함)
const VAT_RATE = 0.1; // 10% 부가세

export async function POST(request: NextRequest) {
  try {
    const { talentId } = await request.json();

    if (!talentId) {
      return NextResponse.json(
        { error: '프로필 ID가 필요합니다.' },
        { status: 400 }
      );
    }

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

    // 2. 기업 정보 조회 (Service Role Key로 RLS 우회)
    console.log('[API prepare] 사용자 ID:', user.id);
    console.log('[API prepare] Service Role Key 확인:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음');
    console.log('[API prepare] Service Role Key 앞 10자:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10));
    console.log('[API prepare] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // user_metadata에서 user_type 확인 (users 테이블에 없을 수 있음)
    const userType = user.user_metadata?.user_type;
    console.log('[API prepare] user_metadata.user_type:', userType);

    if (userType !== 'company') {
      console.error('[API prepare] 기업 회원이 아님:', userType);
      return NextResponse.json(
        { error: '기업 회원만 이용할 수 있습니다.' },
        { status: 403 }
      );
    }

    // companies 테이블에서 기업 정보 조회
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, name, manager_name, manager_phone, email')
      .eq('id', user.id)
      .single();

    console.log('[API prepare] companies 테이블 조회:', { companyData, companyError });

    // companies 테이블에 없으면 auth 정보로 대체
    const company = companyData || {
      id: user.id,
      name: user.user_metadata?.company_name || '회사명',
      manager_name: user.user_metadata?.full_name || '담당자',
      email: user.email || '',
      manager_phone: user.user_metadata?.phone || user.phone || ''
    };

    console.log('[API prepare] 기업 정보:', company);

    // 3. 구직자 프로필 정보 조회 (Service Role Key로 RLS 우회)
    const { data: talent, error: talentError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, headline, user_type')
      .eq('id', talentId)
      .eq('user_type', 'jobseeker')
      .single();

    if (talentError || !talent) {
      return NextResponse.json(
        { error: '구직자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 4. 이미 결제했는지 확인 (Service Role Key로 RLS 우회)
    const { data: existingPayment } = await supabaseAdmin
      .from('profile_view_payments')
      .select('id, payment_status')
      .eq('company_id', company.id)
      .eq('talent_id', talentId)
      .eq('payment_status', 'paid')
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: '이미 열람 권한이 있는 프로필입니다.', alreadyPaid: true },
        { status: 400 }
      );
    }

    // 5. VAT 계산
    const vatAmount = Math.floor(PROFILE_VIEW_PRICE * VAT_RATE);
    const taxFreeAmount = PROFILE_VIEW_PRICE - vatAmount;

    // 6. paymentId 생성 (이니시스 제한: 최대 40자)
    // UUID 앞 8자 + timestamp로 고유성 보장 (약 35자)
    const paymentId = `pf_${talentId.substring(0, 8)}_${company.id.substring(0, 8)}_${Date.now()}`;

    // 7. 결제 정보 반환
    const paymentInfo = {
      paymentId,
      orderName: `${talent.full_name} 프로필 열람`,
      totalAmount: PROFILE_VIEW_PRICE, // VAT 포함 금액
      taxFreeAmount, // 면세 금액
      vatAmount, // 부가세
      currency: 'KRW',
      customer: {
        fullName: company.manager_name || company.name || '담당자',
        phoneNumber: company.manager_phone || '010-0000-0000', // 이니시스는 필수
        email: company.email || user.email || 'noreply@jobmatch.com'
      },
      customData: {
        talentId: talent.id,
        companyId: company.id,
        talentName: talent.full_name,
        talentHeadline: talent.headline
      }
    };

    return NextResponse.json(paymentInfo);
  } catch (error: any) {
    console.error('Profile payment prepare error:', error);
    return NextResponse.json(
      { error: error.message || '결제 준비 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
