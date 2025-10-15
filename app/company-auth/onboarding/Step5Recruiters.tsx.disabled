'use client';

import { useState, useEffect } from 'react';
import { OnboardingStep5 } from '@/lib/firebase/company-types';
import { saveOnboardingStep5, getCompanyProfile, updateCompanyProfile } from '@/lib/firebase/company-service';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { 
  Users, 
  Plus, 
  X, 
  Upload, 
  Check,
  Phone,
  Mail,
  User,
  Briefcase,
  AlertCircle,
  Image,
  Building2,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: OnboardingStep5 | null;
  onSave: (data: OnboardingStep5) => void;
  onBack: () => void;
  uid: string;
}

interface Recruiter {
  name: string;
  position: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isPrimary: boolean;
}

export default function Step5Recruiters({ data, onSave, onBack, uid }: Props) {
  const [formData, setFormData] = useState<OnboardingStep5>(data || {
    recruiters: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentRecruiter, setCurrentRecruiter] = useState<Recruiter>({
    name: '',
    position: '',
    email: '',
    phone: '',
    isPrimary: false
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // 기존 로고 불러오기
  useEffect(() => {
    const loadExistingLogo = async () => {
      try {
        const profile = await getCompanyProfile(uid);
        if (profile?.logo) {
          setLogoPreview(profile.logo);
        }
      } catch (error) {
        console.error('Failed to load existing logo:', error);
      }
    };
    
    loadExistingLogo();
  }, [uid]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.recruiters.length === 0) {
      newErrors.recruiters = '최소 1명의 채용 담당자를 등록해주세요';
    }
    
    const hasPrimary = formData.recruiters.some(r => r.isPrimary);
    if (formData.recruiters.length > 0 && !hasPrimary) {
      newErrors.primary = '주 담당자를 지정해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRecruiter = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentRecruiter.name) newErrors.recruiterName = '이름을 입력해주세요';
    if (!currentRecruiter.position) newErrors.recruiterPosition = '직책을 입력해주세요';
    if (!currentRecruiter.email) {
      newErrors.recruiterEmail = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentRecruiter.email)) {
      newErrors.recruiterEmail = '올바른 이메일 형식이 아닙니다';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const addRecruiter = () => {
    if (!validateRecruiter()) return;
    
    const newRecruiter = { ...currentRecruiter };
    if (formData.recruiters.length === 0) {
      newRecruiter.isPrimary = true;
    }
    
    setFormData(prev => ({
      ...prev,
      recruiters: [...prev.recruiters, newRecruiter]
    }));
    
    setCurrentRecruiter({
      name: '',
      position: '',
      email: '',
      phone: '',
      isPrimary: false
    });
    
    setErrors({});
  };

  const removeRecruiter = (index: number) => {
    const wasPrimary = formData.recruiters[index].isPrimary;
    const newRecruiters = formData.recruiters.filter((_, i) => i !== index);
    
    // 만약 주 담당자를 삭제했고 다른 담당자가 있다면 첫 번째를 주 담당자로
    if (wasPrimary && newRecruiters.length > 0) {
      newRecruiters[0].isPrimary = true;
    }
    
    setFormData(prev => ({
      ...prev,
      recruiters: newRecruiters
    }));
  };

  const setPrimaryRecruiter = (index: number) => {
    const newRecruiters = formData.recruiters.map((r, i) => ({
      ...r,
      isPrimary: i === index
    }));
    
    setFormData(prev => ({
      ...prev,
      recruiters: newRecruiters
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ logo: '파일 크기는 5MB 이하여야 합니다.' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setLogoFile(file);
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // 로고 파일 업로드
      if (logoFile) {
        const uploadResult = await uploadToCloudinary(logoFile, 'logo', uid);
        
        if (uploadResult.success && uploadResult.url) {
          // 회사 프로필에 로고 URL 저장
          await updateCompanyProfile(uid, { logo: uploadResult.url });
        } else {
          setErrors({ logo: uploadResult.error || '로고 업로드에 실패했습니다.' });
          setLoading(false);
          return;
        }
      }
      
      await saveOnboardingStep5(uid, formData);
      onSave(formData);
    } catch (error) {
      console.error('Error saving step 5:', error);
      setErrors({ submit: '저장 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">채용 담당자 & 로고</h2>
        <p className="text-gray-600">채용 담당자 정보와 회사 로고를 등록해주세요</p>
      </div>

      {/* 회사 로고 업로드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">회사 로고</h3>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            {logoPreview ? (
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-purple-200">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <label 
              htmlFor="logo-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>로고 업로드</span>
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              권장: PNG, JPG 형식, 1:1 비율, 5MB 이하
            </p>
            {errors.logo && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.logo}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 채용 담당자 등록 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            채용 담당자 <span className="text-red-500">*</span>
          </h3>
        </div>

        {/* 담당자 입력 폼 */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={currentRecruiter.name}
                onChange={(e) => {
                  setCurrentRecruiter(prev => ({ ...prev, name: e.target.value }));
                  setErrors(prev => ({ ...prev, recruiterName: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.recruiterName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="홍길동"
              />
            </div>
            {errors.recruiterName && (
              <p className="mt-1 text-sm text-red-500">{errors.recruiterName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직책 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={currentRecruiter.position}
                onChange={(e) => {
                  setCurrentRecruiter(prev => ({ ...prev, position: e.target.value }));
                  setErrors(prev => ({ ...prev, recruiterPosition: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.recruiterPosition ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="인사팀장"
              />
            </div>
            {errors.recruiterPosition && (
              <p className="mt-1 text-sm text-red-500">{errors.recruiterPosition}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={currentRecruiter.email}
                onChange={(e) => {
                  setCurrentRecruiter(prev => ({ ...prev, email: e.target.value }));
                  setErrors(prev => ({ ...prev, recruiterEmail: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.recruiterEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="hr@company.com"
              />
            </div>
            {errors.recruiterEmail && (
              <p className="mt-1 text-sm text-red-500">{errors.recruiterEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 (선택)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={currentRecruiter.phone || ''}
                onChange={(e) => setCurrentRecruiter(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="010-1234-5678"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={addRecruiter}
          className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          담당자 추가
        </button>

        {(errors.recruiters || errors.primary) && (
          <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.recruiters || errors.primary}
          </p>
        )}

        {/* 등록된 담당자 목록 */}
        <AnimatePresence>
          {formData.recruiters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <p className="text-sm font-medium text-gray-700">
                등록된 담당자 ({formData.recruiters.length}명)
              </p>
              {formData.recruiters.map((recruiter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-start justify-between p-4 rounded-lg border
                    ${recruiter.isPrimary 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">{recruiter.name}</span>
                      <span className="text-sm text-gray-600">{recruiter.position}</span>
                      {recruiter.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          주 담당자
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{recruiter.email}</p>
                      {recruiter.phone && (
                        <p className="text-sm text-gray-600">{recruiter.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!recruiter.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryRecruiter(index)}
                        className="p-2 text-gray-500 hover:bg-white rounded-lg transition-colors"
                        title="주 담당자로 설정"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeRecruiter(index)}
                      className="p-2 text-red-500 hover:bg-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 팁 박스 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">작성 팁</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 주 담당자는 구직자들의 철 문의 창구가 됩니다</li>
              <li>• 여러 명의 담당자를 등록하면 빠른 응대가 가능합니다</li>
              <li>• 명확한 로고는 회사의 신뢰도를 높여줍니다</li>
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
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              완료 처리 중...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              완료하고 대시보드로
            </>
          )}
        </button>
      </div>
    </form>
  );
}
