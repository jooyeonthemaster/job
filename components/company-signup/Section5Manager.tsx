'use client';

import { UserCircle, Briefcase, Phone, Mail } from 'lucide-react';

interface Props {
  formData: {
    managerDepartment: string;
    managerName: string;
    managerEmail: string;
    managerPosition: string;
    managerPhone?: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function Section5Manager({ formData, onChange, errors }: Props) {
  // 전화번호를 3부분으로 분리
  const getPhoneParts = () => {
    const phone = formData.managerPhone || '';
    return {
      part1: phone.slice(0, 3),
      part2: phone.slice(3, 7),
      part3: phone.slice(7, 11),
    };
  };

  const phoneParts = getPhoneParts();

  // 각 부분 입력 처리
  const handlePhonePart1Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 3) {
      const newPhone = numbersOnly + phoneParts.part2 + phoneParts.part3;
      onChange('managerPhone', newPhone);
    }
  };

  const handlePhonePart2Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + numbersOnly + phoneParts.part3;
      onChange('managerPhone', newPhone);
    }
  };

  const handlePhonePart3Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + phoneParts.part2 + numbersOnly;
      onChange('managerPhone', newPhone);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">담당자 정보</h3>
          <p className="text-sm text-gray-600">채용 담당자 정보를 입력해주세요</p>
        </div>
      </div>

      {/* 담당 부서 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당 부서 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.managerDepartment}
            onChange={(e) => onChange('managerDepartment', e.target.value)}
            placeholder="예: 인사팀, HR팀"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.managerDepartment ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.managerDepartment && (
          <p className="mt-1 text-sm text-red-600">{errors.managerDepartment}</p>
        )}
      </div>

      {/* 담당자명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당자명 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.managerName}
            onChange={(e) => onChange('managerName', e.target.value)}
            placeholder="홍길동"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.managerName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.managerName && (
          <p className="mt-1 text-sm text-red-600">{errors.managerName}</p>
        )}
      </div>

      {/* 담당자 이메일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당자 이메일 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.managerEmail}
            onChange={(e) => onChange('managerEmail', e.target.value)}
            placeholder="manager@company.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.managerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.managerEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.managerEmail}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">채용 관련 문의를 받을 이메일 주소</p>
      </div>

      {/* 직급/직책 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          직급/직책 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.managerPosition || ''}
            onChange={(e) => onChange('managerPosition', e.target.value)}
            placeholder="예: 과장, 매니저"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
              errors.managerPosition ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.managerPosition && (
          <p className="mt-1 text-sm text-red-600">{errors.managerPosition}</p>
        )}
      </div>

      {/* 담당자 연락처 (3개 입력칸) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          담당자 연락처 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              inputMode="numeric"
              value={phoneParts.part1}
              onChange={(e) => handlePhonePart1Change(e.target.value)}
              placeholder="010"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.managerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={3}
            />
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="flex-1">
            <input
              type="tel"
              inputMode="numeric"
              value={phoneParts.part2}
              onChange={(e) => handlePhonePart2Change(e.target.value)}
              placeholder="1234"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.managerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={4}
            />
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="flex-1">
            <input
              type="tel"
              inputMode="numeric"
              value={phoneParts.part3}
              onChange={(e) => handlePhonePart3Change(e.target.value)}
              placeholder="5678"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${
                errors.managerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={4}
            />
          </div>
        </div>
        {errors.managerPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.managerPhone}</p>
        )}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-sm text-gray-700">
          <strong>담당자 정보</strong>는 채용 공고와 관련된 문의 시 사용됩니다. 정확한 정보를 입력해주세요.
        </p>
      </div>
    </div>
  );
}
