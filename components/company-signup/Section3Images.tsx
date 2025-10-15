'use client';

import { useState } from 'react';
import { Image as ImageIcon, Upload, X, CheckCircle2, Building2 } from 'lucide-react';

interface Props {
  formData: {
    logo?: File;
    companyImage?: File;
  };
  onChange: (field: string, value: File | undefined) => void;
  errors: Record<string, string>;
}

export default function Section3Images({ formData, onChange, errors }: Props) {
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [companyImagePreview, setCompanyImagePreview] = useState<string>('');

  // 로고 업로드
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('로고 파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      onChange('logo', file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 로고 삭제
  const handleLogoRemove = () => {
    onChange('logo', undefined);
    setLogoPreview('');
  };

  // 회사 전경 이미지 업로드
  const handleCompanyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('이미지 파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      onChange('companyImage', file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 회사 전경 이미지 삭제
  const handleCompanyImageRemove = () => {
    onChange('companyImage', undefined);
    setCompanyImagePreview('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">로고 & 회사 이미지</h3>
          <p className="text-sm text-gray-600">기업 로고와 회사 전경 이미지를 업로드해주세요</p>
        </div>
      </div>

      {/* 로고 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          기업 로고 <span className="text-gray-500">(선택)</span>
        </label>

        {logoPreview ? (
          <div className="relative w-40 h-40 border-2 border-gray-300 rounded-xl overflow-hidden group">
            <img
              src={logoPreview}
              alt="로고 미리보기"
              className="w-full h-full object-contain bg-gray-50"
            />
            <button
              type="button"
              onClick={handleLogoRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>업로드됨</span>
            </div>
          </div>
        ) : (
          <>
            <input
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <label
              htmlFor="logo"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">로고 이미지를 업로드해주세요</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG 파일 (최대 5MB)</p>
              </div>
            </label>
          </>
        )}
        {errors.logo && (
          <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
        )}
      </div>

      {/* 회사 전경 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          회사 전경 이미지 <span className="text-gray-500">(선택)</span>
        </label>

        {companyImagePreview ? (
          <div className="relative w-full h-64 border-2 border-gray-300 rounded-xl overflow-hidden group">
            <img
              src={companyImagePreview}
              alt="회사 전경 미리보기"
              className="w-full h-full object-cover bg-gray-50"
            />
            <button
              type="button"
              onClick={handleCompanyImageRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>업로드됨</span>
            </div>
          </div>
        ) : (
          <>
            <input
              type="file"
              id="companyImage"
              accept="image/*"
              onChange={handleCompanyImageChange}
              className="hidden"
            />
            <label
              htmlFor="companyImage"
              className="flex items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              <Building2 className="w-6 h-6 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">회사 전경 이미지를 업로드해주세요</p>
                <p className="text-xs text-gray-500 mt-1">
                  사무실 외관, 내부 사진 등 (JPG, PNG 파일, 최대 10MB)
                </p>
              </div>
            </label>
          </>
        )}
        {errors.companyImage && (
          <p className="mt-1 text-sm text-red-600">{errors.companyImage}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          💡 구직자들이 회사 분위기를 파악할 수 있는 이미지를 선택해주세요
        </p>
      </div>
    </div>
  );
}
