// 채용공고 담당자 추가 정보 섹션 컴포넌트 (선택 입력)
// RecruiterInfoSection을 래핑하여 기존 인터페이스 유지
// 필수 필드(담당자 이름, 이메일)는 RequiredFieldsSection에서 관리

import RecruiterInfoSection from './RecruiterInfoSection';
import { JobFormData } from '@/types/job-form.types';

interface RecruiterSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function RecruiterSection({ formData, onUpdate }: RecruiterSectionProps) {
  // 선택 필드만 전달 (필수 필드는 RequiredFieldsSection에서 관리)
  const managerOptionalInfo = {
    managerPosition: formData.managerPosition,
    managerPhone: formData.managerPhone,
  };

  // 업데이트 핸들러
  const handleUpdate = (field: 'managerPosition' | 'managerPhone', value: string) => {
    onUpdate(field as keyof JobFormData, value);
  };

  return (
    <RecruiterInfoSection
      formData={managerOptionalInfo}
      onUpdate={handleUpdate}
    />
  );
}















