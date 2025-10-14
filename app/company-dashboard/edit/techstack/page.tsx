'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getCompanyProfile, updateCompanyProfile } from '@/lib/firebase/company-service';
import { ArrowLeft, Save, Code, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const techStackOptions = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express',
  'Django', 'Spring', 'Ruby on Rails', 'PHP', 'Laravel', '.NET',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Jenkins',
  'Git', 'Jira', 'Slack', 'Figma', 'Adobe XD', 'Sketch'
];

export default function TechStackEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState('');

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
        
        setTechStack(profile.techStack || []);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const toggleTech = (tech: string) => {
    setTechStack(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const addCustomTech = () => {
    const trimmed = customTech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setCustomTech('');
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(prev => prev.filter(t => t !== tech));
  };

  const handleSave = async () => {
    if (techStack.length === 0) {
      alert('최소 1개 이상의 기술 스택을 선택해주세요');
      return;
    }

    setSaving(true);
    try {
      await updateCompanyProfile(uid, { techStack });
      alert('기술 스택이 성공적으로 업데이트되었습니다!');
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/company-dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">기술 스택</h1>
          <p className="text-gray-600 mt-2">회사에서 사용하는 기술을 선택하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            {/* 선택된 기술 스택 */}
            {techStack.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Code className="inline w-4 h-4 mr-2" />
                  선택된 기술 ({techStack.length}개)
                </label>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="hover:bg-primary-100 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 기술 스택 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                기술 선택
              </label>
              <div className="flex flex-wrap gap-2">
                {techStackOptions.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      techStack.includes(tech)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* 직접 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직접 입력
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTech();
                    }
                  }}
                  placeholder="기술 이름 입력 후 Enter 또는 추가 버튼"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={addCustomTech}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  추가
                </button>
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





