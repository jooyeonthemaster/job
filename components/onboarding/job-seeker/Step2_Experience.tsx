'use client';

import { useState } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Plus, 
  X
} from 'lucide-react';
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
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const Step2Experience = ({ data, onNext, onBack }: Props) => {
  const [showErrors, setShowErrors] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>(
    data?.experiences || [
      {
        id: '1',
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }
    ]
  );

  const [educations, setEducations] = useState<Education[]>(
    data?.educations || [
      {
        id: '1',
        school: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
        current: false
      }
    ]
  );

  const addExperience = () => {
    const newId = Date.now().toString();
    setExperiences([
      ...experiences,
      {
        id: newId,
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }
    ]);
  };

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter(exp => exp.id !== id));
    }
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addEducation = () => {
    const newId = Date.now().toString();
    setEducations([
      ...educations,
      {
        id: newId,
        school: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
        current: false
      }
    ]);
  };

  const removeEducation = (id: string) => {
    if (educations.length > 1) {
      setEducations(educations.filter(edu => edu.id !== id));
    }
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setEducations(educations.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const validateForm = () => {
    const errors = [];
    
    // 경력 검증 - 최소 1개 필요
    const hasValidExperience = experiences.some(exp => 
      exp.company.trim() && exp.position.trim() && exp.startDate
    );
    if (!hasValidExperience) {
      errors.push('경력 사항을 최소 1개 이상 입력해주세요 (회사명, 직책, 시작일 필수)');
    }
    
    // 학력 검증 - 최소 1개 필요
    const hasValidEducation = educations.some(edu => 
      edu.school.trim() && edu.degree && edu.field.trim()
    );
    if (!hasValidEducation) {
      errors.push('학력 사항을 최소 1개 이상 입력해주세요 (학교명, 학위, 전공 필수)');
    }
    
    // 개별 경력 항목 검증
    experiences.forEach((exp, index) => {
      if (exp.company || exp.position || exp.startDate || exp.endDate) {
        if (!exp.company.trim()) errors.push(`경력 ${index + 1}번: 회사명을 입력해주세요`);
        if (!exp.position.trim()) errors.push(`경력 ${index + 1}번: 직책을 입력해주세요`);
        if (!exp.startDate) errors.push(`경력 ${index + 1}번: 시작일을 입력해주세요`);
      }
    });
    
    // 개별 학력 항목 검증
    educations.forEach((edu, index) => {
      if (edu.school || edu.degree || edu.field) {
        if (!edu.school.trim()) errors.push(`학력 ${index + 1}번: 학교명을 입력해주세요`);
        if (!edu.degree) errors.push(`학력 ${index + 1}번: 학위를 선택해주세요`);
        if (!edu.field.trim()) errors.push(`학력 ${index + 1}번: 전공을 입력해주세요`);
      }
    });
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
      onNext({ experiences, educations });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">경력 및 학력</h2>
        <p className="text-gray-600 mb-8">경력 사항과 학력을 입력해주세요.</p>
      </div>

      {/* 경력 사항 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            경력 사항
          </h3>
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            경력 추가
          </button>
        </div>

        {experiences.map((experience) => (
          <div key={experience.id} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">경력 {experiences.indexOf(experience) + 1}</h4>
              {experiences.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExperience(experience.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                  placeholder="삼성전자"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직책
                </label>
                <input
                  type="text"
                  value={experience.position}
                  onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                  placeholder="예: 마케팅 매니저, 재무 분석가, 영업 대표, 프로젝트 매니저"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작일
                </label>
                <input
                  type="date"
                  value={experience.startDate}
                  onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료일
                </label>
                <input
                  type="date"
                  value={experience.endDate}
                  onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                  disabled={experience.current}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={experience.current}
                  onChange={(e) => updateExperience(experience.id, 'current', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">현재 재직 중</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업무 설명
              </label>
              <textarea
                value={experience.description}
                onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                placeholder="담당했던 업무나 성과를 간단히 설명해주세요"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 학력 사항 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            학력 사항
          </h3>
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            학력 추가
          </button>
        </div>

        {educations.map((education) => (
          <div key={education.id} className="p-6 border border-gray-200 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">학력 {educations.indexOf(education) + 1}</h4>
              {educations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(education.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학교명
                </label>
                <input
                  type="text"
                  value={education.school}
                  onChange={(e) => updateEducation(education.id, 'school', e.target.value)}
                  placeholder="서울대학교"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학위
                </label>
                <select
                  value={education.degree}
                  onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선택하세요</option>
                  <option value="고등학교 졸업">고등학교 졸업</option>
                  <option value="전문학사">전문학사</option>
                  <option value="학사">학사</option>
                  <option value="석사">석사</option>
                  <option value="박사">박사</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전공
                </label>
                <input
                  type="text"
                  value={education.field}
                  onChange={(e) => updateEducation(education.id, 'field', e.target.value)}
                  placeholder="컴퓨터공학과"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  입학년도
                </label>
                <input
                  type="text"
                  value={education.startYear}
                  onChange={(e) => updateEducation(education.id, 'startYear', e.target.value)}
                  placeholder="2018"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  졸업년도
                </label>
                <input
                  type="text"
                  value={education.endYear}
                  onChange={(e) => updateEducation(education.id, 'endYear', e.target.value)}
                  disabled={education.current}
                  placeholder="2022"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={education.current}
                  onChange={(e) => updateEducation(education.id, 'current', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">재학 중</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          이전 단계로
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 bg-secondary-600 text-white font-medium rounded-xl hover:bg-secondary-700 transition-colors"
        >
          다음 단계로
        </button>
      </div>
      
      {/* Validation Modal */}
      <ValidationModal
        isOpen={showErrors && validateForm().length > 0}
        onClose={() => setShowErrors(false)}
        errors={validateForm()}
      />
    </div>
  );
};

export default Step2Experience;