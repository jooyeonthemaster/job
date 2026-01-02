// 구직자가 받은 연락처 열람 요청 목록 API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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

    // 사용자 타입 확인 (구직자만 조회 가능)
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (userData?.user_type !== 'jobseeker') {
      return NextResponse.json(
        { error: '구직자 회원만 받은 요청을 조회할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 상태 필터 (선택적)
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // 받은 요청 목록 조회 (먼저 요청만 가져오기)
    let query = supabaseAdmin
      .from('contact_access_requests')
      .select('*')
      .eq('target_user_id', user.id)
      .order('requested_at', { ascending: false });

    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query = query.eq('status', statusFilter);
    }

    const { data: requests, error: fetchError } = await query;

    if (fetchError) {
      console.error('Fetch requests error:', fetchError);
      console.error('Error details:', JSON.stringify(fetchError, null, 2));
      return NextResponse.json(
        { error: '요청 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 각 요청에 대해 기업 정보 별도 조회
    const requestsWithCompanies = await Promise.all(
      (requests || []).map(async (req) => {
        const { data: companyData } = await supabaseAdmin
          .from('companies')
          .select('id, name, logo, industry, location, employee_count')
          .eq('id', req.requester_company_id)
          .single();

        return {
          ...req,
          companies: companyData
        };
      })
    );

    // 통계 정보
    const stats = {
      total: requestsWithCompanies.length,
      pending: requestsWithCompanies.filter(r => r.status === 'pending').length,
      approved: requestsWithCompanies.filter(r => r.status === 'approved').length,
      rejected: requestsWithCompanies.filter(r => r.status === 'rejected').length
    };

    return NextResponse.json({
      requests: requestsWithCompanies,
      stats
    });

  } catch (error) {
    console.error('Contact access received error:', error);
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
