'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LocationEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [formData, setFormData] = useState({
    location: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login/company');
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
          location: profile.location || '',
          address: profile.address || ''
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.location) newErrors.location = '주 사업장 위치를 입력해주세요';
    if (!formData.address) newErrors.address = '상세 주소를 입력해주세요';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          location: formData.location,
          address: formData.address
        })
        .eq('id', uid);

      if (error) throw error;

      alert('위치 정보가 성공적으로 업데이트되었습니다!');
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
          <h1 className="text-3xl font-bold text-gray-900">위치 정보</h1>
          <p className="text-gray-600 mt-2">회사의 위치 정보를 수정하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주 사업장 위치 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 서울 강남구"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="예: 테헤란로 123, ABC빌딩 5층"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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












