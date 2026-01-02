'use client';

import { useState } from 'react';
import { Code, Plus, X, Languages, ChevronDown, Check } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';

interface Props {
  data?: {
    skills?: string[];
    koreanLevel?: string;
    otherLanguages?: Array<{ language: string; proficiency: string }>;
  };
  onNext: (data: {
    skills: string[];
    koreanLevel: string;
    otherLanguages: Array<{ language: string; proficiency: string }>;
  }) => void;
  onBack: () => void;
}

// 공통 스타일 - primary(blue) 색상 적용
const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 text-gray-700 text-sm";
const selectClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-700 text-sm appearance-none cursor-pointer";
const labelClass = "flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1";

const Step3Skills = ({ data, onNext, onBack }: Props) => {
  const [skills, setSkills] = useState<string[]>(data?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [koreanLevel, setKoreanLevel] = useState<string>(data?.koreanLevel || '');
  const [otherLanguages, setOtherLanguages] = useState<Array<{ language: string; proficiency: string }>>(
    data?.otherLanguages || [{ language: '', proficiency: '' }]
  );
  const [showErrors, setShowErrors] = useState(false);

  const skillCategories: Record<string, string[]> = {
    '개발/IT': ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Python', 'Java', 'Node.js', 'AWS', 'Docker'],
    '디자인': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX 디자인', '브랜드 디자인'],
    '마케팅': ['SEO/SEM', 'Google Analytics', 'Facebook Ads', '콘텐츠 마케팅', '퍼포먼스 마케팅'],
    '영업/비즈니스': ['B2B 영업', 'B2C 영업', '비즈니스 개발', '파트너십 관리', '협상'],
    '재무/회계': ['SAP', '재무분석', '회계', '세무', 'Excel 고급', '예산관리'],
    '인사/총무': ['채용', '교육/훈련', '성과관리', '급여관리', '노무관리']
  };

  const KOREAN_LEVELS = [
    { value: 'topik1', label: 'TOPIK 1급' },
    { value: 'topik2', label: 'TOPIK 2급' },
    { value: 'topik3', label: 'TOPIK 3급' },
    { value: 'topik4', label: 'TOPIK 4급' },
    { value: 'topik5', label: 'TOPIK 5급' },
    { value: 'topik6', label: 'TOPIK 6급' },
    { value: 'native', label: '모국어 수준' },
    { value: 'none', label: '해당 없음' }
  ];

  const LANGUAGE_OPTIONS = [
    { value: 'english', label: '영어' },
    { value: 'chinese', label: '중국어' },
    { value: 'japanese', label: '일본어' },
    { value: 'spanish', label: '스페인어' },
    { value: 'other', label: '기타' }
  ];

  const PROFICIENCY_LEVELS = [
    { value: 'native', label: '원어민' },
    { value: 'fluent', label: '유창함' },
    { value: 'business', label: '비즈니스' },
    { value: 'intermediate', label: '중급' },
    { value: 'beginner', label: '초급' }
  ];

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addLanguageRow = () => {
    setOtherLanguages([...otherLanguages, { language: '', proficiency: '' }]);
  };

  const removeLanguageRow = (index: number) => {
    setOtherLanguages(otherLanguages.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, field: 'language' | 'proficiency', value: string) => {
    const updated = otherLanguages.map((lang, i) =>
      i === index ? { ...lang, [field]: value } : lang
    );
    setOtherLanguages(updated);
  };

  const validateForm = () => {
    const errors = [];
    if (skills.length === 0) {
      errors.push('최소 1개 이상의 기술/역량을 추가해주세요');
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
      onNext({
        skills,
        koreanLevel,
        otherLanguages: otherLanguages.filter(lang => lang.language && lang.proficiency)
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
          <Code className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">스킬 및 언어</h2>
          <p className="text-sm text-gray-500">보유하신 전문 기술과 언어 능력을 알려주세요</p>
        </div>
      </div>

      {/* 전문 기술 섹션 */}
      <div className="bg-primary-50/50 border border-primary-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-primary-500" />
            전문 기술 <span className="text-red-500">*</span>
          </h3>
          {skills.length > 0 && (
            <span className="text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
              {skills.length}개 선택
            </span>
          )}
        </div>

        {/* 스킬 입력 */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
            placeholder="보유하신 기술을 입력하세요"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => addSkill(skillInput)}
            className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 카테고리 선택 */}
        <div className="relative mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${selectClass} text-xs`}
          >
            <option value="">카테고리에서 빠르게 선택</option>
            {Object.keys(skillCategories).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {selectedCategory && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skillCategories[selectedCategory].map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                disabled={skills.includes(skill)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  skills.includes(skill)
                    ? 'bg-primary-100 text-primary-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
                }`}
              >
                {skill}
                {skills.includes(skill) && <Check className="inline w-3 h-3 ml-0.5" />}
              </button>
            ))}
          </div>
        )}

        {/* 선택된 스킬 */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white text-primary-700 rounded text-xs font-medium border border-primary-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="p-0.5 hover:bg-primary-100 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 언어 능력 섹션 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
          <Languages className="w-4 h-4 text-gray-500" />
          언어 능력 <span className="text-xs text-gray-400 font-normal">(선택)</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 한국어 능력 */}
          <div>
            <label className={labelClass}>
              🇰🇷 한국어 능력
            </label>
            <div className="relative">
              <select
                value={koreanLevel}
                onChange={(e) => setKoreanLevel(e.target.value)}
                className={selectClass}
              >
                <option value="">선택하세요</option>
                {KOREAN_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 기타 언어 */}
          <div>
            <label className={labelClass}>🌍 기타 언어</label>
            <div className="space-y-2">
              {otherLanguages.map((lang, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 relative">
                    <select
                      value={lang.language}
                      onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                      className={`${selectClass} text-xs`}
                    >
                      <option value="">언어</option>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="flex-1 relative">
                    <select
                      value={lang.proficiency}
                      onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                      className={`${selectClass} text-xs`}
                    >
                      <option value="">숙련도</option>
                      {PROFICIENCY_LEVELS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  </div>
                  {otherLanguages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLanguageRow(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLanguageRow}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus className="w-3 h-3" />
                언어 추가
              </button>
            </div>
          </div>
        </div>
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

export default Step3Skills;
