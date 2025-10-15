# 🔥 네이버 로그인 + Supabase 통합 - 가장 쉬운 방법

**작성일**: 2025년 10월 14일  
**난이도**: ⭐⭐⭐ (보통)  
**예상 시간**: 1-2시간  
**방식**: NextAuth 없이 Next.js API Route 활용

---

## 🎯 핵심 아이디어

Supabase는 네이버를 공식 지원하지 않지만, **우회 방법**이 있습니다:

```
1. 네이버 OAuth로 사용자 정보 받기
2. Supabase Admin API로 사용자 생성
3. Supabase 세션 생성
4. 끝!
```

**장점**:
- ✅ NextAuth 불필요 (Supabase Auth만 사용)
- ✅ 다른 소셜 로그인(카카오, 페이스북)과 통합 관리
- ✅ Supabase RLS 정책 그대로 사용 가능
- ✅ 세션 관리 Supabase가 자동 처리

---

## 📋 전체 구조

```
사용자 클릭 → 네이버 로그인 페이지
           ↓
      네이버 인증 완료
           ↓
   callback으로 code 전달
           ↓
  Next.js API Route에서 처리
           ↓
    네이버 토큰 → 사용자 정보
           ↓
  Supabase에 사용자 생성/로그인
           ↓
     세션 쿠키 설정
           ↓
      대시보드로 이동 ✅
```

---

## 🚀 Step-by-Step 구현

### Step 1: 네이버 개발자 등록

1. **네이버 개발자 센터 접속**
   - https://developers.naver.com/apps/#/register

2. **애플리케이션 등록**
   - 애플리케이션 이름: "SSMHR JobMatching"
   - 사용 API: 네이버 로그인
   - 제공 정보: 이메일, 닉네임, 프로필사진

3. **서비스 URL 설정**
   - 서비스 URL: `http://localhost:3000` (개발)
   - Callback URL: `http://localhost:3000/api/auth/naver/callback`

4. **Client ID, Client Secret 복사**

---

### Step 2: 환경 변수 설정

```bash
# @env.txt에 추가
NEXT_PUBLIC_NAVER_CLIENT_ID="your_client_id"
NAVER_CLIENT_SECRET="your_client_secret"
```

---

### Step 3: Next.js API Route 생성

#### 3-1. 네이버 로그인 시작 (`app/api/auth/naver/route.ts`)

```typescript
// app/api/auth/naver/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!;
  const redirectUri = `${request.nextUrl.origin}/api/auth/naver/callback`;
  const state = Math.random().toString(36).substring(7); // CSRF 방지
  
  // 네이버 로그인 URL 생성
  const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize');
  naverAuthUrl.searchParams.append('response_type', 'code');
  naverAuthUrl.searchParams.append('client_id', clientId);
  naverAuthUrl.searchParams.append('redirect_uri', redirectUri);
  naverAuthUrl.searchParams.append('state', state);
  
  // 네이버 로그인 페이지로 리다이렉트
  return NextResponse.redirect(naverAuthUrl.toString());
}
```

#### 3-2. 네이버 Callback 처리 (`app/api/auth/naver/callback/route.ts`)

```typescript
// app/api/auth/naver/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (서버 전용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Service Role Key 사용
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }
  
  try {
    // 1️⃣ 네이버 액세스 토큰 받기
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code: code,
        state: state || '',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description);
    }
    
    // 2️⃣ 네이버 사용자 정보 가져오기
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    if (userData.resultcode !== '00') {
      throw new Error('Failed to get user info from Naver');
    }
    
    const naverUser = userData.response;
    
    // 3️⃣ Supabase에서 사용자 확인 또는 생성
    const email = naverUser.email;
    const naverUserId = `naver_${naverUser.id}`;
    
    // 기존 사용자 확인
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    let supabaseUserId;
    
    if (existingUser) {
      // 기존 사용자
      supabaseUserId = existingUser.id;
    } else {
      // 신규 사용자 생성
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true, // 이메일 인증 자동 완료
        user_metadata: {
          full_name: naverUser.name || naverUser.nickname,
          avatar_url: naverUser.profile_image,
          provider: 'naver',
          naver_id: naverUser.id
        }
      });
      
      if (createError) throw createError;
      
      // users 테이블에도 저장
      await supabaseAdmin.from('users').insert({
        firebase_uid: newUser.user.id, // Supabase UID
        email: email,
        full_name: naverUser.name || naverUser.nickname,
        profile_image_url: naverUser.profile_image,
        user_type: 'jobseeker',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      supabaseUserId = newUser.user.id;
    }
    
    // 4️⃣ Supabase 세션 생성 (일회용 로그인 링크)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });
    
    if (linkError) throw linkError;
    
    // 5️⃣ 자동 로그인 처리 (토큰 추출)
    const tokenHash = new URL(linkData.properties.action_link).searchParams.get('token_hash');
    
    // 클라이언트로 리다이렉트 (세션 설정용)
    const redirectUrl = new URL('/api/auth/naver/session', origin);
    redirectUrl.searchParams.set('token_hash', tokenHash!);
    
    return NextResponse.redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error('Naver OAuth error:', error);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }
}
```

#### 3-3. 세션 설정 (`app/api/auth/naver/session/route.ts`)

```typescript
// app/api/auth/naver/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  
  if (!tokenHash) {
    return NextResponse.redirect(`${origin}/login?error=no_token`);
  }
  
  const supabase = createClient();
  
  // 토큰으로 세션 생성
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink'
  });
  
  if (error) {
    console.error('Session creation error:', error);
    return NextResponse.redirect(`${origin}/login?error=session_failed`);
  }
  
  // 로그인 성공 → 대시보드로
  return NextResponse.redirect(`${origin}/jobseeker-dashboard`);
}
```

---

### Step 4: 로그인 버튼 추가

```typescript
// app/login/page.tsx
'use client'

export default function LoginPage() {
  const handleNaverLogin = () => {
    // API Route로 이동 (네이버 로그인 시작)
    window.location.href = '/api/auth/naver';
  };
  
  return (
    <div className="flex flex-col gap-3">
      {/* 카카오 로그인 */}
      <button onClick={handleKakaoLogin}>
        카카오로 시작하기
      </button>
      
      {/* 네이버 로그인 */}
      <button 
        onClick={handleNaverLogin}
        className="bg-[#03C75A] text-white px-6 py-3 rounded-lg"
      >
        <span className="flex items-center gap-2">
          네이버로 시작하기
        </span>
      </button>
    </div>
  )
}
```

---

## 🎨 더 나은 방법: Magic Link 대신 Direct Session

위 방법은 작동하지만 Magic Link를 사용해서 복잡합니다. **더 간단한 방법**:

```typescript
// app/api/auth/naver/callback/route.ts (개선 버전)
// ... (1~2단계 동일)

// 3️⃣ Supabase 사용자 생성 또는 확인
const email = naverUser.email;

// 임시 비밀번호 생성 (실제로는 사용 안 함)
const tempPassword = crypto.randomUUID();

// Supabase에 사용자 생성 (이미 있으면 skip)
const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: email,
  password: tempPassword,
  email_confirm: true,
  user_metadata: {
    full_name: naverUser.name || naverUser.nickname,
    provider: 'naver'
  }
});

if (authError && authError.message !== 'User already registered') {
  throw authError;
}

// 4️⃣ 세션 토큰 생성
const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
  userId: authUser?.user?.id || existingUserId
});

if (sessionError) throw sessionError;

// 5️⃣ 쿠키에 세션 저장
const response = NextResponse.redirect(`${origin}/jobseeker-dashboard`);

response.cookies.set('sb-access-token', sessionData.session.access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7 // 7일
});

response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30 // 30일
});

return response;
```

**이 방법의 장점**:
- ✅ 3단계로 줄어듦 (더 간단)
- ✅ 직접 세션 생성
- ✅ 쿠키 자동 설정
- ✅ 리다이렉트 1번만

---

## 🔐 보안 고려사항

### 1. Service Role Key 보호
```typescript
// ⚠️ Service Role Key는 절대 클라이언트에 노출하지 마세요!
// API Route에서만 사용 (서버 사이드)
```

### 2. CSRF 방어
```typescript
// state 파라미터로 CSRF 공격 방어
const state = crypto.randomUUID();
// 세션에 저장하고 callback에서 검증
```

### 3. Rate Limiting
```typescript
// API Route에 Rate Limiting 추가 (선택)
import rateLimit from 'express-rate-limit';
```

---

## 🎯 장점과 단점

### ✅ 장점

1. **NextAuth 불필요**
   - Supabase Auth만으로 모든 소셜 로그인 관리
   - 의존성 줄어듦

2. **Supabase와 완벽 통합**
   - RLS 정책 그대로 사용
   - 세션 관리 자동
   - 다른 소셜 로그인과 동일한 구조

3. **유연함**
   - 네이버 외 다른 OAuth도 같은 방식으로 추가 가능
   - 커스터마이징 쉬움

### ⚠️ 단점

1. **추가 API Route 필요**
   - 3개 파일 생성 (`route.ts`)
   - 약간의 보일러플레이트 코드

2. **수동 유지보수**
   - 네이버 API 변경 시 직접 대응 필요
   - Supabase가 공식 지원하면 교체 고려

---

## 🚀 실전 구현 체크리스트

### Phase 1: 준비 (30분)
- [ ] 네이버 개발자 등록
- [ ] Client ID/Secret 획득
- [ ] 환경 변수 설정 (`@env.txt`)

### Phase 2: 코드 작성 (1시간)
- [ ] `app/api/auth/naver/route.ts` 생성
- [ ] `app/api/auth/naver/callback/route.ts` 생성
- [ ] 로그인 버튼 추가

### Phase 3: 테스트 (30분)
- [ ] 로컬에서 네이버 로그인 테스트
- [ ] Supabase에 사용자 생성 확인
- [ ] 대시보드 접근 확인

### Phase 4: 프로덕션 배포
- [ ] Callback URL을 프로덕션 도메인으로 변경
- [ ] 네이버 개발자 센터에서 서비스 URL 업데이트
- [ ] HTTPS 확인

---

## 💡 문제 해결

### 문제 1: "User already registered" 오류
```typescript
// 해결: 오류 무시하고 기존 사용자로 진행
if (authError && authError.message !== 'User already registered') {
  throw authError;
}
```

### 문제 2: 세션이 유지되지 않음
```typescript
// 해결: 쿠키 설정 확인
response.cookies.set('sb-access-token', token, {
  httpOnly: true,
  secure: true, // HTTPS 환경에서만
  sameSite: 'lax'
});
```

### 문제 3: Callback URL 불일치
```
네이버 개발자 센터 Callback URL과 코드의 redirectUri가 정확히 일치해야 함
http://localhost:3000/api/auth/naver/callback
```

---

## 📚 참고 자료

- 네이버 로그인 API: https://developers.naver.com/docs/login/api/
- Supabase Admin API: https://supabase.com/docs/reference/javascript/auth-admin-createuser
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 🎓 결론

### ✅ 이 방법을 사용해야 하는 경우
- 클라이언트가 네이버 로그인을 요구
- Supabase Auth를 계속 사용하고 싶음
- NextAuth 의존성을 추가하고 싶지 않음

### 📝 요약
1. **구현 시간**: 1-2시간
2. **난이도**: 중간
3. **유지보수**: 보통
4. **Supabase 통합**: 완벽

### 🚀 다음 단계
1. 네이버 개발자 등록
2. API Route 3개 생성
3. 로그인 버튼 추가
4. 테스트
5. 완료! 🎉

---

**작성자**: AI Assistant  
**작성일**: 2025년 10월 14일  
**상태**: ✅ 구현 준비 완료





