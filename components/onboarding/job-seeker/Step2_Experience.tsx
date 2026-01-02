'use client';

import { useState } from 'react';
import { Briefcase, GraduationCap, Plus, Trash2, Building2, Calendar, FileText, BookOpen, Award, ChevronDown } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  current: boolean;
}

interface Props {
  data?: {
    experiences?: Experience[];
    educations?: Education[];
  };
  onNext: (data: { experiences: Experience[]; educations: Education[] }) => void;
  onBack: () => void;
}

// 공통 스타일 - primary(blue) 색상 적용
const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 text-gray-700 text-sm";
const selectClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-700 text-sm appearance-none cursor-pointer";
const labelClass = "flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1";

const Step2Experience = ({ data, onNext, onBack }: Props) => {
  const [showErrors, setShowErrors] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>(data?.experiences || []);
  const [educations, setEducations] = useState<Education[]>(data?.educations || []);

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      company: '', position: '', startDate: '', endDate: '', current: false, description: ''
    }]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const addEducation = () => {
    setEducations([...educations, {
      id: Date.now().toString(),
      school: '', degree: '', field: '', startYear: '', endYear: '', current: false
    }]);
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const updateEducation = (id: string, field: string, value: string | boolean) => {
    setEducations(educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const validateForm = () => {
    const errors: string[] = [];
    const hasValidExperience = experiences.some(exp => exp.company.trim() && exp.position.trim() && exp.startDate);
    if (!hasValidExperience) errors.push('경력 사항을 최소 1개 이상 입력해주세요');

    experiences.forEach((exp, index) => {
      if (exp.company || exp.position || exp.startDate) {
        if (!exp.company.trim()) errors.push(`경력 ${index + 1}: 회사명 필수`);
        if (!exp.position.trim()) errors.push(`경력 ${index + 1}: 직책 필수`);
        if (!exp.startDate) errors.push(`경력 ${index + 1}: 시작일 필수`);
      }
    });

    educations.forEach((edu, index) => {
      if (edu.school || edu.degree || edu.field) {
        if (!edu.school.trim()) errors.push(`학력 ${index + 1}: 학교명 필수`);
        if (!edu.degree) errors.push(`학력 ${index + 1}: 학위 필수`);
        if (!edu.field.trim()) errors.push(`학력 ${index + 1}: 전공 필수`);
      }
    });
    return errors;
  };

  const handleNext = () => {
    const errors = validateForm();
    if (errors.length > 0) setShowErrors(true);
    else { setShowErrors(false); onNext({ experiences, educations }); }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">경력 및 학력</h2>
          <p className="text-sm text-gray-500">당신의 경험과 학력을 입력해주세요</p>
        </div>
      </div>

      {/* 경력 섹션 */}
      <div className="bg-primary-50/50 border border-primary-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-primary-500" />
            경력 사항 <span className="text-red-500">*</span>
            {experiences.length > 0 && (
              <span className="text-xs text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded-full ml-1">
                {experiences.length}개
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-1 px-2 py-1 bg-primary-500 text-white rounded text-xs font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-3 h-3" /> 추가
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Briefcase className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">등록된 경력이 없습니다</p>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs text-primary-600 font-medium hover:text-primary-700"
            >
              + 첫 번째 경력 추가
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    #{index + 1} {exp.company || '새 경력'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className={labelClass}>
                      <Building2 className="w-3 h-3 text-primary-500" />
                      회사명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="삼성전자"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Award className="w-3 h-3 text-primary-500" />
                      직책 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      placeholder="마케팅 매니저"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Calendar className="w-3 h-3 text-primary-500" />
                      시작일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Calendar className="w-3 h-3 text-gray-400" />
                      종료일
                    </label>
                    <input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                      className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                    />
                    현재 재직 중
                  </label>
                </div>

                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3 text-gray-400" />
                    업무 설명 (선택)
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    placeholder="담당 업무나 성과를 간단히 설명"
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 학력 섹션 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            학력 사항 <span className="text-xs text-gray-400 font-normal">(선택)</span>
            {educations.length > 0 && (
              <span className="text-xs text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded-full ml-1">
                {educations.length}개
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3 h-3" /> 추가
          </button>
        </div>

        {educations.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
            <GraduationCap className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">등록된 학력이 없습니다</p>
            <button
              type="button"
              onClick={addEducation}
              className="text-xs text-gray-600 font-medium hover:text-gray-700"
            >
              + 학력 추가
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {educations.map((edu, index) => (
              <div key={edu.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    #{index + 1} {edu.school || '새 학력'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div>
                    <label className={labelClass}>
                      <GraduationCap className="w-3 h-3 text-gray-400" />
                      학교명
                    </label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      placeholder="서울대학교"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Award className="w-3 h-3 text-gray-400" />
                      학위
                    </label>
                    <div className="relative">
                      <select
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className={selectClass}
                      >
                        <option value="">선택</option>
                        <option value="고등학교 졸업">고졸</option>
                        <option value="전문학사">전문학사</option>
                        <option value="학사">학사</option>
                        <option value="석사">석사</option>
                        <option value="박사">박사</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      <BookOpen className="w-3 h-3 text-gray-400" />
                      전공
                    </label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      placeholder="컴퓨터공학"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className={labelClass}>입학</label>
                      <input
                        type="text"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="2018"
                        maxLength={4}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>졸업</label>
                      <input
                        type="text"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value.replace(/[^0-9]/g, ''))}
                        disabled={edu.current}
                        placeholder="2022"
                        maxLength={4}
                        className={`${inputClass} disabled:bg-gray-50`}
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={edu.current}
                    onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                  />
                  재학 중
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          돌아가기
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors text-sm"
        >
          저장하기
        </button>
      </div>

      <ValidationModal
        isOpen={showErrors && validateForm().length > 0}
        onClose={() => setShowErrors(false)}
        errors={validateForm()}
      />
    </div>
  );
};

export default Step2Experience;
