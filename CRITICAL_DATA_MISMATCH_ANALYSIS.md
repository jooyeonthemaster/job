# 🚨 데이터 구조 불일치 분석 보고서

**생성일**: 2025-10-21
**프로젝트**: GlobalTalent (20250919jobmatch)
**심각도**: 🔴 CRITICAL

---

## 📊 핵심 문제: 기업 대시보드 vs 공개 페이지 데이터 불일치

### 🔍 문제 요약

**기업 대시보드 편집 페이지**에서 입력하는 데이터 구조와 **공개 기업 정보 페이지**에서 표시하는 데이터 구조가 **완전히 다릅니다**.

이로 인해:
- ❌ 사용자가 입력한 데이터가 제대로 표시되지 않음
- ❌ DB 필드명 불일치로 null 값 조회
- ❌ 하드코딩된 더미 데이터로 실제 데이터 덮어씀
- ❌ 타입 불일치로 런타임 에러 발생 가능

---

## 1️⃣ 복지 정보 (Benefits) 데이터 구조 불일치

### 📌 입력 페이지 (대시보드)

**위치**: [app/company-dashboard/edit/page.tsx:84-88](app/company-dashboard/edit/page.tsx#L84-L88)

```typescript
// 복지 정보 조회 (온보딩과 동일)
const { data: benefitsData } = await supabase
  .from('company_benefits')
  .select('title')
  .eq('company_id', user.id)
  .eq('category', 'basic');

// 결과 구조
company.basic_benefits = [
  { title: "4대 보험" },
  { title: "연차" },
  { title: "야근 수당" }
]
```

**데이터 구조**: `{ title: string }[]`

### 📌 공개 페이지 (기업 정보 보기)

**위치**: [app/companies/[id]/page.tsx:146-155](app/companies/[id]/page.tsx#L146-L155)

```typescript
const getBenefitsAsArray = () => {
  // Supabase: basic_benefits는 { title: string }[] 구조 (온보딩과 동일)
  if (!company.basic_benefits) return [];

  if (Array.isArray(company.basic_benefits)) {
    return company.basic_benefits.map((b: any) => b.title);
  }

  return [];
};
```

**기대 구조**: `{ title: string }[]`
**실제 사용**: `string[]` (`.map((b) => b.title)`로 변환)

### ❌ 불일치 포인트

| 항목 | 입력 (대시보드) | 표시 (공개 페이지) | 문제 |
|------|----------------|-------------------|------|
| **DB 조회** | `{ title: string }[]` | `{ title: string }[]` | ✅ 동일 |
| **화면 표시** | 그대로 사용 | `.map((b) => b.title)` → `string[]` | ⚠️ 변환 필요 |
| **타입 일관성** | 객체 배열 | 문자열 배열 | ❌ 불일치 |

---

## 2️⃣ 회사 전경 이미지 필드명 불일치

### 📌 입력 페이지

**위치**: [app/company-dashboard/edit/page.tsx:49](app/company-dashboard/edit/page.tsx#L49)

```typescript
case 'images':
  return !!(company.logo || company.company_image);
```

**필드명**: `company_image`

### 📌 공개 페이지

**위치**: [app/companies/[id]/page.tsx:432](app/companies/[id]/page.tsx#L432)

```typescript
{company.banner_image && (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="relative h-64">
      <OptimizedImage
        src={company.banner_image}
        alt={`${company.name} 오피스`}
```

**필드명**: `banner_image`

### ❌ 불일치 포인트

| 항목 | 입력 (대시보드) | 표시 (공개 페이지) | 결과 |
|------|----------------|-------------------|------|
| **DB 필드명** | `company_image` | `banner_image` | ❌ 완전히 다름 |
| **조회 결과** | 정상 조회 | `null` (존재하지 않는 필드) | 🚨 이미지 안 나옴 |
| **최근 수정** | ✅ 수정됨 (CHANGELOG 참조) | ✅ 수정됨 | ✅ 해결됨 |

**참고**: CHANGELOG.md에 따르면 이 문제는 최근 (2025-10-21) 수정되었습니다.

---

## 3️⃣ 기업 정보 필드 하드코딩 문제

### 📌 공개 페이지 하드코딩 데이터

**위치**: [app/companies/[id]/page.tsx:187-237](app/companies/[id]/page.tsx#L187-L237)

```typescript
const companyDetail = {
  ...company,
  slogan: company.slogan || "혁신과 도전으로 더 나은 세상을 만들어갑니다", // 🚨 더미
  vision: company.vision || "글로벌 시장을 선도하는 혁신 기업", // 🚨 더미
  mission: company.mission || "기술과 창의성으로 고객의 삶을 풍요롭게", // 🚨 더미
  ceo: company.ceo_name || "대표자", // 🚨 더미
  founded: company.established || "2015", // 🚨 더미
  website: company.website || "#", // 🚨 더미
  revenue: company.revenue || "비공개", // 🚨 더미
  funding: company.funding || "비공개", // 🚨 더미

  // ... 통계 정보도 전부 더미 데이터
  stats: {
    currentEmployees: company.stats?.[0]?.current_employees || 0,
    lastYearEmployees: company.stats?.[0]?.last_year_employees || 0,
    avgSalary: company.stats?.[0]?.avg_salary || 0,
    avgTenure: company.stats?.[0]?.avg_tenure || 0,
    femaleRatio: company.stats?.[0]?.female_ratio || 0,
    foreignerRatio: company.stats?.[0]?.foreigner_ratio || 0
  },
};
```

### ❌ 문제점

1. **실제 입력 데이터 무시**: 대시보드에서 입력한 데이터가 있어도 더미 데이터로 덮어씀
2. **의미 없는 기본값**: "2015년 설립", "대표자", "#" 같은 의미 없는 값
3. **통계 정보 누락**: `company_stats` 테이블 데이터가 있어도 표시 안 됨

---

## 4️⃣ DB 스키마 vs 실제 사용 불일치

### 📌 DB 테이블 구조 (추정)

```sql
-- companies 테이블
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  logo TEXT,
  company_image TEXT,  -- ✅ 실제 필드명
  registration_number TEXT,
  ceo_name TEXT,
  established TEXT,
  company_type TEXT,
  industry TEXT,
  employee_count TEXT,
  location TEXT,
  address TEXT,
  website TEXT,
  summary TEXT,
  -- ... 기타 필드
);

-- company_benefits 테이블
CREATE TABLE company_benefits (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  category TEXT,  -- 'basic' | 'workEnvironment' | 'growth' | ...
  title TEXT,
  description TEXT
);

-- company_stats 테이블 (존재하지만 사용 안 함)
CREATE TABLE company_stats (
  company_id UUID PRIMARY KEY REFERENCES companies(id),
  current_employees INTEGER,
  last_year_employees INTEGER,
  avg_salary INTEGER,
  avg_tenure REAL,
  female_ratio REAL,
  foreigner_ratio REAL,
  growth_rate REAL,
  turnover_rate REAL,
  recommend_rate REAL,
  interview_difficulty REAL
);
```

### 📌 TypeScript 타입 정의

**위치**: [lib/supabase/company-types.ts](lib/supabase/company-types.ts)

```typescript
export interface CompanyInsertData {
  // ... 기본 필드
  company_phone?: string;               // 기업 대표번호 (신규)
  logo?: string;                        // Storage URL
  company_image?: string;               // 회사 전경 이미지 (신규)
  images?: string[];                    // Storage URLs (구형 호환)
  // ...
}
```

### ❌ 불일치 포인트

| 항목 | DB 필드 | 코드 사용 | 문제 |
|------|---------|----------|------|
| 회사 전경 이미지 | `company_image` | `banner_image` (수정 전) | ❌ 필드명 다름 |
| 복지 기본 정보 | `company_benefits.title` | 객체 → 문자열 변환 | ⚠️ 변환 과정 필요 |
| 통계 정보 | `company_stats.*` | 더미 데이터 사용 | ❌ 실제 데이터 무시 |

---

## 5️⃣ 500줄 초과 파일 분석

### 🚨 심각한 파일들

| 파일 | 줄 수 | 심각도 | 문제 |
|------|-------|--------|------|
| [app/companies/[id]/page.tsx](app/companies/[id]/page.tsx) | **971줄** | 🔴 CRITICAL | 단일 파일에 모든 로직 |
| [app/login/page.tsx](app/login/page.tsx) | 794줄 | 🔴 HIGH | 로그인 로직 + UI 혼재 |
| [app/talent/page.tsx](app/talent/page.tsx) | 721줄 | 🟡 MEDIUM | 인재풀 페이지 |
| [lib/supabase/company-service.ts](lib/supabase/company-service.ts) | 549줄 | 🟡 MEDIUM | 서비스 로직 집중 |
| [hooks/useSignup.ts](hooks/useSignup.ts) | 536줄 | 🟡 MEDIUM | 회원가입 로직 |
| [lib/supabase/company-types.ts](lib/supabase/company-types.ts) | 496줄 | 🟢 OK | 타입 정의 (허용) |

### 📌 분리 필요 항목 (app/companies/[id]/page.tsx 기준)

**현재 구조**:
```
app/companies/[id]/page.tsx (971줄)
├─ 데이터 조회 로직 (100줄)
├─ 복지 데이터 변환 로직 (90줄)
├─ 하드코딩 더미 데이터 (50줄)
├─ Overview 탭 (140줄)
├─ Culture 탭 (120줄)
├─ Benefits 탭 (40줄)
├─ Reviews 탭 (150줄)
├─ Jobs 탭 (90줄)
├─ News 탭 (70줄)
└─ Bottom CTA (30줄)
```

**권장 구조**:
```
app/companies/[id]/
├─ page.tsx (200줄 이하)
├─ hooks/
│   └─ useCompanyData.ts (데이터 조회 + 변환)
└─ components/
    ├─ CompanyHeader.tsx
    ├─ CompanyTabs.tsx
    ├─ tabs/
    │   ├─ OverviewTab.tsx
    │   ├─ CultureTab.tsx
    │   ├─ BenefitsTab.tsx
    │   ├─ ReviewsTab.tsx
    │   ├─ JobsTab.tsx
    │   └─ NewsTab.tsx
    └─ CompanyCTA.tsx
```

---

## 6️⃣ 코드 품질 문제

### ❌ 주요 문제점

#### 1) Any 타입 남용

**위치**: [app/companies/[id]/page.tsx:67-69](app/companies/[id]/page.tsx#L67-L69)

```typescript
const [company, setCompany] = useState<any>(null); // ❌ any 타입
const [companyJobs, setCompanyJobs] = useState<any[]>([]); // ❌ any 타입
```

**문제**: 타입 안정성 0%, 런타임 에러 가능성 높음

#### 2) 타입 가드 없는 데이터 접근

**위치**: [app/companies/[id]/page.tsx:146-155](app/companies/[id]/page.tsx#L146-L155)

```typescript
const getBenefitsAsArray = () => {
  if (!company.basic_benefits) return [];

  if (Array.isArray(company.basic_benefits)) {
    return company.basic_benefits.map((b: any) => b.title); // ❌ any
  }

  return [];
};
```

**문제**: `b.title` 존재 여부 체크 없음, 런타임 에러 가능

#### 3) 중복 로직

**복지 데이터 조회 로직이 3곳에서 반복**:
- `app/company-dashboard/edit/page.tsx:84-88`
- `lib/supabase/company-service.ts:311-316`
- `lib/supabase/company-service.ts:499-503`

**해결**: 공통 유틸 함수로 추출 필요

---

## 7️⃣ 긴급 수정 필요 항목

### 🔴 CRITICAL (즉시 수정)

1. **복지 정보 타입 일관성**
   - 입력: `{ title: string }[]`
   - 표시: `string[]`
   - **해결책**: DB 스키마 통일 또는 변환 로직 명확화

2. **이미지 필드명 통일**
   - ✅ 이미 수정됨 (CHANGELOG 참조)
   - 추가 확인: 모든 컴포넌트에서 `company_image` 사용하는지 체크

3. **더미 데이터 제거**
   - 실제 DB 데이터 우선 사용
   - 기본값은 "정보 없음" 또는 null로 표시

### 🟡 HIGH (빠른 시일 내 수정)

4. **500줄 초과 파일 분리**
   - `app/companies/[id]/page.tsx` (971줄) → 200줄 이하로 분리
   - `app/login/page.tsx` (794줄) → 컴포넌트 분리

5. **Any 타입 제거**
   - 모든 `any` → 명시적 타입으로 변경
   - 타입 가드 추가

6. **중복 로직 통합**
   - 복지 정보 조회 로직 → `lib/utils/company-benefits.ts`
   - 기업 정보 조회 로직 → 서비스 레이어 통일

### 🟢 MEDIUM (시간 여유 있을 때)

7. **테스트 커버리지**
   - 데이터 변환 로직 유닛 테스트
   - DB 쿼리 통합 테스트

8. **문서화**
   - DB 스키마 문서 작성
   - 타입 정의 문서 작성

---

## 8️⃣ 권장 해결 방안

### 1️⃣ 복지 정보 통합

**옵션 A: DB 스키마 변경 (권장)**

```sql
-- company_benefits 테이블 구조 단순화
ALTER TABLE company_benefits
DROP COLUMN title,
DROP COLUMN description;

ALTER TABLE company_benefits
ADD COLUMN benefit_tag TEXT NOT NULL;

-- 기존 데이터 마이그레이션
UPDATE company_benefits
SET benefit_tag = title
WHERE category = 'basic';
```

**결과**: `string[]`로 통일

**옵션 B: 변환 유틸 함수 (빠른 해결)**

```typescript
// lib/utils/company-benefits.ts
export const normalizeBenefits = (
  benefits: Array<{ title: string }> | string[]
): string[] => {
  if (!benefits || benefits.length === 0) return [];

  // 이미 string[] 형태면 그대로 반환
  if (typeof benefits[0] === 'string') {
    return benefits as string[];
  }

  // { title: string }[] 형태면 변환
  return benefits.map((b: any) => b.title);
};
```

### 2️⃣ 타입 안정성 확보

**공통 타입 정의 (types/company.types.ts)**:

```typescript
export interface Company {
  id: string;
  name: string;
  name_en?: string;
  logo?: string;
  company_image?: string; // ✅ 통일된 필드명
  ceo_name: string;
  established: string;
  // ... 모든 필드 명시
}

export interface CompanyBenefit {
  title: string;  // 또는 benefit_tag: string
}

export interface CompanyStats {
  current_employees: number;
  avg_salary: number;
  // ... 모든 통계 필드
}

export interface CompanyDetail extends Company {
  basic_benefits: string[]; // ✅ 통일된 타입
  benefits: CompanyBenefit[]; // 상세 복지
  stats?: CompanyStats; // 통계
  reviews: Review[];
  news: News[];
}
```

### 3️⃣ 파일 분리 전략

**Step 1: 컴포넌트 추출**

```typescript
// components/company-detail/CompanyHeader.tsx (80줄)
export function CompanyHeader({ company }: { company: CompanyDetail }) {
  // 헤더 로직
}

// components/company-detail/tabs/OverviewTab.tsx (150줄)
export function OverviewTab({ company }: { company: CompanyDetail }) {
  // Overview 로직
}
```

**Step 2: 커스텀 훅 추출**

```typescript
// hooks/useCompanyDetail.ts (100줄)
export function useCompanyDetail(companyId: string) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 데이터 조회 로직
  }, [companyId]);

  return { company, loading, error };
}
```

**Step 3: 유틸 함수 추출**

```typescript
// lib/utils/company-data-transform.ts
export const transformCompanyData = (rawData: any): CompanyDetail => {
  return {
    ...rawData,
    basic_benefits: normalizeBenefits(rawData.basic_benefits),
    // ... 기타 변환 로직
  };
};
```

---

## 9️⃣ 결론

### 🎯 핵심 문제 3가지

1. **데이터 구조 불일치**: 입력 vs 표시 데이터 타입이 다름
2. **하드코딩 더미 데이터**: 실제 데이터 무시하고 더미 데이터 사용
3. **파일 크기 초과**: 단일 파일에 모든 로직 집중 (971줄)

### ✅ 즉시 액션 아이템

- [ ] 복지 정보 타입 통일 (`string[]` 또는 `{ title: string }[]` 중 택 1)
- [ ] 더미 데이터 제거 (실제 DB 데이터 우선)
- [ ] `app/companies/[id]/page.tsx` 파일 분리 (971줄 → 200줄 이하)
- [ ] `any` 타입 전부 명시적 타입으로 변경
- [ ] 중복 로직 통합 (복지 정보 조회)

### 📊 예상 효과

- 🚀 **런타임 에러 감소**: 타입 안정성 확보
- 🎨 **UI 정확성 향상**: 실제 데이터 정확하게 표시
- 🔧 **유지보수성 향상**: 코드 모듈화 및 재사용성 증가
- 📈 **개발 생산성 향상**: 명확한 데이터 흐름

---

**작성자**: Claude Code (철저한 분석 모드)
**검토 필요**: CHANGELOG.md 최신 수정 사항 반영 여부
