// Supabase OAuth Callback Handler
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드에서 RLS 우회를 위해 service role 사용
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const userType = requestUrl.searchParams.get('type') || 'jobseeker';

  console.log('[OAuth Callback] Code received:', !!code);
  console.log('[OAuth Callback] User type:', userType);

  if (code) {
    try {
      // Exchange code for session (일반 클라이언트 사용)
      const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[OAuth Callback] Exchange error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
      }

      console.log('[OAuth Callback] Session created for user:', data.user.id);

      // metadata에 user_type 저장 (AuthContext에서 활용)
      await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
        user_metadata: { 
          ...data.user.user_metadata,
          user_type: userType 
        }
      });
      console.log('[OAuth Callback] metadata 업데이트 완료:', userType);

      // Initialize user profile if needed (for new Google users)
      if (userType === 'jobseeker') {
        // 기존 users 레코드 확인 (RLS 우회를 위해 admin 사용)
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        // 없으면 빈 레코드 생성 (유령 계정 방지)
        if (!existingUser) {
          console.log('[OAuth Callback] users 테이블 빈 레코드 생성 중...');
          await supabaseAdmin.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            user_type: 'jobseeker',
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            phone: '',
            foreigner_number: '',
            address: '',
            address_detail: '',
            nationality: '',
            gender: '',
            korean_level: '',
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          console.log('[OAuth Callback] users 테이블 레코드 생성 완료');
        }

        // Check onboarding status (RLS 우회를 위해 admin 사용)
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        console.log('[OAuth Callback] Onboarding completed:', userData?.onboarding_completed);

        // Redirect based on onboarding status
        if (userData?.onboarding_completed) {
          return NextResponse.redirect(`${requestUrl.origin}/jobseeker-dashboard`);
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding/job-seeker/quick`);
        }
      } else {
        // 기업 구글 로그인 처리
        // 기존 companies 레코드 확인 (RLS 우회를 위해 admin 사용)
        const { data: existingCompany } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        // 없으면 빈 레코드 생성 (유령 계정 방지)
        if (!existingCompany) {
          console.log('[OAuth Callback] companies 테이블 빈 레코드 생성 중...');
          await supabaseAdmin.from('companies').insert({
            id: data.user.id,
            email: data.user.email!,
            registration_number: '',
            name: '',
            ceo_name: '',
            established: '',
            company_type: 'individual',
            employee_count: '',
            website: '',
            location: '',
            address: '',
            manager_department: '',
            manager_name: '',
            manager_email: data.user.email!,
            profile_completed: false,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          console.log('[OAuth Callback] companies 테이블 레코드 생성 완료');
        }

        // 회원가입 완료 여부 확인 (RLS 우회를 위해 admin 사용)
        const { data: companyData } = await supabaseAdmin
          .from('companies')
          .select('profile_completed')
          .eq('id', data.user.id)
          .single();

        // Redirect based on profile completion
        if (companyData?.profile_completed) {
          return NextResponse.redirect(`${requestUrl.origin}/company-dashboard`);
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/signup/company`);
        }
      }
    } catch (error: any) {
      console.error('[OAuth Callback] Error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=server_error`);
    }
  }

  // No code provided - redirect to login
  console.warn('[OAuth Callback] No code provided');
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
