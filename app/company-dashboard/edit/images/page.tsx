'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import CustomCloudinaryUpload from '@/components/CustomCloudinaryUpload';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ImagesEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [logo, setLogo] = useState('');
  const [bannerImage, setBannerImage] = useState('');

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

        setLogo(profile.logo || '');
        setBannerImage(profile.banner_image || '');
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          logo,
          banner_image: bannerImage
        })
        .eq('id', uid);

      if (error) throw error;

      alert('로고 및 배너 이미지가 성공적으로 업데이트되었습니다!');
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
          <h1 className="text-3xl font-bold text-gray-900">로고 & 배너</h1>
          <p className="text-gray-600 mt-2">기업의 로고와 배너 이미지를 관리하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-8">
            {/* 로고 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <ImageIcon className="inline w-4 h-4 mr-2" />
                기업 로고
              </label>
              <CustomCloudinaryUpload
                type="logo"
                currentImageUrl={logo}
                onUploadSuccess={(url) => setLogo(url)}
                userId={uid}
              />
              <p className="text-xs text-gray-500 mt-2">
                권장: 정사각형 (500x500px), PNG 또는 JPG
              </p>
            </div>

            {/* 배너 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <ImageIcon className="inline w-4 h-4 mr-2" />
                배너 이미지
              </label>
              <CustomCloudinaryUpload
                type="banner"
                currentImageUrl={bannerImage}
                onUploadSuccess={(url) => setBannerImage(url)}
                userId={uid}
              />
              <p className="text-xs text-gray-500 mt-2">
                권장: 가로형 (1200x400px), PNG 또는 JPG
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












