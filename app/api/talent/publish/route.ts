// 인재풀 공개 API
// 개인 구직자가 프로필을 인재풀에 공개할 때 호출
// 2026-01-09 통합: profile-eligibility.ts 기준 적용
//
// 📋 새로운 통합 기준:
// 1. 핵심 정보 (3가지 필수): 이메일, 전화번호, 한줄소개
// 2. 이력서 파일 OR 프로필 6개 정보 전부

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드 전용 클라이언트 (Service Role Key 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/talent/publish
 *
 * 인재풀 공개 요청 처리
 *
 * Request Body:
 * {
 *   userId: string;  // 사용자 ID
 * }
 *
 * Response:
 * {
 *   success: boolean;
 *   user?: object;
 *   error?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // 1. userId 검증
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('[API] 인재풀 공개 요청:', userId);

    // 2. 사용자 존재 여부 확인
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, full_name, email, user_type, is_public, profile_completed')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      console.error('[API] 사용자 조회 실패:', fetchError);
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. user_type 검증 (jobseeker만 가능)
    if (existingUser.user_type !== 'jobseeker') {
      console.error('[API] 잘못된 사용자 유형:', existingUser.user_type);
      return NextResponse.json(
        { error: '개인 구직자만 인재풀에 등록할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 4. 이미 공개된 경우 체크
    if (existingUser.is_public) {
      console.log('[API] 이미 공개된 프로필:', userId);
      return NextResponse.json({
        success: true,
        message: '이미 인재풀에 공개된 프로필입니다.',
        user: existingUser
      });
    }

    // 5. 프로필 완성도 검증 (통합 기준)
    // 핵심 3가지 + (이력서 OR 프로필 6개)
    const eligibilityCheck = await verifyProfileCompleteness(userId);

    if (!eligibilityCheck.eligible) {
      console.error('[API] 프로필 미완성:', eligibilityCheck.missingFields);
      return NextResponse.json(
        {
          error: '프로필을 완성해야 인재풀에 등록할 수 있습니다.',
          missingFields: eligibilityCheck.missingFields,
          completionRate: eligibilityCheck.completionRate,
          hasResume: eligibilityCheck.hasResume
        },
        { status: 400 }
      );
    }

    // 6. 인재풀 공개 처리
    const now = new Date().toISOString();
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_public: true,
        profile_completed: true,
        published_at: now,
        updated_at: now
      })
      .eq('id', userId)
      .select('id, full_name, email, is_public, profile_completed, published_at')
      .single();

    if (updateError) {
      console.error('[API] 인재풀 공개 실패:', updateError);
      return NextResponse.json(
        { error: '인재풀 공개 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('[API] 인재풀 공개 성공:', updatedUser.id);

    // 7. 성공 응답
    return NextResponse.json({
      success: true,
      message: '인재풀에 성공적으로 등록되었습니다!',
      user: updatedUser
    });

  } catch (error: unknown) {
    console.error('[API] 인재풀 공개 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 프로필 완성도 검증 함수 (통합 버전)
 * 2026-01-09 통합: profile-eligibility.ts 기준 적용
 *
 * 📋 새로운 통합 기준:
 * 🔵 핵심 정보 (3가지 필수):
 *   1. 이메일
 *   2. 전화번호
 *   3. 한줄소개 (headline)
 *
 * 📄 이력서 파일 OR 프로필 6개 정보:
 *   - 이력서 파일이 있으면 → 바로 자격 충족
 *   - 이력서 없으면 → 아래 6가지 모두 필요:
 *     1. 경력사항 (최소 1개)
 *     2. 학력사항 (최소 1개)
 *     3. 보유기술 (최소 1개)
 *     4. 언어능력 (최소 1개)
 *     5. 자기소개
 *     6. 희망직무 (최소 1개)
 */
async function verifyProfileCompleteness(userId: string): Promise<{
  eligible: boolean;
  completionRate: number;
  missingFields: string[];
  hasResume: boolean;
}> {
  const missingFields: string[] = [];

  try {
    // 사용자 기본 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        headline,
        introduction,
        resume_file_url
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('사용자 정보를 조회할 수 없습니다.');
    }

    // ============================================
    // 🔵 핵심 정보 (3가지) - 항상 필수
    // ============================================
    let coreCompleted = 0;
    const coreTotal = 3;

    // 1. 이메일
    if (user.email && user.email.trim().length > 0) {
      coreCompleted++;
    } else {
      missingFields.push('이메일');
    }

    // 2. 전화번호
    if (user.phone && user.phone.trim().length > 0) {
      coreCompleted++;
    } else {
      missingFields.push('전화번호');
    }

    // 3. 한줄소개 (headline)
    if (user.headline && user.headline.trim().length > 0) {
      coreCompleted++;
    } else {
      missingFields.push('한줄소개');
    }

    // ============================================
    // 📄 이력서 확인
    // ============================================
    const hasResume = !!(user.resume_file_url && user.resume_file_url.trim().length > 0);

    // ============================================
    // 📋 프로필 6개 정보 (이력서 없을 때 필요)
    // ============================================
    let profileCompleted = 0;
    const profileTotal = 6;

    // 1. 경력사항 (최소 1개)
    const { count: expCount } = await supabase
      .from('user_experiences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (expCount && expCount > 0) {
      profileCompleted++;
    } else if (!hasResume) {
      missingFields.push('경력사항 (최소 1개)');
    }

    // 2. 학력사항 (최소 1개)
    const { count: eduCount } = await supabase
      .from('user_educations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (eduCount && eduCount > 0) {
      profileCompleted++;
    } else if (!hasResume) {
      missingFields.push('학력사항 (최소 1개)');
    }

    // 3. 보유기술 (최소 1개)
    const { count: skillCount } = await supabase
      .from('user_skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (skillCount && skillCount >= 1) {
      profileCompleted++;
    } else if (!hasResume) {
      missingFields.push('보유기술 (최소 1개)');
    }

    // 4. 언어능력 (최소 1개)
    const { count: langCount } = await supabase
      .from('user_languages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (langCount && langCount >= 1) {
      profileCompleted++;
    } else if (!hasResume) {
      missingFields.push('언어능력 (최소 1개)');
    }

    // 5. 자기소개
    if (user.introduction && user.introduction.trim().length > 0) {
      profileCompleted++;
    } else if (!hasResume) {
      missingFields.push('자기소개');
    }

    // 6. 희망직무 (최소 1개)
    const { count: positionCount } = await supabase
      .from('user_desired_positions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (positionCount && positionCount > 0) {
      profileCompleted++;
    } else if (!hasResume) {
      missingFields.push('희망직무 (최소 1개)');
    }

    // ============================================
    // 🎯 자격 판정
    // ============================================
    const coreAllComplete = coreCompleted === coreTotal;
    const resumeOrProfileComplete = hasResume || (profileCompleted === profileTotal);
    const eligible = coreAllComplete && resumeOrProfileComplete;

    // ============================================
    // 📈 완성율 계산
    // ============================================
    let completionRate: number;
    if (hasResume) {
      // 이력서 있으면 핵심 3개만 체크
      completionRate = Math.round((coreCompleted / coreTotal) * 100);
    } else {
      // 이력서 없으면 핵심 3개 + 프로필 6개 = 총 9개
      const totalCompleted = coreCompleted + profileCompleted;
      const totalRequired = coreTotal + profileTotal;
      completionRate = Math.round((totalCompleted / totalRequired) * 100);
    }

    console.log('[verifyProfileCompleteness] 결과:', {
      coreCompleted,
      coreTotal,
      hasResume,
      profileCompleted,
      profileTotal,
      completionRate,
      eligible,
      missingFields
    });

    return {
      eligible,
      completionRate,
      missingFields,
      hasResume
    };

  } catch (error) {
    console.error('[verifyProfileCompleteness] 에러:', error);
    return {
      eligible: false,
      completionRate: 0,
      missingFields: ['프로필 정보 검증 중 오류 발생'],
      hasResume: false
    };
  }
}
