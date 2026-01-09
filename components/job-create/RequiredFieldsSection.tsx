// 채용공고 필수 입력 필드 통합 섹션
// 포지션명(한글), 마감일, 담당자 이름, 담당자 이메일

import { JobFormData } from '@/types/job-form.types';
import { User, Mail, AlertCircle } from 'lucide-react';
import FormInput from '@/components/ui/form/FormInput';
import FormDatePicker from '@/components/ui/form/FormDatePicker';

// 마감일 빠른 선택 옵션
const DEADLINE_QUICK_OPTIONS = [
  { label: '1주 후', days: 7 },
  { label: '2주 후', days: 14 },
  { label: '1개월 후', days: 30 },
] as const;

interface RequiredFieldsProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function RequiredFieldsSection({ formData, onUpdate }: RequiredFieldsProps) {
  // 빠른 선택 버튼 클릭 핸들러
  const handleQuickDeadline = (days: number) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    onUpdate('deadline', deadline.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white rounded-md p-6 shadow-sm border-2 border-red-100">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            필수 입력 항목
            <span className="text-red-500 text-sm">*</span>
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            아래 4개 항목만 입력하시면 공고 등록이 완료됩니다
          </p>
        </div>
      </div>

      {/* 필수 필드 그리드 */}
      <div className="p-4 bg-red-50/50 rounded-lg space-y-4">
        {/* 기본 정보 */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="포지션명 (한글)"
            value={formData.title}
            onChange={(value) => onUpdate('title', value)}
            placeholder="예: 프론트엔드 개발자"
            required
          />
          <div className="space-y-2">
            {/* 빠른 선택 버튼 */}
            <div className="flex flex-wrap gap-2">
              {DEADLINE_QUICK_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => handleQuickDeadline(option.days)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:border-primary-300 transition-colors"
                >
                  {option.label}
                </button>
              ))}
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

        {/* 담당자 정보 */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="채용 담당자 이름"
            value={formData.managerName}
            onChange={(value) => onUpdate('managerName', value)}
            placeholder="예: 김철수"
            icon={User}
            required
          />
          <FormInput
            label="채용 담당자 이메일"
            type="email"
            value={formData.managerEmail}
            onChange={(value) => onUpdate('managerEmail', value)}
            placeholder="예: recruit@company.com"
            icon={Mail}
            required
          />
        </div>
      </div>
    </div>
  );
}
