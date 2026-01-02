'use client';

import { useState } from 'react';
import { User, Camera, Mail, Phone, MapPin, Calendar, Globe } from 'lucide-react';

interface Props {
  formData: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    birthYear: string;
    nationality: string;
    profileImage: File | null;
  };
  onInputChange: (field: string, value: string | File | null) => void;
}

// 공통 스타일 - primary(blue) 색상 적용
const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 text-gray-700 text-sm";
const inputErrorClass = "w-full px-3 py-2 bg-white border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all placeholder:text-gray-400 text-gray-700 text-sm";
const labelClass = "flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1";

const Step1BasicInfo = ({ formData, onInputChange }: Props) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | File | null) => {
    onInputChange(field, value);
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: '이미지 크기는 5MB 이하여야 합니다.' });
        return;
      }
      onInputChange('profileImage', file);
      setErrors({ ...errors, image: '' });
    }
  };

  return (
    <div className="space-y-5">
      {/* 헤더 - 콤팩트하게 */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">기본 정보</h2>
          <p className="text-sm text-gray-500">기업에게 보여질 기본 정보를 입력해주세요</p>
        </div>
      </div>

      {/* 프로필 이미지 + 필수 정보 - 한 줄에 */}
      <div className="flex gap-5">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {formData.profileImage ? (
                <img
                  src={URL.createObjectURL(formData.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-md flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          {errors.image && (
            <p className="text-xs text-red-500 mt-1 max-w-[80px]">{errors.image}</p>
          )}
        </div>

        {/* 필수 정보 */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {/* 이름 */}
          <div>
            <label className={labelClass}>
              <User className="w-3.5 h-3.5 text-primary-500" />
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="홍길동"
              className={errors.fullName ? inputErrorClass : inputClass}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className={labelClass}>
              <Mail className="w-3.5 h-3.5 text-primary-500" />
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="hong@example.com"
              className={errors.email ? inputErrorClass : inputClass}
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label className={labelClass}>
              <Phone className="w-3.5 h-3.5 text-primary-500" />
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="010-1234-5678"
              className={errors.phone ? inputErrorClass : inputClass}
            />
          </div>

          {/* 한 줄 소개 */}
          <div>
            <label className={labelClass}>
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              한 줄 소개
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="5년차 프론트엔드 개발자"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 추가 정보 - 콤팩트 그리드 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-gray-400" />
          추가 정보 <span className="text-xs text-gray-400 font-normal">(선택)</span>
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {/* 거주지역 */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              거주 지역
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="서울특별시"
              className={inputClass}
            />
          </div>

          {/* 출생년도 */}
          <div>
            <label className={labelClass}>
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              출생년도
            </label>
            <input
              type="text"
              value={formData.birthYear}
              onChange={(e) => handleChange('birthYear', e.target.value)}
              placeholder="1990"
              className={inputClass}
            />
          </div>

          {/* 국적 */}
          <div>
            <label className={labelClass}>
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              국적
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="대한민국"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 팁 - 심플하게 */}
      <p className="text-xs text-gray-500 flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-2 rounded-lg">
        <span>💡</span>
        정확한 정보를 입력하면 더 적합한 채용공고를 추천받을 수 있어요.
      </p>
    </div>
  );
};

export default Step1BasicInfo;
