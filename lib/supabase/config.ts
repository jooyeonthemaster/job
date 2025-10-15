// Supabase Configuration
// SSMHR JobMatching Service
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Public client (클라이언트 사이드에서 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin client (서버 사이드 전용 - 마이그레이션 스크립트 등)
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Database types (추후 supabase gen types typescript 명령어로 자동 생성)
export type Database = {
  public: {
    Tables: {
      users: any;
      companies: any;
      jobs: any;
      talent_applications: any;
      job_applications: any;
      // ... 추가 테이블들
    };
  };
};

export default supabase;






