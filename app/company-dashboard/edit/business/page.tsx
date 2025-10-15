'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FileText, Building2, Calendar, User, Upload, CheckCircle2, Save, ArrowLeft } from 'lucide-react';
import { validateBusinessNumber } from '@/lib/supabase/company-types';
import Link from 'next/link';

function EditBusinessInfoContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    registrationNumber: '',
    registrationDocument: '',
    name: '',
    nameEn: '',
    establishmentYear: '',
    ceoName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationDocumentName, setRegistrationDocumentName] = useState('');

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
          registrationNumber: company.registration_number || '',
          registrationDocument: company.registration_document || '',
          name: company.name || '',
          nameEn: company.name_en || '',
          establishmentYear: company.established || '',
          ceoName: company.ceo_name || '',
        });

        if (company.registration_document) {
          // Extract filename from URL
          const urlParts = company.registration_document.split('/');
          setRegistrationDocumentName(urlParts[urlParts.length - 1]);
        }
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

  // 사업자등록번호 입력 처리 (숫자만)
  const handleRegistrationNumberChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 10) {
      handleChange('registrationNumber', numbersOnly);
    }
  };

  // 사업자등록증 파일 선택
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    // 파일 형식 체크 (PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('PDF, JPG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    try {
      // Cloudinary에 업로드
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', 'hiseoul_documents');
      formDataUpload.append('folder', `companies/${uid}/documents`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        handleChange('registrationDocument', data.secure_url);
        setRegistrationDocumentName(file.name);
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  // 개업일자 선택 처리
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      handleChange('establishmentYear', formatted);
    } else {
      handleChange('establishmentYear', '');
    }
  };

  // 문자열을 Date 객체로 변환
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.registrationNumber) {
      newErrors.registrationNumber = '사업자등록번호를 입력해주세요.';
    } else if (formData.registrationNumber.length !== 10) {
      newErrors.registrationNumber = '사업자등록번호는 10자리여야 합니다.';
    } else if (!validateBusinessNumber(formData.registrationNumber)) {
      newErrors.registrationNumber = '올바른 사업자등록번호가 아닙니다.';
    }

    if (!formData.registrationDocument) {
      newErrors.registrationDocument = '사업자등록증을 업로드해주세요.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '기업명을 입력해주세요.';
    }

    if (!formData.establishmentYear) {
      newErrors.establishmentYear = '개업일자를 선택해주세요.';
    }

    if (!formData.ceoName.trim()) {
      newErrors.ceoName = '대표자명을 입력해주세요.';
    }

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
          registration_number: formData.registrationNumber,
          registration_document: formData.registrationDocument,
          name: formData.name,
          name_en: formData.nameEn || null,
          established: formData.establishmentYear,
          ceo_name: formData.ceoName,
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

  const isBusinessNumberValid = formData.registrationNumber.length === 10 && validateBusinessNumber(formData.registrationNumber);

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
          <h1 className="text-2xl font-bold text-gray-900">사업자 정보 수정</h1>
          <p className="text-gray-600 mt-1">기업의 기본 사업자 정보를 수정합니다</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">사업자 정보</h3>
                <p className="text-sm text-gray-600">기업의 기본 사업자 정보를 입력해주세요</p>
              </div>
            </div>

            {/* 사업자등록번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사업자등록번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.registrationNumber}
                  onChange={(e) => handleRegistrationNumberChange(e.target.value)}
                  placeholder="1234567890"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                    errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={10}
                />
                {isBusinessNumberValid && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.registrationNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  숫자만 입력 가능 (하이픈 없이 10자리)
                </p>
                <p className={`text-xs font-medium ${
                  formData.registrationNumber.length === 10 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.registrationNumber.length}/10
                </p>
              </div>
            </div>

            {/* 사업자등록증 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사업자등록증 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="registrationDocument"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="registrationDocument"
                  className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer ${
                    errors.registrationDocument ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    {registrationDocumentName ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">{registrationDocumentName}</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">사업자등록증을 업로드해주세요</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG 파일 (최대 10MB)</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {errors.registrationDocument && (
                <p className="mt-1 text-sm text-red-600">{errors.registrationDocument}</p>
              )}
              {formData.registrationDocument && (
                <a
                  href={formData.registrationDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  현재 업로드된 파일 보기
                </a>
              )}
            </div>

            {/* 기업명 (한글) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기업명 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="주식회사 글로벌탤런트"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
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
                  value={formData.nameEn}
                  onChange={(e) => handleChange('nameEn', e.target.value)}
                  placeholder="GlobalTalent Inc."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* 개업일자 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                개업일자 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                <DatePicker
                  selected={parseDate(formData.establishmentYear)}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  maxDate={new Date()}
                  minDate={new Date(1900, 0, 1)}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={150}
                  scrollableYearDropdown
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                    errors.establishmentYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.establishmentYear && (
                <p className="mt-1 text-sm text-red-600">{errors.establishmentYear}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">사업자등록증상의 개업년월일을 입력해주세요.</p>
            </div>

            {/* 대표자명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표자명 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.ceoName}
                  onChange={(e) => handleChange('ceoName', e.target.value)}
                  placeholder="홍길동"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                    errors.ceoName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.ceoName && (
                <p className="mt-1 text-sm text-red-600">{errors.ceoName}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Link
              href="/company-dashboard/edit"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-center font-medium"
            >
              취소
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
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

export default function EditBusinessInfo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    }>
      <EditBusinessInfoContent />
    </Suspense>
  );
}
