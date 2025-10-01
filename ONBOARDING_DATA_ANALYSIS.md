# 🔍 구직자 온보딩 데이터 철저 분석 보고서

## 📊 온보딩 데이터 수집 현황

### Step 1: 기본 정보 (Step1ProfileBasic.tsx)
```typescript
{
  fullName: string;           // 이름
  headline: string;           // 한 줄 소개
  profileImageUrl: string;    // 프로필 사진 (선택)
}
```

### Step 2: 경력 및 학력 (Step2_Experience.tsx)
```typescript
{
  experiences: [
    {
      id: string;
      company: string;        // 회사명
      position: string;       // 직책
      startDate: string;      // 시작일
      endDate: string;        // 종료일
      current: boolean;       // 재직 중
      description: string;    // 업무 설명
    }
  ],
  educations: [
    {
      id: string;
      school: string;         // 학교명
      degree: string;         // 학위 (고등학교/전문학사/학사/석사/박사)
      field: string;          // 전공
      startYear: string;      // 입학년도
      endYear: string;        // 졸업년도
      current: boolean;       // 재학 중
    }
  ]
}
```

### Step 3: 스킬 및 언어 (Step3_Skills.tsx)
```typescript
{
  skills: string[];          // 기술 스킬 (배열)
  languages: string[];       // 언어 능력 (배열)
}
```

### Step 4: 선호 조건 (Step4_Preferences.tsx)
```typescript
{
  desiredPositions: string[];     // 희망 직무 (배열)
  preferredLocations: string[];   // 희망 근무지 (배열)
  salaryRange: {
    min: string;                  // 최소 연봉 (만원)
    max: string;                  // 최대 연봉 (만원)
  },
  workType: string;               // 고용 형태 (정규직/계약직/인턴/프리랜서)
  companySize: string;            // 회사 규모 (스타트업/중소기업/중견기업/대기업)
  visaSponsorship: boolean;       // 비자 후원 필요 여부
  remoteWork: string;             // 재택근무 (불가/부분/완전)
  introduction: string;           // 자기소개 (선택)
}
```

---

## ✅ 마이페이지 표시 데이터 분석

### Hero Section (상단 프로필 영역)
```typescript
✓ profileImageUrl      // 프로필 사진
✓ fullName             // 이름
✓ headline             // 한 줄 소개
✓ preferredLocations   // 희망 근무지
✓ salaryRange          // 희망 연봉
```

### Right Column (오른쪽 사이드바)
```typescript
✓ skills[]             // 보유 기술
✓ languages[]          // 언어 능력
```

---

## ❌ 누락된 데이터 (8개)

### 1. 경력 사항 (experiences) 🔴 **중요**
```typescript
experiences: [
  {
    company: "삼성전자",
    position: "프론트엔드 개발자",
    startDate: "2020-03-01",
    endDate: "2023-12-31",
    current: false,
    description: "React 기반 웹 애플리케이션 개발"
  }
]
```
**영향도**: ⭐⭐⭐⭐⭐
- 가장 중요한 정보
- 채용 담당자가 가장 먼저 확인
- 경력 기반 추천 시스템에 활용 가능

### 2. 학력 사항 (educations) 🔴 **중요**
```typescript
educations: [
  {
    school: "서울대학교",
    degree: "학사",
    field: "컴퓨터공학과",
    startYear: "2016",
    endYear: "2020",
    current: false
  }
]
```
**영향도**: ⭐⭐⭐⭐
- 신입/경력 판단 기준
- 전공 관련 직무 매칭
- 학벌 중시 기업에 중요

### 3. 희망 직무 (desiredPositions) 🟡 **중요**
```typescript
desiredPositions: ["프론트엔드 개발자", "풀스택 개발자"]
```
**영향도**: ⭐⭐⭐⭐
- 추천 알고리즘에 이미 사용 중
- 사용자가 무엇을 원하는지 명확히 표시 필요
- 직무별 필터링 가능

### 4. 고용 형태 (workType) 🟡
```typescript
workType: "정규직"  // 또는 "계약직", "인턴", "프리랜서"
```
**영향도**: ⭐⭐⭐
- 고용 형태 기반 공고 필터링
- 프리랜서/계약직 선호 명시

### 5. 회사 규모 (companySize) 🟡
```typescript
companySize: "스타트업"  // 또는 "중소기업", "중견기업", "대기업"
```
**영향도**: ⭐⭐⭐
- 스타트업 vs 대기업 선호도
- 기업 문화 매칭

### 6. 비자 후원 필요 (visaSponsorship) 🟢
```typescript
visaSponsorship: true
```
**영향도**: ⭐⭐⭐⭐⭐ (외국인 구직자)
- 외국인 인재 플랫폼의 핵심 정보
- 비자 스폰서십 제공 기업만 필터링 필요

### 7. 재택근무 선호 (remoteWork) 🟡
```typescript
remoteWork: "완전"  // 또는 "부분", "불가"
```
**영향도**: ⭐⭐⭐
- 근무 형태 선호도
- COVID 이후 중요도 상승

### 8. 자기소개 (introduction) 🟢
```typescript
introduction: "5년 경력의 프론트엔드 개발자입니다..."
```
**영향도**: ⭐⭐⭐
- 개인의 성격/강점 파악
- 자세한 경험 설명

---

## 📈 데이터 활용도 비교

| 데이터 | 온보딩 수집 | 대시보드 표시 | 추천 알고리즘 사용 | 우선순위 |
|--------|------------|--------------|-------------------|---------|
| fullName | ✅ | ✅ | ❌ | 필수 |
| headline | ✅ | ✅ | ❌ | 필수 |
| profileImageUrl | ✅ | ✅ | ❌ | 선택 |
| **experiences** | ✅ | ❌ | ❌ | **높음** |
| **educations** | ✅ | ❌ | ❌ | **높음** |
| skills | ✅ | ✅ | ✅ | 필수 |
| languages | ✅ | ✅ | ❌ | 필수 |
| **desiredPositions** | ✅ | ❌ | ✅ | **높음** |
| preferredLocations | ✅ | ✅ | ✅ | 필수 |
| salaryRange | ✅ | ✅ | ✅ | 필수 |
| **workType** | ✅ | ❌ | ❌ | **중간** |
| **companySize** | ✅ | ❌ | ❌ | **중간** |
| **visaSponsorship** | ✅ | ❌ | ❌ | **매우 높음** |
| **remoteWork** | ✅ | ❌ | ❌ | **중간** |
| **introduction** | ✅ | ❌ | ❌ | **낮음** |

**통계**:
- 온보딩 수집: 15개 필드
- 대시보드 표시: 7개 필드 (46.7%)
- 추천 알고리즘 사용: 4개 필드 (26.7%)
- **누락: 8개 필드 (53.3%)** 🔴

---

## 🎯 개선 권장 사항

### 즉시 추가 (필수)

#### 1. 경력 사항 섹션 추가
```jsx
{/* 경력 사항 */}
<div className="bg-white rounded-xl shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Briefcase className="w-5 h-5" />
    경력 사항
  </h3>
  {profileData?.experiences?.length > 0 ? (
    <div className="space-y-4">
      {profileData.experiences.map((exp) => (
        <div key={exp.id} className="border-l-2 border-primary-500 pl-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{exp.position}</p>
              <p className="text-sm text-gray-600">{exp.company}</p>
              <p className="text-xs text-gray-500 mt-1">
                {exp.startDate} ~ {exp.current ? '현재' : exp.endDate}
              </p>
            </div>
            {exp.current && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                재직 중
              </span>
            )}
          </div>
          {exp.description && (
            <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">경력을 추가해주세요</p>
  )}
</div>
```

#### 2. 학력 사항 섹션 추가
```jsx
{/* 학력 사항 */}
<div className="bg-white rounded-xl shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <GraduationCap className="w-5 h-5" />
    학력 사항
  </h3>
  {profileData?.educations?.length > 0 ? (
    <div className="space-y-4">
      {profileData.educations.map((edu) => (
        <div key={edu.id} className="border-l-2 border-secondary-500 pl-4">
          <p className="font-semibold text-gray-900">{edu.school}</p>
          <p className="text-sm text-gray-600">{edu.degree} • {edu.field}</p>
          <p className="text-xs text-gray-500 mt-1">
            {edu.startYear} ~ {edu.current ? '재학 중' : edu.endYear}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">학력을 추가해주세요</p>
  )}
</div>
```

#### 3. 선호 조건 섹션 추가
```jsx
{/* 선호 조건 */}
<div className="bg-white rounded-xl shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">선호 조건</h3>
  <div className="space-y-3">
    {/* 희망 직무 */}
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">희망 직무</p>
      <div className="flex flex-wrap gap-2">
        {profileData?.desiredPositions?.map((pos: string) => (
          <span key={pos} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
            {pos}
          </span>
        )) || <p className="text-sm text-gray-500">희망 직무 미설정</p>}
      </div>
    </div>

    {/* 고용 형태 */}
    {profileData?.workType && (
      <div>
        <p className="text-sm font-medium text-gray-700">고용 형태</p>
        <p className="text-sm text-gray-600">{profileData.workType}</p>
      </div>
    )}

    {/* 회사 규모 */}
    {profileData?.companySize && (
      <div>
        <p className="text-sm font-medium text-gray-700">선호 회사 규모</p>
        <p className="text-sm text-gray-600">{profileData.companySize}</p>
      </div>
    )}

    {/* 재택근무 */}
    {profileData?.remoteWork && (
      <div>
        <p className="text-sm font-medium text-gray-700">재택근무</p>
        <p className="text-sm text-gray-600">
          {profileData.remoteWork === '완전' ? '완전 재택근무' :
           profileData.remoteWork === '부분' ? '부분 재택근무' : '재택근무 불가'}
        </p>
      </div>
    )}

    {/* 비자 후원 */}
    {profileData?.visaSponsorship && (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg">
        <span className="text-sm font-medium text-yellow-900">
          ⚠️ 비자 후원 필요
        </span>
      </div>
    )}
  </div>
</div>
```

#### 4. 자기소개 섹션 추가
```jsx
{/* 자기소개 */}
{profileData?.introduction && (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">자기소개</h3>
    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
      {profileData.introduction}
    </p>
  </div>
)}
```

---

## 🚀 추천 알고리즘 개선

### 현재 매칭 기준 (4개)
1. ✅ skills (40점)
2. ✅ preferredLocations (25점)
3. ✅ salaryRange (20점)
4. ✅ desiredPositions (15점)

### 추가 가능한 매칭 기준 (5개)
5. **workType** (10점) - 고용 형태 일치
6. **visaSponsorship** (필터) - 비자 후원 제공 기업만
7. **remoteWork** (10점) - 재택근무 선호도
8. **companySize** (5점) - 회사 규모 선호도
9. **experiences** (경력 레벨 매칭) - ENTRY/JUNIOR/MID/SENIOR

---

## 📋 구현 우선순위

### Phase 1 (즉시) - 핵심 누락 데이터
- [ ] 경력 사항 섹션 추가
- [ ] 학력 사항 섹션 추가
- [ ] 희망 직무 표시

### Phase 2 (1주일 내) - 선호 조건
- [ ] 선호 조건 섹션 추가
- [ ] 비자 후원 필요 표시
- [ ] 고용 형태/회사 규모 표시

### Phase 3 (2주일 내) - 추천 알고리즘
- [ ] 비자 후원 필터링
- [ ] 고용 형태 매칭
- [ ] 재택근무 선호도 매칭
- [ ] 경력 레벨 매칭

### Phase 4 (선택) - 부가 기능
- [ ] 자기소개 섹션
- [ ] 경력 타임라인 시각화
- [ ] 학력 인증 뱃지

---

## 🎨 레이아웃 제안

### 현재 구조
```
[Hero Section]
  - 프로필 사진, 이름, 한 줄 소개
  - 희망 근무지, 희망 연봉

[Left Column (2/3)]
  - 지원 현황
  - 추천 채용공고

[Right Column (1/3)]
  - 빠른 작업
  - 보유 기술
  - 언어 능력
  - 커리어 팁
```

### 개선된 구조 (권장)
```
[Hero Section]
  - 프로필 사진, 이름, 한 줄 소개
  - 희망 근무지, 희망 연봉, 비자 후원 🆕

[Left Column (2/3)]
  - 지원 현황
  - 추천 채용공고 (프로필 기반)
  - 경력 사항 🆕
  - 학력 사항 🆕

[Right Column (1/3)]
  - 빠른 작업
  - 보유 기술
  - 언어 능력
  - 선호 조건 🆕
  - 자기소개 🆕 (있는 경우)
```

---

## 📊 예상 효과

### 사용자 경험
- ✅ 프로필 완성도 시각화 개선
- ✅ 기업이 필요한 정보를 한눈에 확인
- ✅ 자신의 프로필 현황 파악 용이

### 비즈니스 임팩트
- ✅ 프로필 작성률 증가 (현재 표시 안 되니 작성 동기 ↓)
- ✅ 기업-구직자 매칭률 향상
- ✅ 플랫폼 체류 시간 증가

### 기술적 이점
- ✅ 온보딩 데이터 100% 활용
- ✅ 추천 알고리즘 정확도 향상
- ✅ Firebase 저장 데이터 낭비 방지

---

## 🔍 결론

**현재 상태**: 온보딩에서 수집한 15개 필드 중 7개(46.7%)만 표시되고 있으며, 8개(53.3%)가 누락되어 있습니다.

**핵심 문제**:
1. 가장 중요한 **경력/학력 정보**가 완전히 누락
2. **비자 후원** 같은 외국인 인재 플랫폼의 핵심 정보 미표시
3. **희망 직무** 등 추천에 사용되는 데이터가 사용자에게 보이지 않음

**권장 조치**:
- Phase 1 (경력/학력/희망직무)을 즉시 구현
- 비자 후원 정보를 눈에 띄게 표시
- 추천 알고리즘에 추가 필드 반영

---

**작성일**: 2025-09-30  
**분석 범위**: 구직자 온보딩 전체 (4 Steps)  
**분석자**: AI Assistant


