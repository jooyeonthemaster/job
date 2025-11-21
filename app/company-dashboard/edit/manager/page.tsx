'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { ArrowLeft, Save, UserCircle, Briefcase, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ManagerEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [formData, setFormData] = useState({
    managerDepartment: '',
    managerName: '',
    managerPosition: '',
    managerPhone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        setUid(user.id);

        const { data: profile, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          router.push('/signup/company');
          return;
        }

        setFormData({
          managerDepartment: profile.manager_department || '',
          managerName: profile.manager_name || '',
          managerPosition: profile.manager_position || '',
          managerPhone: profile.manager_phone || ''
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

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
      setFormData(prev => ({ ...prev, managerPhone: newPhone }));
    }
  };

  const handlePhonePart2Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + numbersOnly + phoneParts.part3;
      setFormData(prev => ({ ...prev, managerPhone: newPhone }));
    }
  };

  const handlePhonePart3Change = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 4) {
      const newPhone = phoneParts.part1 + phoneParts.part2 + numbersOnly;
      setFormData(prev => ({ ...prev, managerPhone: newPhone }));
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.managerDepartment.trim()) {
      newErrors.managerDepartment = '담당 부서를 입력해주세요';
    }
    
    if (!formData.managerName.trim()) {
      newErrors.managerName = '담당자명을 입력해주세요';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          manager_department: formData.managerDepartment,
          manager_name: formData.managerName,
          manager_position: formData.managerPosition || null,
          manager_phone: formData.managerPhone || null
        })
        .eq('id', uid);

      if (error) throw error;

      alert('담당자 정보가 성공적으로 업데이트되었습니다!');
      router.push('/company-dashboard/edit');
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
            href="/company-dashboard/edit"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">담당자 정보</h1>
          <p className="text-gray-600 mt-2">채용 담당자 정보를 입력해주세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
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
                  onChange={(e) => setFormData({ ...formData, managerDepartment: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
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

            {/* 직급/직책 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직급/직책 <span className="text-gray-500">(선택)</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.managerPosition}
                  onChange={(e) => setFormData({ ...formData, managerPosition: e.target.value })}
                  placeholder="예: 과장, 매니저"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors border-gray-300"
                />
              </div>
            </div>

            {/* 담당자 연락처 (3개 입력칸) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                담당자 연락처 <span className="text-gray-500">(선택)</span>
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
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors border-gray-300"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>담당자 정보</strong>는 채용 공고와 관련된 문의 시 사용됩니다. 정확한 정보를 입력해주세요.
              </p>
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
                href="/company-dashboard/edit"
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


















