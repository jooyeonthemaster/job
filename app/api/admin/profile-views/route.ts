import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/config';

/**
 * GET /api/admin/profile-views
 *
 * 관리자가 모든 프로필 열람 내역 조회
 * - 모든 기업의 프로필 열람 내역
 * - 필터링: status, company_id, talent_id
 * - 정렬: 최신순
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

    // JWT 디코딩 (검증 없이 이메일 추출)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    const userEmail = payload.email;

    console.log('🔍 [TOKEN] JWT 디코딩 성공');
    console.log('🔍 [TOKEN] 이메일:', userEmail);

    if (!userEmail) {
      console.error('🔴 [AUTH ERROR] 토큰에 이메일 없음');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 2. 관리자 권한 확인 (이메일 기반)
    const adminEmails = [
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'admin@gmail.com',
      'yjpark@ssmhr.com'
    ];

    if (!adminEmails.includes(userEmail || '')) {
      console.error('🔴 [AUTH ERROR] 관리자 권한 없음');
      console.error('🔴 [AUTH ERROR] 시도한 이메일:', userEmail);
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    console.log('✅ [AUTH SUCCESS] 관리자 인증 성공:', userEmail);

    // 3. 관리자용 Supabase 클라이언트 생성 (RLS 우회)
    const adminSupabase = createAdminClient();

    // 4. URL 파라미터에서 필터 가져오기
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // paid, pending, failed, etc.
    const companyIdFilter = searchParams.get('company_id');
    const talentIdFilter = searchParams.get('talent_id');

    // 5. 쿼리 빌드 - 일단 조인 없이 기본 데이터만 가져오기
    let query = adminSupabase
      .from('profile_view_payments')
      .select('*')
      .order('created_at', { ascending: false });

    // 필터 적용
    if (statusFilter) {
      query = query.eq('payment_status', statusFilter);
    }
    if (companyIdFilter) {
      query = query.eq('company_id', companyIdFilter);
    }
    if (talentIdFilter) {
      query = query.eq('talent_id', talentIdFilter);
    }

    const { data: profileViews, error } = await query;

    if (error) {
      console.error('Supabase 쿼리 에러:', error);
      console.error('에러 상세:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        {
          error: '프로필 열람 내역을 불러오는데 실패했습니다.',
          details: error.message || error.toString()
        },
        { status: 500 }
      );
    }

    // 6. 각 레코드에 대해 기업 정보와 구직자 정보 가져오기
    const formattedViews = await Promise.all(
      (profileViews || []).map(async (view: any) => {
        // 기업 정보 조회
        const { data: company } = await adminSupabase
          .from('companies')
          .select('id, name, name_en, logo, industry, location')
          .eq('id', view.company_id)
          .single();

        // 구직자 정보 조회
        const { data: talent } = await adminSupabase
          .from('users')
          .select('id, full_name, email, nationality, profile_image_url')
          .eq('id', view.talent_id)
          .single();

        return {
          id: view.id,
          // 기업 정보
          companyId: view.company_id,
          companyName: company?.name || '알 수 없는 회사',
          companyNameEn: company?.name_en,
          companyLogo: company?.logo,
          companyIndustry: company?.industry,
          companyLocation: company?.location,
          // 구직자 정보
          talentId: view.talent_id,
          talentName: talent?.full_name || '알 수 없는 구직자',
          talentEmail: talent?.email,
          talentNationality: talent?.nationality,
          talentProfileImage: talent?.profile_image_url,
          // 결제 정보
          paymentStatus: view.payment_status,
          paymentAmount: view.payment_amount,
          paymentId: view.payment_id,
          paymentTransactionId: view.payment_transaction_id,
          paymentMethod: view.payment_method,
          paymentPaidAt: view.payment_paid_at,
          // 날짜 정보
          createdAt: view.created_at,
          updatedAt: view.updated_at
        };
      })
    );

    // 7. 통계 정보 계산
    const stats = {
      total: formattedViews.length,
      paid: formattedViews.filter(v => v.paymentStatus === 'paid').length,
      pending: formattedViews.filter(v => v.paymentStatus === 'pending').length,
      failed: formattedViews.filter(v => v.paymentStatus === 'failed').length,
      totalRevenue: formattedViews
        .filter(v => v.paymentStatus === 'paid')
        .reduce((sum, v) => sum + (v.paymentAmount || 0), 0)
    };

    return NextResponse.json({
      success: true,
      stats,
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
