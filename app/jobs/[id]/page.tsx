'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Globe,
  Briefcase,
  Calendar,
  Share2,
  Bookmark,
  Eye,
  CheckCircle,
  ArrowLeft,
  FileText,
  Code
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
            )
          `)
          .eq('id', jobId)
          .single();

        if (error) throw error;

        if (data) {
          setJob({
            ...data,
            company: data.companies
          });
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

  const formatSalary = (min: number, max: number) => {
    const format = (num: number) => {
      if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
      if (num >= 10000000) return `${(num / 10000).toFixed(0)}만`;
      return num.toLocaleString();
    };
    return `${format(min)} - ${format(max)}`;
  };

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      ENTRY: '신입',
      JUNIOR: '주니어',
      MID: '미드레벨',
      SENIOR: '시니어',
      EXECUTIVE: '임원급'
    };
    return labels[level] || level;
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_TIME: '정규직',
      PART_TIME: '파트타임',
      CONTRACT: '계약직',
      INTERNSHIP: '인턴십'
    };
    return labels[type] || type;
  };

  const getKoreanLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      NONE: '무관',
      BASIC: '기초',
      INTERMEDIATE: '중급',
      ADVANCED: '고급',
      NATIVE: '원어민'
    };
    return labels[level] || level;
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
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {job.company?.logo ? (
                    <Image
                      src={job.company.logo}
                      alt={job.company.name}
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
                    href={`/companies/${job.company?.id}`}
                    className="text-sm font-medium text-gray-600 hover:text-primary-600 mb-1 inline-block"
                  >
                    {job.company?.name}
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <p className="text-lg text-gray-600">{job.title_en}</p>
                </div>
              </div>

              {/* Key Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">근무지</p>
                    <p className="text-sm font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">고용 형태</p>
                    <p className="text-sm font-medium text-gray-900">
                      {getExperienceLabel(job.experience_level)} · {getEmploymentTypeLabel(job.employment_type)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">급여</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatSalary(job.salary_min, job.salary_max)} KRW
                      {job.salary_negotiable && <span className="text-xs ml-1">(협상가능)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">마감일</p>
                    <p className="text-sm font-medium text-gray-900">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString('ko-KR') : '상시 채용'}
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

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">공고 상세</h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description || '<p>상세 내용이 없습니다.</p>' }}
              />
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">필수 요건</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferred Qualifications */}
            {job.preferred_qualifications && job.preferred_qualifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">우대 사항</h2>
                <ul className="space-y-2">
                  {job.preferred_qualifications.map((qual: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Korean Level */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">한국어 수준 요구사항</h2>
              <p className="text-gray-700">
                {getKoreanLevelLabel(job.korean_level)}
              </p>
            </div>

            {/* ✨ JD (Job Description) */}
            {job.job_description && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">JD (Job Description)</h2>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {job.job_description}
                  </p>
                </div>
              </div>
            )}

            {/* ✨ 필요 경력 사항 */}
            {job.required_experience && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">필요 경력 사항</h2>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {job.required_experience}
                  </p>
                </div>
              </div>
            )}

            {/* ✨ 필요 스킬 */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">필요 스킬</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill: string, index: number) => (
                    skill.trim() && (
                      <span key={index} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Apply Button */}
              <button
                onClick={() => alert('지원 기능은 준비 중입니다.')}
                className="w-full bg-gradient-to-r from-primary-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                지원하기
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    isBookmarked
                      ? 'bg-primary-50 border-primary-600 text-primary-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-primary-600'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  저장
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-primary-600 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  공유
                </button>
              </div>

              {/* Company Info Card */}
              {job.company && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">회사 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">회사명</p>
                      <p className="text-sm font-medium text-gray-900">{job.company.name}</p>
                      <p className="text-xs text-gray-500">{job.company.name_en}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">업종</p>
                      <p className="text-sm text-gray-900">{job.company.industry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">위치</p>
                      <p className="text-sm text-gray-900">{job.company.location}</p>
                    </div>
                    {job.company.description && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">소개</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{job.company.description}</p>
                      </div>
                    )}
                    <Link
                      href={`/companies/${job.company.id}`}
                      className="block text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      회사 페이지 보기 →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
