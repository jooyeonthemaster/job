'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext_Supabase';
import { getUserProfileWithCompletion } from '@/lib/supabase/jobseeker-service';
import Header from '@/components/Header';
import OptimizedImage from '@/components/OptimizedImage';
import {
  User,
  Briefcase,
  FileText,
  Eye,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Building,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Edit3,
  Heart,
  MessageCircle,
  Target,
  Users,
  BookOpen,
  Search,
  GraduationCap,
  Home,
  Globe2,
  Shield,
  Code,
  Languages,
  Upload,
  XCircle,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { jobs } from '@/lib/data';
import { getRecommendedJobs } from '@/lib/utils';
import PDFImageViewer from '@/components/PDFImageViewer';

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<typeof jobs>([]);
  const [showResumePreview, setShowResumePreview] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Supabase에서 프로필 완성도와 함께 프로필 조회
        const profileWithCompletion = await getUserProfileWithCompletion(user.id);
        console.log('📊 Loaded Profile Data:', profileWithCompletion);

        if (!profileWithCompletion) {
          // 프로필이 없으면 온보딩으로 리다이렉트
          router.push('/onboarding/job-seeker/quick');
          return;
        }

        // Supabase 데이터를 기존 형식으로 변환
        const transformedProfile = {
          fullName: profileWithCompletion.full_name,
          email: profileWithCompletion.email,
          phone: profileWithCompletion.phone,
          headline: profileWithCompletion.headline,
          profileImageUrl: profileWithCompletion.profile_image_url,
          resumeFileUrl: profileWithCompletion.resume_file_url,
          resumeFileName: profileWithCompletion.resume_file_name,
          resumeUploadedAt: profileWithCompletion.resume_uploaded_at,
          introduction: profileWithCompletion.introduction,
          workType: profileWithCompletion.work_type,
          companySize: profileWithCompletion.company_size,
          visaSponsorship: profileWithCompletion.visa_sponsorship,
          remoteWork: profileWithCompletion.remote_work,
          skills: profileWithCompletion.skills?.map((s: any) => s.skill_name) || [],
          languages: profileWithCompletion.languages?.map((l: any) => l.language_name) || [],
          experiences: profileWithCompletion.experiences?.map((exp: any) => ({
            id: exp.id,
            company: exp.company,
            position: exp.position,
            startDate: exp.start_date,
            endDate: exp.end_date,
            current: exp.is_current,
            description: exp.description
          })) || [],
          educations: profileWithCompletion.educations?.map((edu: any) => ({
            id: edu.id,
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            startYear: edu.start_year,
            endYear: edu.end_year,
            current: edu.is_current
          })) || [],
          desiredPositions: profileWithCompletion.desired_positions?.map((p: any) => p.position_name) || [],
          preferredLocations: profileWithCompletion.preferred_locations?.map((l: any) => l.location_name) || [],
          salaryRange: profileWithCompletion.salary_range ? {
            min: profileWithCompletion.salary_range.min_salary,
            max: profileWithCompletion.salary_range.max_salary,
            currency: profileWithCompletion.salary_range.currency,
            negotiable: profileWithCompletion.salary_range.negotiable
          } : null,
          profileCompletion: profileWithCompletion.profileCompletion
        };

        console.log('📍 Preferred Locations:', transformedProfile.preferredLocations);
        console.log('💰 Salary Range:', transformedProfile.salaryRange);
        console.log('🎯 Desired Positions:', transformedProfile.desiredPositions);
        console.log('💻 Skills:', transformedProfile.skills);

        setProfileData(transformedProfile);

        // 프로필 기반 추천 채용공고 계산
        const recommended = getRecommendedJobs(transformedProfile, jobs, 3);
        console.log('✨ Recommended Jobs:', recommended.map(j => ({
          title: j.title,
          company: j.company.name,
          tags: j.tags,
          location: j.location
        })));
        setRecommendedJobs(recommended);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // 프로필 완성도는 이미 profileData에 포함되어 있음
  const profileCompletion = profileData?.profileCompletion || 0;

  // 프로필 완성도 체크리스트 계산
  const getProfileChecklist = () => {
    return [
      {
        id: 'resume',
        title: '이력서',
        description: '이력서 파일 업로드',
        icon: Upload,
        completed: !!(profileData?.resumeFileUrl),
        link: '/profile/edit/resume'
      },
      {
        id: 'experience',
        title: '경력 사항',
        description: '최소 1개 이상의 경력',
        icon: Briefcase,
        completed: !!(profileData?.experiences && profileData.experiences.length > 0),
        link: '/profile/edit/experience'
      },
      {
        id: 'education',
        title: '학력 사항',
        description: '최소 1개 이상의 학력',
        icon: GraduationCap,
        completed: !!(profileData?.educations && profileData.educations.length > 0),
        link: '/profile/edit/experience'
      },
      {
        id: 'skills',
        title: '보유 기술',
        description: '보유한 기술과 역량',
        icon: Code,
        completed: !!(profileData?.skills && profileData.skills.length > 0),
        link: '/profile/edit/skills'
      },
      {
        id: 'languages',
        title: '언어 능력',
        description: '구사 가능한 언어',
        icon: Languages,
        completed: !!(profileData?.languages && profileData.languages.length > 0),
        link: '/profile/edit/skills'
      },
      {
        id: 'preferences',
        title: '선호 조건',
        description: '희망 직무 및 근무 조건',
        icon: Target,
        completed: !!(
          profileData?.desiredPositions &&
          profileData.desiredPositions.length > 0 &&
          profileData?.preferredLocations &&
          profileData.preferredLocations.length > 0 &&
          profileData?.salaryRange?.min
        ),
        link: '/profile/edit/preferences'
      },
      {
        id: 'introduction',
        title: '자기소개',
        description: '간단한 자기소개',
        icon: User,
        completed: !!(profileData?.introduction && profileData.introduction.trim().length > 0),
        link: '/profile/edit/introduction'
      }
    ];
  };

  const checklist = getProfileChecklist();
  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const checklistPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 border-b">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profileData?.profileImageUrl ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden">
                  <OptimizedImage
                    src={profileData.profileImageUrl}
                    alt={profileData.fullName}
                    width={80}
                    height={80}
                    type="profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-700">
                  {profileData?.fullName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  환영합니다, {profileData?.fullName}님!
                </h1>
                <p className="text-gray-600">{profileData?.headline || '프로필을 완성해주세요'}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData?.preferredLocations && profileData.preferredLocations.length > 0
                      ? profileData.preferredLocations.join(', ')
                      : '희망 근무지 미설정'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {profileData?.salaryRange?.min && profileData?.salaryRange?.max
                      ? `${profileData.salaryRange.min}~${profileData.salaryRange.max}만원`
                      : '희망 연봉 미설정'}
                  </span>
                  {profileData?.visaSponsorship && (
                    <span className="text-sm font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      비자 후원 필요
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" />
                프로필 편집
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion */}
      {profileCompletion < 100 && (
        <section className="bg-yellow-50 border-b border-yellow-100">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    프로필 완성도: {profileCompletion}%
                  </p>
                  <p className="text-xs text-yellow-700">
                    프로필을 완성하면 기업의 관심을 더 많이 받을 수 있어요
                  </p>
                </div>
              </div>
              <Link
                href="/profile/edit"
                className="text-sm font-medium text-yellow-900 hover:text-yellow-800"
              >
                프로필 완성하기 →
              </Link>
            </div>
            <div className="mt-2 h-2 bg-yellow-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Dashboard */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Completion Checklist */}
              {checklistPercentage < 100 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        프로필 완성하기
                      </h2>
                      <p className="text-sm text-gray-600">
                        {completedItems} / {totalItems} 항목 완료 ({checklistPercentage}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full">
                      <TrendingUp className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-600">
                        {100 - checklistPercentage}% 남음
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${checklistPercentage}%` }}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {checklist.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          href={item.link}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            item.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              item.completed
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                item.completed ? 'text-green-900' : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                          {!item.completed && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>💡 프로필 완성 혜택:</strong> 프로필이 완성되면 기업의 스카우트 제안을 받을 확률이 높아지고, AI 매칭 정확도도 향상됩니다.
                    </p>
                    <Link
                      href="/profile/edit"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      지금 프로필 완성하기
                    </Link>
                  </div>
                </div>
              )}

              {/* 프로필 완성 축하 메시지 (100% 달성 시) */}
              {checklistPercentage === 100 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 mb-2">
                        🎉 프로필이 완성되었습니다!
                      </h3>
                      <p className="text-sm text-green-700 mb-4">
                        모든 프로필 항목을 작성하셨습니다. 이제 기업들이 당신의 프로필을 보고 스카우트 제안을 보낼 수 있어요.
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href="/jobs"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Search className="w-4 h-4" />
                          채용공고 둘러보기
                        </Link>
                        <Link
                          href="/profile/edit"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                        >
                          <Edit3 className="w-4 h-4" />
                          프로필 수정하기
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Application Status */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                    지원 현황
                  </h2>
                  <Link href="/applications" className="text-sm text-primary-600 hover:text-primary-700">
                    모두 보기 →
                  </Link>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">테크노바 코리아</p>
                        <p className="text-xs text-gray-600">프론트엔드 개발자 • 서류 검토 중</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">2일 전</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">글로벌테크</p>
                        <p className="text-xs text-green-600 font-medium">1차 면접 예정 • 12월 5일 14:00</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* 경력 사항 */}
              {profileData?.experiences && profileData.experiences.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                    경력 사항
                  </h3>
                  <div className="space-y-4">
                    {profileData.experiences.map((exp: any) => (
                      <div key={exp.id} className="border-l-4 border-primary-500 pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{exp.position}</p>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exp.startDate} ~ {exp.current ? '현재' : exp.endDate}
                            </p>
                          </div>
                          {exp.current && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              재직 중
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 학력 사항 */}
              {profileData?.educations && profileData.educations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-secondary-600" />
                    학력 사항
                  </h3>
                  <div className="space-y-4">
                    {profileData.educations.map((edu: any) => (
                      <div key={edu.id} className="border-l-4 border-secondary-500 pl-4 py-2">
                        <p className="font-semibold text-gray-900">{edu.school}</p>
                        <p className="text-sm text-gray-600">{edu.degree} • {edu.field}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {edu.startYear} ~ {edu.current ? '재학 중' : edu.endYear}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Jobs */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-600" />
                    추천 채용공고
                    {recommendedJobs.length > 0 && (
                      <span className="text-xs font-normal text-gray-500">
                        (프로필 기반 매칭)
                      </span>
                    )}
                  </h2>
                  <Link href="/jobs" className="text-sm text-primary-600 hover:text-primary-700">
                    더 보기 →
                  </Link>
                </div>
                
                {recommendedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50/50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <Building className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company.name}</p>
                          </div>
                        </div>
                        <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {Math.floor(job.salary.min / 10000)}~{Math.floor(job.salary.max / 10000)}만원
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.employmentType === 'FULL_TIME' ? '정규직' : 
                           job.employmentType === 'CONTRACT' ? '계약직' : 
                           job.employmentType === 'PART_TIME' ? '파트타임' : '인턴'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {job.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          지원하기 →
                        </Link>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      프로필에 맞는 추천 공고가 없습니다
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      프로필을 더 자세히 작성하면 맞춤 공고를 추천받을 수 있어요
                    </p>
                    <Link
                      href="/profile/edit"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      프로필 완성하기
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
                <div className="space-y-2">
                  <Link
                    href="/jobs"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">채용공고 검색</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Edit3 className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">프로필 편집</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Skills & Languages */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">보유 기술</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileData?.skills?.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  )) || <p className="text-sm text-gray-500">기술을 추가해주세요</p>}
                </div>
                
                <h4 className="text-sm font-semibold text-gray-900 mb-2 mt-6">언어 능력</h4>
                <div className="space-y-2">
                  {profileData?.languages?.map((lang: string) => (
                    <div key={lang} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{lang}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        유창함
                      </span>
                    </div>
                  )) || <p className="text-sm text-gray-500">언어를 추가해주세요</p>}
                </div>
              </div>

              {/* 선호 조건 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">선호 조건</h3>
                <div className="space-y-4">
                  {/* 희망 직무 */}
                  {profileData?.desiredPositions && profileData.desiredPositions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        희망 직무
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.desiredPositions.map((pos: string) => (
                          <span key={pos} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 고용 형태 */}
                  {profileData?.workType && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        고용 형태
                      </p>
                      <p className="text-sm text-gray-600">{profileData.workType}</p>
                    </div>
                  )}

                  {/* 회사 규모 */}
                  {profileData?.companySize && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        선호 회사 규모
                      </p>
                      <p className="text-sm text-gray-600">{profileData.companySize}</p>
                    </div>
                  )}

                  {/* 재택근무 */}
                  {profileData?.remoteWork && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        재택근무
                      </p>
                      <p className="text-sm text-gray-600">
                        {profileData.remoteWork === '완전' ? '완전 재택근무' :
                         profileData.remoteWork === '부분' ? '부분 재택근무' : '재택근무 불가'}
                      </p>
                    </div>
                  )}

                  {/* 프로필 미완성 안내 */}
                  {!profileData?.desiredPositions && !profileData?.workType && !profileData?.companySize && !profileData?.remoteWork && (
                    <p className="text-sm text-gray-500">프로필에서 선호 조건을 추가해주세요</p>
                  )}
                </div>
              </div>

              {/* 이력서 */}
              {profileData?.resumeFileUrl && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      이력서
                    </h3>
                    <div className="flex items-center gap-2">
                      {profileData.resumeFileUrl.endsWith('.pdf') && (
                        <button
                          onClick={() => setShowResumePreview(true)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          미리보기
                        </button>
                      )}
                      <a
                        href={profileData.resumeFileUrl}
                        download={profileData.resumeFileName || 'Resume'}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </a>
                      <Link
                        href="/profile/edit/resume"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        <Edit3 className="w-4 h-4" />
                        수정
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {profileData.resumeFileName || 'Resume.pdf'}
                      </p>
                      <p className="text-sm text-gray-500">
                        업로드: {profileData.resumeUploadedAt ? new Date(profileData.resumeUploadedAt).toLocaleDateString('ko-KR') : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 자기소개 */}
              {profileData?.introduction && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    자기소개
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {profileData.introduction}
                  </p>
                </div>
              )}

              {/* Career Tips */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">오늘의 커리어 팁</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  프로필에 구체적인 프로젝트 경험과 성과를 추가하면 기업의 관심을 더 받을 수 있어요.
                </p>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  더 많은 팁 보기 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF 미리보기 모달 */}
      {showResumePreview && profileData?.resumeFileUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowResumePreview(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">이력서 미리보기</h3>
              <button
                onClick={() => setShowResumePreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              <PDFImageViewer
                pdfUrl={profileData.resumeFileUrl}
                fileName={profileData.resumeFileName || 'Resume'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}