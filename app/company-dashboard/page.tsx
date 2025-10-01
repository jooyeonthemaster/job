'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase/config';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { getCompanyProfile } from '@/lib/firebase/company-service';
import { CompanyProfile } from '@/lib/firebase/company-types';
import {
  Building2,
  Users,
  Briefcase,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  MessageSquare,
  Calendar,
  Bell,
  ChevronDown,
  Home,
  PlusCircle,
  Search,
  Filter,
  Globe,
  Award,
  DollarSign,
  MoreVertical,
  Trash2
} from 'lucide-react';

function CompanyDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  // URL 파라미터에서 탭 확인
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getCompanyProfile(user.uid);
        if (profile && profile.profileCompleted) {
          setCompany(profile);
        } else {
          router.push('/company-auth/onboarding');
        }
      } else {
        router.push('/company-auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // 채용공고 불러오기
  useEffect(() => {
    const fetchJobs = async () => {
      if (!company) return;

      setJobsLoading(true);
      try {
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('companyId', '==', company.uid || auth.currentUser?.uid)
        );

        const querySnapshot = await getDocs(jobsQuery);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];

        // 클라이언트에서 정렬
        jobsData.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setJobsLoading(false);
      }
    };

    if (activeTab === 'jobs') {
      fetchJobs();
    }
  }, [company, activeTab]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // 대시보드 통계 데이터
  const stats = {
    totalViews: 12450,
    viewsChange: 15.3,
    totalApplications: 342,
    applicationsChange: 8.2,
    activeJobs: company?.openPositions || 0,
    jobsChange: -2.1,
    avgRating: company?.rating || 0,
    ratingChange: 0.2
  };

  const menuItems = [
    { id: 'overview', label: '대시보드', icon: Home },
    { id: 'profile', label: '기업 정보', icon: Building2 },
    { id: 'jobs', label: '채용 관리', icon: Briefcase },
    { id: 'applicants', label: '지원자 관리', icon: Users }
  ];
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">기업 정보를 불러올 수 없습니다.</p>
          <Link href="/company-auth" className="text-primary-600 hover:underline mt-2">
            다시 로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">기업 대시보드</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 알림 */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* 프로필 메뉴 */}
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                      ${activeTab === item.id 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  안녕하세요, {company.name}님
                </h1>
                <p className="text-gray-600">오늘의 채용 현황을 확인하세요</p>
              </div>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 작업</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <Link
                    href="/company-dashboard/jobs/create"
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <PlusCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">새 채용공고 등록</p>
                  </Link>
                  <button
                    onClick={() => setActiveTab('applicants')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">지원자 관리</p>
                  </button>
                  <Link
                    href={`/company/${company.uid || auth.currentUser?.uid}`}
                    target="_blank"
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">기업 정보 미리보기</p>
                  </Link>
                  <Link
                    href="/company-dashboard/edit"
                    className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Edit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">기업 정보 수정</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab - 기업 정보 관리 */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 정보</h1>
                  <p className="text-gray-600">공개 프로필에 표시되는 기업 정보를 관리하세요</p>
                </div>
                <Link 
                  href="/company-dashboard/edit"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  수정하기
                </Link>
              </div>
              {/* 기본 정보 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">회사명</label>
                    <p className="text-gray-900 font-medium">{company.name} ({company.nameEn})</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">산업군</label>
                    <p className="text-gray-900 font-medium">{company.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">위치</label>
                    <p className="text-gray-900 font-medium">{company.location}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">직원수</label>
                    <p className="text-gray-900 font-medium">{company.employeeCount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">설립년도</label>
                    <p className="text-gray-900 font-medium">{company.established}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">대표자</label>
                    <p className="text-gray-900 font-medium">{company.ceoName || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 회사 소개 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">회사 소개</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">설명</label>
                    <p className="text-gray-900">{company.description || '회사 설명을 입력해주세요'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">슬로건</label>
                    <p className="text-gray-900">{company.slogan || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">비전</label>
                    <p className="text-gray-900">{company.vision || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">미션</label>
                    <p className="text-gray-900">{company.mission || '-'}</p>
                  </div>
                </div>
              </div>
              {/* 기술 스택 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">기술 스택</h2>
                <div className="flex flex-wrap gap-2">
                  {company.techStack && company.techStack.length > 0 ? (
                    company.techStack.map(tech => (
                      <span key={tech} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">기술 스택을 추가해주세요</p>
                  )}
                </div>
              </div>

              {/* 복지 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">복지 & 혜택</h2>
                {company.benefits ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(company.benefits).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="font-medium text-gray-700 mb-2 capitalize">
                          {category === 'workEnvironment' ? '근무 환경' :
                           category === 'growth' ? '성장 지원' :
                           category === 'healthWelfare' ? '건강/복지' :
                           category === 'compensation' ? '보상' : category}
                        </h3>
                        <ul className="space-y-1">
                          {items.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600">
                              • {item.title}: {item.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">복지 정보를 추가해주세요</p>
                )}
              </div>
            </div>
          )}
          {/* Jobs Tab - 채용 관리 */}
          {activeTab === 'jobs' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">채용 관리</h1>
                  <p className="text-gray-600">진행 중인 채용공고를 관리하세요</p>
                </div>
                <Link
                  href="/company-dashboard/jobs/create"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  새 공고 등록
                </Link>
              </div>

              {jobsLoading ? (
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">채용공고를 불러오는 중...</p>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">아직 등록된 채용공고가 없습니다</p>
                    <Link
                      href="/company-dashboard/jobs/create"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      첫 채용공고 등록하기
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {job.status === 'active' ? '모집중' : '마감'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              마감: {new Date(job.deadline).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {job.views || 0}회
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              지원자 {job.applicants || 0}명
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {job.tags?.slice(0, 5).map((tag: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="상세보기"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/company-dashboard/jobs/edit/${job.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="수정하기"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm('정말 이 채용공고를 삭제하시겠습니까?')) {
                                try {
                                  await deleteDoc(doc(db, 'jobs', job.id));
                                  setJobs(jobs.filter(j => j.id !== job.id));
                                } catch (error) {
                                  console.error('Error deleting job:', error);
                                  alert('삭제에 실패했습니다');
                                }
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제하기"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other Tabs - 기본 구조 */}
          {activeTab === 'applicants' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-gray-900">지원자 관리</h1>
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-gray-500 text-center py-12">지원자 관리 기능 (구현 예정)</p>
              </div>
            </div>
          )}


        </main>
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <CompanyDashboardContent />
    </Suspense>
  );
}