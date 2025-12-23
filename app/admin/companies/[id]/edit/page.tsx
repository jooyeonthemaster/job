'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { uploadLogo } from '@/lib/supabase/company-service';
import { COMPANY_TYPES } from '@/constants/kwork-options';
import { Building2, Upload, ArrowLeft, Loader } from 'lucide-react';

export default function AdminCompanyEditPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [company, setCompany] = useState({
    // 기본 정보
    name: '',
    name_en: '',
    company_type: '1',
    address: '',
    logo: '',

    // 회사 상세
    summary: '',
    description: '',
    employee_count: '',
    established: '',
    industry: '',

    // 추가 정보
    ceo_name: '',
    website: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;

      if (data) {
        setCompany({
          name: data.name || '',
          name_en: data.name_en || '',
          company_type: data.company_type || '1',
          address: data.address || '',
          logo: data.logo || '',
          summary: data.summary || '',
          description: data.description || '',
          employee_count: data.employee_count || '',
          established: data.established || '',
          industry: data.industry || '',
          ceo_name: data.ceo_name || '',
          website: data.website || '',
        });
        setLogoPreview(data.logo || '');
      }
    } catch (error) {
      console.error('회사 정보 로딩 실패:', error);
      alert('회사 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!company.name.trim()) newErrors.name = '기업명은 필수입니다.';
    if (!company.address.trim()) newErrors.address = '주소는 필수입니다.';
    if (!company.summary.trim()) newErrors.summary = '한 줄 소개는 필수입니다.';
    if (!company.description.trim()) newErrors.description = '기업 소개는 필수입니다.';
    if (!company.employee_count) newErrors.employee_count = '직원 수는 필수입니다.';
    if (!company.established) newErrors.established = '설립연도는 필수입니다.';
    if (!company.industry.trim()) newErrors.industry = '산업은 필수입니다.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      // 로고 업로드 (새로 선택한 경우)
      let logoUrl = company.logo;
      if (logoFile) {
        try {
          logoUrl = await uploadLogo(logoFile, companyId);
        } catch (logoError) {
          console.error('로고 업로드 실패:', logoError);
          alert('로고 업로드에 실패했습니다. 기존 로고를 유지합니다.');
        }
      }

      // 회사 정보 업데이트
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          name_en: company.name_en || null,
          company_type: company.company_type,
          address: company.address,
          logo: logoUrl,
          summary: company.summary,
          description: company.description,
          employee_count: company.employee_count,
          established: company.established,
          industry: company.industry,
          ceo_name: company.ceo_name || null,
          website: company.website || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId);

      if (error) throw error;

      alert('회사 정보가 수정되었습니다.');
      router.push('/admin');
    } catch (error: any) {
      console.error('회사 정보 수정 실패:', error);
      alert(`회사 정보 수정에 실패했습니다.\n\n${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            관리자 페이지로 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">회사 정보 수정</h1>
          <p className="text-gray-600 mt-1">회사의 상세 정보를 수정하세요</p>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-md shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">기본 정보</h2>

          {/* 기업명 & 영문명 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기업명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                영문명 <span className="text-gray-500">(선택)</span>
              </label>
              <input
                type="text"
                value={company.name_en}
                onChange={(e) => setCompany({ ...company, name_en: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* 기업 형태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기업 형태 <span className="text-red-500">*</span>
            </label>
            <select
              value={company.company_type}
              onChange={(e) => setCompany({ ...company, company_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {COMPANY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company.address}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* 로고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              로고 <span className="text-gray-500">(선택)</span>
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={logoPreview} alt="로고 미리보기" className="w-full h-full object-contain" />
                </div>
              )}
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">새 로고 업로드 (선택)</p>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>
          <h2 className="text-lg font-bold text-gray-900">회사 상세 정보</h2>

          {/* 한 줄 소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              한 줄 소개 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company.summary}
              onChange={(e) => setCompany({ ...company, summary: e.target.value })}
              maxLength={100}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
          </div>

          {/* 기업 소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기업 소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={company.description}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              rows={5}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* 직원 수 & 설립연도 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직원 수 <span className="text-red-500">*</span>
              </label>
              <select
                value={company.employee_count}
                onChange={(e) => setCompany({ ...company, employee_count: e.target.value })}
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none ${
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
              {errors.employee_count && <p className="mt-1 text-sm text-red-600">{errors.employee_count}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설립연도 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={company.established}
                onChange={(e) => setCompany({ ...company, established: e.target.value })}
                min="1900"
                max={new Date().getFullYear()}
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none ${
                  errors.established ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.established && <p className="mt-1 text-sm text-red-600">{errors.established}</p>}
            </div>
          </div>

          {/* 산업 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              산업 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company.industry}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none ${
                errors.industry ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
          </div>

          <div className="border-t border-gray-200 my-6"></div>
          <h2 className="text-lg font-bold text-gray-900">추가 정보 (선택)</h2>

          {/* 대표자명 & 웹사이트 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">대표자명</label>
              <input
                type="text"
                value={company.ceo_name}
                onChange={(e) => setCompany({ ...company, ceo_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">웹사이트</label>
              <input
                type="url"
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-md font-semibold hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
