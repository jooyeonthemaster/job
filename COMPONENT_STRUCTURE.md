# 컴포넌트 구조 가이드

> **목표**: 재사용 가능하고, 유지보수하기 쉬운 모듈화된 컴포넌트 구조

---

## 🎯 핵심 원칙

### 1. 파일 크기 제한 (500줄)
- **단일 파일**: 최대 500줄
- **초과 시**: 즉시 분리 (컴포넌트/훅/유틸리티)
- **예외**: 절대 없음

### 2. 단일 책임 원칙 (SRP)
- 하나의 컴포넌트 = 하나의 역할
- 복잡한 로직은 커스텀 훅으로 분리
- 비즈니스 로직과 UI 분리

### 3. 재사용성 최우선
- 3번 이상 사용 → 공통 컴포넌트화
- props로 유연하게 커스터마이징
- 의존성 최소화

---

## 📁 컴포넌트 디렉토리 구조

```
components/
├── ui/                          # 기본 UI 컴포넌트 (재사용 최고)
│   ├── Button.tsx              # 버튼 (50줄)
│   ├── Input.tsx               # 입력 필드 (80줄)
│   ├── Modal.tsx               # 모달 (120줄)
│   ├── Card.tsx                # 카드 (60줄)
│   ├── Badge.tsx               # 뱃지 (40줄)
│   └── Loading.tsx             # 로딩 (30줄)
│
├── layout/                      # 레이아웃 컴포넌트
│   ├── Header.tsx              # 헤더 (150줄)
│   ├── Footer.tsx              # 푸터 (100줄)
│   ├── Sidebar.tsx             # 사이드바 (200줄)
│   └── Container.tsx           # 컨테이너 (50줄)
│
├── forms/                       # 폼 관련 컴포넌트
│   ├── FormField.tsx           # 폼 필드 래퍼 (80줄)
│   ├── FormError.tsx           # 에러 메시지 (40줄)
│   ├── FormLabel.tsx           # 라벨 (30줄)
│   └── FormSection.tsx         # 섹션 래퍼 (60줄)
│
├── company-signup/              # 기업 회원가입 (기능별)
│   ├── Section1BusinessInfo.tsx    (≤ 200줄)
│   ├── Section2CompanyInfo.tsx     (≤ 200줄)
│   ├── Section3Images.tsx          (≤ 150줄)
│   ├── Section4Benefits.tsx        (≤ 180줄)
│   ├── Section5Manager.tsx         (≤ 180줄)
│   ├── Section6Address.tsx         (≤ 120줄)
│   └── Section7Account.tsx         (≤ 150줄)
│
├── job-create/                  # 채용공고 작성 (기능별)
│   ├── BasicInfoSection.tsx        (≤ 250줄)
│   ├── SalarySection.tsx           (≤ 180줄)
│   ├── JobDetailsSection.tsx       (≤ 200줄)
│   ├── BenefitsSection.tsx         (≤ 150줄)
│   ├── LanguageSection.tsx         (≤ 120줄)
│   ├── WorkConditionsSection.tsx   (≤ 180줄)
│   ├── PostingTierSection.tsx      (≤ 200줄)
│   └── RecruiterSection.tsx        (≤ 150줄)
│
└── shared/                      # 공유 컴포넌트
    ├── AuthForm.tsx            # 인증 폼 (200줄)
    ├── FileUpload.tsx          # 파일 업로드 (180줄)
    ├── SearchBar.tsx           # 검색바 (120줄)
    └── Pagination.tsx          # 페이지네이션 (100줄)
```

---

## 🧩 컴포넌트 분리 전략

### Before (나쁜 예 - 800줄)
```tsx
// ❌ app/signup/company/page.tsx (800줄)
export default function CompanySignupPage() {
  // 상태 관리 (100줄)
  const [formData, setFormData] = useState({...});

  // 검증 로직 (200줄)
  const validateForm = () => {...};

  // 제출 로직 (150줄)
  const handleSubmit = () => {...};

  // UI 렌더링 (350줄)
  return (
    <form>
      {/* 7개 섹션이 모두 여기에... */}
    </form>
  );
}
```

### After (좋은 예 - 각각 150~200줄)
```tsx
// ✅ app/signup/company/page.tsx (200줄)
import Section1BusinessInfo from '@/components/company-signup/Section1BusinessInfo';
import Section2CompanyInfo from '@/components/company-signup/Section2CompanyInfo';
// ... 나머지 섹션들

export default function CompanySignupPage() {
  const { formData, handleChange, handleSubmit } = useCompanySignupForm();

  return (
    <form onSubmit={handleSubmit}>
      <Section1BusinessInfo formData={formData} onChange={handleChange} />
      <Section2CompanyInfo formData={formData} onChange={handleChange} />
      {/* ... */}
    </form>
  );
}

// ✅ hooks/useCompanySignupForm.ts (150줄)
export const useCompanySignupForm = () => {
  // 상태 관리 + 검증 + 제출 로직
};

// ✅ components/company-signup/Section1BusinessInfo.tsx (180줄)
export default function Section1BusinessInfo({ formData, onChange }) {
  // 섹션 1만 담당
}
```

---

## 📏 컴포넌트 크기 기준

| 컴포넌트 유형 | 권장 줄 수 | 최대 줄 수 |
|--------------|----------|----------|
| UI 컴포넌트 (Button, Input) | 30-80줄 | 100줄 |
| 레이아웃 컴포넌트 (Header) | 80-150줄 | 200줄 |
| 섹션 컴포넌트 (폼 섹션) | 100-200줄 | 250줄 |
| 페이지 컴포넌트 (page.tsx) | 100-200줄 | 300줄 |
| 커스텀 훅 (useXXX) | 50-150줄 | 200줄 |

**500줄 초과 시 즉시 분리 필수!**

---

## 🔧 분리 방법

### 1. 로직 분리 → 커스텀 훅
```tsx
// Before: 복잡한 로직이 컴포넌트 안에 (300줄)
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // 100줄의 로그인 로직
  };

  return <form>{/* UI */}</form>;
}

// After: 로직을 커스텀 훅으로 (각각 80줄)
// hooks/useLogin.ts
export const useLogin = () => {
  // 로그인 로직만
};

// components/LoginForm.tsx
export default function LoginForm() {
  const { email, password, error, handleLogin } = useLogin();
  return <form>{/* UI만 */}</form>;
}
```

### 2. UI 분리 → 재사용 컴포넌트
```tsx
// Before: 반복되는 UI (200줄)
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    이메일
  </label>
  <input className="w-full px-4 py-2 border rounded-lg" />
</div>

// After: 재사용 가능한 컴포넌트 (50줄)
// components/ui/FormField.tsx
export const FormField = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input className="w-full px-4 py-2 border rounded-lg" {...props} />
  </div>
);

// 사용
<FormField label="이메일" type="email" value={email} onChange={...} />
```

### 3. 섹션 분리 → 기능별 컴포넌트
```tsx
// Before: 거대한 폼 (600줄)
<form>
  <div>{/* 사업자 정보 100줄 */}</div>
  <div>{/* 기업 정보 100줄 */}</div>
  <div>{/* 이미지 업로드 100줄 */}</div>
  <div>{/* 복지 정보 100줄 */}</div>
  {/* ... */}
</form>

// After: 섹션별 컴포넌트 (각각 150줄)
<form>
  <BusinessInfoSection {...props} />
  <CompanyInfoSection {...props} />
  <ImagesSection {...props} />
  <BenefitsSection {...props} />
</form>
```

---

## ♻️ 재사용성 체크리스트

### 공통 컴포넌트화 기준
- [ ] 3개 이상의 다른 곳에서 사용
- [ ] 독립적으로 동작 가능
- [ ] props로 커스터마이징 가능
- [ ] 외부 의존성 최소화

### 재사용 가능하게 만드는 방법
```tsx
// ❌ 재사용 불가 (하드코딩)
export const SubmitButton = () => (
  <button className="bg-blue-500 text-white">
    회원가입
  </button>
);

// ✅ 재사용 가능 (props 활용)
type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
};

export const Button = ({
  children,
  variant = 'primary',
  onClick,
  disabled
}: ButtonProps) => (
  <button
    className={`px-4 py-2 rounded ${
      variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
    }`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// 사용
<Button variant="primary">회원가입</Button>
<Button variant="secondary" onClick={handleCancel}>취소</Button>
```

---

## 📊 컴포넌트 품질 지표

### 자동 체크 (Claude Code가 확인)
- [ ] 파일 크기 ≤ 500줄
- [ ] 함수 크기 ≤ 50줄
- [ ] import 개수 ≤ 15개
- [ ] 중첩 깊이 ≤ 4단계
- [ ] props 개수 ≤ 10개

### 수동 리뷰 (개발자 확인)
- [ ] 명확한 단일 책임
- [ ] 테스트 가능한 구조
- [ ] 의미 있는 이름
- [ ] 주석이 필요 없을 정도로 명확한 코드

---

## 🚨 500줄 초과 시 경고 시스템

### Claude Code 자동 경고
```
⚠️ 경고: components/LargeComponent.tsx (652줄)
→ 500줄 제한 초과!
→ 즉시 분리 필요

제안:
1. 로직 분리 → hooks/useLargeComponent.ts
2. UI 섹션 분리 → components/LargeComponent/Section1.tsx
3. 공통 UI → components/ui/CommonComponent.tsx
```

### CHANGELOG.md 자동 기록
```
## 2025-10-18 17:30 - [REFACTOR] LargeComponent 분리

**이유**: 500줄 초과 (652줄 → 3개 파일로 분리)

**변경 내용**:
- hooks/useLargeComponent.ts (150줄) - 로직 분리
- components/LargeComponent.tsx (200줄) - 메인 UI
- components/LargeComponent/Sections.tsx (180줄) - 서브 섹션

**효과**: 유지보수성 향상, 테스트 용이성 개선
```

---

## 🎓 모범 사례

### 1. 로그인 폼 (120줄)
```tsx
// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useLogin } from '@/hooks/useLogin';

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin
  } = useLogin();

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <ErrorMessage message={error} />}

      <FormField
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <FormField
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" loading={isLoading}>
        로그인
      </Button>
    </form>
  );
}
```

### 2. 재사용 가능한 UI 컴포넌트 (60줄)
```tsx
// components/ui/Card.tsx
import { ReactNode } from 'react';
import { clsx } from 'clsx';

type CardProps = {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
};

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className
}: CardProps) => {
  const baseStyles = 'rounded-lg';

  const variantStyles = {
    default: 'bg-white',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-lg'
  };

  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={clsx(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      className
    )}>
      {children}
    </div>
  );
};
```

---

## 📝 작성 규칙 요약

| 규칙 | 설명 | 강제 |
|-----|------|-----|
| 500줄 제한 | 단일 파일 최대 500줄 | ✅ 필수 |
| 단일 책임 | 하나의 컴포넌트 = 하나의 역할 | ✅ 필수 |
| 재사용성 | 3번 이상 사용 시 공통화 | ✅ 필수 |
| Props 타입 | 모든 props 타입 명시 | ✅ 필수 |
| 로직 분리 | 비즈니스 로직 → 커스텀 훅 | 🟡 권장 |
| 명확한 이름 | 역할이 드러나는 이름 | 🟡 권장 |

---

_마지막 업데이트: 2025-10-18 17:15_
