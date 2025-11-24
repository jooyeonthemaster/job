import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-gray-900 text-gray-300 mt-auto w-full overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Bridge World</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              글로벌 인재와 한국 기업을 연결하는<br />
              채용 매칭 플랫폼
            </p>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="text-white font-bold mb-4">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  채용공고
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-white transition-colors">
                  기업정보
                </Link>
              </li>
              <li>
                <Link href="/talent" className="hover:text-white transition-colors">
                  인재풀
                </Link>
              </li>
              <li>
                <Link href="/global-hiring" className="hover:text-white transition-colors">
                  해외 인력 채용 도움
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="text-white font-bold mb-4">고객 지원</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@bridgeworld.co.kr"
                  className="hover:text-white transition-colors"
                >
                  고객센터: support@bridgeworld.co.kr
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  서비스 이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  개인정보 처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="text-sm text-gray-500 space-y-1">
            <p className="font-bold text-gray-400 mb-2">사업자 정보</p>
            <p>상호: 선한이웃 | 대표자: 박윤미</p>
            <p>사업자등록번호: 412-19-01752 | 개업일: 2022년 05월 09일</p>
            <p>주소: 경기도 수원시 팔달구 팔달로 33, 7층 713호(고등동, 웨일애비뉴)</p>
            <p>사업 종류: 고용 알선업, 생활식품 관리, 도매 및 소매업, SNS마켓</p>
          </div>

          {/* 저작권 */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} 선한이웃. All rights reserved.</p>
            <p className="mt-1">서비스명: 브릿지월드(Bridge World)</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
