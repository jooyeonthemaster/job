// 관리자 전용 회사 생성 API
// RLS 정책을 우회하여 관리자가 회사를 생성할 수 있음

import { NextRequest, NextResponse } from 'next/server';
import { supabase, createAdminClient } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

interface AdminCompanyCreateRequest {
  id: string;
  // 기본 정보
  name: string;
  name_en?: string;
  company_type: string;
  address: string;
  logo?: string;
  // 회사 상세
  summary: string;
  description: string;
  employee_count: string;
  established: string;
  industry: string;
  // 추가 정보
  ceo_name?: string;
  website?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 데이터 파싱
    const body: AdminCompanyCreateRequest = await request.json();
    const {
      id, name, name_en, company_type, address, logo,
      summary, description, employee_count, established, industry,
      ceo_name, website
    } = body;

    console.log('=== 관리자 회사 생성 API 시작 ===');
    console.log('요청 데이터:', { id, name, company_type, address, hasLogo: !!logo });

    // 2. 관리자 권한 확인
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization 헤더 없음');
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // 토큰으로 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.log('사용자 인증 실패:', userError);
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 이메일 기반 관리자 체크 (admin 페이지와 동일)
    const adminEmails = [
      'admin@ssmhr.com',
      'joo.y.oh.ko@gmail.com',
      'nadr110619@gmail.com',
      'admin@gmail.com'
    ];

    if (!adminEmails.includes(user.email || '')) {
      console.log('권한 없음:', user.email);
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    console.log('관리자 확인:', user.email);

    // 3. 필수 필드 검증
    if (!id || !name || !company_type || !address || !summary || !description || !employee_count || !established || !industry) {
      return NextResponse.json(
        { error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 4. 회사 생성 (서비스 롤 사용 - RLS 우회)
    console.log('회사 생성 시도:', {
      id,
      name,
      company_type,
      created_by_admin: true,
      created_by: user.id
    });

    // 서비스 롤 클라이언트 사용 (RLS 정책 우회)
    const adminClient = createAdminClient();

    const { data: company, error: createError } = await adminClient
      .from('companies')
      .insert({
        id,
        name: name,
        name_en: name_en || null,
        company_type: company_type,
        address: address,
        logo: logo || null,
        created_by_admin: true,
        created_by: user.id,
        email: `admin+${Date.now()}@jobmatch.com`,
        status: 'active',
        profile_completed: false,
        additional_info_completed: false,
        // 회사 상세 정보
        summary: summary,
        description: description,
        employee_count: employee_count,
        established: established,
        industry: industry,
        // 추가 정보 (선택)
        ceo_name: ceo_name || null,
        website: website || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('회사 생성 실패:', createError);
      return NextResponse.json(
        {
          error: '회사 생성에 실패했습니다.',
          details: createError.message,
          code: createError.code
        },
        { status: 500 }
      );
    }

    console.log('회사 생성 성공:', company.id);

    return NextResponse.json({
      success: true,
      company: company
    });

  } catch (error: any) {
    console.error('=== API 에러 ===');
    console.error(error);

    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        message: error.message
      },
      { status: 500 }
    );
  }
}
