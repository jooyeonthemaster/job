// 채용공고 관련 상수

import { PostingPrice, PostingTier } from '@/types/job-form.types';

export const POSTING_PRICES: Record<PostingTier, PostingPrice> = {
  standard: {
    price: 100000,
    duration: 30,
    label: '중상단 (일반)',
    desc: '일반 채용공고 목록'
  },
  top: {
    price: 1000000,
    duration: 30,
    label: '최상단',
    desc: '채용공고 목록 최상단 고정'
  },
  premium: {
    price: 1300000,
    duration: 60,
    label: '첫 페이지 최상단 (프리미엄)',
    desc: '메인 페이지 + 목록 최상단 고정'
  }
};

// 과금 관련 상수
export const VAT_RATE = 0.1;

// 결제 담당자 정보
export const BILLING_CONTACT = {
  name: '박윤미',
  phone: '010-8014-5573'
};

// 고용 형태 라벨
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: '정규직',
  PART_TIME: '계약직',
  CONTRACT: '파트타임',
  INTERNSHIP: '인턴'
};

// 경력 수준 라벨
export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  ENTRY: '신입',
  JUNIOR: '주니어 (1-3년)',
  MID: '미드레벨 (4-7년)',
  SENIOR: '시니어 (8년+)',
  EXECUTIVE: '임원급'
};

// 언어 수준 라벨
export const LANGUAGE_LEVEL_LABELS: Record<string, string> = {
  NONE: '불필요',
  BASIC: '기초',
  INTERMEDIATE: '중급',
  FLUENT: '유창',
  NATIVE: '원어민'
};













