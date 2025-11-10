// Naver OAuth Session API
// httpOnly 쿠키에서 세션 정보를 안전하게 읽어서 클라이언트에 전달
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // httpOnly 쿠키에서 세션 정보 읽기
    const sessionCookie = request.cookies.get('naver_login_session')?.value;

    if (!sessionCookie) {
      console.error('[Get Session] 세션 쿠키 없음');
      return NextResponse.json(
        { error: 'no_session', message: '세션 정보가 없습니다.' },
        { status: 400 }
      );
    }

    // JSON 파싱
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch (parseError) {
      console.error('[Get Session] 세션 파싱 실패:', parseError);
      return NextResponse.json(
        { error: 'invalid_session', message: '세션 정보가 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    const { email, password, redirect } = sessionData;

    // 필수 필드 검증
    if (!email || !password) {
      console.error('[Get Session] 필수 필드 누락:', { email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'invalid_session', message: '세션 정보가 불완전합니다.' },
        { status: 400 }
      );
    }

    console.log('[Get Session] 세션 정보 전달:', { email, redirect });

    // ✅ 세션 정보 반환 후 즉시 쿠키 삭제 (일회성)
    const response = NextResponse.json({
      email,
      password,
      redirect: redirect || '/'
    });

    // 쿠키 즉시 삭제
    response.cookies.delete('naver_login_session');
    console.log('[Get Session] 세션 쿠키 삭제 완료');

    return response;

  } catch (error: any) {
    console.error('[Get Session] 처리 중 에러:', error);
    return NextResponse.json(
      { error: 'server_error', message: error.message },
      { status: 500 }
    );
  }
}
