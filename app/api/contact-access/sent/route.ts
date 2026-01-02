// 기업이 보낸 연락처 열람 요청 목록 API
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

    // 사용자 타입 확인 (기업만 조회 가능)
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

    if (!isCompanyUser || !companyData) {
      return NextResponse.json(
        { error: '기업 회원만 보낸 요청을 조회할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 상태 필터 (선택적)
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // 보낸 요청 목록 조회 (먼저 요청만 가져오기)
    let query = supabaseAdmin
      .from('contact_access_requests')
      .select('*')
      .eq('requester_company_id', companyData.id)
      .order('requested_at', { ascending: false });

    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query = query.eq('status', statusFilter);
    }

    const { data: requests, error: fetchError } = await query;

    if (fetchError) {
      console.error('Fetch sent requests error:', fetchError);
      console.error('Error details:', JSON.stringify(fetchError, null, 2));
      return NextResponse.json(
        { error: '요청 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 각 요청에 대해 구직자 정보 별도 조회
    const requestsWithUsers = await Promise.all(
      (requests || []).map(async (req) => {
        // users 테이블의 기본 정보 조회
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email, phone, phone_country_code, headline, profile_image_url')
          .eq('id', req.target_user_id)
          .single();

        if (userError) {
          console.error('User fetch error for', req.target_user_id, ':', userError);
        }

        // 스킬 정보 별도 조회
        const { data: skillsData } = await supabaseAdmin
          .from('user_skills')
          .select('skill_name')
          .eq('user_id', req.target_user_id);

        // 경력 정보 별도 조회 (연수 계산용)
        const { data: experiencesData } = await supabaseAdmin
          .from('user_experiences')
          .select('id')
          .eq('user_id', req.target_user_id);

        // 희망 직무 별도 조회
        const { data: positionsData } = await supabaseAdmin
          .from('user_desired_positions')
          .select('position_name')
          .eq('user_id', req.target_user_id)
          .limit(1);

        return {
          ...req,
          users: userData ? {
            ...userData,
            skills: skillsData?.map(s => s.skill_name) || [],
            experience_years: experiencesData?.length || 0,
            desired_position: positionsData?.[0]?.position_name || null
          } : null
        };
      })
    );

    // 통계 정보
    const stats = {
      total: requestsWithUsers.length,
      pending: requestsWithUsers.filter(r => r.status === 'pending').length,
      approved: requestsWithUsers.filter(r => r.status === 'approved').length,
      rejected: requestsWithUsers.filter(r => r.status === 'rejected').length
    };

    // 타입 정의
    type UserInfo = {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      phone_country_code: string;
      headline: string;
      profile_image_url: string;
      experience_years: number;
      desired_position: string;
      skills: string[];
    };

    // 승인된 요청의 경우 연락처 정보 포함, 그 외에는 연락처 마스킹
    const processedRequests = requestsWithUsers.map(req => {
      const userInfo = req.users as UserInfo | null;

      if (req.status === 'approved' && userInfo) {
        // 승인된 경우 모든 정보 공개
        return req;
      } else if (userInfo) {
        // 미승인인 경우 연락처 마스킹
        return {
          ...req,
          users: {
            ...userInfo,
            email: maskEmail(userInfo.email),
            phone: maskPhone(userInfo.phone)
          }
        };
      }
      return req;
    });

    return NextResponse.json({
      requests: processedRequests,
      stats
    });

  } catch (error) {
    console.error('Contact access sent error:', error);
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 이메일 마스킹 함수
function maskEmail(email: string | null): string {
  if (!email) return '***@***.***';
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';
  const maskedLocal = local.length > 2
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '*'.repeat(local.length);
  return `${maskedLocal}@${domain}`;
}

// 전화번호 마스킹 함수
function maskPhone(phone: string | null): string {
  if (!phone) return '***-****-****';
  // 숫자만 추출
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `***-****-${digits.slice(-4)}`;
  }
  return '***-****-****';
}
