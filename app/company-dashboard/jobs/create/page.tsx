'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJobForm } from '@/hooks/useJobForm';
import { useJobFormValidation } from '@/hooks/useJobFormValidation';
import { createJob } from '@/lib/supabase/job-service';
import { supabase } from '@/lib/supabase/config';
import JobMetadataForm from '@/components/job-create/metadata/JobMetadataForm';
import JobContentEditor from '@/components/job-create/editor/JobContentEditor';
import JobPreviewModal from '@/components/job-create/JobPreviewModal';
import { ChevronLeft, Save, Eye, Send } from 'lucide-react';

export default function JobCreatePage() {
  const router = useRouter();
  const { formData, updateField, resetForm } = useJobForm();

  const [editorContent, setEditorContent] = useState<string>('');
  const { errors, isValid } = useJobFormValidation(formData, editorContent);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'metadata' | 'content'>('metadata');
  const [showPreview, setShowPreview] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);

  // 기업 정보 로드
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: company } = await supabase
          .from('companies')
          .select('name, logo')
          .eq('id', user.id)
          .single();

        if (company) {
          setCompanyData(company);
        }
      } catch (error) {
        console.error('Failed to load company data:', error);
      }
    };
    loadCompanyData();
  }, []);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // isDraft: true로 전달하여 draft 상태로 저장
      const result = await createJob(formData, user.id, editorContent, true);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 임시저장 후 목록으로 이동
      alert('임시저장이 완료되었습니다.');
      router.push('/company-dashboard?tab=jobs');
    } catch (err: any) {
      console.error('Save draft error:', err);
      setError(err.message || '임시저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError('필수 항목을 모두 입력해주세요.');
      setCurrentStep('metadata');
      return;
    }

    if (!editorContent.trim()) {
      setError('채용공고 상세 내용을 작성해주세요.');
      setCurrentStep('content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const result = await createJob(formData, user.id, editorContent);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 제출 성공
      alert('채용공고가 등록되었습니다. 관리자 승인 및 결제 확인 후 공고가 활성화됩니다.');
      router.push('/company-dashboard?tab=jobs');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || '채용공고 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <>
      <JobPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        editorContent={editorContent}
        companyName={companyData?.name}
        companyLogo={companyData?.logo}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">채용공고 작성</h1>
                <p className="text-sm text-gray-600 mt-1">
                  정형 데이터와 자유 작성 컨텐츠를 입력하세요
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 inline mr-2" />
                임시저장
              </button>
              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                미리보기
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>처리중...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 inline mr-2" />
                    등록하기
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step Tabs */}
          <div className="flex items-center gap-4 mt-4 border-b border-gray-200">
            <button
              onClick={() => setCurrentStep('metadata')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                currentStep === 'metadata'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1. 정형 정보 입력
              {errors.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setCurrentStep('content')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                currentStep === 'content'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              2. 상세 내용 작성
              {!editorContent.trim() && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm font-medium text-red-600">{error}</p>
            {errors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx} className="text-sm text-red-600">• {err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {currentStep === 'metadata' ? (
          <JobMetadataForm formData={formData} onUpdate={updateField} />
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-secondary-50 to-pink-50 rounded-xl p-6 border-2 border-secondary-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">상세 내용 작성</h2>
              </div>
              <p className="text-sm text-gray-600 ml-11">
                블로그 에디터처럼 자유롭게 작성하세요. 텍스트, 이미지, 표 등을 활용할 수 있습니다.
              </p>
            </div>

            <JobContentEditor
              content={editorContent}
              onChange={handleEditorChange}
              placeholder="채용공고 상세 내용을 작성하세요. 주요 업무, 자격 요건, 복지 혜택 등을 자유롭게 작성할 수 있습니다..."
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          {currentStep === 'content' && (
            <button
              onClick={() => setCurrentStep('metadata')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" />
              이전 단계
            </button>
          )}
          {currentStep === 'metadata' && (
            <div></div>
          )}
          <button
            onClick={() => {
              if (currentStep === 'metadata') {
                setCurrentStep('content');
              } else {
                handleSubmit();
              }
            }}
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ml-auto"
          >
            {currentStep === 'metadata' ? (
              <>
                다음 단계
                <ChevronLeft className="w-4 h-4 inline ml-2 rotate-180" />
              </>
            ) : (
              <>
                <Send className="w-4 h-4 inline mr-2" />
                등록하기
              </>
            )}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
