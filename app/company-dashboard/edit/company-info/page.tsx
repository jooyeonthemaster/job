'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { Briefcase, Users, Globe, FileText, Building2, Save, ArrowLeft, Phone } from 'lucide-react';
import { CompanyType } from '@/lib/supabase/company-types';
import {
  COMPANY_TYPES,
  COMPANY_SCALES,
  BUSINESS_CONDITIONS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_DETAILS
} from '@/constants/kwork-options';
import Link from 'next/link';

function EditCompanyInfoContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');

  const [formData, setFormData] = useState({
    companyType: '' as CompanyType | '',
    companyScale: '',
    businessCondition: '',
    industry: '',
    industryDetail: '',
    companyPhone: '',
    website: '',
    summary: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login/company');
          return;
        }

        setUid(user.id);

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.id)
          .single();

        if (companyError || !company) {
          router.push('/signup/company');
          return;
        }

        setFormData({
          companyType: company.company_type || '',
          companyScale: company.employee_count || '',
          businessCondition: company.industry || '',
          industry: company.industry_category || '',
          industryDetail: company.industry_detail || '',
          companyPhone: company.company_phone || '',
          website: company.website || '',
          summary: company.summary || '',
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // 업종 상세 옵션
  const industryDetailOptions = formData.industry
    ? INDUSTRY_DETAILS[formData.industry] || []
    : [];

  // 업종 1단계 변경시 업종 2단계 초기화
  const handleIndustryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      industry: value,
      industryDetail: '', // 2단계 초기화
    }));
    setErrors(prev => ({ ...prev, industry: '', industryDetail: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 온보딩과 동일하게: companyType, companyScale, website만 필수
    if (!formData.companyType) {
      newErrors.companyType = '기업 형태를 선택해주세요.';
    }

    if (!formData.companyScale) {
      newErrors.companyScale = '기업 규모를 선택해주세요.';
    }

    // businessCondition, industry는 선택사항이므로 검사 제거

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          company_type: formData.companyType,
          employee_count: formData.companyScale,
          industry: formData.businessCondition || null,
          industry_category: formData.industry || null,
          industry_detail: formData.industryDetail || null,
          company_phone: formData.companyPhone || null,
          website: formData.website || null,
          summary: formData.summary || null,
        })
        .eq('id', uid);

      if (error) throw error;

      alert('저장되었습니다.');
      router.push('/company-dashboard/edit');
    } catch (error) {
      console.error('Save error:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/company-dashboard/edit"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">기업 기본 정보 수정</h1>
          <p className="text-gray-600 mt-1">기업의 유형과 규모 등을 수정합니다</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">기업 기본 정보</h3>
                <p className="text-sm text-gray-600">기업의 유형과 규모 등을 선택해주세요</p>
              </div>
            </div>

            {/* 기업 형태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기업 형태 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.companyType}
                  onChange={(e) => handleChange('companyType', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
                    errors.companyType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">기업 형태 선택</option>
                  {COMPANY_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.companyType && (
                <p className="mt-1 text-sm text-red-600">{errors.companyType}</p>
              )}
            </div>

            {/* 기업 규모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기업 규모 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.companyScale}
                  onChange={(e) => handleChange('companyScale', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
                    errors.companyScale ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">기업 규모 선택</option>
                  {COMPANY_SCALES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.companyScale && (
                <p className="mt-1 text-sm text-red-600">{errors.companyScale}</p>
              )}
            </div>

            {/* 업태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업태 <span className="text-gray-500">(선택)</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.businessCondition}
                  onChange={(e) => handleChange('businessCondition', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
                    errors.businessCondition ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">업태 선택</option>
                  {BUSINESS_CONDITIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.businessCondition && (
                <p className="mt-1 text-sm text-red-600">{errors.businessCondition}</p>
              )}
            </div>

            {/* 업종 1단계 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업종 <span className="text-gray-500">(선택)</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.industry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
                    errors.industry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">업종 선택</option>
                  {INDUSTRY_CATEGORIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
              )}
            </div>

            {/* 업종 2단계 */}
            {formData.industry && industryDetailOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업종 상세 <span className="text-gray-500">(선택)</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.industryDetail}
                    onChange={(e) => handleChange('industryDetail', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
                      errors.industryDetail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">업종 상세 선택</option>
                    {industryDetailOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.industryDetail && (
                  <p className="mt-1 text-sm text-red-600">{errors.industryDetail}</p>
                )}
              </div>
            )}

            {/* 대표번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표번호 <span className="text-gray-500">(선택)</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.companyPhone}
                  onChange={(e) => handleChange('companyPhone', e.target.value)}
                  placeholder="02-1234-5678 또는 010-1234-5678"
                  className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                    errors.companyPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.companyPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.companyPhone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">하이픈(-)을 포함하여 입력해주세요</p>
            </div>

            {/* 홈페이지 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                홈페이지 주소 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">전체 URL을 입력해주세요 (예: https://www.example.com)</p>
            </div>

            {/* 한 줄 소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기업 한 줄 소개 <span className="text-gray-500">(선택)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  placeholder="우리 기업을 한 줄로 소개해주세요 (최대 200자)"
                  rows={3}
                  maxLength={200}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors resize-none"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.summary.length} / 200자
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Link
              href="/company-dashboard/edit"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center font-medium"
            >
              취소
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditCompanyInfo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    }>
      <EditCompanyInfoContent />
    </Suspense>
  );
}
