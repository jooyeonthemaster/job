'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJobForm } from '@/hooks/useJobForm';
import { useJobFormValidation } from '@/hooks/useJobFormValidation';
import { supabase } from '@/lib/supabase/config';
import CompanySelectOrCreate from '@/components/admin/CompanySelectOrCreate';
import JobMetadataForm from '@/components/job-create/metadata/JobMetadataForm';
import JobContentEditor from '@/components/job-create/editor/JobContentEditor';
import JobPreviewModal from '@/components/job-create/JobPreviewModal';
import { ChevronLeft, Save, Eye, Send, Building2 } from 'lucide-react';

interface SelectedCompany {
  id: string;
  name: string;
  name_en?: string;
  logo?: string;
  company_type: string;
  address: string;
}

function AdminJobCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, updateField, resetForm } = useJobForm();

  const [currentStep, setCurrentStep] = useState<'company' | 'metadata' | 'content'>('company');
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const { errors, isValid } = useJobFormValidation(formData, editorContent);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 이메일 기반 관리자 체크 (admin 페이지와 동일)
        const adminEmails = [
          'admin@ssmhr.com',
          'joo.y.oh.ko@gmail.com',
          'nadr110619@gmail.com'
        ];

        if (!adminEmails.includes(user.email || '')) {
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin check error:', error);
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [router]);

  // URL 파라미터에서 회사 정보 자동 로드
  useEffect(() => {
    const loadCompanyFromUrl = async () => {
      const companyId = searchParams.get('companyId');
      const companyName = searchParams.get('companyName');

      if (companyId && companyName && !selectedCompany) {
        try {
          // 회사 정보 조회
          const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

          if (error || !company) {
            console.error('회사 정보 조회 실패:', error);
            return;
          }

          // 자동으로 회사 선택
          setSelectedCompany({
            id: company.id,
            name: company.name,
            name_en: company.name_en,
            logo: company.logo,
            company_type: company.company_type,
            address: company.address,
          });

          // metadata 단계로 이동
          setCurrentStep('metadata');
        } catch (error) {
          console.error('회사 정보 로드 에러:', error);
        }
      }
    };

    if (isAdmin) {
      loadCompanyFromUrl();
    }
  }, [searchParams, isAdmin, selectedCompany]);

  const handleCompanySelect = (companyId: string, companyData: SelectedCompany) => {
    setSelectedCompany(companyData);
    setCurrentStep('metadata'); // 다음 단계로 자동 이동
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSaveDraft = async () => {
    if (!selectedCompany) {
      alert('회사를 선택해주세요.');
      setCurrentStep('company');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('세션이 없습니다. 다시 로그인해주세요.');
      }

      // 관리자용 공고 생성 API 호출
      const response = await fetch('/api/admin/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          formData,
          editorContent,
          isDraft: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '임시저장에 실패했습니다.');
      }

      alert('임시저장이 완료되었습니다.');
      router.push('/admin?tab=jobs');
    } catch (err: any) {
      console.error('Save draft error:', err);
      setError(err.message || '임시저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCompany) {
      alert('회사를 선택해주세요.');
      setCurrentStep('company');
      return;
    }

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
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('세션이 없습니다. 다시 로그인해주세요.');
      }

      // 관리자용 공고 생성 API 호출
      const response = await fetch('/api/admin/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          formData,
          editorContent,
          isDraft: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '공고 등록에 실패했습니다.');
      }

      const result = await response.json();

      alert('채용공고가 등록되었습니다. (관리자 승인 완료 상태)');
      router.push('/admin?tab=jobs');
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <JobPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        editorContent={editorContent}
        companyName={selectedCompany?.name}
        companyLogo={selectedCompany?.logo}
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
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">채용공고 등록 (관리자)</h1>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">ADMIN</span>
                  </div>
                  {selectedCompany ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">선택된 회사:</p>
                      <div className="flex items-center gap-2">
                        {selectedCompany.logo && (
                          <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-5 h-5 rounded object-contain" />
                        )}
                        <span className="text-sm font-medium text-gray-900">{selectedCompany.name}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      모든 회사의 채용공고를 등록할 수 있습니다
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreview}
                  disabled={currentStep === 'company'}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  미리보기
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={loading || !selectedCompany}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <>처리중...</> : <><Save className="w-4 h-4 inline mr-2" />임시저장</>}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedCompany}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? <>처리중...</> : <><Send className="w-4 h-4 inline mr-2" />등록하기</>}
                </button>
              </div>
            </div>

            {/* Step Tabs */}
            <div className="flex items-center gap-4 mt-4 border-b border-gray-200">
              <button
                onClick={() => setCurrentStep('company')}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  currentStep === 'company'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                0. 회사 선택
                {!selectedCompany && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setCurrentStep('metadata')}
                disabled={!selectedCompany}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  currentStep === 'metadata'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                1. 정형 정보 입력
                {errors.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setCurrentStep('content')}
                disabled={!selectedCompany}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  currentStep === 'content'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
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

          {/* 선택된 회사 정보 표시 (Step 1, 2에서만) */}
          {selectedCompany && currentStep !== 'company' && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCompany.logo ? (
                  <img
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{selectedCompany.name}</p>
                  {selectedCompany.name_en && (
                    <p className="text-sm text-gray-600">{selectedCompany.name_en}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentStep('company')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                회사 변경
              </button>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 'company' && (
            <CompanySelectOrCreate
              selectedCompanyId={selectedCompany?.id || null}
              onCompanySelect={handleCompanySelect}
            />
          )}

          {currentStep === 'metadata' && (
            <JobMetadataForm formData={formData} onUpdate={updateField} />
          )}

          {currentStep === 'content' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-secondary-50 to-pink-50 rounded-xl p-6 border-2 border-secondary-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">상세 내용 작성</h2>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  블로그 에디터처럼 자유롭게 작성하세요.
                </p>
              </div>

              <JobContentEditor
                content={editorContent}
                onChange={handleEditorChange}
                placeholder="채용공고 상세 내용을 작성하세요..."
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep !== 'company' && (
              <button
                onClick={() => {
                  if (currentStep === 'content') setCurrentStep('metadata');
                  else if (currentStep === 'metadata') setCurrentStep('company');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4 inline mr-2" />
                이전 단계
              </button>
            )}
            {currentStep === 'company' && <div></div>}
            <button
              onClick={() => {
                if (currentStep === 'company') {
                  if (!selectedCompany) {
                    alert('회사를 선택하거나 생성해주세요.');
                    return;
                  }
                  setCurrentStep('metadata');
                } else if (currentStep === 'metadata') {
                  setCurrentStep('content');
                } else {
                  handleSubmit();
                }
              }}
              disabled={loading || (currentStep === 'company' && !selectedCompany)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ml-auto"
            >
              {currentStep === 'content' ? (
                <>
                  <Send className="w-4 h-4 inline mr-2" />
                  등록하기
                </>
              ) : (
                <>
                  다음 단계
                  <ChevronLeft className="w-4 h-4 inline ml-2 rotate-180" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminJobCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AdminJobCreateContent />
    </Suspense>
  );
}
