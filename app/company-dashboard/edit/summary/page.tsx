'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SummaryEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [formData, setFormData] = useState({
    summary: ''
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
          summary: profile.summary || ''
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
    
    // 유효성 검사는 선택사항이므로 생략

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          summary: formData.summary || null
        })
        .eq('id', uid);

      if (error) throw error;

      alert('한 줄 소개가 성공적으로 업데이트되었습니다!');
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
          <h1 className="text-3xl font-bold text-gray-900">기업 한 줄 소개</h1>
          <p className="text-gray-600 mt-2">우리 기업을 한 줄로 소개해주세요 (선택 항목)</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            {/* 한 줄 소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기업 한 줄 소개 <span className="text-gray-500">(선택)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="우리 기업을 한 줄로 소개해주세요 (최대 200자)"
                  rows={3}
                  maxLength={200}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.summary.length} / 200자
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                💡 <strong>한 줄 소개</strong>는 기업 목록에서 구직자들에게 첫 인상을 전달하는 중요한 항목입니다.
                간결하고 매력적인 소개를 작성해보세요.
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
















