// 채용공고 채용 담당자 정보 섹션 컴포넌트
// RecruiterInfoSection을 래핑하여 기존 인터페이스 유지

import RecruiterInfoSection from './RecruiterInfoSection';
import { JobFormData } from '@/types/job-form.types';

interface RecruiterSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function RecruiterSection({ formData, onUpdate }: RecruiterSectionProps) {
  // RecruiterInfoSection이 이제 manager* 필드를 직접 사용하므로
  // 변환 없이 그대로 전달
  const managerInfo = {
    managerName: formData.managerName,
    managerPosition: formData.managerPosition,
    managerEmail: formData.managerEmail,
    managerPhone: formData.managerPhone,
  };

  // 업데이트 핸들러도 직접 전달
  const handleUpdate = (field: 'managerName' | 'managerPosition' | 'managerEmail' | 'managerPhone', value: string) => {
    onUpdate(field as keyof JobFormData, value);
  };

  return (
    <RecruiterInfoSection
      formData={managerInfo}
      onUpdate={handleUpdate}
    />
  );
}















