# GlobalTalent 프로젝트 - Claude Code 규칙

이 문서는 Claude Code가 이 프로젝트에서 작업할 때 **반드시 따라야 하는 규칙**입니다.

---

## 📋 필수 참조 문서

코드 수정 전 **반드시** 확인:
- [CHANGELOG.md](CHANGELOG.md) - 모든 변경 사항 기록
- [COMPONENT_STRUCTURE.md](COMPONENT_STRUCTURE.md) - 컴포넌트 구조 가이드

---

## ⚡ BEFORE 코드 수정 - 필수 자동 체크

**코드를 수정하기 전에 Claude Code는 자동으로:**

1. ✅ `git status` 실행 → 현재 브랜치 확인
2. ✅ 수정할 파일 줄 수 확인 → 500줄 미만인지 체크
3. ✅ CHANGELOG.md 존재 확인 → 업데이트 준비

**main/master 브랜치에 있다면:**
- 즉시 feature 브랜치 생성 제안
- 예: `git checkout -b feature/[기능명]`

**500줄 근처 파일이라면:**
- 사용자에게 경고
- 분리 계획 먼저 제시

---

## 🚨 최우선 규칙 (절대 위반 금지)

### 1. 개발 로그 작성 (필수)
**모든 코드 수정 시 CHANGELOG.md에 기록**

```markdown
## YYYY-MM-DD HH:mm - [변경 유형] 영향 범위

**변경 파일**:
- path/to/file.tsx (기존: 320줄 → 변경 후: 280줄)

**변경 내용**:
- 구체적인 변경 사항 (무엇을, 어떻게)

**이유**:
- 왜 이렇게 변경했는지

**시도했지만 실패한 방법** (있는 경우):
- ❌ 접근법 1: 설명 (왜 실패했는지)
- ❌ 접근법 2: 설명 (왜 실패했는지)

**영향**:
- 다른 파일/컴포넌트에 미치는 영향
```

**변경 유형**:
- `[ADD]` - 새로운 파일/기능 추가
- `[UPDATE]` - 기존 코드 수정/개선
- `[DELETE]` - 파일/코드 삭제
- `[REFACTOR]` - 코드 리팩토링 (동작 변경 없음)
- `[FIX]` - 버그 수정
- `[STYLE]` - 스타일/포맷 변경

### 2. 파일 크기 제한 (절대 준수)
- **단일 파일 최대 500줄**
- 초과 시 **즉시 분리** 필수
- 예외 없음

**500줄 초과 시 자동 분리**:
```
1. 로직 분리 → hooks/useXXX.ts
2. UI 섹션 분리 → components/XXX/Section.tsx
3. 공통 UI → components/ui/Common.tsx
```

### 3. 모듈화 및 재사용성
- **3번 이상 사용** → 즉시 공통 컴포넌트화
- 단일 책임 원칙 (SRP) 준수
- 독립적으로 동작 가능한 컴포넌트

---

## 🎯 핵심 원칙

### 1. 기술 스택 준수
- **Next.js 15.5.3** App Router 사용
- **React 19.1.0** 서버/클라이언트 컴포넌트 구분
- **TypeScript** 엄격 모드
- **Supabase** 인증 및 데이터베이스 (Firebase 절대 사용 금지)
- **Tailwind CSS** 스타일링 (인라인 스타일 금지)
- **Cloudinary** 파일 업로드

### 2. 코드 작성 규칙

#### 파일 명명 규칙
- 페이지: `page.tsx` (App Router)
- 컴포넌트: `PascalCase.tsx` (예: `LoginForm.tsx`)
- 유틸리티: `camelCase.ts` (예: `formatDate.ts`)
- 타입: `kebab-case.types.ts` (예: `job-form.types.ts`)

#### 컴포넌트 규칙
```tsx
// ✅ 올바른 예시
'use client'; // 클라이언트 컴포넌트는 최상단에 명시

import { useState } from 'react';
import { supabase } from '@/lib/supabase/config';

export default function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <form className="space-y-4">
      {/* Tailwind CSS 사용 */}
    </form>
  );
}

// ❌ 잘못된 예시
import { firebase } from '@/lib/firebase'; // Firebase 사용 금지
const styles = { color: 'red' }; // 인라인 스타일 금지
```

#### TypeScript 규칙
- `any` 타입 사용 금지 (명시적 타입 정의 필수)
- 인터페이스보다 `type` 키워드 선호
- 모든 함수에 반환 타입 명시

```typescript
// ✅ 올바른 예시
type UserData = {
  id: string;
  email: string;
  name: string;
};

const getUser = async (id: string): Promise<UserData> => {
  // ...
}

// ❌ 잘못된 예시
const getUser = async (id: any) => { // any 금지
  // ...
}
```

### 3. 인증 시스템

#### Supabase 인증 사용 (필수)
```typescript
// ✅ 올바른 방법
import { supabase } from '@/lib/supabase/config';

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// ❌ Firebase 사용 금지
import { auth } from '@/lib/firebase'; // 절대 사용 금지
```

#### 회원 유형 구분
- 개인 회원: `/login/jobseeker`, `/signup/jobseeker`
- 기업 회원: `/login/company`, `/signup/company`
- 통합 선택: `/login`, `/signup`

### 4. 파일 구조

#### 컴포넌트 구조
```
components/
├── ui/                    # 재사용 가능한 UI 컴포넌트
├── company-signup/        # 기업 회원가입 섹션
├── job-create/            # 채용공고 작성 섹션
└── [feature]/             # 기능별 그룹화
```

#### 페이지 구조 (App Router)
```
app/
├── login/
│   ├── page.tsx           # 로그인 선택
│   ├── jobseeker/page.tsx # 개인 로그인
│   └── company/page.tsx   # 기업 로그인
├── signup/
│   ├── page.tsx           # 회원가입 선택
│   ├── jobseeker/page.tsx # 개인 회원가입
│   └── company/page.tsx   # 기업 회원가입
└── [feature]/
    └── page.tsx
```

### 5. 금지 사항 🚫

1. **Firebase 코드 작성 절대 금지**
   - `@/lib/firebase` import 금지
   - Firebase Auth, Firestore 사용 금지

2. **비활성화된 파일 수정 금지**
   - `*.disabled` 파일은 건드리지 않음
   - 필요시 먼저 사용자에게 활성화 확인

3. **임의로 MD 파일 생성 금지**
   - 분석 문서는 `docs/` 폴더에만
   - README.md 수정 시 사용자 확인 필수

4. **환경변수 하드코딩 금지**
   ```typescript
   // ❌ 절대 금지
   const apiKey = "AIzaSyCq002cA_Gve_a1FTu_MRjJgT82LXiwd3A";

   // ✅ 환경변수 사용
   const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   ```

---

## 📝 작업 시 체크리스트

### 새로운 기능 추가 시
- [ ] TypeScript 타입 정의 완료
- [ ] Supabase 인증/DB 사용
- [ ] Tailwind CSS로 스타일링
- [ ] 에러 핸들링 추가
- [ ] 클라이언트/서버 컴포넌트 구분 명확

### 기존 코드 수정 시
- [ ] 기존 패턴 유지
- [ ] 타입 안정성 확인
- [ ] Firebase 코드 제거 확인
- [ ] 불필요한 파일 생성 안 함

### 커밋 전
- [ ] `npm run build` 성공 확인
- [ ] TypeScript 에러 0개
- [ ] `.env.local` 커밋 안 함

---

## 🔍 자주 발생하는 실수

### 1. Firebase 잔여 코드
```typescript
// ❌ 절대 안됨
import { auth } from '@/lib/firebase';

// ✅ Supabase 사용
import { supabase } from '@/lib/supabase/config';
```

### 2. 인라인 스타일 사용
```tsx
// ❌ 안됨
<div style={{ color: 'red', padding: '10px' }}>

// ✅ Tailwind 사용
<div className="text-red-600 p-2.5">
```

### 3. any 타입 남용
```typescript
// ❌ 안됨
const handleSubmit = (data: any) => {}

// ✅ 명시적 타입
const handleSubmit = (data: FormData) => {}
```

---

## 📚 프로젝트 참고 문서

- [기술 스택](package.json)
- [Supabase 설정](lib/supabase/config.ts)
- [타입 정의](types/)
- [마이그레이션 가이드](docs/MIGRATION_GUIDE.md)

---

## 🔄 Git 자동 커밋 규칙 (롤백 가능하게)

### 코드 수정 후 자동 실행

**AFTER 모든 코드 수정:**

```bash
# 1. 변경 사항 확인
git diff

# 2. 사용자에게 제시할 커밋 메시지
[TYPE]: 간단한 설명

- 상세 변경 사항 1
- 상세 변경 사항 2

Files: file1.tsx (320→280줄), file2.ts (신규:60줄)
```

**사용자에게 물어보기:**
```
✅ 변경 완료! 커밋하시겠습니까?

제안 커밋 메시지:
[UPDATE]: 로그인 폼 검증 로직 개선
- 이메일 형식 검사 추가
- 에러 메시지 사용자 친화적으로 변경
Files: app/login/page.tsx (280→285줄)

1. 예 (커밋)
2. 아니오 (변경 사항 유지, 커밋 안 함)
3. 메시지 수정 후 커밋
```

### 롤백 방법 자동 안내

**커밋 후 항상 안내:**
```
✅ 커밋 완료: a1b2c3d

📌 이 변경사항을 되돌리려면:
git revert a1b2c3d           # 안전한 되돌리기 (히스토리 유지)
git reset --soft HEAD~1      # 커밋만 취소 (코드는 유지)
git reset --hard HEAD~1      # 완전히 되돌리기 (주의!)
```

---

## 🔄 작업 프로세스 (반드시 준수)

### 코드 수정 시 순서
```
1. 기존 코드 분석
   - 파일 크기 확인 (500줄 체크)
   - 관련 컴포넌트 파악
   - 재사용 가능 여부 판단

2. 수정 계획 수립
   - 어떤 파일을 수정할지
   - 새로운 컴포넌트 필요 여부
   - 500줄 초과 시 분리 계획

3. 코드 수정 실행
   - 기존 패턴 유지
   - 타입 안정성 확인
   - 재사용 가능하게 작성

4. CHANGELOG.md 업데이트 (필수!)
   - 변경 내용 상세 기록
   - 줄 수 변화 명시
   - 영향 범위 분석

5. 검증
   - npm run build 확인
   - TypeScript 에러 체크
   - 500줄 제한 준수 확인
```

### 실제 작업 예시

#### Case 1: 새로운 컴포넌트 추가
```
1. components/ui/NewButton.tsx 생성 (80줄)
2. CHANGELOG.md 업데이트:

## 2025-10-18 17:30 - [ADD] 재사용 가능한 버튼 컴포넌트

**변경 파일**:
- components/ui/NewButton.tsx (신규: 80줄)

**변경 내용**:
- variant, size, loading 상태 지원하는 버튼 컴포넌트
- TypeScript 타입 완벽 지원
- Tailwind CSS 스타일링

**이유**:
- 3개 이상 페이지에서 반복되는 버튼 코드 발견
- 재사용성 향상 및 일관된 UI 유지

**영향**:
- app/login/page.tsx, app/signup/page.tsx에서 활용 가능
```

#### Case 2: 500줄 초과 파일 분리
```
1. 분석: components/LargeForm.tsx (720줄) → 500줄 초과!
2. 분리:
   - hooks/useLargeForm.ts (180줄) - 로직
   - components/LargeForm.tsx (250줄) - 메인 UI
   - components/LargeForm/Section1.tsx (150줄)
   - components/LargeForm/Section2.tsx (140줄)

3. CHANGELOG.md 업데이트:

## 2025-10-18 17:45 - [REFACTOR] LargeForm 500줄 제한 준수

**변경 파일**:
- components/LargeForm.tsx (720줄 → 250줄)
- hooks/useLargeForm.ts (신규: 180줄)
- components/LargeForm/Section1.tsx (신규: 150줄)
- components/LargeForm/Section2.tsx (신규: 140줄)

**변경 내용**:
- 단일 파일 720줄을 4개 파일로 분리
- 로직을 커스텀 훅으로 추출
- UI 섹션을 독립 컴포넌트로 분리

**이유**:
- 500줄 제한 초과 (720줄)
- 유지보수성 향상
- 테스트 가능한 구조 개선

**영향**:
- 동작은 완전히 동일 (리팩토링만)
- 향후 섹션별 수정 용이
```

#### Case 3: 공통 컴포넌트 추출
```
발견: FormField 코드가 5개 파일에서 반복됨

1. components/ui/FormField.tsx 생성 (60줄)
2. 5개 파일에서 중복 코드 제거 (각 -20줄)
3. CHANGELOG.md 업데이트:

## 2025-10-18 18:00 - [REFACTOR] FormField 공통 컴포넌트 추출

**변경 파일**:
- components/ui/FormField.tsx (신규: 60줄)
- app/login/page.tsx (280줄 → 260줄)
- app/signup/page.tsx (320줄 → 300줄)
- components/CompanyForm.tsx (450줄 → 430줄)
- components/JobseekerForm.tsx (380줄 → 360줄)
- components/ProfileForm.tsx (400줄 → 380줄)

**변경 내용**:
- 5개 파일에서 반복되는 FormField 로직 추출
- label, error, required 등 props 통합
- 총 100줄 코드 감소

**이유**:
- 3회 이상 반복 사용 (5회 발견)
- DRY 원칙 위반 해소
- 일관된 폼 UI 유지

**영향**:
- 향후 폼 스타일 변경 시 한 곳만 수정
- 재사용성 극대화
```

---

## 📊 코드 품질 자동 체크

### Claude Code가 자동으로 확인하는 항목
- [ ] 파일 크기 ≤ 500줄
- [ ] CHANGELOG.md 업데이트 여부
- [ ] TypeScript `any` 사용 여부
- [ ] Firebase import 여부 (금지)
- [ ] 인라인 스타일 사용 여부 (금지)
- [ ] 재사용 가능한 구조 여부
- [ ] 명확한 컴포넌트 이름
- [ ] Props 타입 정의 여부

### 경고 예시
```
⚠️ 경고: components/NewComponent.tsx
- 파일 크기: 620줄 (500줄 초과!)
- CHANGELOG.md 미업데이트
- any 타입 3개 발견

→ 즉시 수정 필요!
```

---

## 🎓 모범 사례 체크리스트

### 새로운 컴포넌트 작성 시
- [ ] 파일 크기 ≤ 500줄 확인
- [ ] 단일 책임 원칙 준수
- [ ] TypeScript 타입 완벽 정의
- [ ] 재사용 가능한 구조
- [ ] Props로 커스터마이징 가능
- [ ] Tailwind CSS 스타일링
- [ ] 명확한 함수/변수 이름
- [ ] CHANGELOG.md 업데이트

### 기존 코드 수정 시
- [ ] 기존 패턴 유지
- [ ] 500줄 초과 여부 확인
- [ ] 공통 컴포넌트화 가능 여부 검토
- [ ] 타입 안정성 확인
- [ ] 빌드 에러 없음
- [ ] CHANGELOG.md 업데이트

---

## 🚫 절대 금지 사항 (위반 시 즉시 차단)

### 1. Firebase 관련
```typescript
// ❌ 절대 금지
import { firebase } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
```

### 2. 500줄 초과
```typescript
// ❌ 금지 - 즉시 분리 필요
// components/HugeComponent.tsx (620줄)
```

### 3. CHANGELOG.md 미업데이트
```
// ❌ 금지 - 코드 수정 시 반드시 업데이트
코드만 수정하고 CHANGELOG.md 안 쓰기
```

### 4. any 타입 사용
```typescript
// ❌ 금지
const handleData = (data: any) => {}

// ✅ 명시적 타입
const handleData = (data: FormData) => {}
```

### 5. 불필요한 MD 파일 생성
```
// ❌ 금지 - 루트에 임의로 MD 파일 생성
ANALYSIS_REPORT.md
SOME_NOTES.md

// ✅ docs/ 폴더에만 생성 (사용자 확인 후)
docs/technical-analysis.md
```

---

**중요**:
- 이 규칙을 어기는 코드는 **절대 작성하지 마세요**
- 불확실한 경우 **먼저 사용자에게 확인**하세요
- **모든 변경은 CHANGELOG.md에 기록**하세요
- **500줄 초과는 예외 없이 분리**하세요
