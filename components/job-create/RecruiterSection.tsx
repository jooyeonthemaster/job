// 채용공고 채용 담당자 정보 섹션 컴포넌트

import { JobFormData } from '@/types/job-form.types';

interface RecruiterSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function RecruiterSection({ formData, onUpdate }: RecruiterSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">채용 담당자 정보</h2>
      <p className="text-sm text-gray-500 mb-4">입력하지 않으면 기업 정보의 담당자 정보가 사용됩니다</p>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">담당자 이름</label>
            <input
              type="text"
              value={formData.managerName}
              onChange={(e) => onUpdate('managerName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 김철수"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
            <input
              type="text"
              value={formData.managerPosition}
              onChange={(e) => onUpdate('managerPosition', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 개발팀 리드"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={formData.managerEmail}
              onChange={(e) => onUpdate('managerEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: recruit@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
            <input
              type="tel"
              value={formData.managerPhone}
              onChange={(e) => onUpdate('managerPhone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 02-1234-5678"
            />
          </div>
        </div>
      </div>
    </div>
  );
}






