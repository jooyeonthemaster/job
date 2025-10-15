// Supabase OAuth Callback Handler
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { initializeGoogleUser } from '@/lib/supabase/jobseeker-service';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const userType = requestUrl.searchParams.get('type') || 'jobseeker';

  console.log('[OAuth Callback] Code received:', !!code);
  console.log('[OAuth Callback] User type:', userType);

  if (code) {
    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[OAuth Callback] Exchange error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
      }

      console.log('[OAuth Callback] Session created for user:', data.user.id);

      // Initialize user profile if needed (for new Google users)
      if (userType === 'jobseeker') {
        await initializeGoogleUser(
          data.user.id,
          data.user.email!,
          data.user.user_metadata?.full_name || data.user.user_metadata?.name
        );
      }

      // Check onboarding status
      const { data: userData } = await supabase
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
    } catch (error: any) {
      console.error('[OAuth Callback] Error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=server_error`);
    }
  }

  // No code provided - redirect to login
  console.warn('[OAuth Callback] No code provided');
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
