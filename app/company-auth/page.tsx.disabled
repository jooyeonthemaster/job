'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithGoogle } from '@/lib/firebase/company-service';
import { 
  Building2, 
  ArrowRight, 
  Check, 
  Users, 
  Globe, 
  Briefcase,
  Shield,
  TrendingUp,
  Award
} from 'lucide-react';

export default function CompanyAuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      const { user, isNewCompany } = await signUpWithGoogle();
      
      if (isNewCompany) {
        // 새 기업은 온보딩으로
        router.push('/company-auth/onboarding');
      } else {
        // 기존 기업은 대시보드로
        router.push('/company-dashboard');
      }
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: '검증된 글로벌 인재 풀',
      description: '전 세계의 우수한 인재들과 연결됩니다'
    },
    {
      icon: Globe,
      title: '다국어 지원',
      description: '한국어, 영어 등 다양한 언어로 소통 가능'
    },
    {
      icon: Briefcase,
      title: '효율적인 채용 관리',
      description: '지원자 관리와 커뮤니케이션을 한 곳에서'
    },
    {
      icon: Shield,
      title: '안전한 정보 관리',
      description: '기업 정보와 지원자 데이터를 안전하게 보호'
    },
    {
      icon: TrendingUp,
      title: '채용 성과 분석',
      description: '데이터 기반의 채용 인사이트 제공'
    },
    {
      icon: Award,
      title: '기업 브랜딩',
      description: '글로벌 인재들에게 기업을 효과적으로 홍보'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-12">        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
              ← 메인으로 돌아가기
            </Link>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              기업 파트너 등록
            </h1>
            <p className="text-xl text-gray-600">
              글로벌 인재와 함께 성장하는 기업이 되어보세요
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Benefits */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                왜 우리 플랫폼을 선택해야 할까요?
              </h2>
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sign Up Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  기업 회원가입
                </h2>
                <p className="text-gray-600">
                  간편하게 구글 계정으로 시작하세요
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? '처리중...' : 'Google로 시작하기'}
              </button>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600 mb-4">
                  가입 후 기업 정보를 입력하고<br/>
                  바로 채용 공고를 등록할 수 있습니다
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>무료 가입</span>
                  <Check className="w-4 h-4 text-green-500 ml-2" />
                  <span>즉시 시작</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  가입 시 <Link href="/terms" className="text-primary-600 hover:underline">이용약관</Link> 및{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline">개인정보처리방침</Link>에 동의합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}