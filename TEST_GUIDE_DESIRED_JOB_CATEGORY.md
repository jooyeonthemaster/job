# 희망 직군(desired_job_category) 기능 테스트 가이드

> **작성일**: 2025-10-19 22:00
> **변경 범위**: 데이터베이스 → 저장 로직 → 타입 정의 → 대시보드 표시 (전체 데이터 흐름)
> **우선순위**: P0 (치명적 - 채용 추천 시스템 핵심 데이터)

---

## 📋 변경 사항 요약

### 수정된 파일 (8개)

1. **supabase/schema.sql** - DB 스키마에 컬럼 추가
2. **lib/supabase/jobseeker-onboarding.ts** - DB 저장 로직 추가
3. **lib/supabase/jobseeker-types.ts** - 타입 정의 추가
4. **hooks/useJobseekerOnboarding.ts** - 폼 데이터 전달
5. **components/onboarding/job-seeker/Step4_Preferences.tsx** - UI 및 검증 추가
6. **types/jobseeker-dashboard.types.ts** - 대시보드 타입 추가
7. **lib/utils/profile-transformer.ts** - 데이터 변환 로직
8. **components/jobseeker-dashboard/PreferencesCard.tsx** - 대시보드 표시

### 주요 변경 내용

- `users` 테이블에 `desired_job_category TEXT` 컬럼 추가
- 온보딩 Step4에 희망 직군 선택 UI 추가 (10개 옵션)
- 희망 직군 필수 검증 추가
- 대시보드 PreferencesCard에 희망 직군 표시

---

## 🚀 사전 준비 (필수)

### 1. 데이터베이스 마이그레이션

Supabase SQL Editor에서 실행:

```sql
-- users 테이블에 desired_job_category 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS desired_job_category TEXT;

-- 컬럼 추가 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'desired_job_category';
```

**예상 결과**:
```
column_name            | data_type | is_nullable
-----------------------+-----------+------------
desired_job_category   | text      | YES
```

### 2. 기존 코드 백업 (권장)

```bash
git add .
git commit -m "backup: desired_job_category 수정 전 백업"
git branch backup-before-desired-job-category
```

### 3. 환경 확인

- [ ] Next.js 개발 서버 실행 중 (`npm run dev`)
- [ ] Supabase 프로젝트 정상 연결
- [ ] 로컬 환경 `.env.local` 설정 확인

---

## ✅ 테스트 시나리오

### 시나리오 1: 새로운 개인 회원 온보딩 (E2E)

**목적**: 전체 데이터 흐름 검증 (UI → DB → 대시보드)

#### 단계별 테스트

**Step 1: 회원가입 시작**
```
1. http://localhost:3000/signup 접속
2. "개인 회원가입" 클릭
3. 이메일/비밀번호 입력 후 회원가입
```

**Step 2: 온보딩 Section 1-3 완료**
```
4. BasicInfoSection: 이름, 연락처 입력
5. AccountSection: 이메일/비밀번호 확인
6. AddressSection: 주소 입력 (한국인) or 스킵 (외국인)
```

**Step 3: 온보딩 Step4 (희망 직군 테스트) ⭐**
```
7. "희망 직군" 필드 확인
   ✅ 필드가 존재하는가?
   ✅ 빨간 별(*) 필수 표시가 있는가?
   ✅ 10개 옵션이 모두 표시되는가?
      - 선택하세요 (기본값)
      - 개발, 디자인, 마케팅, 영업, 경영/기획,
        재무/회계, 인사/총무, 생산/제조, 서비스, 기타

8. 희망 직군 선택하지 않고 "다음" 클릭
   ✅ 검증 에러 메시지가 표시되는가?
   예상: "희망 직군을 선택해주세요"

9. 희망 직군 "개발" 선택
   ✅ 드롭다운이 정상 작동하는가?
   ✅ 선택한 값이 표시되는가?

10. "다음" 클릭
    ✅ 다음 섹션으로 이동하는가?
```

**Step 4: 온보딩 완료**
```
11. Section 5-7 완료 (PersonalInfo, Visa, Language, Terms)
12. "온보딩 완료" 클릭
```

**Step 5: 데이터베이스 확인**
```
13. Supabase 콘솔 → Table Editor → users 테이블
14. 방금 생성한 사용자 행 찾기
    ✅ desired_job_category 컬럼에 "개발"이 저장되어 있는가?
```

**Step 6: 대시보드 표시 확인**
```
15. http://localhost:3000/jobseeker-dashboard 자동 이동
16. "선호 조건" 카드 찾기
17. 카드 내용 확인:
    ✅ "희망 직군" 라벨이 표시되는가?
    ✅ Briefcase 아이콘이 표시되는가?
    ✅ "개발"이 표시되는가?
    ✅ 희망 직군이 맨 위에 표시되는가? (희망 직무보다 위)
```

**예상 결과**:
```
[선호 조건 카드]
------------------
📋 희망 직군
개발

🎯 희망 직무
(선택한 직무들...)

💼 고용 형태
(선택한 고용 형태)
```

---

### 시나리오 2: 프로필 수정 페이지 (향후 구현)

**목적**: 프로필 수정 시 희망 직군 변경 가능 여부 확인

```
⚠️ 주의: 현재 프로필 수정 페이지가 미구현 상태일 수 있음
         구현되어 있다면 아래 테스트 진행
```

**테스트 단계**:
```
1. 대시보드에서 "프로필 수정" 버튼 클릭
2. 선호 조건 편집 섹션 찾기
3. 희망 직군 드롭다운 확인
   ✅ 현재 값("개발")이 선택되어 있는가?

4. 희망 직군을 "디자인"으로 변경
5. "저장" 클릭
6. Supabase에서 desired_job_category 변경 확인
7. 대시보드로 돌아가서 "디자인"으로 표시되는지 확인
```

---

### 시나리오 3: 기존 사용자 (희망 직군 데이터 없음)

**목적**: 기존 사용자가 대시보드에서 정상 작동하는지 확인

**테스트 준비**:
```sql
-- 테스트용 기존 사용자 시뮬레이션
UPDATE public.users
SET desired_job_category = NULL
WHERE email = 'test@example.com';
```

**테스트 단계**:
```
1. test@example.com 계정으로 로그인
2. 대시보드 접속
3. "선호 조건" 카드 확인
   ✅ 희망 직군 섹션이 표시되지 않는가?
   ✅ 희망 직무/고용 형태 등은 정상 표시되는가?
   ✅ 에러가 발생하지 않는가?
```

**예상 결과**:
- 희망 직군이 NULL인 경우 해당 섹션 숨김 처리
- 나머지 선호 조건은 정상 표시
- JavaScript 에러 없음

---

### 시나리오 4: 엣지 케이스 테스트

#### 4-1: 소셜 로그인 사용자

**테스트**:
```
1. 네이버/카카오/구글 로그인으로 회원가입
2. 온보딩 진행
3. Step4에서 희망 직군 선택
4. 온보딩 완료
5. Supabase 확인: desired_job_category 저장 여부
```

#### 4-2: 희망 직군 "기타" 선택

**테스트**:
```
1. 온보딩 Step4에서 희망 직군 "기타" 선택
2. 온보딩 완료
3. 대시보드에서 "기타"가 정상 표시되는지 확인
```

#### 4-3: 빈 값 처리

**테스트**:
```sql
-- 빈 문자열 저장 테스트
UPDATE public.users
SET desired_job_category = ''
WHERE id = 'user-id';
```
```
1. 대시보드 접속
2. 선호 조건 카드 확인
   ✅ 빈 문자열이 표시되지 않는가?
   ✅ 에러가 발생하지 않는가?
```

---

## 🔍 검증 체크리스트

### 데이터베이스 검증

- [ ] `users` 테이블에 `desired_job_category` 컬럼 존재
- [ ] 컬럼 타입이 `TEXT`인가?
- [ ] 컬럼이 nullable인가? (NULL 허용)
- [ ] 기존 사용자의 해당 컬럼이 NULL인가?

### 온보딩 UI 검증

- [ ] Step4_Preferences에 "희망 직군" 필드 존재
- [ ] 필수 표시 별(*) 있음
- [ ] 10개 직군 옵션 모두 표시
- [ ] 검증 로직 정상 작동 (빈 값 선택 시 에러)
- [ ] 선택한 값이 formData에 저장됨

### 저장 로직 검증

- [ ] `useJobseekerOnboarding` 훅에서 `desiredJobCategory` 전달
- [ ] `completeOnboarding` 함수에 `desired_job_category` 파라미터 전달
- [ ] Supabase UPDATE 쿼리에 `desired_job_category` 포함
- [ ] DB에 실제로 저장되는가?

### 대시보드 표시 검증

- [ ] `transformSupabaseProfile` 함수에서 `desiredJobCategory` 변환
- [ ] `ProfileData` 타입에 `desiredJobCategory` 필드 존재
- [ ] PreferencesCard에서 희망 직군 표시
- [ ] 희망 직군이 맨 위에 표시 (희망 직무보다 위)
- [ ] Briefcase 아이콘 표시

### 타입 안정성 검증

- [ ] TypeScript 빌드 에러 없음
- [ ] `npm run build` 성공
- [ ] 타입 추론 정상 작동

---

## 🐛 예상 가능한 이슈 및 해결 방법

### 이슈 1: DB 컬럼이 없어서 에러 발생

**증상**:
```
Error: column "desired_job_category" does not exist
```

**해결**:
```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE public.users
ADD COLUMN desired_job_category TEXT;
```

### 이슈 2: 대시보드에서 희망 직군이 표시되지 않음

**체크리스트**:
1. Supabase에서 desired_job_category 값이 실제로 저장되었는가?
2. `transformSupabaseProfile` 함수가 올바르게 변환하는가?
3. PreferencesCard에서 조건문이 올바른가?
4. 브라우저 캐시를 지우고 새로고침했는가?

**디버깅**:
```typescript
// useDashboardData.ts에 로그 추가
console.log('Raw Supabase Data:', supabaseData);
console.log('Transformed Profile:', profile);
console.log('Desired Job Category:', profile?.desiredJobCategory);
```

### 이슈 3: 온보딩 검증이 작동하지 않음

**체크리스트**:
1. `validateForm` 함수에 희망 직군 검증 로직이 있는가?
2. `validationErrors` 배열에 에러가 추가되는가?
3. 에러 메시지가 화면에 표시되는가?

**디버깅**:
```typescript
// Step4_Preferences.tsx에 로그 추가
const validateForm = () => {
  console.log('Validating form:', formData);
  if (!formData.desiredJobCategory) {
    console.log('희망 직군 검증 실패');
  }
};
```

### 이슈 4: TypeScript 타입 에러

**증상**:
```
Property 'desiredJobCategory' does not exist on type 'ProfileData'
```

**해결**:
1. `types/jobseeker-dashboard.types.ts` 확인
2. `ProfileData` 타입에 `desiredJobCategory?: string | null;` 추가되었는지 확인
3. VSCode 재시작 (TypeScript 서버 리로드)

---

## 📊 성공 기준

### 필수 통과 항목 (모두 통과해야 함)

- [x] DB에 `desired_job_category` 컬럼 존재
- [x] 온보딩 Step4에 희망 직군 UI 존재
- [x] 희망 직군 필수 검증 작동
- [x] 온보딩 완료 시 DB에 저장
- [x] 대시보드에서 희망 직군 표시
- [x] TypeScript 빌드 성공
- [x] 기존 사용자 에러 없음

### 선택 통과 항목 (권장)

- [ ] 프로필 수정 페이지에서 수정 가능
- [ ] 10개 직군 옵션 모두 정상 작동
- [ ] 소셜 로그인 사용자도 정상 작동
- [ ] 엣지 케이스(NULL, 빈 문자열) 처리

---

## 📝 테스트 결과 기록 템플릿

```markdown
## 테스트 결과

**테스트 일시**: YYYY-MM-DD HH:mm
**테스터**: [이름]
**환경**: Local / Staging / Production

### 시나리오 1: 새로운 개인 회원 온보딩
- [ ] Step 1-3 정상
- [ ] Step 4 희망 직군 UI 정상
- [ ] Step 4 검증 작동
- [ ] 온보딩 완료
- [ ] DB 저장 확인
- [ ] 대시보드 표시 확인

**이슈 발견**:
- (없음 / 이슈 설명)

### 시나리오 2: 프로필 수정
- [ ] (테스트 항목)

### 시나리오 3: 기존 사용자
- [ ] (테스트 항목)

### 시나리오 4: 엣지 케이스
- [ ] 소셜 로그인
- [ ] "기타" 직군
- [ ] 빈 값 처리

### 전체 평가
- **성공 여부**: ✅ 성공 / ⚠️ 부분 성공 / ❌ 실패
- **다음 단계**: (후속 작업)
```

---

## 🔄 롤백 절차 (문제 발생 시)

```bash
# 1. Git 롤백
git reset --hard HEAD~1

# 2. DB 롤백
# Supabase SQL Editor에서 실행:
ALTER TABLE public.users DROP COLUMN IF EXISTS desired_job_category;

# 3. 서버 재시작
npm run dev
```

---

## 📚 참고 문서

- [JOBSEEKER_ANALYSIS.md](JOBSEEKER_ANALYSIS.md) - 전체 온보딩 → 대시보드 흐름 분석
- [PROFILE_COMPLETION_ANALYSIS.md](PROFILE_COMPLETION_ANALYSIS.md) - 프로필 완성 체크리스트 분석
- [CHANGELOG.md](CHANGELOG.md#2025-10-19-2200-desired-job-category) - 상세 변경 이력

---

**작성자**: Claude Code
**최종 수정**: 2025-10-19 22:00
