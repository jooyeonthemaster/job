'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// 컴포넌트
import ValidationModal from '@/components/ValidationModal';
import BasicInfoSection from '@/components/job-create/BasicInfoSection';
import SalarySection from '@/components/job-create/SalarySection';
import JobDetailsSection from '@/components/job-create/JobDetailsSection';
import BenefitsSection from '@/components/job-create/BenefitsSection';
import LanguageSection from '@/components/job-create/LanguageSection';
import WorkConditionsSection from '@/components/job-create/WorkConditionsSection';
import PostingTierSection from '@/components/job-create/PostingTierSection';
import RecruiterSection from '@/components/job-create/RecruiterSection';

// 훅
import { useJobForm } from '@/hooks/useJobForm';
import { useJobFormValidation } from '@/hooks/useJobFormValidation';
import { useJobSubmit } from '@/hooks/useJobSubmit';

// 타입
import { CompanyData } from '@/types/job-form.types';

export default function CreateJobPage() {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  // 커스텀 훅
  const { 
    formData, 
    updateField, 
    addArrayItem, 
    removeArrayItem, 
    updateArrayItem 
  } = useJobForm();
  
  const { errors, isValid } = useJobFormValidation(formData);
  const { submitJob, loading, error, setError } = useJobSubmit();

  // 회사 정보 가져오기
  useEffect(() => {
    const fetchCompanyData = async () => {
      const user = auth.currentUser;
      if (user) {
        const companyDoc = await getDoc(doc(db, 'companies', user.uid));
        if (companyDoc.exists()) {
          setCompanyData({ id: user.uid, ...companyDoc.data() } as CompanyData);
        }
      }
    };
    fetchCompanyData();
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!isValid) {
      setShowValidationModal(true);
      return;
    }

    setError('');
    await submitJob(formData, companyData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={errors}
        title="필수 입력 항목을 확인해주세요"
        type="error"
      />

      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/company-dashboard?tab=jobs" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">채용 관리로 돌아가기</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">채용공고 등록</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <BasicInfoSection 
            formData={formData} 
            onUpdate={updateField} 
          />

          <SalarySection 
            formData={formData} 
            onUpdate={updateField} 
          />

          <JobDetailsSection
            formData={formData}
            onUpdate={updateField}
            onAddItem={addArrayItem}
            onRemoveItem={removeArrayItem}
            onUpdateItem={updateArrayItem}
          />

          <BenefitsSection
            formData={formData}
            onAddItem={addArrayItem}
            onRemoveItem={removeArrayItem}
            onUpdateItem={updateArrayItem}
          />

          <LanguageSection 
            formData={formData} 
            onUpdate={updateField} 
          />

          <WorkConditionsSection 
            formData={formData} 
            onUpdate={updateField} 
          />

          <PostingTierSection 
            formData={formData} 
            onUpdate={updateField} 
          />

          <RecruiterSection 
            formData={formData} 
            onUpdate={updateField} 
          />

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <Link
              href="/company-dashboard?tab=jobs"
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading || !isValid}
              className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors
                ${isValid
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  채용공고 등록
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

