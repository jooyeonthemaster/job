import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-gray-900 text-gray-300 mt-auto w-full overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.jpg"
                alt="Bridge World"
                width={48}
                height={48}
                className="rounded-lg"
                style={{ width: "auto", height: "auto" }}
              />
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
                <span className="text-gray-400">대표전화:</span>{' '}
                <a href="tel:070-4060-0805" className="hover:text-white transition-colors">
                  070-4060-0805
                </a>
              </li>
              <li>
                <span className="text-gray-400">고객지원:</span>{' '}
                <a
                  href="mailto:support@linkbw.com"
                  className="hover:text-white transition-colors"
                >
                  support@linkbw.com
                </a>
              </li>
              <li>
                <span className="text-gray-400">이메일:</span>{' '}
                <a
                  href="mailto:yjpark@ssmhr.com"
                  className="hover:text-white transition-colors"
                >
                  yjpark@ssmhr.com
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
            <p>상호: SSMHR(선한이웃) | 대표자: 박윤미</p>
            <p>사업자등록번호: 412-19-01752 | 개업일: 2022년 05월 09일</p>
            <p>(본사) 경기도 수원시 팔달구 고등동 336-1(팔달로33) 웨일애비뉴 713호</p>
            <p>(서울사무소) 서울특별시 강남구 강남대로156길12 다복빌딩 4층 G42</p>
            <p>사업 종류: 고용알선, 전자상거래</p>
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
