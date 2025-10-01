'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Upload, User, Mail, Phone, FileText, Check, AlertCircle, Eye } from 'lucide-react';
import { updateUserProfile } from '@/lib/firebase/userActions';
import PDFImageViewer from '@/components/PDFImageViewer';

export default function QuickOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    headline: '',
    resumeFile: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 파일 크기 검증 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, resumeFile: '파일 크기는 10MB 이하여야 합니다.' });
        return;
      }

      // 파일 형식 검증
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, resumeFile: 'PDF 또는 Word 문서만 업로드 가능합니다.' });
        return;
      }

      setFormData({ ...formData, resumeFile: file });
      setErrors({ ...errors, resumeFile: '' });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = '이름을 입력해주세요';
    }
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^[0-9-+().\s]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요';
    }
    if (!formData.resumeFile) {
      newErrors.resumeFile = '이력서 파일을 업로드해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadResumeToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 업로드 실패');
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error('Resume upload error:', error);
      throw new Error(error.message || '이력서 업로드에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 이력서 파일 업로드
      let resumeFileUrl = '';
      if (formData.resumeFile) {
        resumeFileUrl = await uploadResumeToCloudinary(formData.resumeFile);
        setUploadedResumeUrl(resumeFileUrl); // 미리보기용 URL 저장
      }

      // 2. Firestore에 프로필 저장
      const profileData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        headline: formData.headline || '',
        resumeFileUrl,
        resumeFileName: formData.resumeFile?.name || '',
        resumeUploadedAt: new Date().toISOString(),
        onboardingCompleted: true,
        onboardingType: 'quick',
        userType: 'jobseeker',
        createdAt: new Date().toISOString(),

        // 프로필 완성도 초기값
        profileCompleteness: {
          basicInfo: true,        // 기본 정보 완성
          contactInfo: true,      // 연락처 완성
          resume: true,           // 이력서 업로드 완성
          experience: false,      // 경력 미완성
          education: false,       // 학력 미완성
          skills: false,          // 스킬 미완성
          preferences: false,     // 선호조건 미완성
          completionPercentage: 30  // 30% 완성 (7개 중 3개)
        }
      };

      const result = await updateUserProfile(user.uid, profileData);

      if (result?.success) {
        // 성공 시 대시보드로 이동
        router.push('/jobseeker-dashboard');
      } else {
        throw new Error('프로필 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Quick onboarding error:', error);
      alert(error.message || '프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full text-primary-600 font-medium mb-4">
            <span className="text-sm">빠른 회원가입</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            환영합니다!
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            기본 정보와 이력서만 업로드하면 바로 시작할 수 있어요.<br />
            나머지는 나중에 프로필에서 완성하실 수 있습니다.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="홍길동"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="hong@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="010-1234-5678"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* 한 줄 소개 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                한 줄 소개 <span className="text-gray-400 text-xs">(선택)</span>
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="예: 3년차 프론트엔드 개발자"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* 이력서 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                이력서 업로드 <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                errors.resumeFile ? 'border-red-300 bg-red-50' :
                formData.resumeFile ? 'border-green-300 bg-green-50' :
                'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }`}>
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer"
                >
                  {formData.resumeFile ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex items-center gap-3">
                        <Check className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{formData.resumeFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-primary-600 mt-2">클릭하여 다른 파일 선택</p>
                        </div>
                      </div>
                      {uploadedResumeUrl && formData.resumeFile.type === 'application/pdf' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowPreview(true);
                          }}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          이력서 미리보기
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">
                        클릭하여 이력서 업로드
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF 또는 Word 문서 (최대 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
              {errors.resumeFile && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.resumeFile}
                </p>
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                💡 가입 후 안내
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 가입 완료 후 마이페이지에서 프로필을 더 상세하게 작성할 수 있습니다</li>
                <li>• 경력, 학력, 스킬, 희망 조건 등을 추가하면 더 나은 매칭을 받을 수 있어요</li>
                <li>• 프로필 완성도가 높을수록 기업의 관심도 높아집니다</li>
              </ul>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>프로필 생성 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>가입 완료하기</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* PDF 미리보기 모달 */}
        {showPreview && uploadedResumeUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">이력서 미리보기</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="overflow-auto max-h-[calc(90vh-80px)]">
                <PDFImageViewer
                  pdfUrl={uploadedResumeUrl}
                  fileName={formData.resumeFile?.name || 'Resume'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
