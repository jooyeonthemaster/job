// 채용공고 JD, 경력 사항, 스킬 섹션 컴포넌트

import { JobFormData } from '@/types/job-form.types';
import { FileText, Briefcase, Code, Plus, X } from 'lucide-react';

interface RequirementsSectionProps {
  formData: JobFormData;
  onUpdate: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void;
}

export default function RequirementsSection({
  formData,
  onUpdate
}: RequirementsSectionProps) {
  // 스킬 배열 조작 헬퍼 함수
  const addSkill = () => {
    onUpdate('requiredSkills', [...formData.requiredSkills, '']);
  };

  const removeSkill = (index: number) => {
    onUpdate('requiredSkills', formData.requiredSkills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, value: string) => {
    onUpdate('requiredSkills', formData.requiredSkills.map((skill, i) => i === index ? value : skill));
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-600 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">직무 상세 및 자격 요건</h2>
          <p className="text-sm text-gray-600">JD, 경력 사항, 필요 스킬을 입력하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* JD (Job Description) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-primary-600" />
            JD (Job Description)
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.jobDescription}
            onChange={(e) => onUpdate('jobDescription', e.target.value)}
            placeholder="이 포지션의 주요 역할과 책임에 대해 상세히 설명해주세요.&#10;예: 프론트엔드 개발팀의 일원으로서 React 기반 웹 애플리케이션 개발 및 유지보수를 담당합니다. UI/UX 디자인팀과 협업하여 사용자 친화적인 인터페이스를 구현하고, 백엔드 팀과 API 통신을 통해 데이터를 연동합니다."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            직무의 주요 역할, 책임, 업무 범위를 구체적으로 작성해주세요
          </p>
        </div>

        {/* 필요 경력 사항 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 text-primary-600" />
            필요 경력 사항
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.requiredExperience}
            onChange={(e) => onUpdate('requiredExperience', e.target.value)}
            placeholder="필요한 경력 사항을 구체적으로 작성해주세요.&#10;예: 의료기기 자동화 장비 제조 경력 5년 이상&#10;예: React 기반 웹 애플리케이션 개발 경험 3년 이상&#10;예: B2B SaaS 서비스 기획 및 운영 경험 2년 이상"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            구체적인 경력 요구사항을 연차, 분야, 세부 경험을 포함하여 작성해주세요
          </p>
        </div>

        {/* 필요 스킬 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Code className="w-4 h-4 text-primary-600" />
            필요 스킬
            <span className="text-red-500">*</span>
          </label>

          {/* 스킬 입력 필드 리스트 */}
          <div className="space-y-2 mb-3">
            {formData.requiredSkills.length === 0 ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdate('requiredSkills', [e.target.value]);
                    }
                  }}
                  placeholder="예: React, TypeScript, AWS, Python"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            ) : (
              formData.requiredSkills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="예: React, TypeScript, AWS, Python"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  {formData.requiredSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 스킬 추가 버튼 */}
          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            스킬 추가
          </button>

          <p className="mt-2 text-xs text-gray-500">
            필요한 기술 스택, 도구, 프로그래밍 언어 등을 입력해주세요
          </p>
        </div>

        {/* 안내 메시지 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">작성 팁</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>JD</strong>: 직무의 핵심 역할과 책임을 명확하게 작성하세요</li>
                <li>• <strong>필요 경력</strong>: 연차, 분야, 구체적 경험을 포함하여 작성하세요</li>
                <li>• <strong>스킬</strong>: 필수 기술과 우대 기술을 구분하여 작성할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
