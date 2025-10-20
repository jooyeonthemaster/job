# 🚨 긴급! RLS 정책 완전 수정 가이드

## 🔥 문제 상황

다음 에러들이 발생합니다:
```
new row violates row-level security policy for table "jobs"
new row violates row-level security policy for table "users"
new row violates row-level security policy for table "companies"
```

## 🔍 근본 원인

### **모든 RLS 정책이 `firebase_uid`를 체크하고 있음**

```sql
-- users 테이블
USING (auth.uid()::text = firebase_uid);  ❌

-- companies 테이블  
USING (auth.uid()::text = firebase_uid);  ❌

-- jobs 테이블
USING (company_id IN (
  SELECT id FROM companies WHERE firebase_uid = auth.uid()::text
));  ❌
```

### **하지만 실제 코드에서는 `id`만 사용!**

```typescript
// 회원가입 시
users.id = userId (auth.uid())        ✅
companies.id = userId (auth.uid())    ✅

// firebase_uid는 저장하지 않음!  ❌
```

**결과:** RLS 정책이 `firebase_uid`를 찾지만 값이 없어서 항상 실패!

---

## 🛠️ 해결 방법 (완전판)

### **Supabase Dashboard에서 다음 SQL 실행**

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/kzovapvythsgskklmukj
   ```

2. **좌측 메뉴 → SQL Editor 클릭**

3. **아래 전체 SQL 복사 → 붙여넣기 → RUN**

```sql
-- =====================================================
-- RLS 정책 완전 수정: 모든 테이블
-- =====================================================

-- 1. USERS 테이블
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- 2. COMPANIES 테이블
DROP POLICY IF EXISTS "Companies can view own data" ON companies;
DROP POLICY IF EXISTS "Companies can update own data" ON companies;

CREATE POLICY "Companies can view own data"
  ON companies FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Companies can update own data"
  ON companies FOR UPDATE
  USING (id = auth.uid());

-- 3. JOBS 테이블
DROP POLICY IF EXISTS "Companies can manage own jobs" ON jobs;

CREATE POLICY "Companies can manage own jobs"
  ON jobs FOR ALL
  USING (company_id = auth.uid());
```

4. **"RUN" 버튼 클릭**

---

## ✅ 검증

정책 수정 후:
```sql
-- 현재 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'jobs';
```

**올바른 정책:**
```sql
CREATE POLICY "Companies can manage own jobs"
  ON jobs FOR ALL
  USING (company_id = auth.uid());
```

---

## 🧪 테스트

1. 공고 작성 페이지로 이동
2. "임시저장" 버튼 클릭
3. ✅ 정상 저장됨!

---

## 📝 참고

### companies 테이블 구조
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,              -- Auth user id와 동일
  firebase_uid TEXT UNIQUE,         -- 사용 안 함 (마이그레이션용)
  email TEXT UNIQUE NOT NULL,
  ...
);
```

### 회원가입 시
```typescript
// lib/supabase/company-service.ts
const { data: companyData } = await supabase
  .from('companies')
  .insert({
    id: userId, // Auth UID를 그대로 사용 ← 여기!
    ...
  });
```

### 공고 생성 시
```typescript
// 현재 사용자의 id를 company_id로 전달
const result = await createJob(formData, user.id, editorContent, true);
```

---

## 🎯 결론

**RLS 정책:**
```sql
company_id = auth.uid()  ✅ 올바름
```

**이유:**
- `companies.id = auth.uid()` (직접 같음)
- `jobs.company_id = companies.id`
- 따라서 `jobs.company_id = auth.uid()` 직접 비교 가능!

---

## ⚠️ 중요

이 수정은 **Supabase Dashboard**에서 직접 실행해야 합니다!

마이그레이션 파일만 만들어도 자동 적용되지 않습니다.

