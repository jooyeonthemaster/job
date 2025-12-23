'use client';

import { motion } from 'framer-motion';
import {
  Globe, Shield, AlertCircle, CheckCircle, FileText,
  Users, Building, Phone, Mail, MapPin, Calendar,
  Briefcase, GraduationCap, Heart, Award, Clock,
  ChevronRight, ExternalLink, Info, BookOpen,
  AlertTriangle, HelpCircle, Star, ArrowRight, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function GlobalHiringPage() {
  const [activeTab, setActiveTab] = useState('professional');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const visaTypes = {
    professional: [
      { code: 'E-1', type: '교수', workplace: '대학교, 연구기관', requirements: '관련 분야 박사학위 또는 교수 경력' },
      { code: 'E-2', type: '회화지도', workplace: '어학원, 학교', requirements: '학사 이상, 영어권 국적 또는 영어 증명' },
      { code: 'E-3', type: '연구', workplace: '연구소, 기업 R&D', requirements: '이공계 학사 이상, 연구 경력' },
      { code: 'E-4', type: '기술지도', workplace: '기술 이전 기업', requirements: '기술 전문성 입증' },
      { code: 'E-5', type: '전문직업', workplace: '법률, 의료, 회계', requirements: '한국 자격증 보유' },
      { code: 'E-6', type: '예술흥행', workplace: '엔터테인먼트', requirements: '관련 분야 경력 증명' },
      { code: 'E-7', type: '특정활동', workplace: 'IT, 제조업 등', requirements: '관련 학위 또는 경력' },
    ],
    general: [
      { code: 'E-9', type: '비전문취업', workplace: '제조업, 건설업', requirements: '한국어능력시험 합격' },
      { code: 'F-4', type: '재외동포', workplace: '제한 없음', requirements: '한국계 혈통 증명' },
      { code: 'F-5', type: '영주', workplace: '제한 없음', requirements: '장기 체류 조건 충족' },
      { code: 'F-6', type: '결혼이민', workplace: '제한 없음', requirements: '한국인 배우자' },
    ]
  };

  const processSteps = [
    {
      step: 1,
      title: '취업처 확정',
      icon: Building,
      description: '합법적인 고용주를 찾아 고용계약서를 작성합니다',
    },
    {
      step: 2,
      title: '서류 준비',
      icon: FileText,
      description: '비자 신청에 필요한 모든 서류를 준비합니다',
    },
    {
      step: 3,
      title: '신청 및 심사',
      icon: Shield,
      description: '출입국관리사무소에 신청 후 심사를 받습니다',
    }
  ];

  const supportCenters = [
    {
      name: '출입국관리사무소',
      contact: '1345',
      description: '비자 및 체류 관련 업무',
      icon: Building,
    },
    {
      name: '고용노동부',
      contact: '1350',
      description: '고용허가제 관련 문의',
      icon: Briefcase,
    },
    {
      name: '외국인근로자지원센터',
      contact: '1644-0644',
      description: '임금체불 및 법률 지원',
      icon: Users,
    },
    {
      name: '다문화가족지원센터',
      contact: '1577-1366',
      description: '한국어 교육 및 취업 지원',
      icon: Heart,
    }
  ];

  const faqs = [
    {
      question: '관광비자로 와서 바로 일할 수 있나요?',
      answer: '절대 불가능합니다. 관광비자(B-2)로는 어떤 형태의 취업도 금지되어 있으며, 반드시 적절한 취업비자로 변경해야 합니다.'
    },
    {
      question: '비자 변경 없이 아르바이트는 괜찮나요?',
      answer: '불법입니다. 단기간 아르바이트라도 체류자격과 맞지 않으면 불법 취업으로 간주됩니다.'
    },
    {
      question: '행정사 비용은 얼마나 드나요?',
      answer: '케이스별로 다르지만 보통 50만원~150만원 정도입니다. 복잡한 케이스의 경우 더 높을 수 있습니다.'
    },
    {
      question: '비자 신청이 거절되면 어떻게 되나요?',
      answer: '재신청이 가능하지만, 거절 사유를 정확히 파악하고 보완해야 합니다. 전문가 상담이 필수입니다.'
    },
    {
      question: '가족도 함께 올 수 있나요?',
      answer: 'E-1~E-7 비자 소지자의 배우자와 미성년 자녀는 F-3(동반) 비자를 신청할 수 있습니다.'
    },
    {
      question: 'TOPIK은 꼭 필요한가요?',
      answer: 'E-9 비자는 필수이며, 다른 비자도 한국어 능력이 있으면 취업과 비자 발급에 유리합니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
          {/* Left Main Content */}
          <div className="space-y-8 w-full min-w-0">
            {/* Hero Section */}
            <section className="hero-gradient relative overflow-hidden rounded-2xl">
              <div className="px-6 py-12 md:p-12">
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="badge badge-primary mb-4">
                      외국인 취업 가이드
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                      한국에서의 합법적인 취업을
                      <span className="block mt-2 text-gradient">완벽하게 준비하세요</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      복잡한 비자 절차부터 취업 후 정착까지,
                      모든 과정을 전문가와 함께 준비하세요
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
            </section>

            {/* Essential Requirements */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  합법 취업을 위한 필수 조건
                </h2>
                <p className="text-gray-600">한국에서 합법적으로 일하기 위해 반드시 갖춰야 할 요건</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: '적절한 비자', desc: '취업 가능한 체류자격' },
                  { icon: FileText, title: '외국인등록증', desc: '신분증명 및 체류 증명' },
                  { icon: Briefcase, title: '취업허가', desc: '체류자격 외 활동허가' },
                  { icon: Award, title: '4대보험', desc: '의무 가입 대상' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="card p-6 flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 gradient-bg rounded-md flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Visa Types */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  비자 종류별 상세 안내
                </h2>
                <p className="text-gray-600 mb-6">귀하에게 적합한 비자 유형을 확인하세요</p>

                <div className="inline-flex bg-gray-100 p-1 rounded-md">
                  <button
                    onClick={() => setActiveTab('professional')}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'professional'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    전문직 비자
                  </button>
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'general'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    일반 취업 비자
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">비자 코드</th>
                      <th className="px-4 py-3">종류</th>
                      <th className="px-4 py-3">취업 가능처</th>
                      <th className="px-4 py-3 rounded-r-lg">주요 요건</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visaTypes[activeTab as keyof typeof visaTypes].map((visa, index) => (
                      <motion.tr
                        key={visa.code}
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-4 py-3 font-semibold text-primary-600">
                          {visa.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{visa.type}</td>
                        <td className="px-4 py-3 text-gray-600">{visa.workplace}</td>
                        <td className="px-4 py-3 text-gray-600">{visa.requirements}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Process Steps */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  비자 변경 프로세스
                </h2>
                <p className="text-gray-600">관광비자에서 취업비자로 변경하는 3단계</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    className="relative text-center p-4 rounded-xl bg-gray-50"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-16 h-16 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full mb-2 inline-block">
                      STEP {step.step}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-500 text-sm">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Important Notice */}
            <section className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">불법 취업 시 처벌</h2>
              </div>

              <div className="grid gap-6">
                <div>
                  <h3 className="font-semibold text-red-700 mb-2">처벌 내용</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      '강제퇴거 및 출국명령',
                      '입국금지 (1년~10년)',
                      '벌금 최대 2천만원',
                      '징역 3년 이하'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700 bg-white px-3 py-2 rounded-lg border border-red-100">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Support Centers */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  도움받을 수 있는 기관
                </h2>
                <p className="text-gray-600">문제 발생 시 연락 가능한 공식 지원 기관</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {supportCenters.map((center, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-100 rounded-xl p-4 hover:border-primary-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <center.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{center.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{center.description}</p>
                        <a href={`tel:${center.contact}`} className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline">
                          <Phone className="w-3 h-3" />
                          {center.contact}
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Tips Section */}
            <section className="gradient-bg rounded-2xl p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">
                성공적인 한국 취업을 위한 팁
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: GraduationCap, title: '한국어 능력', desc: 'TOPIK 3급 이상' },
                  { icon: Users, title: '문화 이해', desc: '직장 문화 학습' },
                  { icon: Globe, title: '네트워킹', desc: '커뮤니티 참여' },
                  { icon: Star, title: '장기 계획', desc: '영주권 준비' }
                ].map((tip, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <tip.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{tip.title}</h3>
                      <p className="text-xs text-white/80">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block space-y-6 sticky top-24">
            {/* Contact Section - Prominent */}
            <div className="bg-white border md:border-2 border-primary-100/50 md:border-primary-100 rounded-2xl p-6 shadow-[0_2px_20px_rgba(59,130,246,0.1)] relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  취업 관련 문의
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  궁금하신 점이 있으시면 아래 메일로 문의해 주시면 신속하게 답변해 드립니다.
                </p>

                <div className="space-y-3">
                  <a href="mailto:support@linkbw.com" className="flex items-center p-3 bg-primary-50/50 rounded-xl border border-primary-100 hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm gap-4 group/item">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm group-hover/item:text-primary-700 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-primary-600 font-medium block mb-0.5">고객 지원</span>
                      <span className="font-bold text-gray-900 text-sm">support@linkbw.com</span>
                    </div>
                  </a>

                  <a href="mailto:yjpark@ssmhr.com" className="flex items-center p-3 bg-primary-50/50 rounded-xl border border-primary-100 hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm gap-4 group/item">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm group-hover/item:text-primary-700 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-primary-600 font-medium block mb-0.5">채용 담당자</span>
                      <span className="font-bold text-gray-900 text-sm">yjpark@ssmhr.com</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Decorative circle */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700 blur-2xl"></div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                자주 묻는 질문
              </h3>

              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full text-left py-2 flex items-start justify-between group"
                    >
                      <span className={`font-medium text-sm transition-colors ${expandedFaq === index ? 'text-primary-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {faq.question}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0 transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
                    </button>

                    {expandedFaq === index && (
                      <div className="pb-2">
                        <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Sticky Call to Action or Info if needed */}
          </div>
        </div>

        {/* Mobile Contact & FAQ (Visible only on small screens) */}
        <div className="mt-12 lg:hidden space-y-8">
          <section className="bg-primary-50/50 border border-primary-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-600" />
              취업 관련 문의
            </h3>
            <div className="space-y-3">
              <a href="mailto:support@linkbw.com" className="block p-3 bg-white rounded-xl border border-primary-100 text-center font-bold text-gray-900 text-sm shadow-sm">
                support@linkbw.com
              </a>
              <a href="mailto:yjpark@ssmhr.com" className="block p-3 bg-white rounded-xl border border-primary-100 text-center font-bold text-gray-900 text-sm shadow-sm">
                yjpark@ssmhr.com
              </a>
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">자주 묻는 질문</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={`mobile-faq-${index}`} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <h4 className="font-bold text-gray-800 mb-2 text-sm">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}