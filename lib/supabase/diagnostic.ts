// Supabase 연결 및 쿼리 진단 도구

import { supabase } from './config';

/**
 * Supabase 연결 상태 체크
 */
export async function checkSupabaseConnection() {
  console.log('🔍 [진단] Supabase 연결 테스트 시작...');
  
  try {
    // 1. 가장 간단한 쿼리 (테이블 목록)
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);
    
    const elapsed = Date.now() - startTime;
    
    if (error) {
      console.error('❌ [진단] Supabase 쿼리 실패:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        elapsed: `${elapsed}ms`
      });
      return { success: false, error, elapsed };
    }
    
    console.log('✅ [진단] Supabase 연결 성공:', {
      data,
      elapsed: `${elapsed}ms`
    });
    
    return { success: true, data, elapsed };
  } catch (err: any) {
    console.error('❌ [진단] Supabase 연결 에러:', err);
    return { success: false, error: err };
  }
}

/**
 * jobs 테이블 RLS 정책 체크
 */
export async function checkJobsRLS() {
  console.log('🔍 [진단] jobs 테이블 RLS 체크...');
  
  try {
    const { data, error, count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: false })
      .limit(1);
    
    if (error) {
      console.error('❌ [진단] jobs 조회 실패 (RLS 문제?):', error);
      return { success: false, error };
    }
    
    console.log('✅ [진단] jobs 조회 성공:', {
      count,
      hasData: !!data && data.length > 0
    });
    
    return { success: true, count, data };
  } catch (err) {
    console.error('❌ [진단] jobs RLS 체크 에러:', err);
    return { success: false, error: err };
  }
}

/**
 * companies 조인 테스트
 */
export async function checkCompaniesJoin() {
  console.log('🔍 [진단] companies 조인 테스트...');
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        companies (
          id,
          name
        )
      `)
      .limit(1)
      .single();
    
    if (error) {
      console.error('❌ [진단] companies 조인 실패:', error);
      return { success: false, error };
    }
    
    console.log('✅ [진단] companies 조인 성공:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ [진단] companies 조인 에러:', err);
    return { success: false, error: err };
  }
}

/**
 * 전체 진단 실행
 */
export async function runFullDiagnostic() {
  console.log('🏥 ========== Supabase 전체 진단 시작 ==========');
  
  const results = {
    connection: await checkSupabaseConnection(),
    rls: await checkJobsRLS(),
    join: await checkCompaniesJoin()
  };
  
  console.log('🏥 ========== 진단 결과 ==========');
  console.log('연결:', results.connection.success ? '✅' : '❌');
  console.log('RLS:', results.rls.success ? '✅' : '❌');
  console.log('조인:', results.join.success ? '✅' : '❌');
  console.log('======================================');
  
  return results;
}


