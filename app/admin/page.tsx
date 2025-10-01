'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { 
  Users, 
  Building2, 
  FileText,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Shield,
  Briefcase,
  CreditCard,
  Eye,
  Edit,
  Star,
  Zap,
  MapPin,
  Phone
} from 'lucide-react';
import { 
  getAllTalentApplications, 
  updateApplicationStatus,
  getApplicationStats,
  type TalentApplication 
} from '@/lib/firebase/application-service';
import { 
  getAdminStats,
  getAllJobseekersAdmin,
  getAllCompaniesAdmin,
  getRecentActivities,
  getAllJobPostings,
  updateJobPaymentStatus,
  assignJobDisplayPosition,
  getJobPostingStats,
  type AdminStats,
  type RecentActivity,
  type JobPosting
} from '@/lib/firebase/admin-service';
import { JobseekerProfile } from '@/lib/firebase/jobseeker-service';
import { CompanyProfile } from '@/lib/firebase/company-types';
import Link from 'next/link';
import JobPositionAssignModal from '@/components/JobPositionAssignModal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // 통계
  const [stats, setStats] = useState<AdminStats>({
    totalJobseekers: 0,
    completedJobseekers: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  
  // 채용 신청
  const [talentApplications, setTalentApplications] = useState<TalentApplication[]>([]);
  const [applicationStats, setApplicationStats] = useState({ 
    total: 0, pending: 0, approved: 0, rejected: 0, contacted: 0 
  });
  
  // 구직자
  const [jobseekers, setJobseekers] = useState<JobseekerProfile[]>([]);
  
  // 기업
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  
  // 최근 활동
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  
  // 공고 관리
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobStats, setJobStats] = useState({ 
    total: 0, pendingPayment: 0, paid: 0, confirmed: 0, active: 0, pendingAssignment: 0, legacy: 0
  });
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedJobForPosition, setSelectedJobForPosition] = useState<JobPosting | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const adminStats = await getAdminStats();
        setStats(adminStats);
        
        const activities = await getRecentActivities(10);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // 탭별 데이터 로드
  useEffect(() => {
    const loadTabData = async () => {
      try {
        if (activeTab === 'talent-applications') {
          const apps = await getAllTalentApplications();
          const appStats = await getApplicationStats();
          setTalentApplications(apps);
          setApplicationStats(appStats);
        } else if (activeTab === 'jobseekers') {
          const js = await getAllJobseekersAdmin();
          setJobseekers(js);
        } else if (activeTab === 'companies') {
          const comp = await getAllCompaniesAdmin();
          setCompanies(comp);
        }
      } catch (error) {
        console.error('Failed to load tab data:', error);
      }
    };
    
    if (activeTab !== 'overview') {
      loadTabData();
    }
  }, [activeTab]);

  const handleStatusUpdate = async (applicationId: string, newStatus: TalentApplication['status']) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      const apps = await getAllTalentApplications();
      const appStats = await getApplicationStats();
      setTalentApplications(apps);
      setApplicationStats(appStats);
      
      // 대시보드 통계도 업데이트
      const adminStats = await getAdminStats();
      setStats(adminStats);
      
      alert('상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const navigation = [
    { id: 'overview', label: '대시보드', icon: TrendingUp },
    { id: 'job-postings', label: '공고 관리', icon: Briefcase },
    { id: 'talent-applications', label: '채용 신청 관리', icon: FileText },
    { id: 'jobseekers', label: '구직자 관리', icon: Users },
    { id: 'companies', label: '기업 관리', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Admin Header */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-b">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
              <p className="text-gray-600">플랫폼 운영 및 관리</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {loading ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">데이터를 불러오는 중...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalJobseekers}</p>
                            <p className="text-sm text-gray-600">전체 구직자</p>
                            <p className="text-xs text-blue-600 mt-1">
                              온보딩 완료: {stats.completedJobseekers}명
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                            <p className="text-sm text-gray-600">등록 기업</p>
                            <p className="text-xs text-purple-600 mt-1">
                              활성: {stats.activeCompanies}개
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <FileText className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                            <p className="text-sm text-gray-600">채용 신청</p>
                            <p className="text-xs text-orange-600 mt-1">
                              대기중: {stats.pendingApplications}건
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 최근 활동 */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-600" />
                        최근 활동
                      </h2>
                      {recentActivities.length > 0 ? (
                        <div className="space-y-3">
                          {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className={`p-2 rounded-lg ${
                                activity.type === 'jobseeker_signup' ? 'bg-blue-100' :
                                activity.type === 'company_signup' ? 'bg-purple-100' :
                                'bg-green-100'
                              }`}>
                                {activity.type === 'jobseeker_signup' && <Users className="w-4 h-4 text-blue-600" />}
                                {activity.type === 'company_signup' && <Building2 className="w-4 h-4 text-purple-600" />}
                                {activity.type === 'application' && <FileText className="w-4 h-4 text-green-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{activity.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(activity.timestamp).toLocaleString('ko-KR')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">최근 활동이 없습니다.</p>
                      )}
                    </div>

                    {/* 빠른 액션 */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Link
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveTab('talent-applications'); }}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">채용 신청 확인</p>
                            <p className="text-sm text-gray-600 mt-1">
                              대기중인 신청 {stats.pendingApplications}건
                            </p>
                          </div>
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveTab('jobseekers'); }}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">신규 구직자</p>
                            <p className="text-sm text-gray-600 mt-1">
                              온보딩 완료: {stats.completedJobseekers}명
                            </p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}

            {/* 공고 관리 Tab */}
            {activeTab === 'job-postings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">공고 관리</h2>
                  <button 
                    onClick={async () => {
                      setJobsLoading(true);
                      try {
                        const jobs = await getAllJobPostings();
                        const stats = await getJobPostingStats();
                        setJobPostings(jobs);
                        setJobStats(stats);
                      } catch (error) {
                        console.error(error);
                      } finally {
                        setJobsLoading(false);
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                  >
                    새로고침
                  </button>
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{jobStats.total}</p>
                    <p className="text-sm text-gray-600">전체</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{jobStats.pendingPayment}</p>
                    <p className="text-sm text-gray-600">입금 대기</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{jobStats.paid}</p>
                    <p className="text-sm text-gray-600">입금 확인</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-primary-600">{jobStats.confirmed}</p>
                    <p className="text-sm text-gray-600">결제 완료</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{jobStats.pendingAssignment}</p>
                    <p className="text-sm text-gray-600">위치 할당 대기</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{jobStats.active}</p>
                    <p className="text-sm text-gray-600">활성</p>
                  </div>
                </div>
                
                {jobStats.legacy > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      ℹ️ <strong>{jobStats.legacy}개</strong>의 기존 공고가 있습니다. 위치를 할당하여 활성화할 수 있습니다.
                    </p>
                  </div>
                )}

                {/* 공고 목록 */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {jobsLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">공고 로딩 중...</p>
                    </div>
                  ) : jobPostings.length === 0 ? (
                    <div className="p-8 text-center">
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 공고가 없습니다</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">공고 정보</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">노출 위치</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 정보</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 상태</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UI 위치</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {jobPostings.map((job) => {
                            const getTierBadge = () => {
                              // 기존 공고 (과금 필드 없음)
                              if (!job.posting) {
                                return (
                                  <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded-full">
                                    기존 공고
                                  </span>
                                );
                              }
                              
                              if (job.posting.tier === 'premium') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-secondary-500 to-pink-500 text-white text-xs font-medium rounded-full">
                                    <Zap className="w-3 h-3" />
                                    프리미엄
                                  </span>
                                );
                              } else if (job.posting.tier === 'top') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                    <Star className="w-3 h-3" />
                                    최상단
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                    일반
                                  </span>
                                );
                              }
                            };

                            const getPaymentStatusBadge = () => {
                              // 기존 공고
                              if (!job.payment) {
                                return <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded-full">기존 공고</span>;
                              }
                              
                              const status = job.payment.status;
                              if (status === 'confirmed') {
                                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">결제 완료</span>;
                              } else if (status === 'paid') {
                                return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">입금 확인</span>;
                              } else {
                                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">입금 대기</span>;
                              }
                            };

                            const getDisplayPositionBadge = () => {
                              const pos = job.display?.position;
                              if (pos === 'top') {
                                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">최상단 영역</span>;
                              } else if (pos === 'middle') {
                                return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">중단 영역</span>;
                              } else if (pos === 'bottom') {
                                return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">하단 영역</span>;
                              } else {
                                return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">미할당</span>;
                              }
                            };

                            return (
                              <tr key={job.id} className="hover:bg-gray-50">
                                {/* 공고 정보 */}
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    {job.company?.logo && (
                                      <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 rounded-lg object-cover" />
                                    )}
                                    <div>
                                      <p className="font-medium text-gray-900">{job.title}</p>
                                      <p className="text-sm text-gray-500">{job.company?.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">{job.location}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* 노출 위치 */}
                                <td className="px-4 py-4">
                                  {getTierBadge()}
                                  {job.posting && (
                                    <p className="text-xs text-gray-500 mt-1">{job.posting.duration}일</p>
                                  )}
                                </td>

                                {/* 결제 정보 */}
                                <td className="px-4 py-4">
                                  {job.posting ? (
                                    <>
                                      <p className="text-sm font-bold text-gray-900">
                                        {job.posting.totalAmount.toLocaleString()}원
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        (VAT 포함)
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-sm text-gray-500">-</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <p className="text-xs text-gray-600">
                                      {job.manager?.name} {job.manager?.phone}
                                    </p>
                                  </div>
                                </td>

                                {/* 결제 상태 */}
                                <td className="px-4 py-4">
                                  {getPaymentStatusBadge()}
                                  {job.payment && (
                                    <div className="mt-2 space-x-1">
                                      {job.payment.status === 'pending' && (
                                        <button
                                          onClick={async () => {
                                            if (confirm('입금을 확인하셨나요?')) {
                                              await updateJobPaymentStatus(job.id, 'paid');
                                              const updated = await getAllJobPostings();
                                              const stats = await getJobPostingStats();
                                              setJobPostings(updated);
                                              setJobStats(stats);
                                            }
                                          }}
                                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                          title="입금 확인"
                                        >
                                          입금 확인
                                        </button>
                                      )}
                                      {job.payment.status === 'paid' && (
                                        <button
                                          onClick={async () => {
                                            if (confirm('결제를 완료 처리하시겠습니까?')) {
                                              await updateJobPaymentStatus(job.id, 'confirmed');
                                              const updated = await getAllJobPostings();
                                              const stats = await getJobPostingStats();
                                              setJobPostings(updated);
                                              setJobStats(stats);
                                            }
                                          }}
                                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                          title="결제 완료"
                                        >
                                          결제 완료
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* UI 위치 */}
                                <td className="px-4 py-4">
                                  {job.display?.position ? (
                                    <div>
                                      {getDisplayPositionBadge()}
                                      <p className="text-xs text-gray-500 mt-1">
                                        우선순위: {job.display.priority}
                                      </p>
                                      <button
                                        onClick={() => {
                                          setSelectedJobForPosition(job);
                                          setShowPositionModal(true);
                                        }}
                                        className="mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                                      >
                                        위치 변경
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {job.payment?.status === 'confirmed' || !job.payment ? (
                                        <button
                                          onClick={() => {
                                            setSelectedJobForPosition(job);
                                            setShowPositionModal(true);
                                          }}
                                          className="w-full px-3 py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                          위치 할당하기
                                        </button>
                                      ) : (
                                        <span className="text-xs text-gray-400">결제 완료 후 할당 가능</span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* 액션 */}
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/jobs/${job.id}`}
                                      target="_blank"
                                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="공고 보기"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 채용 신청 관리 Tab */}
            {activeTab === 'talent-applications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">채용 신청 관리</h2>
                  <button 
                    onClick={async () => {
                      try {
                        const apps = await getAllTalentApplications();
                        const appStats = await getApplicationStats();
                        setTalentApplications(apps);
                        setApplicationStats(appStats);
                        const adminStats = await getAdminStats();
                        setStats(adminStats);
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                  >
                    새로고침
                  </button>
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{applicationStats.total}</p>
                    <p className="text-sm text-gray-600">전체</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{applicationStats.pending}</p>
                    <p className="text-sm text-gray-600">대기중</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{applicationStats.approved}</p>
                    <p className="text-sm text-gray-600">승인</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{applicationStats.contacted}</p>
                    <p className="text-sm text-gray-600">연락완료</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{applicationStats.rejected}</p>
                    <p className="text-sm text-gray-600">거절</p>
                  </div>
                </div>

                {/* 신청 목록 */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">기업명</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">인재명</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">제안 직무</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">담당자</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">상태</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">신청일</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {talentApplications.length > 0 ? (
                          talentApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">{app.companyName}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{app.talentName}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{app.position}</td>
                              <td className="py-3 px-4 text-xs text-gray-600">
                                <a href={`mailto:${app.contactEmail}`} className="hover:text-primary-600 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {app.contactEmail}
                                </a>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  app.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {app.status === 'pending' ? '대기중' :
                                   app.status === 'approved' ? '승인됨' :
                                   app.status === 'contacted' ? '연락완료' : '거절됨'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-600">
                                {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1">
                                  {app.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusUpdate(app.id!, 'approved')}
                                        className="p-1.5 hover:bg-green-50 rounded text-green-600"
                                        title="승인"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(app.id!, 'rejected')}
                                        className="p-1.5 hover:bg-red-50 rounded text-red-600"
                                        title="거절"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  {app.status === 'approved' && (
                                    <button
                                      onClick={() => handleStatusUpdate(app.id!, 'contacted')}
                                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                    >
                                      연락완료
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-gray-500">
                              채용 신청 내역이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 최근 신청 상세 */}
                {talentApplications.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 신청 상세</h3>
                    <div className="space-y-4">
                      {talentApplications.slice(0, 5).map((app) => (
                        <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {app.companyName} → {app.talentName}
                              </p>
                              <p className="text-sm text-gray-600">{app.position}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              app.status === 'approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {app.status === 'pending' ? '대기중' :
                               app.status === 'approved' ? '승인됨' :
                               app.status === 'contacted' ? '연락완료' : '거절됨'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{app.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>담당자: {app.contactEmail}</span>
                            <span>{new Date(app.createdAt).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 구직자 관리 Tab */}
            {activeTab === 'jobseekers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">구직자 관리</h2>
                
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">이름</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">헤드라인</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">기술</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">희망 직무</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">상태</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">가입일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {jobseekers.length > 0 ? (
                          jobseekers.map((js) => (
                            <tr key={js.uid} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                <Link href={`/talent/${js.uid}`} className="hover:text-primary-600">
                                  {js.fullName || 'Unknown'}
                                </Link>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">{js.headline || '-'}</td>
                              <td className="py-3 px-4 text-xs">
                                <div className="flex flex-wrap gap-1">
                                  {js.skills?.slice(0, 3).map((skill: string) => (
                                    <span key={skill} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-600">
                                {js.desiredPositions?.[0] || '-'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  js.onboardingCompleted 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {js.onboardingCompleted ? '완료' : '미완료'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-600">
                                {js.createdAt ? new Date(js.createdAt).toLocaleDateString('ko-KR') : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-gray-500">
                              구직자 데이터가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 기업 관리 Tab */}
            {activeTab === 'companies' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">기업 관리</h2>
                
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">기업명</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">업종</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">위치</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">규모</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">상태</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">가입일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {companies.length > 0 ? (
                          companies.map((company) => (
                            <tr key={company.uid} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {company.name || company.nameEn || 'Unknown'}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">{company.industry || '-'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{company.location || '-'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{company.employeeCount || '-'}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  company.profileCompleted 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {company.profileCompleted ? '활성' : '미완성'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-xs text-gray-600">
                                {company.createdAt 
                                  ? new Date(company.createdAt.toString()).toLocaleDateString('ko-KR') 
                                  : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-gray-500">
                              기업 데이터가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 위치 할당 모달 */}
      {selectedJobForPosition && (
        <JobPositionAssignModal
          isOpen={showPositionModal}
          onClose={() => {
            setShowPositionModal(false);
            setSelectedJobForPosition(null);
          }}
          jobTitle={selectedJobForPosition.title}
          jobCompany={selectedJobForPosition.company?.name || ''}
          postingTier={selectedJobForPosition.posting?.tier || 'standard'}
          currentJobs={jobPostings}
          onAssign={async (position, priority) => {
            try {
              await assignJobDisplayPosition(selectedJobForPosition.id, position, priority);
              const updated = await getAllJobPostings();
              const stats = await getJobPostingStats();
              setJobPostings(updated);
              setJobStats(stats);
              setShowPositionModal(false);
              setSelectedJobForPosition(null);
            } catch (error) {
              console.error('Failed to assign position:', error);
              alert('위치 할당에 실패했습니다.');
            }
          }}
        />
      )}
    </div>
  );
}