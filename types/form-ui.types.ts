/**
 * 공통 폼 UI 컴포넌트 타입 정의
 *
 * 기업 온보딩, 개인 회원 온보딩, 채용공고 작성 등에서 재사용되는
 * 폼 컴포넌트들의 공통 타입과 인터페이스
 */

// ============================================
// 기본 Props
// ============================================

/**
 * 모든 폼 필드 컴포넌트의 기본 Props
 */
export interface BaseFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

// ============================================
// Select 관련
// ============================================

/**
 * Select 옵션 타입
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ============================================
// 언어 수준 관련
// ============================================

/**
 * 일반 언어 수준 (영어, 중국어, 일본어 등)
 */
export type LanguageLevel = 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'FLUENT' | 'NATIVE';

/**
 * 한국어 수준 (TOPIK 포함)
 */
export type KoreanLevel = 'NONE' | 'TOPIK_1' | 'TOPIK_2' | 'TOPIK_3' | 'TOPIK_4' | 'TOPIK_5' | 'TOPIK_6' | 'NATIVE';

/**
 * 언어 수준 라벨 맵핑
 */
export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  NONE: '불필요',
  BASIC: '기초',
  INTERMEDIATE: '중급',
  FLUENT: '유창',
  NATIVE: '원어민',
};

/**
 * 한국어 수준 라벨 맵핑
 */
export const KOREAN_LEVEL_LABELS: Record<KoreanLevel, string> = {
  NONE: '불필요',
  TOPIK_1: 'TOPIK 1급',
  TOPIK_2: 'TOPIK 2급',
  TOPIK_3: 'TOPIK 3급',
  TOPIK_4: 'TOPIK 4급',
  TOPIK_5: 'TOPIK 5급',
  TOPIK_6: 'TOPIK 6급',
  NATIVE: '원어민',
};

/**
 * 언어 항목 (동적 언어 입력용)
 */
export interface LanguageItem {
  language: string;
  proficiency: LanguageLevel;
}

// ============================================
// 입력 타입
// ============================================

/**
 * HTML input 타입
 */
export type InputType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'password';

/**
 * Input mode (모바일 키보드 최적화)
 */
export type InputMode = 'text' | 'numeric' | 'email' | 'tel' | 'url' | 'search';
