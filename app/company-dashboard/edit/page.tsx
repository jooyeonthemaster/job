'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  getCompanyProfile, 
  updateCompanyProfile 
} from '@/lib/firebase/company-service';
import { motion } from 'framer-motion';
import {
  OnboardingStep1,
  OnboardingStep2,
  OnboardingStep3,
  OnboardingStep4,
  OnboardingStep5,
  CompanyProfile
} from '@/lib/firebase/company-types';
import Step1BasicInfo from '@/app/company-auth/onboarding/Step1BasicInfo';
import Step2Location from '@/app/company-auth/onboarding/Step2Location';
import Step3Introduction from '@/app/company-auth/onboarding/Step3Introduction';
import Step4Benefits from '@/app/company-auth/onboarding/Step4Benefits';
import Step5Recruiters from '@/app/company-auth/onboarding/Step5Recruiters';
import CustomCloudinaryUpload from '@/components/CustomCloudinaryUpload';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  FileText, 
  Gift, 
  Users,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Code,
  Heart,
  X
} from 'lucide-react';
import Link from 'next/link';

// Next.js 15 요구사항: searchParams를 사용하는 컴포넌트
function EditCompanyProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string>('');
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // 각 단계별 데이터 상태
  const [step1Data, setStep1Data] = useState<OnboardingStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<OnboardingStep2 | null>(null);
  const [step3Data, setStep3Data] = useState<OnboardingStep3 | null>(null);
  const [step4Data, setStep4Data] = useState<OnboardingStep4 | null>(null);
  const [step5Data, setStep5Data] = useState<OnboardingStep5 | null>(null);

  const sections = [
    { id: 'basic', title: '기본 정보', icon: Building2 },
    { id: 'location', title: '위치 정보', icon: MapPin },
    { id: 'images', title: '로고 & 배너', icon: ImageIcon },
    { id: 'introduction', title: '회사 소개', icon: FileText },
    { id: 'techstack', title: '기술 스택', icon: Code },
    { id: 'benefits', title: '복지 혜택', icon: Heart },
    { id: 'recruiters', title: '담당자 정보', icon: Users }
  ];

  // URL 파라미터 매핑 (체크리스트에서 클릭 시)
  const sectionMapping: Record<string, string> = {
    'logo': 'images',
    'banner': 'images',
    'images': 'images',
    'description': 'introduction',
    'vision': 'introduction',
    'mission': 'introduction',
    'slogan': 'introduction',
    'vision-mission': 'introduction',
    'techStack': 'techstack',
    'website': 'basic',
    'address': 'location'
  };

  // URL 파라미터에서 섹션 읽기
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      // 매핑된 섹션이 있으면 사용, 없으면 파라미터 그대로 사용
      const mappedSection = sectionMapping[sectionParam] || sectionParam;
      setActiveSection(mappedSection);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const profile = await getCompanyProfile(user.uid);
        if (profile) {
          setCompany(profile);
          // 기존 데이터를 각 스텝 데이터로 변환
          setStep1Data({
            name: profile.name,
            nameEn: profile.nameEn,
            registrationNumber: profile.registrationNumber,
            ceoName: profile.ceoName,
            established: profile.established,
            industry: profile.industry,
            employeeCount: profile.employeeCount,
            phone: profile.phone,
            website: profile.website
          });
          
          setStep2Data({
            location: profile.location,
            address: profile.address,
            offices: profile.offices
          });
          
          setStep3Data({
            description: profile.description,
            slogan: profile.slogan,
            vision: profile.vision,
            mission: profile.mission
          });
          
          setStep4Data({
            techStack: profile.techStack || [],
            benefits: profile.benefits || {
              workEnvironment: [],
              growth: [],
              healthWelfare: [],
              compensation: []
            },
            revenue: profile.revenue,
            funding: profile.funding,
            avgSalary: profile.stats?.avgSalary,
            avgTenure: profile.stats?.avgTenure
          });
          
          setStep5Data({
            recruiters: profile.recruiters || []
          });
        } else {
          router.push('/company-auth/onboarding');
        }
      } else {
        router.push('/company-auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveSection = async (section: string, data: any) => {
    setSaving(true);
    try {
      // 섹션별로 저장 로직 구현
      await updateCompanyProfile(uid, data);
      setSavedSections(prev => new Set(prev).add(section));
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // 다음 섹션으로 자동 이동 (마지막 섹션이 아닌 경우)
      const currentIndex = sections.findIndex(s => s.id === section);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1].id);
      }
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteEdit = () => {
    router.push('/company-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/company-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>대시보드로 돌아가기</span>
            </Link>
            
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg"
              >
                <Check className="w-5 h-5" />
                <span>저장되었습니다</span>
              </motion.div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 정보 수정</h1>
          <p className="text-gray-600">기업 정보를 최신 상태로 유지해주세요</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-8">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isSaved = savedSections.has(section.id);
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-primary-50 text-primary-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{section.title}</span>
                      </div>
                      {isSaved && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="px-4 py-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">팁</p>
                      <p className="text-xs text-blue-700 mt-1">
                        각 섹션을 저장하면 즉시 반영됩니다. 모든 정보를 최신으로 유지해주세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              {/* 기본 정보 */}
              {activeSection === 'basic' && step1Data && (
                <Step1BasicInfo
                  data={step1Data}
                  onSave={(data) => {
                    setStep1Data(data);
                    handleSaveSection('basic', data);
                  }}
                  uid={uid}
                />
              )}
              
              {/* 위치 정보 */}
              {activeSection === 'location' && step2Data && (
                <Step2Location
                  data={step2Data}
                  onSave={(data) => {
                    setStep2Data(data);
                    handleSaveSection('location', data);
                  }}
                  onBack={() => setActiveSection('basic')}
                  uid={uid}
                />
              )}
              
              {/* 로고 & 배너 */}
              {activeSection === 'images' && step3Data && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">로고 & 배너 이미지</h2>
                    <p className="text-gray-600">기업의 로고와 배너 이미지를 업로드하세요</p>
                  </div>

                  <div className="space-y-8">
                    {/* 로고 업로드 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        <ImageIcon className="inline w-4 h-4 mr-2" />
                        기업 로고
                      </label>
                      <CustomCloudinaryUpload
                        type="logo"
                        currentImageUrl={step3Data.logo}
                        onUploadSuccess={(url) => {
                          const updatedData = { ...step3Data, logo: url };
                          setStep3Data(updatedData);
                        }}
                        userId={uid}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        권장: 정사각형 (500x500px), PNG 또는 JPG
                      </p>
                    </div>

                    {/* 배너 업로드 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        <ImageIcon className="inline w-4 h-4 mr-2" />
                        배너 이미지
                      </label>
                      <CustomCloudinaryUpload
                        type="banner"
                        currentImageUrl={step3Data.bannerImage}
                        onUploadSuccess={(url) => {
                          const updatedData = { ...step3Data, bannerImage: url };
                          setStep3Data(updatedData);
                        }}
                        userId={uid}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        권장: 가로형 (1200x400px), PNG 또는 JPG
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        handleSaveSection('images', {
                          logo: step3Data.logo,
                          bannerImage: step3Data.bannerImage
                        });
                      }}
                      disabled={saving}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* 회사 소개 */}
              {activeSection === 'introduction' && step3Data && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">회사 소개</h2>
                    <p className="text-gray-600">기업의 비전과 미션을 입력하세요</p>
                  </div>

                  <div className="space-y-6">
                    {/* 슬로건 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        슬로건
                      </label>
                      <input
                        type="text"
                        value={step3Data.slogan || ''}
                        onChange={(e) => setStep3Data({ ...step3Data, slogan: e.target.value })}
                        placeholder="예: 혁신과 도전으로 더 나은 세상을"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* 회사 소개 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        회사 소개 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={step3Data.description || ''}
                        onChange={(e) => setStep3Data({ ...step3Data, description: e.target.value })}
                        placeholder="회사에 대해 상세히 소개해주세요 (최소 50자)"
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(step3Data.description || '').length} / 50자 이상
                      </p>
                    </div>

                    {/* 비전 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        비전 (Vision)
                      </label>
                      <textarea
                        value={step3Data.vision || ''}
                        onChange={(e) => setStep3Data({ ...step3Data, vision: e.target.value })}
                        placeholder="기업이 추구하는 미래의 모습"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* 미션 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        미션 (Mission)
                      </label>
                      <textarea
                        value={step3Data.mission || ''}
                        onChange={(e) => setStep3Data({ ...step3Data, mission: e.target.value })}
                        placeholder="기업의 핵심 목표와 가치"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        if (!step3Data.description || step3Data.description.length < 50) {
                          alert('회사 소개를 최소 50자 이상 입력해주세요.');
                          return;
                        }
                        handleSaveSection('introduction', {
                          description: step3Data.description,
                          slogan: step3Data.slogan,
                          vision: step3Data.vision,
                          mission: step3Data.mission
                        });
                      }}
                      disabled={saving}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* 기술 스택 */}
              {activeSection === 'techstack' && step4Data && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">기술 스택</h2>
                    <p className="text-gray-600">회사에서 사용하는 기술을 추가하세요</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Code className="inline w-4 h-4 mr-2" />
                      사용 기술
                    </label>
                    
                    {/* 기술 스택 입력 */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {step4Data.techStack.map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => {
                                const newTechStack = step4Data.techStack.filter((_, i) => i !== index);
                                setStep4Data({ ...step4Data, techStack: newTechStack });
                              }}
                              className="hover:bg-blue-100 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="tech-input"
                          placeholder="기술 이름 입력 후 Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const value = input.value.trim();
                              if (value && !step4Data.techStack.includes(value)) {
                                setStep4Data({
                                  ...step4Data,
                                  techStack: [...step4Data.techStack, value]
                                });
                                input.value = '';
                              }
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('tech-input') as HTMLInputElement;
                            const value = input.value.trim();
                            if (value && !step4Data.techStack.includes(value)) {
                              setStep4Data({
                                ...step4Data,
                                techStack: [...step4Data.techStack, value]
                              });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          추가
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        예: React, Node.js, Python, AWS 등
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        handleSaveSection('techstack', {
                          techStack: step4Data.techStack
                        });
                      }}
                      disabled={saving}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* 복지 혜택 */}
              {activeSection === 'benefits' && step4Data && (
                <Step4Benefits
                  data={step4Data}
                  onSave={(data) => {
                    setStep4Data(data);
                    handleSaveSection('benefits', { benefits: data.benefits });
                  }}
                  onBack={() => setActiveSection('techstack')}
                  uid={uid}
                />
              )}
              
              {/* 담당자 정보 */}
              {activeSection === 'recruiters' && step5Data && (
                <Step5Recruiters
                  data={step5Data}
                  onSave={(data) => {
                    setStep5Data(data);
                    handleSaveSection('recruiters', data);
                  }}
                  onBack={() => setActiveSection('benefits')}
                  uid={uid}
                />
              )}
            </motion.div>

            {/* Bottom Action Bar */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {savedSections.size > 0 && (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    {savedSections.size}개 섹션 저장됨
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Link
                  href="/company-dashboard"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </Link>
                <button
                  onClick={handleCompleteEdit}
                  disabled={savedSections.size === 0}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense로 감싼 export default 컴포넌트
export default function EditCompanyProfile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    }>
      <EditCompanyProfileContent />
    </Suspense>
  );
}