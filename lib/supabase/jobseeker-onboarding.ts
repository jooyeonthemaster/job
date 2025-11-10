// Supabase 개인 회원 온보딩 관련 서비스
import { supabase } from './config';
import type { JobseekerOnboardingData } from './jobseeker-types';

// =====================================================
// 온보딩
// =====================================================

/**
 * 온보딩 데이터 저장
 */
export const completeOnboarding = async (
  userId: string,
  data: JobseekerOnboardingData
) => {
  try {
    console.log('[completeOnboarding] 시작:', { userId, data });

    // 1. 먼저 users 테이블에 레코드가 있는지 확인
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('[completeOnboarding] 사용자 조회 에러:', selectError);
      throw selectError;
    }

    console.log('[completeOnboarding] 기존 사용자:', existingUser ? '있음' : '없음');

    const updateData: any = {
      full_name: data.fullName,
      desired_job_category: data.desired_job_category || null,  // ✅ 희망 근무 직군 추가
      phone_country_code: data.phone_country_code || '+82',     // ✅ 국가 코드 추가 (기본값: 한국)
      phone: data.phone || null,                                // ✅ NULL 허용
      headline: data.headline,
      resume_file_url: data.resumeFileUrl,
      resume_file_name: data.resumeFileName,
      resume_uploaded_at: data.resumeFileUrl ? new Date().toISOString() : null,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    };

    // K-Work 확장 필드 추가 (NULL 허용으로 변경)
    updateData.phone_verified = data.phone_verified ?? false;
    updateData.foreigner_number = data.foreigner_number || null;  // ✅ NULL 허용 (빈 문자열 → null)
    updateData.foreigner_number_verified = data.foreigner_number_verified ?? false;
    updateData.address = data.address || '';
    updateData.address_detail = data.address_detail || '';
    updateData.nationality = data.nationality || '';
    updateData.birth_year = data.birth_year || null;
    updateData.gender = data.gender || '';
    updateData.visa_types = data.visa_types || [];
    updateData.korean_level = data.korean_level || '';
    updateData.agree_email_receive = data.agree_email_receive ?? false;
    updateData.agree_privacy_collection = data.agree_privacy_collection ?? false;

    console.log('[completeOnboarding] updateData:', updateData);

    let userData;

    if (existingUser) {
      // 레코드가 있으면 업데이트
      console.log('[completeOnboarding] 기존 레코드 업데이트 시작');
      const { data: updatedData, error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (userError) {
        console.error('[completeOnboarding] UPDATE 에러 상세:', {
          message: userError?.message,
          code: userError?.code,
          details: userError?.details,
          hint: userError?.hint,
          fullError: JSON.stringify(userError, null, 2)
        });
        console.error('[completeOnboarding] UPDATE 시도한 데이터:', updateData);
        throw userError;
      }
      console.log('[completeOnboarding] UPDATE 성공');
      userData = updatedData;
    } else {
      // 레코드가 없으면 생성 (Google OAuth 등의 경우)
      console.log('[completeOnboarding] 신규 레코드 생성 시작');
      const { data: authUser } = await supabase.auth.getUser();

      const insertData = {
        id: userId,
        email: authUser.user?.email || '',
        user_type: 'jobseeker',
        ...updateData,
        created_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('[completeOnboarding] INSERT 에러 상세:', {
          message: insertError?.message,
          code: insertError?.code,
          details: insertError?.details,
          hint: insertError?.hint,
          fullError: JSON.stringify(insertError, null, 2)
        });
        console.error('[completeOnboarding] INSERT 시도한 데이터:', insertData);
        throw insertError;
      }
      console.log('[completeOnboarding] INSERT 성공');
      userData = insertedData;
    }

    // 2. user_languages 테이블에 언어 저장
    if (data.otherLanguages && data.otherLanguages.length > 0) {
      console.log('[completeOnboarding] 언어 저장 시작:', data.otherLanguages);

      // 기존 언어 삭제 (중복 방지)
      const { error: deleteError } = await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('[completeOnboarding] 언어 삭제 에러:', deleteError);
      }

      // 새로운 언어 삽입
      const languageData = data.otherLanguages.map((lang) => ({
        user_id: userId,
        language_name: lang.language,
        proficiency: lang.proficiency,
      }));

      const { error: langError } = await supabase
        .from('user_languages')
        .insert(languageData);

      if (langError) {
        console.error('[completeOnboarding] 언어 INSERT 에러:', langError);
        // 언어 저장 실패는 치명적이지 않으므로 에러를 던지지 않음
      } else {
        console.log('[completeOnboarding] 언어 저장 성공');
      }
    }

    console.log('[completeOnboarding] 완료:', userData);
    return userData;
  } catch (error: any) {
    console.error('[completeOnboarding] 최종 에러 상세:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack,
      fullError: JSON.stringify(error, null, 2)
    });
    throw error;
  }
};

/**
 * 이력서 파일 업로드 (Cloudinary)
 */
export const uploadResume = async (file: File, userId: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `jobmatch/resumes/${userId}`);
  formData.append('type', 'resume');

  const response = await fetch('/api/upload-resume', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '이력서 업로드 실패');
  }

  const data = await response.json();
  return data.url;
};
