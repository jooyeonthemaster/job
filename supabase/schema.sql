-- =====================================================
-- SSMHR JobMatching Database Schema
-- Supabase Migration from Firebase
-- 
-- 🔥 최종 수정: 2025년 10월 15일
-- 현재 온보딩 페이지 기준으로 모든 필드 동기화 완료
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS (구직자)
-- =====================================================

CREATE TABLE users (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE,            -- Firebase UID (마이그레이션용)
  email TEXT UNIQUE NOT NULL,
  user_type TEXT DEFAULT 'jobseeker',
  
  -- ===== 온보딩 Step 1: 기본 정보 =====
  full_name TEXT NOT NULL,             -- 이름 (필수)
  headline TEXT,                       -- 헤드라인/간단 소개 (선택)
  profile_image_url TEXT,              -- 프로필 사진 URL
  
  -- ===== 온보딩 Step 2: 연락처 & 신원 정보 =====
  phone TEXT NOT NULL,                 -- 휴대폰 번호 (하이픈 제거, 010xxxxxxxx)
  phone_verified BOOLEAN DEFAULT false,             -- 전화번호 인증 여부
  foreigner_number TEXT NOT NULL,      -- 외국인등록번호 (123456-1234567)
  foreigner_number_verified BOOLEAN DEFAULT false,  -- 외국인등록번호 인증 여부
  
  -- ===== 온보딩 Step 3: 주소 =====
  address TEXT NOT NULL,               -- 주소 (Daum Postcode API)
  address_detail TEXT,                 -- 상세 주소
  
  -- ===== 온보딩 Step 4: 개인 정보 =====
  nationality TEXT NOT NULL,           -- 국적 (CN, US, VN, KR 등)
  gender TEXT NOT NULL,                -- 성별 (male | female)
  birth_year INTEGER,                  -- 출생연도 (YYYY)
  
  -- ===== 온보딩 Step 5: 비자 정보 =====
  visa_types TEXT[] NOT NULL,          -- 비자 종류 (F2, F4, F5, F6 중 복수 선택)
  korean_level TEXT NOT NULL,          -- 한국어 능력 (topik1~6 | native | none)
  
  -- ===== 온보딩 Step 6: 언어 능력 (별도 테이블: user_languages) =====
  
  -- ===== 온보딩 Step 7: 선호 조건 (추후 확장 가능) =====
  work_type TEXT,                      -- 고용 형태 (정규직, 계약직 등)
  company_size TEXT,                   -- 선호 회사 규모
  visa_sponsorship BOOLEAN DEFAULT false,  -- 비자 스폰서십 필요 여부
  remote_work TEXT,                    -- 재택근무 선호도
  introduction TEXT,                   -- 자기소개
  
  -- ===== 이력서 =====
  resume_file_url TEXT,                -- 이력서 파일 URL (Cloudinary)
  resume_file_name TEXT,               -- 이력서 파일명
  resume_uploaded_at TIMESTAMPTZ,      -- 이력서 업로드 일시
  
  -- ===== 약관 동의 =====
  agree_email_receive BOOLEAN DEFAULT false,        -- 이메일 수신 동의 (선택)
  agree_privacy_collection BOOLEAN DEFAULT false,   -- 개인정보 수집 동의 (필수)
  
  -- ===== 메타 정보 =====
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ===== 통계 =====
  applications_count INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- =====================================================
-- 2. USER RELATED TABLES (구직자 관련 테이블)
-- =====================================================

-- 구직자 기술
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_name ON user_skills(skill_name);

-- 구직자 언어
CREATE TABLE user_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language_name TEXT NOT NULL,
  proficiency TEXT,                    -- BASIC | INTERMEDIATE | FLUENT | NATIVE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, language_name)
);

CREATE INDEX idx_user_languages_user_id ON user_languages(user_id);

-- 경력
CREATE TABLE user_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_experiences_user_id ON user_experiences(user_id);
CREATE INDEX idx_user_experiences_current ON user_experiences(is_current);

-- 학력
CREATE TABLE user_educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_educations_user_id ON user_educations(user_id);

-- 희망 직무
CREATE TABLE user_desired_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, position_name)
);

CREATE INDEX idx_user_desired_positions_user_id ON user_desired_positions(user_id);

-- 희망 근무지
CREATE TABLE user_preferred_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, location_name)
);

CREATE INDEX idx_user_preferred_locations_user_id ON user_preferred_locations(user_id);

-- 희망 연봉
CREATE TABLE user_salary_range (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  min_salary INTEGER,
  max_salary INTEGER,
  currency TEXT DEFAULT 'KRW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_salary_range_user_id ON user_salary_range(user_id);

-- =====================================================
-- 3. COMPANIES (기업)
-- =====================================================

CREATE TABLE companies (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE,            -- Firebase UID (마이그레이션용, Supabase Auth로 전환 시 불필요)
  email TEXT UNIQUE NOT NULL,

  -- ===== Section 1: 사업자 정보 =====
  registration_number TEXT UNIQUE NOT NULL, -- 사업자등록번호 (10자리 숫자, 하이픈 제거)
  registration_document TEXT,          -- 사업자등록증 URL (Cloudinary Storage)
  name TEXT NOT NULL,                  -- 기업명 (한글, 필수)
  name_en TEXT,                        -- 기업명 (영문, 선택)
  established TEXT NOT NULL,           -- 설립년도 (YYYY-MM-DD) - 온보딩 establishmentYear 매핑
  ceo_name TEXT NOT NULL,              -- 대표자명

  -- ===== Section 2: 기업 분류 (K-Work 스타일) =====
  company_type TEXT NOT NULL,          -- 기업형태 (individual | corporation | foreign) - 온보딩 companyType
  industry TEXT,                       -- 업태 (선택) - 온보딩 businessCondition 매핑
  employee_count TEXT NOT NULL,        -- 기업규모 (필수) - 온보딩 companyScale 매핑
  industry_category TEXT,              -- K-Work 업종 1단계 (15개 카테고리) - 온보딩 industry
  industry_detail TEXT,                -- K-Work 업종 2단계 (상세) - 온보딩 industryDetail

  -- ===== Section 3: 연락처 =====
  phone TEXT,                          -- 담당자 전화번호 (구형, 하위 호환)
  company_phone TEXT,                  -- 기업 대표번호 (신규, 선택) - 온보딩 companyPhone
  website TEXT NOT NULL,               -- 홈페이지 (필수)

  -- ===== Section 4: 주소 =====
  location TEXT NOT NULL,              -- 주소 (Daum Postcode API) - 온보딩 address
  address TEXT NOT NULL,               -- 상세주소 - 온보딩 address + addressDetail 통합

  -- ===== Section 5: 이미지 =====
  logo TEXT,                           -- 로고 (선택, Cloudinary URL) - 온보딩 logo
  company_image TEXT,                  -- 회사 전경 이미지 (선택, Cloudinary URL) - 온보딩 companyImage
  images TEXT[],                       -- 기업 이미지 배열 (구형, 선택, 최대 3개)

  -- ===== Section 6: 복지 정보 (별도 테이블: company_basic_benefits) =====
  -- basicBenefits는 company_basic_benefits 테이블에 저장

  -- ===== Section 7: 담당자 정보 =====
  manager_department TEXT NOT NULL,    -- 담당부서 (필수) - 온보딩 managerDepartment
  manager_name TEXT NOT NULL,          -- 담당자명 (필수) - 온보딩 managerName
  manager_position TEXT,               -- 담당자 직책 (선택) - 온보딩 managerPosition
  manager_phone TEXT,                  -- 담당자 연락처 (선택) - 온보딩 managerPhone
  manager_email TEXT,                  -- 담당자 이메일 (필수) - 온보딩 managerEmail

  -- ===== Section 8: 간단한 소개 =====
  summary TEXT,                        -- 요약소개글 (회원가입 시 선택, 200자 이내) - 온보딩 summary

  -- ===== 대시보드에서 추가 입력 (선택) =====
  banner_image TEXT,                   -- 배너 이미지 (Cloudinary URL)
  description TEXT,                    -- 상세 소개
  slogan TEXT,                         -- 슬로건
  vision TEXT,                         -- 비전
  mission TEXT,                        -- 미션

  -- 비즈니스 정보
  revenue TEXT,                        -- 연간 매출
  funding TEXT,                        -- 투자 현황

  -- ===== 메타 정보 =====
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',       -- pending | active | suspended
  profile_completed BOOLEAN DEFAULT false,        -- 회원가입 완료 여부
  additional_info_completed BOOLEAN DEFAULT false, -- 대시보드 추가 정보 완료 여부

  -- ===== 평가 정보 (자동 계산) =====
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0
  -- open_positions는 VIEW에서 동적으로 계산 (companies_with_job_count)
);

-- 인덱스
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_firebase_uid ON companies(firebase_uid);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_profile_completed ON companies(profile_completed);
CREATE INDEX idx_companies_company_type ON companies(company_type);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_location ON companies(location);
CREATE INDEX idx_companies_registration_number ON companies(registration_number);

-- =====================================================
-- 4. COMPANY RELATED TABLES (기업 관련 테이블)
-- =====================================================

-- 기본 복지 (회원가입 시 간단한 태그 형식, 최소 1개)
CREATE TABLE company_basic_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  benefit_tag TEXT NOT NULL,           -- 예: "자율 출퇴근", "식대 지원", "4대보험"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_basic_benefits_company_id ON company_basic_benefits(company_id);

-- 기업 기술 스택 (대시보드에서 추가)
CREATE TABLE company_tech_stack (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tech_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, tech_name)
);

CREATE INDEX idx_company_tech_stack_company_id ON company_tech_stack(company_id);
CREATE INDEX idx_company_tech_stack_tech_name ON company_tech_stack(tech_name);

-- 상세 복지 (대시보드에서 카테고리별로 상세 입력)
CREATE TABLE company_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,             -- workEnvironment | growth | healthWelfare | compensation
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_benefits_company_id ON company_benefits(company_id);
CREATE INDEX idx_company_benefits_category ON company_benefits(category);

-- 기업 통계
CREATE TABLE company_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  current_employees INTEGER,
  last_year_employees INTEGER,
  avg_salary INTEGER,
  avg_tenure DECIMAL(3,1),
  female_ratio DECIMAL(5,2),
  foreigner_ratio DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  turnover_rate DECIMAL(5,2),
  recommend_rate DECIMAL(5,2),
  interview_difficulty DECIMAL(2,1),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_stats_company_id ON company_stats(company_id);

-- 채용 담당자
CREATE TABLE company_recruiters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_image TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_recruiters_company_id ON company_recruiters(company_id);
CREATE INDEX idx_company_recruiters_is_primary ON company_recruiters(is_primary);

-- 사무실 위치
CREATE TABLE company_offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  address TEXT NOT NULL,
  address_en TEXT,
  detail_address TEXT,
  postal_code TEXT,
  office_type TEXT NOT NULL,          -- HQ | Branch | Lab | Factory
  employees INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  map_url TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_offices_company_id ON company_offices(company_id);
CREATE INDEX idx_company_offices_is_main ON company_offices(is_main);

-- =====================================================
-- 5. JOBS (채용공고) - 과금 시스템 포함
-- =====================================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- 공고 기본 정보
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,      -- FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP
  experience_level TEXT NOT NULL,     -- ENTRY | JUNIOR | MID | SENIOR | EXECUTIVE
  
  -- 급여 정보
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'KRW',
  salary_negotiable BOOLEAN DEFAULT false,
  
  -- 상세 정보
  description TEXT NOT NULL,
  visa_sponsorship BOOLEAN DEFAULT false,
  korean_level TEXT,                  -- NONE | BASIC | INTERMEDIATE | FLUENT | NATIVE
  english_level TEXT,
  
  -- 과금 정보
  posting_tier TEXT NOT NULL,         -- standard | top | premium
  posting_price INTEGER NOT NULL,     -- 공고 가격
  posting_duration INTEGER NOT NULL,  -- 게재 기간 (일)
  posting_vat_amount INTEGER NOT NULL,-- 부가세
  posting_total_amount INTEGER NOT NULL, -- 총액
  
  -- 결제 정보
  payment_status TEXT DEFAULT 'pending', -- pending | paid | confirmed
  payment_requested_at TIMESTAMPTZ DEFAULT NOW(),
  payment_paid_at TIMESTAMPTZ,
  payment_confirmed_at TIMESTAMPTZ,
  payment_billing_contact_name TEXT,
  payment_billing_contact_phone TEXT,
  
  -- UI 노출 위치 (관리자 할당)
  display_position TEXT,              -- top | middle | bottom | NULL
  display_priority INTEGER,           -- 우선순위 (낮을수록 상단)
  display_assigned_at TIMESTAMPTZ,
  display_assigned_by TEXT,           -- 관리자 ID
  
  -- 메타 정보
  deadline DATE,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  applicants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending_payment', -- pending_payment | active | closed | draft
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);
CREATE INDEX idx_jobs_payment_status ON jobs(payment_status);
CREATE INDEX idx_jobs_display_position_priority ON jobs(display_position, display_priority);

-- =====================================================
-- 6. JOB RELATED TABLES (채용공고 관련 테이블)
-- =====================================================

-- 주요 업무
CREATE TABLE job_main_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  task_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_main_tasks_job_id ON job_main_tasks(job_id);

-- 자격요건
CREATE TABLE job_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  requirement_text TEXT NOT NULL,
  is_preferred BOOLEAN DEFAULT false,  -- false: 필수, true: 우대
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_requirements_job_id ON job_requirements(job_id);

-- 복리후생
CREATE TABLE job_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  benefit_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_benefits_job_id ON job_benefits(job_id);

-- 태그
CREATE TABLE job_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(job_id, tag_name)
);

CREATE INDEX idx_job_tags_job_id ON job_tags(job_id);
CREATE INDEX idx_job_tags_tag_name ON job_tags(tag_name);

-- 채용 담당자
CREATE TABLE job_manager (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  position TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_manager_job_id ON job_manager(job_id);

-- 근무 조건
CREATE TABLE job_work_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,
  probation TEXT,                     -- 수습 기간
  work_hours TEXT,                    -- 근무 시간
  start_date TEXT,                    -- 입사 예정일
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_work_conditions_job_id ON job_work_conditions(job_id);

-- =====================================================
-- 7. APPLICATIONS (지원/신청)
-- =====================================================

-- 인재 채용 신청
CREATE TABLE talent_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  talent_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',      -- pending | approved | rejected | contacted
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_talent_applications_talent_id ON talent_applications(talent_id);
CREATE INDEX idx_talent_applications_status ON talent_applications(status);
CREATE INDEX idx_talent_applications_created_at ON talent_applications(created_at DESC);

-- 채용공고 지원
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',      -- pending | reviewing | accepted | rejected
  manager_name TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_company_id ON job_applications(company_id);
CREATE INDEX idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) 정책
-- =====================================================

-- Users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = firebase_uid);

-- 온보딩 완료된 구직자는 모두 조회 가능 (인재풀)
CREATE POLICY "Anyone can view completed jobseeker profiles"
  ON users FOR SELECT
  USING (onboarding_completed = true AND user_type = 'jobseeker');

-- Companies 테이블 RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 기업은 자신의 정보만 조회/수정 가능
CREATE POLICY "Companies can view own data"
  ON companies FOR SELECT
  USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Companies can update own data"
  ON companies FOR UPDATE
  USING (auth.uid()::text = firebase_uid);

-- 프로필 완성된 기업은 모두 조회 가능
CREATE POLICY "Anyone can view active companies"
  ON companies FOR SELECT
  USING (profile_completed = true AND status = 'active');

-- Jobs 테이블 RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 기업은 자신의 공고만 CRUD 가능
CREATE POLICY "Companies can manage own jobs"
  ON jobs FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE firebase_uid = auth.uid()::text
  ));

-- 활성 공고는 모두 조회 가능
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  USING (status = 'active');

-- =====================================================
-- 9. VIEWS (복잡한 쿼리 최적화)
-- =====================================================

-- N+1 문제 해결: 기업 목록 + 채용공고 수
CREATE OR REPLACE VIEW companies_with_job_count AS
SELECT 
  c.*,
  COUNT(j.id) FILTER (WHERE j.status = 'active') as open_positions
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id
WHERE c.profile_completed = true AND c.status = 'active'
GROUP BY c.id;

-- 채용공고 목록 (display position별)
CREATE OR REPLACE VIEW jobs_by_display_position AS
SELECT 
  j.*,
  c.name as company_name,
  c.logo as company_logo,
  c.industry as company_industry
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.status = 'active'
ORDER BY 
  CASE j.display_position
    WHEN 'top' THEN 1
    WHEN 'middle' THEN 2
    WHEN 'bottom' THEN 3
    ELSE 4
  END,
  j.display_priority ASC,
  j.posted_at DESC;

-- =====================================================
-- 완료!
-- =====================================================

-- 생성된 테이블 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 생성된 인덱스 확인
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

