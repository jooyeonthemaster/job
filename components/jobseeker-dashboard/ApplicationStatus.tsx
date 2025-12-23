// 지원 현황 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Building, Calendar, ChevronRight, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/config';
import { useAuth } from '@/contexts/AuthContext_Supabase';

type Application = {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
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
  const colorMap: Record<string, string> = {
    pending: 'bg-gray-50',
    reviewing: 'bg-gray-50',
    interview: 'bg-green-50',
    accepted: 'bg-blue-50',
    rejected: 'bg-red-50'
  };
  return colorMap[status] || 'bg-gray-50';
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

export default function ApplicationStatus() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('id, job_title, company_name, status, created_at')
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

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
  }, [user?.id]);

  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-600" />
          지원 현황
        </h2>
        <Link href="/applications" className="text-sm text-primary-600 hover:text-primary-700">
          모두 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">아직 지원한 공고가 없습니다.</p>
          <Link
            href="/jobs"
            className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700"
          >
            채용공고 둘러보기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className={`flex items-center justify-between p-3 rounded-lg ${getStatusColor(app.status)}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${app.status === 'interview' ? 'bg-green-100' : 'bg-primary-100'} rounded-lg flex items-center justify-center`}>
                  {app.status === 'interview' ? (
                    <Calendar className="w-5 h-5 text-green-600" />
                  ) : (
                    <Building className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{app.company_name}</p>
                  <p className={`text-xs ${app.status === 'interview' ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                    {app.job_title} • {getStatusLabel(app.status)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{getTimeAgo(app.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
