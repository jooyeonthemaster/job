'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import JobsTab from '@/components/admin/JobsTab';
import AdminCreatedTab from '@/components/admin/AdminCreatedTab';
import ProfileViewsTab from '@/components/admin/ProfileViewsTab';
import BannersTab from '@/components/admin/BannersTab';
import AdminPaymentsTab from '@/components/admin/AdminPaymentsTab';
import { Settings, Briefcase, LogOut, Star, Eye, Monitor, CreditCard } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'jobs' | 'admin-created' | 'profile-views' | 'payments' | 'banners'>('jobs');
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
        'nadr110619@gmail.com',
        'admin@gmail.com', // 추가된 관리자 계정
        'yjpark@ssmhr.com' // 추가된 관리자 계정
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
        <div className="px-8 py-4">
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
        <div className="px-8">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              공고 관리
            </button>
            <button
              onClick={() => setActiveTab('admin-created')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'admin-created'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-5 h-5" />
              관리자 생성 항목
            </button>
            <button
              onClick={() => setActiveTab('profile-views')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'profile-views'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-5 h-5" />
              프로필 열람 내역
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              결제 내역
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'banners'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-5 h-5" />
              광고 배너 관리
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        {activeTab === 'jobs' && <JobsTab />}
        {activeTab === 'admin-created' && <AdminCreatedTab />}
        {activeTab === 'profile-views' && <ProfileViewsTab />}
        {activeTab === 'payments' && <AdminPaymentsTab />}
        {activeTab === 'banners' && <BannersTab />}
      </div>
    </div>
  );
}


