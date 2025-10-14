// 채용공고 제출 로직 커스텀 훅

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { JobFormData, CompanyData, JobSubmitData } from '@/types/job-form.types';
import { POSTING_PRICES, VAT_RATE, BILLING_CONTACT, EMPLOYMENT_TYPE_LABELS } from '@/constants/job-posting';

export function useJobSubmit() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitJob = async (formData: JobFormData, companyData: CompanyData | null) => {
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('로그인이 필요합니다');
      }

      if (!companyData) {
        throw new Error('기업 정보를 불러올 수 없습니다');
      }

      // 과금 정보 계산
      const selectedPrice = POSTING_PRICES[formData.postingTier];
      const vatAmount = selectedPrice.price * VAT_RATE;
      const totalAmount = selectedPrice.price + vatAmount;

      // 제출 데이터 구성
      const jobData: JobSubmitData = {
        companyId: user.uid,
        company: {
          id: companyData.id,
          name: companyData.name,
          nameEn: companyData.nameEn,
          logo: companyData.logo || '',
          industry: companyData.industry,
          location: companyData.location,
          employeeCount: companyData.employeeCount,
        },
        title: formData.title,
        titleEn: formData.titleEn,
        department: formData.department,
        location: formData.location,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salary: {
          min: parseInt(formData.salaryMin),
          max: parseInt(formData.salaryMax),
          currency: 'KRW',
          negotiable: formData.salaryNegotiable
        },
        description: formData.description,
        mainTasks: formData.mainTasks.filter(t => t.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        preferredQualifications: formData.preferredQualifications.filter(q => q.trim()),
        benefits: formData.benefits.filter(b => b.trim()),
        tags: formData.tags.filter(t => t.trim()),
        visaSponsorship: formData.visaSponsorship,
        languageRequirements: {
          korean: formData.koreanLevel,
          english: formData.englishLevel
        },
        deadline: formData.deadline,
        workConditions: {
          type: EMPLOYMENT_TYPE_LABELS[formData.employmentType] || '정규직',
          probation: formData.probation,
          location: formData.location,
          workHours: formData.workHours || '자율 출퇴근제',
          salary: `₩${parseInt(formData.salaryMin).toLocaleString()}만 - ${parseInt(formData.salaryMax).toLocaleString()}만`,
          startDate: formData.startDate
        },
        manager: {
          name: formData.managerName || companyData.recruiters?.[0]?.name || '',
          position: formData.managerPosition || companyData.recruiters?.[0]?.position || '',
          email: formData.managerEmail || companyData.recruiters?.[0]?.email || companyData.email || '',
          phone: formData.managerPhone || companyData.recruiters?.[0]?.phone || companyData.phone || ''
        },
        posting: {
          tier: formData.postingTier,
          price: selectedPrice.price,
          duration: selectedPrice.duration,
          vatAmount: vatAmount,
          totalAmount: totalAmount
        },
        payment: {
          status: 'pending',
          requestedAt: serverTimestamp(),
          billingContact: BILLING_CONTACT
        },
        views: 0,
        applicants: 0,
        status: 'pending_payment',
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'jobs'), jobData);
      console.log('Job created with ID:', docRef.id);

      // 성공 후 채용 관리 페이지로 이동
      router.push('/company-dashboard?tab=jobs');
      
      return { success: true, jobId: docRef.id };
    } catch (err: any) {
      console.error('Error creating job:', err);
      const errorMessage = err.message || '채용공고 등록에 실패했습니다';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    submitJob,
    loading,
    error,
    setError
  };
}






