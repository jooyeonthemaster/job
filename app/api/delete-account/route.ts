// 회원 탈퇴 API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key로 admin client 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(request: NextRequest) {
  try {
    // 1. 현재 로그인한 사용자 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰으로 사용자 확인
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    console.log('[Delete Account] 계정 삭제 시작:', user.id);

    // 2. 사용자 타입 확인 (users or companies)
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    const { data: companyData } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    // 3. DB 레코드 먼저 삭제 (관계 테이블도 CASCADE로 삭제됨)
    if (userData) {
      console.log('[Delete Account] users 테이블 삭제 중...');
      const { error: deleteUserError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteUserError) {
        console.error('[Delete Account] users 삭제 실패:', deleteUserError);
        throw deleteUserError;
      }
      console.log('[Delete Account] users 삭제 완료');
    }

    if (companyData) {
      console.log('[Delete Account] companies 테이블 삭제 중...');
      const { error: deleteCompanyError } = await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', user.id);

      if (deleteCompanyError) {
        console.error('[Delete Account] companies 삭제 실패:', deleteCompanyError);
        throw deleteCompanyError;
      }
      console.log('[Delete Account] companies 삭제 완료');
    }

    // 4. Auth 계정 삭제
    console.log('[Delete Account] Auth 계정 삭제 중...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[Delete Account] Auth 삭제 실패:', deleteError);
      throw deleteError;
    }

    console.log('[Delete Account] 계정 삭제 완료:', user.id);

    return NextResponse.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.'
    });
  } catch (error: any) {
    console.error('[Delete Account] 에러:', error);
    return NextResponse.json(
      { error: error.message || '계정 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

