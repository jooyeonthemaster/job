// Naver OAuth Authorization Handler
// 네이버 OAuth 인증 시작 - Authorization Code 요청
import { NextRequest, NextResponse } from 'next/server';

/**
 * 랜덤 문자열 생성 (CSRF 방지용)
 */
function generateRandomState(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userType = searchParams.get('type') || 'jobseeker';

    console.log('[Naver OAuth] 인증 시작:', { userType });

    // CSRF 방지를 위한 state 생성
    const state = generateRandomState(16);

    // 쿠키로 userType과 state 저장 (localStorage 대신 서버 사이드)
    const response = NextResponse.redirect(getNaverAuthUrl(state));
    
    response.cookies.set('naver_oauth_type', userType, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10분
      sameSite: 'lax',
      path: '/',
    });

    response.cookies.set('naver_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10분
      sameSite: 'lax',
      path: '/',
    });

    console.log('[Naver OAuth] 쿠키 설정 완료:', { userType, state: state.substring(0, 8) + '...' });

    return response;
  } catch (error: any) {
    console.error('[Naver OAuth] 에러:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/login?error=naver_init_failed`
    );
  }
}

/**
 * 네이버 OAuth 인증 URL 생성
 * @param state CSRF 방지용 랜덤 문자열
 */
function getNaverAuthUrl(state: string): string {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_NAVER_CLIENT_ID 환경변수가 설정되지 않았습니다.');
  }

  const redirectUri = encodeURIComponent(
    process.env.NODE_ENV === 'production'
      ? process.env.NAVER_REDIRECT_URI || 'https://jobmatch-20250919.vercel.app/auth/naver/callback'
      : 'http://localhost:3000/auth/naver/callback'
  );

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;

  console.log('[Naver OAuth] 인증 URL 생성 완료');
  return authUrl;
}

