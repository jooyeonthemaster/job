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

  for (let attempt = 0; attempt < retries; attempt++) {
    const originalSignal = init?.signal;
    const controller = new AbortController();
    let abortedByTimeout = false;
    let abortedByUpstream = false;

    const handleUpstreamAbort = () => {
      abortedByUpstream = true;
      if (!controller.signal.aborted) {
        controller.abort(
          // Node 18은 AbortController.abort(reason)를 지원
          (originalSignal as AbortSignal & { reason?: unknown })?.reason ?? undefined
        );
      }
    };

    if (typeof input === 'string' && input.includes('/rest/v1/jobs')) {
      console.log(`[Supabase Fetch] 요청 시작: ${input.substring(0, 100)}...`);
    }

    if (originalSignal) {
      if (originalSignal.aborted) {
        handleUpstreamAbort();
      } else {
        originalSignal.addEventListener('abort', handleUpstreamAbort, { once: true });
      }
    }

    const timeoutId = setTimeout(() => {
      abortedByTimeout = true;
      console.warn(`[Supabase Fetch] ${timeoutMs}ms 타임아웃!`);
      if (!controller.signal.aborted) {
        controller.abort(new DOMException('Request timed out', 'AbortError'));
      }
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (originalSignal) {
        originalSignal.removeEventListener('abort', handleUpstreamAbort);
      }
    };

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      cleanup();

      if (typeof input === 'string' && input.includes('/rest/v1/jobs')) {
        console.log(`[Supabase Fetch] 응답 성공 (${attempt + 1}번째 시도)`);
      }

      // 응답 성공 (재시도 후 성공한 경우만 로그)
      if (attempt > 0) {
        console.log(`✅ Supabase 쿼리 성공 (${attempt + 1}번째 시도)`);
      }
      return response;

    } catch (error: unknown) {
      cleanup();

      if (abortedByUpstream) {
        // 상위에서 명시적으로 취소한 요청은 그대로 전파
        throw error;
      }

      const err = error as Error;
      const isTimeout = abortedByTimeout || err.name === 'AbortError';
      const isLastAttempt = attempt === retries - 1;

      if (isLastAttempt) {
        // 마지막 시도 실패
        console.error(`❌ Supabase 쿼리 최종 실패 (${retries}번 시도)`, {
          error: isTimeout ? 'Timeout (10초 초과)' : err.message,
        });
        throw new Error(
          isTimeout
            ? 'Request timeout - 서버 응답이 없습니다. 네트워크 연결을 확인해주세요.'
            : err.message
        );
      }

      // 재시도 전 대기 (1초, 2초)
      const waitTime = 1000 * (attempt + 1);
      console.warn(`⚠️ Supabase 쿼리 재시도 중... (${attempt + 1}/${retries})`, {
        url: typeof input === 'string' ? input : 'Request object',
        isTimeout,
        error: err.message
      });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('All retries failed');
}

// Public client (클라이언트 사이드에서 사용)
// ⚠️ detectSessionInUrl: true 필수 - OAuth Implicit Flow가 hash fragment를 사용함
// flowType: 기본값(implicit) 사용 - useOAuthLogin.ts가 hash fragment 방식으로 처리
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true  // ✅ OAuth hash fragment 자동 감지 (필수)
  },
  global: {
    fetch: fetchWithTimeoutAndRetry as typeof fetch,
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
      users: Record<string, unknown>;
      companies: Record<string, unknown>;
      jobs: Record<string, unknown>;
      talent_applications: Record<string, unknown>;
      job_applications: Record<string, unknown>;
    };
  };
};

export default supabase;

// =====================================================
// 🔥 Supabase 연결 워밍업 완전 제거
// =====================================================
// 이유: 워밍업 쿼리와 실제 페이지 쿼리가 동시에 실행되면서
// 첫 방문 시 무한 로딩이 발생하는 문제가 있었음.
//
// 해결: 워밍업을 제거하고, fetchWithTimeoutAndRetry가
// 각 쿼리에 대해 자동으로 타임아웃과 재시도를 처리하도록 함.
// 이 방식이 더 안정적임.
// =====================================================
