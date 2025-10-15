'use client';

import { useState, useEffect } from 'react';
import { OnboardingStep2 } from '@/lib/firebase/company-types';
import { saveOnboardingStep2 } from '@/lib/firebase/company-service';
import { 
  MapPin, 
  Building2, 
  Users, 
  Search, 
  Plus, 
  X, 
  Navigation, 
  Home,
  Briefcase,
  Beaker,
  ChevronDown,
  Check,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: OnboardingStep2 | null;
  onSave: (data: OnboardingStep2) => void;
  onBack: () => void;
  uid: string;
}

interface Office {
  id: string;
  name: string;
  nameEn?: string;
  address: string;
  addressEn?: string;
  detailAddress?: string;
  postalCode?: string;
  type: 'HQ' | 'Branch' | 'Lab' | 'Factory';
  employees?: number;
  lat?: number;
  lng?: number;
  isMain?: boolean;
}

const officeTypes = [
  { value: 'HQ', label: '본사', icon: Home },
  { value: 'Branch', label: '지사', icon: Briefcase },
  { value: 'Lab', label: '연구소', icon: Beaker },
  { value: 'Factory', label: '공장', icon: Building2 }
];

export default function Step2Location({ data, onSave, onBack, uid }: Props) {
  const [offices, setOffices] = useState<Office[]>(
    data?.offices ? data.offices.map((office, index) => ({
      ...office,
      id: String(index + 1)
    })) : [
      {
        id: '1',
        name: '',
        nameEn: '',
        address: '',
        addressEn: '',
        detailAddress: '',
        postalCode: '',
        type: 'HQ',
        employees: undefined,
        isMain: true
      }
    ]
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState<string | null>(null);

  const handleAddOffice = () => {
    const newOffice: Office = {
      id: Date.now().toString(),
      name: '',
      nameEn: '',
      address: '',
      addressEn: '',
      detailAddress: '',
      postalCode: '',
      type: 'Branch',
      employees: undefined,
      isMain: false
    };
    setOffices([...offices, newOffice]);
  };

  const handleRemoveOffice = (id: string) => {
    setOffices(offices.filter(office => office.id !== id));
  };

  const handleOfficeChange = (id: string, field: keyof Office, value: any) => {
    setOffices(offices.map(office => 
      office.id === id ? { ...office, [field]: value } : office
    ));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [`${id}_${field}`]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    offices.forEach(office => {
      if (!office.name) {
        newErrors[`${office.id}_name`] = '오피스 명칭을 입력해주세요';
      }
      if (!office.address) {
        newErrors[`${office.id}_address`] = '주소를 입력해주세요';
      }
      if (office.isMain && !office.employees) {
        newErrors[`${office.id}_employees`] = '직원 수를 입력해주세요';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const mainOffice = offices.find(o => o.isMain);
      const formData: OnboardingStep2 = {
        location: mainOffice?.address?.split(' ').slice(0, 2).join(' ') || '',
        address: mainOffice?.address || '',
        offices: offices.map(({ id, ...office }) => office)
      };
      
      await saveOnboardingStep2(uid, formData);
      onSave(formData);
    } catch (error) {
      console.error('Error saving step 2:', error);
      setErrors({ submit: '저장 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">위치 정보</h2>
        <p className="text-gray-600">사무실 위치를 등록해주세요</p>
      </div>

      {/* Main Office Section */}
      <div className="space-y-6">
        {offices.map((office, index) => {
          const officeType = officeTypes.find(t => t.value === office.type);
          const OfficeIcon = officeType?.icon;
          
          return (
            <motion.div
              key={office.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              {/* Office Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${office.isMain 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-200 text-gray-600'}
                  `}>
                    {OfficeIcon && <OfficeIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {office.isMain ? '본사' : `오피스 ${index + 1}`}
                    </h3>
                    {office.isMain && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        메인 오피스
                      </span>
                    )}
                  </div>
                </div>
                {!office.isMain && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOffice(office.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                {/* Office Name (Korean) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    오피스 명칭 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={office.name}
                    onChange={(e) => handleOfficeChange(office.id, 'name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      ${errors[`${office.id}_name`] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="예: 강남 본사"
                    autoComplete="off"
                  />
                  {errors[`${office.id}_name`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`${office.id}_name`]}</p>
                  )}
                </div>

                {/* Office Name (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    오피스 명칭 (영문)
                  </label>
                  <input
                    type="text"
                    value={office.nameEn}
                    onChange={(e) => handleOfficeChange(office.id, 'nameEn', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: Gangnam HQ"
                    autoComplete="off"
                  />
                </div>

                {/* Office Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    오피스 유형 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(showTypeDropdown === office.id ? null : office.id)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {OfficeIcon && <OfficeIcon className="w-4 h-4 text-gray-600" />}
                        <span>{officeType?.label}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <AnimatePresence>
                      {showTypeDropdown === office.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                        >
                          {officeTypes.map(type => {
                            const TypeIcon = type.icon;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  handleOfficeChange(office.id, 'type', type.value);
                                  setShowTypeDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                              >
                                {TypeIcon && <TypeIcon className="w-4 h-4 text-gray-600" />}
                                <span>{type.label}</span>
                                {office.type === type.value && (
                                  <Check className="w-4 h-4 text-primary-600 ml-auto" />
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Employee Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    근무 인원 {office.isMain && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={office.employees || ''}
                      onChange={(e) => handleOfficeChange(office.id, 'employees', parseInt(e.target.value) || undefined)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        ${errors[`${office.id}_employees`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="예: 150"
                      autoComplete="off"
                    />
                  </div>
                  {errors[`${office.id}_employees`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`${office.id}_employees`]}</p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-4 space-y-4">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={office.address}
                      onChange={(e) => handleOfficeChange(office.id, 'address', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        ${errors[`${office.id}_address`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="예: 서울특별시 강남구 테헤란로 123"
                      autoComplete="off"
                    />
                  </div>
                  {errors[`${office.id}_address`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`${office.id}_address`]}</p>
                  )}
                </div>

                {/* English Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      영문 주소
                    </div>
                  </label>
                  <input
                    type="text"
                    value={office.addressEn}
                    onChange={(e) => handleOfficeChange(office.id, 'addressEn', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: 123 Teheran-ro, Gangnam-gu, Seoul"
                    autoComplete="off"
                  />
                </div>

                {/* Detail Address & Postal Code */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상세 주소
                    </label>
                    <input
                      type="text"
                      value={office.detailAddress}
                      onChange={(e) => handleOfficeChange(office.id, 'detailAddress', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="예: ABC빌딩 10층"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      우편번호
                    </label>
                    <input
                      type="text"
                      value={office.postalCode}
                      onChange={(e) => handleOfficeChange(office.id, 'postalCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="예: 06234"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Add Office Button */}
      <motion.button
        type="button"
        onClick={handleAddOffice}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-primary-600"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">오피스 추가</span>
      </motion.button>

      {/* Error Message */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            '다음 단계로'
          )}
        </button>
      </div>
    </form>
  );
}