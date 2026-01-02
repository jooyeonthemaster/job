'use client';

// 관리자 회원 관리 탭 컴포넌트
// 모든 구직자 및 기업 회원 정보 조회

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Search, Users, Building2, Mail, Phone, Calendar, Eye, ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';

type UserType = 'all' | 'jobseeker' | 'company';

type JobseekerMember = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  nationality: string | null;
  headline: string | null;
  profile_image_url: string | null;
  resume_file_url: string | null;
  introduction: string | null;
  skills: string[] | null;
  languages: string[] | null;
  desired_positions: string[] | null;
  preferred_locations: string[] | null;
  work_type: string | null;
  visa_sponsorship: boolean | null;
  onboarding_completed: boolean;
  talent_pool_published: boolean;
  profile_completion: number | null;
  created_at: string;
  updated_at: string;
};

type CompanyMember = {
  id: string;
  email: string;
  name: string;
  name_en: string | null;
  phone: string | null;
  company_phone: string | null;
  logo: string | null;
  summary: string | null;
  website: string | null;
  industry: string | null;
  employee_count: string | null;
  address: string | null;
  manager_name: string | null;
  manager_phone: string | null;
  manager_department: string | null;
  status: string;
  profile_completed: boolean | null;
  created_at: string;
  updated_at: string;
};

export default function AdminMembersTab() {
  const [userType, setUserType] = useState<UserType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobseekers, setJobseekers] = useState<JobseekerMember[]>([]);
  const [companies, setCompanies] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobseeker, setExpandedJobseeker] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // 구직자 조회
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('user_type', 'jobseeker')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        setJobseekers(usersData || []);

        // 기업 조회
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // 검색 필터링
  const filteredJobseekers = jobseekers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });

  const filteredCompanies = companies.filter(company => {
    const searchLower = searchTerm.toLowerCase();
    return (
      company.name?.toLowerCase().includes(searchLower) ||
      company.email?.toLowerCase().includes(searchLower) ||
      company.phone?.includes(searchTerm)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">전체 회원</p>
              <p className="text-2xl font-bold text-blue-900">{jobseekers.length + companies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">구직자</p>
              <p className="text-2xl font-bold text-green-900">{jobseekers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600">기업</p>
              <p className="text-2xl font-bold text-purple-900">{companies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 회원 유형 필터 */}
        <div className="flex gap-2">
          <button
            onClick={() => setUserType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              userType === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setUserType('jobseeker')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              userType === 'jobseeker'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            구직자
          </button>
          <button
            onClick={() => setUserType('company')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              userType === 'company'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            기업
          </button>
        </div>

        {/* 검색 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 이메일, 전화번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 구직자 목록 */}
      {(userType === 'all' || userType === 'jobseeker') && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b bg-green-50">
            <h3 className="font-semibold text-green-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              구직자 ({filteredJobseekers.length}명)
            </h3>
          </div>
          <div className="divide-y">
            {filteredJobseekers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredJobseekers.map((user) => (
                <div key={user.id} className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedJobseeker(expandedJobseeker === user.id ? null : user.id)}
                  >
                    <div className="flex items-center gap-4">
                      {user.profile_image_url ? (
                        <img
                          src={user.profile_image_url}
                          alt={user.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-lg">
                            {user.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || '이름 없음'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-500">가입일</p>
                        <p className="text-gray-700">{formatDate(user.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        {user.talent_pool_published && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">인재풀</span>
                        )}
                        {user.onboarding_completed && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">온보딩 완료</span>
                        )}
                      </div>
                      {expandedJobseeker === user.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* 상세 정보 */}
                  {expandedJobseeker === user.id && (
                    <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">연락처 정보</h4>
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{user.email}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{user.phone || '미입력'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">가입: {formatDate(user.created_at)}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">프로필 정보</h4>
                        <p><span className="text-gray-500">국적:</span> {user.nationality || '미입력'}</p>
                        <p><span className="text-gray-500">헤드라인:</span> {user.headline || '미입력'}</p>
                        <p><span className="text-gray-500">희망 직무:</span> {user.desired_positions?.join(', ') || '미입력'}</p>
                        <p><span className="text-gray-500">희망 지역:</span> {user.preferred_locations?.join(', ') || '미입력'}</p>
                        <p><span className="text-gray-500">근무 형태:</span> {user.work_type || '미입력'}</p>
                        <p><span className="text-gray-500">비자 스폰서:</span> {user.visa_sponsorship ? '필요' : '불필요'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">스킬 & 언어</h4>
                        <p><span className="text-gray-500">스킬:</span> {user.skills?.join(', ') || '미입력'}</p>
                        <p><span className="text-gray-500">언어:</span> {user.languages?.join(', ') || '미입력'}</p>
                        <p><span className="text-gray-500">프로필 완성도:</span> {user.profile_completion || 0}%</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">자기소개</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {user.introduction || '미입력'}
                        </p>
                        {user.resume_file_url && (
                          <a
                            href={user.resume_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                          >
                            <FileText className="w-4 h-4" />
                            이력서 보기
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* 인재풀 상세 보기 링크 */}
                      {user.talent_pool_published && (
                        <div className="md:col-span-2 pt-2">
                          <a
                            href={`/talent/${user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            인재풀 상세 페이지 보기
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 기업 목록 */}
      {(userType === 'all' || userType === 'company') && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b bg-purple-50">
            <h3 className="font-semibold text-purple-800 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              기업 ({filteredCompanies.length}개)
            </h3>
          </div>
          <div className="divide-y">
            {filteredCompanies.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div key={company.id} className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                  >
                    <div className="flex items-center gap-4">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-12 h-12 rounded-lg object-contain bg-gray-100 p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-500">가입일</p>
                        <p className="text-gray-700">{formatDate(company.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          company.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : company.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {company.status === 'active' ? '활성' : company.status === 'pending' ? '대기' : '비활성'}
                        </span>
                        {company.profile_completed && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">프로필 완료</span>
                        )}
                      </div>
                      {expandedCompany === company.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* 상세 정보 */}
                  {expandedCompany === company.id && (
                    <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">기본 정보</h4>
                        <p><span className="text-gray-500">회사명:</span> {company.name}</p>
                        <p><span className="text-gray-500">영문명:</span> {company.name_en || '미입력'}</p>
                        <p><span className="text-gray-500">업종:</span> {company.industry || '미입력'}</p>
                        <p><span className="text-gray-500">규모:</span> {company.employee_count || '미입력'}</p>
                        <p><span className="text-gray-500">주소:</span> {company.address || '미입력'}</p>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            웹사이트 방문
                          </a>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">연락처 정보</h4>
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{company.email}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">회사: {company.company_phone || company.phone || '미입력'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">가입: {formatDate(company.created_at)}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">담당자 정보</h4>
                        <p><span className="text-gray-500">담당자:</span> {company.manager_name || '미입력'}</p>
                        <p><span className="text-gray-500">부서:</span> {company.manager_department || '미입력'}</p>
                        <p><span className="text-gray-500">연락처:</span> {company.manager_phone || '미입력'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">회사 소개</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {company.summary || '미입력'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
