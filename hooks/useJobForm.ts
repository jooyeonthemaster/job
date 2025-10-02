// 채용공고 폼 상태 관리 커스텀 훅

import { useState, useCallback } from 'react';
import { JobFormData } from '@/types/job-form.types';

const initialFormData: JobFormData = {
  // 기본 정보
  title: '',
  titleEn: '',
  department: '',
  location: '',
  employmentType: 'FULL_TIME',
  experienceLevel: 'MID',
  deadline: '',
  
  // 급여
  salaryMin: '',
  salaryMax: '',
  salaryNegotiable: true,
  
  // 상세 정보
  description: '',
  mainTasks: [''],
  requirements: [''],
  preferredQualifications: [''],
  
  // 복지 및 태그
  benefits: [''],
  tags: [''],
  
  // 비자 및 언어
  visaSponsorship: true,
  koreanLevel: 'INTERMEDIATE',
  englishLevel: 'FLUENT',
  
  // 근무 조건
  probation: '3개월',
  workHours: '',
  startDate: '즉시 가능',
  
  // 채용 담당자
  managerName: '',
  managerPosition: '',
  managerEmail: '',
  managerPhone: '',
  
  // 공고 노출 위치
  postingTier: 'standard'
};

export function useJobForm() {
  const [formData, setFormData] = useState<JobFormData>(initialFormData);

  // 단일 필드 업데이트
  const updateField = useCallback(<K extends keyof JobFormData>(
    field: K,
    value: JobFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 배열 필드 추가
  const addArrayItem = useCallback((field: keyof Pick<JobFormData, 'mainTasks' | 'requirements' | 'preferredQualifications' | 'benefits' | 'tags'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  }, []);

  // 배열 필드 제거
  const removeArrayItem = useCallback((
    field: keyof Pick<JobFormData, 'mainTasks' | 'requirements' | 'preferredQualifications' | 'benefits' | 'tags'>,
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  // 배열 필드 업데이트
  const updateArrayItem = useCallback((
    field: keyof Pick<JobFormData, 'mainTasks' | 'requirements' | 'preferredQualifications' | 'benefits' | 'tags'>,
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  }, []);

  // 폼 리셋
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  return {
    formData,
    updateField,
    addArrayItem,
    removeArrayItem,
    updateArrayItem,
    resetForm
  };
}

