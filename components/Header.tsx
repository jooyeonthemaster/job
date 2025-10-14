'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Globe, User, Briefcase, Building2, Menu, X, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from './OptimizedImage';
import RollingBanner from './RollingBanner';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, userType, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 로딩 중 스켈레톤 렌더링 함수
  const renderAuthButtons = () => {
    if (isLoading) {
      // 로딩 중: 스켈레톤 표시
      return (
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      );
    }

    if (isAuthenticated) {
      // 로그인 상태: 프로필 메뉴
      return (
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {userProfile?.profileImageUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <OptimizedImage
                  src={userProfile.profileImageUrl}
                  alt={userProfile.fullName || 'Profile'}
                  width={32}
                  height={32}
                  type="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {userProfile?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {userProfile?.fullName || user?.email?.split('@')[0]}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {/* Profile Dropdown */}
          {profileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.fullName || '사용자'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.email}
                  </p>
                </div>
                
                <Link
                  href={userType === 'company' ? '/company-dashboard' : '/jobseeker-dashboard'}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  마이페이지
                </Link>
                
                <Link
                  href={userType === 'company' ? '/company-dashboard/edit' : '/profile/edit'}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  프로필 편집
                </Link>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // 로그아웃 상태: 로그인/회원가입 버튼
    return (
      <>
        <Link
          href="/company-auth"
          className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
        >
          기업 서비스
        </Link>
        <Link href="/login" className="btn-outline text-sm">
          로그인
        </Link>
        <Link href="/signup" className="btn-primary text-sm">
          시작하기
        </Link>
      </>
    );
  };

  const navigation = [
    { name: '채용공고', href: '/jobs' },
    { name: '기업정보', href: '/companies' },
    { name: '인재풀', href: '/talent' },
    { name: '해외 인력 채용 도움', href: '/global-hiring' },
  ];

  return (
    <>
      {/* Rolling Banner */}
      <RollingBanner />

      {/* Main Header */}
      <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GlobalTalent</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-[15px] font-bold transition-all duration-200 relative py-2 px-1",
                    pathname === item.href
                      ? "text-primary-600 scale-105"
                      : "text-gray-700 hover:text-primary-600 hover:scale-105"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 rounded-full shadow-sm" />
                  )}
                </Link>
              ))}
            </div>

            {/* Ad Banner Slot */}
            <div className="hidden xl:flex items-center ml-6 pl-6 border-l border-gray-200">
              <div className="group relative">
                <div className="w-[200px] h-[50px] bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-400 group-hover:text-primary-600 transition-colors">
                      광고 배너 영역
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 group-hover:text-primary-500">
                      200 x 50
                    </div>
                  </div>
                </div>

                {/* Hover tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  광고 문의: ad@globaltalent.com
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            
            {isAuthenticated && !isLoading && (
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            )}
            
            <div className="h-8 w-px bg-gray-200" />
            
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-[15px] font-bold rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-primary-50 text-primary-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-100 pt-4 mt-4">
                {isLoading ? (
                  <div className="px-4 space-y-3">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      href={userType === 'company' ? '/company-dashboard' : '/jobseeker-dashboard'}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      마이페이지
                    </Link>
                    <Link
                      href={userType === 'company' ? '/company-dashboard/edit' : '/profile/edit'}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      프로필 편집
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/company-auth"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      기업 서비스
                    </Link>
                    <div className="flex gap-3 px-4">
                      <Link href="/login" className="flex-1 btn-outline text-sm text-center">
                        로그인
                      </Link>
                      <Link href="/signup" className="flex-1 btn-primary text-sm text-center">
                        시작하기
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
    </>
  );
}