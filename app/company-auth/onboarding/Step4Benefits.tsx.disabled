'use client';

import { useState } from 'react';
import { OnboardingStep4, BenefitItem } from '@/lib/firebase/company-types';
import { saveOnboardingStep4 } from '@/lib/firebase/company-service';
import { 
  Gift, 
  Code, 
  Plus, 
  X, 
  DollarSign,
  TrendingUp,
  Users,
  Home,
  Heart,
  Trophy,
  Briefcase,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Building2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: OnboardingStep4 | null;
  onSave: (data: OnboardingStep4) => void;
  onBack: () => void;
  uid: string;
}

const techStackOptions = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express',
  'Django', 'Spring', 'Ruby on Rails', 'PHP', 'Laravel', '.NET',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Jenkins',
  'Git', 'Jira', 'Slack', 'Figma', 'Adobe XD', 'Sketch'
];

export default function Step4Benefits({ data, onSave, onBack, uid }: Props) {
  const [formData, setFormData] = useState<OnboardingStep4>(data || {
    techStack: [],
    benefits: {
      workEnvironment: [],
      growth: [],
      healthWelfare: [],
      compensation: []
    },
    revenue: '',
    funding: '',
    avgSalary: undefined,
    avgTenure: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [customTech, setCustomTech] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof formData.benefits>('workEnvironment');
  const [benefitInput, setBenefitInput] = useState({ title: '', description: '' });

  const benefitCategories = [
    { key: 'workEnvironment', label: '근무 환경', icon: Home },
    { key: 'growth', label: '성장 지원', icon: TrendingUp },
    { key: 'healthWelfare', label: '건강/복지', icon: Heart },
    { key: 'compensation', label: '보상', icon: Trophy }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.techStack.length === 0) {
      newErrors.techStack = '최소 1개 이상의 기술 스택을 선택해주세요';
    }
    
    const totalBenefits = Object.values(formData.benefits).reduce(
      (acc, category) => acc + category.length, 0
    );
    if (totalBenefits < 3) {
      newErrors.benefits = '최소 3개 이상의 복지를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      // 모든 데이터 저장 (revenue, funding, avgSalary, avgTenure 포함)
      await saveOnboardingStep4(uid, formData);
      onSave(formData);
    } catch (error) {
      console.error('Error saving step 4:', error);
      setErrors({ submit: '저장 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
    setErrors(prev => ({ ...prev, techStack: '' }));
  };

  const addCustomTech = () => {
    if (customTech && !formData.techStack.includes(customTech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, customTech]
      }));
      setCustomTech('');
    }
  };

  const addBenefit = () => {
    if (benefitInput.title && benefitInput.description) {
      setFormData(prev => ({
        ...prev,
        benefits: {
          ...prev.benefits,
          [selectedCategory]: [
            ...(prev.benefits[selectedCategory] || []),
            benefitInput
          ]
        }
      }));
      setBenefitInput({ title: '', description: '' });
      setErrors(prev => ({ ...prev, benefits: '' }));
    }
  };

  const removeBenefit = (category: keyof typeof formData.benefits, index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        [category]: (prev.benefits[category] || []).filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">비즈니스 정보 & 복지</h2>
        <p className="text-gray-600">회사의 비즈니스 정보, 기술 스택, 복지를 입력해주세요</p>
      </div>

      {/* 비즈니스 정보 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">비즈니스 정보</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* 매출 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연간 매출 (선택)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.revenue || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 1,200억원"
              />
            </div>
          </div>

          {/* 투자 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              투자 현황 (선택)
            </label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.funding || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, funding: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: Series C (500억원)"
              />
            </div>
          </div>

          {/* 평균 연봉 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평균 연봉 (만원, 선택)
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={formData.avgSalary || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, avgSalary: Number(e.target.value) }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 6800"
              />
            </div>
          </div>

          {/* 평균 근속 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평균 근속 (년, 선택)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.1"
                value={formData.avgTenure || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, avgTenure: Number(e.target.value) }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="예: 2.8"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 기술 스택 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            기술 스택 <span className="text-red-500">*</span>
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {techStackOptions.map((tech) => (
            <motion.button
              key={tech}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTechStack(tech)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${formData.techStack.includes(tech)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tech}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTech())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="기타 기술을 입력하세요"
          />
          <button
            type="button"
            onClick={addCustomTech}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {errors.techStack && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.techStack}
          </p>
        )}

        {formData.techStack.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">선택된 기술 ({formData.techStack.length}개):</p>
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => toggleTechStack(tech)}
                    className="hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* 복지 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-secondary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            회사 복지 <span className="text-red-500">*</span>
          </h3>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {benefitCategories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key as keyof typeof formData.benefits)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
                ${selectedCategory === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* 복지 입력 */}
        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={benefitInput.title}
            onChange={(e) => setBenefitInput(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="복지 항목 (예: 자율 출퇴근)"
          />
          <input
            type="text"
            value={benefitInput.description}
            onChange={(e) => setBenefitInput(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="상세 설명 (예: 코어타임 10-16시)"
          />
          <button
            type="button"
            onClick={addBenefit}
            disabled={!benefitInput.title || !benefitInput.description}
            className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            복지 추가
          </button>
        </div>

        {errors.benefits && (
          <p className="mb-3 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.benefits}
          </p>
        )}

        {/* 등록된 복지 목록 */}
        <AnimatePresence>
          {Object.entries(formData.benefits).map(([category, items]) => {
            if (items.length === 0) return null;
            const categoryInfo = benefitCategories.find(c => c.key === category);
            const Icon = categoryInfo?.icon || Gift;
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{categoryInfo?.label}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item: BenefitItem, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBenefit(category as keyof typeof formData.benefits, index)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* 팁 박스 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">작성 팁</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 기술 스택은 실제 사용 중인 주요 기술을 모두 포함해주세요</li>
              <li>• 복지는 구체적인 내용과 조건을 명시하면 좋습니다</li>
              <li>• 특별한 복지나 유니크한 문화가 있다면 강조해보세요</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              다음 단계로
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
