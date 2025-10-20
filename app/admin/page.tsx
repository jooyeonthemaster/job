'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import JobsTab from '@/components/admin/JobsTab';
import { Settings, Briefcase, Users, Building2, FileText, LogOut } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'jobs' | 'jobseekers' | 'companies' | 'applications'>('jobs');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // 간단한 어드민 체크 (이메일 기반)
      // 프로덕션에서는 더 강력한 권한 체크 필요
      const adminEmails = [
        'admin@ssmhr.com',
        'joo.y.oh.ko@gmail.com',
        'nadr110619@gmail.com' // 현재 사용 중인 어드민 계정
      ];

      if (!adminEmails.includes(user.email || '')) {
        alert('어드민 권한이 없습니다.');
        router.push('/');
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
                <p className="text-sm text-gray-600">채용공고 및 시스템 관리</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              공고 관리
            </button>
            <button
              onClick={() => setActiveTab('jobseekers')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'jobseekers'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              구직자 관리
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'companies'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-5 h-5" />
              기업 관리
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'applications'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              신청 관리
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'jobs' && <JobsTab />}
        {activeTab === 'jobseekers' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">구직자 관리 기능은 추후 추가됩니다.</p>
          </div>
        )}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">기업 관리 기능은 추후 추가됩니다.</p>
          </div>
        )}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">신청 관리 기능은 추후 추가됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}


