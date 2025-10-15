# 기업 회원가입 재설계 계획서

## 📋 프로젝트 개요

### 목표
K-Work 스타일의 단일 페이지 기업 회원가입 시스템으로 전면 재구축

### 핵심 원칙
1. **기존 데이터 호환성 100% 유지**
2. **K-Work 레퍼런스와 필드 구조 동일화**
3. **회원가입 = 필수 정보만, 대시보드 = 추가 정보**
4. **법적 검증 강화** (약관, 사업자등록증, 본인인증 준비)

---

## 🎯 변경 사항 요약

### 1. 회원가입 페이지 구조 변경

#### Before (현재)
```
회원가입 (이메일/비밀번호만)
  ↓
5단계 온보딩
  Step 1: 기본 정보
  Step 2: 위치 정보
  Step 3: 회사 소개
  Step 4: 기술 스택 & 복지
  Step 5: 채용 담당자
  ↓
대시보드
```

#### After (재설계)
```
회원가입 (단일 긴 폼 - 필수 정보만)
  - 사업자 정보
  - 기업 기본 정보
  - 담당자 정보
  - 주소 정보
  - 서류 첨부
  - 약관 동의
  ↓
대시보드 (추가 정보 입력 가능)
  - 회사 소개 (description, slogan, vision, mission)
  - 배너 이미지
  - 기술 스택
  - 상세 복지 정보
  - 비즈니스 정보 (매출, 투자)
  - 추가 오피스
```

### 2. 필수 vs 선택 항목 재분류

#### 필수 항목 (회원가입 시)
1. 사업자등록번호 (숫자만, 10자리)
2. 기업명 (한글)
3. 설립년도 (YYYY)
4. 대표자명
5. 기업형태 (개인사업자/법인/외국계법인)
6. 기업규모 (직원수)
7. 주소 (주소검색 + 상세주소)
8. 홈페이지
9. 복지 (최소 1개)
10. 담당부서
11. 담당자명
12. 이메일
13. 비밀번호
14. 비밀번호 확인
15. **5개 약관 동의 (모두 필수)**

#### 선택 항목 (회원가입 시)
1. 기업명 영문
2. 요약소개글 (간단한 소개)
3. 업태
4. 대표번호
5. 로고
6. 기업 이미지 (전경 등)

#### 대시보드에서 추가 입력 가능
1. 회사 상세 소개 (description)
2. 슬로건
3. 비전
4. 미션
5. 배너 이미지
6. 기술 스택 (다중)
7. 상세 복지 정보 (카테고리별)
8. 연간 매출
9. 투자 현황
10. 평균 연봉
11. 평균 근속
12. 추가 오피스

---

## 📐 데이터 구조 설계

### 1. Firestore companies 컬렉션 스키마 (최종)

```typescript
{
  // ===== 회원가입 시 수집 (필수) =====
  uid: string                          // Firebase Auth UID
  email: string                        // 이메일 (로그인용)

  // 사업자 정보
  registrationNumber: string           // 사업자등록번호 (10자리 숫자)
  registrationDocument?: string        // 사업자등록증 URL (Cloudinary/Storage)

  // 기업 기본 정보
  name: string                         // 기업명 (한글, 필수)
  nameEn?: string                      // 기업명 (영문, 선택)
  established: string                  // 설립년도 (YYYY)
  ceoName: string                      // 대표자명
  companyType: string                  // 기업형태 (필수)
  industry?: string                    // 업태 (선택)
  employeeCount: string                // 기업규모 (필수)

  // 연락처
  phone?: string                       // 대표번호 (선택)
  website: string                      // 홈페이지 (필수)

  // 주소
  location: string                     // 주소 (필수)
  address: string                      // 상세주소 (필수)

  // 이미지
  logo?: string                        // 로고 (선택)
  images?: string[]                    // 기업 이미지 (선택)

  // 복지 (최소 1개 필수)
  basicBenefits: string[]              // 간단한 복지 목록

  // 담당자 정보
  managerDepartment: string            // 담당부서 (필수)
  managerName: string                  // 담당자명 (필수)
  managerPosition?: string             // 담당자 직책
  managerPhone?: string                // 담당자 연락처

  // ===== 대시보드에서 추가 입력 (선택) =====
  // 회사 소개
  summary?: string                     // 요약소개글 (회원가입 시 선택)
  description?: string                 // 상세 소개 (대시보드)
  slogan?: string                      // 슬로건
  vision?: string                      // 비전
  mission?: string                     // 미션
  bannerImage?: string                 // 배너 이미지

  // 기술 & 복지
  techStack?: string[]                 // 기술 스택
  benefits?: CompanyBenefits           // 상세 복지 (카테고리별)

  // 비즈니스 정보
  revenue?: string                     // 매출
  funding?: string                     // 투자

  // 통계
  stats?: CompanyStats                 // 평균 연봉, 근속 등

  // 채용 담당자 (복수)
  recruiters?: CompanyRecruiter[]      // 대시보드에서 추가

  // 추가 오피스
  offices?: CompanyOffice[]            // 대시보드에서 추가

  // ===== 시스템 필드 =====
  createdAt: Timestamp
  updatedAt: Timestamp
  status: 'pending' | 'active' | 'suspended'
  profileCompleted: boolean            // 회원가입 완료 시 true
  additionalInfoCompleted?: boolean    // 대시보드 추가 정보 완료 여부
}
```

### 2. 필드 매핑 (기존 → 신규)

| 기존 필드 | 신규 필드 | 변경 사항 |
|----------|----------|----------|
| name | name | 동일 |
| nameEn | nameEn | 필수 → 선택 |
| registrationNumber | registrationNumber | 형식 변경 (123-45-67890 → 1234567890) |
| - | registrationDocument | **신규 추가** |
| established | established | 동일 |
| ceoName | ceoName | 동일 |
| - | companyType | **신규 추가** (필수) |
| industry | industry | 동일 (업종 → 업태) |
| employeeCount | employeeCount | 동일 |
| phone | phone | 필수 → 선택 |
| website | website | 선택 → 필수 |
| location | location | 동일 |
| address | address | 동일 |
| logo | logo | 동일 |
| - | images | **신규 추가** |
| - | basicBenefits | **신규 추가** (필수) |
| - | managerDepartment | **신규 추가** (필수) |
| - | managerName | **신규 추가** (필수) |
| - | managerPosition | **신규 추가** (선택) |
| - | managerPhone | **신규 추가** (선택) |
| - | summary | **신규 추가** (선택) |
| description | description | 필수 → 선택 (대시보드) |
| slogan | slogan | 온보딩 → 대시보드 |
| vision | vision | 온보딩 → 대시보드 |
| mission | mission | 온보딩 → 대시보드 |
| bannerImage | bannerImage | 온보딩 → 대시보드 |
| techStack | techStack | 필수 → 선택 (대시보드) |
| benefits | benefits | 구조 변경 (기본/상세 분리) |
| recruiters | recruiters | Step5 → 대시보드 |
| offices | offices | Step2 → 대시보드 |

---

## 🎨 UI/UX 설계

### 회원가입 페이지 레이아웃

```
┌─────────────────────────────────────────────────┐
│  GlobalTalent 로고                               │
│  기업 회원가입                                    │
│  * 표시는 필수 항목입니다                          │
├─────────────────────────────────────────────────┤
│  [1] 사업자 정보                                  │
│  ├─ 사업자등록번호 * (숫자만, 10자리)              │
│  ├─ 기업명 * (한글)                               │
│  ├─ 기업명 (영문, 선택)                           │
│  ├─ 설립년도 * (YYYY)                            │
│  ├─ 대표자명 *                                    │
│  └─ 사업자등록증 첨부 * (PDF/이미지)               │
├─────────────────────────────────────────────────┤
│  [2] 기업 기본 정보                               │
│  ├─ 기업형태 * (선택)                             │
│  ├─ 업태 (선택)                                   │
│  ├─ 기업규모 * (직원수 선택)                       │
│  ├─ 대표번호 (선택)                               │
│  ├─ 홈페이지 *                                    │
│  └─ 요약소개글 (선택, 100자 이내)                  │
├─────────────────────────────────────────────────┤
│  [3] 이미지                                       │
│  ├─ 기업 로고 (선택)                              │
│  └─ 기업 이미지 (선택, 최대 3개)                   │
├─────────────────────────────────────────────────┤
│  [4] 복지 정보                                    │
│  └─ 주요 복지 * (최소 1개, 태그 입력)              │
├─────────────────────────────────────────────────┤
│  [5] 담당자 정보                                  │
│  ├─ 담당부서 *                                    │
│  ├─ 담당자명 *                                    │
│  ├─ 담당자 직책 (선택)                            │
│  └─ 담당자 연락처 (선택)                          │
├─────────────────────────────────────────────────┤
│  [6] 주소 정보                                    │
│  ├─ 주소 * (주소검색 버튼)                         │
│  └─ 상세주소 *                                    │
├─────────────────────────────────────────────────┤
│  [7] 계정 정보                                    │
│  ├─ 이메일 *                                      │
│  ├─ 비밀번호 * (8자 이상)                         │
│  └─ 비밀번호 확인 *                               │
├─────────────────────────────────────────────────┤
│  [8] 약관 동의                                    │
│  ├─ [✓] 전체 동의                                │
│  ├─ [✓] (필수) 서비스 이용약관                     │
│  ├─ [✓] (필수) 개인정보 수집 및 이용               │
│  ├─ [✓] (필수) 기업정보 수집·이용·제공·조회         │
│  ├─ [✓] (필수) 공공기관 신용정보 제공·조회          │
│  ├─ [✓] (필수) 행정정보 공동이용                   │
│  └─ [ ] (선택) 마케팅 정보 수신 동의               │
├─────────────────────────────────────────────────┤
│  [회원가입 완료] 버튼                              │
└─────────────────────────────────────────────────┘
```

### 기업 대시보드 - 추가 정보 입력 섹션

```
┌─────────────────────────────────────────────────┐
│  기업 대시보드                                     │
├─────────────────────────────────────────────────┤
│  📊 프로필 완성도: 65% ▓▓▓▓▓▓▓░░░                 │
│  추가 정보를 입력하여 프로필을 완성하세요!           │
├─────────────────────────────────────────────────┤
│  [추가 정보 입력] 섹션                             │
│                                                  │
│  ┌───────────────────────────────┐              │
│  │ 회사 소개 작성 ▶                │              │
│  │ - 상세 소개, 슬로건, 비전, 미션   │              │
│  └───────────────────────────────┘              │
│                                                  │
│  ┌───────────────────────────────┐              │
│  │ 기술 스택 등록 ▶                │              │
│  │ - 사용 중인 기술 스택 추가       │              │
│  └───────────────────────────────┘              │
│                                                  │
│  ┌───────────────────────────────┐              │
│  │ 상세 복지 정보 ▶                │              │
│  │ - 카테고리별 복지 상세 입력      │              │
│  └───────────────────────────────┘              │
│                                                  │
│  ┌───────────────────────────────┐              │
│  │ 비즈니스 정보 ▶                 │              │
│  │ - 매출, 투자, 연봉, 근속        │              │
│  └───────────────────────────────┘              │
│                                                  │
│  ┌───────────────────────────────┐              │
│  │ 채용 담당자 추가 ▶              │              │
│  │ - 복수 담당자 등록 가능         │              │
│  └───────────────────────────────┘              │
└─────────────────────────────────────────────────┘
```

---

## 🔧 구현 계획

### Phase 1: 타입 및 데이터 구조 (1일차)

#### 1.1 타입 정의 재설계
**파일**: `lib/firebase/company-types.ts`

```typescript
// 신규 타입 추가
export type CompanyType =
  | 'individual'      // 개인사업자
  | 'corporation'     // 법인
  | 'foreign';        // 외국계법인

export type BusinessType =
  | 'manufacturing'   // 제조업
  | 'wholesale'       // 도소매업
  | 'service'         // 서비스업
  | 'it'             // IT/정보통신
  | 'finance'        // 금융업
  | 'construction'   // 건설업
  | 'other';         // 기타

// 회원가입 폼 데이터
export interface CompanySignupFormData {
  // 사업자 정보
  registrationNumber: string;          // 10자리 숫자
  name: string;
  nameEn?: string;
  established: string;                 // YYYY
  ceoName: string;
  registrationDocument?: File;         // PDF/이미지

  // 기업 기본 정보
  companyType: CompanyType;            // 필수
  industry?: BusinessType;
  employeeCount: string;
  phone?: string;
  website: string;                     // 필수
  summary?: string;                    // 100자 이내

  // 이미지
  logo?: File;
  images?: File[];

  // 복지
  basicBenefits: string[];             // 최소 1개

  // 담당자
  managerDepartment: string;
  managerName: string;
  managerPosition?: string;
  managerPhone?: string;

  // 주소
  location: string;
  address: string;

  // 계정
  email: string;
  password: string;
  confirmPassword: string;

  // 약관
  agreeAll: boolean;
  agreeTerms: boolean;                 // 필수
  agreePrivacy: boolean;               // 필수
  agreeCompanyInfo: boolean;           // 필수
  agreePublicInfo: boolean;            // 필수
  agreeAdminInfo: boolean;             // 필수
  agreeMarketing: boolean;             // 선택
}

// 대시보드 추가 정보
export interface CompanyAdditionalInfo {
  description?: string;
  slogan?: string;
  vision?: string;
  mission?: string;
  bannerImage?: string;
  techStack?: string[];
  benefits?: CompanyBenefits;
  revenue?: string;
  funding?: string;
  stats?: CompanyStats;
  recruiters?: CompanyRecruiter[];
  offices?: CompanyOffice[];
}
```

#### 1.2 유효성 검증 함수
```typescript
// 사업자등록번호 검증 (10자리 숫자)
export const validateBusinessNumber = (num: string): boolean => {
  return /^\d{10}$/.test(num);
};

// 전화번호 검증 (하이픈 없이 7~11자리)
export const validatePhone = (phone: string): boolean => {
  return /^\d{7,11}$/.test(phone);
};

// 홈페이지 URL 검증
export const validateWebsite = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

### Phase 2: 약관 컴포넌트 (1일차)

#### 2.1 약관 데이터 파일
**파일**: `constants/company-terms.ts`

```typescript
export const COMPANY_TERMS = {
  serviceTerms: {
    title: '서비스 이용약관',
    required: true,
    content: `
      [GlobalTalent 서비스 이용약관]

      제1조 (목적)
      본 약관은 GlobalTalent가 운영하는 외국인 구직자 매칭 플랫폼...

      [전체 약관 내용 - TERMS_OF_SERVICE.md 기반]
    `
  },
  privacyTerms: {
    title: '개인정보 수집 및 이용 동의',
    required: true,
    content: `...`
  },
  companyInfoTerms: {
    title: '기업(신용)정보 수집·이용·제공·조회 동의',
    required: true,
    content: `
      [K-Work 약관 기반, GlobalTalent로 수정]

      1. 기업정보 수집·이용
      2. 기업정보 조회
      3. 기업정보 제3자 제공
    `
  },
  publicInfoTerms: {
    title: '공공기관 신용정보 제공·조회 동의',
    required: true,
    content: `...`
  },
  adminInfoTerms: {
    title: '행정정보 공동이용 동의',
    required: true,
    content: `...`
  },
  marketingTerms: {
    title: '마케팅 정보 수신 동의',
    required: false,
    content: `...`
  }
};
```

#### 2.2 약관 동의 컴포넌트
**파일**: `components/company-signup/TermsAgreement.tsx`

```typescript
interface Props {
  agreements: {
    agreeAll: boolean;
    agreeTerms: boolean;
    agreePrivacy: boolean;
    agreeCompanyInfo: boolean;
    agreePublicInfo: boolean;
    agreeAdminInfo: boolean;
    agreeMarketing: boolean;
  };
  onChange: (field: string, value: boolean) => void;
  errors: Record<string, string>;
}

export default function TermsAgreement({ agreements, onChange, errors }: Props) {
  // 전체 동의 처리
  const handleAgreeAll = (checked: boolean) => {
    onChange('agreeAll', checked);
    onChange('agreeTerms', checked);
    onChange('agreePrivacy', checked);
    onChange('agreeCompanyInfo', checked);
    onChange('agreePublicInfo', checked);
    onChange('agreeAdminInfo', checked);
    onChange('agreeMarketing', checked);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">약관 동의</h3>

      {/* 전체 동의 */}
      <label className="flex items-center gap-3 p-4 border-2 border-primary-600 rounded-lg bg-primary-50">
        <input
          type="checkbox"
          checked={agreements.agreeAll}
          onChange={(e) => handleAgreeAll(e.target.checked)}
          className="w-5 h-5"
        />
        <span className="font-semibold">전체 동의</span>
      </label>

      {/* 개별 약관 */}
      {Object.entries(COMPANY_TERMS).map(([key, term]) => (
        <TermItem
          key={key}
          term={term}
          checked={agreements[`agree${capitalize(key)}`]}
          onChange={(checked) => onChange(`agree${capitalize(key)}`, checked)}
        />
      ))}

      {errors.terms && (
        <p className="text-red-500 text-sm">{errors.terms}</p>
      )}
    </div>
  );
}
```

### Phase 3: 회원가입 페이지 재구현 (2일차)

#### 3.1 회원가입 페이지 구조
**파일**: `app/signup/company/page.tsx` (완전 재작성)

```typescript
export default function CompanySignupPage() {
  const [formData, setFormData] = useState<CompanySignupFormData>({
    // 초기값
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 섹션별 유효성 검증
  const validateSection1 = () => { /* 사업자 정보 */ };
  const validateSection2 = () => { /* 기업 기본 정보 */ };
  const validateSection3 = () => { /* 이미지 */ };
  const validateSection4 = () => { /* 복지 */ };
  const validateSection5 = () => { /* 담당자 */ };
  const validateSection6 = () => { /* 주소 */ };
  const validateSection7 = () => { /* 계정 */ };
  const validateSection8 = () => { /* 약관 */ };

  const validateForm = () => {
    return validateSection1() &&
           validateSection2() &&
           validateSection3() &&
           validateSection4() &&
           validateSection5() &&
           validateSection6() &&
           validateSection7() &&
           validateSection8();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // 첫 번째 에러 필드로 스크롤
      return;
    }

    setLoading(true);

    try {
      // 1. Firebase Auth 계정 생성
      const user = await signUpWithEmail(formData.email, formData.password, 'company');

      // 2. 파일 업로드 (사업자등록증, 로고, 이미지)
      const uploadedFiles = await uploadCompanyFiles(user.uid, {
        registrationDocument: formData.registrationDocument,
        logo: formData.logo,
        images: formData.images
      });

      // 3. Firestore에 기업 정보 저장
      await createCompanyProfile(user.uid, {
        ...formData,
        registrationDocument: uploadedFiles.registrationDocument,
        logo: uploadedFiles.logo,
        images: uploadedFiles.images,
        profileCompleted: true,
        status: 'pending'  // 관리자 승인 대기
      });

      // 4. 대시보드로 이동
      router.push('/company-dashboard');

    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="mb-8">
          <h1>기업 회원가입</h1>
          <p className="text-sm text-gray-600">* 표시는 필수 항목입니다</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: 사업자 정보 */}
          <Section1BusinessInfo
            data={formData}
            onChange={setFormData}
            errors={errors}
          />

          {/* Section 2: 기업 기본 정보 */}
          <Section2CompanyInfo
            data={formData}
            onChange={setFormData}
            errors={errors}
          />

          {/* Section 3: 이미지 */}
          <Section3Images
            data={formData}
            onChange={setFormData}
            errors={errors}
          />

          {/* Section 4: 복지 정보 */}
          <Section4Benefits
            data={formData}
            onChange={setFormData}
            errors={errors}
          />

          {/* Section 5: 담당자 정보 */}
          <Section5Manager
            data={formData}
            onChange={setFormData}
            errors={errors}
          />

          {/* Section 6: 주소 정보 */}
          <Section6Address
            data={formData}
            onChange={setFormData}
            errors={errors}
          />

          {/* Section 7: 계정 정보 */}
          <Section7Account
            data={formData}
            onChange={setFormData}
            errors={errors}
          />

          {/* Section 8: 약관 동의 */}
          <Section8Terms
            agreements={formData}
            onChange={setFormData}
            errors={errors}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold"
          >
            {loading ? '회원가입 처리 중...' : '회원가입 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Phase 4: Firebase 서비스 수정 (2일차)

#### 4.1 회원가입 서비스
**파일**: `lib/firebase/company-service.ts`

```typescript
// 신규 함수: 회원가입 시 모든 정보 한 번에 저장
export const createCompanyProfile = async (
  uid: string,
  data: CompanySignupFormData & {
    registrationDocument?: string;
    logo?: string;
    images?: string[];
  }
) => {
  const companyData = {
    uid,
    email: data.email,

    // 사업자 정보
    registrationNumber: data.registrationNumber,
    registrationDocument: data.registrationDocument,
    name: data.name,
    nameEn: data.nameEn,
    established: data.established,
    ceoName: data.ceoName,

    // 기업 정보
    companyType: data.companyType,
    industry: data.industry,
    employeeCount: data.employeeCount,
    phone: data.phone,
    website: data.website,
    summary: data.summary,

    // 이미지
    logo: data.logo,
    images: data.images,

    // 복지
    basicBenefits: data.basicBenefits,

    // 담당자
    managerDepartment: data.managerDepartment,
    managerName: data.managerName,
    managerPosition: data.managerPosition,
    managerPhone: data.managerPhone,

    // 주소
    location: data.location,
    address: data.address,

    // 시스템
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    profileCompleted: true,
    additionalInfoCompleted: false,
    status: 'pending'  // 관리자 승인 대기
  };

  await setDoc(doc(db, 'companies', uid), companyData);
};

// 기존 데이터와의 호환성 유지
export const getCompanyProfile = async (uid: string) => {
  const docRef = doc(db, 'companies', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  // 기존 데이터 변환 (하위 호환성)
  return {
    ...data,
    // 기존 필드가 없으면 기본값 설정
    companyType: data.companyType || 'corporation',
    basicBenefits: data.basicBenefits || [],
    managerDepartment: data.managerDepartment || '',
    managerName: data.managerName || '',
  };
};
```

### Phase 5: 대시보드 추가 정보 입력 (3일차)

#### 5.1 대시보드 추가 정보 섹션
**파일**: `app/company-dashboard/additional-info/page.tsx`

```typescript
export default function AdditionalInfoPage() {
  // 기존 Step3, Step4 컴포넌트 재사용
  // 회사 소개, 기술 스택, 상세 복지, 비즈니스 정보 등

  return (
    <div>
      <h1>추가 정보 입력</h1>
      <p>더 많은 정보를 입력하여 프로필 완성도를 높이세요!</p>

      {/* 프로필 완성도 표시 */}
      <ProfileCompletionBar percentage={calculateCompletion()} />

      {/* 추가 정보 입력 섹션들 */}
      <AdditionalInfoSections />
    </div>
  );
}
```

### Phase 6: 마이그레이션 및 호환성 (3일차)

#### 6.1 기존 데이터 마이그레이션 스크립트
**파일**: `scripts/migrate-company-data.ts`

```typescript
// 기존 companies 문서에 신규 필드 추가
// 기본값으로 채우기

async function migrateCompanyData() {
  const companiesRef = collection(db, 'companies');
  const snapshot = await getDocs(companiesRef);

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const updates: any = {};

    // 신규 필수 필드에 기본값 설정
    if (!data.companyType) {
      updates.companyType = 'corporation';  // 기본값
    }

    if (!data.basicBenefits) {
      // benefits에서 추출하거나 빈 배열
      updates.basicBenefits = extractBasicBenefits(data.benefits) || [];
    }

    if (!data.managerDepartment) {
      // recruiters에서 추출하거나 기본값
      updates.managerDepartment = data.recruiters?.[0]?.position || 'HR팀';
    }

    if (!data.managerName) {
      updates.managerName = data.recruiters?.[0]?.name || '';
    }

    if (!data.website) {
      updates.website = '';  // 수동 입력 필요
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc.ref, updates);
      console.log(`Migrated: ${doc.id}`);
    }
  }
}
```

---

## 🧪 테스트 계획

### 1. 단위 테스트
- [ ] 유효성 검증 함수 테스트
- [ ] 파일 업로드 테스트
- [ ] Firebase 서비스 함수 테스트

### 2. 통합 테스트
- [ ] 회원가입 플로우 E2E
- [ ] 약관 동의 체크 검증
- [ ] 파일 업로드 및 저장 검증
- [ ] 대시보드 추가 정보 입력 검증

### 3. 호환성 테스트
- [ ] 기존 기업 계정 로그인
- [ ] 기존 데이터 읽기/쓰기
- [ ] 마이그레이션 스크립트 실행

### 4. UI/UX 테스트
- [ ] 반응형 레이아웃
- [ ] 에러 메시지 표시
- [ ] 로딩 상태 표시
- [ ] 약관 모달 동작

---

## ⚠️ 주의사항 및 리스크

### 1. 데이터 호환성
- **리스크**: 기존 기업 계정이 로그인 불가하거나 데이터 손실
- **대응**:
  - 마이그레이션 스크립트 철저한 테스트
  - 기존 필드 절대 삭제 금지
  - 신규 필드는 선택적으로 추가
  - getCompanyProfile에서 하위 호환성 처리

### 2. 필수 항목 누락
- **리스크**: 기존 계정이 신규 필수 항목 없어서 에러
- **대응**:
  - 기존 계정에 대해서는 필수 검증 완화
  - 대시보드에서 부족한 정보 입력 유도
  - profileCompleted 플래그로 구분

### 3. 온보딩 시스템 충돌
- **리스크**: 기존 5단계 온보딩과 신규 회원가입 동시 존재
- **대응**:
  - 온보딩 페이지는 유지하되, 회원가입 후 리다이렉트 변경
  - 또는 온보딩을 대시보드 추가 정보 입력으로 통합

### 4. 파일 업로드 크기
- **리스크**: 사업자등록증, 이미지 등 대용량 파일
- **대응**:
  - Cloudinary 또는 Firebase Storage 사용
  - 파일 크기 제한 (5MB)
  - 이미지 자동 리사이징

---

## 📅 구현 일정

### Day 1
- [x] 전체 설계 문서 작성
- [ ] 타입 정의 재설계
- [ ] 약관 데이터 작성
- [ ] 약관 컴포넌트 구현

### Day 2
- [ ] 회원가입 페이지 UI 구현
- [ ] 섹션별 컴포넌트 작성
- [ ] Firebase 서비스 수정
- [ ] 파일 업로드 기능

### Day 3
- [ ] 대시보드 추가 정보 섹션
- [ ] 마이그레이션 스크립트
- [ ] 기존 데이터 호환성 테스트
- [ ] 통합 테스트

### Day 4
- [ ] 버그 수정
- [ ] UI/UX 개선
- [ ] 전체 QA
- [ ] 배포

---

## ✅ 체크리스트

### 필수 구현 사항
- [ ] 사업자등록번호 숫자만 입력 (10자리)
- [ ] 전화번호 하이픈 제외 입력
- [ ] '* 표시는 필수 항목입니다' 문구 추가
- [ ] 복지 최소 1개 입력 검증
- [ ] 5개 약관 동의 체크박스
- [ ] 사업자등록증 PDF 업로드
- [ ] 주소 검색 기능 (Daum Postcode API)
- [ ] 기존 데이터와 100% 호환
- [ ] 대시보드 추가 정보 입력 섹션

### 선택 구현 사항
- [ ] 본인인증 API 연동 (추후)
- [ ] 사업자번호 검증 API (추후)
- [ ] 관리자 승인 워크플로우 (추후)

---

## 🎯 성공 기준

1. ✅ 회원가입 시 K-Work와 동일한 필드 수집
2. ✅ 기존 기업 계정이 정상 작동
3. ✅ 약관 동의 법적 요건 충족
4. ✅ 사업자등록증 파일 업로드 및 저장
5. ✅ 대시보드에서 추가 정보 입력 가능
6. ✅ 프로필 완성도 표시

---

이 문서는 구현 과정에서 지속적으로 업데이트됩니다.
