// 채용공고 채용 담당자 정보 섹션 컴포넌트
// RecruiterInfoSection을 래핑하여 기존 인터페이스 유지

import RecruiterInfoSection from './RecruiterInfoSection';
import { JobFormData } from '@/types/job-form.types';

interface RecruiterSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function RecruiterSection({ formData, onUpdate }: RecruiterSectionProps) {
  // RecruiterInfoSection에 맞게 데이터 변환
  const recruiterInfo = {
    recruiterName: formData.managerName,
    recruiterPosition: formData.managerPosition,
    recruiterEmail: formData.managerEmail,
    recruiterPhone: formData.managerPhone,
  };

  // 업데이트 핸들러 변환
  const handleUpdate = (field: 'recruiterName' | 'recruiterPosition' | 'recruiterEmail' | 'recruiterPhone', value: string) => {
    const fieldMap = {
      recruiterName: 'managerName',
      recruiterPosition: 'managerPosition',
      recruiterEmail: 'managerEmail',
      recruiterPhone: 'managerPhone',
    } as const;

    onUpdate(fieldMap[field] as keyof JobFormData, value);
  };

  return (
    <RecruiterInfoSection
      formData={recruiterInfo}
      onUpdate={handleUpdate}
    />
  );
}















