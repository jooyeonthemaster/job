'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useJobForm } from '@/hooks/useJobForm';
import { useJobFormValidation } from '@/hooks/useJobFormValidation';
import { supabase } from '@/lib/supabase/config';
import { getJob, updateJob } from '@/lib/supabase/job-service';
import JobMetadataForm from '@/components/job-create/metadata/JobMetadataForm';
import JobContentEditor from '@/components/job-create/editor/JobContentEditor';
import JobPreviewModal from '@/components/job-create/JobPreviewModal';
import { ChevronLeft, Save, Eye, Loader, Building2, Send } from 'lucide-react';

const pickSingle = <T,>(relation: T | T[] | null | undefined): T | null => {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0] ?? null : relation;
};

interface SelectedCompany {
  id: string;
  name: string;
  name_en?: string;
  logo?: string;
  company_type: string;
  address: string;
}

export default function AdminJobEditPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const { formData, updateField, setFormDataBulk } = useJobForm();
  const [currentStep, setCurrentStep] = useState<'metadata' | 'content'>('metadata');
  const [editorContent, setEditorContent] = useState<string>('');
  const { errors, isValid } = useJobFormValidation(formData, editorContent);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null);

  // 관리자 권한 확인
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 이메일 기반 관리자 체크
        const adminEmails = [
          'admin@ssmhr.com',
          'yjpark@ssmhr.com',
          'joo.y.oh.ko@gmail.com',
          'nadr110619@gmail.com',
          'admin@gmail.com'
        ];

        if (!adminEmails.includes(user.email || '')) {
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }

        // 공고 데이터 로드
        await loadJobData();
      } catch (error) {
        console.error('Admin check error:', error);
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const result = await getJob(jobId);

      if (!result.success || !result.job) {
        throw new Error('공고 정보를 불러올 수 없습니다.');
      }

      const job = result.job;

      // 회사 정보 설정
      if (job.companies) {
        setSelectedCompany({
          id: job.companies.id,
          name: job.companies.name,
          name_en: job.companies.name_en,
          logo: job.companies.logo,
          company_type: job.companies.company_type,
          address: job.companies.address,
        });
      }

      // 폼 데이터 설정
      const workConditions = pickSingle(job.job_work_conditions);
      const manager = pickSingle(job.job_manager);

      setFormDataBulk({
        // 기본 정보
        title: job.title || '',
        titleEn: job.title_en || '',
        department: job.department || '',
        location: job.location || '',
        employmentType: job.employment_type || 'FULL_TIME',
        experienceLevel: job.experience_level || 'MID',
        deadline: job.deadline || '',

        // 급여
        salaryMin: job.salary_min ? String(job.salary_min) : '',
        salaryMax: job.salary_max ? String(job.salary_max) : '',
        salaryNegotiable: job.salary_negotiable || false,

        // 상세 정보 (에디터)
        description: '',
        mainTasks: [],
        requirements: [],
        preferredQualifications: [],

        // 신규 필드
        jobDescription: job.job_description || '',
        requiredExperience: job.required_experience || '',
        requiredSkills: job.required_skills || [],

        // 복지 및 태그
        benefits: [],
        tags: [],

        // 비자 및 언어
        visaSponsorship: job.visa_sponsorship || false,
        koreanLevel: job.korean_level || 'NONE',
        englishLevel: job.english_level || 'NONE',

        // 근무 조건
        probation: workConditions?.probation || '',
        workHours: workConditions?.work_hours || '',
        startDate: workConditions?.start_date || '',

        // 채용 담당자
        managerName: manager?.name || '',
        managerPosition: manager?.position || '',
        managerEmail: manager?.email || '',
        managerPhone: manager?.phone || '',

        // 공고 노출 위치
        postingTier: job.posting_tier || 'standard',
      });

      // 에디터 콘텐츠 설정
      setEditorContent(job.description || '');

    } catch (error: unknown) {
      console.error('공고 데이터 로딩 실패:', error);
      alert(`공고 정보를 불러오는데 실패했습니다.\n\n${(error as Error).message}`);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isValid) {
      setError('필수 항목을 입력해주세요.');
      setCurrentStep('metadata');
      return;
    }

    if (!selectedCompany) {
      alert('회사 정보를 찾을 수 없습니다.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 공고 업데이트
      const result = await updateJob(jobId, formData, editorContent);

      if (!result.success) {
        throw new Error(result.error || '공고 수정에 실패했습니다.');
      }

      alert('공고가 수정되었습니다.');
      router.push('/admin?tab=jobs');
    } catch (err: unknown) {
      console.error('공고 수정 실패:', err);
      const errorMessage = (err as Error).message || '공고 수정에 실패했습니다.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-600">공고 정보 로딩 중...</span>
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
        {/* Header - create 페이지와 동일한 구조 */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin?tab=jobs')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">채용공고 수정 (관리자)</h1>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">ADMIN</span>
                  </div>
                  {selectedCompany && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">회사:</p>
                      <div className="flex items-center gap-2">
                        {selectedCompany.logo && (
                          <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-5 h-5 rounded object-contain" />
                        )}
                        <span className="text-sm font-medium text-gray-900">{selectedCompany.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  미리보기
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {saving ? <>저장 중...</> : <><Save className="w-4 h-4 inline mr-2" />저장하기</>}
                </button>
              </div>
            </div>

            {/* Step Tabs - create 페이지와 동일 */}
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
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-md">
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

          {/* 선택된 회사 정보 표시 */}
          {selectedCompany && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-md flex items-center gap-3">
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
          )}

          {/* Step Content - create 페이지와 동일한 구조 */}
          {currentStep === 'metadata' && (
            <JobMetadataForm formData={formData} onUpdate={updateField} />
          )}

          {currentStep === 'content' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-secondary-50 to-pink-50 rounded-md p-6 border-2 border-secondary-100">
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
                onChange={setEditorContent}
                placeholder="채용공고 상세 내용을 작성하세요..."
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep !== 'metadata' && (
              <button
                onClick={() => setCurrentStep('metadata')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4 inline mr-2" />
                이전 단계
              </button>
            )}
            {currentStep === 'metadata' && <div></div>}
            <button
              onClick={() => {
                if (currentStep === 'metadata') {
                  setCurrentStep('content');
                } else {
                  handleSave();
                }
              }}
              disabled={saving}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ml-auto"
            >
              {currentStep === 'content' ? (
                <>
                  <Save className="w-4 h-4 inline mr-2" />
                  저장하기
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
