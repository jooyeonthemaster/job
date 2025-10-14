# 기업 데이터 구조 분석 보고서

## 📊 전체 데이터 구조 비교

### 1. 타입 정의 (`company-types.ts`)

#### CompanyProfile 인터페이스
```typescript
- uid, email, name, nameEn, registrationNumber
- ceoName (대표자명)
- established (설립년도)
- industry, employeeCount, phone, website
- location, address
- logo, bannerImage
- description, slogan, vision, mission
- revenue, funding
- techStack: string[]
- benefits: CompanyBenefits (객체)
- stats: CompanyStats (객체)
- rating, reviewCount, openPositions (자동 계산)
- recruiters: CompanyRecruiter[]
- offices: CompanyOffice[]
```

---

## 🔴 발견된 불일치 사항

### **심각도: 높음 (데이터 손실)**

#### 1. **Step4Benefits에서 수집하지만 저장 안 됨** ❌
```typescript
// Step4Benefits.tsx에서 입력받음
revenue?: string;
funding?: string;
avgSalary?: number;
avgTenure?: number;

// 하지만 saveOnboardingStep4()에서는...
const { revenue, funding, avgSalary, avgTenure, ...step4Data } = formData;
await saveOnboardingStep4(uid, step4Data);
// ⚠️ revenue, funding, avgSalary, avgTenure는 버려짐!
// TODO 주석 발견: "비즈니스 정보도 저장하는 로직 추가 필요"
```

**영향:** 사용자가 입력한 매출, 펀딩, 평균 연봉 정보가 **저장되지 않음**

---

#### 2. **타입 정의 불일치**
```typescript
// OnboardingStep4 타입에는 없음
revenue, funding, avgSalary, avgTenure

// 하지만 Step4Benefits에서는 ExtendedOnboardingStep4로 사용
interface ExtendedOnboardingStep4 extends OnboardingStep4 {
  revenue?: string;
  funding?: string;
  avgSalary?: number;
  avgTenure?: number;
}
```

**영향:** 타입 정의와 실제 구현이 불일치

---

### **심각도: 중간 (표시만 됨)**

#### 3. **상세 페이지에서만 사용되는 필드 (수집 안 됨)**
```typescript
// app/companies/[id]/page.tsx에서 표시하려 함
reviews: any[]           ❌ 수집 안 됨 (목업)
news: any[]              ❌ 수집 안 됨 (목업)
culture: {               ❌ 수집 안 됨 (목업)
  values: any[]
  perks: string[]
}
coreValues: any[]        ❌ 수집 안 됨
```

**영향:** 항상 빈 배열이거나 기본값만 표시됨

---

#### 4. **필드명 불일치**
```typescript
// 타입 정의
ceoName: string
established: string

// 상세 페이지에서 사용
company.ceo             ❌ (ceoName으로 접근해야 함)
company.founded         ❌ (established로 접근해야 함)
company.homepage        ❌ (website로 접근해야 함)
```

**현재 상태:** Fallback으로 처리 중
```typescript
ceo: company.ceo || company.ceoName || "대표자"
founded: company.established || company.foundedYear || "2015"
```

---

#### 5. **stats 객체 구조 불일치**
```typescript
// CompanyStats 타입
stats?: {
  currentEmployees, lastYearEmployees, avgSalary, avgTenure,
  femaleRatio, foreignerRatio, growthRate, turnoverRate,
  recommendRate, interviewDifficulty
}

// 상세 페이지에서 접근
company.stats?.avgSalary          ✅ OK
company.stats.currentEmployees    ✅ OK
company.growthRate                ⚠️ 최상위에서도 접근 시도
company.recommendRate             ⚠️ 최상위에서도 접근 시도
```

---

## ✅ 올바르게 동작하는 부분

#### 1. **기본 정보 (Step1)**
```typescript
✅ name, nameEn, registrationNumber
✅ ceoName, established, industry, employeeCount
✅ phone, website
```

#### 2. **위치 정보 (Step2)**
```typescript
✅ location, address
✅ offices (선택)
```

#### 3. **회사 소개 (Step3)**
```typescript
✅ description, slogan, vision, mission
✅ logo, bannerImage (Cloudinary URL)
```

#### 4. **기술 스택 (Step4)**
```typescript
✅ techStack: string[]
```

#### 5. **복지 정보 (Step4)**
```typescript
✅ benefits: CompanyBenefits {
     workEnvironment, growth, healthWelfare, compensation
   }
```

#### 6. **채용 담당자 (Step5)**
```typescript
✅ recruiters: CompanyRecruiter[]
```

---

## 🔧 필요한 수정사항

### 우선순위 1: 데이터 손실 방지

#### `lib/firebase/company-service.ts`
```typescript
// saveOnboardingStep4 수정
export const saveOnboardingStep4 = async (uid: string, data: any) => {
  await updateDoc(doc(db, 'companies', uid), {
    techStack: data.techStack,
    benefits: data.benefits,
    revenue: data.revenue,           // ✅ 추가
    funding: data.funding,           // ✅ 추가
    stats: {                         // ✅ 추가
      avgSalary: data.avgSalary,
      avgTenure: data.avgTenure
    },
    updatedAt: Timestamp.now()
  });
};
```

#### `lib/firebase/company-types.ts`
```typescript
// OnboardingStep4에 필드 추가
export interface OnboardingStep4 {
  techStack: string[];
  benefits: CompanyBenefits;
  revenue?: string;              // ✅ 추가
  funding?: string;              // ✅ 추가
  avgSalary?: number;            // ✅ 추가
  avgTenure?: number;            // ✅ 추가
}
```

---

### 우선순위 2: 미수집 필드 처리

#### 옵션 A: 수집 기능 추가 (권장)
- reviews: 별도 리뷰 시스템 구현 필요
- news: 별도 뉴스 관리 시스템 필요
- culture: 온보딩에 기업 문화 입력 단계 추가

#### 옵션 B: 표시 제거
- 현재처럼 빈 상태 메시지 표시
- "준비 중" 또는 "데이터 없음" 표시

---

### 우선순위 3: 필드명 통일

#### CompanyProfile 타입에 별칭 추가
```typescript
export interface CompanyProfile {
  // ...
  ceoName: string;
  get ceo() { return this.ceoName; }  // 별칭
  
  established: string;
  get founded() { return this.established; }  // 별칭
}
```

또는 상세 페이지에서 올바른 필드명 사용

---

## 📋 데이터 수집 vs 표시 매트릭스

| 필드 | 타입 정의 | 수집 (온보딩) | 저장 (DB) | 표시 (상세) | 상태 |
|------|----------|-------------|----------|------------|------|
| name | ✅ | ✅ Step1 | ✅ | ✅ | 정상 |
| nameEn | ✅ | ✅ Step1 | ✅ | ✅ | 정상 |
| ceoName | ✅ | ✅ Step1 | ✅ | ⚠️ ceo로 접근 | 불일치 |
| established | ✅ | ✅ Step1 | ✅ | ⚠️ founded로 접근 | 불일치 |
| logo | ✅ | ✅ Step3 | ✅ | ✅ | 정상 |
| bannerImage | ✅ | ✅ Step3 | ✅ | ✅ | 정상 |
| description | ✅ | ✅ Step3 | ✅ | ✅ | 정상 |
| slogan | ✅ | ✅ Step3 | ✅ | ✅ | 정상 |
| vision | ✅ | ✅ Step3 | ✅ | ✅ | 정상 |
| mission | ✅ | ✅ Step3 | ✅ | ✅ | 정상 |
| techStack | ✅ | ✅ Step4 | ✅ | ✅ | 정상 |
| benefits | ✅ | ✅ Step4 | ✅ | ✅ | 정상 |
| **revenue** | ✅ | ✅ Step4 | **❌** | ✅ | **데이터 손실** |
| **funding** | ✅ | ✅ Step4 | **❌** | ✅ | **데이터 손실** |
| **avgSalary** | ✅ stats | ✅ Step4 | **❌** | ✅ | **데이터 손실** |
| **avgTenure** | ✅ stats | ✅ Step4 | **❌** | ✅ | **데이터 손실** |
| recruiters | ✅ | ✅ Step5 | ✅ | ✅ | 정상 |
| **reviews** | ❌ | ❌ | ❌ | ✅ | **미구현** |
| **news** | ❌ | ❌ | ❌ | ✅ | **미구현** |
| **culture** | ❌ | ❌ | ❌ | ✅ | **미구현** |
| rating | ✅ | ❌ | ✅ 자동 | ✅ | 정상 |
| reviewCount | ✅ | ❌ | ✅ 자동 | ✅ | 정상 |
| openPositions | ✅ | ❌ | ✅ 자동 | ✅ | 정상 |

---

## 🎯 즉시 수정 필요 항목

### 1. revenue, funding, avgSalary, avgTenure 저장 로직 추가 (최우선)
### 2. OnboardingStep4 타입에 필드 추가
### 3. 필드명 통일 또는 별칭 처리
### 4. 미구현 필드(reviews, news, culture) 처리 방침 결정





