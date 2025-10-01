'use client';

import { useState } from 'react';
import { 
  OnboardingStep1,
  validateBusinessNumber,
  validateEmail,
  validatePhone 
} from '@/lib/firebase/company-types';
import { 
  saveOnboardingStep1,
  checkBusinessNumberDuplicate 
} from '@/lib/firebase/company-service';
import { Building2, Calendar, Users, Phone, Globe } from 'lucide-react';

interface Props {
  data: OnboardingStep1 | null;
  onSave: (data: OnboardingStep1) => void;
  uid: string;
}

const industries = [
  'Technology', 'Internet', 'E-commerce', 'Fintech', 
  'Healthcare', 'Education', 'Manufacturing', 'Retail',
  'Food & Beverage', 'Gaming', 'Media', 'Transportation'
];

const employeeCounts = [
  '1-10명', '11-50명', '51-100명', '101-300명',
  '301-1,000명', '1,001-5,000명', '5,000명 이상'
];
export default function Step1BasicInfo({ data, onSave, uid }: Props) {
  const [formData, setFormData] = useState<OnboardingStep1>(data || {
    name: '',
    nameEn: '',
    registrationNumber: '',
    ceoName: '',
    established: '',
    industry: '',
    employeeCount: '',
    phone: '',
    website: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = '회사명을 입력해주세요';
    if (!formData.nameEn) newErrors.nameEn = '영문 회사명을 입력해주세요';
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = '사업자등록번호를 입력해주세요';
    } else if (!validateBusinessNumber(formData.registrationNumber)) {
      newErrors.registrationNumber = '올바른 형식으로 입력해주세요 (예: 123-45-67890)';
    } else {
      const isDuplicate = await checkBusinessNumberDuplicate(formData.registrationNumber, uid);
      if (isDuplicate) {
        newErrors.registrationNumber = '이미 등록된 사업자등록번호입니다';
      }
    }
    if (!formData.ceoName) newErrors.ceoName = '대표자명을 입력해주세요';
    if (!formData.established) newErrors.established = '설립년도를 입력해주세요';
    if (!formData.industry) newErrors.industry = '산업군을 선택해주세요';
    if (!formData.employeeCount) newErrors.employeeCount = '직원수를 선택해주세요';
    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '올바른 형식으로 입력해주세요 (예: 02-1234-5678)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!await validateForm()) return;
    
    try {
      setLoading(true);
      await saveOnboardingStep1(uid, formData);
      onSave(formData);
    } catch (error) {
      console.error('Error saving step 1:', error);
      setErrors({ submit: '저장 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OnboardingStep1, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">기본 정보 입력</h2>
        <p className="text-gray-600">회사의 기본 정보를 입력해주세요</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 회사명 (한글) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            회사명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="예: 삼성전자"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        {/* 회사명 (영문) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            회사명 (영문) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nameEn}
            onChange={(e) => handleChange('nameEn', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.nameEn ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="예: Samsung Electronics"
          />
          {errors.nameEn && <p className="mt-1 text-sm text-red-500">{errors.nameEn}</p>}
        </div>

        {/* 사업자등록번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사업자등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.registrationNumber}
            onChange={(e) => handleChange('registrationNumber', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="123-45-67890"
          />
          {errors.registrationNumber && <p className="mt-1 text-sm text-red-500">{errors.registrationNumber}</p>}
        </div>
        {/* 대표자명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대표자명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.ceoName}
            onChange={(e) => handleChange('ceoName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.ceoName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="예: 김철수"
          />
          {errors.ceoName && <p className="mt-1 text-sm text-red-500">{errors.ceoName}</p>}
        </div>

        {/* 설립년도 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설립년도 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.established}
            onChange={(e) => handleChange('established', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.established ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="예: 2015"
          />
          {errors.established && <p className="mt-1 text-sm text-red-500">{errors.established}</p>}
        </div>
        {/* 산업군 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            산업군 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.industry ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">선택하세요</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && <p className="mt-1 text-sm text-red-500">{errors.industry}</p>}
        </div>

        {/* 직원수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            직원수 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.employeeCount}
            onChange={(e) => handleChange('employeeCount', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.employeeCount ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">선택하세요</option>
            {employeeCounts.map(count => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
          {errors.employeeCount && <p className="mt-1 text-sm text-red-500">{errors.employeeCount}</p>}
        </div>
        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대표 전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="02-1234-5678"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        {/* 웹사이트 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            웹사이트
          </label>
          <input
            type="url"
            value={formData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.submit}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '저장중...' : '다음 단계로'}
        </button>
      </div>
    </form>
  );
}