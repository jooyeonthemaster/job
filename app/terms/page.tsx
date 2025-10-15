'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText } from 'lucide-react';
import { COMPANY_TERMS } from '@/constants/company-terms';

export default function TermsPage() {
  const router = useRouter();
  const serviceTerms = COMPANY_TERMS.serviceTerms;

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
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{serviceTerms.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{serviceTerms.summary}</p>
            </div>
          </div>
        </div>

        {/* 약관 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose prose-slate max-w-none">
            <div
              className="whitespace-pre-wrap text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: serviceTerms.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>').replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>').replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>').replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>').replace(/\n\n/g, '<br/><br/>') }}
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            문의사항이 있으시면{' '}
            <Link href="/contact" className="text-primary-600 hover:underline">
              고객센터
            </Link>
            로 연락해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
