'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import JobCard from '@/components/JobCard';
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
  CheckCircle
} from 'lucide-react';
import { companies, jobs } from '@/lib/data';

export default function CompanyDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewSort, setReviewSort] = useState('recent');
  
  // 실제로는 API에서 데이터를 가져와야 하지만, 여기서는 목업 데이터 사용
  const companyId = params.id as string;
  const company = companies.find(c => c.id === companyId) || companies[0];
  const companyJobs = jobs.filter(j => j.company.id === company.id);

  // 기업 상세 정보 목업
  const companyDetail = {
    ...company,
    slogan: "혁신과 도전으로 더 나은 세상을 만들어갑니다",
    vision: "글로벌 시장을 선도하는 혁신 기업",
    mission: "기술과 창의성으로 고객의 삶을 풍요롭게",
    ceo: "김철수",
    founded: company.established || "2015",
    website: "https://company.com",
    revenue: "1,200억원",
    funding: "Series C (500억원)",
    growthRate: 45,
    turnoverRate: 8,
    recommendRate: 92,
    interviewDifficulty: 3.8,
    
    stats: {
      currentEmployees: 324,
      lastYearEmployees: 223,
      avgSalary: 6800,
      avgTenure: 2.8,
      femaleRatio: 42,
      foreignerRatio: 15
    },

    benefits: [
      { 
        category: '근무 환경',
        items: [
          { icon: Clock, title: '자율 출퇴근제', desc: '코어타임 10-16시' },
          { icon: Home, title: '재택근무', desc: '주 2-3회 가능' },
          { icon: Coffee, title: '사내 카페', desc: '바리스타 커피 무료' },
          { icon: Laptop, title: '최신 장비', desc: '맥북프로 최신형 지급' }
        ]
      },
      {
        category: '성장 지원',
        items: [
          { icon: GraduationCap, title: '교육비 지원', desc: '연 300만원' },
          { icon: Globe, title: '컨퍼런스', desc: '국내외 컨퍼런스 참가' },
          { icon: Award, title: '자격증 지원', desc: '취득 비용 전액' },
          { icon: Target, title: '멘토링', desc: '1:1 커리어 멘토링' }
        ]
      },
      {
        category: '건강/복지',
        items: [
          { icon: Heart, title: '건강검진', desc: '종합검진 연 1회' },
          { icon: Shield, title: '단체보험', desc: '가족 포함 지원' },
          { icon: Activity, title: '헬스케어', desc: '피트니스 멤버십' },
          { icon: Coffee, title: '식사 지원', desc: '중식/석식 제공' }
        ]
      },
      {
        category: '보상',
        items: [
          { icon: TrendingUp, title: '성과급', desc: '연 200-500%' },
          { icon: Award, title: '스톡옵션', desc: '전 직원 부여' },
          { icon: DollarSign, title: '경조사비', desc: '각종 경조사 지원' },
          { icon: Calendar, title: '연차', desc: '15일 + 근속 추가' }
        ]
      }
    ],

    reviews: [
      {
        id: 1,
        rating: 4.5,
        position: '프론트엔드 개발자',
        tenure: '2년 3개월',
        status: '현직원',
        date: '2025-09-15',
        pros: '자율적인 문화와 수평적인 조직 구조가 장점입니다. 새로운 기술 도입에 적극적이고, 개발자의 의견을 존중해줍니다. 워라밸도 좋고 재택근무도 자유롭게 가능합니다.',
        cons: '빠르게 성장하는 만큼 업무 프로세스가 자주 바뀝니다. 때로는 일이 몰릴 때가 있어서 야근을 하기도 합니다.',
        helpful: 42,
        tags: ['워라밸 좋음', '성장 가능', '수평적 문화']
      },
      {
        id: 2,
        rating: 4.0,
        position: '백엔드 개발자',
        tenure: '1년 6개월',
        status: '현직원',
        date: '2025-09-10',
        pros: '기술 스택이 최신이고 도전적인 프로젝트가 많습니다. 동료들이 우수하고 서로 배우는 문화가 잘 형성되어 있습니다.',
        cons: '스타트업 특성상 복지가 대기업에 비해 부족합니다. 주니어 개발자를 위한 체계적인 교육 프로그램이 부족합니다.',
        helpful: 28,
        tags: ['기술력 높음', '좋은 동료', '스타트업']
      },
      {
        id: 3,
        rating: 3.5,
        position: '데이터 분석가',
        tenure: '3년',
        status: '전직원',
        date: '2025-08-20',
        pros: '데이터 기반 의사결정 문화가 잘 정착되어 있습니다. 다양한 데이터를 다룰 수 있어 성장에 도움이 됩니다.',
        cons: '부서간 협업이 원활하지 않을 때가 있습니다. 연봉 인상률이 기대에 미치지 못합니다.',
        helpful: 15,
        tags: ['데이터 중심', '성장 기회', '연봉 아쉬움']
      }
    ],

    news: [
      {
        id: 1,
        title: 'Series C 투자 유치 성공, 500억원 규모',
        date: '2025-09-01',
        source: '테크크런치',
        url: '#'
      },
      {
        id: 2,
        title: '글로벌 진출 본격화, 일본 법인 설립',
        date: '2025-08-15',
        source: '매일경제',
        url: '#'
      },
      {
        id: 3,
        title: 'AI 기반 신규 서비스 출시 예정',
        date: '2025-07-20',
        source: '조선일보',
        url: '#'
      }
    ],

    locations: [
      {
        name: '본사',
        address: company.location,
        type: 'HQ',
        employees: 250
      },
      {
        name: '강남 오피스',
        address: '서울 강남구 테헤란로 123',
        type: 'Branch',
        employees: 74
      }
    ],

    culture: {
      values: [
        { title: '혁신', desc: '새로운 시도를 두려워하지 않습니다' },
        { title: '협업', desc: '함께 성장하고 발전합니다' },
        { title: '고객중심', desc: '고객의 목소리에 귀 기울입니다' },
        { title: '투명성', desc: '열린 소통과 정보 공유' }
      ],
      perks: [
        '자율 좌석제',
        '무제한 휴가',
        '펫 프렌들리',
        '사내 동호회',
        '금요일 조기 퇴근',
        '생일 반차'
      ]
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
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-16 h-16 text-gray-500" />
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
      {/* Key Metrics Bar */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-6 border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{companyDetail.stats.currentEmployees}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                  현재 직원수
                  <span className={`text-xs ${companyDetail.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    +{companyDetail.growthRate}%
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{companyDetail.recommendRate}%</div>
                <div className="text-sm text-gray-600">추천율</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{companyDetail.stats.avgSalary}만원</div>
                <div className="text-sm text-gray-600">평균 연봉</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{companyDetail.stats.avgTenure}년</div>
                <div className="text-sm text-gray-600">평균 근속</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{company.openPositions}개</div>
                <div className="text-sm text-gray-600">채용중</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{companyDetail.interviewDifficulty}</div>
                <div className="text-sm text-gray-600">면접 난이도</div>
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
                        {company.techStack.map(tech => (
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

                  {/* Growth Chart */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                      성장 지표
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">직원 수 증가율</span>
                          <span className="flex items-center gap-1 font-bold text-green-600">
                            <ArrowUpRight className="w-4 h-4" />
                            {companyDetail.growthRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${companyDetail.growthRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">이직률</span>
                          <span className="flex items-center gap-1 font-bold text-blue-600">
                            <ArrowDownRight className="w-4 h-4" />
                            {companyDetail.turnoverRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${companyDetail.turnoverRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">여성 비율</div>
                        <div className="text-2xl font-bold text-gray-900">{companyDetail.stats.femaleRatio}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">외국인 비율</div>
                        <div className="text-2xl font-bold text-gray-900">{companyDetail.stats.foreignerRatio}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Office Gallery */}
                  {company.bannerImage && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6 pb-4">
                        <h2 className="text-xl font-bold text-gray-900">오피스 갤러리</h2>
                      </div>
                      <div className="relative h-64">
                        <Image
                          src={company.bannerImage}
                          alt={`${company.name} 오피스`}
                          fill
                          className="object-cover"
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
                      {companyDetail.locations.map((location, index) => (
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
                      {companyDetail.culture.values.map((value, index) => (
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
                        {companyDetail.culture.perks.map((perk, index) => (
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
                {companyDetail.benefits.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {category.items.map((benefit, index) => (
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
                ))}
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
                  {companyDetail.reviews.map((review) => (
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
                          {review.tags.map(tag => (
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
                  ))}
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
                        {job.tags.slice(0, 3).map(tag => (
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
                  {companyDetail.news.map(article => (
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