// 인재풀 카테고리 및 스킬 데이터
// app/talent/page.tsx에서 분리 (기능 변경 없음)

export type TalentSubcategory = {
  name: string;
  skills: string[];
};

export type TalentCategory = {
  name: string;
  subcategories: TalentSubcategory[];
};

export const TALENT_CATEGORIES: TalentCategory[] = [
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
