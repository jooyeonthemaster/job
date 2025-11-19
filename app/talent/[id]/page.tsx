'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Globe,
  Calendar,
  Award,
  Code,
  Languages,
  Target,
  GraduationCap,
  Building2,
  DollarSign,
  User,
  Send,
  Mail,
  Phone,
  FileText,
  Download,
  Home,
  Shield,
  Settings,
  Copy,
  Check
} from 'lucide-react';
import { getTalentById, type TalentProfile } from '@/lib/supabase/talent-service';
import { supabase } from '@/lib/supabase/config';

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (params?.id) {
        setLoading(true);
        setIsPrivateProfile(false);
        setCheckingPayment(true);

        try {
          // 1. 프로필 로드
          const talentProfile = await getTalentById(params.id as string);
          if (talentProfile) {
            setTalent(talentProfile);
          } else {
            // 프로필을 찾을 수 없는 경우 (비공개 or 삭제됨)
            console.error('Profile not found or private');
            setIsPrivateProfile(true);
            setLoading(false);
            setCheckingPayment(false);
            return;
          }

          // 2. 현재 사용자 확인
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            // 로그인하지 않은 경우 - 공개 정보만 표시
            setIsCompany(false);
            setHasPaid(false);
            setCheckingPayment(false);
            setLoading(false);
            return;
          }

          // 3. 사용자 타입 확인
          const { data: userData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', user.id)
            .single();

          const isCompanyUser = userData?.user_type === 'company';
          setIsCompany(isCompanyUser);

          if (!isCompanyUser) {
            // 기업이 아닌 경우 (구직자 또는 기타) - 공개 정보만 표시
            setHasPaid(false);
            setCheckingPayment(false);
            setLoading(false);
            return;
          }

          // 4. 기업인 경우 - 지원 여부 또는 결제 여부 확인
          // 4-1. 먼저 현재 기업의 company_id 조회
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!companyData?.id) {
            // 기업 정보가 없는 경우 - 공개 정보만 표시
            setHasPaid(false);
            setCheckingPayment(false);
            setLoading(false);
            return;
          }

          // 4-2. 지원 여부 확인
          const { data: applicationData } = await supabase
            .from('job_applications')
            .select('id')
            .eq('applicant_id', params.id)
            .eq('company_id', companyData.id)
            .maybeSingle();

          if (applicationData) {
            // 지원한 경우 - 결제 없이도 상세 정보 표시
            setHasPaid(true);
            setCheckingPayment(false);
            setLoading(false);
            return;
          }

          // 4-3. 지원하지 않은 경우 - 결제 여부 확인
          const paymentResponse = await fetch('/api/payment/profile/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ talentId: params.id })
          });

          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            setHasPaid(paymentData.hasPaid);

            // 결제하지 않은 경우 결제 페이지로 리다이렉트
            if (!paymentData.hasPaid) {
              alert('프로필 상세 정보를 확인하려면 지원자가 지원하거나 결제가 필요합니다.');
              router.push(`/payment/profile/${params.id}`);
              return;
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setIsPrivateProfile(true);
        } finally {
          setLoading(false);
          setCheckingPayment(false);
        }
      }
    };

    loadProfile();
  }, [params?.id, router]);

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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                비공개 프로필입니다
              </h1>
              <p className="text-gray-600 mb-8">
                이 프로필은 인재풀에 공개되지 않았거나 존재하지 않는 프로필입니다.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-left">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  💡 인재풀 등록 안내
                </p>
                <p className="text-sm text-blue-800">
                  구직자가 프로필을 100% 완성하고 인재풀에 등록하면, 기업들이 프로필을 보고 스카우트 제안을 보낼 수 있습니다.
                </p>
              </div>
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

  const formatSalary = (min?: number, max?: number) => {
    if (!min || !max) return '협의 가능';
    const format = (num: number) => {
      if (num >= 10000) return `${(num / 10000).toFixed(0)}만원`;
      return `${num.toLocaleString()}원`;
    };
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
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear + 1; // 한국식 나이
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <Link
            href="/talent"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            인재 목록으로 돌아가기
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="shrink-0">
              {talent.profileImage ? (
                <img
                  src={talent.profileImage}
                  alt={talent.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-gray-100">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{talent.name}</h1>
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
                {talent.email && (isCompany ? hasPaid : false) && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{talent.email}</span>
                  </div>
                )}
              </div>

              {/* Salary */}
              {talent.expectedSalary && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">희망 연봉:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatSalary(talent.expectedSalary.min, talent.expectedSalary.max)}
                    </span>
                    {talent.expectedSalary.currency && talent.expectedSalary.currency !== 'KRW' && (
                      <span className="text-xs text-gray-600">({talent.expectedSalary.currency})</span>
                    )}
                    {talent.expectedSalary.negotiable && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        협상가능
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recruitment Button */}
            <div className="shrink-0">
              <button
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
              >
                <Send className="w-5 h-5" />
                채용 신청하기
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Me */}
            {talent.aboutMe && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  자기소개
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {talent.aboutMe}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {talent.workExperience && talent.workExperience.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
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
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            재직중
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate} ~ {exp.current ? '현재' : exp.endDate}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {talent.education && talent.education.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                  학력
                </h2>
                <div className="space-y-4">
                  {talent.education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {edu.degree} · {edu.field}
                          </h3>
                          <p className="text-sm text-primary-600 font-medium mt-1">
                            {edu.institution}
                          </p>
                        </div>
                        {edu.current && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            재학중
                          </span>
                        )}
                      </div>
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

            {/* Resume Preview */}
            {talent.resumeFileUrl && (
              <div className="bg-white rounded-xl shadow-sm p-6">
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

                {/* PDF Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <iframe
                    src={`/api/preview/resume/${talent.id}`}
                    className="w-full h-[800px]"
                    title="이력서 미리보기"
                  />
                </div>

                {talent.resumeUploadedAt && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {new Date(talent.resumeUploadedAt).toLocaleDateString('ko-KR')} 업로드
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Skills & Preferences */}
          <div className="space-y-6">
            {/* Contact & Personal Info - 결제 완료 시 모든 정보 표시 */}
            {(talent.email || talent.phone || talent.birthYear || talent.gender) && (
              <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-primary-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary-600" />
                  연락처 및 개인정보
                </h2>

                <div className="space-y-3">
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
                  {(talent.birthYear || talent.gender) && (
                    <div className="pt-2 border-t border-gray-200 space-y-2 text-sm">
                      {talent.birthYear && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">나이</span>
                          <span className="font-medium text-gray-900">{calculateAge(talent.birthYear)}세</span>
                        </div>
                      )}
                      {talent.gender && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">성별</span>
                          <span className="font-medium text-gray-900">{talent.gender}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 비자 정보 + 선호 조건 통합 */}
            {(talent.koreanLevel || talent.visaSponsorship !== undefined || talent.desiredJobCategory || talent.workType) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
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
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        talent.visaSponsorship ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary-600" />
                  기술 스택
                </h2>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {talent.languages && talent.languages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary-600" />
                  언어 능력
                </h2>
                <div className="space-y-2">
                  {talent.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">{lang.language}</span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded ${getLanguageBadgeColor(lang.level)}`}>
                        {lang.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desired Positions */}
            {talent.desiredPositions && talent.desiredPositions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  희망 직무
                </h2>
                <div className="flex flex-wrap gap-2">
                  {talent.desiredPositions.map((pos, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Locations */}
            {talent.preferredLocations && talent.preferredLocations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  희망 근무지
                </h2>
                <div className="flex flex-wrap gap-2">
                  {talent.preferredLocations.map((loc, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
