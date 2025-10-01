'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Globe,
  Briefcase,
  Calendar,
  ChevronRight,
  Share2,
  Bookmark,
  Heart,
  Eye,
  Check,
  Award,
  Coffee,
  Home,
  GraduationCap,
  Mail,
  Phone,
  ExternalLink,
  Target,
  FileText,
  User,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('detail');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobId = params.id as string;
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));

        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
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
    return `₩${(min / 10000).toFixed(0)}만 - ${(max / 10000).toFixed(0)}만`;
  };

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      ENTRY: '신입',
      JUNIOR: '주니어 (1-3년)',
      MID: '미드레벨 (4-7년)',
      SENIOR: '시니어 (8년 이상)',
      EXECUTIVE: '임원급'
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">채용공고를 찾을 수 없습니다.</p>
          <Link href="/jobs" className="text-primary-600 hover:underline mt-2">
            채용공고 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-gray-700">홈</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/jobs" className="hover:text-gray-700">채용공고</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{job.title}</span>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                <Building2 className="w-12 h-12 text-gray-500" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/companies/${job.companyId}`} className="text-lg font-medium text-gray-700 hover:text-primary-600">
                    {job.company?.name || '회사명'}
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {getExperienceLabel(job.experienceLevel)}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(job.salary.min, job.salary.max)}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Eye className="w-4 h-4" />
                    조회 {job.views || 0}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Users className="w-4 h-4" />
                    지원 {job.applicants || 0}명
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isBookmarked
                      ? 'bg-primary-50 border-primary-300 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab('detail')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'detail'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                포지션 상세
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* 주요 업무 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-600" />
                    주요 업무
                  </h2>
                  <ul className="space-y-3">
                    {job.mainTasks?.map((task: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 자격 요건 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    자격 요건
                  </h2>
                  <ul className="space-y-3">
                    {job.requirements?.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 우대 사항 */}
                {job.preferredQualifications && job.preferredQualifications.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary-600" />
                      우대 사항
                    </h2>
                    <ul className="space-y-3">
                      {job.preferredQualifications.map((qual: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 복리후생 */}
                {job.benefits && job.benefits.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary-600" />
                      복리후생
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {job.benefits.map((benefit: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <Award className="w-6 h-6 text-primary-600 shrink-0" />
                          <div>
                            <p className="text-sm text-gray-700">{benefit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 근무 조건 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                    근무 조건
                  </h2>
                  <dl className="space-y-4">
                    <div className="flex">
                      <dt className="w-32 text-gray-600">고용 형태</dt>
                      <dd className="flex-1 text-gray-900 font-medium">{job.workConditions?.type || '정규직'}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-gray-600">수습 기간</dt>
                      <dd className="flex-1 text-gray-900 font-medium">{job.workConditions?.probation || '3개월'}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-gray-600">근무지</dt>
                      <dd className="flex-1 text-gray-900 font-medium">{job.location}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-gray-600">근무 시간</dt>
                      <dd className="flex-1 text-gray-900 font-medium">{job.workConditions?.workHours || '자율 출퇴근제'}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-gray-600">급여</dt>
                      <dd className="flex-1 text-gray-900 font-medium">{job.workConditions?.salary}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 text-gray-600">입사 예정일</dt>
                      <dd className="flex-1 text-gray-900 font-medium">{job.workConditions?.startDate || '즉시 가능'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        D-{Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-gray-600">마감까지</div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">지원자 수</span>
                        <span className="font-medium text-gray-900">{job.applicants || 0}명</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">조회수</span>
                        <span className="font-medium text-gray-900">{job.views || 0}</span>
                      </div>
                    </div>
                    <button className="w-full btn-primary py-3 text-lg font-medium">
                      지원하기
                    </button>
                    {job.visaSponsorship && (
                      <p className="text-xs text-gray-500 text-center mt-3">✓ 비자 스폰서십 가능</p>
                    )}
                  </div>

                  {/* 담당자 정보 */}
                  {job.manager && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h3 className="font-medium text-gray-900 mb-4">담당자 정보</h3>
                      <div className="space-y-3">
                        {job.manager.name && (
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{job.manager.name}</div>
                              <div className="text-sm text-gray-600">{job.manager.position}</div>
                            </div>
                          </div>
                        )}
                        {job.manager.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                            <a href={`mailto:${job.manager.email}`} className="text-sm text-primary-600 hover:underline">
                              {job.manager.email}
                            </a>
                          </div>
                        )}
                        {job.manager.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700">{job.manager.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 근무지 위치 */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-medium text-gray-900 mb-4">근무지 위치</h3>
                    <div className="h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-700">{job.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-lg border bg-white border-gray-300 text-gray-600">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="flex-1 btn-primary py-3">
            지원하기
          </button>
        </div>
      </div>
    </div>
  );
}