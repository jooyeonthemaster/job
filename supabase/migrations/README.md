# Supabase Migrations

이 폴더에는 Supabase 데이터베이스 마이그레이션 파일들이 포함되어 있습니다.

## 📁 파일 구조

```
supabase/
├── schema.sql                    # 전체 DB 스키마 (초기 생성용)
└── migrations/
    ├── README.md                 # 이 파일
    └── YYYYMMDD_description.sql  # 마이그레이션 파일들
```

## 🚀 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard (권장)

1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 마이그레이션 SQL 파일 내용을 복사
5. **Run** 버튼 클릭하여 실행

### 방법 2: Supabase CLI

```bash
# Supabase CLI 설치 (처음 한 번만)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref YOUR_PROJECT_ID

# 마이그레이션 실행
supabase db push

# 또는 특정 파일 실행
psql $DATABASE_URL -f supabase/migrations/FILENAME.sql
```

## 📋 마이그레이션 목록

### 2025-10-15: company_phone 및 company_image 추가

**파일**: `20241015_add_company_phone_and_image.sql`

**변경사항**:
- `companies.company_phone` 컬럼 추가 (TEXT, nullable)
- `companies.company_image` 컬럼 추가 (TEXT, nullable)

**실행 방법**:
```sql
-- Supabase Dashboard SQL Editor에 붙여넣기
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_image TEXT;

COMMENT ON COLUMN companies.company_phone IS '기업 대표번호 (선택, 하이픈 포함)';
COMMENT ON COLUMN companies.company_image IS '회사 전경 이미지 URL (Cloudinary, 선택)';
```

## ⚠️ 주의사항

1. **백업 필수**: 마이그레이션 전 반드시 데이터베이스 백업
2. **테스트 환경 먼저**: 가능하면 개발/스테이징 환경에서 먼저 테스트
3. **IF NOT EXISTS**: `IF NOT EXISTS` 사용으로 중복 실행 방지
4. **순서 지키기**: 마이그레이션 파일은 날짜순으로 실행

## 🔍 마이그레이션 확인

```sql
-- 마이그레이션 적용 여부 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('company_phone', 'company_image');
```

## 📚 참고 자료

- [Supabase Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
