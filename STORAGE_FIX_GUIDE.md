# 🔧 Firebase Storage CORS 오류 완벽 해결 가이드

## 📋 현재 상황
- **오류**: Firebase Storage CORS 정책 위반
- **원인**: Storage 버킷에 CORS 설정이 적용되지 않음
- **검사 결과**: 두 가능한 버킷명 모두 404 응답 (Storage가 활성화되지 않았을 가능성)

## 🎯 해결 단계

### Step 1: Firebase Console에서 Storage 활성화 확인
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 `jobmatching-9fed0` 선택
3. 왼쪽 메뉴 → **Storage** 클릭
4. **다음 중 하나를 확인**:
   - Storage가 활성화되지 않음 → "시작하기" 버튼 클릭하여 활성화
   - Storage가 활성화됨 → 상단에 표시된 버킷명 확인 (gs://xxx.xxx 형식)

### Step 2: 실제 버킷명 확인
Firebase Console Storage 페이지 상단에서:
```
gs://jobmatching-9fed0.appspot.com
또는
gs://jobmatching-9fed0.firebasestorage.app
```

### Step 3: .env.local 파일 수정
실제 버킷명에 맞게 수정:
```env
# gs:// 제외하고 버킷명만 입력
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="실제_버킷명"
```

### Step 4: Google Cloud Console에서 CORS 적용

#### 방법 A: Cloud Shell 사용 (권장) ✅
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택: `jobmatching-9fed0`
3. 우측 상단 터미널 아이콘 클릭 (Cloud Shell 활성화)
4. 다음 명령어 실행:

```bash
# CORS 설정 파일 생성
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-firebase-storage-version", "x-goog-content-length-range"]
  }
]
EOF

# 실제 버킷명으로 교체하여 실행
gsutil cors set cors.json gs://실제_버킷명

# CORS 설정 확인
gsutil cors get gs://실제_버킷명
```

#### 방법 B: 로컬 Windows PowerShell 사용
1. [Google Cloud SDK 다운로드](https://cloud.google.com/sdk/docs/install)
2. 설치 후 PowerShell에서:

```powershell
# Google Cloud 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project jobmatching-9fed0

# CORS 적용 (현재 디렉토리의 cors.json 사용)
gsutil cors set cors.json gs://실제_버킷명

# 확인
gsutil cors get gs://실제_버킷명
```

### Step 5: Firebase Storage Rules 설정
Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 모든 읽기 허용 (개발 중)
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 프로필 이미지 경로 규칙
    match /profileImages/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 6: 애플리케이션 재시작
```bash
# 개발 서버 재시작
npm run dev
```

## 🔍 문제 지속 시 확인사항

### 1. 브라우저 캐시 확인
- 개발자 도구 → Network 탭 → "Disable cache" 체크
- Ctrl + Shift + R (강력 새로고침)

### 2. Firebase 프로젝트 설정 확인
```javascript
// lib/firebase/config.ts에서
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
```

### 3. Storage 초기화 확인
Firebase Console에서:
- Storage가 "시작하기" 상태인지 확인
- Blaze 요금제 필요 여부 확인 (2024년 10월 이후 생성 프로젝트)

## 🚨 즉시 해결 방법 (임시)

### 대안 1: Public 버킷 사용 (개발용)
Cloud Console에서 버킷 권한을 임시로 public으로 설정:
```bash
gsutil iam ch allUsers:objectViewer gs://버킷명
```
**⚠️ 주의: 프로덕션에서는 사용 금지**

### 대안 2: Proxy 서버 사용
Next.js API Route를 통해 우회:
```javascript
// app/api/storage-proxy/route.ts
export async function GET(request) {
  // Firebase Admin SDK로 Storage 접근
}
```

## 📝 체크리스트
- [ ] Firebase Storage 활성화 확인
- [ ] 실제 버킷명 확인
- [ ] .env.local 수정
- [ ] CORS 설정 적용
- [ ] Storage Rules 업데이트
- [ ] 브라우저 캐시 삭제
- [ ] 애플리케이션 재시작
- [ ] 테스트

## 💡 추가 도움
- [Firebase Storage 문서](https://firebase.google.com/docs/storage/web/start)
- [CORS 설정 문서](https://cloud.google.com/storage/docs/configuring-cors)
- [Storage Rules 문서](https://firebase.google.com/docs/storage/security)