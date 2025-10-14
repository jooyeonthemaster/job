# 🔍 인재 상세 페이지 빈 필드 원인 분석

## 🚨 문제 현상

인재 상세 페이지에 다음 탭들이 **비어있는 상태**로 표시됨:
1. ❌ 프로젝트 탭 - 빈 페이지
2. ❌ 평가 탭 - 빈 페이지  
3. ❌ 자격증 탭 - 빈 페이지

---

## 🔬 근본 원인 분석

### 문제 1️⃣: **온보딩에서 수집하지 않는 데이터**

#### 온보딩 4단계에서 수집하는 데이터
```typescript
// Step 1: 기본 정보
fullName ✅
headline ✅
profileImageUrl ✅

// Step 2: 경력 및 학력
experiences[] ✅
educations[] ✅

// Step 3: 스킬 및 언어
skills[] ✅
languages[] ✅

// Step 4: 선호 조건
desiredPositions[] ✅
preferredLocations[] ✅
salaryRange ✅
workType ✅
companySize ✅
visaSponsorship ✅
remoteWork ✅
introduction ✅
```

**총 15개 필드 수집**

#### TalentProfile에만 있는 추가 필드
```typescript
// 온보딩에서 수집하지 않음!
projects?: Project[]          ❌ 프로젝트 포트폴리오
certifications?: Certification[]  ❌ 자격증
reviews?: Review[]            ❌ 고객 평가
achievements?: string[]       ❌ 주요 성과
bio: string                   ❌ 간단 소개 (introduction과 별개)
rating?: number               ❌ 평균 평점
completedProjects?: number    ❌ 완료 프로젝트 수
preferredWorkStyle?: string[] ❌ 선호 근무 형태
currentEmployment?: string    ❌ 현재 직장
```

**TalentProfile 전용 필드: 9개**

---

## 📊 상세 비교표

| 필드 | 온보딩<br>수집 | TalentProfile<br>필요 | 현재<br>상태 | 빈 이유 |
|------|:---:|:---:|:---:|---------|
| **projects** | ❌ | ✅ | 🟡 | 온보딩에서 미수집 |
| **certifications** | ❌ | ✅ | 🟡 | 온보딩에서 미수집 |
| **reviews** | ❌ | ✅ | 🟡 | 기업이 작성해야 함 (시스템 기능) |
| **achievements** | ❌ | ✅ | 🟡 | 온보딩에서 미수집 |
| **bio** | ⚠️ | ✅ | ✅ | introduction 활용 |
| rating | ❌ | ⚠️ | 🟡 | reviews 평균값 (시스템 계산) |
| completedProjects | ❌ | ⚠️ | 🟡 | projects.length (시스템 계산) |
| preferredWorkStyle | ❌ | ⚠️ | ✅ | workType + remoteWork 활용 가능 |
| currentEmployment | ❌ | ⚠️ | ✅ | experiences[0] 활용 가능 |

---

## 🎯 각 빈 탭의 원인

### 1. 프로젝트 탭 (Projects)

**필요 데이터**:
```typescript
interface Project {
  id: string;
  title: string;              // 프로젝트명
  role: string;               // 역할
  duration: string;           // 기간
  description: string;        // 설명
  outcomes: string[];         // 성과
  technologies: string[];     // 사용 기술
  client?: string;            // 클라이언트
  teamSize?: number;          // 팀 규모
}
```

**온보딩 데이터**:
```typescript
// ❌ 프로젝트 관련 데이터 전혀 없음!
// experiences에 description이 있지만 프로젝트 단위는 아님
```

**결론**: 
- ❌ **온보딩에서 프로젝트 포트폴리오를 수집하지 않음**
- ⚠️ experiences의 description을 프로젝트로 변환 가능하나 부정확
- ✅ **해결책**: 온보딩 Step 2에 "프로젝트" 섹션 추가 필요

---

### 2. 평가 탭 (Reviews)

**필요 데이터**:
```typescript
interface Review {
  id: string;
  clientName: string;         // 평가자 이름
  clientTitle: string;        // 평가자 직책
  clientCompany: string;      // 평가자 회사
  rating: number;             // 평점 (1-5)
  comment: string;            // 코멘트
  projectTitle: string;       // 프로젝트명
  date: string;               // 날짜
  verified: boolean;          // 인증 여부
}
```

**온보딩 데이터**:
```typescript
// ❌ 평가 관련 데이터 전혀 없음!
```

**결론**:
- ❌ **구직자가 입력할 수 없는 데이터**
- ✅ **기업이 평가를 남겨야 생성됨** (시스템 기능)
- ✅ **해결책**: 평가 시스템 구축 필요 (프로젝트 완료 후 평가)
- 🎯 **당장 해결 불가** - 시스템 기능이므로 탭 삭제가 맞음 ✅

---

### 3. 자격증 탭 (Certifications)

**필요 데이터**:
```typescript
interface Certification {
  name: string;               // 자격증명
  issuer: string;             // 발급기관
  date: string;               // 발급일
  expiryDate?: string;        // 만료일
  credentialId?: string;      // 자격증 번호
  url?: string;               // 인증 URL
}
```

**온보딩 데이터**:
```typescript
// ❌ 자격증 관련 데이터 전혀 없음!
```

**결론**:
- ❌ **온보딩에서 자격증을 수집하지 않음**
- ✅ **해결책**: 온보딩 Step 3 또는 프로필 편집에 "자격증" 섹션 추가 필요
- 🎯 **당장은 탭 삭제가 맞음** ✅

---

## 📋 온보딩 vs 상세 페이지 완전 비교

### ✅ 온보딩에 있고 상세 페이지에도 있는 것

| 온보딩 필드 | 상세 페이지 필드 | 탭 | 상태 |
|-----------|-----------------|-----|------|
| fullName | name | 개요 | ✅ |
| headline | title | 개요 | ✅ |
| profileImageUrl | profileImage | 개요 | ✅ |
| experiences | workExperience | 경력사항 | ✅ |
| educations | education | 학력 | ✅ |
| skills | skills | 기술스택 | ✅ |
| languages | languages | 개요 | ✅ |
| introduction | aboutMe | 개요 | ✅ |

### ⚠️ 온보딩에 있지만 상세 페이지에 표시 안 되는 것

| 온보딩 필드 | 상세 페이지 필드 | 표시 위치 | 상태 |
|-----------|-----------------|----------|------|
| desiredPositions | ❌ | 없음 | ⚠️ 추가 필요 |
| preferredLocations | location (첫번째만) | 개요 | ⚠️ 전체 표시 필요 |
| salaryRange | expectedSalary | 개요 | ✅ |
| workType | ❌ | 없음 | ⚠️ 추가 필요 |
| companySize | ❌ | 없음 | ⚠️ 추가 필요 |
| visaSponsorship | visaStatus | 개요 | ✅ |
| remoteWork | ❌ | 없음 | ⚠️ 추가 필요 |

### ❌ 상세 페이지에만 있어서 빈 것

| 상세 페이지 필드 | 온보딩 수집 | 탭 이름 | 빈 이유 |
|---------------|:-------:|--------|---------|
| **projects** | ❌ | 프로젝트 | 온보딩 미수집 |
| **certifications** | ❌ | 자격증 | 온보딩 미수집 |
| **reviews** | ❌ | 평가 | 기업 작성 (시스템 기능) |
| achievements | ❌ | 개요 | 온보딩 미수집 |
| rating | ❌ | 개요 | reviews 계산값 |
| completedProjects | ❌ | 개요 | projects 계산값 |

---

## 🎯 해결 방안

### ✅ 즉시 해결 완료
1. **프로젝트 탭 삭제** - 온보딩에서 수집 안 함
2. **평가 탭 삭제** - 시스템 기능이므로 구현 전까지 불필요
3. **자격증 탭 삭제** - 온보딩에서 수집 안 함
4. **불필요한 버튼 삭제** - PDF 다운로드, 면접 일정, 계약서 전송

### ⚠️ 개요 탭에 추가 필요 (Phase 2)

#### 1. 선호 조건 섹션 추가
```tsx
{/* 선호 조건 */}
<div className="bg-white rounded-xl shadow-sm p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">선호 조건</h2>
  
  {/* 희망 직무 */}
  {talent.desiredPositions?.length > 0 && (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-2">희망 직무</p>
      <div className="flex flex-wrap gap-2">
        {talent.desiredPositions.map(pos => (
          <span key={pos} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
            {pos}
          </span>
        ))}
      </div>
    </div>
  )}
  
  {/* 고용 형태 */}
  {talent.workType && (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-1">고용 형태</p>
      <p className="text-sm text-gray-600">{talent.workType}</p>
    </div>
  )}
  
  {/* 회사 규모 */}
  {talent.companySize && (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-1">선호 회사 규모</p>
      <p className="text-sm text-gray-600">{talent.companySize}</p>
    </div>
  )}
  
  {/* 재택근무 */}
  {talent.remoteWork && (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">재택근무</p>
      <p className="text-sm text-gray-600">{talent.remoteWork}</p>
    </div>
  )}
</div>
```

### 🚧 향후 온보딩 개선 (Phase 3)

#### Step 2-2 추가: 프로젝트 포트폴리오
```typescript
{
  projects: [
    {
      title: "쇼핑몰 웹사이트 구축",
      role: "프론트엔드 리드",
      duration: "2023.03 - 2023.08 (6개월)",
      description: "React 기반 쇼핑몰 구축",
      outcomes: ["매출 30% 증가", "사용자 만족도 4.5/5"],
      technologies: ["React", "TypeScript", "Tailwind"]
    }
  ]
}
```

#### Step 3-2 추가: 자격증 및 인증
```typescript
{
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-05-15",
      expiryDate: "2026-05-15",
      credentialId: "AWS-12345",
      url: "https://aws.amazon.com/verify/12345"
    }
  ]
}
```

---

## 📊 현재 탭 구성

### Before (7개 탭)
```
1. 개요 ✅ (데이터 있음)
2. 경력사항 ✅ (experiences)
3. 학력 ✅ (educations)
4. 기술스택 ✅ (skills)
5. 프로젝트 ❌ (빈 페이지)
6. 평가 ❌ (빈 페이지)
7. 자격증 ❌ (빈 페이지)
```

### After (4개 탭) ✅
```
1. 개요 ✅ (자기소개, 언어, 성과)
2. 경력사항 ✅ (experiences → workExperience)
3. 학력 ✅ (educations → education)
4. 기술스택 ✅ (skills)
```

---

## 🎨 개요 탭 구성

### 현재 섹션
```
✅ 자기소개 (aboutMe / introduction)
✅ 빠른 요약
  ├─ 언어 능력 (languages)
  └─ 주요 성과 (achievements) - 빈 상태
✅ 주요 기술 (skills)
```

### 추가 필요 섹션
```
⚠️ 선호 조건
  ├─ 희망 직무 (desiredPositions)
  ├─ 고용 형태 (workType)
  ├─ 회사 규모 (companySize)
  └─ 재택근무 (remoteWork)
```

---

## 🔄 데이터 변환 이슈

### JobseekerProfile → TalentProfile 변환 시

#### ✅ 완벽 변환
```typescript
fullName → name
headline → title
skills → skills
introduction → aboutMe
```

#### ⚠️ 부분 변환
```typescript
experiences[] → workExperience[]
  ✅ company, position, startDate, endDate, current, description
  ❌ location (기본값: "Korea")
  ❌ achievements (빈 배열)
  ❌ technologies (빈 배열)

educations[] → education[]
  ✅ school → institution
  ✅ degree, field, startYear, endYear, current
  ❌ location (기본값: "Korea")
  ❌ gpa (undefined)

languages[] → languages[]
  ✅ 언어명
  ❌ level (기본값: "Fluent")
```

#### ❌ 변환 불가능 (데이터 없음)
```typescript
projects = undefined       // 온보딩 미수집
certifications = undefined // 온보딩 미수집
reviews = undefined        // 시스템 기능
achievements = undefined   // 온보딩 미수집
rating = undefined         // reviews 기반 계산
```

---

## 💡 개선 권장 사항

### Phase 1 ✅ (완료)
- [x] 프로젝트 탭 삭제
- [x] 평가 탭 삭제
- [x] 자격증 탭 삭제
- [x] 불필요한 버튼 삭제 (PDF, 면접, 계약서)

### Phase 2 (즉시 필요)
- [ ] 개요 탭에 "선호 조건" 섹션 추가
  - desiredPositions (희망 직무)
  - workType (고용 형태)
  - companySize (회사 규모)
  - remoteWork (재택근무)
- [ ] preferredLocations 전체 표시 (현재는 첫번째만)

### Phase 3 (온보딩 개선 - 2주 내)
- [ ] Step 2-2: 프로젝트 포트폴리오 추가
  - 프로젝트명, 역할, 기간, 설명, 성과
- [ ] Step 3-2: 자격증 추가
  - 자격증명, 발급기관, 발급일, 인증 URL
- [ ] Step 2: 경력에 추가 필드
  - 근무지 (location)
  - 사용 기술 (technologies)
  - 주요 성과 (achievements)

### Phase 4 (시스템 기능 - 1개월 내)
- [ ] 평가 시스템 구축
  - 프로젝트 완료 후 기업이 평가 작성
  - 평점, 코멘트, 인증 여부
- [ ] 평균 평점 자동 계산
- [ ] 프로필 조회 수, 컨택 수 통계

---

## 🎯 TalentProfile 타입 개선 필요

### 현재 TalentProfile (더미 데이터용)
```typescript
interface TalentProfile {
  // 기본
  id, name, title, nationality, location, experience
  
  // 스킬
  skills, languages
  
  // 추가 (온보딩에 없음)
  projects?, certifications?, reviews?, achievements?
  bio, rating?, completedProjects?
  
  // 연락처
  email?, phone?, linkedin?, github?, portfolio?
  
  // 상세
  education?, workExperience?
  visaStatus?, preferredWorkStyle?, currentEmployment?
}
```

### 개선된 TalentProfile (실제 데이터용)
```typescript
interface TalentProfile {
  // 기본 (JobseekerProfile에서 매핑)
  id: uid
  name: fullName
  title: headline
  location: preferredLocations[0]
  experience: experiences 기간 합산
  
  // 스킬 (직접 매핑)
  skills: skills
  languages: languages
  
  // 선호 조건 (추가 매핑 필요)
  desiredPositions: desiredPositions      🆕
  workType: workType                       🆕
  companySize: companySize                 🆕
  remoteWork: remoteWork                   🆕
  visaSponsorship: visaSponsorship         🆕
  
  // 상세
  aboutMe: introduction
  workExperience: experiences
  education: educations
  
  // 시스템 기능 (향후)
  projects?: (온보딩 추가 필요)
  certifications?: (온보딩 추가 필요)
  reviews?: (시스템 기능)
  rating?: (reviews 평균)
}
```

---

## 📊 최종 결론

### 빈 페이지 원인 요약

1. **프로젝트 탭** 🟡
   - 원인: 온보딩에서 프로젝트 포트폴리오 미수집
   - 해결: 탭 삭제 (완료) 또는 온보딩 개선 (향후)

2. **평가 탭** 🟢
   - 원인: 기업이 작성하는 시스템 기능 (구직자가 입력할 수 없음)
   - 해결: 탭 삭제 (완료) ✅ 정상

3. **자격증 탭** 🟡
   - 원인: 온보딩에서 자격증 정보 미수집
   - 해결: 탭 삭제 (완료) 또는 온보딩 개선 (향후)

4. **주요 성과 (개요 탭)** 🟡
   - 원인: 온보딩에서 achievements 미수집
   - 해결: experiences의 description 활용 또는 온보딩 개선

---

## ✅ 개선 완료 사항

### 상세 페이지 정리
- ✅ 프로젝트 탭 삭제
- ✅ 평가 탭 삭제
- ✅ 자격증 탭 삭제
- ✅ 빠른 액션 섹션 삭제
  - PDF 다운로드
  - 면접 일정
  - 계약서 전송

### 남은 탭 (4개)
```
1. 개요 ✅
2. 경력사항 ✅
3. 학력 ✅
4. 기술스택 ✅
```

**모든 탭에 실제 데이터가 표시됩니다!** ✨

---

## 🚀 다음 단계 제안

### 우선순위 1 (즉시)
- [ ] 개요 탭에 "선호 조건" 섹션 추가
- [ ] 희망 직무, 고용 형태, 회사 규모, 재택근무 표시

### 우선순위 2 (1주일)
- [ ] 온보딩 Step 2에 프로젝트 섹션 추가
- [ ] 온보딩 Step 3에 자격증 섹션 추가

### 우선순위 3 (1개월)
- [ ] 평가 시스템 구축
- [ ] 프로젝트 완료 후 기업 평가 기능

---

**분석 완료일**: 2025-09-30  
**문제**: 온보딩 데이터 vs 상세 페이지 불일치  
**해결**: 불필요한 탭 3개 삭제 ✅  
**향후**: 온보딩 개선으로 프로젝트/자격증 수집



