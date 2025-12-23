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
  Briefcase,
  CheckCircle,
  Circle
} from 'lucide-react';
import Link from 'next/link';

function EditCompanyProfileContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  const sections = [
    { id: 'business', title: '사업자 정보', icon: Building2, description: '사업자등록번호, 기업명, 대표자명, 개업일자', link: '/company-dashboard/edit/business' },
    { id: 'company-info', title: '기업 기본 정보', icon: Briefcase, description: '기업 형태, 규모, 업태, 업종, 홈페이지', link: '/company-dashboard/edit/company-info' },
    { id: 'location', title: '주소 정보', icon: MapPin, description: '회사 주소 및 상세 주소', link: '/company-dashboard/edit/location' },
    { id: 'images', title: '로고 & 회사 이미지', icon: ImageIcon, description: '기업 로고 및 회사 전경 이미지', link: '/company-dashboard/edit/images' },
    { id: 'summary', title: '한 줄 소개', icon: FileText, description: '기업을 한 줄로 소개 (최대 200자)', link: '/company-dashboard/edit/summary' },
    { id: 'basic-benefits', title: '복지 정보', icon: Heart, description: '제공하는 복지 (간단한 태그)', link: '/company-dashboard/edit/basic-benefits' },
    { id: 'manager', title: '담당자 정보', icon: Users, description: '채용 담당 부서 및 담당자 연락처', link: '/company-dashboard/edit/manager' }
  ];

  // 각 섹션의 완성 여부 체크
  const checkSectionCompletion = (sectionId: string): boolean => {
    if (!company) return false;

    switch (sectionId) {
      case 'business':
        return !!(company.registration_number && company.name && company.ceo_name && company.established);
      case 'company-info':
        return !!(company.company_type && company.employee_count && company.website);
      case 'location':
        return !!(company.location && company.address);
      case 'images':
        return !!(company.logo || company.company_image);
      case 'summary':
        return !!(company.summary && company.summary.length >= 20);
      case 'basic-benefits':
        // basic_benefits는 { title: string }[] 구조
        return !!(company.basic_benefits && company.basic_benefits.length > 0);
      case 'manager':
        return !!(company.manager_department && company.manager_name);
      default:
        return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login/company');
          return;
        }

        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.id)
          .single();

        if (companyError || !companyData) {
          router.push('/signup/company');
          return;
        }

        // 복지 정보 조회 (온보딩과 동일)
        const { data: benefitsData } = await supabase
          .from('company_benefits')
          .select('title')
          .eq('company_id', user.id)
          .eq('category', 'basic');

        setCompany({
          ...companyData,
          basic_benefits: benefitsData || []
        });
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
          
          {company && (
            <div className="mt-4 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-900">
                  {sections.filter(s => checkSectionCompletion(s.id)).length} / {sections.length} 항목 완료
                </span>
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all duration-500"
                  style={{ width: `${(sections.filter(s => checkSectionCompletion(s.id)).length / sections.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Edit Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const isCompleted = checkSectionCompletion(section.id);

            return (
              <Link
                key={section.id}
                href={section.link}
                className={`group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 p-6 border-2 ${
                  isCompleted
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-100 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-md flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-100 group-hover:bg-green-600'
                      : 'bg-primary-100 group-hover:bg-primary-600'
                  }`}>
                    <Icon className={`w-7 h-7 transition-colors ${
                      isCompleted
                        ? 'text-green-600 group-hover:text-white'
                        : 'text-primary-600 group-hover:text-white'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {section.title}
                      </h3>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                    {isCompleted && (
                      <p className="text-xs text-green-600 font-medium mt-2">✓ 입력 완료</p>
                    )}
                    {!isCompleted && (
                      <p className="text-xs text-orange-600 font-medium mt-2">→ 입력 필요</p>
                    )}
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors transform rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-primary-50 rounded-lg p-6 border border-blue-200">
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