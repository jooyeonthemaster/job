// 연락처 열람 요청 생성 API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { targetUserId, message } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: '대상 사용자 ID가 필요합니다.' },
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

    // 사용자 타입 확인 (기업만 요청 가능)
    // 이 프로젝트에서 companies.id = auth.uid() 직접 매핑
    let isCompanyUser = false;
    let companyData: { id: string; name: string } | null = null;

    // 방법 1: user_metadata에서 확인 (가장 빠름)
    if (user.user_metadata?.user_type === 'company') {
      isCompanyUser = true;
    }

    // 방법 2: companies 테이블에서 직접 확인 (companies.id = auth.uid())
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .eq('id', user.id)
      .single();

    if (company) {
      isCompanyUser = true;
      companyData = company;
    }

    if (!isCompanyUser || !companyData) {
      return NextResponse.json(
        { error: '기업 회원만 연락처 열람을 요청할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 대상 사용자가 구직자인지 확인
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id, user_type, full_name')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: '대상 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (targetUser.user_type !== 'jobseeker') {
      return NextResponse.json(
        { error: '구직자에게만 연락처 열람을 요청할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 기존 요청 확인
    const { data: existingRequest } = await supabaseAdmin
      .from('contact_access_requests')
      .select('id, status')
      .eq('requester_company_id', companyData.id)
      .eq('target_user_id', targetUserId)
      .single();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: '이미 요청을 보냈습니다. 승인을 기다려 주세요.', existingStatus: 'pending' },
          { status: 400 }
        );
      }
      if (existingRequest.status === 'approved') {
        return NextResponse.json(
          { error: '이미 승인된 요청입니다.', existingStatus: 'approved' },
          { status: 400 }
        );
      }
      // rejected인 경우 다시 요청 가능 - 기존 레코드 업데이트
      const { data: updatedRequest, error: updateError } = await supabaseAdmin
        .from('contact_access_requests')
        .update({
          status: 'pending',
          company_message: message || null,
          requested_at: new Date().toISOString(),
          responded_at: null
        })
        .eq('id', existingRequest.id)
        .select()
        .single();

      if (updateError) {
        console.error('Request update error:', updateError);
        return NextResponse.json(
          { error: '요청 재전송에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '연락처 열람 요청을 다시 보냈습니다.',
        request: updatedRequest
      });
    }

    // 새 요청 생성
    const { data: newRequest, error: insertError } = await supabaseAdmin
      .from('contact_access_requests')
      .insert({
        requester_company_id: companyData.id,
        target_user_id: targetUserId,
        company_message: message || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Request insert error:', insertError);
      return NextResponse.json(
        { error: '요청 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '연락처 열람 요청을 보냈습니다.',
      request: newRequest
    });

  } catch (error) {
    console.error('Contact access request error:', error);
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
