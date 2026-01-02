'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import JobApplicationModal from '@/components/JobApplicationModal';
import JobDetailSidebar from '@/components/JobDetailSidebar';
import JobSummaryTable from '@/components/job-detail/JobSummaryTable';
import {
  formatSalary,
  getExperienceLabel,
  getEmploymentTypeLabel,
  getKoreanLevelLabel
} from '@/utils/jobFormatters';
import {
  Building2,
  MapPin,
  DollarSign,
  Globe,
  Briefcase,
  Calendar,
  CheckCircle,
  ArrowLeft,
  FileText,
  Code,
  LayoutList,
  TableProperties
} from 'lucide-react';

// 탭 타입 정의
type ViewTab = 'detail' | 'summary';

// 회사 정보 타입
type CompanyData = {
  id: string;
  name: string;
  name_en?: string;
  logo?: string;
  banner_image?: string;
  industry?: string;
  location?: string;
  description?: string;
};

// 채용 담당자 타입
type ManagerData = {
  name?: string;
  position?: string;
  email?: string;
  phone?: string;
};

// 채용 공고 타입
type JobData = {
  id: string;
  title: string;
  title_en?: string;
  department?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_negotiable?: boolean;
  description?: string;
  job_description?: string;
  required_experience?: string;
  required_skills?: string[];
  main_tasks?: string[];
  requirements?: string[];
  preferred_qualifications?: string[];
  visa_sponsorship?: boolean;
  korean_level?: string;
  english_level?: string;
  probation?: string;
  start_date?: string;
  work_hours?: string;
  benefits?: string[];
  tags?: string[];
  deadline?: string;
  status?: string;
  company?: CompanyData;
  manager?: ManagerData;
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile, userType } = useAuth();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ViewTab>('detail');  // 탭 상태

  // ✅ 에러 메시지 자동 제거 (3초)
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobId = params.id as string;

        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            companies (
              id,
              name,
              name_en,
              logo,
              banner_image,
              industry,
              location,
              description
            ),
            job_manager (
              name,
              position,
              email,
              phone
            )
          `)
          .eq('id', jobId)
          .single();

        if (error) throw error;

        if (data) {
          console.log('📊 Job Data:', data);
          console.log('👤 Manager Info (from job_manager):', {
            name: data.job_manager?.name,
            position: data.job_manager?.position,
            email: data.job_manager?.email,
            phone: data.job_manager?.phone
          });
          setJob({
            ...data,
            company: data.companies as CompanyData,
            manager: data.job_manager as ManagerData
          } as JobData);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다!');
  };

  const handleApplyClick = () => {
    // 로그인 확인
    if (!user) {
      setErrorMessage('로그인이 필요합니다.');
      setTimeout(() => {
        router.push('/login/jobseeker');
      }, 2000);
      return;
    }

    // 구직자 계정 확인 (✅ userType 사용)
    if (userType !== 'jobseeker') {
      setErrorMessage('구직자만 지원할 수 있습니다.');
      return;
    }

    // ✅ 프로필 완성도 및 공개 여부 확인
    if (!userProfile) {
      setErrorMessage('프로필 정보를 불러올 수 없습니다.');
      return;
    }

    // 1. 프로필 공개 여부 확인
    if (!userProfile.is_public) {
      setErrorMessage('프로필을 공개로 설정해야 지원할 수 있습니다. 프로필을 완성하고 공개해주세요.');
      setTimeout(() => {
        router.push('/jobseeker-dashboard');
      }, 2500);
      return;
    }

    // 2. 필수 기본 정보 확인 (이름, 한 줄 소개)
    if (!userProfile.full_name || !userProfile.headline) {
      setErrorMessage('기본 정보(이름, 한 줄 소개)를 입력해야 지원할 수 있습니다.');
      setTimeout(() => {
        router.push('/profile/edit/basic');
      }, 2500);
      return;
    }

    // 3. 이력서 파일 확인
    if (!userProfile.resume_file_url) {
      setErrorMessage('이력서 파일을 업로드해야 지원할 수 있습니다.');
      setTimeout(() => {
        router.push('/profile/edit/resume');
      }, 2500);
      return;
    }

    // 4. 경력 또는 학력 확인
    const hasExperience = userProfile.experiences && userProfile.experiences.length > 0;
    const hasEducation = userProfile.educations && userProfile.educations.length > 0;
    if (!hasExperience && !hasEducation) {
      setErrorMessage('경력 또는 학력 정보를 1개 이상 입력해야 지원할 수 있습니다.');
      setTimeout(() => {
        router.push('/profile/edit/experience');
      }, 2500);
      return;
    }

    // 5. 기술 확인
    if (!userProfile.skills || userProfile.skills.length === 0) {
      setErrorMessage('보유 기술을 1개 이상 입력해야 지원할 수 있습니다.');
      setTimeout(() => {
        router.push('/profile/edit/skills');
      }, 2500);
      return;
    }

    // 6. 언어 능력 확인
    if (!userProfile.languages || userProfile.languages.length === 0) {
      setErrorMessage('언어 능력을 1개 이상 입력해야 지원할 수 있습니다.');
      setTimeout(() => {
        router.push('/profile/edit/skills');
      }, 2500);
      return;
    }

    // 에러 메시지 초기화 및 모달 오픈
    setErrorMessage('');
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmit = async (message: string) => {
    try {
      if (!job) {
        throw new Error('공고 정보를 불러올 수 없습니다.');
      }

      if (!user?.id) {
        throw new Error('로그인이 필요합니다.');
      }

      if (!userProfile?.email || !userProfile?.full_name) {
        throw new Error('프로필 정보가 필요합니다.');
      }

      // 🔥 API 우회: 클라이언트에서 직접 Supabase insert
      const { data: application, error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          job_title: job.title,
          company_id: job.company?.id,
          company_name: job.company?.name,
          applicant_id: user.id,
          applicant_name: userProfile.full_name,
          applicant_email: userProfile.email,
          message: message,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('지원서 제출 에러:', insertError);
        throw new Error(insertError.message || '지원서 제출에 실패했습니다.');
      }

      // ✅ 성공 메시지 Toast
      setErrorMessage('✅ 지원서가 성공적으로 제출되었습니다!');
      setIsApplicationModalOpen(false);

      // 1.5초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/jobseeker-dashboard');
      }, 1500);
    } catch (error: unknown) {
      throw error; // 모달에서 에러 메시지 표시
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">공고를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">공고를 찾을 수 없습니다</h1>
            <Link href="/jobs" className="text-primary-600 hover:text-primary-700">
              공고 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner Image */}
      {job.company?.banner_image && (
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={job.company.banner_image}
            alt={job.company.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          공고 목록으로
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-md shadow-sm p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {(job.company as Record<string, unknown>)?.logo ? (
                    <Image
                      src={(job.company as Record<string, unknown>).logo as string}
                      alt={(job.company as Record<string, unknown>).name as string}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/companies/${(job.company as Record<string, unknown>)?.id}`}
                    className="text-sm font-medium text-gray-600 hover:text-primary-600 mb-1 inline-block"
                  >
                    {(job.company as Record<string, unknown>)?.name as string}
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title as string}
                  </h1>
                  <p className="text-lg text-gray-600">{job.title_en as string}</p>
                </div>
              </div>

              {/* Key Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">근무지</p>
                    <p className="text-sm font-medium text-gray-900">{job.location as string}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">고용 형태</p>
                    <p className="text-sm font-medium text-gray-900">
                      {getExperienceLabel(job.experience_level as string)} · {getEmploymentTypeLabel(job.employment_type as string)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">급여</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatSalary(job.salary_min as number, job.salary_max as number)} KRW
                      {job.salary_negotiable && <span className="text-xs ml-1">(협상가능)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">마감일</p>
                    <p className="text-sm font-medium text-gray-900">
                      {job.deadline ? new Date(job.deadline as string).toLocaleDateString('ko-KR') : '상시 채용'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {job.visa_sponsorship && (
                <div className="flex items-center gap-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <Globe className="w-4 h-4" />
                    비자 지원
                  </div>
                </div>
              )}
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('detail')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === 'detail'
                      ? 'text-primary-600 bg-primary-50/50 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  상세 정보
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === 'summary'
                      ? 'text-primary-600 bg-primary-50/50 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TableProperties className="w-4 h-4" />
                  요약 표
                </button>
              </div>
            </div>

            {/* 탭 컨텐츠 - 요약 표 */}
            {activeTab === 'summary' && (
              <JobSummaryTable job={job as Parameters<typeof JobSummaryTable>[0]['job']} />
            )}

            {/* 탭 컨텐츠 - 상세 정보 (기존 UI) */}
            {activeTab === 'detail' && (
              <>
            {/* Job Description */}
            <div className="bg-white rounded-md shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">공고 상세</h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: (job.description as string) || '<p>상세 내용이 없습니다.</p>' }}
              />
            </div>

            {/* Requirements */}
            {(job.requirements as string[]) && (job.requirements as string[]).length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">필수 요건</h2>
                <ul className="space-y-2">
                  {(job.requirements as string[]).map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferred Qualifications */}
            {(job.preferred_qualifications as string[]) && (job.preferred_qualifications as string[]).length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">우대 사항</h2>
                <ul className="space-y-2">
                  {(job.preferred_qualifications as string[]).map((qual: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Korean Level */}
            <div className="bg-white rounded-md shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">한국어 수준 요구사항</h2>
              <p className="text-gray-700">
                {getKoreanLevelLabel(job.korean_level as string)}
              </p>
            </div>

            {/* ✨ JD (Job Description) */}
            {job.job_description && (
              <div className="bg-white rounded-md shadow-sm p-8">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">JD (Job Description)</h2>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {job.job_description as string}
                  </p>
                </div>
              </div>
            )}

            {/* ✨ 필요 경력 사항 */}
            {job.required_experience && (
              <div className="bg-white rounded-md shadow-sm p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">필요 경력 사항</h2>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {job.required_experience as string}
                  </p>
                </div>
              </div>
            )}

            {/* ✨ 필요 스킬 */}
            {(job.required_skills as string[]) && (job.required_skills as string[]).length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">필요 스킬</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(job.required_skills as string[]).map((skill: string, index: number) => (
                    skill.trim() && (
                      <span key={index} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <JobDetailSidebar
              job={job}
              onApplyClick={handleApplyClick}
              onCopyLink={handleCopyLink}
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {errorMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`${errorMessage.includes('✅') ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-md shadow-2xl flex items-center gap-3 min-w-[320px]`}>
            <div className={`w-8 h-8 ${errorMessage.includes('✅') ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center shrink-0`}>
              {errorMessage.includes('✅') ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="8" y2="12"></line>
                  <line x1="12" x2="12.01" y1="16" y2="16"></line>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className={`p-1 ${errorMessage.includes('✅') ? 'hover:bg-green-500' : 'hover:bg-red-500'} rounded-lg transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Application Modal */}
      <JobApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSubmit={handleApplicationSubmit}
        jobTitle={job?.title || ''}
        companyName={job?.company?.name || ''}
      />
    </div>
  );
}
