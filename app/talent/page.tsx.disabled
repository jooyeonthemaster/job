'use client';

import { useState, useEffect } from 'react';
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
  Mail,
  ChevronDown,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { talentProfiles, type TalentProfile } from '@/lib/talentData';
import { getAllJobseekers, JobseekerProfile } from '@/lib/firebase/jobseeker-service';

export default function TalentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedNationality, setSelectedNationality] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
  const [showRealDataOnly, setShowRealDataOnly] = useState(false);
  const [realProfiles, setRealProfiles] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Firebase 데이터를 로드
  useEffect(() => {
    const loadRealData = async () => {
      if (showRealDataOnly) {
        setLoading(true);
        try {
          const jobseekers = await getAllJobseekers();
          // JobseekerProfile을 TalentProfile 형태로 변환
          const converted: TalentProfile[] = jobseekers.map((js, index) => ({
            id: js.uid,
            name: js.fullName || 'Unknown',
            title: js.headline || js.desiredPositions?.[0] || 'Job Seeker',
            nationality: 'Korea', // TODO: 온보딩에 국적 추가 필요
            location: js.preferredLocations?.[0] || 'Not specified',
            experience: js.experiences?.length || 0,
            skills: js.skills || [],
            rating: undefined,
            availability: 'Available', // TODO: 온보딩에 가용성 추가 필요
            expectedSalary: js.salaryRange ? {
              min: typeof js.salaryRange.min === 'string' ? parseInt(js.salaryRange.min) * 10000 : js.salaryRange.min,
              max: typeof js.salaryRange.max === 'string' ? parseInt(js.salaryRange.max) * 10000 : js.salaryRange.max
            } : undefined,
            languages: js.languages?.map(lang => ({
              language: lang,
              level: 'Fluent' as const
            })) || [],
            profileImage: js.profileImageUrl
          }));
          setRealProfiles(converted);
          console.log(`✅ Converted ${converted.length} jobseekers to talent profiles`);
        } catch (error) {
          console.error('Failed to load real data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadRealData();
  }, [showRealDataOnly]);

  // 표시할 프로필 선택 (실제 데이터 또는 더미 데이터)
  const displayProfiles = showRealDataOnly ? realProfiles : talentProfiles;

  const allSkills = Array.from(new Set(displayProfiles.flatMap(p => p.skills))).slice(0, 12);
  const nationalities = Array.from(new Set(displayProfiles.map(p => p.nationality)));

  const filteredProfiles = displayProfiles.filter(profile => {
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

  const formatSalary = (min?: number, max?: number) => {
    const format = (num?: number) => {
      if (!num || num === undefined || num === null) return '협의';
      if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
      if (num >= 10000000) return `${(num / 10000).toFixed(0)}만`;
      return num.toLocaleString();
    };
    
    if (!min && !max) return '연봉 협의';
    if (!min) return `~₩${format(max)}`;
    if (!max) return `₩${format(min)}~`;
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

  const categories = [
    { 
      name: '개발/프로그래밍',
      subcategories: [
        {
          name: '프론트엔드',
          skills: ['React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Redux', 'GraphQL', 'Webpack', 'Sass']
        },
        {
          name: '백엔드',
          skills: ['Node.js', 'Python', 'Java', 'Spring', 'Django', 'FastAPI', 'Express.js', '.NET', 'Ruby on Rails', 'Go', 'PHP', 'Laravel']
        },
        {
          name: '모바일',
          skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Xamarin', 'Ionic']
        },
        {
          name: '데이터베이스',
          skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra', 'Elasticsearch']
        },
        {
          name: '데브옵스/인프라',
          skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform', 'Ansible', 'Linux', 'Nginx']
        },
        {
          name: 'AI/머신러닝',
          skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'OpenCV', 'NLP', 'Computer Vision', 'Deep Learning']
        }
      ]
    },
    {
      name: '디자인/크리에이티브',
      subcategories: [
        {
          name: 'UI/UX 디자인',
          skills: ['Figma', 'Sketch', 'Adobe XD', 'Framer', 'Principle', 'Zeplin', 'InVision', 'Maze', 'Hotjar', 'User Research', 'Wireframing', 'Prototyping']
        },
        {
          name: '그래픽 디자인',
          skills: ['Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Premiere Pro', 'CorelDRAW', 'Canva', 'Procreate']
        },
        {
          name: '3D/모션',
          skills: ['Blender', '3ds Max', 'Maya', 'Cinema 4D', 'ZBrush', 'Substance Painter', 'Unity', 'Unreal Engine']
        },
        {
          name: '산업 디자인',
          skills: ['Rhino', 'SolidWorks', 'AutoCAD', 'Fusion 360', 'KeyShot', 'CATIA', 'Alias']
        }
      ]
    },
    {
      name: '마케팅/광고',
      subcategories: [
        {
          name: '디지털 마케팅',
          skills: ['Google Analytics', 'Google Ads', 'Facebook Ads', 'SEO', 'SEM', 'Google Tag Manager', 'Amplitude', 'Mixpanel', 'HubSpot', 'Mailchimp']
        },
        {
          name: '콘텐츠 마케팅',
          skills: ['WordPress', 'Medium', 'Notion', 'Copywriting', 'SEO Writing', 'Storytelling', 'Video Editing', 'Podcast Production']
        },
        {
          name: '브랜드 마케팅',
          skills: ['Brand Strategy', 'Visual Identity', 'Brand Guidelines', 'Market Research', 'Competitor Analysis', 'Positioning']
        },
        {
          name: '소셜미디어',
          skills: ['Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'YouTube', 'Community Management', 'Influencer Marketing', 'Content Calendar']
        }
      ]
    },
    {
      name: '영업/비즈니스',
      subcategories: [
        {
          name: 'B2B 영업',
          skills: ['Salesforce', 'HubSpot CRM', 'LinkedIn Sales Navigator', 'Cold Calling', 'Pipeline Management', 'Lead Generation', 'Contract Negotiation']
        },
        {
          name: '비즈니스 개발',
          skills: ['Market Analysis', 'Partnership Management', 'Strategic Planning', 'Revenue Modeling', 'Pitch Deck', 'Stakeholder Management']
        },
        {
          name: '고객 성공',
          skills: ['Customer Success', 'Onboarding', 'Zendesk', 'Intercom', 'Freshdesk', 'Retention Strategy', 'Upselling']
        }
      ]
    },
    {
      name: '재무/회계',
      subcategories: [
        {
          name: '회계/감사',
          skills: ['SAP', 'Oracle ERP', 'QuickBooks', 'Excel 고급', 'Power BI', 'Tableau', '재무제표 분석', 'IFRS', 'K-GAAP']
        },
        {
          name: '재무분석',
          skills: ['Financial Modeling', 'Valuation', 'DCF Analysis', 'Bloomberg Terminal', 'Python for Finance', 'Risk Management', 'M&A']
        },
        {
          name: '세무',
          skills: ['법인세', '소득세', '부가세', '국제조세', '세무회계', 'Transfer Pricing', '세무조사 대응']
        }
      ]
    },
    {
      name: '인사/HR',
      subcategories: [
        {
          name: '채용/탤런트',
          skills: ['LinkedIn Recruiter', 'ATS', 'Workday', 'BambooHR', 'Greenhouse', 'Behavioral Interview', 'Technical Recruiting', 'Employer Branding']
        },
        {
          name: 'HR 운영',
          skills: ['HRIS', 'Payroll Management', 'Performance Management', 'Compensation Planning', 'Benefits Administration', 'Labor Law', 'Employee Relations']
        },
        {
          name: '조직개발',
          skills: ['Leadership Development', 'Training Design', 'Change Management', 'Culture Building', 'Team Building', 'Coaching', 'Facilitation']
        }
      ]
    },
    {
      name: '제조/생산',
      subcategories: [
        {
          name: '기계설계',
          skills: ['AutoCAD', 'SolidWorks', 'CATIA', 'Inventor', 'Creo', 'ANSYS', 'Simulation', 'GD&T', 'FEA Analysis']
        },
        {
          name: '생산관리',
          skills: ['Six Sigma', 'Lean Manufacturing', 'Kaizen', 'TPM', 'MES', 'ERP', 'Quality Control', 'ISO 9001', '5S']
        },
        {
          name: '전기/전자',
          skills: ['PLC Programming', 'HMI', 'SCADA', 'PCB Design', 'Arduino', 'Raspberry Pi', 'LabVIEW', 'MATLAB']
        }
      ]
    },
    {
      name: '미디어/콘텐츠',
      subcategories: [
        {
          name: '영상 제작',
          skills: ['Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'After Effects', 'Cinema 4D', 'Motion Graphics', 'Color Grading', 'Sound Design']
        },
        {
          name: '방송/저널리즘',
          skills: ['OBS Studio', 'Live Streaming', 'Podcast Production', 'Audio Editing', 'Script Writing', 'Interview Skills', 'News Writing']
        },
        {
          name: '게임 개발',
          skills: ['Unity', 'Unreal Engine', 'C#', 'C++', 'Game Design', 'Level Design', '3D Modeling', 'Game Testing']
        }
      ]
    },
    {
      name: '의료/헬스케어',
      subcategories: [
        {
          name: '임상/연구',
          skills: ['Clinical Trial', 'GCP', 'FDA Regulations', 'REDCap', 'SAS', 'R', 'Medical Writing', 'Protocol Development']
        },
        {
          name: '의료기기/제약',
          skills: ['GMP', 'QA/QC', 'Validation', 'Regulatory Affairs', 'ISO 13485', 'Medical Device', 'Pharmacovigilance']
        },
        {
          name: '디지털 헬스',
          skills: ['EMR/EHR', 'HL7', 'FHIR', 'Telemedicine', 'Health Informatics', 'PACS', 'Medical AI', 'mHealth']
        }
      ]
    },
    {
      name: '교육/연구',
      subcategories: [
        {
          name: '교육 기술',
          skills: ['LMS', 'Moodle', 'Canvas', 'Google Classroom', 'Zoom', 'Kahoot', 'Curriculum Design', 'Assessment Design', 'Instructional Design']
        },
        {
          name: '연구 분야',
          skills: ['SPSS', 'STATA', 'Python', 'R', 'LaTeX', 'Research Methodology', 'Academic Writing', 'Grant Writing', 'Peer Review']
        }
      ]
    },
    {
      name: '법무/컴플라이언스',
      subcategories: [
        {
          name: '법무',
          skills: ['계약검토', 'Legal Research', 'Litigation', 'M&A', 'IP Law', 'Corporate Law', 'Compliance', 'Due Diligence']
        },
        {
          name: '컴플라이언스',
          skills: ['Risk Assessment', 'Internal Audit', 'Regulatory Compliance', 'Anti-Money Laundering', 'Data Privacy', 'GDPR', 'SOX Compliance']
        }
      ]
    },
    {
      name: '부동산/건설',
      subcategories: [
        {
          name: '건축/설계',
          skills: ['AutoCAD', 'Revit', 'SketchUp', 'Rhino', 'BIM', '3ds Max', 'ArchiCAD', 'Lumion', 'V-Ray']
        },
        {
          name: '시공/관리',
          skills: ['Primavera', 'MS Project', '안전관리', '공정관리', '원가관리', '건설법규', '품질관리', '공무관리']
        }
      ]
    },
    {
      name: '물류/SCM',
      subcategories: [
        {
          name: '물류관리',
          skills: ['WMS', 'TMS', 'SAP SCM', 'Oracle SCM', '재고관리', '수요예측', 'Fulfillment', 'Last Mile Delivery']
        },
        {
          name: '공급망관리',
          skills: ['Supply Chain Planning', 'Procurement', 'Vendor Management', 'S&OP', 'Demand Planning', 'Sourcing', 'Cost Optimization']
        }
      ]
    },
    {
      name: '기타 전문분야',
      subcategories: [
        {
          name: '통번역',
          skills: ['영어', '중국어', '일본어', '프랑스어', '독일어', '스페인어', '동시통역', 'CAT Tools', '기술번역']
        },
        {
          name: '컨설팅',
          skills: ['Strategy Consulting', 'Management Consulting', 'IT Consulting', 'Financial Advisory', 'Risk Advisory', 'Change Management']
        },
        {
          name: '스타트업',
          skills: ['Lean Startup', 'MVP Development', 'Growth Hacking', 'Fundraising', 'Pitch Deck', 'Business Model Canvas', 'Product-Market Fit']
        }
      ]
    }
  ];

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
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700">
                <span className="font-bold">
                  {showRealDataOnly 
                    ? `${realProfiles.length}명` 
                    : '15,000+'}
                </span> 등록 인재
                {showRealDataOnly && (
                  <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">실제</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700">
                <span className="font-bold">45+</span> 국가
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700">
                <span className="font-bold">4.7</span> 평균 평점
              </span>
            </div>
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

            {/* 실제 데이터만 보기 토글 */}
            <button
              onClick={() => setShowRealDataOnly(!showRealDataOnly)}
              className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                showRealDataOnly
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Database className="w-4 h-4" />
              {loading ? '로딩 중...' : showRealDataOnly ? '실제 데이터 (ON)' : '실제 데이터'}
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

                {/* Industry Categories Filter */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      직군별 전문 기술
                    </label>
                    
                    {/* Main Categories */}
                    <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                      {categories.map(category => (
                        <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div
                            className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              if (expandedCategories.includes(category.name)) {
                                setExpandedCategories(expandedCategories.filter(c => c !== category.name));
                              } else {
                                setExpandedCategories([...expandedCategories, category.name]);
                              }
                            }}
                          >
                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCategory.includes(category.name)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedCategory([...selectedCategory, category.name]);
                                  } else {
                                    setSelectedCategory(selectedCategory.filter(c => c !== category.name));
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            </label>
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedCategories.includes(category.name) ? 'rotate-90' : ''
                            }`} />
                          </div>
                          
                          {expandedCategories.includes(category.name) && (
                            <div className="bg-gray-50 p-2 space-y-1">
                              {category.subcategories.map(subcategory => (
                                <div key={subcategory.name} className="bg-white rounded p-1">
                                  <div
                                    className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                      const key = `${category.name}-${subcategory.name}`;
                                      if (expandedSubcategories.includes(key)) {
                                        setExpandedSubcategories(expandedSubcategories.filter(s => s !== key));
                                      } else {
                                        setExpandedSubcategories([...expandedSubcategories, key]);
                                      }
                                    }}
                                  >
                                    <span className="text-xs font-medium text-gray-600">{subcategory.name}</span>
                                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${
                                      expandedSubcategories.includes(`${category.name}-${subcategory.name}`) ? 'rotate-180' : ''
                                    }`} />
                                  </div>
                                  
                                  {expandedSubcategories.includes(`${category.name}-${subcategory.name}`) && (
                                    <div className="px-2 py-1 grid grid-cols-2 gap-1">
                                      {subcategory.skills.map(skill => (
                                        <label key={skill} className="flex items-center gap-1 cursor-pointer hover:text-primary-600">
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
                                            className="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                          />
                                          <span className="text-xs text-gray-600 truncate" title={skill}>{skill}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(selectedSkills.length > 0 || selectedCategory.length > 0) && (
                    <button
                      onClick={() => {
                        setSelectedSkills([]);
                        setSelectedCategory([]);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      모든 필터 초기화
                    </button>
                  )}
                </div>

                {/* Results Count */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredProfiles.length}</span>명의 인재가 검색되었습니다
                  </p>
                  {showRealDataOnly && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ 실제 Firebase 데이터
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Talent Cards */}
            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">실제 데이터를 불러오는 중...</p>
                </div>
              ) : filteredProfiles.length > 0 ? (
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
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              {formatSalary(profile.expectedSalary?.min, profile.expectedSalary?.max)}
                            </span>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {profile.skills.slice(0, 6).map(skill => (
                              <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                            {profile.skills.length > 6 && (
                              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs">
                                +{profile.skills.length - 6} more
                              </span>
                            )}
                          </div>

                          {/* Languages */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Languages className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">언어:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {profile.languages?.map(lang => (
                                <span key={lang.language} className={`px-2 py-0.5 rounded text-xs ${getLanguageColor(lang.level)}`}>
                                  {lang.language} ({lang.level})
                                </span>
                              )) || <span className="text-xs text-gray-400">언어 정보 없음</span>}
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              <Clock className="w-4 h-4 inline text-gray-400 mr-1" />
                              {profile.availability}
                            </span>
                            <div className="flex gap-2">
                              <Link
                                href={`/talent/${profile.id}`}
                                className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 text-sm font-medium transition-colors"
                              >
                                프로필 보기
                              </Link>
                              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">
                                <Mail className="w-4 h-4" />
                                컨택하기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500">
                    {showRealDataOnly 
                      ? '실제 데이터가 없습니다. 온보딩을 완료한 구직자가 아직 없습니다.' 
                      : '검색 조건에 맞는 인재가 없습니다.'}
                  </p>
                  {showRealDataOnly && (
                    <button
                      onClick={() => setShowRealDataOnly(false)}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      더미 데이터 보기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}