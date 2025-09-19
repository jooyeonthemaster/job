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
  GraduationCap
} from 'lucide-react';
import { getTalentById, getSimilarTalents, type TalentProfile } from '@/lib/talentData';

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [similarTalents, setSimilarTalents] = useState<TalentProfile[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const profileData = getTalentById(params.id as string);
      if (profileData) {
        setTalent(profileData);
        setSimilarTalents(getSimilarTalents(params.id as string));
      } else {
        router.push('/talent');
      }
    }
  }, [params?.id, router]);

  if (!talent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <Link 
            href="/talent"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>인재 목록으로 돌아가기</span>
          </Link>
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
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 shadow-lg flex items-center justify-center text-3xl font-bold text-primary-700">
                  {talent.name.split(' ').map(n => n[0]).join('')}
                </div>
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
                        연락하기
                      </button>
                      <button className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        이력서 다운로드
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className={`px-3 py-2 border rounded-lg transition-colors flex items-center justify-center ${
                            isBookmarked 
                              ? 'bg-red-50 border-red-200 text-red-600' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Salary Expectation */}
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
              { id: 'skills', label: '기술스택', icon: Code },
              { id: 'projects', label: '프로젝트', icon: BookOpen },
              { id: 'reviews', label: '평가', icon: Star },
              { id: 'certifications', label: '자격증', icon: Award }
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

              {/* Projects Section */}
              {activeTab === 'projects' && talent.projects && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">프로젝트 포트폴리오</h2>
                  {talent.projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium text-primary-600">{project.role}</span>
                          <span>{project.duration}</span>
                          {project.teamSize && <span>팀 규모: {project.teamSize}명</span>}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      {project.client && (
                        <p className="text-sm text-gray-600 mb-4">
                          <span className="font-medium">클라이언트:</span> {project.client}
                        </p>
                      )}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">주요 성과</p>
                        <ul className="space-y-1">
                          {project.outcomes.map((outcome, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews Section */}
              {activeTab === 'reviews' && talent.reviews && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">고객 평가</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-5 h-5 ${
                              star <= Math.floor(talent.rating || 0) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{talent.rating}</span>
                      <span className="text-gray-600">({talent.reviews.length}개 리뷰)</span>
                    </div>
                  </div>
                  
                  {talent.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                              {review.clientName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{review.clientName}</p>
                              <p className="text-sm text-gray-600">{review.clientTitle} at {review.clientCompany}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {review.verified && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <Shield className="w-3 h-3" />
                              인증됨
                            </span>
                          )}
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${
                                  star <= review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>프로젝트: {review.projectTitle}</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications Section */}
              {activeTab === 'certifications' && talent.certifications && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">자격증 및 인증</h2>
                  {talent.certifications.map((cert, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{cert.name}</h3>
                          <p className="text-gray-600 mb-2">{cert.issuer}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              발급일: {cert.date}
                            </span>
                            {cert.expiryDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                만료일: {cert.expiryDate}
                              </span>
                            )}
                          </div>
                          {cert.credentialId && (
                            <p className="text-sm text-gray-600 mt-1">
                              자격증 번호: {cert.credentialId}
                            </p>
                          )}
                        </div>
                        {cert.url && (
                          <a 
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            확인하기
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h3>
                <div className="space-y-3">
                  {talent.email && (
                    <a href={`mailto:${talent.email}`} className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{talent.email}</span>
                    </a>
                  )}
                  {talent.phone && (
                    <a href={`tel:${talent.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{talent.phone}</span>
                    </a>
                  )}
                  {talent.linkedin && (
                    <a href={`https://${talent.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                      <Linkedin className="w-4 h-4" />
                      <span className="text-sm">{talent.linkedin}</span>
                    </a>
                  )}
                  {talent.github && (
                    <a href={`https://${talent.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                      <Github className="w-4 h-4" />
                      <span className="text-sm">{talent.github}</span>
                    </a>
                  )}
                  {talent.portfolio && (
                    <a href={`https://${talent.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{talent.portfolio}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    이력서 PDF 다운로드
                  </button>
                  <button className="w-full px-4 py-2 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    면접 일정 잡기
                  </button>
                  <button className="w-full px-4 py-2 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    계약서 전송
                  </button>
                </div>
              </div>

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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">메시지 보내기</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="프로젝트 제안"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메시지</label>
                <textarea 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="메시지를 입력하세요..."
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
                  전송
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}