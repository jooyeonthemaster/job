'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Globe, 
  Star, 
  Clock, 
  Filter, 
  ChevronRight,
  Users,
  Award,
  Languages,
  DollarSign,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { talentProfiles, type TalentProfile } from '@/lib/talentData';

export default function TalentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedNationality, setSelectedNationality] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  const allSkills = Array.from(new Set(talentProfiles.flatMap(p => p.skills))).slice(0, 12);
  const nationalities = Array.from(new Set(talentProfiles.map(p => p.nationality)));

  const filteredProfiles = talentProfiles.filter(profile => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkills = 
      selectedSkills.length === 0 ||
      selectedSkills.some(skill => profile.skills.includes(skill));

    const matchesNationality = 
      selectedNationality === 'all' ||
      profile.nationality === selectedNationality;

    const matchesExperience = 
      selectedExperience === 'all' ||
      (selectedExperience === '0-2' && profile.experience <= 2) ||
      (selectedExperience === '3-5' && profile.experience >= 3 && profile.experience <= 5) ||
      (selectedExperience === '6+' && profile.experience >= 6);

    return matchesSearch && matchesSkills && matchesNationality && matchesExperience;
  });

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
      'Native': 'bg-green-100 text-green-700',
      'Fluent': 'bg-blue-100 text-blue-700',
      'Intermediate': 'bg-yellow-100 text-yellow-700',
      'Basic': 'bg-gray-100 text-gray-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 border-b">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            글로벌 인재 풀
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            전 세계의 검증된 전문가들과 함께하세요
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-2 flex items-center max-w-3xl">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="이름, 직무, 기술로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 py-3"
              />
            </div>
            <button className="btn-primary">
              검색하기
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { icon: Users, label: '등록 인재', value: '15,000+' },
              { icon: Globe, label: '국가', value: '45+' },
              { icon: Award, label: '평균 평점', value: '4.7' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">
                  <span className="font-bold">{stat.value}</span> {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">국적</span>
              <select
                value={selectedNationality}
                onChange={(e) => setSelectedNationality(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">모든 국적</option>
                {nationalities.map(nat => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">경력</span>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">모든 경력</option>
                <option value="0-2">0-2년</option>
                <option value="3-5">3-5년</option>
                <option value="6+">6년 이상</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">가용성</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="all">모두</option>
                <option value="immediate">즉시 가능</option>
                <option value="2weeks">2주 이내</option>
                <option value="1month">1개월 이내</option>
              </select>
            </div>

            <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              <Filter className="w-4 h-4" />
              상세조건
            </button>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-28">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">상세 필터</h3>
                </div>

                {/* Skills Filter */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기술 스택
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {allSkills.map(skill => (
                        <label key={skill} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSkills([...selectedSkills, skill]);
                              } else {
                                setSelectedSkills(selectedSkills.filter(s => s !== skill));
                              }
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-600">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedSkills.length > 0 && (
                    <button
                      onClick={() => setSelectedSkills([])}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>

                {/* Results Count */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredProfiles.length}</span>명의 인재가 검색되었습니다
                  </p>
                </div>
              </div>
            </div>

            {/* Talent Cards */}
            <div className="lg:col-span-3 space-y-6">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map(profile => (
                  <div key={profile.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Profile Avatar */}
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-700 shrink-0">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {profile.name}
                              </h3>
                              <p className="text-gray-600">{profile.title}</p>
                            </div>
                            {profile.rating && (
                              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {profile.rating}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Meta Information */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4 text-gray-400" />
                              {profile.nationality}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {profile.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              {profile.experience}년 경력
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {profile.availability}
                            </span>
                          </div>

                          {/* Bio */}
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {profile.bio}
                          </p>

                          {/* Languages */}
                          <div className="flex items-center gap-2 mb-4">
                            <Languages className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-wrap gap-2">
                              {profile.languages.map((lang, idx) => (
                                <span 
                                  key={idx} 
                                  className={`px-2 py-0.5 text-xs font-medium rounded ${getLanguageColor(lang.level)}`}
                                >
                                  {lang.language}: {lang.level}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {profile.skills.slice(0, 5).map(skill => (
                              <span 
                                key={skill} 
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                              >
                                {skill}
                              </span>
                            ))}
                            {profile.skills.length > 5 && (
                              <span className="px-3 py-1 bg-gray-50 text-gray-500 text-sm rounded-lg">
                                +{profile.skills.length - 5}
                              </span>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                희망연봉: <span className="font-medium text-gray-900">
                                  {formatSalary(profile.expectedSalary.min, profile.expectedSalary.max)}
                                </span>
                              </span>
                              {profile.completedProjects && (
                                <span className="text-sm text-gray-600">
                                  프로젝트 {profile.completedProjects}건 완료
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors">
                                메시지 보내기
                              </button>
                              <Link 
                                href={`/talent/${profile.id}`}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                프로필 보기
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-600">
                    다른 검색어나 필터를 사용해보세요
                  </p>
                </div>
              )}

              {/* Pagination (placeholder) */}
              {filteredProfiles.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    이전
                  </button>
                  {[1, 2, 3, '...', 10].map((page, idx) => (
                    <button
                      key={idx}
                      className={`px-4 py-2 rounded-lg ${
                        page === 1 
                          ? 'bg-primary-600 text-white' 
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    다음
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}