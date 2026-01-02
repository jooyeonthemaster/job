'use client';

import { useState } from 'react';
import { User, Type } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';
import CustomCloudinaryUpload from '@/components/CustomCloudinaryUpload';

interface Props {
  data?: any;
  onNext: (data: any) => void;
  buttonText?: string;
}

const Step1ProfileBasic = ({ data, onNext, buttonText = '다음 단계로' }: Props) => {
  const [fullName, setFullName] = useState(data?.fullName || '');
  const [headline, setHeadline] = useState(data?.headline || '');
  const [profileImageUrl, setProfileImageUrl] = useState<string>(data?.profileImageUrl || '');
  const [showErrors, setShowErrors] = useState(false);
  
  const validateForm = () => {
    const errors = [];
    
    if (!fullName.trim()) {
      errors.push('이름을 입력해주세요');
    }
    
    if (!headline.trim()) {
      errors.push('한 줄 소개를 입력해주세요');
    }
    
    return errors;
  };
  
  const isFormValid = fullName.trim() !== '' && headline.trim() !== '';

  const handleNext = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
      onNext({ fullName, headline, profileImageUrl });
    }
  };

  return (
    <div className="space-y-4">
      {/* Cloudinary 업로드 컴포넌트 */}
      <CustomCloudinaryUpload
        type="profile"
        currentImageUrl={profileImageUrl}
        onUploadSuccess={(url) => setProfileImageUrl(url)}
        onUploadError={(error) => console.error('Upload error:', error)}
        label="프로필 사진 (선택)"
      />

      <div className="relative">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">이름 <span className="text-red-500">*</span></label>
        <User className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
        <input
          id="fullName"
          type="text"
          placeholder="홍길동"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
        />
      </div>

      <div className="relative">
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">한 줄 소개 <span className="text-red-500">*</span></label>
        <Type className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
        <input
          id="headline"
          type="text"
          placeholder="예: React를 사랑하는 프론트엔드 개발자"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
        />
      </div>

      <button
        onClick={handleNext}
        className="w-full py-2.5 px-4 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors text-sm"
      >
        {buttonText}
      </button>
      
      {/* Validation Modal */}
      <ValidationModal
        isOpen={showErrors && validateForm().length > 0}
        onClose={() => setShowErrors(false)}
        errors={validateForm()}
      />
    </div>
  );
};

export default Step1ProfileBasic;










