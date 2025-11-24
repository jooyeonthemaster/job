import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext_Supabase";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "브릿지월드(Bridge World) - 외국인 구직자를 위한 채용 플랫폼",
  description: "글로벌 인재와 한국 기업을 연결하는 채용 매칭 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Daum Postcode API for address search */}
        <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        {/* Google Translate Element (hidden) */}
        <div id="google_translate_element" style={{ display: 'none' }} suppressHydrationWarning></div>
        
        {/* Google Translate Scripts - Load after interactive */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function TranslateInit() {
                if (typeof google !== 'undefined' && google.translate) {
                  new google.translate.TranslateElement({
                    pageLanguage: 'ko',
                    includedLanguages: 'ko,en,zh-CN,zh-TW,ja,vi,th,id,es,fr,de,ru,pt,ar',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                    multilanguagePage: true
                  }, 'google_translate_element');
                  console.log('[Google Translate] 위젯 초기화 완료');
                }
              }
            `,
          }}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=TranslateInit"
          strategy="afterInteractive"
        />
        
        <AuthProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
