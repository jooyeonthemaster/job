'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, User, Briefcase, Building2, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: '채용공고', href: '/jobs' },
    { name: '기업정보', href: '/companies' },
    { name: '인재풀', href: '/talent' },
  ];

  return (
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
                    "text-sm font-medium transition-colors relative py-2",
                    pathname === item.href
                      ? "text-primary-600"
                      : "text-gray-600 hover:text-primary-600"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            <div className="h-8 w-px bg-gray-200" />
            
            <Link
              href="/company/post-job"
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
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-3">
                <Link
                  href="/company/post-job"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
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
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}