export interface TalentProfile {
  id: string;
  name: string;
  title: string;
  nationality: string;
  location: string;
  experience: number;
  skills: string[];
  languages: { language: string; level: string }[];
  availability: string;
  expectedSalary?: { min: number; max: number };
  bio?: string;
  rating?: number;
  completedProjects?: number;
  profileImage?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  education?: Education[];
  workExperience?: WorkExperience[];
  certifications?: Certification[];
  projects?: Project[];
  reviews?: Review[];
  aboutMe?: string;
  achievements?: string[];
  visaStatus?: string;
  preferredWorkStyle?: string[];
  currentEmployment?: string;
  // 추가: 구직자 선호 조건
  desiredPositions?: string[];
  preferredLocations?: string[];
  workType?: string;
  companySize?: string;
  remoteWork?: string;
  visaSponsorship?: boolean;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  location: string;
  startYear: number;
  endYear?: number;
  current?: boolean;
  gpa?: string;
}

export interface WorkExperience {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements?: string[];
  technologies?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  duration: string;
  technologies: string[];
  outcomes: string[];
  url?: string;
  images?: string[];
  client?: string;
  teamSize?: number;
}

export interface Review {
  id: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  rating: number;
  comment: string;
  projectTitle: string;
  date: string;
  verified: boolean;
}

export const talentProfiles: TalentProfile[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    nationality: 'United States',
    location: '서울',
    experience: 5,
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Kubernetes', 'CI/CD', 'Jest', 'React Native'],
    languages: [
      { language: 'English', level: 'Native' },
      { language: 'Korean', level: 'Intermediate' }
    ],
    availability: 'Immediate',
    expectedSalary: { min: 60000000, max: 80000000 },
    bio: 'Experienced full-stack developer with a passion for creating scalable web applications. Specialized in modern JavaScript frameworks and cloud architecture.',
    rating: 4.8,
    completedProjects: 12,
    email: 'alex.johnson@example.com',
    phone: '+82-10-1234-5678',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson',
    portfolio: 'alexjohnson.dev',
    visaStatus: 'E-7 Visa',
    preferredWorkStyle: ['Remote', 'Hybrid'],
    currentEmployment: 'Freelancing',
    aboutMe: `I'm a passionate full-stack developer with over 5 years of experience building web applications that scale. My journey in tech started with a computer science degree from Stanford, and since then, I've worked with startups and enterprises across the globe.

I specialize in React and Node.js ecosystems, with deep expertise in TypeScript and cloud infrastructure. I believe in writing clean, maintainable code and building products that make a real impact on users' lives.

When I'm not coding, you can find me contributing to open-source projects, writing technical blog posts, or exploring the beautiful mountains around Seoul. I'm always eager to take on challenging projects that push the boundaries of web technology.`,
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Stanford University',
        location: 'California, USA',
        startYear: 2014,
        endYear: 2018,
        gpa: '3.8/4.0'
      }
    ],
    workExperience: [
      {
        position: 'Senior Full Stack Developer',
        company: 'TechCorp Korea',
        location: 'Seoul, South Korea',
        startDate: '2021-06',
        current: true,
        description: 'Leading the development of a cloud-based SaaS platform serving over 10,000 businesses.',
        achievements: [
          'Reduced API response time by 40% through optimization',
          'Implemented microservices architecture serving 1M+ requests daily',
          'Mentored 5 junior developers and conducted code reviews'
        ],
        technologies: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']
      },
      {
        position: 'Full Stack Developer',
        company: 'StartupHub',
        location: 'San Francisco, USA',
        startDate: '2019-03',
        endDate: '2021-05',
        current: false,
        description: 'Built and maintained multiple web applications for various clients in the fintech sector.',
        achievements: [
          'Developed payment processing system handling $5M+ transactions',
          'Improved application performance by 60%',
          'Led migration from monolithic to microservices architecture'
        ],
        technologies: ['React', 'Express.js', 'MongoDB', 'Redis', 'Kubernetes']
      },
      {
        position: 'Junior Developer',
        company: 'Digital Agency Pro',
        location: 'Los Angeles, USA',
        startDate: '2018-07',
        endDate: '2019-02',
        current: false,
        description: 'Worked on client websites and web applications using modern JavaScript frameworks.',
        achievements: [
          'Built 10+ responsive websites for clients',
          'Implemented SEO best practices improving search rankings by 30%'
        ],
        technologies: ['JavaScript', 'HTML/CSS', 'WordPress', 'PHP']
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2022-03',
        expiryDate: '2025-03',
        credentialId: 'AWS-SAA-123456',
        url: 'https://aws.amazon.com/certification/verify'
      },
      {
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB University',
        date: '2021-09',
        credentialId: 'MDB-DEV-789012'
      }
    ],
    projects: [
      {
        id: 'p1',
        title: 'E-Commerce Platform Redesign',
        description: 'Complete redesign and rebuild of a major e-commerce platform handling 50,000+ daily active users.',
        role: 'Lead Full Stack Developer',
        duration: '6 months',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
        outcomes: [
          'Increased conversion rate by 25%',
          'Reduced page load time by 50%',
          'Improved mobile user experience with 95% satisfaction rate'
        ],
        client: 'Fashion Retail Corp',
        teamSize: 8
      },
      {
        id: 'p2',
        title: 'Real-time Analytics Dashboard',
        description: 'Built a real-time analytics dashboard for monitoring business metrics and KPIs.',
        role: 'Full Stack Developer',
        duration: '3 months',
        technologies: ['React', 'GraphQL', 'WebSockets', 'D3.js', 'Node.js'],
        outcomes: [
          'Processed 1M+ events per day in real-time',
          'Reduced decision-making time by 40%',
          'Automated report generation saving 20 hours weekly'
        ],
        client: 'Data Solutions Inc',
        teamSize: 4
      }
    ],
    reviews: [
      {
        id: 'r1',
        clientName: 'Sarah Kim',
        clientTitle: 'CTO',
        clientCompany: 'TechCorp Korea',
        rating: 5,
        comment: 'Alex is an exceptional developer who consistently delivers high-quality code. His expertise in React and Node.js helped us scale our platform to serve thousands of customers. He\'s also a great team player and mentor.',
        projectTitle: 'SaaS Platform Development',
        date: '2023-10-15',
        verified: true
      },
      {
        id: 'r2',
        clientName: 'Michael Chen',
        clientTitle: 'Product Manager',
        clientCompany: 'StartupHub',
        rating: 5,
        comment: 'Working with Alex was a game-changer for our project. He brought innovative solutions to complex problems and always met deadlines. His understanding of both frontend and backend made him invaluable to our team.',
        projectTitle: 'Fintech Application',
        date: '2021-04-20',
        verified: true
      },
      {
        id: 'r3',
        clientName: 'Jennifer Park',
        clientTitle: 'CEO',
        clientCompany: 'Fashion Retail Corp',
        rating: 4.5,
        comment: 'Alex led our e-commerce platform redesign with great professionalism. The results exceeded our expectations with significant improvements in performance and user experience.',
        projectTitle: 'E-Commerce Platform Redesign',
        date: '2023-06-30',
        verified: true
      }
    ],
    achievements: [
      'Speaker at React Seoul 2023 Conference',
      'Open source contributor with 500+ GitHub stars',
      'Published 15+ technical articles on Medium',
      'Completed 100+ coding challenges on LeetCode'
    ]
  },
  {
    id: '2',
    name: 'Sophie Chen',
    title: 'UX/UI Designer',
    nationality: 'Canada',
    location: '부산',
    experience: 3,
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'Design Systems', 'User Research', 'Wireframing', 'Visual Design', 'Interaction Design', 'Usability Testing', 'Adobe Creative Suite', 'HTML/CSS'],
    languages: [
      { language: 'English', level: 'Fluent' },
      { language: 'Korean', level: 'Basic' },
      { language: 'Chinese', level: 'Native' }
    ],
    availability: '2 weeks',
    expectedSalary: { min: 50000000, max: 70000000 },
    bio: 'Creative designer specializing in mobile app interfaces and user experience optimization. Passionate about creating intuitive and beautiful digital experiences.',
    rating: 4.9,
    completedProjects: 8,
    email: 'sophie.chen@example.com',
    phone: '+82-10-2345-6789',
    linkedin: 'linkedin.com/in/sophiechen',
    portfolio: 'sophiechen.design',
    visaStatus: 'F-4 Visa',
    preferredWorkStyle: ['On-site', 'Hybrid'],
    currentEmployment: 'Looking for opportunities',
    aboutMe: `As a UX/UI designer with a multicultural background, I bring unique perspectives to every design challenge. My approach combines aesthetic beauty with functional simplicity, always keeping the end-user at the center of the design process.

I have extensive experience designing for both B2B and B2C products, with a special focus on mobile experiences. I believe great design is invisible - it should feel so natural that users don't even think about it.

My design philosophy is rooted in empathy, research, and iterative improvement. I love collaborating with cross-functional teams to bring ideas to life.`,
    education: [
      {
        degree: 'Bachelor of Design',
        field: 'Interaction Design',
        institution: 'Emily Carr University',
        location: 'Vancouver, Canada',
        startYear: 2017,
        endYear: 2021,
        gpa: '3.9/4.0'
      }
    ],
    workExperience: [
      {
        position: 'Senior Product Designer',
        company: 'Design Studio Busan',
        location: 'Busan, South Korea',
        startDate: '2022-01',
        current: true,
        description: 'Leading design for multiple client projects ranging from mobile apps to web platforms.',
        achievements: [
          'Increased user engagement by 45% through redesign',
          'Established design system used across 5 products',
          'Conducted 50+ user interviews and usability tests'
        ],
        technologies: ['Figma', 'Principle', 'Maze', 'Hotjar']
      },
      {
        position: 'UX Designer',
        company: 'Tech Innovations',
        location: 'Toronto, Canada',
        startDate: '2021-02',
        endDate: '2021-12',
        current: false,
        description: 'Designed user interfaces for SaaS products in the education technology sector.',
        achievements: [
          'Redesigned onboarding flow reducing drop-off by 30%',
          'Created design system components library',
          'Improved accessibility compliance to WCAG 2.1 AA'
        ],
        technologies: ['Sketch', 'InVision', 'Adobe XD']
      }
    ],
    certifications: [
      {
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        date: '2022-06',
        credentialId: 'GOOGLE-UX-456789'
      },
      {
        name: 'Certified Usability Analyst',
        issuer: 'Human Factors International',
        date: '2023-01',
        credentialId: 'CUA-2023-789'
      }
    ]
  },
  {
    id: '3',
    name: 'Marcus Weber',
    title: 'Data Scientist',
    nationality: 'Germany',
    location: '판교',
    experience: 7,
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch', 'Data Visualization', 'R', 'Spark', 'Deep Learning', 'NLP', 'Computer Vision', 'Statistics', 'A/B Testing'],
    languages: [
      { language: 'English', level: 'Fluent' },
      { language: 'Korean', level: 'Intermediate' },
      { language: 'German', level: 'Native' }
    ],
    availability: '1 month',
    expectedSalary: { min: 80000000, max: 100000000 },
    bio: 'PhD in Computer Science with expertise in deep learning and data analysis. Published researcher with experience in both academic and industry settings.',
    rating: 4.7,
    completedProjects: 15,
    visaStatus: 'E-7 Visa',
    preferredWorkStyle: ['Remote', 'Hybrid'],
    currentEmployment: 'Senior Data Scientist at AI Corp'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    title: 'Product Manager',
    nationality: 'Spain',
    location: '서울',
    experience: 6,
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping', 'A/B Testing', 'SQL', 'Jira', 'Confluence', 'Analytics', 'Scrum', 'OKRs'],
    languages: [
      { language: 'English', level: 'Fluent' },
      { language: 'Korean', level: 'Intermediate' },
      { language: 'Spanish', level: 'Native' }
    ],
    availability: '1 week',
    expectedSalary: { min: 70000000, max: 90000000 },
    bio: 'Strategic product manager with experience in B2B SaaS and e-commerce. Track record of launching successful products and growing user engagement.',
    rating: 4.6,
    completedProjects: 10,
    visaStatus: 'F-2 Visa',
    preferredWorkStyle: ['On-site', 'Hybrid'],
    currentEmployment: 'Freelance Product Consultant'
  },
  {
    id: '5',
    name: 'Thomas Anderson',
    title: 'DevOps Engineer',
    nationality: 'United Kingdom',
    location: '성남',
    experience: 4,
    skills: ['Kubernetes', 'AWS', 'CI/CD', 'Docker', 'Terraform', 'Jenkins', 'Linux', 'Python', 'Bash', 'Monitoring', 'Azure', 'GCP', 'Ansible'],
    languages: [
      { language: 'English', level: 'Native' },
      { language: 'Korean', level: 'Basic' }
    ],
    availability: '3 weeks',
    expectedSalary: { min: 65000000, max: 85000000 },
    bio: 'DevOps specialist focused on building scalable infrastructure and automating deployment processes. Experience with both startup and enterprise environments.',
    rating: 4.5,
    completedProjects: 9,
    visaStatus: 'E-7 Visa',
    preferredWorkStyle: ['Remote'],
    currentEmployment: 'DevOps Engineer at Cloud Solutions'
  }
];

export const getTalentById = (id: string): TalentProfile | undefined => {
  return talentProfiles.find(profile => profile.id === id);
};

export const getSimilarTalents = (currentId: string, limit: number = 3): TalentProfile[] => {
  const current = getTalentById(currentId);
  if (!current) return [];
  
  return talentProfiles
    .filter(profile => profile.id !== currentId)
    .filter(profile => {
      // Find talents with similar skills or same role
      const sharedSkills = profile.skills.filter(skill => 
        current.skills.includes(skill)
      );
      return sharedSkills.length > 2 || profile.title === current.title;
    })
    .slice(0, limit);
};