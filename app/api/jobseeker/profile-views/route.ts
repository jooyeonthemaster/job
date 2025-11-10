import { NextResponse } from 'next/server';

/**
 * GET /api/jobseeker/profile-views
 *
 * 구직자가 자신의 프로필을 열람한 기업 목록 조회
 * - 결제가 완료된 기록만 조회 (payment_status = 'paid')
 * - 최신순 정렬
 */
export async function GET(request: Request) {
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

    // Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 토큰으로 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 2. profile_view_payments 테이블에서 해당 구직자의 열람 내역 조회
    const { data: profileViews, error } = await supabase
      .from('profile_view_payments')
      .select('*')
      .eq('talent_id', user.id)
      .eq('payment_status', 'paid')
      .order('payment_paid_at', { ascending: false });

    if (error) {
      console.error('프로필 열람 내역 조회 실패:', error);
      return NextResponse.json(
        { error: '프로필 열람 내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 3. 각 레코드에 대해 기업 정보 가져오기
    const formattedViews = await Promise.all(
      (profileViews || []).map(async (view: any) => {
        // 기업 정보 조회
        const { data: company } = await supabase
          .from('companies')
          .select('id, name, name_en, logo, industry, location')
          .eq('id', view.company_id)
          .single();

        return {
          id: view.id,
          companyId: view.company_id,
          companyName: company?.name || '알 수 없는 회사',
          companyNameEn: company?.name_en,
          companyLogo: company?.logo,
          companyIndustry: company?.industry,
          companyLocation: company?.location,
          amount: view.payment_amount,
          viewedAt: view.payment_paid_at || view.created_at,
          status: view.payment_status
        };
      })
    );

    return NextResponse.json({
      success: true,
      totalCount: formattedViews.length,
      views: formattedViews
    });

  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
