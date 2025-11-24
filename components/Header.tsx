'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Globe, User, Menu, X, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import OptimizedImage from './OptimizedImage';
import RollingBanner from './RollingBanner';
import AdBanner from '@/components/ui/AdBanner';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, userType, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('한국어');

  // 언어 매핑
  const langMap: Record<string, string> = {
    '': '한국어',
    'ko': '한국어',
    'en': 'English',
    'zh-CN': '中文(简体)',
    'zh-TW': '中文(繁體)',
    'ja': '日本語',
    'vi': 'Tiếng Việt',
    'th': 'ไทย',
    'id': 'Bahasa Indonesia',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'ru': 'Русский',
    'pt': 'Português',
    'ar': 'العربية',
  };

  // Cookie에서 언어 코드 읽기
  const getLanguageFromCookie = () => {
    if (typeof document === 'undefined') return '';
    
    const cookies = document.cookie.split(';');
    const googtransCookie = cookies.find(c => c.trim().startsWith('googtrans='));
    
    if (googtransCookie) {
      const value = googtransCookie.split('=')[1];
      // googtrans=/ko/en 형식에서 언어 코드 추출
      const match = value.match(/\/[^\/]+\/(.+)/);
      if (match) {
        return match[1];
      }
    }
    return '';
  };

  // Google Translate 초기화 - Cookie에서만 언어 확인 (빠른 로딩)
  useEffect(() => {
    // Cookie에서 언어 확인
    const cookieLang = getLanguageFromCookie();
    if (cookieLang && langMap[cookieLang]) {
      setCurrentLanguage(langMap[cookieLang]);
      console.log('[Header] 현재 언어:', langMap[cookieLang], `(${cookieLang})`);
    } else {
      console.log('[Header] 현재 언어: 한국어 (기본값)');
    }
  }, []);

  // 언어 변경 핸들러 (간소화 - 빠른 번역)
  const handleLanguageChange = (langCode: string, langName: string) => {
    if (typeof window === 'undefined') return;

    setLanguageMenuOpen(false);
    setCurrentLanguage(langName);

    console.log(`[언어 변경] ${langName} (${langCode}) 선택됨`);

    // 언어 코드가 'ko'인 경우 원래 언어로 복원
    if (langCode === 'ko' || langCode === '') {
      // 한국어로 복원 - cookie 삭제
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      console.log('[언어 변경] 한국어로 복원, 새로고침...');
      
      // 즉시 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // Cookie 직접 설정 (Google Translate Widget 기다리지 않음)
    const cookieValue = `/ko/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}; max-age=31536000`;
    
    console.log('[언어 변경] Cookie 설정 완료, 즉시 새로고침...');
    
    // 즉시 새로고침 (100ms만 대기)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // 페이지 새로고침과 함께 홈으로 이동
      window.location.href = '/';
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
            {userProfile?.profileImageUrl || userProfile?.profile_image_url ? (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <OptimizedImage
                  src={userProfile.profileImageUrl || userProfile.profile_image_url}
                  alt={userProfile.fullName || userProfile.full_name || userProfile.name || 'Profile'}
                  width={32}
                  height={32}
                  type="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {(userProfile?.fullName || userProfile?.full_name || userProfile?.name)?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {userProfile?.fullName || userProfile?.full_name || userProfile?.name || user?.email?.split('@')[0]}
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
                    {userProfile?.fullName || userProfile?.full_name || userProfile?.name || '사용자'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userProfile?.email || user?.email || '이메일 정보 없음'}
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

      {/* Main Header - 2-tier structure */}
      <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        {/* Top Tier: Logo + Search + Auth */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo + Search Bar */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.jpg"
                    alt="Bridge World"
                    width={160}
                    height={45}
                    className="h-11 w-auto object-contain"
                    priority
                  />
                </Link>

                {/* Search Bar - Desktop */}
                <div className="hidden lg:flex">
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 px-4 py-2 flex items-center gap-2 w-[400px]">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="직무, 회사, 키워드 검색..."
                      className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400"
                    />
                    <button className="px-3 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all">
                      검색
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{currentLanguage}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Language Dropdown */}
                  {languageMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setLanguageMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase">언어 선택</p>
                        </div>
                        {[
                          { code: 'ko', name: '한국어', native: '한국어' },
                          { code: 'en', name: 'English', native: 'English' },
                          { code: 'zh-CN', name: '中文(简体)', native: '中文(简体)' },
                          { code: 'zh-TW', name: '中文(繁體)', native: '中文(繁體)' },
                          { code: 'ja', name: '日本語', native: '日本語' },
                          { code: 'vi', name: 'Tiếng Việt', native: 'Tiếng Việt' },
                          { code: 'th', name: 'ไทย', native: 'ไทย' },
                          { code: 'id', name: 'Bahasa Indonesia', native: 'Bahasa Indonesia' },
                          { code: 'es', name: 'Español', native: 'Español' },
                          { code: 'fr', name: 'Français', native: 'Français' },
                          { code: 'de', name: 'Deutsch', native: 'Deutsch' },
                          { code: 'ru', name: 'Русский', native: 'Русский' },
                          { code: 'pt', name: 'Português', native: 'Português' },
                          { code: 'ar', name: 'العربية', native: 'العربية' },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code, lang.native)}
                            className={cn(
                              "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between",
                              currentLanguage === lang.native && "bg-primary-50 text-primary-600"
                            )}
                          >
                            <span>{lang.native}</span>
                            {currentLanguage === lang.native && (
                              <span className="text-primary-600">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

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
          </div>
        </div>

        {/* Bottom Tier: Navigation + Ad Banner */}
        <div className="hidden lg:block">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Navigation Links */}
              <div className="flex items-center gap-8">
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

              {/* Ad Banner */}
              <div className="flex items-center">
                <AdBanner position="header" width={400} height={50} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="container mx-auto px-4 lg:px-8">
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
                  {/* Mobile Language Selector */}
                  <div className="px-4 mb-4">
                    <div className="relative">
                      <button
                        onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>{currentLanguage}</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {languageMenuOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-64 overflow-y-auto">
                          {[
                            { code: 'ko', name: '한국어', native: '한국어' },
                            { code: 'en', name: 'English', native: 'English' },
                            { code: 'zh-CN', name: '中文(简体)', native: '中文(简体)' },
                            { code: 'zh-TW', name: '中文(繁體)', native: '中文(繁體)' },
                            { code: 'ja', name: '日本語', native: '日本語' },
                            { code: 'vi', name: 'Tiếng Việt', native: 'Tiếng Việt' },
                            { code: 'th', name: 'ไทย', native: 'ไทย' },
                            { code: 'id', name: 'Bahasa Indonesia', native: 'Bahasa Indonesia' },
                            { code: 'es', name: 'Español', native: 'Español' },
                            { code: 'fr', name: 'Français', native: 'Français' },
                            { code: 'de', name: 'Deutsch', native: 'Deutsch' },
                            { code: 'ru', name: 'Русский', native: 'Русский' },
                            { code: 'pt', name: 'Português', native: 'Português' },
                            { code: 'ar', name: 'العربية', native: 'العربية' },
                          ].map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code, lang.native)}
                              className={cn(
                                "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between",
                                currentLanguage === lang.native && "bg-primary-50 text-primary-600"
                              )}
                            >
                              <span>{lang.native}</span>
                              {currentLanguage === lang.native && (
                                <span className="text-primary-600">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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
          </div>
        )}
      </header>
    </>
  );
}