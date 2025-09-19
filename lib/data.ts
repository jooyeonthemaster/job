import { Company, Job } from '@/types';

export const companies: Company[] = [
  {
    id: '1',
    name: '삼성전자',
    nameEn: 'Samsung Electronics',
    logo: 'https://via.placeholder.com/100',
    bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=300&fit=crop',
    industry: 'Technology',
    location: '서울 강남구',
    employeeCount: '10,000+',
    description: 'Leading global technology company',
    rating: 4.5,
    reviewCount: 1250,
    openPositions: 15,
    benefits: ['4대보험', '퇴직금', '인센티브', '유연근무', '자기계발지원'],
    techStack: ['React', 'TypeScript', 'Node.js', 'AWS'],
    established: '1969'
  },
  {
    id: '2',
    name: '네이버',
    nameEn: 'NAVER',
    logo: 'https://via.placeholder.com/100',
    bannerImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=300&fit=crop',
    industry: 'Internet',
    location: '경기도 성남시',
    employeeCount: '3,000-10,000',
    description: 'Korea\'s leading internet platform',
    rating: 4.3,
    reviewCount: 890,
    openPositions: 8,
    benefits: ['4대보험', '퇴직금', '스톡옵션', '재택근무', '헬스케어'],
    techStack: ['Java', 'Spring', 'React', 'Kubernetes'],
    established: '1999'
  },
  {
    id: '3',
    name: '카카오',
    nameEn: 'Kakao',
    logo: 'https://via.placeholder.com/100',
    bannerImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=300&fit=crop',
    industry: 'Internet',
    location: '제주도',
    employeeCount: '3,000-10,000',
    description: 'Mobile lifestyle platform company',
    rating: 4.4,
    reviewCount: 750,
    openPositions: 12,
    benefits: ['4대보험', '퇴직금', '스톡옵션', '유연근무', '복지포인트'],
    techStack: ['Kotlin', 'Swift', 'React Native', 'GCP'],
    established: '2014'
  },
  {
    id: '4',
    name: '쿠팡',
    nameEn: 'Coupang',
    logo: 'https://via.placeholder.com/100',
    bannerImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
    industry: 'E-commerce',
    location: '서울 송파구',
    employeeCount: '10,000+',
    description: 'Leading e-commerce platform',
    rating: 3.9,
    reviewCount: 2100,
    openPositions: 25,
    benefits: ['4대보험', '퇴직금', '성과급', '자기계발지원', '사내카페'],
    techStack: ['Python', 'Django', 'React', 'AWS'],
    established: '2010'
  },
  {
    id: '5',
    name: '토스',
    nameEn: 'Toss',
    logo: 'https://via.placeholder.com/100',
    bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=300&fit=crop',
    industry: 'Fintech',
    location: '서울 강남구',
    employeeCount: '1,000-3,000',
    description: 'Revolutionary fintech platform',
    rating: 4.6,
    reviewCount: 420,
    openPositions: 18,
    benefits: ['4대보험', '퇴직금', '스톡옵션', '무제한휴가', '최신장비'],
    techStack: ['TypeScript', 'Next.js', 'Node.js', 'AWS'],
    established: '2015'
  },
  {
    id: '6',
    name: '배달의민족',
    nameEn: 'Baemin',
    logo: 'https://via.placeholder.com/100',
    bannerImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=300&fit=crop',
    industry: 'Food Delivery',
    location: '서울 송파구',
    employeeCount: '1,000-3,000',
    description: 'Korea\'s #1 food delivery app',
    rating: 4.2,
    reviewCount: 680,
    openPositions: 10,
    benefits: ['4대보험', '퇴직금', '성과급', '식사지원', '헬스케어'],
    techStack: ['Java', 'Spring Boot', 'Vue.js', 'AWS'],
    established: '2010'
  }
];

export const jobs: Job[] = [
  {
    id: '1',
    companyId: '1',
    company: companies[0],
    title: '프론트엔드 개발자',
    titleEn: 'Frontend Developer',
    department: 'Engineering',
    location: '서울 강남구',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    salary: {
      min: 60000000,
      max: 90000000,
      currency: 'KRW',
      negotiable: true
    },
    description: 'Join our global engineering team to build next-generation web applications.',
    requirements: [
      '3+ years of frontend development experience',
      'Proficiency in React, TypeScript',
      'Experience with modern CSS frameworks',
      'Understanding of web performance optimization'
    ],
    preferredQualifications: [
      'Experience with Next.js',
      'Contribution to open source projects',
      'Experience in large-scale applications'
    ],
    benefits: ['4대보험', '퇴직금', '성과급', '재택근무', '자기계발지원'],
    deadline: '2025-10-31',
    postedAt: '2025-09-15',
    views: 1250,
    applicants: 45,
    tags: ['React', 'TypeScript', 'Frontend'],
    visaSponsorship: true,
    languageRequirements: {
      korean: 'INTERMEDIATE',
      english: 'FLUENT'
    }
  },
  {
    id: '2',
    companyId: '2',
    company: companies[1],
    title: '백엔드 엔지니어',
    titleEn: 'Backend Engineer',
    department: 'Platform',
    location: '경기도 성남시',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salary: {
      min: 80000000,
      max: 120000000,
      currency: 'KRW',
      negotiable: true
    },
    description: 'Build scalable backend systems for millions of users.',
    requirements: [
      '5+ years of backend development',
      'Strong Java/Spring expertise',
      'Experience with distributed systems',
      'Database optimization skills'
    ],
    preferredQualifications: [
      'Experience with Kubernetes',
      'Knowledge of microservices architecture',
      'Performance tuning experience'
    ],
    benefits: ['4대보험', '퇴직금', '스톡옵션', '유연근무', '헬스케어'],
    deadline: '2025-10-15',
    postedAt: '2025-09-10',
    views: 980,
    applicants: 32,
    tags: ['Java', 'Spring', 'Backend'],
    visaSponsorship: true,
    languageRequirements: {
      korean: 'FLUENT',
      english: 'INTERMEDIATE'
    }
  },
  {
    id: '3',
    companyId: '5',
    company: companies[4],
    title: '데이터 분석가',
    titleEn: 'Data Analyst',
    department: 'Data',
    location: '서울 강남구',
    employmentType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
    salary: {
      min: 50000000,
      max: 70000000,
      currency: 'KRW',
      negotiable: false
    },
    description: 'Analyze financial data to drive business decisions.',
    requirements: [
      '1+ years of data analysis experience',
      'Proficiency in SQL and Python',
      'Experience with data visualization tools',
      'Statistical analysis knowledge'
    ],
    preferredQualifications: [
      'Finance industry experience',
      'Machine learning knowledge',
      'Experience with Tableau or PowerBI'
    ],
    benefits: ['4대보험', '퇴직금', '스톡옵션', '무제한휴가', '최신장비'],
    deadline: '2025-11-01',
    postedAt: '2025-09-18',
    views: 750,
    applicants: 28,
    tags: ['Data', 'Python', 'SQL'],
    visaSponsorship: true,
    languageRequirements: {
      korean: 'BASIC',
      english: 'FLUENT'
    }
  },
  {
    id: '4',
    companyId: '3',
    company: companies[2],
    title: 'UX/UI 디자이너',
    titleEn: 'UX/UI Designer',
    department: 'Design',
    location: '제주도',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    salary: {
      min: 55000000,
      max: 75000000,
      currency: 'KRW',
      negotiable: true
    },
    description: 'Design beautiful and intuitive user experiences for our mobile apps.',
    requirements: [
      '3+ years of UX/UI design experience',
      'Proficiency in Figma',
      'Mobile app design experience',
      'Understanding of design systems'
    ],
    preferredQualifications: [
      'Experience with motion design',
      'User research experience',
      'Front-end development knowledge'
    ],
    benefits: ['4대보험', '퇴직금', '스톡옵션', '유연근무', '복지포인트'],
    deadline: '2025-10-25',
    postedAt: '2025-09-12',
    views: 620,
    applicants: 22,
    tags: ['Design', 'Figma', 'Mobile'],
    visaSponsorship: false,
    languageRequirements: {
      korean: 'FLUENT',
      english: 'BASIC'
    }
  }
];

export const industries = [
  'Technology',
  'Internet',
  'E-commerce',
  'Fintech',
  'Food Delivery',
  'Gaming',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail'
];

export const locations = [
  '서울',
  '경기도',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '제주도'
];

export const experienceLevels = [
  { value: 'ENTRY', label: '신입' },
  { value: 'JUNIOR', label: '주니어 (1-3년)' },
  { value: 'MID', label: '미드레벨 (3-7년)' },
  { value: 'SENIOR', label: '시니어 (7년+)' },
  { value: 'EXECUTIVE', label: '임원급' }
];

export const employmentTypes = [
  { value: 'FULL_TIME', label: '정규직' },
  { value: 'PART_TIME', label: '계약직' },
  { value: 'CONTRACT', label: '파트타임' },
  { value: 'INTERNSHIP', label: '인턴' }
];