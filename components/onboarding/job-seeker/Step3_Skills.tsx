'use client';

import { useState } from 'react';
import { Code, Plus, X } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';

interface Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const Step3Skills = ({ data, onNext, onBack }: Props) => {
  const [skills, setSkills] = useState<string[]>(data?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [koreanLevel, setKoreanLevel] = useState<string>(data?.koreanLevel || '');
  const [otherLanguages, setOtherLanguages] = useState<Array<{ language: string; proficiency: string }>>(
    data?.otherLanguages || [{ language: '', proficiency: '' }]
  );
  const [showErrors, setShowErrors] = useState(false);

  const skillCategories = {
    '개발/IT': [
      'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Python', 'Java',
      'Node.js', 'Spring', 'Django', 'AWS', 'Docker', 'Kubernetes'
    ],
    '디자인': [
      'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch',
      'UI/UX 디자인', '3D 모델링', '브랜드 디자인', '모션그래픽'
    ],
    '마케팅/광고': [
      'SEO/SEM', 'Google Analytics', 'Facebook Ads', '콘텐츠 마케팅',
      '브랜드 전략', 'CRM', '퍼포먼스 마케팅', '인플루언서 마케팅'
    ],
    '영업/비즈니스': [
      'B2B 영업', 'B2C 영업', '비즈니스 개발', '파트너십 관리',
      'CRM 관리', '제안서 작성', '협상', '계약 관리'
    ],
    '재무/회계': [
      'SAP', '재무분석', '회계', '세무', '감사', 'Excel 고급',
      '재무제표 작성', '원가계산', '예산관리', '투자분석'
    ],
    '인사/총무': [
      '채용', '교육/훈련', '성과관리', '급여관리', '노무관리',
      '조직문화', 'HR Analytics', '복리후생 설계'
    ],
    '의료/바이오': [
      '임상시험', 'GMP', '의료기기', '제약', '생명공학',
      '간호', '의료 데이터 분석', '의료 품질관리'
    ],
    '제조/생산': [
      'AutoCAD', 'SolidWorks', '품질관리', '생산관리', 'Six Sigma',
      'Lean 제조', '공정설계', 'PLC 프로그래밍'
    ],
    '물류/유통': [
      'SCM', 'WMS', '재고관리', '물류최적화', '수출입관리',
      '화물운송', '창고관리', '국제물류'
    ],
    '교육': [
      '교육과정 개발', '온라인 교육', '교수법', '학습평가',
      'LMS 관리', '교육 콘텐츠 제작', 'e-러닝'
    ],
    '법무/컴플라이언스': [
      '계약검토', '법률자문', '컴플라이언스', '지적재산권',
      '소송관리', '법률 리서치', '규제대응'
    ],
    '미디어/콘텐츠': [
      '영상편집', '콘텐츠 기획', '취재/보도', '방송제작',
      'Premier Pro', 'After Effects', '스토리텔링'
    ]
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
    { value: 'french', label: '프랑스어' },
    { value: 'german', label: '독일어' },
    { value: 'russian', label: '러시아어' },
    { value: 'arabic', label: '아랍어' },
    { value: 'vietnamese', label: '베트남어' },
    { value: 'thai', label: '태국어' },
    { value: 'indonesian', label: '인도네시아어' },
    { value: 'hindi', label: '힌디어' },
    { value: 'portuguese', label: '포르투갈어' },
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

    if (!koreanLevel) {
      errors.push('한국어 능력을 선택해주세요');
    }

    const hasValidLanguage = otherLanguages.some(lang => lang.language && lang.proficiency);
    if (!hasValidLanguage) {
      errors.push('최소 1개 이상의 언어와 숙련도를 선택해주세요');
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">스킬 및 언어</h2>
        <p className="text-gray-600 mb-8">보유하신 기술 스킬과 언어 능력을 입력해주세요.</p>
      </div>

      {/* 기술 스킬 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Code className="w-5 h-5" />
            전문 기술 및 역량
          </h3>
          
          {/* 스킬 입력 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
              placeholder="보유하신 전문 기술이나 역량을 입력하세요"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => addSkill(skillInput)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              추가
            </button>
          </div>

          {/* 카테고리 선택 및 스킬 추천 */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">직무 카테고리를 선택하세요:</p>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">카테고리를 선택하세요</option>
              {Object.keys(skillCategories).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            {selectedCategory && (
              <div>
                <p className="text-sm text-gray-600 mb-2">{selectedCategory} 분야 추천 스킬:</p>
                <div className="flex flex-wrap gap-2">
                  {skillCategories[selectedCategory as keyof typeof skillCategories].map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      disabled={skills.includes(skill)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        skills.includes(skill)
                          ? 'bg-green-100 text-green-600 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
                      }`}
                    >
                      {skill}
                      {skills.includes(skill) && <span className="ml-1">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 선택된 스킬 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              선택된 전문 기술 ({skills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-primary-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 언어 능력 */}
      <div className="border-b pb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">언어 능력</h3>

        {/* 한국어 능력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            한국어 능력 <span className="text-red-500">*</span>
          </label>
          <select
            value={koreanLevel}
            onChange={(e) => setKoreanLevel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">선택하세요</option>
            {KOREAN_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* 한국어 외 언어 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            한국어 외 구사 가능 언어 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {otherLanguages.map((lang, index) => (
              <div key={index} className="flex gap-3">
                <select
                  value={lang.language}
                  onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">언어 선택</option>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">숙련도 선택</option>
                  {PROFICIENCY_LEVELS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {otherLanguages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLanguageRow(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLanguageRow}
              className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              언어 추가
            </button>
          </div>
        </div>
      </div>

      {/* 팁 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 작성 팁</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 실제로 업무에 활용 가능한 수준의 기술과 역량만 추가해주세요</li>
          <li>• 언어의 경우 기본적인 의사소통이 가능한 수준부터 추가해주세요</li>
          <li>• 관련 자격증이나 수료증이 있다면 더욱 도움이 됩니다</li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          돌아가기
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          저장
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

export default Step3Skills;