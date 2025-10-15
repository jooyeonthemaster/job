'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield } from 'lucide-react';
import { COMPANY_TERMS } from '@/constants/company-terms';

export default function PrivacyPage() {
  const router = useRouter();
  const privacyTerms = COMPANY_TERMS.privacyTerms;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 뒤로 가기 */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          뒤로 가기
        </button>

        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{privacyTerms.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{privacyTerms.summary}</p>
            </div>
          </div>
        </div>

        {/* 개인정보 처리방침 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose prose-slate max-w-none">
            <div
              className="whitespace-pre-wrap text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: privacyTerms.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>').replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>').replace(/^\| (.*) \|$/gim, '<tr>$1</tr>').replace(/\n\n/g, '<br/><br/>') }}
            />
          </div>

          {/* 추가 안내 */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">개인정보 관련 권리</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ 개인정보 열람 요구권</li>
              <li>✓ 개인정보 정정·삭제 요구권</li>
              <li>✓ 개인정보 처리 정지 요구권</li>
              <li>✓ 개인정보 이동권</li>
            </ul>
            <p className="mt-4 text-sm text-blue-700">
              위 권리를 행사하시려면{' '}
              <strong>support@globaltalent.com</strong>으로 문의해주세요.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            개인정보보호 관련 문의:{' '}
            <a href="mailto:privacy@globaltalent.com" className="text-primary-600 hover:underline">
              privacy@globaltalent.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
