'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/jobseeker-service';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function IntroductionEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [introduction, setIntroduction] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const profile = await getUserProfile(user.id);
        if (!profile) {
          router.push('/onboarding/job-seeker/quick');
          return;
        }
        setIntroduction(profile.introduction || '');
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      await updateUserProfile(user.id, {
        introduction
      });

      alert('자기소개가 성공적으로 업데이트되었습니다!');
      router.push('/jobseeker-dashboard');
    } catch (error: any) {
      console.error('Introduction update error:', error);
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
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/jobseeker-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">자기소개</h1>
          <p className="text-gray-600 mt-2">자신을 소개하는 글을 작성하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            {/* 자기소개 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                rows={10}
                placeholder="당신의 경력, 강점, 목표 등을 자유롭게 작성해주세요..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                {introduction.length} / 1000자
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 작성 팁</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 핵심 강점과 전문 분야를 명확하게 작성하세요</li>
                <li>• 구체적인 성과나 프로젝트 경험을 포함하면 좋습니다</li>
                <li>• 앞으로의 커리어 목표를 간단히 언급해보세요</li>
                <li>• 진정성 있고 자연스러운 문체로 작성하세요</li>
              </ul>
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>저장하기</span>
                  </>
                )}
              </button>
              <Link
                href="/jobseeker-dashboard"
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
