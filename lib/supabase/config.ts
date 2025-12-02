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
// Custom Fetch with Timeout + Auto Retry + 자동 워밍업 대기
// 모든 Supabase 쿼리에 자동 적용
// =====================================================

// 워밍업 상태 (순환 대기 방지용)
let isWarmingUp = false;
let warmupPromise: Promise<void> | null = null;
let isWarmupComplete = false;

const waitForWarmup = async (): Promise<void> => {
  if (isWarmupComplete) return;
  if (warmupPromise) return warmupPromise;
  return Promise.resolve();
};

async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 2
): Promise<Response> {
  const timeoutMs = 10000; // 10초 타임아웃

  // 🔥 모든 쿼리 전에 워밍업 완료 대기 (워밍업 쿼리 자체는 제외)
  if (!isWarmingUp && typeof window !== 'undefined') {
    await waitForWarmup();
  }

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
          (originalSignal as any)?.reason ?? undefined
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
      
    } catch (error: any) {
      cleanup();

      if (abortedByUpstream) {
        // 상위에서 명시적으로 취소한 요청은 그대로 전파
        throw error;
      }

      const isTimeout = abortedByTimeout || error.name === 'AbortError';
      const isLastAttempt = attempt === retries - 1;
      
      if (isLastAttempt) {
        // 마지막 시도 실패
        console.error(`❌ Supabase 쿼리 최종 실패 (${retries}번 시도)`, {
          error: isTimeout ? 'Timeout (10초 초과)' : error.message,
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

// =====================================================
// 🔥 Supabase 연결 워밍업 (Cold Start 방지)
// 앱 로드 시 미리 연결을 열어두어 첫 쿼리 지연 방지
// =====================================================

// waitForWarmup을 외부에서도 사용할 수 있도록 export (기존 코드 호환성)
export { waitForWarmup };

if (typeof window !== 'undefined') {
  // 클라이언트에서만 실행
  warmupPromise = (async () => {
    try {
      isWarmingUp = true; // 워밍업 쿼리는 워밍업 대기 건너뜀
      console.log('[Supabase] 🔄 연결 워밍업 시작...');
      await supabase.from('jobs').select('id').limit(1);
      console.log('[Supabase] ✅ 연결 워밍업 완료');
      isWarmupComplete = true;
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('[Supabase] ⚠️ 워밍업 실패 (무시 가능):', error.message);
      isWarmupComplete = true; // 실패해도 완료 처리
    } finally {
      isWarmingUp = false;
    }
  })();
}


























