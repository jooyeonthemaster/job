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
  Star, 
  Clock,
  Download,
  Mail,
  Phone,
  Linkedin,
  Github,
  ExternalLink,
  Calendar,
  Award,
  BookOpen,
  Users,
  ChevronRight,
  Check,
  MessageCircle,
  Share2,
  Heart,
  Shield,
  TrendingUp,
  Code,
  Palette,
  Database,
  Server,
  Languages,
  DollarSign,
  FileText,
  Building,
  GraduationCap,
  Target
} from 'lucide-react';
import { getTalentById, getSimilarTalents, type TalentProfile } from '@/lib/talentData';
import { getJobseekerProfile, JobseekerProfile } from '@/lib/firebase/jobseeker-service';

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [similarTalents, setSimilarTalents] = useState<TalentProfile[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  // JobseekerProfile을 TalentProfile로 변환
  const convertJobseekerToTalent = (js: JobseekerProfile): TalentProfile => {
    return {
      id: js.uid,
      name: js.fullName || 'Unknown',
      title: js.headline || js.desiredPositions?.[0] || 'Job Seeker',
      nationality: 'Korea',
      location: js.preferredLocations?.[0] || 'Not specified',
      experience: js.experiences && js.experiences.length > 0
        ? Math.round(js.experiences.reduce((total, exp) => {
            const start = new Date(exp.startDate);
            const end = exp.current ? new Date() : new Date(exp.endDate);
            const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
            return total + years;
          }, 0))
        : 0,
      skills: js.skills || [],
      rating: undefined,
      availability: 'Available',
      expectedSalary: js.salaryRange ? {
        min: typeof js.salaryRange.min === 'string' ? parseInt(js.salaryRange.min) * 10000 : js.salaryRange.min,
        max: typeof js.salaryRange.max === 'string' ? parseInt(js.salaryRange.max) * 10000 : js.salaryRange.max
      } : { min: 0, max: 0 },
      languages: js.languages?.map(lang => ({
        language: lang,
        level: 'Fluent' as const
      })) || [],
      profileImage: js.profileImageUrl,
      aboutMe: js.introduction,
      workExperience: js.experiences?.map(exp => ({
        company: exp.company,
        position: exp.position,
        location: 'Korea',
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
        description: exp.description,
        achievements: [],
        technologies: []
      })),
      education: js.educations?.map(edu => ({
        institution: edu.school,
        degree: edu.degree,
        field: edu.field,
        location: 'Korea',
        startYear: parseInt(edu.startYear) || 0,
        endYear: edu.endYear ? parseInt(edu.endYear) : undefined,
        current: edu.current,
        gpa: undefined
      })),
      visaStatus: js.visaSponsorship ? '비자 후원 필요' : undefined,
      desiredPositions: js.desiredPositions,
      preferredLocations: js.preferredLocations,
      workType: js.workType,
      companySize: js.companySize,
      remoteWork: js.remoteWork,
      visaSponsorship: js.visaSponsorship
    };
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (params?.id) {
        setLoading(true);
        
        // 먼저 더미 데이터에서 찾기
        const dummyProfile = getTalentById(params.id as string);
        if (dummyProfile) {
          setTalent(dummyProfile);
          setSimilarTalents(getSimilarTalents(params.id as string));
          setIsRealData(false);
          setLoading(false);
          return;
        }
        
        // 더미 데이터에 없으면 Firebase에서 찾기
        try {
          const jobseekerProfile = await getJobseekerProfile(params.id as string);
          if (jobseekerProfile) {
            const convertedProfile = convertJobseekerToTalent(jobseekerProfile);
            setTalent(convertedProfile);
            setSimilarTalents([]);
            setIsRealData(true);
            console.log('✅ Loaded real jobseeker profile:', convertedProfile);
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

  const formatSalary = (min: number, max: number) => {
    const format = (num: number) => {
      if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
      if (num >= 10000000) return `${(num / 10000).toFixed(0)}만`;
      return num.toLocaleString();
    };
    return `₩${format(min)} - ${format(max)}`;
  };

  const getLanguageColor = (level: string) => {
    const colors: Record<string, string> = {
      'Native': 'bg-green-100 text-green-700 border-green-200',
      'Fluent': 'bg-blue-100 text-blue-700 border-blue-200',
      'Intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Basic': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const getSkillIcon = (skill: string) => {
    if (['React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java'].includes(skill)) return Code;
    if (['Figma', 'Sketch', 'Adobe XD', 'Photoshop'].includes(skill)) return Palette;
    if (['PostgreSQL', 'MongoDB', 'Redis', 'SQL'].includes(skill)) return Database;
    if (['AWS', 'Docker', 'Kubernetes', 'CI/CD'].includes(skill)) return Server;
    return Code;
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability.toLowerCase().includes('immediate')) return 'bg-green-100 text-green-700';
    if (availability.includes('week')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/talent"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>인재 목록으로 돌아가기</span>
            </Link>
            {isRealData && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <Database className="w-3 h-3" />
                실제 Firebase 데이터
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Gradient Banner - Separate from content */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-24 rounded-t-2xl"></div>
          
          {/* White Content Area - Completely below gradient */}
          <div className="bg-white rounded-b-2xl shadow-lg px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Image */}
              <div className="shrink-0">
                {talent.profileImage ? (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={talent.profileImage} 
                      alt={talent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 shadow-lg flex items-center justify-center text-3xl font-bold text-primary-700">
                    {talent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{talent.name}</h1>
                      <p className="text-xl text-gray-600 mb-3">{talent.title}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {talent.nationality}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {talent.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {talent.experience}년 경력
                        </span>
                        {talent.currentEmployment && (
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {talent.currentEmployment}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {talent.rating && (
                          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{talent.rating}</span>
                            <span className="text-sm text-gray-600">/ 5.0</span>
                          </div>
                        )}
                        {talent.completedProjects && (
                          <div className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                            프로젝트 {talent.completedProjects}건 완료
                          </div>
                        )}
                        {talent.visaStatus && (
                          <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                            {talent.visaStatus}
                          </div>
                        )}
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getAvailabilityColor(talent.availability)}`}>
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          {talent.availability}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setShowContactModal(true)}
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        채용 신청하기
                      </button>
                      <button 
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`px-6 py-2.5 border rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          isBookmarked 
                            ? 'bg-red-50 border-red-200 text-red-600' 
                            : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        {isBookmarked ? '관심 인재' : '관심 추가'}
                      </button>
                    </div>
                  </div>

                  {/* Salary Expectation */}
                  {talent.expectedSalary && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">희망 연봉</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatSalary(talent.expectedSalary.min, talent.expectedSalary.max)}
                          </p>
                        </div>
                      {talent.preferredWorkStyle && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">선호 근무 형태</p>
                          <div className="flex gap-2">
                            {talent.preferredWorkStyle.map((style, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: '개요', icon: FileText },
              { id: 'experience', label: '경력사항', icon: Briefcase },
              { id: 'education', label: '학력', icon: GraduationCap },
              { id: 'skills', label: '기술스택', icon: Code }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Section */}
              {activeTab === 'overview' && (
                <>
                  {/* About Me */}
                  {talent.aboutMe && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-600" />
                        자기소개
                      </h2>
                      <div className="prose prose-gray max-w-none">
                        {talent.aboutMe.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="text-gray-600 mb-3 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Overview */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 요약</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Languages className="w-5 h-5 text-primary-600 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">언어 능력</p>
                        <div className="space-y-2">
                          {talent.languages.map((lang, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getLanguageColor(lang.level)}`}>
                                {lang.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary-600 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">주요 성과</p>
                        {talent.achievements && (
                          <ul className="space-y-1">
                            {talent.achievements.slice(0, 3).map((achievement, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">주요 기술</h2>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.slice(0, 8).map((skill) => {
                        const Icon = getSkillIcon(skill);
                        return (
                          <div key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {skill}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 선호 조건 */}
                  {(talent.desiredPositions || talent.workType || talent.companySize || talent.remoteWork || talent.preferredLocations) && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">선호 조건</h2>
                      <div className="space-y-4">
                        {/* 희망 직무 */}
                        {talent.desiredPositions && talent.desiredPositions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              희망 직무
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {talent.desiredPositions.map((pos: string) => (
                                <span key={pos} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                  {pos}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 희망 근무지 (전체) */}
                        {talent.preferredLocations && talent.preferredLocations.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              희망 근무지
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {talent.preferredLocations.map((loc: string) => (
                                <span key={loc} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                  {loc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* 고용 형태 */}
                          {talent.workType && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                고용 형태
                              </p>
                              <p className="text-sm text-gray-600">{talent.workType}</p>
                            </div>
                          )}

                          {/* 회사 규모 */}
                          {talent.companySize && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                선호 회사 규모
                              </p>
                              <p className="text-sm text-gray-600">{talent.companySize}</p>
                            </div>
                          )}

                          {/* 재택근무 */}
                          {talent.remoteWork && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">재택근무</p>
                              <p className="text-sm text-gray-600">
                                {talent.remoteWork === '완전' ? '완전 재택근무' :
                                 talent.remoteWork === '부분' ? '부분 재택근무' : '재택근무 불가'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Experience Section */}
              {activeTab === 'experience' && talent.workExperience && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">경력 사항</h2>
                  {talent.workExperience.map((exp, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-primary-600 font-medium">{exp.company}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {exp.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {exp.startDate} - {exp.current ? '현재' : exp.endDate}
                            </span>
                          </div>
                        </div>
                        {exp.current && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            현재 근무중
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{exp.description}</p>
                      {exp.achievements && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">주요 성과</p>
                          <ul className="space-y-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {exp.technologies && (
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech) => (
                            <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education Section */}
              {activeTab === 'education' && talent.education && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">학력</h2>
                  {talent.education.map((edu, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{edu.degree} - {edu.field}</h3>
                          <p className="text-primary-600 font-medium">{edu.institution}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {edu.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {edu.startYear} - {edu.current ? '재학중' : edu.endYear}
                            </span>
                            {edu.gpa && (
                              <span className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                GPA: {edu.gpa}
                              </span>
                            )}
                          </div>
                        </div>
                        {edu.current && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            재학중
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Section */}
              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">기술 스택</h2>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Group skills by category */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">주요 기술</h3>
                        <div className="flex flex-wrap gap-2">
                          {talent.skills.slice(0, Math.ceil(talent.skills.length / 2)).map((skill) => {
                            const Icon = getSkillIcon(skill);
                            return (
                              <div key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {skill}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">보조 기술</h3>
                        <div className="flex flex-wrap gap-2">
                          {talent.skills.slice(Math.ceil(talent.skills.length / 2)).map((skill) => (
                            <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">


              {/* Similar Talents */}
              {similarTalents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">유사한 인재</h3>
                  <div className="space-y-4">
                    {similarTalents.map((similarTalent) => (
                      <Link 
                        key={similarTalent.id}
                        href={`/talent/${similarTalent.id}`}
                        className="block hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                            {similarTalent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{similarTalent.name}</p>
                            <p className="text-xs text-gray-600">{similarTalent.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600 ml-1">{similarTalent.rating}</span>
                              </div>
                              <span className="text-xs text-gray-600">{similarTalent.experience}년</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 채용 신청 Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">채용 신청하기</h3>
            <p className="text-sm text-gray-600 mb-4">
              {talent.name}님에게 채용 제안을 보냅니다. 관리자가 검토 후 연결해드립니다.
            </p>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const applicationData = {
                talentId: talent.id,
                talentName: talent.name,
                position: formData.get('position') as string,
                message: formData.get('message') as string,
                companyName: formData.get('companyName') as string,
                contactEmail: formData.get('contactEmail') as string,
                status: 'pending' as const,
                createdAt: new Date().toISOString()
              };
              
              try {
                // Firebase에 저장하는 로직 (아래에서 구현)
                const { submitTalentApplication } = await import('@/lib/firebase/application-service');
                await submitTalentApplication(applicationData);
                alert('채용 신청이 완료되었습니다. 관리자가 검토 후 연락드리겠습니다.');
                setShowContactModal(false);
              } catch (error) {
                console.error('Application submission error:', error);
                alert('채용 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                <input 
                  type="text"
                  name="companyName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="삼성전자"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제안 직무</label>
                <input 
                  type="text"
                  name="position"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="프론트엔드 개발자"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자 이메일</label>
                <input 
                  type="email"
                  name="contactEmail"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="hr@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메시지</label>
                <textarea 
                  name="message"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="채용 제안 내용을 입력하세요..."
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  신청하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}