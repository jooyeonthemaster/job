'use client';

import { useState } from 'react';
import { User, Type } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';
import CustomCloudinaryUpload from '@/components/CustomCloudinaryUpload';

interface Props {
  data?: any;
  onNext: (data: any) => void;
}

const Step1ProfileBasic = ({ data, onNext }: Props) => {
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
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">프로필 기본 정보</h2>
        <p className="text-gray-500 mt-2">기업에게 보여질 첫인상입니다. 자신을 잘 나타내보세요.</p>
      </div>
      
      <div className="space-y-6">
        {/* Cloudinary 업로드 컴포넌트 */}
        <CustomCloudinaryUpload
          type="profile"
          currentImageUrl={profileImageUrl}
          onUploadSuccess={(url) => setProfileImageUrl(url)}
          onUploadError={(error) => console.error('Upload error:', error)}
          label="프로필 사진 (선택)"
        />

        <div className="relative">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <User className="absolute left-3 top-1/2 -translate-y-1/2 mt-3 w-5 h-5 text-gray-400" />
          <input
            id="fullName"
            type="text"
            placeholder="홍길동"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">한 줄 소개</label>
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 mt-3 w-5 h-5 text-gray-400" />
          <input
            id="headline"
            type="text"
            placeholder="예: React를 사랑하는 프론트엔드 개발자"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none transition-colors"
          />
        </div>
      </div>
      
      <button 
        onClick={handleNext}
        className="w-full py-3 px-4 bg-secondary-600 text-white font-medium rounded-xl hover:bg-secondary-700 transition-colors mt-8"
      >
        다음 단계로
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









