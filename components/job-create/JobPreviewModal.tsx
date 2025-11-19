'use client';

import { X, Building2, MapPin, Briefcase, Clock, Globe, DollarSign, FileText, Code } from 'lucide-react';
import { JobFormData } from '@/types/job-form.types';

interface JobPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: JobFormData;
  editorContent: string;
  companyName?: string;
  companyLogo?: string;
}

export default function JobPreviewModal({
  isOpen,
  onClose,
  formData,
  editorContent,
  companyName,
  companyLogo
}: JobPreviewModalProps) {
  if (!isOpen) return null;

  const formatSalary = (min: string, max: string, negotiable: boolean) => {
    if (negotiable) return '협의 가능';
    return `${parseInt(min).toLocaleString()} - ${parseInt(max).toLocaleString()}만원`;
  };

  const employmentTypeLabels = {
    FULL_TIME: '정규직',
    PART_TIME: '파트타임',
    CONTRACT: '계약직',
    INTERNSHIP: '인턴'
  };

  const experienceLevelLabels = {
    ENTRY: '신입',
    JUNIOR: '주니어',
    MID: '미들',
    SENIOR: '시니어',
    EXECUTIVE: '임원'
  };

  const languageLevelLabels = {
    NONE: '불필요',
    BASIC: '기초',
    INTERMEDIATE: '중급',
    FLUENT: '유창',
    NATIVE: '원어민'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">채용공고 미리보기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Company Info */}
          {companyName && (
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              {companyLogo && (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              )}
              <div>
                <p className="text-sm text-gray-600">회사명</p>
                <p className="text-lg font-bold text-gray-900">{companyName}</p>
              </div>
            </div>
          )}

          {/* Job Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{formData.title}</h3>
            <p className="text-lg text-gray-600">{formData.titleEn}</p>
          </div>

          {/* Job Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">부서</p>
                <p className="font-medium text-gray-900">{formData.department}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">근무지</p>
                <p className="font-medium text-gray-900">{formData.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">고용 형태</p>
                <p className="font-medium text-gray-900">
                  {employmentTypeLabels[formData.employmentType]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">경력</p>
                <p className="font-medium text-gray-900">
                  {experienceLevelLabels[formData.experienceLevel]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">연봉</p>
                <p className="font-medium text-gray-900">
                  {formatSalary(formData.salaryMin, formData.salaryMax, formData.salaryNegotiable)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Globe className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">비자 스폰서십</p>
                <p className="font-medium text-gray-900">
                  {formData.visaSponsorship ? '가능' : '불가능'}
                </p>
              </div>
            </div>
          </div>

          {/* Language Requirements */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">언어 요구사항</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">한국어</p>
                <p className="font-medium text-gray-900">
                  {languageLevelLabels[formData.koreanLevel]}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">영어</p>
                <p className="font-medium text-gray-900">
                  {languageLevelLabels[formData.englishLevel]}
                </p>
              </div>
            </div>
          </div>

          {/* ✨ JD (Job Description) */}
          {formData.jobDescription && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <h4 className="font-bold text-gray-900">JD (Job Description)</h4>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {formData.jobDescription}
                </p>
              </div>
            </div>
          )}

          {/* ✨ 필요 경력 사항 */}
          {formData.requiredExperience && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <h4 className="font-bold text-gray-900">필요 경력 사항</h4>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {formData.requiredExperience}
                </p>
              </div>
            </div>
          )}

          {/* ✨ 필요 스킬 */}
          {formData.requiredSkills && formData.requiredSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary-600" />
                <h4 className="font-bold text-gray-900">필요 스킬</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill, index) => (
                  skill.trim() && (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Work Conditions */}
          {(formData.probation || formData.workHours || formData.startDate) && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900">근무 조건</h4>
              <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                {formData.probation && (
                  <div>
                    <span className="text-sm text-gray-600">수습 기간: </span>
                    <span className="font-medium text-gray-900">{formData.probation}</span>
                  </div>
                )}
                {formData.workHours && (
                  <div>
                    <span className="text-sm text-gray-600">근무 시간: </span>
                    <span className="font-medium text-gray-900">{formData.workHours}</span>
                  </div>
                )}
                {formData.startDate && (
                  <div>
                    <span className="text-sm text-gray-600">입사 예정일: </span>
                    <span className="font-medium text-gray-900">{formData.startDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manager Info */}
          {(formData.managerName || formData.managerEmail) && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900">채용 담당자</h4>
              <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                {formData.managerName && (
                  <div>
                    <span className="text-sm text-gray-600">담당자: </span>
                    <span className="font-medium text-gray-900">
                      {formData.managerName}
                      {formData.managerPosition && ` (${formData.managerPosition})`}
                    </span>
                  </div>
                )}
                {formData.managerEmail && (
                  <div>
                    <span className="text-sm text-gray-600">이메일: </span>
                    <span className="font-medium text-gray-900">{formData.managerEmail}</span>
                  </div>
                )}
                {formData.managerPhone && (
                  <div>
                    <span className="text-sm text-gray-600">연락처: </span>
                    <span className="font-medium text-gray-900">{formData.managerPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Editor Content */}
          {editorContent && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900">상세 내용</h4>
              <div
                className="prose max-w-none p-6 border border-gray-200 rounded-lg bg-gray-50"
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            </div>
          )}

          {/* Deadline */}
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-600">마감일</p>
            <p className="font-bold text-primary-900">
              {new Date(formData.deadline).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

















