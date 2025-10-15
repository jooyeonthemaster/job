'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import {
  ArrowLeft,
  Building2,
  MapPin,
  FileText,
  Users,
  AlertCircle,
  Image as ImageIcon,
  Code,
  Heart,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

function EditCompanyProfileContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const sections = [
    { id: 'business', title: '사업자 정보', icon: Building2, description: '사업자등록번호, 기업명, 대표자명 등', link: '/company-dashboard/edit/business' },
    { id: 'company-info', title: '기업 기본 정보', icon: Briefcase, description: '기업 형태, 규모, 업종 등', link: '/company-dashboard/edit/company-info' },
    { id: 'location', title: '위치 정보', icon: MapPin, description: '회사 주소 및 위치', link: '/company-dashboard/edit/location' },
    { id: 'images', title: '로고 & 배너', icon: ImageIcon, description: '기업 로고 및 배너 이미지', link: '/company-dashboard/edit/images' },
    { id: 'introduction', title: '회사 소개', icon: FileText, description: '회사 설명, 비전, 미션 등', link: '/company-dashboard/edit/introduction' },
    { id: 'techstack', title: '기술 스택', icon: Code, description: '사용 중인 기술 스택', link: '/company-dashboard/edit/techstack' },
    { id: 'benefits', title: '복지 정보', icon: Heart, description: '제공하는 복지 혜택', link: '/company-dashboard/edit/benefits' },
    { id: 'manager', title: '담당자 정보', icon: Users, description: '채용 담당자 연락처', link: '/company-dashboard/edit/manager' }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login/company');
          return;
        }

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('id', user.id)
          .single();

        if (companyError || !company) {
          router.push('/signup/company');
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login/company');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/company-dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>대시보드로 돌아가기</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 정보 수정</h1>
          <p className="text-gray-600">기업 정보를 최신 상태로 유지해주세요</p>
        </div>

        {/* Edit Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.id}
                href={section.link}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-primary-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                    <Icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors transform rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-primary-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">기업 정보 수정 가이드</h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li>• 각 카드를 클릭하여 해당 정보를 수정할 수 있습니다</li>
                <li>• 수정한 내용은 즉시 구직자에게 공개됩니다</li>
                <li>• 정확하고 최신의 정보를 유지하면 더 많은 지원자를 유치할 수 있습니다</li>
                <li>• 로고, 회사 소개, 복지 정보는 필수적으로 입력해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense로 감싼 export default 컴포넌트
export default function EditCompanyProfile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    }>
      <EditCompanyProfileContent />
    </Suspense>
  );
}