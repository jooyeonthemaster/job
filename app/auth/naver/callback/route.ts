// Naver OAuth Callback Handler
// 네이버 OAuth 콜백 처리 - Access Token 획득 및 사용자 생성
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log('[Naver Callback] 콜백 시작:', { hasCode: !!code, hasState: !!state, error });

  if (error) {
    console.error('[Naver Callback] 네이버 OAuth 에러:', error);
    return NextResponse.redirect(`${origin}/login?error=naver_auth_failed`);
  }

  if (!code) {
    console.error('[Naver Callback] Authorization Code 없음');
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    // 1. CSRF 검증
    const savedState = request.cookies.get('naver_oauth_state')?.value;
    if (!savedState || savedState !== state) {
      console.error('[Naver Callback] State 불일치');
      return NextResponse.redirect(`${origin}/login?error=invalid_state`);
    }

    // 2. Access Token 획득
    console.log('[Naver Callback] Access Token 요청 중...');
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code,
        state: state!,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('[Naver Callback] Token 획득 실패:', tokenData.error_description);
      throw new Error(tokenData.error_description || 'Token 획득 실패');
    }

    const { access_token } = tokenData;
    console.log('[Naver Callback] Access Token 획득 성공');

    // 3. 사용자 정보 조회
    console.log('[Naver Callback] 사용자 정보 조회 중...');
    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profileData = await profileResponse.json();
    
    if (profileData.resultcode !== '00') {
      console.error('[Naver Callback] 프로필 조회 실패:', profileData.message);
      throw new Error('Failed to fetch Naver profile');
    }

    const { id, email, name, nickname, profile_image } = profileData.response;
    console.log('[Naver Callback] 사용자 정보 조회 성공:', { id, email: email || '(없음)', name });

    // 4. userType 확인
    const userType = request.cookies.get('naver_oauth_type')?.value || 'jobseeker';
    console.log('[Naver Callback] 회원 유형:', userType);

    // 5. 네이버 ID로 기존 사용자 확인
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingAuth.users.find(u => u.user_metadata?.naver_id === id);

    let supabaseUserId: string;
    let userEmail: string;
    let userPassword: string;

    if (existingUser) {
      console.log('[Naver Callback] 기존 사용자 확인:', existingUser.id);
      supabaseUserId = existingUser.id;
      userEmail = existingUser.email!;
      userPassword = existingUser.user_metadata?.naver_temp_password || `naver_${id}_temp`;
    } else {
      // 6. 신규 사용자 생성
      console.log('[Naver Callback] 신규 사용자 생성 중...');
      
      userEmail = email || `naver_${id}@naver.placeholder`;
      userPassword = `naver_${id}_temp`;  // 고정된 임시 비밀번호
      
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true,
        password: userPassword,
        user_metadata: {
          user_type: userType,
          naver_id: id,
          naver_name: name,
          naver_nickname: nickname,
          naver_profile_image: profile_image,
          provider: 'naver',
          full_name: name || nickname || '',
          naver_temp_password: userPassword,  // 재로그인용 저장
        },
      });

      if (signUpError) {
        console.error('[Naver Callback] 사용자 생성 실패:', signUpError);
        throw signUpError;
      }

      supabaseUserId = newUser.user.id;
      console.log('[Naver Callback] 신규 사용자 생성 완료:', supabaseUserId);
    }

    // 7. DB 테이블 레코드 생성
    if (userType === 'company') {
      const { data: existingCompany } = await supabaseAdmin
        .from('companies')
        .select('id, profile_completed')
        .eq('id', supabaseUserId)
        .maybeSingle();

      if (!existingCompany) {
        console.log('[Naver Callback] companies 테이블 레코드 생성 중...');
        await supabaseAdmin.from('companies').insert({
          id: supabaseUserId,
          email: email || '',
          registration_number: `TEMP_NAVER_${supabaseUserId.substring(0, 13)}`,
          name: '',
          ceo_name: '',
          established: '',
          company_type: 'individual',
          employee_count: '',
          website: '',
          location: '',
          address: '',
          manager_department: '',
          manager_name: name || nickname || '',
          manager_email: email || '',
          profile_completed: false,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log('[Naver Callback] companies 레코드 생성 완료');
      }

      const { data: companyData } = await supabaseAdmin
        .from('companies')
        .select('profile_completed')
        .eq('id', supabaseUserId)
        .single();

      const redirectPath = companyData?.profile_completed ? '/company-dashboard' : '/signup/company';
      
      // 클라이언트에서 로그인 처리하도록 리다이렉트 (이메일/비밀번호 전달)
      const response = NextResponse.redirect(
        `${origin}/auth/naver/login?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}&redirect=${encodeURIComponent(redirectPath)}`
      );
      response.cookies.delete('naver_oauth_type');
      response.cookies.delete('naver_oauth_state');
      return response;

    } else {
      const { data: existingUserData } = await supabaseAdmin
        .from('users')
        .select('id, onboarding_completed')
        .eq('id', supabaseUserId)
        .maybeSingle();

      if (!existingUserData) {
        console.log('[Naver Callback] users 테이블 레코드 생성 중...');
        await supabaseAdmin.from('users').insert({
          id: supabaseUserId,
          email: email || '',
          user_type: 'jobseeker',
          full_name: name || nickname || '',
          phone: '',
          foreigner_number: '',
          address: '',
          address_detail: '',
          nationality: '',
          gender: '',
          korean_level: '',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log('[Naver Callback] users 레코드 생성 완료');
      }

      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('onboarding_completed')
        .eq('id', supabaseUserId)
        .single();

      const redirectPath = userData?.onboarding_completed ? '/jobseeker-dashboard' : '/onboarding/job-seeker/quick';
      
      // 클라이언트에서 로그인 처리하도록 리다이렉트
      const response = NextResponse.redirect(
        `${origin}/auth/naver/login?email=${encodeURIComponent(userEmail)}&password=${encodeURIComponent(userPassword)}&redirect=${encodeURIComponent(redirectPath)}`
      );
      response.cookies.delete('naver_oauth_type');
      response.cookies.delete('naver_oauth_state');
      return response;
    }
  } catch (error: any) {
    console.error('[Naver Callback] 처리 중 에러:', error);
    return NextResponse.redirect(`${origin}/login?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
}
