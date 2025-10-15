'use client';

import { Briefcase, Users, Globe, FileText, Building2, Phone } from 'lucide-react';
import { CompanyType, BusinessType, EMPLOYEE_COUNTS } from '@/lib/supabase/company-types';
import {
  COMPANY_TYPES,
  COMPANY_SCALES,
  BUSINESS_CONDITIONS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_DETAILS
} from '@/constants/kwork-options';
import { useState } from 'react';

interface Props {
  formData: {
    companyType: CompanyType | '';
    companyScale: string;
    businessCondition: string;
    industry: string;
    industryDetail: string;
    companyPhone?: string;
    website: string;
    summary?: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function Section2CompanyInfo({ formData, onChange, errors }: Props) {
  // 업종 상세 옵션 (업종 1단계 선택시 동적으로 변경)
  const industryDetailOptions = formData.industry
    ? INDUSTRY_DETAILS[formData.industry] || []
    : [];

  // 업종 1단계 변경시 업종 2단계 초기화
  const handleIndustryChange = (value: string) => {
    onChange('industry', value);
    onChange('industryDetail', ''); // 2단계 초기화
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">기업 기본 정보</h3>
          <p className="text-sm text-gray-600">기업의 유형과 규모 등을 선택해주세요</p>
        </div>
      </div>

      {/* 기업 형태 - K-Work 7개 옵션 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기업 형태 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={formData.companyType}
            onChange={(e) => onChange('companyType', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
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

      {/* 기업 규모 - K-Work 6개 옵션 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기업 규모 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={formData.companyScale}
            onChange={(e) => onChange('companyScale', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
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

      {/* 업태 - K-Work 21개 옵션 (필수) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          업태 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={formData.businessCondition}
            onChange={(e) => onChange('businessCondition', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
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

      {/* 업종 1단계 - K-Work 15개 카테고리 (필수) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          업종 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={formData.industry}
            onChange={(e) => handleIndustryChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
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

      {/* 업종 2단계 - 1단계 선택시 표시 (필수) */}
      {formData.industry && industryDetailOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            업종 상세 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.industryDetail}
              onChange={(e) => onChange('industryDetail', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
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
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={formData.companyPhone || ''}
            onChange={(e) => onChange('companyPhone', e.target.value)}
            placeholder="02-1234-5678 또는 010-1234-5678"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
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
          홈페이지 주소 <span className="text-gray-500">(선택)</span>
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="url"
            value={formData.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder="https://www.example.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
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
            value={formData.summary || ''}
            onChange={(e) => onChange('summary', e.target.value)}
            placeholder="우리 기업을 한 줄로 소개해주세요 (최대 200자)"
            rows={3}
            maxLength={200}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors resize-none"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 text-right">
          {formData.summary?.length || 0} / 200자
        </p>
      </div>
    </div>
  );
}
