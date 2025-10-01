'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import JobGridCard from '@/components/JobGridCard';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Filter,
  ChevronDown,
  ChevronRight,
  Building2,
  Clock,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function JobsPage() {
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [middleJobs, setMiddleJobs] = useState<any[]>([]);
  const [bottomJobs, setBottomJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Firebase 데이터를 JobGridCard 형식으로 변환
  const transformJobData = (job: any) => {
    const getExperienceLabel = (level: string) => {
      const labels: Record<string, string> = {
        ENTRY: '신입',
        JUNIOR: '1-3년',
        MID: '3-5년',
        SENIOR: '5-10년',
        EXECUTIVE: '10년+'
      };
      return labels[level] || level;
    };

    const getEmploymentTypeLabel = (type: string) => {
      const labels: Record<string, string> = {
        FULL_TIME: '정규직',
        PART_TIME: '계약직',
        CONTRACT: '파트타임',
        INTERNSHIP: '인턴'
      };
      return labels[type] || type;
    };

    const getDaysUntilDeadline = (deadline: string) => {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `D-${diff}` : '마감';
    };

    const isNew = () => {
      const postedDate = job.postedAt?.toDate?.() || new Date(job.postedAt);
      const daysSincePosted = Math.floor((new Date().getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSincePosted <= 7;
    };

    return {
      id: job.id,
      company: job.company?.name || '회사명',
      position: job.title || job.titleEn || '',
      location: job.location || '',
      experience: getExperienceLabel(job.experienceLevel),
      salary: `${(job.salary?.min / 10000).toFixed(0)}만-${(job.salary?.max / 10000).toFixed(0)}만원`,
      type: getEmploymentTypeLabel(job.employmentType),
      skills: job.tags || [],
      deadline: getDaysUntilDeadline(job.deadline),
      isNew: isNew(),
      isHot: (job.views || 0) > 500 || (job.applicants || 0) > 50,
      applicants: job.applicants || 0,
      views: job.views || 0
    };
  };

  // Firebase에서 활성화된 공고 가져오기
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        
        const allJobs: any[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // display.position별로 분류 및 변환
        const top = allJobs
          .filter((job: any) => job.display?.position === 'top')
          .sort((a: any, b: any) => (a.display?.priority || 999) - (b.display?.priority || 999))
          .slice(0, 20)
          .map(transformJobData);

        const middle = allJobs
          .filter((job: any) => job.display?.position === 'middle')
          .sort((a: any, b: any) => (a.display?.priority || 999) - (b.display?.priority || 999))
          .slice(0, 25)
          .map(transformJobData);

        const bottom = allJobs
          .filter((job: any) => job.display?.position === 'bottom')
          .sort((a: any, b: any) => (a.display?.priority || 999) - (b.display?.priority || 999))
          .slice(0, 30)
          .map(transformJobData);

        setTopJobs(top);
        setMiddleJobs(middle);
        setBottomJobs(bottom);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  
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
    { id: 'new', label: '신입' },
    { id: '1-3', label: '1-3년' },
    { id: '3-5', label: '3-5년' },
    { id: '5-10', label: '5-10년' },
    { id: '10+', label: '10년 이상' },
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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            외국인 인재를 위한 채용정보
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            한국 최고의 기업들이 당신을 기다립니다
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-2 flex items-center max-w-3xl">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="직무, 회사, 키워드 검색..."
                className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 py-3"
              />
            </div>
            <button className="btn-primary">
              검색하기
            </button>
          </div>
        </div>
      </section>
      
      {/* Filter Section */}
      <section className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">직무</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
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
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.label}</option>
                ))}
              </select>
            </div>
            
            {/* Experience Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">경력</span>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                {experiences.map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.label}</option>
                ))}
              </select>
            </div>
            
            {/* More Filters Button */}
            <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              <Filter className="w-4 h-4" />
              상세조건
            </button>
          </div>
        </div>
      </section>
      
      {/* Job Grid Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Top 20 Jobs - 4x5 Grid */}
          <div className="mb-16">
            <div className="relative bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-6 mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-green-900/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white/90 text-emerald-700 text-xs font-bold rounded-full animate-pulse">
                        마감임박
                      </span>
                      <span className="text-white/90 text-sm">오늘 마감되는 포지션 다수</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      지금 당장 주목해야 할 채용공고
                    </h2>
                  </div>
                </div>
                <Link href="#" className="px-4 py-2 bg-white/90 hover:bg-white text-emerald-700 font-medium rounded-lg transition-colors flex items-center gap-1">
                  전체보기
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <JobGridCard job={job} size="large" />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Middle 25 Jobs - 5x5 Grid */}
          <div className="mb-16">
            <div className="relative bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-2xl p-6 mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-green-900/30 via-transparent to-emerald-900/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white/90 text-emerald-800 text-xs font-bold rounded-full">
                        AI 맞춤 추천
                      </span>
                      <span className="text-white/90 text-sm">당신의 프로필과 97% 매칭</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      당신을 위한 맞춤 채용공고
                    </h2>
                  </div>
                </div>
                <Link href="#" className="px-4 py-2 bg-white/90 hover:bg-white text-emerald-800 font-medium rounded-lg transition-colors flex items-center gap-1">
                  전체보기
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {middleJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <JobGridCard job={job} size="medium" />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Bottom 30 Jobs - 6x5 Grid */}
          <div>
            <div className="relative bg-gradient-to-r from-green-900 to-emerald-800 rounded-2xl p-6 mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-950/40 via-transparent to-emerald-950/30"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-md">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">
                        실시간 업데이트
                      </span>
                      <span className="text-white/80 text-sm">총 1,250개+ 포지션</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      모든 채용공고를 한눈에
                    </h2>
                  </div>
                </div>
                <Link href="#" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-1">
                  전체보기
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {bottomJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <JobGridCard job={job} size="small" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}