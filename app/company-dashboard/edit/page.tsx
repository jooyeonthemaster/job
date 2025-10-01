'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  FileText, 
  Gift, 
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function EditCompanyProfile() {
  const router = useRouter();
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
    { id: 'basic', title: '기본 정보', icon: Building2, component: 'step1' },
    { id: 'location', title: '위치 정보', icon: MapPin, component: 'step2' },
    { id: 'introduction', title: '회사 소개', icon: FileText, component: 'step3' },
    { id: 'benefits', title: '복지 & 기술', icon: Gift, component: 'step4' },
    { id: 'recruiters', title: '담당자 & 로고', icon: Users, component: 'step5' }
  ];

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
            }
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
              
              {activeSection === 'introduction' && step3Data && (
                <Step3Introduction
                  data={step3Data}
                  onSave={(data) => {
                    setStep3Data(data);
                    handleSaveSection('introduction', data);
                  }}
                  onBack={() => setActiveSection('location')}
                  uid={uid}
                />
              )}
              
              {activeSection === 'benefits' && step4Data && (
                <Step4Benefits
                  data={step4Data}
                  onSave={(data) => {
                    setStep4Data(data);
                    handleSaveSection('benefits', data);
                  }}
                  onBack={() => setActiveSection('introduction')}
                  uid={uid}
                />
              )}
              
              {activeSection === 'recruiters' && step5Data && (
                <Step5Recruiters
                  data={step5Data}
                  onSave={(data) => {
                    setStep5Data(data);
                    handleSaveSection('recruiters', data);
                    // 마지막 섹션 저장 후 대시보드로 이동
                    setTimeout(() => handleCompleteEdit(), 1500);
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