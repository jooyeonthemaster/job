// Supabase 개인 회원 인증 관련 서비스
import { supabase } from './config';
import type { JobseekerSignupData } from './jobseeker-types';

// =====================================================
// 회원가입
// =====================================================

/**
 * 개인 회원가입 (이메일/비밀번호)
 * 1. Supabase Auth로 계정 생성
 * 2. users 테이블에 기본 정보 저장
 */
export const signUpJobseeker = async (data: JobseekerSignupData) => {
  // 1. Supabase Auth 회원가입
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        user_type: 'jobseeker',
        full_name: data.fullName || ''
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('회원가입 실패');

  const userId = authData.user.id;

  // 2. users 테이블에 기본 정보 저장
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: data.email,
      user_type: 'jobseeker',
      full_name: data.fullName || '',
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
    })
    .select()
    .single();

  if (userError) {
    console.error('User insert failed, auth user created:', userId);
    throw userError;
  }

  return {
    user: authData.user,
    profile: userData
  };
};

/**
 * 구글 로그인 후 프로필 초기화
 */
export const initializeGoogleUser = async (
  userId: string,
  email: string,
  displayName?: string
) => {
  // users 테이블에 레코드가 있는지 확인
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  // 이미 존재하면 리턴
  if (existing) {
    return existing;
  }

  // 없으면 생성
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      user_type: 'jobseeker',
      full_name: displayName || '',
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
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

// =====================================================
// 로그인
// =====================================================

/**
 * 이메일/비밀번호 로그인
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
};

/**
 * 구글 로그인 (OAuth)
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?type=jobseeker`
    }
  });

  if (error) throw error;

  return data;
};

// =====================================================
// 로그아웃
// =====================================================

/**
 * 로그아웃
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// =====================================================
// 이메일 중복 확인
// =====================================================

/**
 * 이메일 중복 확인
 */
export const checkEmailDuplicate = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Email check error:', error);
    return false;
  }

  return data !== null;
};
