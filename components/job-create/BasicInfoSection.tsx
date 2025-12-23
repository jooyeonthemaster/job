// 채용공고 기본 정보 섹션 컴포넌트

import { JobFormData, EmploymentType, ExperienceLevel } from '@/types/job-form.types';
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from '@/constants/job-posting';
import AddressSearchInput from '@/components/ui/form/AddressSearchInput';
import FormInput from '@/components/ui/form/FormInput';
import FormSelect from '@/components/ui/form/FormSelect';
import FormDatePicker from '@/components/ui/form/FormDatePicker';

interface BasicInfoSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function BasicInfoSection({ formData, onUpdate }: BasicInfoSectionProps) {
  return (
    <div className="bg-white rounded-md p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">기본 정보</h2>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="포지션명 (한글)"
            value={formData.title}
            onChange={(value) => onUpdate('title', value)}
            placeholder="예: 프론트엔드 개발자"
            required
          />
          <FormInput
            label="포지션명 (영문)"
            value={formData.titleEn}
            onChange={(value) => onUpdate('titleEn', value)}
            placeholder="예: Frontend Developer"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="부서/팀"
            value={formData.department}
            onChange={(value) => onUpdate('department', value)}
            placeholder="예: Engineering"
            required
          />
        </div>

        {/* 주소 검색 컴포넌트 */}
        <AddressSearchInput
          label="근무지"
          value={formData.location}
          onChange={(value) => onUpdate('location', value)}
          required
          showDetailInput={false}
          showPreview={false}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormSelect
            label="고용 형태"
            value={formData.employmentType}
            onChange={(value) => onUpdate('employmentType', value as EmploymentType)}
            options={Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <FormSelect
            label="경력 수준"
            value={formData.experienceLevel}
            onChange={(value) => onUpdate('experienceLevel', value as ExperienceLevel)}
            options={Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>

        <FormDatePicker
          label="마감일"
          value={formData.deadline}
          onChange={(value) => onUpdate('deadline', value)}
          minDate={new Date()}
          required
        />
      </div>
    </div>
  );
}















