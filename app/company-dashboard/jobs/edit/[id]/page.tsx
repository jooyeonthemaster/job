'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useJobForm } from '@/hooks/useJobForm';
import { useJobFormValidation } from '@/hooks/useJobFormValidation';
import { getJob, updateJob } from '@/lib/supabase/job-service';
import { supabase } from '@/lib/supabase/config';
import JobMetadataForm from '@/components/job-create/metadata/JobMetadataForm';
import JobContentEditor from '@/components/job-create/editor/JobContentEditor';
import JobPreviewModal from '@/components/job-create/JobPreviewModal';
import { ChevronLeft, Save, Eye, Send } from 'lucide-react';
import { JobFormData } from '@/types/job-form.types';

const pickSingle = <T,>(relation: T | T[] | null | undefined): T | null => {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0] ?? null : relation;
};

export default function JobEditPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const { formData, updateField, resetForm, setFormDataBulk } = useJobForm();
  
  // State 먼저 선언
  const [editorContent, setEditorContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'metadata' | 'content'>('metadata');
  const [showPreview, setShowPreview] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<string>('draft');
  
  // 그 다음 validation (editorContent 사용)
  const { errors, isValid } = useJobFormValidation(formData, editorContent);

  // 기존 공고 데이터 로드
  useEffect(() => {
    const loadJobData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 기업 정보 로드
        const { data: company } = await supabase
          .from('companies')
          .select('name, logo')
          .eq('id', user.id)
          .single();

        if (company) {
          setCompanyData(company);
        }

        // 공고 정보 로드
        const result = await getJob(jobId);
        
        if (!result.success || !result.job) {
          throw new Error(result.error || '공고를 찾을 수 없습니다.');
        }

        const job = result.job;

        // 공고 상태 저장
        setJobStatus(job.status || 'draft');

        // 근무 조건 및 담당자 정보 추출 (PostgREST가 객체/배열 모두 반환할 수 있으므로 안전하게 처리)
        const workConditions = pickSingle(job.job_work_conditions);
        const manager = pickSingle(job.job_manager);

        // 폼 데이터 일괄 설정
        setFormDataBulk({
          title: job.title || '',
          titleEn: job.title_en || '',
          department: job.department || '',
          location: job.location || '',
          employmentType: job.employment_type || 'FULL_TIME',
          experienceLevel: job.experience_level || 'MID',
          deadline: job.deadline || '',
          salaryMin: job.salary_min?.toString() || '',
          salaryMax: job.salary_max?.toString() || '',
          salaryNegotiable: job.salary_negotiable ?? true,

          // ✨ JD, 경력 사항, 스킬 (신규 추가)
          jobDescription: job.job_description || '',
          requiredExperience: job.required_experience || '',
          requiredSkills: job.required_skills || [],

          visaSponsorship: job.visa_sponsorship ?? true,
          koreanLevel: job.korean_level || 'INTERMEDIATE',
          englishLevel: job.english_level || 'FLUENT',
          postingTier: job.posting_tier || 'standard',
          probation: workConditions?.probation || '3개월',
          workHours: workConditions?.work_hours || '',
          startDate: workConditions?.start_date || '즉시 가능',
          managerName: manager?.name || '',
          managerPosition: manager?.position || '',
          managerEmail: manager?.email || '',
          managerPhone: manager?.phone || '',
        });

        // 에디터 컨텐츠
        setEditorContent(job.description || '');

      } catch (err: any) {
        console.error('Failed to load job:', err);
        setError(err.message || '공고를 불러오는데 실패했습니다.');
      } finally {
        setFetchLoading(false);
      }
    };

    loadJobData();
  }, [jobId]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const result = await updateJob(jobId, formData, editorContent);

      if (!result.success) {
        throw new Error(result.error);
      }

      alert('공고가 수정되었습니다.');
      router.push('/company-dashboard?tab=jobs');
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || '공고 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSubmitForApproval = async () => {
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

      // 먼저 업데이트
      const result = await updateJob(jobId, formData, editorContent);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 그 다음 상태를 pending_approval로 변경
      const { error: statusError } = await supabase
        .from('jobs')
        .update({ 
          status: 'pending_approval',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (statusError) {
        throw new Error(statusError.message);
      }

      alert('채용공고가 등록되었습니다. 관리자 승인 및 결제 확인 후 공고가 활성화됩니다.');
      router.push('/company-dashboard?tab=jobs');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || '채용공고 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">공고를 불러오는 중...</p>
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
                  <h1 className="text-2xl font-bold text-gray-900">채용공고 수정</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    공고 정보를 수정하세요
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  미리보기
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>처리중...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-2" />
                      저장하기
                    </>
                  )}
                </button>
                {jobStatus === 'draft' && (
                  <button
                    onClick={handleSubmitForApproval}
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <>처리중...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 inline mr-2" />
                        등록 신청하기
                      </>
                    )}
                  </button>
                )}
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
                1. 정형 정보 수정
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
                2. 상세 내용 수정
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
                  <h2 className="text-2xl font-bold text-gray-900">상세 내용 수정</h2>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  블로그 에디터처럼 자유롭게 수정하세요.
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
                  handleSave();
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
                  <Save className="w-4 h-4 inline mr-2" />
                  저장하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

