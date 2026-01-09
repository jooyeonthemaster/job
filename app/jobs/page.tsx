'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import JobGridCard from '@/components/JobGridCard';
import AdBanner from '@/components/ui/AdBanner';
import { supabase } from '@/lib/supabase/config';
import { jobs as dummyJobs } from '@/lib/data';
import { formatSalary } from '@/utils/jobFormatters';
import {
  Search,
  Filter,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
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

function JobsPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [middleJobs, setMiddleJobs] = useState<any[]>([]);
  const [bottomJobs, setBottomJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // 검색어로 jobs 필터링
  const filterJobs = (jobs: any[]) => {
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

  // 검색 핸들러
  const handleSearch = () => {
    // 이미 filterJobs로 실시간 필터링 중이므로 별도 처리 불필요
    // 추후 서버 사이드 검색으로 전환 시 여기서 API 호출
  };

  // Enter 키 검색
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
      'ENTRY': '신입',
      'JUNIOR': '1-3년',
      'MID': '3-5년',
      'SENIOR': '5-10년',
      'EXECUTIVE': '10년+',
      'entry': '신입',
      'junior': '1-3년',
      'mid': '3-5년',
      'senior': '5-10년',
      'executive': '10년+'
    };
    return labels[level] || level;
  };

  // 고용 형태 라벨 변환
  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'FULL_TIME': '정규직',
      'CONTRACT': '계약직',
      'PART_TIME': '파트타임',
      'INTERNSHIP': '인턴',
      'full_time': '정규직',
      'contract': '계약직',
      'part_time': '파트타임',
      'internship': '인턴'
    };
    return labels[type] || type;
  };

  // Supabase 데이터를 JobGridCard 형식으로 변환
  const transformJobData = (job: JobData) => {
    const getDaysUntilDeadline = () => {
      // 임시로 30일 후로 설정 (실제로는 deadline 필드가 있어야 함)
      return 'D-30';
    };

    const isNew = () => {
      const postedDate = new Date(job.created_at);
      const daysSincePosted = Math.floor((new Date().getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSincePosted <= 7;
    };

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
      skills: [], // 태그 필드 추가 필요
      deadline: getDaysUntilDeadline(),
      isNew: isNew(),
      isHot: false, // 조회수 기반 로직 추가 필요
      applicants: 0,
      views: 0
    };
  };

  // 더미 데이터를 JobGridCard 형식으로 변환
  const transformDummyJobData = (job: any) => {
    const getDaysUntilDeadline = () => {
      if (!job.deadline) return 'D-30';
      const deadline = new Date(job.deadline);
      const today = new Date();
      const daysLeft = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 ? `D-${daysLeft}` : '마감';
    };

    const isNew = () => {
      const postedDate = new Date(job.postedAt);
      const daysSincePosted = Math.floor((new Date().getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSincePosted <= 7;
    };

    return {
      id: job.id,
      company: job.company.name,
      logo: job.company.logo,
      companyImage: job.company.bannerImage,
      position: job.title,
      location: job.location,
      experience: getExperienceLabel(job.experienceLevel),
      salary: formatSalary(job.salary.min, job.salary.max),
      type: getEmploymentTypeLabel(job.employmentType),
      skills: job.tags || [],
      deadline: getDaysUntilDeadline(),
      isNew: isNew(),
      isHot: job.views > 500,
      applicants: job.applicants || 0,
      views: job.views || 0
    };
  };

  // Supabase에서 활성화된 공고 가져오기
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Top 섹션: 프리미엄/탑 공고
        const { data: topData, error: topError } = await supabase
          .from('jobs')
          .select(`
            *,
            companies (
              name,
              logo,
              company_image
            )
          `)
          .eq('status', 'active')
          .eq('payment_status', 'confirmed')
          .eq('display_position', 'top')
          .order('display_priority', { ascending: true })
          .limit(20);

        if (topError) throw topError;

        // Middle 섹션: 추천 공고
        const { data: middleData, error: middleError } = await supabase
          .from('jobs')
          .select(`
            *,
            companies (
              name,
              logo,
              company_image
            )
          `)
          .eq('status', 'active')
          .eq('payment_status', 'confirmed')
          .eq('display_position', 'middle')
          .order('display_priority', { ascending: true })
          .limit(25);

        if (middleError) throw middleError;

        // Bottom 섹션: 일반 공고
        const { data: bottomData, error: bottomError } = await supabase
          .from('jobs')
          .select(`
            *,
            companies (
              name,
              logo,
              company_image
            )
          `)
          .eq('status', 'active')
          .eq('payment_status', 'confirmed')
          .eq('display_position', 'bottom')
          .order('display_priority', { ascending: true })
          .limit(30);

        if (bottomError) throw bottomError;

        // 실제 DB 데이터 변환
        const transformedTopJobs = (topData || []).map(transformJobData);
        const transformedMiddleJobs = (middleData || []).map(transformJobData);
        const transformedBottomJobs = (bottomData || []).map(transformJobData);

        // 더미 데이터 변환
        const transformedDummyJobs = dummyJobs.map(transformDummyJobData);

        // 실제 DB + 더미 데이터 병합 (더미는 Top 섹션에 추가 - "지금 당장 주목해야 할 채용공고")
        setTopJobs([...transformedTopJobs, ...transformedDummyJobs]);
        setMiddleJobs(transformedMiddleJobs);
        setBottomJobs(transformedBottomJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // 에러 시에도 더미 데이터는 Top 섹션에 표시
        const transformedDummyJobs = dummyJobs.map(transformDummyJobData);
        setTopJobs(transformedDummyJobs);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'dev', label: '개발' },
    { id: 'design', label: '디자인' },
    { id: 'marketing', label: '마케팅' },
    { id: 'sales', label: '영업' },
    { id: 'hr', label: '인사' },
    { id: 'finance', label: '재무/회계' },
  ];

  const locations = [
    { id: 'all', label: '지역 전체' },
    { id: 'seoul', label: '서울' },
    { id: 'gyeonggi', label: '경기' },
    { id: 'busan', label: '부산' },
    { id: 'daegu', label: '대구' },
    { id: 'incheon', label: '인천' },
  ];

  const experiences = [
    { id: 'all', label: '경력 전체' },
    { id: 'entry', label: '신입' },
    { id: 'junior', label: '1-3년' },
    { id: 'mid', label: '3-5년' },
    { id: 'senior', label: '5-10년' },
    { id: 'executive', label: '10년 이상' },
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

      {/* Hero Section - 통합 검색 영역 */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-10">
        <div className="container mx-auto px-4 lg:px-8">
          {/* 헤드라인 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              채용공고 검색
            </h1>
            <p className="text-gray-500">
              한국 최고의 기업들이 당신을 기다립니다
            </p>
          </div>

          {/* 통합 검색 카드 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {/* 검색바 */}
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

            {/* 필터 영역 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-300 transition-colors">
                <Briefcase className="w-4 h-4 text-primary-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-300 transition-colors">
                <MapPin className="w-4 h-4 text-primary-500" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.label}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-primary-300 transition-colors">
                <Clock className="w-4 h-4 text-primary-500" />
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2"
                >
                  {experiences.map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.label}</option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

              {/* More Filters Button */}
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                상세 필터
              </button>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Grid Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-6">
            {/* 메인 컨텐츠 */}
            <div className="flex-1">
              {/* Top 20 Jobs - 플래티넘 (4열 그리드) */}
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
                      <span className="px-2 py-0.5 bg-white/90 text-indigo-700 text-xs font-bold rounded-full">
                        플래티넘
                      </span>
                      <span className="text-white/90 text-sm">최상단 노출 공고 (최대 20개)</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      고객님이 꼭봐야할 공고
                    </h2>
                  </div>
                </div>
                <div className="text-white/90 text-sm">
                  {filteredTopJobs.length > 0 ? `총 ${filteredTopJobs.length}개` : '등록 대기 중'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTopJobs.length > 0 ? (
                filteredTopJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <JobGridCard job={job} size="large" />
                  </motion.div>
                ))
              ) : (
                // 빈 슬롯 표시 (최대 20개)
                Array.from({ length: 20 }).map((_, index) => (
                  <div
                    key={`empty-top-${index}`}
                    className="h-64 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400"
                  >
                    <span className="text-sm font-medium">빈 슬롯</span>
                    <span className="text-xs mt-1">#{index + 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Middle 25 Jobs - 프라임 (5열 그리드) */}
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
                      <span className="px-2 py-0.5 bg-white/90 text-primary-700 text-xs font-bold rounded-full">
                        프라임
                      </span>
                      <span className="text-white/90 text-sm">인기 채용공고 (최대 25개)</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      최고의 인기 공고
                    </h2>
                  </div>
                </div>
                <div className="text-white/90 text-sm">
                  {filteredMiddleJobs.length > 0 ? `총 ${filteredMiddleJobs.length}개` : '등록 대기 중'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredMiddleJobs.length > 0 ? (
                filteredMiddleJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <JobGridCard job={job} size="medium" />
                  </motion.div>
                ))
              ) : (
                // 빈 슬롯 표시 (최대 25개)
                Array.from({ length: 25 }).map((_, index) => (
                  <div
                    key={`empty-middle-${index}`}
                    className="h-56 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400"
                  >
                    <span className="text-xs font-medium">빈 슬롯</span>
                    <span className="text-[10px] mt-1">#{index + 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom 30 Jobs - 스페셜 (6열 그리드) */}
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
                      <span className="px-2 py-0.5 bg-white/90 text-cyan-700 text-xs font-bold rounded-full">
                        스페셜
                      </span>
                      <span className="text-white/90 text-sm">주목받는 채용공고 (최대 30개)</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      요즘 주목받는 공고
                    </h2>
                  </div>
                </div>
                <div className="text-white/90 text-sm">
                  {filteredBottomJobs.length > 0 ? `총 ${filteredBottomJobs.length}개` : '등록 대기 중'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {filteredBottomJobs.length > 0 ? (
                filteredBottomJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <JobGridCard job={job} size="small" />
                  </motion.div>
                ))
              ) : (
                // 빈 슬롯 표시 (최대 30개)
                Array.from({ length: 30 }).map((_, index) => (
                  <div
                    key={`empty-bottom-${index}`}
                    className="h-48 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400"
                  >
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
              {/* 배너 광고 1 */}
              <AdBanner position="jobs-sidebar-1" width={160} height={600} />

              {/* 배너 광고 2 */}
              <AdBanner position="jobs-sidebar-2" width={160} height={600} />
            </div>
          </aside>
        </div>
        </div>
      </section>
    </div>
  );
}

// Suspense boundary로 감싸서 useSearchParams 사용 가능하게
export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">채용공고를 불러오는 중...</p>
          </div>
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}
