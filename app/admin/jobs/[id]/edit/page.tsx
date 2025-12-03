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
import { ArrowLeft, Save, Eye, Loader } from 'lucide-react';

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
          'joo.y.oh.ko@gmail.com',
          'nadr110619@gmail.com',
          'admin@gmail.com',
          'yjpark@ssmhr.com'
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

  const handleSave = async (isDraft: boolean = false) => {
    if (!isValid && !isDraft) {
      alert('필수 항목을 입력해주세요.');
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
      router.push('/admin');
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">관리자 페이지</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">공고 수정</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Eye className="w-5 h-5" />
                미리보기
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Save className="w-5 h-5" />
                {saving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 회사 정보 표시 */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {selectedCompany && (
            <div className="flex items-center gap-3">
              {selectedCompany.logo && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">회사</p>
                <p className="font-bold text-gray-900">{selectedCompany.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메타데이터 폼 */}
          <div className="lg:col-span-1">
            <JobMetadataForm
              formData={formData}
              onUpdate={updateField}
            />
          </div>

          {/* 에디터 */}
          <div className="lg:col-span-2">
            <JobContentEditor
              content={editorContent}
              onChange={setEditorContent}
            />
          </div>
        </div>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && selectedCompany && (
        <JobPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          formData={formData}
          editorContent={editorContent}
          companyName={selectedCompany.name}
          companyLogo={selectedCompany.logo}
        />
      )}
    </div>
  );
}
