'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import JobCard from '@/components/JobCard';
import CompanyCard from '@/components/CompanyCard';
import { jobs, companies } from '@/lib/data';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Globe, 
  ArrowRight, 
  Sparkles,
  Building2,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const featuredJobs = jobs.slice(0, 3);
  const topCompanies = companies.slice(0, 6);

  const stats = [
    { icon: Briefcase, label: '채용공고', value: '1,250+', color: 'primary' },
    { icon: Users, label: '등록인재', value: '15,000+', color: 'secondary' },
    { icon: Building2, label: '파트너기업', value: '500+', color: 'primary' },
    { icon: Globe, label: '지원국가', value: '45+', color: 'secondary' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 pt-20 pb-24">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge badge-primary mb-4">
                글로벌 인재 매칭 플랫폼
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                전 세계 인재들이 만나는
                <span className="block mt-2 text-gradient">한국 기업의 기회</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                외국인 구직자를 위한 최고의 채용 플랫폼에서
                당신의 커리어를 시작하세요
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg p-3 flex items-center">
                <div className="flex-1 flex items-center px-4">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="직무, 회사, 키워드 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <button className="btn-primary">
                  검색하기
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                <span className="text-sm text-gray-500">인기 검색어:</span>
                {['프론트엔드', '데이터 분석', 'UI/UX', '마케팅', 'DevOps'].map((keyword) => (
                  <button
                    key={keyword}
                    className="px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors border border-gray-200"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
      </section>

      {/* Stats Section removed per request */}

      {/* Featured Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                최신 채용공고
              </h2>
              <p className="text-gray-600">지금 바로 지원 가능한 포지션</p>
            </div>
            <Link
              href="/jobs"
              className="hidden lg:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>

          <div className="lg:hidden mt-8 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              더 많은 채용공고 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                인기 기업
              </h2>
              <p className="text-gray-600">글로벌 인재를 찾는 우수 기업들</p>
            </div>
            <Link
              href="/companies"
              className="hidden lg:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <CompanyCard company={company} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                지금 시작하세요
              </h2>
              <p className="text-xl text-white/90 mb-8">
                글로벌 인재로서 한국 기업에서의 커리어를 시작해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-50">
                  <Sparkles className="w-5 h-5 mr-2 inline" />
                  무료로 시작하기
                </Link>
                <Link href="/companies" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
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