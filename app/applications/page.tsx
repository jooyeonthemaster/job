'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { supabase } from '@/lib/supabase/config';
import Header from '@/components/Header';
import { Briefcase, Building, Calendar, ArrowLeft } from 'lucide-react';

type Application = {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: string;
  message: string;
  created_at: string;
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '서류 검토 중',
    reviewing: '서류 검토 중',
    interview: '면접 예정',
    accepted: '합격',
    rejected: '불합격'
  };
  return statusMap[status] || '검토 중';
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    reviewing: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    interview: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    accepted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  };
  return colorMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '오늘';
  if (diffInDays === 1) return '어제';
  if (diffInDays < 7) return `${diffInDays}일 전`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
  return `${Math.floor(diffInDays / 30)}개월 전`;
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) {
        router.push('/login/jobseeker');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('id, job_id, job_title, company_name, status, message, created_at')
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('지원 현황 조회 에러:', error);
        } else {
          setApplications(data || []);
        }
      } catch (error) {
        console.error('지원 현황 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">지원 현황을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">지원 현황</h1>
          </div>
          <p className="text-gray-600">
            총 <span className="font-semibold text-primary-600">{applications.length}개</span>의 공고에 지원했습니다
          </p>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              지원한 공고가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              채용 공고를 둘러보고 지원해보세요!
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              채용공고 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const colors = getStatusColor(app.status);
              return (
                <div
                  key={app.id}
                  onClick={() => router.push(`/jobs/${app.job_id}`)}
                  className={`bg-white rounded-xl shadow-sm p-6 border-2 ${colors.border} hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${app.status === 'interview' ? 'bg-green-100' : 'bg-primary-100'} rounded-lg flex items-center justify-center shrink-0`}>
                        {app.status === 'interview' ? (
                          <Calendar className="w-6 h-6 text-green-600" />
                        ) : (
                          <Building className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {app.company_name}
                        </h3>
                        <p className="text-gray-700 mb-2">{app.job_title}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} font-medium`}>
                            {getStatusLabel(app.status)}
                          </span>
                          <span>{getTimeAgo(app.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 지원 메시지 */}
                  {app.message && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">지원 메시지</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.message}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
