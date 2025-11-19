'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/config';
import { Building2, Briefcase, Calendar, MapPin, Eye, Trash2, ChevronDown, ChevronUp, Plus, Edit } from 'lucide-react';
import CompanySelectOrCreate from './CompanySelectOrCreate';

interface AdminCompany {
  id: string;
  name: string;
  name_en: string | null;
  company_type: string;
  address: string;
  logo: string | null;
  created_at: string;
  created_by: string;
  _count?: {
    jobs: number;
  };
}

interface AdminJob {
  id: string;
  title: string;
  status: string;
  created_at: string;
  views: number;
  company: {
    name: string;
  };
}

export default function AdminCreatedTab() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Record<string, AdminJob[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
  });

  useEffect(() => {
    fetchAdminCreatedData();
  }, []);

  const fetchAdminCreatedData = async () => {
    try {
      setLoading(true);

      // 관리자가 생성한 회사 목록
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by_admin', true)
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;

      // 각 회사의 공고 수 조회
      const companiesWithCount = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);

          return {
            ...company,
            _count: { jobs: count || 0 }
          };
        })
      );

      setCompanies(companiesWithCount);

      // 전체 공고 통계
      const { data: allJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, status, company_id')
        .in('company_id', companiesData?.map(c => c.id) || []);

      if (!jobsError && allJobs) {
        setStats({
          totalCompanies: companiesWithCount.length,
          totalJobs: allJobs.length,
          activeJobs: allJobs.filter(j => j.status === 'active').length,
        });
      }

    } catch (error) {
      console.error('관리자 생성 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async (companyId: string) => {
    if (companyJobs[companyId]) return; // 이미 로드됨

    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          status,
          created_at,
          views,
          company:companies(name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase는 company를 배열로 반환하므로 변환 필요
      const transformedJobs: AdminJob[] = jobs?.map((job: any) => ({
        ...job,
        company: job.company[0] || { name: '' }
      })) || [];

      setCompanyJobs(prev => ({
        ...prev,
        [companyId]: transformedJobs
      }));
    } catch (error) {
      console.error('공고 조회 실패:', error);
    }
  };

  const toggleCompany = async (companyId: string) => {
    if (expandedCompanyId === companyId) {
      setExpandedCompanyId(null);
    } else {
      setExpandedCompanyId(companyId);
      await fetchCompanyJobs(companyId);
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`"${companyName}" 회사를 삭제하시겠습니까?\n\n⚠️ 이 회사의 모든 공고도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      // 먼저 해당 회사의 공고 삭제
      const { error: jobsDeleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('company_id', companyId);

      if (jobsDeleteError) throw jobsDeleteError;

      // 회사 삭제
      const { error: companyDeleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (companyDeleteError) throw companyDeleteError;

      alert('회사가 삭제되었습니다.');
      fetchAdminCreatedData();
    } catch (error: unknown) {
      console.error('삭제 실패:', error);
      alert(`삭제 실패: ${(error as Error).message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      active: { label: '활성', color: 'bg-green-100 text-green-800' },
      draft: { label: '임시저장', color: 'bg-gray-100 text-gray-800' },
      closed: { label: '마감', color: 'bg-red-100 text-red-800' },
      pending: { label: '검토중', color: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCompanyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      '1': '일반기업',
      '3': '외국계기업',
      '4': '벤처기업',
      '5': '공기업, 공공기관',
      '8': '비영리단체·협회·재단',
      '9': '외국기관·단체',
      '10': '스타트업',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">데이터 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">관리자 생성 회사</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">전체 공고</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">활성 공고</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 회사 목록 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">관리자가 생성한 회사 목록</h2>
              <p className="text-sm text-gray-600 mt-1">클릭하여 각 회사의 공고를 확인하세요</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              회사 등록
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {companies.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">관리자가 생성한 회사가 없습니다.</p>
            </div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="hover:bg-gray-50 transition-colors">
                {/* 회사 정보 */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* 로고 */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                          {company.name_en && (
                            <span className="text-sm text-gray-500">({company.name_en})</span>
                          )}
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full font-medium">
                            {getCompanyTypeLabel(company.company_type)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {company.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(company.created_at).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            공고 {company._count?.jobs || 0}개
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/companies/${company.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="회사 정보 수정"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCompany(company.id, company.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="회사 삭제"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleCompany(company.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedCompanyId === company.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 공고 목록 (펼쳐진 경우) */}
                {expandedCompanyId === company.id && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">공고 목록</h4>
                        <Link
                          href={`/admin/jobs/create?companyId=${company.id}&companyName=${encodeURIComponent(company.name)}`}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          공고 등록
                        </Link>
                      </div>
                      {companyJobs[company.id]?.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-600 mb-4">등록된 공고가 없습니다.</p>
                          <Link
                            href={`/admin/jobs/create?companyId=${company.id}&companyName=${encodeURIComponent(company.name)}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            첫 공고 등록하기
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {companyJobs[company.id]?.map((job) => (
                            <div
                              key={job.id}
                              className="bg-white p-4 rounded-lg flex items-center justify-between hover:shadow-sm transition-shadow"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h5 className="font-medium text-gray-900">{job.title}</h5>
                                  {getStatusBadge(job.status)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(job.created_at).toLocaleDateString('ko-KR')}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    조회 {job.views || 0}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/jobs/${job.id}/edit`}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                  수정
                                </Link>
                                <a
                                  href={`/jobs/${job.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                >
                                  상세보기
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 회사 등록 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">새 회사 등록</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CompanySelectOrCreate
                selectedCompanyId=""
                onCompanySelect={(id, company) => {
                  setShowCreateModal(false);
                  fetchAdminCreatedData(); // 목록 새로고침
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
