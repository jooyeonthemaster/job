'use client';

import { useState } from 'react';
import { Target, MapPin, DollarSign, Building, Briefcase, Home, ChevronDown, Check, X, Plus, Plane } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';

interface Props {
  data?: {
    desired_job_category?: string;
    desiredPositions?: string[];
    preferredLocations?: string[];
    salaryRange?: { min: string; max: string };
    workType?: string;
    companySize?: string;
    visaSponsorship?: boolean;
    remoteWork?: string;
  };
  onSubmit: (data: {
    desiredJobCategory: string;
    desiredPositions: string[];
    preferredLocations: string[];
    salaryRange: { min: string; max: string };
    workType: string;
    companySize: string;
    visaSponsorship: boolean;
    remoteWork: string;
  }) => void;
  onBack: () => void;
}

// 공통 스타일 - primary(blue) 색상 적용
const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 text-gray-700 text-sm";
const selectClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-700 text-sm appearance-none cursor-pointer";
const labelClass = "flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1";

const Step4Preferences = ({ data, onSubmit, onBack }: Props) => {
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState({
    desiredJobCategory: data?.desired_job_category || '',
    desiredPositions: data?.desiredPositions || [],
    preferredLocations: data?.preferredLocations || [],
    salaryRange: data?.salaryRange || { min: '', max: '' },
    workType: data?.workType || '',
    companySize: data?.companySize || '',
    visaSponsorship: data?.visaSponsorship || false,
    remoteWork: data?.remoteWork || ''
  });

  const [positionInput, setPositionInput] = useState('');

  const popularPositions = [
    '프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자', 'DevOps 엔지니어',
    'UI/UX 디자이너', '프로덕트 매니저', '데이터 분석가', '마케팅 전문가'
  ];

  const locations = [
    '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '제주'
  ];

  const handleChange = (field: string, value: string | boolean | string[] | { min: string; max: string }) => {
    setFormData({ ...formData, [field]: value });
  };

  const addPosition = (position: string) => {
    if (position && !formData.desiredPositions.includes(position)) {
      handleChange('desiredPositions', [...formData.desiredPositions, position]);
    }
    setPositionInput('');
  };

  const removePosition = (position: string) => {
    handleChange('desiredPositions', formData.desiredPositions.filter((p: string) => p !== position));
  };

  const toggleLocation = (location: string) => {
    if (formData.preferredLocations.includes(location)) {
      handleChange('preferredLocations', formData.preferredLocations.filter((l: string) => l !== location));
    } else {
      handleChange('preferredLocations', [...formData.preferredLocations, location]);
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.desiredJobCategory) errors.push('희망 직군을 선택해주세요');
    if (formData.desiredPositions.length === 0) errors.push('최소 1개 이상의 희망 직무를 추가해주세요');
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">선호 조건</h2>
          <p className="text-sm text-gray-500">원하는 근무 조건을 설정해주세요</p>
        </div>
      </div>

      {/* 희망 직군/직무 섹션 */}
      <div className="bg-primary-50/50 border border-primary-100 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
          <Briefcase className="w-4 h-4 text-primary-500" />
          희망 직군 및 직무 <span className="text-red-500">*</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 희망 직군 */}
          <div>
            <label className={labelClass}>
              <Building className="w-3.5 h-3.5 text-primary-500" />
              희망 직군 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.desiredJobCategory}
                onChange={(e) => handleChange('desiredJobCategory', e.target.value)}
                className={selectClass}
              >
                <option value="">선택하세요</option>
                <option value="개발">개발</option>
                <option value="디자인">디자인</option>
                <option value="마케팅">마케팅</option>
                <option value="영업">영업</option>
                <option value="경영/기획">경영/기획</option>
                <option value="재무/회계">재무/회계</option>
                <option value="인사/총무">인사/총무</option>
                <option value="기타">기타</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 희망 직무 입력 */}
          <div>
            <label className={labelClass}>
              <Target className="w-3.5 h-3.5 text-primary-500" />
              희망 직무 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPosition(positionInput))}
                placeholder="직무 입력"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => addPosition(positionInput)}
                className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 인기 직무 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {popularPositions.map((position) => (
            <button
              key={position}
              type="button"
              onClick={() => addPosition(position)}
              disabled={formData.desiredPositions.includes(position)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                formData.desiredPositions.includes(position)
                  ? 'bg-primary-100 text-primary-600 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
              }`}
            >
              {position}
              {formData.desiredPositions.includes(position) && <Check className="inline w-3 h-3 ml-0.5" />}
            </button>
          ))}
        </div>

        {/* 선택된 직무 */}
        {formData.desiredPositions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {formData.desiredPositions.map((position: string) => (
              <span
                key={position}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white text-primary-700 rounded text-xs font-medium border border-primary-200"
              >
                {position}
                <button
                  type="button"
                  onClick={() => removePosition(position)}
                  className="p-0.5 hover:bg-primary-100 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 희망 근무지 + 기타 조건 - 한 섹션에 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          근무 조건 <span className="text-xs text-gray-400 font-normal">(선택)</span>
        </h3>

        {/* 희망 근무지 */}
        <div className="mb-3">
          <label className={labelClass}>희망 근무지</label>
          <div className="flex flex-wrap gap-1.5">
            {locations.map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => toggleLocation(location)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  formData.preferredLocations.includes(location)
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* 기타 조건 그리드 */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {/* 희망 연봉 */}
          <div>
            <label className={labelClass}>
              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
              희망 연봉(만원)
            </label>
            <div className="flex gap-1 items-center">
              <input
                type="number"
                value={formData.salaryRange.min}
                onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, min: e.target.value })}
                placeholder="3000"
                className={`${inputClass} text-xs`}
              />
              <span className="text-gray-400 text-xs">~</span>
              <input
                type="number"
                value={formData.salaryRange.max}
                onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, max: e.target.value })}
                placeholder="5000"
                className={`${inputClass} text-xs`}
              />
            </div>
          </div>

          {/* 고용 형태 */}
          <div>
            <label className={labelClass}>
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              고용 형태
            </label>
            <div className="relative">
              <select
                value={formData.workType}
                onChange={(e) => handleChange('workType', e.target.value)}
                className={`${selectClass} text-xs`}
              >
                <option value="">선택</option>
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="인턴">인턴</option>
                <option value="프리랜서">프리랜서</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 회사 규모 */}
          <div>
            <label className={labelClass}>
              <Building className="w-3.5 h-3.5 text-gray-400" />
              회사 규모
            </label>
            <div className="relative">
              <select
                value={formData.companySize}
                onChange={(e) => handleChange('companySize', e.target.value)}
                className={`${selectClass} text-xs`}
              >
                <option value="">선택</option>
                <option value="스타트업">스타트업</option>
                <option value="중소기업">중소기업</option>
                <option value="중견기업">중견기업</option>
                <option value="대기업">대기업</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 재택근무 */}
          <div>
            <label className={labelClass}>
              <Home className="w-3.5 h-3.5 text-gray-400" />
              재택근무
            </label>
            <div className="relative">
              <select
                value={formData.remoteWork}
                onChange={(e) => handleChange('remoteWork', e.target.value)}
                className={`${selectClass} text-xs`}
              >
                <option value="">선택</option>
                <option value="불가">불가</option>
                <option value="부분">부분 재택</option>
                <option value="완전">완전 재택</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 비자 후원 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            formData.visaSponsorship
              ? 'bg-primary-500 border-primary-500'
              : 'border-gray-300 hover:border-primary-400'
          }`}>
            {formData.visaSponsorship && <Check className="w-3 h-3 text-white" />}
          </div>
          <input
            type="checkbox"
            checked={formData.visaSponsorship}
            onChange={(e) => handleChange('visaSponsorship', e.target.checked)}
            className="hidden"
          />
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <Plane className="w-4 h-4 text-primary-500" />
            비자 후원이 필요합니다
          </span>
        </label>
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
          onClick={handleSubmit}
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

export default Step4Preferences;
