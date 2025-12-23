'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/config';
import { ArrowLeft, Save, Gift, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// 자주 사용되는 복지 태그 (온보딩과 동일)
const COMMON_BENEFITS = [
  '자율 출퇴근',
  '재택근무',
  '유연근무제',
  '식대 지원',
  '간식 제공',
  '야근 식대',
  '4대보험',
  '퇴직금',
  '연차',
  '반차',
  '경조사 휴가',
  '생일 휴가',
  '건강검진',
  '의료비 지원',
  '체력단련비',
  '헬스장',
  '교육비 지원',
  '도서 구입비',
  '자격증 취득 지원',
  '어학 교육',
  '사내 동호회',
  '워크숍',
  '야유회',
  '송년회',
  '명절 선물',
  '생일 선물',
  '경조사 지원',
  '출산 지원',
  '육아 휴직',
  '주차 지원',
  '통근 버스',
  '교통비 지원',
  '우수사원 포상',
  '성과급',
  '인센티브',
  '스톡옵션',
];

export default function BasicBenefitsEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState('');
  const [basicBenefits, setBasicBenefits] = useState<string[]>([]);
  const [customBenefit, setCustomBenefit] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
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

        // company_benefits 테이블에서 복지 목록 조회 (온보딩과 동일)
        const { data: benefitsData, error } = await supabase
          .from('company_benefits')
          .select('title')
          .eq('company_id', user.id)
          .eq('category', 'basic');

        if (error) {
          console.error('Failed to load benefits:', error);
        } else if (benefitsData) {
          setBasicBenefits(benefitsData.map((b: any) => b.title));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // 복지 토글
  const toggleBenefit = (benefit: string) => {
    if (basicBenefits.includes(benefit)) {
      setBasicBenefits(basicBenefits.filter((b) => b !== benefit));
    } else {
      setBasicBenefits([...basicBenefits, benefit]);
    }
  };

  // 커스텀 복지 추가
  const handleAddCustomBenefit = () => {
    const trimmed = customBenefit.trim();
    if (!trimmed) {
      alert('복지 내용을 입력해주세요.');
      return;
    }

    if (trimmed.length > 20) {
      alert('복지는 20자 이내로 입력해주세요.');
      return;
    }

    if (basicBenefits.includes(trimmed)) {
      alert('이미 추가된 복지입니다.');
      return;
    }

    setBasicBenefits([...basicBenefits, trimmed]);
    setCustomBenefit('');
    setShowCustomInput(false);
  };

  // 복지 삭제
  const removeBenefit = (benefit: string) => {
    setBasicBenefits(basicBenefits.filter((b) => b !== benefit));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (basicBenefits.length === 0) {
      newErrors.basicBenefits = '최소 1개 이상의 복지를 선택해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // 기존 복지 삭제 (온보딩과 동일한 테이블)
      await supabase
        .from('company_benefits')
        .delete()
        .eq('company_id', uid)
        .eq('category', 'basic');

      // 새로운 복지 추가
      if (basicBenefits.length > 0) {
        const benefitsToInsert = basicBenefits.map(tag => ({
          company_id: uid,
          category: 'basic',
          title: tag
        }));

        const { error } = await supabase
          .from('company_benefits')
          .insert(benefitsToInsert);

        if (error) throw error;
      }

      alert('복지 정보가 성공적으로 업데이트되었습니다!');
      router.push('/company-dashboard/edit');
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.message || '업데이트 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = basicBenefits.length;

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
            href="/company-dashboard/edit"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">복지 정보</h1>
          <p className="text-gray-600 mt-2">제공하는 복지를 선택해주세요 (최소 1개)</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-gray-100"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">복지 정보</h3>
                    <p className="text-sm text-gray-600">제공하는 복지를 선택해주세요</p>
                  </div>
                  <div className="text-sm font-medium text-primary-600">
                    선택됨: {selectedCount}개
                  </div>
                </div>
              </div>
            </div>

            {errors.basicBenefits && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.basicBenefits}</p>
              </div>
            )}

            {/* 선택된 복지 (상단에 표시) */}
            {selectedCount > 0 && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-3">선택된 복지</p>
                <div className="flex flex-wrap gap-2">
                  {basicBenefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="hover:bg-primary-700 rounded-full p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 자주 사용되는 복지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                자주 사용되는 복지 <span className="text-gray-500">(최소 1개 선택)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_BENEFITS.map((benefit) => {
                  const isSelected = basicBenefits.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => toggleBenefit(benefit)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      {benefit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 직접 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                복지 직접 추가
              </label>

              {showCustomInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBenefit}
                    onChange={(e) => setCustomBenefit(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomBenefit();
                      }
                    }}
                    placeholder="복지 내용 입력 (최대 20자)"
                    maxLength={20}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBenefit}
                    className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
                  >
                    추가
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomBenefit('');
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-md hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  복지 직접 추가하기
                </button>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 <strong>최소 1개 이상</strong>의 복지를 선택해야 합니다. 제공하는 모든 복지를 선택하면 구직자들이 더 관심을 가질 수 있습니다.
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

