'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import JobCard from '@/components/JobCard';
import OptimizedImage from '@/components/OptimizedImage';
import { getCompanyById, getCompanyJobs } from '@/lib/firebase/company-service';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewSort, setReviewSort] = useState('recent');
  
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
    if (!company.benefits) return [];
    
    // 이미 배열인 경우
    if (isBenefitsArray(company.benefits)) {
      return company.benefits as string[];
    }
    
    // CompanyBenefits 객체인 경우
    if (isBenefitsObject(company.benefits)) {
      const benefitsObj = company.benefits as any;
      const allBenefits: string[] = [];
      
      // 모든 카테고리의 benefits를 하나의 배열로 합침
      Object.values(benefitsObj).forEach((categoryBenefits: any) => {
        if (Array.isArray(categoryBenefits)) {
          categoryBenefits.forEach((item: any) => {
            if (typeof item === 'string') {
              allBenefits.push(item);
            } else if (item.title) {
              allBenefits.push(item.title);
            }
          });
        }
      });
      
      return allBenefits;
    }
    
    return [];
  };

  // 복지 상세 정보 생성
  const getBenefitsDetail = () => {
    if (!company.benefits) return [];

    // CompanyBenefits 객체 형태인 경우
    if (isBenefitsObject(company.benefits)) {
      const benefitsObj = company.benefits as any;
      const categories = [];

      if (benefitsObj.workEnvironment?.length > 0) {
        categories.push({
          category: '근무 환경',
          items: benefitsObj.workEnvironment.map((b: any) => ({
            icon: Clock,
            title: b.title || b,
            desc: b.description || '제공'
          }))
        });
      }

      if (benefitsObj.growth?.length > 0) {
        categories.push({
          category: '성장 지원',
          items: benefitsObj.growth.map((b: any) => ({
            icon: GraduationCap,
            title: b.title || b,
            desc: b.description || '지원'
          }))
        });
      }

      if (benefitsObj.healthWelfare?.length > 0) {
        categories.push({
          category: '건강/복지',
          items: benefitsObj.healthWelfare.map((b: any) => ({
            icon: Heart,
            title: b.title || b,
            desc: b.description || '제공'
          }))
        });
      }

      if (benefitsObj.compensation?.length > 0) {
        categories.push({
          category: '보상',
          items: benefitsObj.compensation.map((b: any) => ({
            icon: TrendingUp,
            title: b.title || b,
            desc: b.description || '제공'
          }))
        });
      }

      if (benefitsObj.additional?.length > 0) {
        categories.push({
          category: '기타 복지',
          items: benefitsObj.additional.map((b: any) => ({
            icon: Award,
            title: b.title || b,
            desc: b.description || '제공'
          }))
        });
      }

      return categories;
    }

    // string[] 배열 형태인 경우 (하위 호환성)
    if (isBenefitsArray(company.benefits)) {
      const benefitsArray = company.benefits as string[];
      return [
        { 
          category: '근무 환경',
          items: benefitsArray
            .filter((b: string) => ['유연근무', '재택근무', '자율출퇴근', '무제한휴가'].some(k => b.includes(k)))
            .map((b: string) => ({ icon: Clock, title: b, desc: '상세 정보 준비중' }))
        },
        {
          category: '복지 혜택',
          items: benefitsArray
            .filter((b: string) => ['4대보험', '퇴직금', '건강검진', '식사지원'].some(k => b.includes(k)))
            .map((b: string) => ({ icon: Heart, title: b, desc: '제공' }))
        },
        {
          category: '성장 지원',
          items: benefitsArray
            .filter((b: string) => ['자기계발', '교육지원', '스톡옵션'].some(k => b.includes(k)))
            .map((b: string) => ({ icon: GraduationCap, title: b, desc: '지원' }))
        }
      ].filter(category => category.items.length > 0);
    }

    return [];
  };

  // 기업 상세 정보 (Firebase 데이터 + 기본값)
  const companyDetail = {
    ...company,
    slogan: company.slogan || "혁신과 도전으로 더 나은 세상을 만들어갑니다",
    vision: company.vision || "글로벌 시장을 선도하는 혁신 기업",
    mission: company.mission || "기술과 창의성으로 고객의 삶을 풍요롭게",
    ceo: company.ceo || company.ceoName || company.representativeName || "대표자",
    founded: company.established || company.foundedYear || "2015",
    website: company.website || company.homepage || "#",
    revenue: company.revenue || "비공개",
    funding: company.funding || "비공개",
    growthRate: company.stats?.growthRate || company.growthRate || 0,
    turnoverRate: company.stats?.turnoverRate || company.turnoverRate || 0,
    recommendRate: company.stats?.recommendRate || company.recommendRate || 0,
    interviewDifficulty: company.stats?.interviewDifficulty || company.interviewDifficulty || 0,
    
    stats: {
      currentEmployees: company.stats?.currentEmployees || company.currentEmployees || 0,
      lastYearEmployees: company.stats?.lastYearEmployees || company.lastYearEmployees || 0,
      avgSalary: company.stats?.avgSalary || company.avgSalary || 0,
      avgTenure: company.stats?.avgTenure || company.avgTenure || 0,
      femaleRatio: company.stats?.femaleRatio || company.femaleRatio || 0,
      foreignerRatio: company.stats?.foreignerRatio || company.foreignerRatio || 0
    },

    benefits: getBenefitsAsArray(),
    benefitsDetail: getBenefitsDetail(),

    reviews: company.reviews || [],

    news: company.news || [],

    locations: company.locations || [
      {
        name: '본사',
        address: company.location || '주소 정보 없음',
        type: 'HQ',
        employees: company.currentEmployees || 0
      }
    ],

    culture: company.culture || {
      values: company.coreValues || [
        { title: '혁신', desc: '새로운 시도를 두려워하지 않습니다' },
        { title: '협업', desc: '함께 성장하고 발전합니다' },
        { title: '고객중심', desc: '고객의 목소리에 귀 기울입니다' },
        { title: '투명성', desc: '열린 소통과 정보 공유' }
      ],
      perks: company.benefits || []
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
                      <span className="text-xl text-gray-500">{company.nameEn}</span>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{companyDetail.slogan}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg ml-1">{company.rating}</span>
                        </div>
                        <span className="text-gray-500">({company.reviewCount} 리뷰)</span>
                      </div>
                      
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-4 h-4" />
                        {company.employeeCount}명
                      </span>
                      
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {company.location}
                      </span>
                      
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {companyDetail.founded}년 설립
                      </span>
                      
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        {company.industry}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isFollowing 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-white border border-primary-600 text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      {isFollowing ? '팔로잉' : '팔로우'}
                    </button>
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

      {/* Tab Navigation */}
      <section className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-8 overflow-x-auto">
              {[
                { id: 'overview', label: '기업 개요' },
                { id: 'culture', label: '기업 문화' },
                { id: 'benefits', label: '복리후생' },
                { id: 'reviews', label: `리뷰 (${company.reviewCount})` },
                { id: 'jobs', label: `채용공고 (${company.openPositions})` },
                { id: 'news', label: '뉴스' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Content - 2 columns */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Company Introduction */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">회사 소개</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">비전</h3>
                        <p className="text-gray-700">{companyDetail.vision}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">미션</h3>
                        <p className="text-gray-700">{companyDetail.mission}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">소개</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {company.description}. 우리는 혁신적인 기술과 창의적인 아이디어로 
                          글로벌 시장을 선도하고 있습니다. 최고의 인재들과 함께 성장하며, 
                          더 나은 미래를 만들어가고 있습니다. 고객 중심의 사고와 끊임없는 도전으로
                          업계를 리드하는 기업으로 자리매김했습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  {company.techStack && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">기술 스택</h2>
                      <div className="flex flex-wrap gap-3">
                        {company.techStack.map((tech: string) => (
                          <span 
                            key={tech}
                            className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Office Gallery */}
                  {company.bannerImage && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6 pb-4">
                        <h2 className="text-xl font-bold text-gray-900">오피스 갤러리</h2>
                      </div>
                      <div className="relative h-64">
                        <OptimizedImage
                          src={company.bannerImage}
                          alt={`${company.name} 오피스`}
                          width={800}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 pt-4">
                        <p className="text-sm text-gray-600">
                          쾌적한 업무 환경과 창의적인 공간에서 최고의 성과를 만들어갑니다.
                        </p>
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
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">대표</dt>
                        <dd className="font-medium text-gray-900">{companyDetail.ceo}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">설립</dt>
                        <dd className="font-medium text-gray-900">{companyDetail.founded}년</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">매출</dt>
                        <dd className="font-medium text-gray-900">{companyDetail.revenue}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">투자</dt>
                        <dd className="font-medium text-gray-900">{companyDetail.funding}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">업종</dt>
                        <dd className="font-medium text-gray-900">{company.industry}</dd>
                      </div>
                    </dl>
                    <a 
                      href={companyDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full btn-primary text-center flex items-center justify-center gap-2"
                    >
                      회사 홈페이지
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Location Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">위치</h3>
                    <div className="space-y-3">
                      {companyDetail.locations.map((location: any, index: number) => (
                        <div key={index} className="pb-3 border-b last:border-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{location.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{location.address}</div>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {location.type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            직원 {location.employees}명
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="h-48 bg-gray-100 rounded-lg mt-4 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Culture Tab */}
            {activeTab === 'culture' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Core Values */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">핵심 가치</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {companyDetail.culture.values.map((value: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                            <Zap className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">{value.title}</h3>
                            <p className="text-sm text-gray-600">{value.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work Culture */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">일하는 방식</h2>
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        우리는 자율과 책임을 바탕으로 일합니다. 수평적인 조직 문화를 통해 
                        누구나 자유롭게 의견을 제시하고, 더 나은 방향을 함께 찾아갑니다.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 mt-6">
                        {companyDetail.culture.perks.map((perk: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-gray-700">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Employee Voice */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">직원들의 목소리</h2>
                    <div className="space-y-4">
                      <blockquote className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                        <Quote className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-gray-700 italic mb-2">
                          "매일이 도전이지만, 그만큼 성장할 수 있는 환경입니다. 
                          동료들과 함께 문제를 해결해나가는 과정이 즐겁습니다."
                        </p>
                        <cite className="text-sm text-gray-600">- 개발팀, 2년차</cite>
                      </blockquote>
                      
                      <blockquote className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                        <Quote className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-gray-700 italic mb-2">
                          "워라밸이 정말 좋습니다. 자율 출퇴근과 재택근무로 
                          개인 시간을 효율적으로 활용할 수 있어요."
                        </p>
                        <cite className="text-sm text-gray-600">- 마케팅팀, 3년차</cite>
                      </blockquote>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-primary-50 rounded-xl p-6 sticky top-24">
                    <h3 className="font-bold text-gray-900 mb-4">문화 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                      {['자율성', '성장', '협업', '혁신', '워라밸', '수평문화', '투명성', '도전'].map(keyword => (
                        <span key={keyword} className="px-3 py-1 bg-white text-primary-700 rounded-full text-sm">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits Tab */}
            {activeTab === 'benefits' && (
              <div className="space-y-8">
                {companyDetail.benefitsDetail.length > 0 ? (
                  companyDetail.benefitsDetail
                    .filter((category: any) => category.items?.length > 0)
                    .map((category: any, categoryIndex: number) => (
                      <div key={categoryIndex} className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {category.items.map((benefit: any, index: number) => (
                            <div key={index} className="text-center">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mx-auto mb-3">
                                <benefit.icon className="w-8 h-8 text-primary-600" />
                              </div>
                              <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
                              <p className="text-sm text-gray-600">{benefit.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      복지 정보 준비중
                    </h3>
                    <p className="text-gray-600">
                      복지 및 혜택 정보가 곧 업데이트됩니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Review Filters */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <select 
                          value={reviewFilter}
                          onChange={(e) => setReviewFilter(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        >
                          <option value="all">모든 리뷰</option>
                          <option value="current">현직원</option>
                          <option value="former">전직원</option>
                        </select>
                        <select 
                          value={reviewSort}
                          onChange={(e) => setReviewSort(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        >
                          <option value="recent">최신순</option>
                          <option value="helpful">도움순</option>
                          <option value="rating">평점순</option>
                        </select>
                      </div>
                      <button className="btn-primary">
                        리뷰 작성
                      </button>
                    </div>
                  </div>

                  {/* Review List */}
                  {companyDetail.reviews.length > 0 ? (
                    companyDetail.reviews.map((review: any) => (
                      <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-lg ml-1">{review.rating}</span>
                            </div>
                            <span className={`text-sm font-medium ${getStatusColor(review.status)}`}>
                              {review.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {review.position} · {review.tenure}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">장점</h4>
                          <p className="text-gray-700">{review.pros}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">단점</h4>
                          <p className="text-gray-700">{review.cons}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                          {review.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
                          <ThumbsUp className="w-4 h-4" />
                          도움됨 ({review.helpful})
                        </button>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        리뷰가 없습니다
                      </h3>
                      <p className="text-gray-600">
                        첫 번째 리뷰를 작성해보세요!
                      </p>
                    </div>
                  )}
                </div>

                {/* Review Summary */}
                <div>
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                    <h3 className="font-bold text-gray-900 mb-4">리뷰 요약</h3>
                    
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-1">{company.rating}</div>
                      <div className="flex items-center justify-center mb-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(company.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{company.reviewCount}개 리뷰</div>
                    </div>

                    <dl className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">추천율</dt>
                        <dd className="font-medium text-gray-900">{companyDetail.recommendRate}%</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">CEO 지지율</dt>
                        <dd className="font-medium text-gray-900">88%</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">성장 가능성</dt>
                        <dd className="font-medium text-gray-900">95%</dd>
                      </div>
                    </dl>

                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">자주 언급되는 키워드</h4>
                      <div className="flex flex-wrap gap-1">
                        {['워라밸', '성장', '좋은 동료', '자율성', '연봉'].map(keyword => (
                          <span key={keyword} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
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
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {`${(job.salary.min / 10000).toFixed(0)}만 - ${(job.salary.max / 10000).toFixed(0)}만`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            지원자 {job.applicants}명
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

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
            )}

            {/* News Tab */}
            {activeTab === 'news' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {companyDetail.news.map((article: any) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow block"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{article.source}</span>
                            <span>·</span>
                            <span>{new Date(article.date).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                        <Newspaper className="w-8 h-8 text-gray-300 shrink-0 ml-4" />
                      </div>
                    </a>
                  ))}

                  {companyDetail.news.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">최근 뉴스가 없습니다</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                    <h3 className="font-bold text-gray-900 mb-4">미디어 노출</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">이번 달</span>
                          <span className="font-bold text-gray-900">12건</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{ width: '70%' }} />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">주요 언론사</h4>
                        <div className="flex flex-wrap gap-2">
                          {['조선일보', '매일경제', '한국경제', '테크크런치'].map(media => (
                            <span key={media} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {media}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 py-12">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {company.name}와 함께 성장하세요
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            우리는 항상 열정적이고 재능있는 인재를 찾고 있습니다. 
            지금 바로 지원하고 미래를 함께 만들어가세요.
          </p>
          <div className="flex items-center justify-center gap-4">
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
    </div>
  );
}