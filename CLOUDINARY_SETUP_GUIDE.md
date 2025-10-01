# 📸 Cloudinary 완벽 설정 가이드

## 🎯 개요

이 가이드는 Cloudinary를 프로젝트에 완벽히 통합하는 방법을 단계별로 설명합니다.

---

## 📋 Step 1: Cloudinary 계정 설정

### 1.1 계정 확인
- Cloud Name: `dghxms4ty` (이미 설정됨)
- 대시보드: https://console.cloudinary.com

### 1.2 API 키 확인
1. Cloudinary Console 로그인
2. Dashboard → Settings → API Keys
3. 다음 정보 복사:
   - **API Key**: 숫자로 된 키
   - **API Secret**: 알파벳+숫자 조합

### 1.3 환경 변수 업데이트

`@env.txt` 파일에서 실제 값으로 교체:

```env
# Cloudinary Config
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dghxms4ty"
CLOUDINARY_API_KEY="여기에_실제_API_Key_입력"
CLOUDINARY_API_SECRET="여기에_실제_API_Secret_입력"
CLOUDINARY_URL="cloudinary://실제API_Key:실제API_Secret@dghxms4ty"
```

---

## 📋 Step 2: Upload Preset 생성

Upload Preset은 업로드 시 자동으로 적용되는 설정입니다.

### 2.1 Unsigned Upload Preset 생성 (권장)

1. **Settings → Upload** 이동
2. **Upload presets** 섹션 찾기
3. **Add upload preset** 클릭

#### Preset 1: 일반 Unsigned Preset

```
Preset name: jobmatch_unsigned
Signing mode: Unsigned
Folder: (비워둠 - 업로드 시 동적으로 지정)
```

**Advanced Settings**:
```
✅ Unique filename: true
✅ Overwrite: false
✅ Auto tagging: 0.6
Format: Auto
Quality: Auto
```

**Transformations**:
```
Transformation:
  - Quality: auto
  - Format: auto
  - Fetch format: auto
```

**Upload Manipulations**:
```
✅ Invalidate: true
Max file size: 5242880 (5MB)
```

#### Preset 2: 프로필 전용 (선택사항)

```
Preset name: jobmatch_profile
Signing mode: Unsigned
Folder: jobmatch/profiles
```

**Transformations**:
```
Incoming:
  - Width: 800
  - Height: 800
  - Crop: limit
  - Quality: auto:good
  - Format: auto
```

#### Preset 3: 로고 전용 (선택사항)

```
Preset name: jobmatch_logo
Signing mode: Unsigned
Folder: jobmatch/logos
```

**Transformations**:
```
Incoming:
  - Width: 500
  - Height: 500
  - Crop: limit
  - Quality: auto:good
  - Format: auto
```

#### Preset 4: 배너 전용 (선택사항)

```
Preset name: jobmatch_banner
Signing mode: Unsigned
Folder: jobmatch/banners
```

**Transformations**:
```
Incoming:
  - Width: 1600
  - Height: 600
  - Crop: limit
  - Quality: auto:good
  - Format: auto
```

### 2.2 현재 프로젝트 설정

현재는 **단일 Unsigned Preset** (`jobmatch_unsigned`)을 사용하고 있습니다.

이 방식의 장점:
- ✅ 간단한 설정
- ✅ 프론트엔드에서 직접 업로드 가능
- ✅ API Secret 노출 없음
- ✅ 폴더는 업로드 시 동적으로 지정

---

## 📋 Step 3: 프로젝트 파일 구조

```
프로젝트/
├── lib/
│   └── cloudinary/
│       ├── config.ts          # Cloudinary 설정
│       └── upload.ts          # 업로드 유틸리티
├── components/
│   ├── CloudinaryUpload.tsx  # 업로드 컴포넌트
│   └── OptimizedImage.tsx    # 최적화된 이미지 표시
└── @env.txt                  # 환경 변수
```

---

## 📋 Step 4: 코드 설명

### 4.1 CloudinaryUpload 컴포넌트

```typescript
<CloudinaryUpload
  type="profile"              // 'profile' | 'logo' | 'banner'
  currentImageUrl={imageUrl}  // 기존 이미지 URL (선택)
  onUploadSuccess={(url, publicId) => {
    // 업로드 성공 시 콜백
    setImageUrl(url);
  }}
  userId={user.uid}           // 사용자 ID (폴더 분리용)
/>
```

**타입별 설정:**
- `profile`: 1:1 비율, 얼굴 인식 크롭, 최대 800x800
- `logo`: 1:1 비율, 중앙 정렬, 최대 500x500
- `banner`: 3:1 비율, 자동 크롭, 최대 1600x533

### 4.2 OptimizedImage 컴포넌트

```typescript
<OptimizedImage
  src={imageUrl}
  alt="프로필 사진"
  width={300}
  height={300}
  type="profile"
  className="rounded-full"
/>
```

**자동 최적화:**
- ✅ WebP/AVIF 자동 변환
- ✅ 품질 자동 조정
- ✅ Lazy loading
- ✅ CDN 전송

---

## 📋 Step 5: 폴더 구조

Cloudinary에 다음과 같은 폴더 구조로 저장됩니다:

```
cloudinary://dghxms4ty/
└── jobmatch/
    ├── profiles/
    │   ├── {userId}/
    │   │   ├── 1234567890_profile.jpg
    │   │   └── 1234567891_profile.jpg
    ├── logos/
    │   ├── {companyId}/
    │   │   └── 1234567890_logo.png
    └── banners/
        ├── {companyId}/
        │   └── 1234567890_banner.jpg
```

---

## 📋 Step 6: 보안 설정

### 6.1 환경 변수 보호

```bash
# .gitignore에 추가 (이미 되어있음)
.env.local
@env.txt
```

### 6.2 Upload Preset 보안

**Unsigned Preset 사용 시:**
- ✅ API Secret 노출 없음
- ✅ 브라우저에서 직접 업로드
- ⚠️ 폴더 제한 없음 (업로드 시 지정)

**제한 설정 (선택사항):**
1. Settings → Security → Allowed fetch domains
2. 도메인 추가:
   ```
   localhost:3000
   *.vercel.app
   yourdomain.com
   ```

### 6.3 Media Library 보안

1. Settings → Security → Restricted media types
2. 허용 타입만 선택:
   - ✅ image/jpeg
   - ✅ image/png
   - ✅ image/webp

---

## 📋 Step 7: 테스트

### 7.1 개발 서버 재시작

```bash
npm run dev
```

### 7.2 업로드 테스트

1. **구직자 온보딩**
   - `/onboarding/job-seeker?step=1`
   - 프로필 사진 업로드 테스트

2. **기업 온보딩**
   - `/company-auth/onboarding` (Step 3)
   - 로고 & 배너 업로드 테스트

### 7.3 확인사항

- ✅ 업로드 진행 표시
- ✅ 이미지 미리보기
- ✅ Cloudinary Console에 이미지 저장 확인
- ✅ Firestore에 URL 저장 확인
- ✅ 크롭 기능 작동
- ✅ 에러 메시지 표시

---

## 📋 Step 8: 고급 설정 (선택사항)

### 8.1 이미지 최적화 프리셋

Cloudinary Console → Transformations → Named transformations 생성:

```
profile_thumb:
  c_thumb,g_face,w_150,h_150,q_auto,f_auto

profile_medium:
  c_fill,g_face,w_300,h_300,q_auto,f_auto

logo_small:
  c_fit,w_100,h_100,q_auto,f_auto

banner_full:
  c_fill,g_auto,w_1200,h_400,q_auto,f_auto
```

### 8.2 AI 기능 활성화

1. Settings → Add-ons
2. **추천 Add-ons:**
   - ✅ Auto Crop (무료)
   - ✅ Auto Tag (무료 25,000 크레딧)
   - 💎 Background Removal (유료)
   - 💎 AI Content Analysis (유료)

### 8.3 Webhook 설정 (백업/로깅)

1. Settings → Webhooks
2. Notification URL 추가:
   ```
   https://yourdomain.com/api/cloudinary/webhook
   ```
3. Events 선택:
   - ✅ Upload
   - ✅ Delete

---

## 📋 Step 9: 모니터링

### 9.1 사용량 확인

Dashboard → Usage:
- Storage used: XX GB / 25 GB
- Bandwidth: XX GB / 25 GB
- Transformations: XX / 25,000

### 9.2 무료 한도

```
✅ Storage: 25 GB
✅ Bandwidth: 25 GB/월
✅ Transformations: 25,000 크레딧/월
✅ Video: 5 GB storage, 25 GB bandwidth
```

**예상 사용량:**
- 이미지 1개: 평균 500 KB
- 25 GB = 약 50,000개 이미지
- 1000명 사용자 x 3개 이미지 = 1.5 GB

---

## 📋 Step 10: 문제 해결

### 10.1 업로드 실패

**증상:** "Upload failed" 에러

**해결:**
1. Upload Preset 이름 확인 (`jobmatch_unsigned`)
2. Signing mode가 "Unsigned"인지 확인
3. 브라우저 콘솔에서 에러 확인
4. 파일 크기 확인 (5MB 이하)

### 10.2 이미지 표시 안 됨

**증상:** 이미지 URL이 있는데 표시 안 됨

**해결:**
1. URL 형식 확인: `https://res.cloudinary.com/dghxms4ty/...`
2. 브라우저 Network 탭에서 404 확인
3. Cloudinary Console에서 이미지 존재 확인

### 10.3 CORS 에러

**증상:** "CORS policy" 에러

**해결:**
1. Cloudinary는 기본적으로 CORS 허용
2. 문제 지속 시 Settings → Security → CORS 확인

### 10.4 Preset 찾을 수 없음

**증상:** "Invalid upload preset" 에러

**해결:**
1. Upload Preset 이름 정확히 입력: `jobmatch_unsigned`
2. Signing mode: Unsigned
3. Preset 저장 후 몇 분 대기

---

## 📋 Step 11: 다음 단계

### 11.1 기능 확장

- [ ] 프로필 이미지 다중 업로드
- [ ] 이미지 편집 기능 (필터, 회전)
- [ ] 동영상 업로드 지원
- [ ] AI 배경 제거

### 11.2 최적화

- [ ] Named Transformations 사용
- [ ] 이미지 압축 강화
- [ ] CDN 캐싱 설정
- [ ] Lazy loading 개선

### 11.3 모니터링

- [ ] Cloudinary Analytics 연동
- [ ] 업로드 성공률 추적
- [ ] 사용량 알림 설정
- [ ] 에러 로깅

---

## 🎯 체크리스트

완료된 항목을 체크하세요:

- [ ] Cloudinary 계정 확인
- [ ] API Key, Secret 확인
- [ ] @env.txt 파일 업데이트
- [ ] Upload Preset 생성 (`jobmatch_unsigned`)
- [ ] Signing mode: Unsigned 설정
- [ ] 패키지 설치 완료 (`npm install`)
- [ ] 개발 서버 재시작
- [ ] 구직자 프로필 업로드 테스트
- [ ] 기업 로고/배너 업로드 테스트
- [ ] Cloudinary Console에서 이미지 확인
- [ ] Firestore에 URL 저장 확인
- [ ] 최적화된 이미지 표시 확인

---

## 📞 도움이 필요하면

1. **Cloudinary 문서**: https://cloudinary.com/documentation
2. **Next.js 통합**: https://next.cloudinary.dev/
3. **Upload Widget**: https://cloudinary.com/documentation/upload_widget
4. **Support**: https://support.cloudinary.com/

---

## 🎉 완료!

Cloudinary가 성공적으로 통합되었습니다! 이제:
- ✅ CORS 문제 해결
- ✅ 자동 이미지 최적화
- ✅ CDN 전송
- ✅ 프로페셔널한 UX
- ✅ 무료로 시작

**Happy Coding! 🚀**
