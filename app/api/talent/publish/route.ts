// 인재풀 공개 API
// 개인 구직자가 프로필을 인재풀에 공개할 때 호출
// 2026-01-02 간소화: 필수 8개 → 6개로 변경

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

    // 5. 프로필 완성도 검증 (필수 6개 항목 완성 필수)
    // talent-pool-eligibility.ts의 간소화 로직과 동일하게 검증
    const eligibilityCheck = await verifyProfileCompleteness(userId);

    if (!eligibilityCheck.eligible) {
      console.error('[API] 프로필 미완성:', eligibilityCheck.missingFields);
      return NextResponse.json(
        {
          error: '프로필을 완성해야 인재풀에 등록할 수 있습니다.',
          missingFields: eligibilityCheck.missingFields,
          completionRate: eligibilityCheck.completionRate
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

  } catch (error: any) {
    console.error('[API] 인재풀 공개 에러:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 프로필 완성도 검증 함수 (간소화 버전)
 * 2026-01-02 간소화: 8개 필수 → 6개 필수로 변경
 *
 * ⭐ 필수 항목 (6개):
 * 1. 연락처 (전화번호)
 * 2. 이메일
 * 3. 경력 (최소 1개)
 * 4. 보유 기술 (최소 1개)
 * 5. 자기소개
 * 6. 희망 직무 (최소 1개)
 *
 * 📋 선택 항목 (4개) - 검증하지 않음:
 * - 프로필 사진
 * - 헤드라인 (한 줄 소개)
 * - 언어 능력
 * - 이력서 파일
 */
async function verifyProfileCompleteness(userId: string): Promise<{
  eligible: boolean;
  completionRate: number;
  missingFields: string[];
}> {
  const missingFields: string[] = [];
  let completedFields = 0;
  const totalRequiredFields = 6; // 간소화: 8→6

  try {
    // 사용자 기본 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        introduction
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('사용자 정보를 조회할 수 없습니다.');
    }

    // ⭐ 1. 연락처 (전화번호) - 필수
    if (user.phone && user.phone.trim().length > 0) {
      completedFields++;
    } else {
      missingFields.push('연락처 (전화번호)');
    }

    // ⭐ 2. 이메일 - 필수
    if (user.email && user.email.trim().length > 0) {
      completedFields++;
    } else {
      missingFields.push('이메일');
    }

    // ⭐ 3. 경력 (최소 1개) - 필수
    const { count: expCount } = await supabase
      .from('user_experiences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (expCount && expCount > 0) {
      completedFields++;
    } else {
      missingFields.push('경력 사항 (최소 1개)');
    }

    // ⭐ 4. 스킬 (최소 1개) - 필수
    const { count: skillCount } = await supabase
      .from('user_skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (skillCount && skillCount >= 1) {
      completedFields++;
    } else {
      missingFields.push(`보유 기술 (최소 1개, 현재 ${skillCount || 0}개)`);
    }

    // ⭐ 5. 자기소개 - 필수
    if (user.introduction && user.introduction.trim().length > 0) {
      completedFields++;
    } else {
      missingFields.push('자기소개');
    }

    // ⭐ 6. 희망 직무 (최소 1개) - 필수
    const { count: positionCount } = await supabase
      .from('user_desired_positions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (positionCount && positionCount > 0) {
      completedFields++;
    } else {
      missingFields.push('희망 직무 (최소 1개)');
    }

    const completionRate = Math.round((completedFields / totalRequiredFields) * 100);
    const eligible = completionRate === 100;

    console.log('[verifyProfileCompleteness] 결과:', {
      completedFields,
      totalRequiredFields,
      completionRate,
      eligible,
      missingFields
    });

    return {
      eligible,
      completionRate,
      missingFields
    };

  } catch (error) {
    console.error('[verifyProfileCompleteness] 에러:', error);
    return {
      eligible: false,
      completionRate: 0,
      missingFields: ['프로필 정보 검증 중 오류 발생']
    };
  }
}
