'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { ArrowLeft, Save, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LocationEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [formData, setFormData] = useState({
    address: '',        // 기본 주소 (Daum Postcode)
    addressDetail: ''   // 상세 주소
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

        // DB에서: location (기본주소), address (통합주소 = location + addressDetail)
        // 분리: address를 기본주소로, addressDetail을 통합주소에서 기본주소를 뺀 것으로
        const baseAddress = profile.location || '';
        const fullAddress = profile.address || '';
        const detailAddress = fullAddress.replace(baseAddress, '').trim();

        setFormData({
          address: baseAddress,
          addressDetail: detailAddress
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // Daum Postcode API로 주소 검색
  const handleSearchAddress = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.daum && window.daum.Postcode) {
      // @ts-ignore
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          const fullAddress = data.roadAddress || data.jibunAddress;
          setFormData(prev => ({ ...prev, address: fullAddress }));
          setErrors(prev => ({ ...prev, address: '' }));
        },
      }).open();
    } else {
      alert('주소 검색 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address) {
      newErrors.address = '기본 주소를 입력해주세요 (주소 검색 버튼 클릭)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // DB 저장: location (기본주소), address (통합주소)
      const fullAddress = formData.addressDetail
        ? `${formData.address} ${formData.addressDetail}`.trim()
        : formData.address;

      const { error } = await supabase
        .from('companies')
        .update({
          location: formData.address,      // 기본 주소
          address: fullAddress             // 통합 주소
        })
        .eq('id', uid);

      if (error) throw error;

      alert('주소 정보가 성공적으로 업데이트되었습니다!');
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
            href="/company-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">주소 정보</h1>
          <p className="text-gray-600 mt-2">기업의 주소를 입력해주세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            {/* 기본 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기본 주소 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    readOnly
                    placeholder="주소 검색 버튼을 클릭하세요"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors bg-gray-50 cursor-not-allowed ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  주소 검색
                </button>
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* 상세 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 주소 <span className="text-gray-500">(선택)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.addressDetail}
                  onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                  placeholder="동, 호수 등 상세 주소를 입력하세요"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* 전체 주소 미리보기 */}
            {formData.address && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-blue-900 mb-1">입력된 전체 주소</p>
                <p className="text-sm text-blue-800">
                  {formData.address}
                  {formData.addressDetail && ` ${formData.addressDetail}`}
                </p>
              </div>
            )}

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-700">
                💡 <strong>주소 검색</strong> 버튼을 클릭하면 카카오 주소 검색이 열립니다.
                정확한 주소를 검색하여 선택해주세요.
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














