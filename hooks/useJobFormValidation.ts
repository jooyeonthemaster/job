// 채용공고 폼 검증 로직 커스텀 훅

import { useMemo } from 'react';
import { JobFormData } from '@/types/job-form.types';

export function useJobFormValidation(formData: JobFormData) {
  
  const validateForm = useMemo(() => (): string[] => {
    const errors: string[] = [];

    // 필수 항목 검증
    if (!formData.title.trim()) {
      errors.push('포지션명 (한글)을 입력해주세요');
    }
    if (!formData.titleEn.trim()) {
      errors.push('포지션명 (영문)을 입력해주세요');
    }
    if (!formData.department.trim()) {
      errors.push('부서/팀을 입력해주세요');
    }
    if (!formData.location.trim()) {
      errors.push('근무지를 입력해주세요');
    }

    // 급여 검증
    if (!formData.salaryMin || parseInt(formData.salaryMin) <= 0) {
      errors.push('최소 연봉을 입력해주세요');
    }
    if (!formData.salaryMax || parseInt(formData.salaryMax) <= 0) {
      errors.push('최대 연봉을 입력해주세요');
    }
    if (formData.salaryMin && formData.salaryMax && 
        parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
      errors.push('최소 연봉은 최대 연봉보다 작아야 합니다');
    }

    // 상세 정보 검증
    if (!formData.description.trim()) {
      errors.push('포지션 설명을 입력해주세요');
    }

    const validMainTasks = formData.mainTasks.filter(t => t.trim());
    if (validMainTasks.length === 0) {
      errors.push('최소 1개 이상의 주요 업무를 입력해주세요');
    }

    const validRequirements = formData.requirements.filter(r => r.trim());
    if (validRequirements.length === 0) {
      errors.push('최소 1개 이상의 자격 요건을 입력해주세요');
    }

    // 마감일 검증
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






