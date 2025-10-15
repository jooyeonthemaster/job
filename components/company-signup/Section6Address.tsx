'use client';

import { MapPin, Search } from 'lucide-react';

interface Props {
  formData: {
    address: string;
    addressDetail?: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function Section6Address({ formData, onChange, errors }: Props) {
  // 다음 주소 검색 (카카오 주소 API)
  const handleSearchAddress = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.daum && window.daum.Postcode) {
      // @ts-ignore
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          // 도로명 주소 우선, 없으면 지번 주소
          const fullAddress = data.roadAddress || data.jibunAddress;
          onChange('address', fullAddress);
        },
      }).open();
    } else {
      alert('주소 검색 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">주소 정보</h3>
          <p className="text-sm text-gray-600">기업의 주소를 입력해주세요</p>
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
              value={formData.address}
              readOnly
              placeholder="주소 검색 버튼을 클릭하세요"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors bg-gray-50 cursor-not-allowed ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={handleSearchAddress}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
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
            value={formData.addressDetail || ''}
            onChange={(e) => onChange('addressDetail', e.target.value)}
            placeholder="동, 호수 등 상세 주소를 입력하세요"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* 전체 주소 미리보기 */}
      {formData.address && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-900 mb-1">입력된 전체 주소</p>
          <p className="text-sm text-blue-800">
            {formData.address}
            {formData.addressDetail && ` ${formData.addressDetail}`}
          </p>
        </div>
      )}

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-sm text-gray-700">
          💡 <strong>주소 검색</strong> 버튼을 클릭하면 카카오 주소 검색이 열립니다.
          정확한 주소를 검색하여 선택해주세요.
        </p>
      </div>
    </div>
  );
}
