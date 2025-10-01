'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, 
  User, 
  ArrowRight, 
  Globe,
  Users,
  Briefcase,
  ChevronLeft
} from 'lucide-react';

export default function LoginSelectPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'company' | 'jobseeker' | null>(null);

  const handleContinue = () => {
    if (selectedType === 'company') {
      router.push('/login/company');
    } else if (selectedType === 'jobseeker') {
      router.push('/login/jobseeker');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">GlobalTalent</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              환영합니다!
            </h1>
            <p className="text-lg text-gray-600">
              로그인 유형을 선택해주세요
            </p>
          </div>

          {/* Login Type Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Company Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType('company')}
              className={`p-8 rounded-2xl border-2 transition-all ${
                selectedType === 'company'
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  selectedType === 'company'
                    ? 'bg-primary-100'
                    : 'bg-gray-100'
                }`}>
                  <Building2 className={`w-10 h-10 ${
                    selectedType === 'company'
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  기업 회원
                </h3>
                <p className="text-gray-600 text-sm">
                  인재를 찾고 계신 기업
                </p>
                <div className="mt-4 space-y-1 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span>채용공고 등록</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>인재풀 검색</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Jobseeker Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType('jobseeker')}
              className={`p-8 rounded-2xl border-2 transition-all ${
                selectedType === 'jobseeker'
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  selectedType === 'jobseeker'
                    ? 'bg-primary-100'
                    : 'bg-gray-100'
                }`}>
                  <User className={`w-10 h-10 ${
                    selectedType === 'jobseeker'
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  개인 회원
                </h3>
                <p className="text-gray-600 text-sm">
                  일자리를 찾고 계신 구직자
                </p>
                <div className="mt-4 space-y-1 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span>채용공고 지원</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Globe className="w-4 h-4" />
                    <span>글로벌 기업 탐색</span>
                  </div>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedType}
              className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                selectedType
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              계속하기
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-12 text-gray-600">
            <p>
              아직 계정이 없으신가요?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}