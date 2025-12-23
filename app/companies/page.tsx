'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import OptimizedImage from '@/components/OptimizedImage';
import { getAllCompanies } from '@/lib/supabase/company-service';
import { companies as popularCompanies } from '@/lib/data';
import {
  Search,
  Building2,
  Users,
  Filter,
  MapPin,
  Briefcase,
  ChevronRight,
  Clock,
  Loader2
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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('openPositions');

  // 하드코딩된 인기 기업 데이터를 Supabase 형식으로 변환
  const convertPopularCompanies = () => {
    return popularCompanies.map(company => ({
      id: `popular-${company.id}`,
      name: company.name,
      name_en: company.nameEn,
      logo: company.logo,
      industry: company.industry,
      location: company.location,
      employee_count: company.employeeCount,
      description: company.description,
      rating: company.rating,
      reviewCount: company.reviewCount,
      openPositions: company.openPositions,
      tech_stack: (company.techStack || []).map(tech => ({ tech_name: tech })),
      basic_benefits: (company.benefits || []).map(benefit => ({ title: benefit })),
      established: company.established,
      isPopular: true // 인기 기업 플래그
    }));
  };

  // Supabase에서 기업 데이터 가져오기 + 하드코딩된 인기 기업 합치기
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const supabaseData = await getAllCompanies();
        const popularData = convertPopularCompanies();

        // 인기 기업을 앞에 배치하고, Supabase 데이터를 뒤에 추가
        // 중복 방지: 인기 기업 이름과 동일한 Supabase 데이터는 제외
        const popularNames = new Set(popularData.map(c => c.name.toLowerCase()));
        const filteredSupabaseData = supabaseData.filter(
          (c: { name?: string }) => !popularNames.has((c.name || '').toLowerCase())
        );

        setCompanies([...popularData, ...filteredSupabaseData]);
      } catch (error) {
        console.error('기업 데이터 로딩 실패:', error);
        // 실패해도 인기 기업은 표시
        setCompanies(convertPopularCompanies());
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locations = companies.length > 0 
    ? Array.from(new Set(companies.map(c => c.location?.split(' ')[0]).filter(Boolean)))
    : [];
  
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = 
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.name_en?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry = 
      selectedIndustry === 'all' || 
      company.industry === selectedIndustry;

    const matchesLocation = 
      selectedLocation === 'all' || 
      company.location?.includes(selectedLocation);

    const matchesSize = 
      selectedSize === 'all' ||
      (selectedSize === 'startup' && company.employee_count?.includes('1-50')) ||
      (selectedSize === 'small' && company.employee_count?.includes('50-300')) ||
      (selectedSize === 'medium' && company.employee_count?.includes('300-1,000')) ||
      (selectedSize === 'large' && company.employee_count?.includes('1,000-5,000')) ||
      (selectedSize === 'enterprise' && company.employee_count?.includes('5,000+'));

    return matchesSearch && matchesIndustry && matchesLocation && matchesSize;
  });

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'openPositions':
        return (b.openPositions || 0) - (a.openPositions || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">인기 기업</h1>
              <p className="text-gray-500">글로벌 인재를 찾는 우수 기업들</p>
            </div>
            <Link href="/companies" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Search Bar */}
          <div className="bg-gray-50 rounded-xl p-2 flex items-center max-w-2xl border border-gray-200">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="기업명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 py-3"
              />
            </div>
            <button className="bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors">
              검색하기
            </button>
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
                <option value="openPositions">채용공고순</option>
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
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
              <p className="text-lg text-gray-600">기업 정보를 불러오는 중...</p>
            </div>
          )}

          {/* Company Grid */}
          {!loading && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCompanies.length > 0 ? (
                  sortedCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id.toString().replace('popular-', '')}`}
                  className={`block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer ${company.isPopular ? 'ring-1 ring-amber-200' : ''}`}
                >
                  <div className="p-6">
                    {/* Company Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {company.logo ? (
                          <OptimizedImage
                            src={company.logo}
                            alt={company.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {company.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">{company.name_en || company.nameEn}</p>
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
                        <span className="text-gray-600">직원 {company.employee_count}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">설립 {company.established}</span>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    {company.tech_stack && company.tech_stack.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">기술 스택</p>
                        <div className="flex flex-wrap gap-1">
                          {company.tech_stack.slice(0, 4).map((tech: any) => (
                            <span 
                              key={tech.tech_name} 
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tech.tech_name}
                            </span>
                          ))}
                          {company.tech_stack.length > 4 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                              +{company.tech_stack.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {company.basic_benefits && company.basic_benefits.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">복지</p>
                        <div className="flex flex-wrap gap-1">
                          {company.basic_benefits.slice(0, 3).map((benefit: any, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                            >
                              {benefit.title}
                            </span>
                          ))}
                          {company.basic_benefits.length > 3 && (
                            <span className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded">
                              +{company.basic_benefits.length - 3}
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
                          채용중 {company.openPositions || 0}건
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{company.industry}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
                  <div className="col-span-full bg-white rounded-md shadow-sm p-12 text-center">
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
                  <button className="px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                    더 많은 기업 보기
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* CTA Section */}
          {!loading && (
            <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                우리 회사도 등록하고 싶으신가요?
              </h3>
              <p className="text-white/90 mb-6">
                글로벌 인재들과 만날 수 있는 기회를 놓치지 마세요
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                기업 등록하기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}