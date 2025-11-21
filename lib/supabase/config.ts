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

// =====================================================
// Custom Fetch with Timeout + Auto Retry
// 모든 Supabase 쿼리에 자동 적용
// =====================================================
async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 2
): Promise<Response> {
  const timeoutMs = 10000; // 10초 타임아웃
  
  if (typeof input === 'string' && input.includes('/rest/v1/jobs')) {
    console.log(`[Supabase Fetch] 요청 시작: ${input.substring(0, 100)}...`);
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[Supabase Fetch] ${timeoutMs}ms 타임아웃!`);
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (typeof input === 'string' && input.includes('/rest/v1/jobs')) {
        console.log(`[Supabase Fetch] 응답 성공 (${attempt + 1}번째 시도)`);
      }
      
      // 응답 성공 (재시도 후 성공한 경우만 로그)
      if (attempt > 0) {
        console.log(`✅ Supabase 쿼리 성공 (${attempt + 1}번째 시도)`);
      }
      return response;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = error.name === 'AbortError';
      const isLastAttempt = attempt === retries - 1;
      
      if (isLastAttempt) {
        // 마지막 시도 실패
        console.error(`❌ Supabase 쿼리 최종 실패 (${retries}번 시도)`, {
          error: isTimeout ? 'Timeout (3초 초과)' : error.message,
        });
        throw new Error(
          isTimeout 
            ? 'Request timeout - 서버 응답이 없습니다. 네트워크 연결을 확인해주세요.' 
            : error.message
        );
      }
      
      // 재시도 전 대기 (1초, 2초)
      const waitTime = 1000 * (attempt + 1);
      console.warn(`⚠️ Supabase 쿼리 재시도 중... (${attempt + 1}/${retries})`, {
        url: typeof input === 'string' ? input : 'Request object',
        isTimeout,
        error: error.message
      });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('All retries failed');
}

// Public client (클라이언트 사이드에서 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: fetchWithTimeoutAndRetry as any, // ✅ 모든 쿼리에 타임아웃+재시도 적용
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


























