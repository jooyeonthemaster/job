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
  Send
} from 'lucide-react';
import { getTalentById, type TalentProfile } from '@/lib/supabase/talent-service';

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (params?.id) {
        setLoading(true);

        try {
          const talentProfile = await getTalentById(params.id as string);
          if (talentProfile) {
            setTalent(talentProfile);
          } else {
            console.error('Profile not found');
            router.push('/talent');
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          router.push('/talent');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [params?.id, router]);

  if (loading || !talent) {
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
              </div>

              {/* Salary */}
              {talent.expectedSalary && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">희망 연봉:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatSalary(talent.expectedSalary.min, talent.expectedSalary.max)}
                  </span>
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
          </div>

          {/* Right Column - Skills & Preferences */}
          <div className="space-y-6">
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
