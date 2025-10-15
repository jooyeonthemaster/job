'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, User, ArrowRight, Globe } from 'lucide-react';

export default function LoginSelectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <span className="text-4xl font-bold text-gray-900">GlobalTalent</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">로그인</h1>
          <p className="text-gray-600 text-lg">회원 유형을 선택해주세요</p>
        </div>

        {/* Login Type Selection */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* 개인 회원 로그인 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group"
          >
            <Link
              href="/login/jobseeker"
              className="block bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">개인 회원</h2>
                <p className="text-gray-600 mb-6">
                  일자리를 찾고 계신 구직자를 위한 로그인
                </p>
                <div className="flex items-center gap-2 text-secondary-600 font-medium group-hover:gap-3 transition-all">
                  개인 회원 로그인
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 기업 회원 로그인 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group"
          >
            <Link
              href="/login/company"
              className="block bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">기업 회원</h2>
                <p className="text-gray-600 mb-6">
                  인재를 찾고 계신 기업을 위한 로그인
                </p>
                <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all">
                  기업 회원 로그인
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">아직 회원이 아니신가요?</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-lg"
          >
            회원가입하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
