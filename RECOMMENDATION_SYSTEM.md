# 📊 채용공고 추천 시스템 문서

## 개요

구직자의 프로필 데이터를 기반으로 맞춤형 채용공고를 추천하는 AI 매칭 시스템입니다.

---

## 🎯 매칭 알고리즘

### 점수 계산 기준 (총 110점)

#### 1. 기술 스택 매칭 (40점) 🔥 **최우선**
- **구직자 데이터**: `profile.skills` (배열)
- **채용공고 데이터**: `job.tags` (배열)
- **매칭 로직**:
  - 구직자가 보유한 기술 중 채용공고 태그와 일치하는 비율 계산
  - 대소문자 구분 없이 부분 일치 허용
  - 예: `React` ↔ `react`, `TypeScript` ↔ `typescript`
- **점수 계산**:
  ```
  매칭된 기술 수 / 구직자 전체 기술 수 × 40점
  ```

#### 2. 위치 매칭 (25점)
- **구직자 데이터**: `profile.preferredLocations` (배열)
- **채용공고 데이터**: `job.location` (문자열)
- **매칭 로직**:
  - 희망 근무지에 채용공고 위치가 포함되는지 확인
  - 시/도 단위 매칭 (예: "서울" → "서울 강남구")
- **점수**: 매칭 시 25점, 불일치 시 0점

#### 3. 연봉 범위 매칭 (20점)
- **구직자 데이터**: `profile.salaryRange.min`, `profile.salaryRange.max`
- **채용공고 데이터**: `job.salary.min`, `job.salary.max`
- **매칭 로직**:
  - 구직자 희망 연봉과 공고 제시 연봉의 겹치는 범위 계산
  - 겹치는 범위가 넓을수록 높은 점수
- **점수 계산**:
  ```
  겹치는 연봉 범위 / 구직자 희망 연봉 범위 × 20점
  ```
- **예시**:
  ```
  구직자: 5000만원 ~ 8000만원
  공고: 6000만원 ~ 9000만원
  겹치는 범위: 6000만원 ~ 8000만원 (2000만원)
  구직자 범위: 3000만원
  점수: (2000 / 3000) × 20 = 13.3점
  ```

#### 4. 직무명 매칭 (15점)
- **구직자 데이터**: `profile.desiredPositions` (배열)
- **채용공고 데이터**: `job.title` (문자열)
- **매칭 로직**:
  - 희망 직무에 공고 제목이 포함되는지 확인
  - 부분 일치 허용 (예: "프론트엔드" ↔ "프론트엔드 개발자")
- **점수**: 매칭 시 15점, 불일치 시 0점

#### 5. 고용 형태 매칭 (10점) 🆕
- **구직자 데이터**: `profile.workType` (문자열)
- **채용공고 데이터**: `job.employmentType` (enum)
- **매칭 로직**:
  - 정규직 ↔ FULL_TIME
  - 계약직/프리랜서 ↔ CONTRACT
  - 인턴 ↔ INTERNSHIP
- **점수**: 매칭 시 10점, 불일치 시 0점

#### 6. 비자 후원 필터링 (필수 조건) 🆕 🔥
- **구직자 데이터**: `profile.visaSponsorship` (boolean)
- **채용공고 데이터**: `job.visaSponsorship` (boolean)
- **매칭 로직**:
  - 구직자가 비자 필요한데 공고에서 미제공 시 **70% 감점**
  - 비자 필요 시 필터링으로 비자 제공 공고만 표시
- **영향**: 외국인 인재 플랫폼의 핵심 기능!

---

## 📝 구직자 프로필 데이터 구조

```typescript
interface JobseekerProfile {
  // 기술 스택 (40점)
  skills?: string[];  
  // 예: ["React", "TypeScript", "Next.js"]

  // 희망 근무지 (25점)
  preferredLocations?: string[];  
  // 예: ["서울", "경기"]

  // 희망 연봉 (20점)
  salaryRange?: {
    min: string | number;  // 만원 단위 또는 원 단위
    max: string | number;
  };
  // 예: { min: "5000", max: "8000" } 또는 { min: 50000000, max: 80000000 }

  // 희망 직무 (15점)
  desiredPositions?: string[];
  // 예: ["프론트엔드 개발자", "웹 개발자"]

  // 기타 정보
  languages?: string[];
  experiences?: Array<...>;
  educations?: Array<...>;
}
```

---

## 🔍 채용공고 데이터 구조

```typescript
interface Job {
  id: string;
  title: string;           // 직무명
  company: Company;
  location: string;        // 근무지
  
  salary: {
    min: number;          // 최소 연봉 (원 단위)
    max: number;          // 최대 연봉 (원 단위)
    currency: string;
    negotiable: boolean;
  };
  
  tags: string[];         // 기술 스택
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  
  requirements: string[];
  benefits: string[];
  visaSponsorship: boolean;
}
```

---

## 🚀 추천 로직 실행 흐름

### 1. 프로필 로드
```typescript
const profile = await getJobseekerProfile(user.uid);
```

### 2. 매칭 점수 계산
```typescript
const jobsWithScores = allJobs.map(job => ({
  job,
  score: calculateJobMatchScore(profile, job)  // 0-100점
}));
```

### 3. 필터링 및 정렬
```typescript
return jobsWithScores
  .filter(item => item.score > 20)    // 최소 20점 이상만 추천
  .sort((a, b) => b.score - a.score)  // 점수 높은 순 정렬
  .slice(0, limit)                     // 상위 N개만 반환
  .map(item => item.job);
```

---

## 📊 매칭 예시

### 구직자 프로필
```json
{
  "skills": ["React", "TypeScript", "Next.js"],
  "preferredLocations": ["서울"],
  "salaryRange": { "min": "5000", "max": "8000" },
  "desiredPositions": ["프론트엔드 개발자"]
}
```

### 채용공고 A
```json
{
  "title": "프론트엔드 개발자",
  "location": "서울 강남구",
  "salary": { "min": 60000000, "max": 90000000 },
  "tags": ["React", "TypeScript", "Frontend"]
}
```

### 점수 계산
- **기술 스택**: React, TypeScript 매칭 (2/3) = **26.7점**
- **위치**: 서울 매칭 = **25점**
- **연봉**: 6000~8000 겹침 (2000/3000) = **13.3점**
- **직무**: "프론트엔드 개발자" 매칭 = **15점**
- **총점**: **80점** ⭐ 강력 추천!

---

## 💡 개선 방향

### 현재 구현 ✅
- [x] 기본 매칭 알고리즘 (기술/위치/연봉/직무)
- [x] 점수 기반 정렬
- [x] 최소 점수 필터링 (20점)
- [x] 프로필 미완성 시 기본 공고 표시

### 향후 개선 사항 🚧
- [ ] 경력 수준 매칭 (ENTRY/JUNIOR/MID/SENIOR)
- [ ] 언어 능력 매칭 (languageRequirements)
- [ ] 비자 스폰서십 필터링
- [ ] 기업 규모/산업 선호도
- [ ] 근무 형태 매칭 (재택/하이브리드)
- [ ] 머신러닝 기반 개인화 추천
- [ ] 클릭/지원 데이터 기반 학습

---

## 🔧 사용 방법

### 함수 호출
```typescript
import { getRecommendedJobs } from '@/lib/utils';
import { jobs } from '@/lib/data';

// 추천 공고 3개 가져오기
const recommended = getRecommendedJobs(profile, jobs, 3);
```

### 대시보드에서 사용
```typescript
const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);

useEffect(() => {
  const profile = await getJobseekerProfile(user.uid);
  const recommended = getRecommendedJobs(profile, jobs, 3);
  setRecommendedJobs(recommended);
}, [user]);
```

---

## 📈 성능 고려사항

- **시간 복잡도**: O(n × m)
  - n: 전체 채용공고 수
  - m: 구직자 기술 스택 수
- **최적화**: 
  - 소문자 변환 캐싱
  - 메모이제이션
  - 서버 사이드 캐싱 (향후)

---

## 🎨 UI/UX

### 추천 섹션 표시
- 추천 공고가 있을 때: 카드 형태로 표시 + "(프로필 기반 매칭)" 라벨
- 추천 공고가 없을 때: 프로필 완성 유도 CTA

### 디버깅 로그
```typescript
console.log('📊 Loaded Profile Data:', profile);
console.log('✨ Recommended Jobs:', recommended);
```

---

## 📚 참고 문서

- **타입 정의**: `types/index.ts`
- **추천 함수**: `lib/utils.ts`
- **프로필 서비스**: `lib/firebase/jobseeker-service.ts`
- **채용공고 데이터**: `lib/data.ts`

---

## 🔒 데이터 개인정보 보호

- 모든 매칭은 클라이언트 사이드에서 실행
- 사용자 프로필 데이터는 Firebase Auth로 보호
- 추천 결과는 사용자 세션에만 저장

---

**작성일**: 2025-09-30  
**버전**: 1.0.0  
**작성자**: AI Assistant
