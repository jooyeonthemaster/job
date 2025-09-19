'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CompanyCard from '@/components/CompanyCard';
import { companies } from '@/lib/data';
import { 
  Search, 
  Building2, 
  Star, 
  TrendingUp, 
  Users, 
  Filter,
  MapPin,
  Briefcase,
  Award,
  Globe,
  ChevronRight,
  Clock,
  Code,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

// 산업 카테고리 정의
const industries = [
  'Technology', 
  'Internet', 
  'E-commerce', 
  'Fintech', 
  'Food Delivery',
  'Gaming',
  'Healthcare',
  'Education'
];

// 추가 회사 데이터 생성
const extendedCompanies = [
  ...companies,
  {
    id: '7',
    name: '라인플러스',
    nameEn: 'LINE Plus',
    logo: 'https://via.placeholder.com/100',
    industry: 'Internet',
    location: '경기도 성남시',
    employeeCount: '1,000-3,000',
    description: 'Global messaging platform',
    rating: 4.3,
    reviewCount: 520,
    openPositions: 14,
    benefits: ['4대보험', '퇴직금', '스톡옵션', '유연근무', '글로벌 근무'],
    techStack: ['Java', 'Kotlin', 'Go', 'Kubernetes'],
    established: '2013'
  },
  {
    id: '8',
    name: '우아한형제들',
    nameEn: 'Woowa Brothers',
    logo: 'https://via.placeholder.com/100',
    industry: 'Food Delivery',
    location: '서울 송파구',
    employeeCount: '1,000-3,000',
    description: 'Food delivery innovation leader',
    rating: 4.4,
    reviewCount: 890,
    openPositions: 20,
    benefits: ['4대보험', '퇴직금', '성과급', '식사지원', '자기계발지원'],
    techStack: ['Java', 'Spring Boot', 'React', 'AWS'],
    established: '2010'
  },
  {
    id: '9',
    name: '크래프톤',
    nameEn: 'KRAFTON',
    logo: 'https://via.placeholder.com/100',
    industry: 'Gaming',
    location: '경기도 성남시',
    employeeCount: '1,000-3,000',
    description: 'Global gaming powerhouse (PUBG)',
    rating: 4.5,
    reviewCount: 450,
    openPositions: 16,
    benefits: ['4대보험', '퇴직금', '스톡옵션', '자율출퇴근', '게임 지원금'],
    techStack: ['Unreal Engine', 'C++', 'Python', 'AWS'],
    established: '2018'
  },
  {
    id: '10',
    name: '당근마켓',
    nameEn: 'Karrot',
    logo: 'https://via.placeholder.com/100',
    industry: 'E-commerce',
    location: '서울 강남구',
    employeeCount: '300-1,000',
    description: 'Local community marketplace',
    rating: 4.7,
    reviewCount: 320,
    openPositions: 11,
    benefits: ['4대보험', '퇴직금', '스톡옵션', '무제한휴가', '재택근무'],
    techStack: ['Ruby on Rails', 'React Native', 'Go', 'AWS'],
    established: '2015'
  }
];

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const locations = Array.from(new Set(extendedCompanies.map(c => c.location.split(' ')[0])));
  
  const filteredCompanies = extendedCompanies.filter((company) => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nameEn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry = 
      selectedIndustry === 'all' || 
      company.industry === selectedIndustry;

    const matchesLocation = 
      selectedLocation === 'all' || 
      company.location.includes(selectedLocation);

    const matchesSize = 
      selectedSize === 'all' ||
      (selectedSize === 'startup' && parseInt(company.employeeCount) < 100) ||
      (selectedSize === 'small' && company.employeeCount.includes('100-300')) ||
      (selectedSize === 'medium' && company.employeeCount.includes('300-1,000')) ||
      (selectedSize === 'large' && company.employeeCount.includes('1,000-3,000')) ||
      (selectedSize === 'enterprise' && company.employeeCount.includes('10,000+'));

    return matchesSearch && matchesIndustry && matchesLocation && matchesSize;
  });

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'openPositions':
        return b.openPositions - a.openPositions;
      case 'reviewCount':
        return b.reviewCount - a.reviewCount;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 border-b">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            한국의 혁신 기업들
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            당신의 커리어를 성장시킬 {extendedCompanies.length}개의 기업을 만나보세요
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-2 flex items-center max-w-3xl">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="기업명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 py-3"
              />
            </div>
            <button className="btn-primary">
              검색하기
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { icon: Building2, label: '등록 기업', value: extendedCompanies.length },
              { icon: Star, label: '평균 평점', value: '4.4' },
              { icon: Briefcase, label: '활성 채용', value: extendedCompanies.reduce((sum, c) => sum + c.openPositions, 0) },
              { icon: Users, label: '총 리뷰', value: extendedCompanies.reduce((sum, c) => sum + c.reviewCount, 0).toLocaleString() }
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">
                  <span className="font-bold">{stat.value}</span> {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            {/* Industry Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">산업</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">모든 산업</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">지역</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">모든 지역</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Company Size Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">규모</span>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">모든 규모</option>
                <option value="startup">스타트업 (&#60;100)</option>
                <option value="small">소규모 (100-300)</option>
                <option value="medium">중규모 (300-1,000)</option>
                <option value="large">대규모 (1,000-3,000)</option>
                <option value="enterprise">대기업 (10,000+)</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">정렬</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="rating">평점순</option>
                <option value="openPositions">채용공고순</option>
                <option value="reviewCount">리뷰순</option>
                <option value="name">이름순</option>
              </select>
            </div>

            <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              <Filter className="w-4 h-4" />
              상세조건
            </button>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Popular Industries */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">인기 산업군</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Technology', icon: Code, count: 5, color: 'bg-blue-50 text-blue-600' },
                { name: 'Fintech', icon: DollarSign, count: 3, color: 'bg-green-50 text-green-600' },
                { name: 'E-commerce', icon: Building2, count: 4, color: 'bg-purple-50 text-purple-600' },
                { name: 'Gaming', icon: Award, count: 2, color: 'bg-red-50 text-red-600' },
                { name: 'Healthcare', icon: Users, count: 1, color: 'bg-yellow-50 text-yellow-600' },
                { name: 'Education', icon: Globe, count: 1, color: 'bg-indigo-50 text-indigo-600' }
              ].map((industry) => (
                <button
                  key={industry.name}
                  onClick={() => setSelectedIndustry(industry.name)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedIndustry === industry.name 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${industry.color} flex items-center justify-center mx-auto mb-2`}>
                    <industry.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{industry.name}</p>
                  <p className="text-xs text-gray-500">{industry.count}개 기업</p>
                </button>
              ))}
            </div>
          </div>

          {/* Company Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCompanies.length > 0 ? (
              sortedCompanies.map((company) => (
                <div key={company.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Company Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                        <Building2 className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-500">{company.nameEn}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {company.rating}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({company.reviewCount} 리뷰)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {company.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{company.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">직원 {company.employeeCount}명</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">설립 {company.established}</span>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    {company.techStack && company.techStack.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">기술 스택</p>
                        <div className="flex flex-wrap gap-1">
                          {company.techStack.slice(0, 4).map(tech => (
                            <span 
                              key={tech} 
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {company.techStack.length > 4 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                              +{company.techStack.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {company.benefits && company.benefits.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">복지</p>
                        <div className="flex flex-wrap gap-1">
                          {company.benefits.slice(0, 3).map(benefit => (
                            <span 
                              key={benefit} 
                              className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                            >
                              {benefit}
                            </span>
                          ))}
                          {company.benefits.length > 3 && (
                            <span className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded">
                              +{company.benefits.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-600">
                          채용중 {company.openPositions}건
                        </span>
                      </div>
                      <Link 
                        href={`/companies/${company.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        기업 상세보기
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600">
                  다른 검색어나 필터를 사용해보세요
                </p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {sortedCompanies.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                더 많은 기업 보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              우리 회사도 등록하고 싶으신가요?
            </h3>
            <p className="text-white/90 mb-6">
              글로벌 인재들과 만날 수 있는 기회를 놓치지 마세요
            </p>
            <Link 
              href="/company/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              기업 등록하기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}