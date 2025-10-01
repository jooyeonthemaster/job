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
      
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 pt-20 pb-24">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge badge-primary mb-4">
                외국인 취업 가이드
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                한국에서의 합법적인 취업을
                <span className="block mt-2 text-gradient">완벽하게 준비하세요</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              합법 취업을 위한 필수 조건
            </h2>
            <p className="text-gray-600">한국에서 합법적으로 일하기 위해 반드시 갖춰야 할 요건</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: '적절한 비자', desc: '취업 가능한 체류자격' },
              { icon: FileText, title: '외국인등록증', desc: '신분증명 및 체류 증명' },
              { icon: Briefcase, title: '취업허가', desc: '체류자격 외 활동허가' },
              { icon: Award, title: '4대보험', desc: '의무 가입 대상' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Types */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              비자 종류별 상세 안내
            </h2>
            <p className="text-gray-600 mb-8">귀하에게 적합한 비자 유형을 확인하세요</p>
            
            <div className="inline-flex bg-white p-1 rounded-xl shadow-sm">
              <button
                onClick={() => setActiveTab('professional')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'professional' 
                    ? 'gradient-bg text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                전문직 비자
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'general' 
                    ? 'gradient-bg text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                일반 취업 비자
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="gradient-bg text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">비자 코드</th>
                    <th className="px-6 py-4 text-left font-semibold">종류</th>
                    <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">취업 가능처</th>
                    <th className="px-6 py-4 text-left font-semibold hidden lg:table-cell">주요 요건</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visaTypes[activeTab as keyof typeof visaTypes].map((visa, index) => (
                    <motion.tr 
                      key={visa.code}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <span className="badge badge-primary">
                          {visa.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{visa.type}</td>
                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{visa.workplace}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm hidden lg:table-cell">{visa.requirements}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              비자 변경 프로세스
            </h2>
            <p className="text-gray-600">관광비자에서 취업비자로 변경하는 3단계</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[calc(100%-20%)]">
                        <div className="w-full h-[2px] bg-gradient-to-r from-primary-400 to-primary-200"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 
                          border-t-[6px] border-t-transparent
                          border-b-[6px] border-b-transparent
                          border-l-[8px] border-l-primary-400"></div>
                      </div>
                    )}
                    
                    <div className="w-24 h-24 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    
                    <span className="badge badge-primary mb-2">
                      STEP {step.step}
                    </span>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">불법 취업 시 처벌</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-red-600 mb-3">처벌 내용</h3>
                  <ul className="space-y-2">
                    {[
                      '강제퇴거 및 출국명령',
                      '입국금지 (1년~10년)',
                      '벌금 최대 2천만원',
                      '징역 3년 이하'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">절대 금지 행위</h3>
                  <ul className="space-y-2">
                    {[
                      '관광비자로 아르바이트',
                      '허가받지 않은 업종 근무',
                      '불법 브로커 이용',
                      '허위 서류 제출'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Centers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              도움받을 수 있는 기관
            </h2>
            <p className="text-gray-600">문제 발생 시 연락 가능한 공식 지원 기관</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCenters.map((center, index) => (
              <motion.div
                key={index}
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <center.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{center.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{center.description}</p>
                <a href={`tel:${center.contact}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">{center.contact}</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 gradient-bg">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 text-white">
            <h2 className="text-3xl font-bold mb-2">
              성공적인 한국 취업을 위한 팁
            </h2>
            <p className="text-white/90">전문가들이 추천하는 준비 사항</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, title: '한국어 능력', desc: 'TOPIK 3급 이상' },
              { icon: Users, title: '문화 이해', desc: '직장 문화 학습' },
              { icon: Globe, title: '네트워킹', desc: '커뮤니티 참여' },
              { icon: Star, title: '장기 계획', desc: '영주권 준비' }
            ].map((tip, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <tip.icon className="w-10 h-10 mb-3 mx-auto" />
                <h3 className="font-bold mb-2">{tip.title}</h3>
                <p className="text-sm text-white/80">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              자주 묻는 질문
            </h2>
            <p className="text-gray-600">궁금한 점을 빠르게 해결하세요</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
                </button>
                
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 pl-8">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                전문가와 함께 시작하세요
              </h2>
              <p className="text-xl text-white/90">
                복잡한 비자 절차, 혼자 고민하지 마세요
                <br />경험 많은 전문가가 처음부터 끝까지 함께합니다
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}