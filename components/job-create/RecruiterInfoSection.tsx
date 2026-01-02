// 채용 담당자 추가 정보 섹션 (선택 입력)
// 필수 필드(담당자 이름, 이메일)는 RequiredFieldsSection으로 이동

import { Briefcase } from 'lucide-react';
import FormInput from '@/components/ui/form/FormInput';
import PhoneInput from '@/components/ui/form/PhoneInput';

interface RecruiterInfo {
  managerPosition: string;
  managerPhone: string;
}

interface RecruiterInfoSectionProps {
  formData: RecruiterInfo;
  onUpdate: (field: keyof RecruiterInfo, value: string) => void;
  errors?: Record<string, string>;
}

/**
 * 채용 담당자 추가 정보 섹션 (선택 입력)
 *
 * @설명
 * - 필수 필드(담당자 이름, 이메일)는 RequiredFieldsSection에서 관리
 * - 이 섹션은 선택 필드(직책, 전화번호)만 담당
 */
export default function RecruiterInfoSection({
  formData,
  onUpdate,
  errors = {},
}: RecruiterInfoSectionProps) {
  return (
    <div className="bg-white rounded-md p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-2">담당자 추가 정보</h2>
      <p className="text-xs font-medium text-gray-500 mb-4">선택 입력 항목</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 직책 */}
        <FormInput
          label="직책"
          value={formData.managerPosition}
          onChange={(value) => onUpdate('managerPosition', value)}
          placeholder="예: 개발팀 리드"
          icon={Briefcase}
          error={errors.managerPosition}
        />

        {/* 전화번호 */}
        <PhoneInput
          label="전화번호"
          value={formData.managerPhone}
          onChange={(value) => onUpdate('managerPhone', value)}
          error={errors.managerPhone}
        />
      </div>
    </div>
  );
}
