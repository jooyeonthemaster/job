'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Briefcase, Users } from 'lucide-react';

interface BannerMessage {
  ko: string;
  en: string;
  target: 'company' | 'jobseeker';
  icon: React.ReactNode;
}

const messages: BannerMessage[] = [
  {
    ko: '🌏 글로벌 인재를 찾고 계신가요? 지금 바로 우수한 외국인 인재를 만나보세요',
    en: '🌏 Looking for Global Talent? Meet exceptional international professionals now',
    target: 'company',
    icon: <Briefcase className="w-4 h-4" />
  },
  {
    ko: '💼 한국에서 커리어를 시작하세요! 비자 스폰서십 제공 기업들이 기다립니다',
    en: '💼 Start Your Career in Korea! Companies offering visa sponsorship await',
    target: 'jobseeker',
    icon: <Users className="w-4 h-4" />
  },
  {
    ko: '✨ 신규 기업 가입 시 첫 채용공고 무료! 지금 등록하고 인재를 만나보세요',
    en: '✨ New Companies: First Job Posting Free! Register now and find talent',
    target: 'company',
    icon: <Globe className="w-4 h-4" />
  },
  {
    ko: '🚀 AI 매칭으로 나에게 딱 맞는 채용공고를 추천받으세요',
    en: '🚀 Get AI-powered job recommendations tailored just for you',
    target: 'jobseeker',
    icon: <Globe className="w-4 h-4" />
  }
];

export default function RollingBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 5000); // 5초마다 메시지 변경

    const languageInterval = setInterval(() => {
      setLanguage((prev) => prev === 'ko' ? 'en' : 'ko');
    }, 3000); // 3초마다 언어 변경

    return () => {
      clearInterval(messageInterval);
      clearInterval(languageInterval);
    };
  }, []);

  const currentMessage = messages[currentIndex];
  const bgColor = currentMessage.target === 'company'
    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500'
    : 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500';

  if (!isVisible) return null;

  return (
    <div className={`relative w-full ${bgColor} text-white overflow-hidden`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-10 relative">
          {/* 메시지 영역 */}
          <div className="flex-1 flex items-center justify-center gap-3 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${language}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <span className="hidden sm:inline">{currentMessage.icon}</span>
                <span className="text-center">
                  {language === 'ko' ? currentMessage.ko : currentMessage.en}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 언어 표시 및 닫기 버튼 */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs font-semibold px-2 py-1 bg-white/20 rounded backdrop-blur-sm"
            >
              {language.toUpperCase()}
            </motion.div>

            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="배너 닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 애니메이션 효과 */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-white/50"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 5, ease: 'linear' }}
        key={currentIndex}
      />
    </div>
  );
}