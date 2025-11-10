-- Make optional fields nullable for companies table
-- 선택 필드들을 nullable로 변경 (NOT NULL 제약조건 제거)

-- 1. NOT NULL 제약조건 제거 (모든 선택 필드)
ALTER TABLE companies
ALTER COLUMN registration_number DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN ceo_name DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN established DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN employee_count DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN website DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN location DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN manager_department DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN manager_name DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN manager_position DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN company_phone DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN registration_document DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN logo DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN company_image DROP NOT NULL;

ALTER TABLE companies
ALTER COLUMN summary DROP NOT NULL;

-- 2. 기존 빈 문자열을 NULL로 변환 (UNIQUE 제약조건 중복 방지 및 데이터 정리)
UPDATE companies
SET registration_number = NULL
WHERE registration_number = '' OR TRIM(registration_number) = '';

UPDATE companies
SET ceo_name = NULL
WHERE ceo_name = '' OR TRIM(ceo_name) = '';

UPDATE companies
SET established = NULL
WHERE established = '' OR TRIM(established) = '';

UPDATE companies
SET employee_count = NULL
WHERE employee_count = '' OR TRIM(employee_count) = '';

UPDATE companies
SET website = NULL
WHERE website = '' OR TRIM(website) = '';

UPDATE companies
SET location = NULL
WHERE location = '' OR TRIM(location) = '';

UPDATE companies
SET manager_department = NULL
WHERE manager_department = '' OR TRIM(manager_department) = '';

UPDATE companies
SET manager_name = NULL
WHERE manager_name = '' OR TRIM(manager_name) = '';

UPDATE companies
SET manager_position = NULL
WHERE manager_position = '' OR TRIM(manager_position) = '';

UPDATE companies
SET company_phone = NULL
WHERE company_phone = '' OR TRIM(company_phone) = '';

UPDATE companies
SET registration_document = NULL
WHERE registration_document = '' OR TRIM(registration_document) = '';

UPDATE companies
SET logo = NULL
WHERE logo = '' OR TRIM(logo) = '';

UPDATE companies
SET company_image = NULL
WHERE company_image = '' OR TRIM(company_image) = '';

UPDATE companies
SET summary = NULL
WHERE summary = '' OR TRIM(summary) = '';
