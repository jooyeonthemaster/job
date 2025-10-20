// 지원자 관리 탭 컴포넌트

'use client';

import { Users, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

export const ApplicantsTab = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">지원자 관리</h1>

      {/* 유료 결제 안내 카드 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 border-2 border-primary-200 rounded-2xl shadow-xl">
        {/* 장식용 배경 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative p-12">
          <div className="max-w-3xl mx-auto text-center">
            {/* 아이콘 */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-6 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>

            {/* 제목 */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지원자 열람은 유료 결제 후 이용 가능합니다
            </h2>

            {/* 설명 */}
            <p className="text-lg text-gray-700 mb-8">
              채용공고에 지원한 인재들의 상세 정보를 확인하고 관리하려면<br />
              유료 플랜으로 업그레이드가 필요합니다.
            </p>

            {/* 혜택 목록 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white">
              <h3 className="text-xl font-bold text-gray-900 mb-4">유료 플랜 주요 혜택</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">지원자 무제한 열람</p>
                    <p className="text-sm text-gray-600">모든 지원자의 상세 정보 확인</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">이력서 다운로드</p>
                    <p className="text-sm text-gray-600">PDF 형식으로 저장 가능</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">채용 진행 상태 관리</p>
                    <p className="text-sm text-gray-600">서류/면접/합격 단계별 관리</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">우선 노출 혜택</p>
                    <p className="text-sm text-gray-600">채용공고 상단 배치</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 문의 안내 */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-lg font-semibold mb-3">
                유료 플랜 문의 및 상담
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5" />
                <a
                  href="mailto:yjpark@ssmhr.com"
                  className="text-xl font-bold hover:underline"
                >
                  yjpark@ssmhr.com
                </a>
              </div>
              <p className="text-sm text-primary-100">
                이메일로 문의주시면 맞춤형 플랜을 안내해드립니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 안내 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">무료 플랜에서도 가능한 기능</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 채용공고 등록 및 관리</li>
              <li>• 기업 정보 페이지 공개</li>
              <li>• 지원자 수 확인 (이름/이력서는 유료)</li>
              <li>• 기본 통계 데이터 조회</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

