'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  Settings,
  Bell,
  Shield,
  BarChart3,
  FileText,
  UserCheck,
  UserX,
  DollarSign
} from 'lucide-react';
import { jobs, companies } from '@/lib/data';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalApplicants: 15420,
    activeApplicants: 8750,
    totalCompanies: companies.length,
    totalJobs: jobs.length,
    pendingApplications: 234,
    interviewScheduled: 56,
    monthlyRevenue: 12500000,
    growthRate: 23.5
  };

  const recentApplications = [
    { id: '1', name: 'John Smith', position: 'Frontend Developer', company: '삼성전자', status: 'PENDING', appliedAt: '2시간 전' },
    { id: '2', name: 'Maria Garcia', position: 'Data Analyst', company: '토스', status: 'REVIEWING', appliedAt: '3시간 전' },
    { id: '3', name: 'Ahmed Hassan', position: 'Backend Engineer', company: '네이버', status: 'INTERVIEW', appliedAt: '5시간 전' },
    { id: '4', name: 'Li Wei', position: 'UX/UI Designer', company: '카카오', status: 'PENDING', appliedAt: '1일 전' },
  ];

  const navigation = [
    { id: 'overview', label: '대시보드', icon: BarChart3 },
    { id: 'applicants', label: '구직자 관리', icon: Users },
    { id: 'companies', label: '기업 관리', icon: Building2 },
    { id: 'jobs', label: '채용공고 관리', icon: Briefcase },
    { id: 'applications', label: '지원 현황', icon: FileText },
    { id: 'settings', label: '설정', icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400';
      case 'REVIEWING': return 'text-blue-400';
      case 'INTERVIEW': return 'text-purple-400';
      case 'ACCEPTED': return 'text-green-400';
      case 'REJECTED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'REVIEWING': return '검토중';
      case 'INTERVIEW': return '면접예정';
      case 'ACCEPTED': return '합격';
      case 'REJECTED': return '불합격';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Admin Header */}
      <header className="glass border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-gradient">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 glass-button rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/" className="px-4 py-2 glass-button rounded-lg text-sm">
              메인 사이트
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen glass-dark border-r border-white/10">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white mb-8">관리자 대시보드</h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-400" />
                    <span className="text-xs text-green-400">+12.5%</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalApplicants.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">전체 구직자</p>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <UserCheck className="w-8 h-8 text-green-400" />
                    <span className="text-xs text-green-400">+8.3%</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.activeApplicants.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">활성 구직자</p>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Building2 className="w-8 h-8 text-purple-400" />
                    <span className="text-xs text-green-400">+5</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalCompanies}</p>
                  <p className="text-sm text-gray-400">등록 기업</p>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Briefcase className="w-8 h-8 text-orange-400" />
                    <span className="text-xs text-green-400">+23</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
                  <p className="text-sm text-gray-400">활성 채용공고</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    월별 지원 현황
                  </h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    [차트 영역]
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    수익 현황
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        ₩{(stats.monthlyRevenue / 10000).toLocaleString()}만
                      </p>
                      <p className="text-sm text-gray-400">이번 달 수익</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">↑ {stats.growthRate}%</span>
                      <span className="text-sm text-gray-400">전월 대비</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">최근 지원 현황</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">지원자</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">포지션</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">기업</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">상태</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">지원일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-sm text-white">{app.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">{app.position}</td>
                          <td className="py-3 px-4 text-sm text-gray-300">{app.company}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${getStatusColor(app.status)}`}>
                              {getStatusLabel(app.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-400">{app.appliedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applicants' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">구직자 관리</h1>
              <div className="glass-card rounded-xl p-8 text-center">
                <UserCheck className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-400">구직자 관리 기능 구현 예정</p>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">기업 관리</h1>
              <div className="glass-card rounded-xl p-8 text-center">
                <Building2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-400">기업 관리 기능 구현 예정</p>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">채용공고 관리</h1>
              <div className="glass-card rounded-xl p-8 text-center">
                <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-400">채용공고 관리 기능 구현 예정</p>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">지원 현황</h1>
              <div className="glass-card rounded-xl p-8 text-center">
                <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-400">지원 현황 관리 기능 구현 예정</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">설정</h1>
              <div className="glass-card rounded-xl p-8 text-center">
                <Settings className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-gray-400">시스템 설정 기능 구현 예정</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}