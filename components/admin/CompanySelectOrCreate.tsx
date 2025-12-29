'use client';

import { useState } from 'react';
import { Building2, Upload, CheckCircle2, MapPin, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase/config';
import { uploadLogo } from '@/lib/supabase/company-service';
import { COMPANY_TYPES } from '@/constants/kwork-options';

interface Company {
  id: string;
  name: string;
  name_en?: string;
  logo?: string;
  company_type: string;
  address: string;
  created_by_admin?: boolean;
}

interface CompanySelectOrCreateProps {
  selectedCompanyId: string | null;
  onCompanySelect: (companyId: string, companyData: Company) => void;
  accessToken?: string | null; // ✅ 부모에서 전달받은 토큰 사용 (getSession hang 방지)
}

export default function CompanySelectOrCreate({
  selectedCompanyId,
  onCompanySelect,
  accessToken
}: CompanySelectOrCreateProps) {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // 새 회사 생성 폼 데이터
  const [newCompany, setNewCompany] = useState({
    // 기본 정보 (필수)
    name: '',
    name_en: '',
    company_type: '1', // 기본값: 일반기업
    address: '',
    addressDetail: '',

    // 회사 상세 (필수)
    summary: '',           // 한 줄 소개
    description: '',       // 상세 소개
    employee_count: '',    // 직원 수
    established: '',       // 설립연도
    industry: '',          // 산업

    // 추가 정보 (선택)
    ceo_name: '',          // 대표자명
    website: '',           // 웹사이트
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 로고 파일 선택
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 형식 체크
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, WEBP 파일만 업로드 가능합니다.');
        return;
      }

      setLogoFile(file);

      // 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 다음 주소 검색 (카카오 주소 API)
  const handleSearchAddress = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.daum && window.daum.Postcode) {
      // @ts-ignore
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          const fullAddress = data.roadAddress || data.jibunAddress;
          setNewCompany({ ...newCompany, address: fullAddress });
          setErrors({ ...errors, address: '' });
        },
      }).open();
    } else {
      alert('주소 검색 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 유효성 검사
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 기본 정보 필수 체크
    if (!newCompany.name.trim()) {
      newErrors.name = '기업명은 필수입니다.';
    }
    if (!newCompany.address.trim()) {
      newErrors.address = '주소는 필수입니다.';
    }

    // 상세 정보 필수 체크
    if (!newCompany.summary.trim()) {
      newErrors.summary = '한 줄 소개는 필수입니다.';
    }
    if (!newCompany.description.trim()) {
      newErrors.description = '기업 소개는 필수입니다.';
    }
    if (!newCompany.employee_count) {
      newErrors.employee_count = '직원 수는 필수입니다.';
    }
    if (!newCompany.established) {
      newErrors.established = '설립연도는 필수입니다.';
    }
    if (!newCompany.industry.trim()) {
      newErrors.industry = '산업은 필수입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 새 회사 생성
  const handleCreateCompany = async () => {
    if (!validate()) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    console.log('=== 회사 생성 시작 ===');

    try {
      // 먼저 회사 ID를 생성 (로고 업로드에 필요)
      const tempCompanyId = crypto.randomUUID();

      // 로고 업로드 (있으면) - Cloudinary 사용
      let logoUrl = null;
      if (logoFile) {
        console.log('로고 업로드 시작 (Cloudinary):', logoFile.name);

        try {
          logoUrl = await uploadLogo(logoFile, tempCompanyId);
          console.log('로고 업로드 성공:', logoUrl);
        } catch (logoError: unknown) {
          console.error('로고 업로드 실패:', logoError);
          alert('로고 업로드에 실패했습니다. 로고 없이 회사를 생성합니다.');
        }
      }

      // 회사 생성 (API 라우트 사용)
      const fullAddress = newCompany.address + (newCompany.addressDetail ? ` ${newCompany.addressDetail}` : '');

      console.log('회사 데이터 준비:', {
        name: newCompany.name,
        company_type: newCompany.company_type,
        address: fullAddress,
        hasLogo: !!logoUrl
      });

      console.log('API 호출 시작: /api/admin/companies/create');

      // ✅ 부모에서 전달받은 accessToken 사용 (getSession hang 방지)
      if (!accessToken) {
        throw new Error('세션이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch('/api/admin/companies/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id: tempCompanyId,
          // 기본 정보
          name: newCompany.name,
          name_en: newCompany.name_en || null,
          company_type: newCompany.company_type,
          address: fullAddress,
          logo: logoUrl,
          // 회사 상세
          summary: newCompany.summary,
          description: newCompany.description,
          employee_count: newCompany.employee_count,
          established: newCompany.established,
          industry: newCompany.industry,
          // 추가 정보 (선택)
          ceo_name: newCompany.ceo_name || null,
          website: newCompany.website || null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API 에러:', errorData);
        throw new Error(errorData.error || '회사 생성에 실패했습니다.');
      }

      const result = await response.json();
      console.log('회사 생성 성공:', result.company);

      alert('회사가 생성되었습니다.');

      // 생성된 회사 선택
      onCompanySelect(result.company.id, result.company);

      // 폼 초기화
      setNewCompany({
        name: '',
        name_en: '',
        company_type: '1',
        address: '',
        addressDetail: '',
        summary: '',
        description: '',
        employee_count: '',
        established: '',
        industry: '',
        ceo_name: '',
        website: '',
      });
      setLogoFile(null);
      setLogoPreview('');
      setErrors({});
    } catch (error: unknown) {
      const err = error as any;
      console.error('=== 회사 생성 실패 ===');
      console.error('에러 상세:', error);
      console.error('에러 메시지:', err.message);
      console.error('에러 코드:', err.code);
      console.error('에러 힌트:', err.hint);

      let errorMessage = '회사 생성에 실패했습니다.';
      if (err.message) {
        errorMessage += `\n\n에러: ${err.message}`;
      }
      if (err.hint) {
        errorMessage += `\n힌트: ${err.hint}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
      console.log('=== 회사 생성 종료 ===');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">새 회사 생성</h3>
          <p className="text-sm text-gray-600">최소 필수 정보만 입력하세요. 나머지는 나중에 기업이 직접 수정할 수 있습니다.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 기업명 (한글) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업명 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              placeholder="주식회사 ABC"
              className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* 기업명 (영문) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업명 (영문) <span className="text-gray-500">(선택)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newCompany.name_en}
              onChange={(e) => setNewCompany({ ...newCompany, name_en: e.target.value })}
              placeholder="ABC Corporation"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
            />
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
              value={newCompany.company_type}
              onChange={(e) => setNewCompany({ ...newCompany, company_type: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white"
            >
              {COMPANY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 기본 주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기본 주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={newCompany.address}
                readOnly
                placeholder="주소 검색 버튼을 클릭하세요"
                className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors bg-gray-50 cursor-not-allowed ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={handleSearchAddress}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              주소 검색
            </button>
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* 상세 주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 주소 <span className="text-gray-500">(선택)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newCompany.addressDetail}
              onChange={(e) => setNewCompany({ ...newCompany, addressDetail: e.target.value })}
              placeholder="동, 호수 등 상세 주소를 입력하세요"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 전체 주소 미리보기 */}
        {newCompany.address && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-1">입력된 전체 주소</p>
            <p className="text-sm text-blue-800">
              {newCompany.address}
              {newCompany.addressDetail && ` ${newCompany.addressDetail}`}
            </p>
          </div>
        )}

        {/* 로고 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            로고 <span className="text-gray-500">(선택)</span>
          </label>
          <div>
            <input
              type="file"
              id="companyLogo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <label
              htmlFor="companyLogo"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              {logoPreview ? (
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={logoPreview}
                    alt="로고 미리보기"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-900 font-medium">{logoFile?.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">클릭하여 다른 이미지 선택</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">로고 이미지를 업로드해주세요</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP 파일 (최대 5MB)</p>
                  </div>
                </>
              )}
            </label>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 my-6"></div>
        <h3 className="text-md font-bold text-gray-900 mb-4">회사 상세 정보</h3>

        {/* 한 줄 소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            한 줄 소개 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newCompany.summary}
            onChange={(e) => setNewCompany({ ...newCompany, summary: e.target.value })}
            placeholder="예: 글로벌 1위 전자상거래 플랫폼"
            maxLength={100}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.summary ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">{newCompany.summary.length}/100자</p>
        </div>

        {/* 기업 소개 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업 소개 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={newCompany.description}
            onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
            placeholder="기업의 비전, 미션, 주요 사업 내용 등을 입력하세요"
            rows={5}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* 직원 수 & 설립연도 (2열) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직원 수 <span className="text-red-500">*</span>
            </label>
            <select
              value={newCompany.employee_count}
              onChange={(e) => setNewCompany({ ...newCompany, employee_count: e.target.value })}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors appearance-none bg-white ${
                errors.employee_count ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">선택하세요</option>
              <option value="1-50명">1-50명</option>
              <option value="50-300명">50-300명</option>
              <option value="300-1,000명">300-1,000명</option>
              <option value="1,000-5,000명">1,000-5,000명</option>
              <option value="5,000명 이상">5,000명 이상</option>
              <option value="10,000명 이상">10,000명 이상</option>
            </select>
            {errors.employee_count && (
              <p className="mt-1 text-sm text-red-600">{errors.employee_count}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설립연도 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={newCompany.established}
              onChange={(e) => setNewCompany({ ...newCompany, established: e.target.value })}
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear()}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.established ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.established && (
              <p className="mt-1 text-sm text-red-600">{errors.established}</p>
            )}
          </div>
        </div>

        {/* 산업 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            산업 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newCompany.industry}
            onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
            placeholder="예: IT/소프트웨어, 전자상거래, 핀테크"
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.industry ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 my-6"></div>
        <h3 className="text-md font-bold text-gray-900 mb-4">추가 정보 (선택사항)</h3>

        {/* 대표자명 & 웹사이트 (2열) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표자명 <span className="text-gray-500">(선택)</span>
            </label>
            <input
              type="text"
              value={newCompany.ceo_name}
              onChange={(e) => setNewCompany({ ...newCompany, ceo_name: e.target.value })}
              placeholder="홍길동"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              웹사이트 <span className="text-gray-500">(선택)</span>
            </label>
            <input
              type="url"
              value={newCompany.website}
              onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={handleCreateCompany}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? '생성 중...' : '회사 생성하기'}
        </button>

        {/* 안내 메시지 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            💡 <strong>최소 정보만</strong> 입력하세요. 사업자등록번호, 대표자명, 개업일자, 웹사이트 등은
            나중에 기업이 직접 프로필을 수정할 때 추가할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
