'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getCompanyProfile, updateCompanyProfile } from '@/lib/firebase/company-service';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { validateBusinessNumber, validatePhone } from '@/lib/firebase/company-types';

export default function BasicInfoEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    registrationNumber: '',
    ceoName: '',
    established: '',
    industry: '',
    employeeCount: '',
    phone: '',
    website: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/company-auth');
        return;
      }

      setUid(user.uid);
      try {
        const profile = await getCompanyProfile(user.uid);
        if (!profile) {
          router.push('/company-auth/onboarding');
          return;
        }
        
        setFormData({
          name: profile.name || '',
          nameEn: profile.nameEn || '',
          registrationNumber: profile.registrationNumber || '',
          ceoName: profile.ceoName || '',
          established: profile.established || '',
          industry: profile.industry || '',
          employeeCount: profile.employeeCount || '',
          phone: profile.phone || '',
          website: profile.website || ''
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    // 유효성 검사
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = '회사명을 입력해주세요';
    if (!formData.nameEn) newErrors.nameEn = '영문 회사명을 입력해주세요';
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = '사업자등록번호를 입력해주세요';
    } else if (!validateBusinessNumber(formData.registrationNumber)) {
      newErrors.registrationNumber = '올바른 형식으로 입력해주세요 (예: 123-45-67890)';
    }
    if (!formData.ceoName) newErrors.ceoName = '대표자명을 입력해주세요';
    if (!formData.established) newErrors.established = '설립년도를 입력해주세요';
    if (!formData.industry) newErrors.industry = '산업군을 선택해주세요';
    if (!formData.employeeCount) newErrors.employeeCount = '직원수를 선택해주세요';
    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '올바른 형식으로 입력해주세요 (예: 02-1234-5678)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await updateCompanyProfile(uid, formData);
      alert('기본 정보가 성공적으로 업데이트되었습니다!');
      router.push('/company-dashboard');
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.message || '업데이트 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link
            href="/company-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">기본 정보</h1>
          <p className="text-gray-600 mt-2">회사의 기본 정보를 수정하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명 (영문) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.nameEn && <p className="text-red-500 text-sm mt-1">{errors.nameEn}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="123-45-67890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ceoName}
                  onChange={(e) => setFormData({ ...formData, ceoName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.ceoName && <p className="text-red-500 text-sm mt-1">{errors.ceoName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설립년도 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.established}
                  onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                  placeholder="2015"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.established && <p className="text-red-500 text-sm mt-1">{errors.established}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  산업군 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선택하세요</option>
                  <option value="Technology">Technology</option>
                  <option value="Internet">Internet</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Gaming">Gaming</option>
                </select>
                {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직원수 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선택하세요</option>
                  <option value="1-10명">1-10명</option>
                  <option value="11-50명">11-50명</option>
                  <option value="51-100명">51-100명</option>
                  <option value="101-300명">101-300명</option>
                  <option value="301-1,000명">301-1,000명</option>
                  <option value="1,001-5,000명">1,001-5,000명</option>
                  <option value="5,000명 이상">5,000명 이상</option>
                </select>
                {errors.employeeCount && <p className="text-red-500 text-sm mt-1">{errors.employeeCount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="02-1234-5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    저장하기
                  </>
                )}
              </button>
              <Link
                href="/company-dashboard"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}





