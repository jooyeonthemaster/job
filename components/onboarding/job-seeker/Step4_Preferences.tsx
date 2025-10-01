'use client';

import { useState } from 'react';
import { Target, MapPin, DollarSign, Clock, Building } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';

interface Props {
  data?: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const Step4Preferences = ({ data, onSubmit, onBack }: Props) => {
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState({
    desiredPositions: data?.desiredPositions || [],
    preferredLocations: data?.preferredLocations || [],
    salaryRange: data?.salaryRange || { min: '', max: '' },
    workType: data?.workType || '',
    companySize: data?.companySize || '',
    visaSponsorship: data?.visaSponsorship || false,
    remoteWork: data?.remoteWork || '',
    introduction: data?.introduction || ''
  });

  const [positionInput, setPositionInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  const popularPositions = [
    '프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자', 'DevOps 엔지니어',
    'UI/UX 디자이너', '프로덕트 매니저', '데이터 분석가', '마케팅 전문가',
    '영업 담당자', '인사 담당자', '재무 담당자', '기획자'
  ];

  const locations = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주도'
  ];

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addPosition = (position: string) => {
    if (position && !formData.desiredPositions.includes(position)) {
      handleChange('desiredPositions', [...formData.desiredPositions, position]);
    }
    setPositionInput('');
  };

  const removePosition = (position: string) => {
    handleChange('desiredPositions', 
      formData.desiredPositions.filter((p: string) => p !== position)
    );
  };

  const addLocation = (location: string) => {
    if (location && !formData.preferredLocations.includes(location)) {
      handleChange('preferredLocations', [...formData.preferredLocations, location]);
    }
    setLocationInput('');
  };

  const removeLocation = (location: string) => {
    handleChange('preferredLocations', 
      formData.preferredLocations.filter((l: string) => l !== location)
    );
  };

  const validateForm = () => {
    const errors = [];
    
    // 희망 직무 검증
    if (formData.desiredPositions.length === 0) {
      errors.push('최소 1개 이상의 희망 직무를 추가해주세요');
    }
    
    // 희망 근무지 검증
    if (formData.preferredLocations.length === 0) {
      errors.push('최소 1개 이상의 희망 근무지를 추가해주세요');
    }
    
    // 희망 연봉 검증
    if (!formData.salaryRange.min || formData.salaryRange.min === '') {
      errors.push('희망 최소 연봉을 입력해주세요');
    }
    
    // 근무 형태 검증
    if (!formData.workType) {
      errors.push('근무 형태를 선택해주세요 (정규직, 계약직, 프리랜서 등)');
    }
    
    return errors;
  };

  const handleSubmit = () => {
    console.log('Step4: Submit button clicked');
    const errors = validateForm();
    console.log('Step4: Validation errors:', errors);
    
    if (errors.length > 0) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
      console.log('Step4: Calling onSubmit with data:', formData);
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">선호 조건</h2>
        <p className="text-gray-600 mb-8">원하는 근무 조건과 희망 사항을 설정해주세요.</p>
      </div>

      {/* 희망 직무 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Target className="w-5 h-5" />
          희망 직무
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={positionInput}
            onChange={(e) => setPositionInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPosition(positionInput))}
            placeholder="희망하는 직무를 입력하세요"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => addPosition(positionInput)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            추가
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">인기 직무:</p>
          <div className="flex flex-wrap gap-2">
            {popularPositions.map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => addPosition(position)}
                disabled={formData.desiredPositions.includes(position)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.desiredPositions.includes(position)
                    ? 'bg-green-100 text-green-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
                }`}
              >
                {position}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.desiredPositions.map((position: string) => (
            <span
              key={position}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1"
            >
              {position}
              <button
                type="button"
                onClick={() => removePosition(position)}
                className="text-primary-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 희망 근무지 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5" />
          희망 근무지
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation(locationInput))}
            placeholder="희망하는 근무지를 입력하세요"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => addLocation(locationInput)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            추가
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">지역 선택:</p>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => addLocation(location)}
                disabled={formData.preferredLocations.includes(location)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.preferredLocations.includes(location)
                    ? 'bg-green-100 text-green-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.preferredLocations.map((location: string) => (
            <span
              key={location}
              className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm flex items-center gap-1"
            >
              {location}
              <button
                type="button"
                onClick={() => removeLocation(location)}
                className="text-secondary-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 기타 조건 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            희망 연봉 (만원)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={formData.salaryRange.min}
              onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, min: e.target.value })}
              placeholder="3000"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-500">~</span>
            <input
              type="number"
              value={formData.salaryRange.max}
              onChange={(e) => handleChange('salaryRange', { ...formData.salaryRange, max: e.target.value })}
              placeholder="5000"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            고용 형태
          </label>
          <select
            value={formData.workType}
            onChange={(e) => handleChange('workType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">선택하세요</option>
            <option value="정규직">정규직</option>
            <option value="계약직">계약직</option>
            <option value="인턴">인턴</option>
            <option value="프리랜서">프리랜서</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            회사 규모
          </label>
          <select
            value={formData.companySize}
            onChange={(e) => handleChange('companySize', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">선택하세요</option>
            <option value="스타트업">스타트업 (1-50명)</option>
            <option value="중소기업">중소기업 (51-300명)</option>
            <option value="중견기업">중견기업 (301-1000명)</option>
            <option value="대기업">대기업 (1000명 이상)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            재택근무
          </label>
          <select
            value={formData.remoteWork}
            onChange={(e) => handleChange('remoteWork', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">선택하세요</option>
            <option value="불가">재택근무 불가</option>
            <option value="부분">부분 재택근무</option>
            <option value="완전">완전 재택근무</option>
          </select>
        </div>
      </div>

      {/* 비자 후원 */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.visaSponsorship}
            onChange={(e) => handleChange('visaSponsorship', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">비자 후원이 필요합니다</span>
        </label>
      </div>

      {/* 자기소개 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          간단한 자기소개 (선택)
        </label>
        <textarea
          value={formData.introduction}
          onChange={(e) => handleChange('introduction', e.target.value)}
          placeholder="자신의 경험, 강점, 목표 등을 간단히 소개해주세요"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* 완료 안내 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">🎉 거의 완성되었습니다!</h4>
        <p className="text-sm text-green-700">
          모든 정보를 입력하셨다면 완료 버튼을 클릭해주세요. 
          언제든지 프로필을 수정하실 수 있습니다.
        </p>
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
          onClick={handleSubmit}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          온보딩 완료
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

export default Step4Preferences;