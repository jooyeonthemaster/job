// 연락처 열람 요청 응답 (승인/거절) API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params;
    const { action } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: '요청 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action은 approve 또는 reject여야 합니다.' },
        { status: 400 }
      );
    }

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 정보 조회
    const { data: accessRequest, error: fetchError } = await supabaseAdmin
      .from('contact_access_requests')
      .select(`
        id,
        target_user_id,
        status,
        requester_company_id,
        companies:requester_company_id (
          id,
          name
        )
      `)
      .eq('id', requestId)
      .single();

    if (fetchError || !accessRequest) {
      return NextResponse.json(
        { error: '요청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인 - 요청 대상자만 응답 가능
    if (accessRequest.target_user_id !== user.id) {
      return NextResponse.json(
        { error: '이 요청에 응답할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 이미 처리된 요청인지 확인
    if (accessRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `이미 ${accessRequest.status === 'approved' ? '승인' : '거절'}된 요청입니다.` },
        { status: 400 }
      );
    }

    // 상태 업데이트
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('contact_access_requests')
      .update({
        status: newStatus,
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select(`
        id,
        status,
        responded_at,
        companies:requester_company_id (
          name
        )
      `)
      .single();

    if (updateError) {
      console.error('Request update error:', updateError);
      return NextResponse.json(
        { error: '요청 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Supabase returns object (not array) for single relationship joins
    const companiesData = updatedRequest.companies as unknown as { name: string } | { name: string }[] | null;
    const companyName = Array.isArray(companiesData)
      ? companiesData[0]?.name
      : companiesData?.name || '기업';

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? `${companyName}의 연락처 열람 요청을 승인했습니다.`
        : `${companyName}의 연락처 열람 요청을 거절했습니다.`,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Contact access respond error:', error);
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
