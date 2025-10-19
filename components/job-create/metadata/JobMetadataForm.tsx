'use client';

import { JobFormData } from '@/types/job-form.types';
import BasicInfoSection from '../BasicInfoSection';
import SalarySection from '../SalarySection';
import LanguageSection from '../LanguageSection';
import WorkConditionsSection from '../WorkConditionsSection';
import RecruiterSection from '../RecruiterSection';
import PostingTierSection from '../PostingTierSection';

interface JobMetadataFormProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function JobMetadataForm({ formData, onUpdate }: JobMetadataFormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border-2 border-primary-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">1</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">정형 정보 입력</h2>
        </div>
        <p className="text-sm text-gray-600 ml-11">
          채용공고의 기본 정보를 입력하세요. 이 정보는 정해진 템플릿으로 표시됩니다.
        </p>
      </div>

      <BasicInfoSection formData={formData} onUpdate={onUpdate} />
      <SalarySection formData={formData} onUpdate={onUpdate} />
      <LanguageSection formData={formData} onUpdate={onUpdate} />
      <WorkConditionsSection formData={formData} onUpdate={onUpdate} />
      <RecruiterSection formData={formData} onUpdate={onUpdate} />
      <PostingTierSection formData={formData} onUpdate={onUpdate} />
    </div>
  );
}
