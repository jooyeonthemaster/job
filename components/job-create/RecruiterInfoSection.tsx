'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import FormInput from '@/components/ui/form/FormInput';
import { supabase } from '@/lib/supabase/config';

interface RecruiterInfo {
  recruiterName: string;
  recruiterPosition: string;
  recruiterEmail: string;
  recruiterPhone: string;
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
 * - 기업 회원가입 시 입력한 담당자 정보를 자동으로 불러옴
 * - 필요 시 수정 가능
 * - 입력하지 않으면 기본 담당자 정보 사용
 *
 * @자동_불러오기_정보
 * - 담당자 이름 (managerName)
 * - 직책 (managerPosition)
 * - 이메일 (managerEmail)
 * - 전화번호 (managerPhone)
 */
export default function RecruiterInfoSection({
  formData,
  onUpdate,
  errors = {},
}: RecruiterInfoSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [defaultInfo, setDefaultInfo] = useState<RecruiterInfo | null>(null);

  // 기업 담당자 정보 불러오기
  useEffect(() => {
    const fetchCompanyManagerInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
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
          setIsLoading(false);
          return;
        }

        if (company) {
          const info: RecruiterInfo = {
            recruiterName: company.manager_name || '',
            recruiterPosition: company.manager_position || '',
            recruiterEmail: company.manager_email || user.email || '',
            recruiterPhone: company.manager_phone || '',
          };

          setDefaultInfo(info);

          // 폼 데이터가 비어있으면 자동으로 채우기
          if (!formData.recruiterName && !formData.recruiterEmail) {
            Object.entries(info).forEach(([key, value]) => {
              onUpdate(key as keyof RecruiterInfo, value);
            });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('[RecruiterInfo] 담당자 정보 불러오기 에러:', err);
        setIsLoading(false);
      }
    };

    fetchCompanyManagerInfo();
  }, []);

  // 기본값으로 초기화
  const handleResetToDefault = () => {
    if (defaultInfo) {
      Object.entries(defaultInfo).forEach(([key, value]) => {
        onUpdate(key as keyof RecruiterInfo, value);
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">채용 담당자 정보</h2>
          <p className="text-sm text-gray-500 mt-1">
            입력하지 않으면 기업 정보의 담당자 정보가 사용됩니다
          </p>
        </div>

        {/* 기본값으로 초기화 버튼 */}
        {defaultInfo && (
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            기본값으로 초기화
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          담당자 정보를 불러오는 중...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* 담당자 이름 */}
            <FormInput
              label="담당자 이름"
              value={formData.recruiterName}
              onChange={(value) => onUpdate('recruiterName', value)}
              placeholder="예: 김철수"
              icon={User}
              error={errors.recruiterName}
            />

            {/* 직책 */}
            <FormInput
              label="직책"
              value={formData.recruiterPosition}
              onChange={(value) => onUpdate('recruiterPosition', value)}
              placeholder="예: 개발팀 리드"
              icon={Briefcase}
              error={errors.recruiterPosition}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* 이메일 */}
            <FormInput
              label="이메일"
              type="email"
              value={formData.recruiterEmail}
              onChange={(value) => onUpdate('recruiterEmail', value)}
              placeholder="예: recruit@company.com"
              icon={Mail}
              error={errors.recruiterEmail}
            />

            {/* 전화번호 */}
            <FormInput
              label="전화번호"
              type="tel"
              value={formData.recruiterPhone}
              onChange={(value) => onUpdate('recruiterPhone', value)}
              placeholder="예: 02-1234-5678"
              icon={Phone}
              error={errors.recruiterPhone}
            />
          </div>
        </div>
      )}
    </div>
  );
}
