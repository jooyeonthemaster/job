// 채용공고 상세 정보 섹션 컴포넌트

import { Plus, X } from 'lucide-react';
import { JobFormData } from '@/types/job-form.types';

interface JobDetailsSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
  onAddItem: (field: 'mainTasks' | 'requirements' | 'preferredQualifications') => void;
  onRemoveItem: (field: 'mainTasks' | 'requirements' | 'preferredQualifications', index: number) => void;
  onUpdateItem: (field: 'mainTasks' | 'requirements' | 'preferredQualifications', index: number, value: string) => void;
}

export default function JobDetailsSection({ 
  formData, 
  onUpdate, 
  onAddItem, 
  onRemoveItem, 
  onUpdateItem 
}: JobDetailsSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">포지션 상세</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            포지션 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="이 포지션에 대한 전반적인 설명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주요 업무 <span className="text-red-500">*</span>
          </label>
          {formData.mainTasks.map((task, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={task}
                onChange={(e) => onUpdateItem('mainTasks', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="주요 업무 내용"
              />
              {formData.mainTasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem('mainTasks', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddItem('mainTasks')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            업무 추가
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            자격 요건 <span className="text-red-500">*</span>
          </label>
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={req}
                onChange={(e) => onUpdateItem('requirements', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="필수 자격 요건"
              />
              {formData.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem('requirements', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddItem('requirements')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            요건 추가
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">우대 사항</label>
          {formData.preferredQualifications.map((qual, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={qual}
                onChange={(e) => onUpdateItem('preferredQualifications', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="우대 사항"
              />
              {formData.preferredQualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem('preferredQualifications', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddItem('preferredQualifications')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            우대사항 추가
          </button>
        </div>
      </div>
    </div>
  );
}

