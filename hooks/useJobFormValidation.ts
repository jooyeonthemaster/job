// 채용공고 폼 검증 로직 커스텀 훅
// 2024-12-31: 필수 필드 간소화 - 포지션명(한글), 마감일, 채용담당자만 필수

import { useMemo } from 'react';
import { JobFormData } from '@/types/job-form.types';

export function useJobFormValidation(formData: JobFormData, _editorContent?: string) {

  const validateForm = useMemo(() => (): string[] => {
    const errors: string[] = [];

    // ========================================
    // 필수 항목 (간소화됨)
    // ========================================

    // 1. 포지션명 (한글) - 필수
    if (!formData.title.trim()) {
      errors.push('포지션명 (한글)을 입력해주세요');
    }

    // 2. 마감일 - 필수 (공고 관리용)
    if (!formData.deadline) {
      errors.push('마감일을 선택해주세요');
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        errors.push('마감일은 오늘 이후여야 합니다');
      }
    }

    // 3. 채용 담당자 정보 - 필수
    if (!formData.managerName || !formData.managerName.trim()) {
      errors.push('채용 담당자 이름을 입력해주세요');
    }
    if (!formData.managerEmail || !formData.managerEmail.trim()) {
      errors.push('채용 담당자 이메일을 입력해주세요');
    }

    // ========================================
    // 선택 항목 (검증 제거됨)
    // ========================================
    // - 포지션명 (영문): 선택
    // - 부서/팀: 선택
    // - 근무지: 선택
    // - 급여 정보: 선택
    // - JD, 경력, 스킬: 선택
    // - 상세 내용 (에디터): 선택

    // 급여 입력 시 min > max 검증 (입력한 경우에만)
    if (formData.salaryMin && formData.salaryMax &&
        parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
      errors.push('최소 연봉은 최대 연봉보다 작아야 합니다');
    }

    return errors;
  }, [formData]);

  const errors = useMemo(() => validateForm(), [validateForm]);
  const isValid = useMemo(() => errors.length === 0, [errors]);

  return {
    errors,
    isValid,
    validateForm
  };
}















