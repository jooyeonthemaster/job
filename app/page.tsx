'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import JobGridCard from '@/components/JobGridCard';
import CompanyCard from '@/components/CompanyCard';
import AdBanner from '@/components/ui/AdBanner';
import { supabase } from '@/lib/supabase/config';
import { jobs as dummyJobs, companies } from '@/lib/data';
import { formatSalary } from '@/utils/jobFormatters';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import {
  Search,
  Filter,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface JobData {
  id: string;
  title: string;
  company_id: string;
  location: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  employment_type: string;
  display_position: 'top' | 'middle' | 'bottom';
  display_priority: number;
  created_at: string;
  companies: {
    name: string;
    logo: string | null;
    company_image: string | null;
  } | null;
}

// JobGridCard에서 사용하는 타입
interface TransformedJob {
  id: string;
  company: string;
  logo: string | null;
  companyImage: string | null;
  position: string;
  location: string;
  experience: string;
  salary: string;
  type: string;
  skills: string[];
  deadline: string;
  isNew: boolean;
  isHot: boolean;
  applicants: number;
  views: number;
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userProfile } = useAuth();
  const [topJobs, setTopJobs] = useState<TransformedJob[]>([]);
  const [middleJobs, setMiddleJobs] = useState<TransformedJob[]>([]);
  const [bottomJobs, setBottomJobs] = useState<TransformedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 검색어로 jobs 필터링
  const filterJobs = (jobs: TransformedJob[]) => {
    if (!searchQuery.trim()) return jobs;
    const query = searchQuery.toLowerCase().trim();
    return jobs.filter(job =>
      job.position?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.skills?.some((skill: string) => skill.toLowerCase().includes(query))
    );
  };

  // 필터링된 jobs
  const filteredTopJobs = filterJobs(topJobs);
  const filteredMiddleJobs = filterJobs(middleJobs);
  const filteredBottomJobs = filterJobs(bottomJobs);

  // Enter 키 검색 - /jobs 페이지로 이동하면서 검색어 전달
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/jobs');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 필터 초기화
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedExperience('all');
  };

  // 경험 레벨 라벨 변환
  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      'ENTRY': '신입', 'JUNIOR': '1-3년', 'MID': '3-5년',
      'SENIOR': '5-10년', 'EXECUTIVE': '10년+',
      'entry': '신입', 'junior': '1-3년', 'mid': '3-5년',
      'senior': '5-10년', 'executive': '10년+'
    };
    return labels[level] || level;
  };

  // 고용 형태 라벨 변환
  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'FULL_TIME': '정규직', 'CONTRACT': '계약직',
      'PART_TIME': '파트타임', 'INTERNSHIP': '인턴',
      'full_time': '정규직', 'contract': '계약직',
      'part_time': '파트타임', 'internship': '인턴'
    };
    return labels[type] || type;
  };

  // Supabase 데이터를 JobGridCard 형식으로 변환
  const transformJobData = (job: JobData): TransformedJob => {
    const postedDate = new Date(job.created_at);
    const daysSincePosted = Math.floor((new Date().getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: job.id,
      company: job.companies?.name || '회사명',
      logo: job.companies?.logo || null,
      companyImage: job.companies?.company_image || null,
      position: job.title || '',
      location: job.location || '',
      experience: getExperienceLabel(job.experience_level),
      salary: formatSalary(job.salary_min, job.salary_max),
      type: getEmploymentTypeLabel(job.employment_type),
      skills: [],
      deadline: 'D-30',
      isNew: daysSincePosted <= 7,
      isHot: false,
      applicants: 0,
      views: 0
    };
  };

  // 더미 데이터를 JobGridCard 형식으로 변환
  const transformDummyJobData = (job: typeof dummyJobs[0]): TransformedJob => {
    const getDaysUntilDeadline = () => {
      if (!job.deadline) return 'D-30';
      const deadline = new Date(job.deadline);
      const today = new Date();
      const daysLeft = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 ? `D-${daysLeft}` : '마감';
    };
    const postedDate = new Date(job.postedAt);
    const daysSincePosted = Math.floor((new Date().getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: job.id,
      company: job.company.name,
      logo: job.company.logo || null,
      companyImage: job.company.bannerImage || null,
      position: job.title,
      location: job.location,
      experience: getExperienceLabel(job.experienceLevel),
      salary: formatSalary(job.salary.min, job.salary.max),
      type: getEmploymentTypeLabel(job.employmentType),
      skills: job.tags || [],
      deadline: getDaysUntilDeadline(),
      isNew: daysSincePosted <= 7,
      isHot: job.views > 500,
      applicants: job.applicants || 0,
      views: job.views || 0
    };
  };

  // Supabase에서 활성화된 공고 가져오기
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data: topData, error: topError } = await supabase
          .from('jobs')
          .select(`*, companies (name, logo, company_image)`)
          .eq('status', 'active')
          .eq('payment_status', 'confirmed')
          .eq('display_position', 'top')
          .order('display_priority', { ascending: true })
          .limit(20);
        if (topError) throw topError;

        const { data: middleData, error: middleError } = await supabase
          .from('jobs')
          .select(`*, companies (name, logo, company_image)`)
          .eq('status', 'active')
          .eq('payment_status', 'confirmed')
          .eq('display_position', 'middle')
          .order('display_priority', { ascending: true })
          .limit(25);
        if (middleError) throw middleError;

        const { data: bottomData, error: bottomError } = await supabase
          .from('jobs')
          .select(`*, companies (name, logo, company_image)`)
          .eq('status', 'active')
          .eq('payment_status', 'confirmed')
          .eq('display_position', 'bottom')
          .order('display_priority', { ascending: true })
          .limit(30);
        if (bottomError) throw bottomError;

        const transformedTopJobs = (topData || []).map(transformJobData);
        const transformedMiddleJobs = (middleData || []).map(transformJobData);
        const transformedBottomJobs = (bottomData || []).map(transformJobData);
        const transformedDummyJobs = dummyJobs.map(transformDummyJobData);

        setTopJobs([...transformedTopJobs, ...transformedDummyJobs]);
        setMiddleJobs(transformedMiddleJobs);
        setBottomJobs(transformedBottomJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        const transformedDummyJobs = dummyJobs.map(transformDummyJobData);
        setTopJobs(transformedDummyJobs);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // 광고 카드 클릭 핸들러
  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login/company');
    } else if (userProfile?.userType === 'company') {
      router.push('/company-dashboard/jobs/create');
    } else {
      alert('기업 회원만 접근할 수 있습니다.');
      router.push('/login/company');
    }
  };

  const topCompanies = companies.slice(0, 6);

  const categories = [
    { id: 'all', label: '전체' }, { id: 'dev', label: '개발' },
    { id: 'design', label: '디자인' }, { id: 'marketing', label: '마케팅' },
    { id: 'sales', label: '영업' }, { id: 'hr', label: '인사' },
    { id: 'finance', label: '재무/회계' },
  ];
  const locations = [
    { id: 'all', label: '지역 전체' }, { id: 'seoul', label: '서울' },
    { id: 'gyeonggi', label: '경기' }, { id: 'busan', label: '부산' },
    { id: 'daegu', label: '대구' }, { id: 'incheon', label: '인천' },
  ];
  const experiences = [
    { id: 'all', label: '경력 전체' }, { id: 'entry', label: '신입' },
    { id: 'junior', label: '1-3년' }, { id: 'mid', label: '3-5년' },
    { id: 'senior', label: '5-10년' }, { id: 'executive', label: '10년 이상' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">채용공고를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section - Bridge World Banner + 검색 */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-10">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Bridge World Banner - 흰색 배경, 파란색 글씨 */}
          <div className="mb-8 bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-md flex items-center justify-center shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary-700 mb-2">
                  브릿지 월드가 당신이 찾고 있는 한국의 좋은 직장과 직업을 연결해 드립니다.
                </h3>
                <p className="text-base text-gray-600 flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-primary-600">방법</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span>본인의 이력서 등록</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span>한국기업 연락 또는 본인이 회사선택 지원</span>
                </p>
              </div>
            </div>
          </div>

          {/* 통합 검색 카드 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all max-w-2xl">
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="직무, 회사명, 키워드로 검색하세요"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg flex-shrink-0"
              >
                검색
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-300 transition-colors">
                <Briefcase className="w-4 h-4 text-primary-500" />
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-300 transition-colors">
                <MapPin className="w-4 h-4 text-primary-500" />
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2">
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-300 transition-colors">
                <Clock className="w-4 h-4 text-primary-500" />
                <select value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)} className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2">
                  {experiences.map(exp => <option key={exp.id} value={exp.id}>{exp.label}</option>)}
                </select>
              </div>
              <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />상세 필터
              </button>
              <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">초기화</button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Grid Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-6">
            <div className="flex-1">
              {/* Top 20 Jobs - 플래티넘 */}
              <div className="mb-16">
                <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 mb-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/30 via-transparent to-violet-600/20"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg backdrop-blur-md">
                        <span className="text-2xl">👑</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-white/90 text-indigo-700 text-xs font-bold rounded-full">플래티넘</span>
                          <span className="text-white/90 text-sm">최상단 노출 공고 (최대 20개)</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">고객님이 꼭봐야할 공고</h2>
                      </div>
                    </div>
                    <div className="text-white/90 text-sm">{topJobs.length > 0 ? `총 ${topJobs.length}개` : '등록 대기 중'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {topJobs.length > 0 ? (
                    topJobs.map((job, index) => (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.02 }}>
                        <JobGridCard job={job} size="large" />
                      </motion.div>
                    ))
                  ) : (
                    Array.from({ length: 20 }).map((_, index) => (
                      <div key={`empty-top-${index}`} className="h-64 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                        <span className="text-sm font-medium">빈 슬롯</span>
                        <span className="text-xs mt-1">#{index + 1}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 광고 배너 - 글로벌 인재에게 우리 기업을 알리세요 */}
              <div className="mb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="max-w-2xl mx-auto">
                  <button onClick={handleAdClick} className="block group w-full text-left">
                    <div className="bg-white rounded-md shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative border-2 border-gray-100">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-cyan-500" />
                      <div className="absolute inset-0 opacity-[0.03]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
                      </div>
                      <div className="p-6 flex items-center gap-6 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-50 to-cyan-50 flex items-center justify-center ring-2 ring-primary-100 shrink-0">
                          <Sparkles className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            글로벌 인재에게 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-cyan-600">우리 기업을 알리세요</span>
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">프리미엄 채용공고로 최상단 노출과 더 많은 지원자를 만나보세요</p>
                        </div>
                        <div className="bg-gradient-to-r from-primary-600 to-cyan-600 rounded-lg px-4 py-2 flex items-center gap-2 group-hover:shadow-md transition-all shrink-0">
                          <span className="font-semibold text-white text-sm">채용공고 등록</span>
                          <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              </div>

              {/* Middle 25 Jobs - 프라임 */}
              <div className="mb-16">
                <div className="relative bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 mb-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary-700/30 via-transparent to-blue-600/20"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg backdrop-blur-md">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-white/90 text-primary-700 text-xs font-bold rounded-full">프라임</span>
                          <span className="text-white/90 text-sm">인기 채용공고 (최대 25개)</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">최고의 인기 공고</h2>
                      </div>
                    </div>
                    <div className="text-white/90 text-sm">{middleJobs.length > 0 ? `총 ${middleJobs.length}개` : '등록 대기 중'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {middleJobs.length > 0 ? (
                    middleJobs.map((job, index) => (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.02 }}>
                        <JobGridCard job={job} size="medium" />
                      </motion.div>
                    ))
                  ) : (
                    Array.from({ length: 25 }).map((_, index) => (
                      <div key={`empty-middle-${index}`} className="h-56 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                        <span className="text-xs font-medium">빈 슬롯</span>
                        <span className="text-[10px] mt-1">#{index + 1}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom 30 Jobs - 스페셜 */}
              <div>
                <div className="relative bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-2xl p-6 mb-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-700/30 via-transparent to-teal-600/20"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg backdrop-blur-md">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-white/90 text-cyan-700 text-xs font-bold rounded-full">스페셜</span>
                          <span className="text-white/90 text-sm">주목받는 채용공고 (최대 30개)</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">요즘 주목받는 공고</h2>
                      </div>
                    </div>
                    <div className="text-white/90 text-sm">{bottomJobs.length > 0 ? `총 ${bottomJobs.length}개` : '등록 대기 중'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                  {bottomJobs.length > 0 ? (
                    bottomJobs.map((job, index) => (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.02 }}>
                        <JobGridCard job={job} size="small" />
                      </motion.div>
                    ))
                  ) : (
                    Array.from({ length: 30 }).map((_, index) => (
                      <div key={`empty-bottom-${index}`} className="h-48 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                        <span className="text-[10px] font-medium">빈 슬롯</span>
                        <span className="text-[9px] mt-1">#{index + 1}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 사이드바 - 배너 광고 */}
            <aside className="hidden xl:block w-[160px] shrink-0">
              <div className="sticky top-20 space-y-4">
                <AdBanner position="jobs-sidebar-1" width={160} height={600} />
                <AdBanner position="jobs-sidebar-2" width={160} height={600} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">인기 기업</h2>
              <p className="text-gray-600">글로벌 인재를 찾는 우수 기업들</p>
            </div>
            <Link href="/companies" className="hidden lg:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
              전체보기<ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCompanies.map((company, index) => (
              <motion.div key={company.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                <CompanyCard company={company} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - 지금 시작하세요 */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-white mb-4">지금 시작하세요</h2>
              <p className="text-xl text-white/90 mb-8">글로벌 인재로서 한국 기업에서의 커리어를 시작해보세요</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-50 shadow-lg">
                  <Sparkles className="w-5 h-5 mr-2 inline" />무료로 시작하기
                </Link>
                <Link href="/companies" className="btn-outline border-2 border-white text-white hover:bg-white hover:text-primary-600">
                  기업 서비스 알아보기
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
