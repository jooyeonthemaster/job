'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/config';
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
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

function CompanyDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
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

  // Supabase 인증 상태 확인 및 기업 정보 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[Dashboard] 인증 확인 시작');

        // 1. 현재 로그인된 사용자 확인
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('[Dashboard] 사용자 정보:', user ? `ID: ${user.id}, Email: ${user.email}` : '없음');
        console.log('[Dashboard] 인증 에러:', authError);

        if (authError || !user) {
          console.log('[Dashboard] 인증 실패 -> /login/company로 리다이렉트');
          router.push('/login/company');
          return;
        }

        // 2. Companies 테이블에서 기업 정보 가져오기
        console.log('[Dashboard] Companies 테이블에서 정보 조회 중...');
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('[Dashboard] 기업 데이터:', companyData);
        console.log('[Dashboard] 기업 데이터 에러:', companyError);

        if (companyError || !companyData) {
          // 기업 정보가 없으면 온보딩으로
          console.log('[Dashboard] 기업 정보 없음 -> /signup/company로 리다이렉트');
          router.push('/signup/company');
          return;
        }

        console.log('[Dashboard] 로딩 완료! 기업명:', companyData.name);
        setCompany(companyData);
      } catch (error) {
        console.error('[Dashboard] 예외 발생:', error);
        router.push('/login/company');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Supabase에서 채용공고 불러오기
  useEffect(() => {
    const fetchJobs = async () => {
      if (!company) return;

      setJobsLoading(true);
      try {
        const { data: jobsData, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        setJobs(jobsData || []);
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
      await supabase.auth.signOut();
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
    activeJobs: jobs.filter((j: any) => j.status === 'active').length || 0,
    jobsChange: -2.1,
    avgRating: 0,
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

              {/* 프로필 완성도 알림 - 온보딩 선택 항목 기준 */}
              {(!company.name_en || !company.website || !company.summary || !company.logo || !company.company_phone || !company.company_image) && (
                <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 border-2 border-primary-200 rounded-2xl shadow-lg">
                  {/* 장식용 배경 원 */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                  <div className="relative p-8">
                    <div className="flex items-start gap-6">
                      {/* 아이콘 */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* 콘텐츠 */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          기업 정보를 완성해보세요!
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                            중요
                          </span>
                        </h3>
                        <p className="text-gray-700 mb-4 text-lg">
                          기업 정보를 자세히 입력할수록 <strong className="text-primary-700">더 많은 채용 매칭</strong>을 기대할 수 있습니다!
                        </p>

                        {/* 미완성 항목 - 온보딩 선택 항목만 표시 */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 mb-5 border border-white">
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            아직 입력하지 않은 정보 (온보딩 선택 항목)
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {!company.logo && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                기업 로고
                              </div>
                            )}
                            {!company.name_en && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                기업명 (영문)
                              </div>
                            )}
                            {!company.company_phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                대표번호
                              </div>
                            )}
                            {!company.website && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                홈페이지 주소
                              </div>
                            )}
                            {!company.summary && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                기업 한 줄 소개
                              </div>
                            )}
                            {!company.company_image && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                회사 전경 이미지
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CTA 버튼 */}
                        <div className="flex items-center gap-4">
                          <Link
                            href="/company-dashboard/edit"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl font-semibold"
                          >
                            <Edit className="w-5 h-5" />
                            지금 바로 입력하기
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                          <Link
                            href="/company-dashboard?tab=profile"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all border border-gray-200 font-medium"
                          >
                            <Eye className="w-5 h-5" />
                            현재 정보 확인하기
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* 프로그레스 바 - 온보딩 선택 항목 기준 (총 6개) */}
                    <div className="mt-6 pt-6 border-t border-white/50">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">프로필 완성도 (선택 항목)</span>
                        <span className="font-bold text-primary-700">
                          {Math.round(([company.logo, company.name_en, company.company_phone, company.website, company.summary, company.company_image].filter(Boolean).length / 6) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-white/70 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 transition-all duration-500 rounded-full"
                          style={{
                            width: `${([company.logo, company.name_en, company.company_phone, company.website, company.summary, company.company_image].filter(Boolean).length / 6) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                    href={`/company/${company.id}`}
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
            <div className="space-y-6">
              {/* 헤더 */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 정보</h1>
                  <p className="text-gray-600">공개 프로필에 표시되는 기업 정보를 관리하세요</p>
                </div>
                <Link
                  href="/company-dashboard/edit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  수정하기
                </Link>
              </div>

              {/* 로고 & 기본 정보 카드 */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  {/* 로고 */}
                  {company.logo ? (
                    <div className="flex-shrink-0">
                      <img
                        src={company.logo}
                        alt={`${company.name} 로고`}
                        className="w-24 h-24 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* 기업명 & 한 줄 소개 */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {company.name}
                      {company.name_en && <span className="text-gray-500 font-normal ml-2">({company.name_en})</span>}
                    </h2>
                    {company.summary && (
                      <p className="text-gray-600 mb-3">{company.summary}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        {company.status === 'active' ? '활성' : company.status === 'pending' ? '승인 대기중' : '비활성'}
                      </span>
                      {company.profile_completed && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          프로필 완성
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 사업자 정보 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  사업자 정보
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">사업자등록번호</label>
                    <p className="text-gray-900 font-medium">{company.registration_number || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">대표자명</label>
                    <p className="text-gray-900 font-medium">{company.ceo_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">개업일자</label>
                    <p className="text-gray-900 font-medium">{company.established || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">사업자등록증</label>
                    {company.registration_document ? (
                      <a
                        href={company.registration_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        문서 보기
                      </a>
                    ) : (
                      <p className="text-gray-900 font-medium">-</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 기업 기본 정보 (K-Work 기반) */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-600" />
                  기업 기본 정보
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">기업 형태</label>
                    <p className="text-gray-900 font-medium">{company.company_type || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">기업 규모</label>
                    <p className="text-gray-900 font-medium">{company.employee_count || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">업태 (업종)</label>
                    <p className="text-gray-900 font-medium">{company.industry || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">대표번호</label>
                    <p className="text-gray-900 font-medium">{company.company_phone || company.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">홈페이지</label>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <Globe className="w-4 h-4" />
                        바로가기
                      </a>
                    ) : (
                      <p className="text-gray-900 font-medium">-</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">기업 주소</label>
                    <p className="text-gray-900 font-medium">{company.address || '-'}</p>
                    {company.location && company.location !== company.address && (
                      <p className="text-sm text-gray-500 mt-1">({company.location})</p>
                    )}
                  </div>
                  {company.company_image && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500 mb-2 block">회사 전경 이미지</label>
                      <img
                        src={company.company_image}
                        alt="회사 전경"
                        className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 담당자 정보 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  담당자 정보
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">담당 부서</label>
                    <p className="text-gray-900 font-medium">{company.manager_department || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">담당자명</label>
                    <p className="text-gray-900 font-medium">{company.manager_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">직급/직책</label>
                    <p className="text-gray-900 font-medium">{company.manager_position || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">담당자 연락처</label>
                    <p className="text-gray-900 font-medium">{company.manager_phone || '-'}</p>
                  </div>
                </div>
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
                                  const { error } = await supabase
                                    .from('jobs')
                                    .delete()
                                    .eq('id', job.id);

                                  if (error) throw error;

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

          {/* Applicants Tab - 유료 결제 안내 */}
          {activeTab === 'applicants' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-gray-900">지원자 관리</h1>

              {/* 유료 결제 안내 카드 */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 border-2 border-primary-200 rounded-2xl shadow-xl">
                {/* 장식용 배경 */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative p-12">
                  <div className="max-w-3xl mx-auto text-center">
                    {/* 아이콘 */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-lg">
                      <Users className="w-10 h-10 text-white" />
                    </div>

                    {/* 제목 */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      지원자 열람은 유료 결제 후 이용 가능합니다
                    </h2>

                    {/* 설명 */}
                    <p className="text-lg text-gray-700 mb-8">
                      채용공고에 지원한 인재들의 상세 정보를 확인하고 관리하려면<br />
                      유료 플랜으로 업그레이드가 필요합니다.
                    </p>

                    {/* 혜택 목록 */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">유료 플랜 주요 혜택</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">지원자 무제한 열람</p>
                            <p className="text-sm text-gray-600">모든 지원자의 상세 정보 확인</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">이력서 다운로드</p>
                            <p className="text-sm text-gray-600">PDF 형식으로 저장 가능</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">채용 진행 상태 관리</p>
                            <p className="text-sm text-gray-600">서류/면접/합격 단계별 관리</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">우선 노출 혜택</p>
                            <p className="text-sm text-gray-600">채용공고 상단 배치</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 문의 안내 */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
                      <p className="text-lg font-semibold mb-3">
                        유료 플랜 문의 및 상담
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5" />
                        <a
                          href="mailto:yjpark@ssmhr.com"
                          className="text-xl font-bold hover:underline"
                        >
                          yjpark@ssmhr.com
                        </a>
                      </div>
                      <p className="text-sm text-primary-100">
                        이메일로 문의주시면 맞춤형 플랜을 안내해드립니다
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 안내 */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">무료 플랜에서도 가능한 기능</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 채용공고 등록 및 관리</li>
                      <li>• 기업 정보 페이지 공개</li>
                      <li>• 지원자 수 확인 (이름/이력서는 유료)</li>
                      <li>• 기본 통계 데이터 조회</li>
                    </ul>
                  </div>
                </div>
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