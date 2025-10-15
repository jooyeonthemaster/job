# 기업 회원가입 시스템 - 버전 비교

## 📌 개요

GlobalTalent 프로젝트에는 **2가지 기업 회원가입 시스템**이 있습니다.

---

## 🆕 신규 버전 (NEW VERSION) - **권장**

### 경로
- **URL**: `/signup/company`
- **파일**: [app/signup/company/page.tsx](app/signup/company/page.tsx)

### 특징
✅ **K-Work 레퍼런스 기반** - 정부 공식 채용 플랫폼 구조 반영
✅ **단일 페이지 긴 폼** - 모든 정보를 한 페이지에서 입력
✅ **8개 섹션 구성** - 체계적으로 분류된 입력 항목
✅ **Supabase 백엔드** - Auth + PostgreSQL Database
✅ **Cloudinary 파일 업로드** - 이미지 최적화 자동 지원
✅ **5개 필수 약관** - K-Work 약관을 GlobalTalent로 변환
✅ **실시간 검증** - 글자 수 카운터, 체크 아이콘
✅ **복지 정보 시스템** - 35개 태그 + 직접 입력

### 8개 섹션
1. **Section 1**: 사업자 정보 (사업자등록번호, 기업명, 대표자명 등)
2. **Section 2**: 기업 기본 정보 (기업형태, 직원 수, 홈페이지 등)
3. **Section 3**: 이미지 (로고, 기업 이미지 최대 5장)
4. **Section 4**: 복지 정보 (최소 1개 선택 필수)
5. **Section 5**: 담당자 정보 (부서, 담당자명, 연락처)
6. **Section 6**: 주소 정보 (카카오 주소 검색)
7. **Section 7**: 계정 정보 (이메일, 비밀번호)
8. **Section 8**: 약관 동의 (5개 필수 + 1개 선택)

### 기술 스택
- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (Auth, Database)
- **Storage**: Cloudinary
- **UI**: Tailwind CSS, Radix UI
- **Icons**: Lucide React
- **API**: Daum Postcode (주소 검색)

### 구현 파일
```
components/company-signup/
├── Section1BusinessInfo.tsx
├── Section2CompanyInfo.tsx
├── Section3Images.tsx
├── Section4Benefits.tsx
├── Section5Manager.tsx
├── Section6Address.tsx
├── Section7Account.tsx
└── TermsAgreement.tsx

lib/supabase/
├── company-types.ts (타입 정의 + 검증)
├── company-service.ts (Cloudinary 업로드)
└── config.ts

constants/
└── company-terms.ts (5개 약관 전문)

app/
├── signup/company/page.tsx (메인)
├── terms/page.tsx (약관 페이지)
└── privacy/page.tsx (개인정보 처리방침)
```

---

## 🗂️ 구형 버전 (LEGACY VERSION)

### 경로
- **URL**: `/company-auth/onboarding`
- **파일**: [app/company-auth/onboarding/page.tsx](app/company-auth/onboarding/page.tsx)

### 특징
⚠️ **5단계 온보딩** - 스텝별로 페이지 이동
⚠️ **Firebase 백엔드** - Firestore Database
⚠️ **구형 UI** - 기본 입력 폼
⚠️ **제한된 검증** - 기본 필수 입력만 체크

### 5단계 구성
1. **Step 1**: 기본 정보 (회사명, 사업자번호, 설립년도 등)
2. **Step 2**: 위치 정보 (주소)
3. **Step 3**: 회사 소개 (비전, 미션)
4. **Step 4**: 복지 & 기술 스택
5. **Step 5**: 담당자 정보

### 기술 스택
- **Frontend**: Next.js, React
- **Backend**: Firebase (Firestore, Auth)
- **UI**: Tailwind CSS
- **Animation**: Framer Motion

### 구현 파일
```
app/company-auth/onboarding/
├── page.tsx (메인)
├── Step1BasicInfo.tsx
├── Step2Location.tsx
├── Step3Introduction.tsx
├── Step4Benefits.tsx
└── Step5Recruiters.tsx

lib/firebase/
├── company-types.ts
└── company-service.ts
```

---

## 📊 비교표

| 항목 | 신규 버전 (NEW) | 구형 버전 (LEGACY) |
|------|----------------|-------------------|
| **페이지 구조** | 단일 페이지 긴 폼 | 5단계 스텝 방식 |
| **레퍼런스** | K-Work 기반 | 자체 설계 |
| **백엔드** | Supabase | Firebase |
| **파일 저장** | Cloudinary | Firebase Storage |
| **약관 시스템** | 5개 필수 + 1개 선택 | 없음 |
| **실시간 검증** | ✅ 글자 수, 아이콘 | ❌ 기본만 |
| **복지 시스템** | ✅ 35개 태그 + 직접 입력 | ⚠️ 단순 입력 |
| **주소 검색** | ✅ 카카오 API | ✅ 카카오 API |
| **사업자번호** | ✅ 숫자만 10자리 | ⚠️ 하이픈 포함 |
| **이미지 업로드** | ✅ 로고 + 5장 | ⚠️ 제한적 |
| **필수 약관** | ✅ 5개 | ❌ 없음 |
| **UI/UX** | ✅ 현대적 | ⚠️ 기본 |

---

## 🔀 전환 방법

### 신규 버전으로 이동
현재 구형 버전을 사용 중이라면:
1. 페이지 상단의 **"새로운 회원가입 시스템"** 링크 클릭
2. 또는 직접 `/signup/company` 접속

### 구형 버전으로 이동
현재 신규 버전을 사용 중이라면:
1. 페이지 하단의 **"구형 온보딩 방식"** 링크 클릭
2. 또는 직접 `/company-auth/onboarding` 접속

---

## 💡 권장 사항

**신규 버전 (NEW VERSION)** 사용을 권장합니다:

✅ K-Work 정부 표준 구조 반영
✅ 더 나은 UX (단일 페이지, 실시간 검증)
✅ 완전한 약관 시스템
✅ Supabase로 확장성 향상
✅ Cloudinary로 이미지 최적화
✅ 복지 시스템 강화

**구형 버전은 레거시로 표시되었으며, 향후 제거될 예정입니다.**

---

## 🚀 다음 단계

1. ✅ 신규 버전 테스트
2. ⏳ 실제 사용자 피드백 수집
3. ⏳ 구형 버전 데이터 마이그레이션
4. ⏳ 구형 버전 완전 제거

---

## 📝 수정 이력

- **2025-01-XX**: 신규 버전 (K-Work 기반) 구현 완료
- **2025-01-XX**: 구형 버전 LEGACY 표시 추가
- **2025-01-XX**: 버전 전환 링크 추가

---

**문의**: 버전 관련 문의사항이 있으면 개발팀에 문의하세요.
