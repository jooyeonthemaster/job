'use client';

import { useState } from 'react';
import { User, Mail, Briefcase, Download } from 'lucide-react';
import FormInput from '@/components/ui/form/FormInput';
import PhoneInput from '@/components/ui/form/PhoneInput';
import { supabase } from '@/lib/supabase/config';

interface RecruiterInfo {
  managerName: string;
  managerPosition: string;
  managerEmail: string;
  managerPhone: string;
}

interface RecruiterInfoSectionProps {
  formData: RecruiterInfo;
  onUpdate: (field: keyof RecruiterInfo, value: string) => void;
  errors?: Record<string, string>;
}

/**
 * 채용 담당자 정보 섹션
 *
 * @기능
 * - 채용 공고별로 독립적인 담당자 정보 입력
 * - 사용자가 원할 때 기업 정보에서 가져오기 가능
 * - 각 공고마다 다른 담당자 지정 가능
 */
export default function RecruiterInfoSection({
  formData,
  onUpdate,
  errors = {},
}: RecruiterInfoSectionProps) {
  const [isLoadingCompanyInfo, setIsLoadingCompanyInfo] = useState(false);

  // 기업 정보에서 담당자 정보 가져오기
  const handleLoadFromCompany = async () => {
    setIsLoadingCompanyInfo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('사용자 정보를 찾을 수 없습니다.');
        setIsLoadingCompanyInfo(false);
        return;
      }

      // Companies 테이블에서 담당자 정보 조회
      const { data: company, error } = await supabase
        .from('companies')
        .select('manager_name, manager_position, manager_email, manager_phone')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[RecruiterInfo] 담당자 정보 조회 에러:', error);
        alert('기업 정보를 불러오는 데 실패했습니다.');
        setIsLoadingCompanyInfo(false);
        return;
      }

      if (company) {
        // 기업 정보로 폼 채우기
        onUpdate('managerName', company.manager_name || '');
        onUpdate('managerPosition', company.manager_position || '');
        onUpdate('managerEmail', company.manager_email || user.email || '');
        onUpdate('managerPhone', company.manager_phone || '');
      }

      setIsLoadingCompanyInfo(false);
    } catch (err) {
      console.error('[RecruiterInfo] 담당자 정보 불러오기 에러:', err);
      alert('기업 정보를 불러오는 데 실패했습니다.');
      setIsLoadingCompanyInfo(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">채용 담당자 정보</h2>
          <p className="text-sm text-gray-500 mt-1">
            채용 공고별로 다른 담당자를 지정할 수 있습니다
          </p>
        </div>

        {/* 기업 정보에서 가져오기 버튼 */}
        <button
          type="button"
          onClick={handleLoadFromCompany}
          disabled={isLoadingCompanyInfo}
          className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {isLoadingCompanyInfo ? '불러오는 중...' : '기업 정보에서 가져오기'}
        </button>
      </div>

      <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* 담당자 이름 */}
            <FormInput
              label="담당자 이름"
              value={formData.managerName}
              onChange={(value) => onUpdate('managerName', value)}
              placeholder="예: 김철수"
              icon={User}
              error={errors.managerName}
            />

            {/* 직책 */}
            <FormInput
              label="직책"
              value={formData.managerPosition}
              onChange={(value) => onUpdate('managerPosition', value)}
              placeholder="예: 개발팀 리드"
              icon={Briefcase}
              error={errors.managerPosition}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* 이메일 */}
            <FormInput
              label="이메일"
              type="email"
              value={formData.managerEmail}
              onChange={(value) => onUpdate('managerEmail', value)}
              placeholder="예: recruit@company.com"
              icon={Mail}
              error={errors.managerEmail}
            />

            {/* 전화번호 (3개 입력칸) */}
            <PhoneInput
              label="전화번호"
              value={formData.managerPhone}
              onChange={(value) => onUpdate('managerPhone', value)}
              error={errors.managerPhone}
            />
          </div>
        </div>
    </div>
  );
}
