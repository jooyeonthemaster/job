// 채용공고 복지 및 혜택 섹션 컴포넌트

import { Plus, X } from 'lucide-react';
import { JobFormData } from '@/types/job-form.types';

interface BenefitsSectionProps {
  formData: JobFormData;
  onAddItem: (field: 'benefits' | 'tags') => void;
  onRemoveItem: (field: 'benefits' | 'tags', index: number) => void;
  onUpdateItem: (field: 'benefits' | 'tags', index: number, value: string) => void;
}

export default function BenefitsSection({ 
  formData, 
  onAddItem, 
  onRemoveItem, 
  onUpdateItem 
}: BenefitsSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">복지 및 혜택</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">복지 항목</label>
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => onUpdateItem('benefits', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 4대보험, 퇴직금"
              />
              {formData.benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem('benefits', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddItem('benefits')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            복지 추가
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">태그 (기술스택, 키워드)</label>
          {formData.tags.map((tag, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => onUpdateItem('tags', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: React, TypeScript"
              />
              {formData.tags.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem('tags', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddItem('tags')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            태그 추가
          </button>
        </div>
      </div>
    </div>
  );
}






