'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  ArrowLeft, MapPin, Briefcase, Globe, Calendar, Award, Code, Languages,
  Target, GraduationCap, Building2, DollarSign, User, Send, Mail, Phone,
  FileText, Download, Shield, Copy, Check, Lock, Unlock, Clock, X
} from 'lucide-react';
import { getTalentById, type TalentProfile } from '@/lib/supabase/talent-service';
import { supabase } from '@/lib/supabase/config';

type AccessStatus = 'self' | 'applied' | 'approved' | 'pending' | 'rejected' | 'admin' | null;

// 관리자 이메일 목록
const ADMIN_EMAILS = [
  'admin@ssmhr.com',
  'yjpark@ssmhr.com',
  'joo.y.oh.ko@gmail.com',
  'nadr110619@gmail.com',
  'admin@gmail.com'
];

export default function TalentDetailPage() {
  const params = useParams();
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [hasContactAccess, setHasContactAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(null);
  const [isCompany, setIsCompany] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!params?.id) return;

      setLoading(true);
      setIsPrivateProfile(false);
      setCheckingAccess(true);

      try {
        // 1. 프로필 로드
        const talentProfile = await getTalentById(params.id as string);
        if (!talentProfile) {
          setIsPrivateProfile(true);
          setLoading(false);
          setCheckingAccess(false);
          return;
        }
        setTalent(talentProfile);

        // 2. 현재 사용자 확인
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setIsCompany(false);
          setHasContactAccess(false);
          setCheckingAccess(false);
          setLoading(false);
          return;
        }

        // 2.5. 관리자 체크 - 관리자는 즉시 연락처 접근 가능
        const userEmail = session.user.email || '';
        if (ADMIN_EMAILS.includes(userEmail)) {
          console.log('[TalentDetail] 관리자 접근:', userEmail);
          setIsCompany(true); // 관리자도 기업처럼 연락처 볼 수 있게
          setHasContactAccess(true);
          setAccessStatus('admin');
          setCheckingAccess(false);
          setLoading(false);
          return;
        }

        // 3. 사용자 타입 확인 (user_metadata 우선, 없으면 companies 테이블 체크)
        let isCompanyUser = false;

        // 방법 1: user_metadata에서 확인 (가장 빠름)
        const userType = session.user.user_metadata?.user_type;
        if (userType === 'company') {
          isCompanyUser = true;
        } else if (!userType) {
          // 방법 2: metadata에 없으면 companies 테이블 직접 확인
          // (이 프로젝트에서 companies.id = auth.uid())
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('id', session.user.id)
            .single();
          isCompanyUser = !!companyData;
        }

        setIsCompany(isCompanyUser);

        if (!isCompanyUser) {
          setHasContactAccess(false);
          setCheckingAccess(false);
          setLoading(false);
          return;
        }

        // 4. 기업인 경우 - 연락처 접근 권한 확인
        const response = await fetch(`/api/contact-access/check/${params.id}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setHasContactAccess(data.hasAccess);
          setAccessStatus(data.requestStatus);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setIsPrivateProfile(true);
      } finally {
        setLoading(false);
        setCheckingAccess(false);
      }
    };

    loadProfile();
  }, [params?.id]);

  const handleRequestAccess = async () => {
    if (!params?.id) return;

    setRequestingAccess(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/contact-access/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          targetUserId: params.id,
          message: requestMessage
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAccessStatus('pending');
        setShowRequestModal(false);
        setRequestMessage('');
        alert('연락처 열람 요청을 보냈습니다. 구직자가 승인하면 연락처를 확인할 수 있습니다.');
      } else {
        alert(data.error || '요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Request access error:', error);
      alert('요청 중 오류가 발생했습니다.');
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleCopyEmail = () => {
    if (talent?.email) {
      navigator.clipboard.writeText(talent.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (talent?.phone) {
      const fullPhone = `${talent.phoneCountryCode || ''}${talent.phone}`;
      navigator.clipboard.writeText(fullPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleDownloadResume = async () => {
    if (!talent?.id) return;
    try {
      const response = await fetch(`/api/download/resume/${talent.id}`);
      if (!response.ok) {
        alert('이력서 다운로드에 실패했습니다.');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = talent.resumeFileName || `${talent.name}_이력서.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Resume download error:', error);
      alert('이력서 다운로드 중 오류가 발생했습니다.');
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min || !max) return '협의 가능';
    const format = (num: number) => num >= 10000 ? `${(num / 10000).toFixed(0)}만원` : `${num.toLocaleString()}원`;
    return `${format(min)} ~ ${format(max)}`;
  };

  const getLanguageBadgeColor = (level: string) => {
    const normalizedLevel = level.toUpperCase();
    if (normalizedLevel.includes('NATIVE')) return 'bg-green-100 text-green-700';
    if (normalizedLevel.includes('FLUENT')) return 'bg-blue-100 text-blue-700';
    if (normalizedLevel.includes('BUSINESS')) return 'bg-purple-100 text-purple-700';
    if (normalizedLevel.includes('INTERMEDIATE')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const calculateAge = (birthYear?: number) => {
    if (!birthYear) return null;
    return new Date().getFullYear() - birthYear + 1;
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return '***@***.***';
    const masked = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : '*'.repeat(local.length);
    return `${masked}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 4 ? `***-****-${digits.slice(-4)}` : '***-****-****';
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">프로필을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 비공개 프로필
  if (isPrivateProfile || !talent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">비공개 프로필입니다</h1>
              <p className="text-gray-600 mb-8">이 프로필은 인재풀에 공개되지 않았거나 존재하지 않는 프로필입니다.</p>
              <Link
                href="/talent"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                인재 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <Link href="/talent" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            인재 목록으로 돌아가기
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-md shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              {talent.profileImage ? (
                <img src={talent.profileImage} alt={talent.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-gray-100">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{talent.name}</h1>
                {talent.talentNumber && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                    #{talent.talentNumber}
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">{talent.title}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {talent.nationality && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{talent.nationality}</span>
                  </div>
                )}
                {talent.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{talent.location}</span>
                  </div>
                )}
                {talent.experience > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{talent.experience}년 경력</span>
                  </div>
                )}
              </div>

              {talent.expectedSalary && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">희망 연봉:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatSalary(talent.expectedSalary.min, talent.expectedSalary.max)}
                  </span>
                  {talent.expectedSalary.negotiable && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">협상가능</span>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0">
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium shadow-sm">
                <Send className="w-5 h-5" />
                채용 신청하기
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {talent.aboutMe && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  자기소개
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{talent.aboutMe}</div>
              </div>
            )}

            {talent.workExperience && talent.workExperience.length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  경력
                </h2>
                <div className="space-y-4">
                  {talent.workExperience.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-sm text-primary-600 font-medium flex items-center gap-1.5 mt-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {exp.company}
                          </p>
                        </div>
                        {exp.current && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">재직중</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate} ~ {exp.current ? '현재' : exp.endDate}
                      </p>
                      {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {talent.education && talent.education.length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                  학력
                </h2>
                <div className="space-y-4">
                  {talent.education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                      <h3 className="font-semibold text-gray-900">{edu.degree} · {edu.field}</h3>
                      <p className="text-sm text-primary-600 font-medium mt-1">{edu.institution}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {edu.startYear} ~ {edu.current ? '재학중' : edu.endYear}
                        </span>
                        {edu.gpa && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            GPA {edu.gpa}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {talent.resumeFileUrl && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    이력서
                  </h2>
                  <button
                    onClick={handleDownloadResume}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <iframe src={`/api/preview/resume/${talent.id}`} className="w-full h-[800px]" title="이력서 미리보기" />
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 연락처 정보 - 핵심 변경 부분 */}
            <div className="bg-white rounded-md shadow-sm p-6 border-2 border-primary-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary-600" />
                연락처 정보
              </h2>

              {/* 접근 권한에 따른 UI 분기 */}
              {hasContactAccess ? (
                // 접근 권한 있음 - 연락처 공개
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${
                    accessStatus === 'admin'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <Unlock className={`w-4 h-4 ${accessStatus === 'admin' ? 'text-purple-600' : 'text-green-600'}`} />
                    <span className={`text-sm font-medium ${accessStatus === 'admin' ? 'text-purple-700' : 'text-green-700'}`}>
                      {accessStatus === 'admin'
                        ? '🔑 관리자 권한으로 열람'
                        : accessStatus === 'self'
                        ? '내 프로필'
                        : accessStatus === 'applied'
                        ? '지원자 연락처'
                        : '열람 승인됨'}
                    </span>
                  </div>

                  {talent.email && (
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{talent.email}</span>
                      </div>
                      <button onClick={handleCopyEmail} className="ml-2 p-1.5 hover:bg-gray-200 rounded transition-colors shrink-0" title="이메일 복사">
                        {copiedEmail ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>
                    </div>
                  )}

                  {talent.phone && (
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700">{talent.phoneCountryCode || ''} {talent.phone}</span>
                      </div>
                      <button onClick={handleCopyPhone} className="ml-2 p-1.5 hover:bg-gray-200 rounded transition-colors shrink-0" title="전화번호 복사">
                        {copiedPhone ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>
                    </div>
                  )}
                </div>
              ) : isCompany ? (
                // 기업 회원 - 접근 권한 없음
                <div className="space-y-4">
                  {/* 블라인드된 연락처 */}
                  <div className="space-y-3">
                    {talent.email && (
                      <div className="flex items-center gap-2 p-2.5 bg-gray-100 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{maskEmail(talent.email)}</span>
                        <Lock className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                      </div>
                    )}
                    {talent.phone && (
                      <div className="flex items-center gap-2 p-2.5 bg-gray-100 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{maskPhone(talent.phone)}</span>
                        <Lock className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                      </div>
                    )}
                  </div>

                  {/* 요청 상태에 따른 버튼/메시지 */}
                  {accessStatus === 'pending' ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">승인 대기 중</span>
                      </div>
                      <p className="text-sm text-yellow-700">구직자가 요청을 확인하면 연락처를 볼 수 있습니다.</p>
                    </div>
                  ) : accessStatus === 'rejected' ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <X className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-800">요청이 거절됨</span>
                        </div>
                        <p className="text-sm text-red-700">구직자가 연락처 열람을 거절했습니다.</p>
                      </div>
                      <button
                        onClick={() => setShowRequestModal(true)}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        다시 요청하기
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      연락처 열람 요청
                    </button>
                  )}

                  <p className="text-xs text-gray-500 text-center">구직자가 승인하면 연락처를 확인할 수 있습니다.</p>
                </div>
              ) : (
                // 비로그인 또는 구직자 - 안내 메시지
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">💼 기업 회원 전용</span><br />
                    연락처 정보는 기업 회원이 열람 요청 후 구직자 승인 시 공개됩니다.
                  </p>
                </div>
              )}
            </div>

            {/* 비자 및 근무 조건 */}
            {(talent.koreanLevel || talent.visaSponsorship !== undefined || talent.desiredJobCategory || talent.workType) && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  비자 및 근무 조건
                </h2>
                <div className="space-y-3 text-sm">
                  {talent.koreanLevel && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">한국어 능력 ⭐</span>
                      <span className="font-bold text-primary-700">{talent.koreanLevel}</span>
                    </div>
                  )}
                  {talent.visaSponsorship !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">비자 스폰서십</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${talent.visaSponsorship ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {talent.visaSponsorship ? '필요함' : '불필요'}
                      </span>
                    </div>
                  )}
                  {talent.desiredJobCategory && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">희망 직군</span>
                      <span className="font-medium text-gray-900">{talent.desiredJobCategory}</span>
                    </div>
                  )}
                  {talent.workType && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">고용 형태</span>
                      <span className="font-medium text-gray-900">{talent.workType}</span>
                    </div>
                  )}
                  {talent.remoteWork && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">재택근무</span>
                      <span className="font-medium text-gray-900">{talent.remoteWork}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {talent.skills && talent.skills.length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary-600" />
                  기술 스택
                </h2>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {talent.languages && talent.languages.length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary-600" />
                  언어 능력
                </h2>
                <div className="space-y-2">
                  {talent.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">{lang.language}</span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded ${getLanguageBadgeColor(lang.level)}`}>{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desired Positions */}
            {talent.desiredPositions && talent.desiredPositions.length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  희망 직무
                </h2>
                <div className="flex flex-wrap gap-2">
                  {talent.desiredPositions.map((pos, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">{pos}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Locations */}
            {talent.preferredLocations && talent.preferredLocations.length > 0 && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  희망 근무지
                </h2>
                <div className="flex flex-wrap gap-2">
                  {talent.preferredLocations.map((loc, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{loc}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 열람 요청 모달 */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">연락처 열람 요청</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              <span className="font-medium text-gray-900">{talent.name}</span>님에게 연락처 열람을 요청합니다.
              구직자가 승인하면 이메일과 전화번호를 확인할 수 있습니다.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">메시지 (선택)</label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="구직자에게 전달할 메시지를 입력하세요... (예: 저희 회사에서 OO 포지션을 모집하고 있습니다)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleRequestAccess}
                disabled={requestingAccess}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {requestingAccess ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    요청 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    요청 보내기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
