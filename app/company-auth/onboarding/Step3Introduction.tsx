'use client';

import { useState } from 'react';
import { OnboardingStep3 } from '@/lib/firebase/company-types';
import { saveOnboardingStep3 } from '@/lib/firebase/company-service';
import { 
  FileText, 
  Target, 
  Heart, 
  Sparkles, 
  MessageCircle,
  AlertCircle,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import CustomCloudinaryUpload from '@/components/CustomCloudinaryUpload';

interface Props {
  data: OnboardingStep3 | null;
  onSave: (data: OnboardingStep3) => void;
  onBack: () => void;
  uid: string;
}

export default function Step3Introduction({ data, onSave, onBack, uid }: Props) {
  const [formData, setFormData] = useState<OnboardingStep3>(data || {
    description: '',
    slogan: '',
    vision: '',
    mission: '',
    logo: '',
    bannerImage: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description || formData.description.length < 50) {
      newErrors.description = '회사 소개는 최소 50자 이상 입력해주세요';
    }
    if (!formData.vision || formData.vision.length < 10) {
      newErrors.vision = '비전을 10자 이상 입력해주세요';
    }
    if (!formData.mission || formData.mission.length < 10) {
      newErrors.mission = '미션을 10자 이상 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await saveOnboardingStep3(uid, formData);
      onSave(formData);
    } catch (error) {
      console.error('Error saving step 3:', error);
      setErrors({ submit: '저장 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OnboardingStep3, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const placeholders = {
    slogan: '예: "혁신과 도전으로 미래를 선도합니다"',
    vision: '예: "글로벌 No.1 기술 기업으로 도약하여 인류의 삶의 질 향상에 기여한다"',
    mission: '예: "최고의 제품과 서비스로 고객에게 새로운 가치를 제공하고 지속 가능한 성장을 추구한다"',
    description: '예: "저희 회사는 2015년 설립 이래 혁신적인 기술과 창의적인 솔루션으로 업계를 선도하고 있습니다. 고객 중심의 가치를 추구하며, 직원들의 성장과 워라밸을 중시하는 기업 문화를 가지고 있습니다..."'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">회사 소개</h2>
        <p className="text-gray-600">회사의 비전, 미션, 그리고 소개를 작성해주세요</p>
      </div>

      {/* 슬로건 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <MessageCircle className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              슬로건 (선택)
            </label>
            <input
              type="text"
              value={formData.slogan || ''}
              onChange={(e) => handleChange('slogan', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={placeholders.slogan}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              회사를 한 문장으로 표현하는 캐치프레이즈
            </p>
          </div>
        </div>
      </motion.div>

      {/* 비전 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
            <Target className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              비전 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none
                ${errors.vision ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={placeholders.vision}
              rows={3}
              maxLength={300}
            />
            {errors.vision && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.vision}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              회사가 추구하는 미래의 모습 ({formData.vision?.length || 0}/300)
            </p>
          </div>
        </div>
      </motion.div>

      {/* 미션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg">
            <Heart className="w-6 h-6 text-secondary-600" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              미션 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none
                ${errors.mission ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={placeholders.mission}
              rows={3}
              maxLength={300}
            />
            {errors.mission && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.mission}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              회사의 존재 이유와 목적 ({formData.mission?.length || 0}/300)
            </p>
          </div>
        </div>
      </motion.div>

      {/* 회사 소개 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              회사 소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none
                ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={placeholders.description}
              rows={6}
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              회사의 역사, 문화, 강점 등을 자유롭게 소개해주세요 ({formData.description?.length || 0}/1000)
            </p>
          </div>
        </div>
      </motion.div>

      {/* 로고 업로드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
            <ImageIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              회사 로고 (선택)
            </h3>
            <CustomCloudinaryUpload
              type="logo"
              currentImageUrl={formData.logo}
              onUploadSuccess={(url) => handleChange('logo', url)}
              userId={uid}
            />
          </div>
        </div>
      </motion.div>

      {/* 배너 이미지 업로드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg">
            <ImageIcon className="w-6 h-6 text-secondary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              배너 이미지 (선택)
            </h3>
            <CustomCloudinaryUpload
              type="banner"
              currentImageUrl={formData.bannerImage}
              onUploadSuccess={(url) => handleChange('bannerImage', url)}
              userId={uid}
            />
          </div>
        </div>
      </motion.div>

      {/* 팁 박스 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">작성 팁</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 비전과 미션은 구직자들에게 회사의 방향성을 명확히 전달합니다</li>
              <li>• 구체적이고 진정성 있는 내용이 구직자들의 공감을 얻습니다</li>
              <li>• 회사만의 독특한 문화나 강점을 강조해보세요</li>
              <li>• 로고는 투명 배경 PNG를 권장하며, 배너는 가로가 긴 이미지가 좋습니다</li>
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
