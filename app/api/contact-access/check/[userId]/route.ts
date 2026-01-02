// 특정 구직자에 대한 연락처 접근 권한 확인 API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: targetUserId } = await params;

    if (!targetUserId) {
      return NextResponse.json(
        { error: '대상 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        hasAccess: false,
        requestStatus: null,
        reason: 'not_logged_in'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({
        hasAccess: false,
        requestStatus: null,
        reason: 'not_logged_in'
      });
    }

    // 구직자가 자신의 프로필을 보는 경우 - 항상 접근 가능
    if (user.id === targetUserId) {
      return NextResponse.json({
        hasAccess: true,
        requestStatus: 'self',
        reason: 'own_profile'
      });
    }

    // 사용자 타입 확인 (기업만 접근 가능)
    // 이 프로젝트에서 companies.id = auth.uid() 직접 매핑
    let isCompanyUser = false;

    // 방법 1: user_metadata에서 확인 (가장 빠름)
    if (user.user_metadata?.user_type === 'company') {
      isCompanyUser = true;
    }

    // 방법 2: companies 테이블에서 직접 확인 (companies.id = auth.uid())
    const { data: companyData } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .single();

    if (companyData) {
      isCompanyUser = true;
    }

    // 기업이 아닌 경우 - 접근 불가
    if (!isCompanyUser || !companyData) {
      return NextResponse.json({
        hasAccess: false,
        requestStatus: null,
        reason: 'not_company'
      });
    }

    // 1. 먼저 지원 관계 확인 (지원한 경우 자동 접근 가능)
    const { data: applicationData } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('applicant_id', targetUserId)
      .eq('company_id', companyData.id)
      .limit(1)
      .single();

    if (applicationData) {
      return NextResponse.json({
        hasAccess: true,
        requestStatus: 'applied',
        reason: 'job_application'
      });
    }

    // 2. 연락처 열람 요청 상태 확인
    const { data: accessRequest } = await supabaseAdmin
      .from('contact_access_requests')
      .select('id, status, requested_at, responded_at')
      .eq('requester_company_id', companyData.id)
      .eq('target_user_id', targetUserId)
      .single();

    if (!accessRequest) {
      return NextResponse.json({
        hasAccess: false,
        requestStatus: null,
        reason: 'no_request'
      });
    }

    return NextResponse.json({
      hasAccess: accessRequest.status === 'approved',
      requestStatus: accessRequest.status,
      requestId: accessRequest.id,
      requestedAt: accessRequest.requested_at,
      respondedAt: accessRequest.responded_at
    });

  } catch (error) {
    console.error('Contact access check error:', error);
    return NextResponse.json(
      { error: '권한 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
