'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  ChevronRight,
  Share2,
  Bookmark,
  Heart,
  Eye,
  Star,
  Check,
  ArrowRight,
  Award,
  Coffee,
  Home,
  Laptop,
  Shield,
  TrendingUp,
  GraduationCap,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Zap,
  Target
} from 'lucide-react';
import { jobs, companies } from '@/lib/data';

export default function JobDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('detail');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  // 실제로는 API에서 데이터를 가져와야 하지만, 여기서는 목업 데이터 사용
  const jobId = params.id as string;
  const job = jobs.find(j => j.id === jobId) || jobs[0];

  // 상세 정보 목업 데이터
  const jobDetail = {
    ...job,
    mainTasks: [
      '글로벌 서비스의 프론트엔드 개발 및 유지보수',
      'React, TypeScript를 활용한 웹 애플리케이션 개발',
      'UI/UX 팀과 협업하여 사용자 경험 개선',
      'RESTful API 연동 및 상태 관리',
      '코드 리뷰 및 기술 문서 작성',
      '성능 최적화 및 접근성 개선'
    ],
    requirements: [
      'Computer Science 또는 관련 분야 학사 이상',
      'React 실무 경험 3년 이상',
      'TypeScript, JavaScript ES6+ 능숙',
      'Git을 활용한 협업 경험',
      'RESTful API 연동 경험',
      '원활한 커뮤니케이션 능력'
    ],
    preferredQualifications: [
      'Next.js 프레임워크 경험',
      'AWS 등 클라우드 서비스 경험',
      'CI/CD 파이프라인 구축 경험',
      'Agile/Scrum 개발 방법론 경험',
      '오픈소스 기여 경험',
      '영어 커뮤니케이션 가능자'
    ],
    benefits: [
      { icon: Coffee, title: '자유로운 근무', desc: '자율 출퇴근제, 재택근무 가능' },
      { icon: Award, title: '성과 보상', desc: '업계 최고 수준 연봉, 스톡옵션 제공' },
      { icon: GraduationCap, title: '성장 지원', desc: '교육비 지원, 컨퍼런스 참가 지원' },
      { icon: Heart, title: '건강 관리', desc: '건강검진, 헬스케어 지원, 단체보험' },
      { icon: Home, title: '워라밸', desc: '연차 25일, 안식휴가, 육아휴직' },
      { icon: Coffee, title: '복지 혜택', desc: '식대 지원, 커피 무제한, 최신 장비' }
    ],
    process: [
      { step: 1, title: '서류 전형', desc: '이력서 및 포트폴리오 검토', duration: '1주' },
      { step: 2, title: '1차 기술 면접', desc: '기술 역량 및 경험 확인', duration: '1주' },
      { step: 3, title: '2차 임원 면접', desc: '조직 적합성 및 비전 공유', duration: '1주' },
      { step: 4, title: '처우 협의', desc: '연봉 및 근무 조건 협의', duration: '3일' },
      { step: 5, title: '최종 합격', desc: '입사일 조율 및 온보딩', duration: '-' }
    ],
    workConditions: {
      type: '정규직',
      probation: '3개월',
      location: '서울특별시 강남구 테헤란로 427',
      workHours: '자율 출퇴근제 (코어타임 10:00-16:00)',
      salary: '6,000만원 - 9,000만원 (경력 및 역량에 따라 협의)',
      startDate: '즉시 가능 (협의 가능)'
    },
    manager: {
      name: '김철수',
      position: '개발팀 리드',
      email: 'recruit@company.com',
      phone: '02-1234-5678'
    },
    companyInfo: {
      employees: 324,
      founded: '2015년',
      funding: 'Series C (500억원)',
      revenue: '연 매출 1,200억원',
      clients: ['삼성전자', 'LG전자', '현대자동차', 'SK텔레콤'],
      techStack: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes']
    },
    views: 1234,
    applicants: 45,
    competitionRate: '15:1',
    deadline: '2025-11-30'
  };

  const relatedJobs = jobs.filter(j => 
    j.company.id === job.company.id && j.id !== jobId
  ).slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSalary = (min: number, max: number) => {
    const format = (num: number) => {
      if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
      if (num >= 10000000) return `${(num / 10000).toFixed(0)}만`;
      return num.toLocaleString();
    };
    return `₩${format(min)} - ${format(max)}`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Company Info */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-gray-700">홈</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/jobs" className="hover:text-gray-700">채용공고</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">{job.title}</span>
            </div>

            {/* Company & Job Header */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                <Building2 className="w-12 h-12 text-gray-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/companies/${job.company.id}`} className="text-lg font-medium text-gray-700 hover:text-primary-600">
                    {job.company.name}
                  </Link>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{job.company.rating}</span>
                    <span className="text-sm text-gray-500">({job.company.reviewCount})</span>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {job.title}
                </h1>
                
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
                    조회 {jobDetail.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Users className="w-4 h-4" />
                    지원 {jobDetail.applicants}명
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isBookmarked 
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-600' 
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Tab Navigation */}
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
              <button
                onClick={() => setActiveTab('company')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'company'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                회사 소개
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'team'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                팀 문화
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Content - 2 columns */}
              <div className="lg:col-span-2 space-y-8">
                {activeTab === 'detail' && (
                  <>
                    {/* Main Tasks */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary-600" />
                        주요 업무
                      </h2>
                      <ul className="space-y-3">
                        {jobDetail.mainTasks.map((task, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        자격 요건
                      </h2>
                      <ul className="space-y-3">
                        {jobDetail.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Preferred Qualifications */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary-600" />
                        우대 사항
                      </h2>
                      <ul className="space-y-3">
                        {jobDetail.preferredQualifications.map((qual, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary-600" />
                        복리후생
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {jobDetail.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <benefit.icon className="w-6 h-6 text-primary-600 shrink-0" />
                            <div>
                              <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{benefit.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hiring Process */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        채용 프로세스
                      </h2>
                      <div className="space-y-4">
                        {jobDetail.process.map((step, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0 
                                  ? 'bg-primary-600 text-white' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {step.step}
                              </div>
                              {index < jobDetail.process.length - 1 && (
                                <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <h4 className="font-medium text-gray-900">{step.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                              <span className="text-xs text-gray-500 mt-1">소요기간: {step.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Work Conditions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary-600" />
                        근무 조건
                      </h2>
                      <dl className="space-y-4">
                        {Object.entries(jobDetail.workConditions).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            type: '고용 형태',
                            probation: '수습 기간',
                            location: '근무지',
                            workHours: '근무 시간',
                            salary: '급여',
                            startDate: '입사 예정일'
                          };
                          return (
                            <div key={key} className="flex">
                              <dt className="w-32 text-gray-600">{labels[key]}</dt>
                              <dd className="flex-1 text-gray-900 font-medium">{value}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                  </>
                )}

                {activeTab === 'company' && (
                  <>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">회사 소개</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {job.company.description}. 우리는 혁신적인 기술과 창의적인 아이디어로 
                        글로벌 시장을 선도하고 있습니다. 최고의 인재들과 함께 성장하며, 
                        더 나은 미래를 만들어가고 있습니다.
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-6 mt-8">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">회사 정보</h3>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">직원 수</dt>
                              <dd className="font-medium">{jobDetail.companyInfo.employees}명</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">설립</dt>
                              <dd className="font-medium">{jobDetail.companyInfo.founded}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">투자 단계</dt>
                              <dd className="font-medium">{jobDetail.companyInfo.funding}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">매출</dt>
                              <dd className="font-medium">{jobDetail.companyInfo.revenue}</dd>
                            </div>
                          </dl>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">주요 고객사</h3>
                          <div className="flex flex-wrap gap-2">
                            {jobDetail.companyInfo.clients.map(client => (
                              <span key={client} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                {client}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="font-medium text-gray-900 mb-3">기술 스택</h3>
                        <div className="flex flex-wrap gap-2">
                          {jobDetail.companyInfo.techStack.map(tech => (
                            <span key={tech} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Company Images */}
                    {job.company.bannerImage && (
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="relative h-64">
                          <Image
                            src={job.company.bannerImage}
                            alt={`${job.company.name} 오피스`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'team' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">팀 문화</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">우리 팀의 가치</h3>
                        <p className="text-gray-700 leading-relaxed">
                          우리 팀은 자율과 책임을 바탕으로 일합니다. 서로의 성장을 돕고, 
                          실패를 두려워하지 않으며, 항상 더 나은 방법을 찾기 위해 노력합니다.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">일하는 방식</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-gray-700">2주 단위 스프린트로 애자일하게 일해요</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-gray-700">매일 스탠드업 미팅으로 진행상황을 공유해요</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-gray-700">코드 리뷰를 통해 서로 배우고 성장해요</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-gray-700">정기적인 회고를 통해 개선점을 찾아요</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">팀원들의 한마디</h3>
                        <div className="space-y-3">
                          <blockquote className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                            <p className="text-gray-700 italic">
                              "자유로운 분위기에서 도전적인 과제를 해결할 수 있어 매일이 즐겁습니다."
                            </p>
                            <cite className="text-sm text-gray-600 mt-2 block">- 개발팀 시니어 개발자</cite>
                          </blockquote>
                          <blockquote className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                            <p className="text-gray-700 italic">
                              "훌륭한 동료들과 함께 성장할 수 있는 최고의 환경입니다."
                            </p>
                            <cite className="text-sm text-gray-600 mt-2 block">- 개발팀 주니어 개발자</cite>
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                {/* Apply Card - Sticky */}
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        D-{Math.ceil((new Date(jobDetail.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-gray-600">마감까지</div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">지원자 수</span>
                        <span className="font-medium text-gray-900">{jobDetail.applicants}명</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">경쟁률</span>
                        <span className="font-medium text-gray-900">{jobDetail.competitionRate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">조회수</span>
                        <span className="font-medium text-gray-900">{jobDetail.views.toLocaleString()}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowApplicationModal(true)}
                      className="w-full btn-primary py-3 text-lg font-medium"
                    >
                      지원하기
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                      {job.visaSponsorship && '✓ 비자 스폰서십 가능'}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">담당자 정보</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{jobDetail.manager.name}</div>
                          <div className="text-sm text-gray-600">{jobDetail.manager.position}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                        <a href={`mailto:${jobDetail.manager.email}`} className="text-sm text-primary-600 hover:underline">
                          {jobDetail.manager.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700">{jobDetail.manager.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Map */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-medium text-gray-900 mb-4">근무지 위치</h3>
                    <div className="h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-700">{jobDetail.workConditions.location}</p>
                    <a 
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(jobDetail.workConditions.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      지도에서 보기
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Jobs */}
      {relatedJobs.length > 0 && (
        <section className="py-12 bg-gray-50 border-t">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {job.company.name}의 다른 포지션
                </h2>
                <Link 
                  href={`/companies/${job.company.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                >
                  모두 보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {relatedJobs.map(relatedJob => (
                  <Link
                    key={relatedJob.id}
                    href={`/jobs/${relatedJob.id}`}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {relatedJob.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {relatedJob.department}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {relatedJob.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {relatedJob.applicants}명 지원
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">지원하기</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium">지원 전 확인사항</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• 이력서와 포트폴리오가 최신 정보인지 확인해주세요</li>
                      <li>• 지원 후에는 취소가 불가능합니다</li>
                      <li>• 합격 여부는 이메일로 안내됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이력서 선택
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500">
                  <option>기본 이력서 (2025.09.15 수정)</option>
                  <option>영문 이력서 (2025.08.20 수정)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개서
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="간단한 지원 동기를 작성해주세요 (선택사항)"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  alert('지원이 완료되었습니다!');
                  setShowApplicationModal(false);
                }}
                className="flex-1 btn-primary"
              >
                지원하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating CTA for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-3 rounded-lg border ${
              isBookmarked 
                ? 'bg-yellow-50 border-yellow-400 text-yellow-600' 
                : 'bg-white border-gray-300 text-gray-600'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => setShowApplicationModal(true)}
            className="flex-1 btn-primary py-3"
          >
            지원하기
          </button>
        </div>
      </div>
    </div>
  );
}