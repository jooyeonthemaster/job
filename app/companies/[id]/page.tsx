'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import JobCard from '@/components/JobCard';
import OptimizedImage from '@/components/OptimizedImage';
import { getCompanyById, getCompanyJobs } from '@/lib/supabase/company-service';
import { 
  Building2, 
  MapPin, 
  Users, 
  Star, 
  Calendar,
  TrendingUp,
  Globe,
  Award,
  Coffee,
  Heart,
  Home,
  Laptop,
  Shield,
  GraduationCap,
  ChevronRight,
  Share2,
  Bookmark,
  Check,
  Eye,
  Briefcase,
  Clock,
  DollarSign,
  Mail,
  Phone,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  PlayCircle,
  Newspaper,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  ChevronDown,
  Filter,
  Info,
  Quote,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Firebase 데이터 상태
  const [company, setCompany] = useState<any>(null);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const companyId = params.id as string;

  // Firebase에서 기업 데이터 가져오기
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [companyData, jobsData] = await Promise.all([
          getCompanyById(companyId),
          getCompanyJobs(companyId)
        ]);
        
        if (!companyData) {
          setError('기업 정보를 찾을 수 없습니다.');
          return;
        }
        
        setCompany(companyData);
        setCompanyJobs(jobsData);
      } catch (err) {
        console.error('기업 데이터 로딩 실패:', err);
        setError('기업 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">기업 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">기업을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '존재하지 않는 기업입니다.'}</p>
          <Link href="/companies" className="btn-primary">
            기업 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // benefits 타입 확인 헬퍼 함수
  const isBenefitsObject = (benefits: any): boolean => {
    return benefits && typeof benefits === 'object' && !Array.isArray(benefits);
  };

  const isBenefitsArray = (benefits: any): boolean => {
    return Array.isArray(benefits);
  };

  // 복지 정보를 배열로 변환
  const getBenefitsAsArray = () => {
    // Supabase: basic_benefits는 { title: string }[] 구조 (온보딩과 동일)
    if (!company.basic_benefits) return [];
    
    if (Array.isArray(company.basic_benefits)) {
      return company.basic_benefits.map((b: any) => b.title);
    }
    
    return [];
  };

  // 복지 상세 정보 생성
  const getBenefitsDetail = () => {
    // Supabase: benefits는 company_benefits 테이블 (category, title, description)
    if (!company.benefits || !Array.isArray(company.benefits)) return [];

    const categoryMap: Record<string, { name: string, icon: any }> = {
      workEnvironment: { name: '근무 환경', icon: Clock },
      growth: { name: '성장 지원', icon: GraduationCap },
      healthWelfare: { name: '건강/복지', icon: Heart },
      compensation: { name: '보상', icon: TrendingUp }
    };

    const grouped = company.benefits.reduce((acc: any, benefit: any) => {
      if (!acc[benefit.category]) {
        acc[benefit.category] = [];
      }
      acc[benefit.category].push({
        icon: categoryMap[benefit.category]?.icon || Award,
        title: benefit.title,
        desc: benefit.description || '제공'
      });
      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({
      category: categoryMap[key]?.name || key,
      items: grouped[key]
    }));
  };

  // 기업 상세 정보 (실제 DB 데이터만 사용)
  const companyDetail = {
    ...company,
    // 기본 정보
    ceo: company.ceo_name,
    founded: company.established,
    website: company.website,
    revenue: company.revenue,
    funding: company.funding,
    openPositions: companyJobs.length, // 실제 채용공고 수

    // 통계 정보 (실제 데이터만 사용)
    growthRate: company.stats?.[0]?.growth_rate,
    turnoverRate: company.stats?.[0]?.turnover_rate,
    recommendRate: company.stats?.[0]?.recommend_rate,
    interviewDifficulty: company.stats?.[0]?.interview_difficulty,

    stats: {
      currentEmployees: company.stats?.[0]?.current_employees,
      lastYearEmployees: company.stats?.[0]?.last_year_employees,
      avgSalary: company.stats?.[0]?.avg_salary,
      avgTenure: company.stats?.[0]?.avg_tenure,
      femaleRatio: company.stats?.[0]?.female_ratio,
      foreignerRatio: company.stats?.[0]?.foreigner_ratio
    },

    // 복지 정보 (실제 데이터)
    benefits: getBenefitsAsArray(),

    // 위치 정보 (실제 offices 데이터 또는 location 사용)
    locations: company.offices || (company.location ? [{
      name: '본사',
      address: company.location,
      type: 'HQ',
      employees: company.stats?.[0]?.current_employees || undefined
    }] : []),

    // 기업 문화 (더미 데이터 제거 - DB에 없으면 표시 안 함)
    culture: {
      values: [], // 추후 DB에 company_values 테이블 추가 시 사용
      perks: getBenefitsAsArray()
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다!');
  };

  const calculateGrowthIcon = (rate: number) => {
    return rate > 0 ? ArrowUpRight : ArrowDownRight;
  };

  const getStatusColor = (status: string) => {
    return status === '현직원' ? 'text-green-600' : 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Company Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-gray-700">홈</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/companies" className="hover:text-gray-700">기업 정보</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{company.name}</span>
            </div>

            {/* Company Info */}
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                {company.logo ? (
                  <OptimizedImage
                    src={company.logo}
                    alt={company.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-16 h-16 text-gray-500" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                      {company.name_en && (
                        <span className="text-xl text-gray-500">{company.name_en}</span>
                      )}
                    </div>
                    {company.summary && (
                      <p className="text-lg text-gray-600 mb-4">{company.summary}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-4 h-4" />
                        {company.employee_count}
                      </span>
                      
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {company.location}
                      </span>
                      
                      {companyDetail.founded && (
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {companyDetail.founded}년 설립
                        </span>
                      )}

                      {company.industry && (
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          {company.industry}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Single Page Layout */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Company Overview Section */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Content - 2 columns */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Company Introduction */}
                  {company.description && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">회사 소개</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {company.description}
                      </p>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {company.tech_stack && company.tech_stack.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">기술 스택</h2>
                      <div className="flex flex-wrap gap-3">
                        {company.tech_stack.map((tech: any) => (
                          <span 
                            key={tech.tech_name}
                            className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                          >
                            {tech.tech_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Office Gallery - company_image 사용 */}
                  {company.company_image && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6 pb-4">
                        <h2 className="text-xl font-bold text-gray-900">회사 전경</h2>
                      </div>
                      <div className="relative h-64">
                        <OptimizedImage
                          src={company.company_image}
                          alt={`${company.name} 전경`}
                          width={800}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Company Info Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">기업 정보</h3>
                    <dl className="space-y-3">
                      {companyDetail.ceo && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-600">대표</dt>
                          <dd className="font-medium text-gray-900">{companyDetail.ceo}</dd>
                        </div>
                      )}
                      {companyDetail.founded && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-600">설립</dt>
                          <dd className="font-medium text-gray-900">{companyDetail.founded}년</dd>
                        </div>
                      )}
                      {companyDetail.revenue && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-600">매출</dt>
                          <dd className="font-medium text-gray-900">{companyDetail.revenue}</dd>
                        </div>
                      )}
                      {companyDetail.funding && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-600">투자</dt>
                          <dd className="font-medium text-gray-900">{companyDetail.funding}</dd>
                        </div>
                      )}
                      {company.industry && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-600">업종</dt>
                          <dd className="font-medium text-gray-900">{company.industry}</dd>
                        </div>
                      )}
                    </dl>
                    {companyDetail.website && (
                      <a
                        href={companyDetail.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 w-full btn-primary text-center flex items-center justify-center gap-2"
                      >
                        회사 홈페이지
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Benefits Section - basic_benefits 데이터 기반 */}
                  {companyDetail.culture.perks.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4">복지 및 혜택</h3>
                      <div className="space-y-2">
                        {companyDetail.culture.perks.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            {/* Jobs Section */}
              <div className="space-y-6 mt-8">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      총 <span className="font-bold text-gray-900">{companyJobs.length}개</span>의 포지션이 열려있습니다
                    </p>
                    <div className="flex items-center gap-3">
                      <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                        <option>최신순</option>
                        <option>마감임박순</option>
                        <option>지원자순</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {companyJobs.map(job => (
                    <Link 
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{job.department}</p>
                        </div>
                        {Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                            마감임박
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.employmentType === 'FULL_TIME' ? '정규직' : '계약직'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {job.salary?.min && job.salary?.max && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {`${(job.salary.min / 10000).toFixed(0)}만 - ${(job.salary.max / 10000).toFixed(0)}만`}
                            </span>
                          )}
                          {job.applicants !== undefined && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              지원자 {job.applicants}명
                            </span>
                          )}
                        </div>
                      </div>

                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          마감 {new Date(job.deadline).toLocaleDateString('ko-KR')}
                        </span>
                        <span className="text-primary-600 font-medium">
                          자세히 보기 →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {companyJobs.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">현재 채용중인 포지션이 없습니다</p>
                  </div>
                )}
              </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA Section - Only show if company has active jobs */}
      {companyDetail.openPositions > 0 && (
        <section className="bg-gradient-to-r from-primary-500 to-primary-600 py-12">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {company.name}와 함께 성장하세요
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link
                href={`/companies/${company.id}/jobs`}
                className="px-6 py-3 bg-white text-primary-600 font-medium rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                채용공고 보기
                <Briefcase className="w-4 h-4" />
              </Link>
              <button className="px-6 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors inline-flex items-center gap-2 backdrop-blur">
                인재풀 등록
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}