'use client';

import FormSelect from './FormSelect';
import { LANGUAGE_LEVEL_LABELS, KOREAN_LEVEL_LABELS } from '@/types/form-ui.types';
import type { LanguageLevel, KoreanLevel } from '@/types/form-ui.types';

interface LanguageLevelSelectProps {
  language: 'korean' | 'english' | 'other';
  level: LanguageLevel | KoreanLevel;
  onLevelChange: (level: LanguageLevel | KoreanLevel) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 언어 수준 선택 컴포넌트
 *
 * @사용처
 * - 개인 회원 온보딩: 언어 실력 입력
 * - 채용공고 작성: 요구 언어 수준
 *
 * @특징
 * - 한국어: TOPIK 등급 옵션 (TOPIK 1~6급, 원어민, 불필요)
 * - 영어/기타: 일반 언어 수준 (불필요, 기초, 중급, 유창, 원어민)
 */
export default function LanguageLevelSelect({
  language,
  level,
  onLevelChange,
  label,
  required,
  error,
  disabled,
  className = '',
}: LanguageLevelSelectProps) {
  // 한국어인 경우 TOPIK 등급 옵션
  const koreanOptions = Object.entries(KOREAN_LEVEL_LABELS).map(([value, labelText]) => ({
    value,
    label: labelText,
  }));

  // 영어/기타 언어인 경우 일반 언어 수준 옵션
  const generalOptions = Object.entries(LANGUAGE_LEVEL_LABELS).map(([value, labelText]) => ({
    value,
    label: labelText,
  }));

  const options = language === 'korean' ? koreanOptions : generalOptions;

  const defaultLabel =
    language === 'korean'
      ? '한국어 수준'
      : language === 'english'
      ? '영어 수준'
      : '언어 수준';

  return (
    <FormSelect
      label={label || defaultLabel}
      value={level}
      onChange={(value) => onLevelChange(value as LanguageLevel | KoreanLevel)}
      options={options}
      required={required}
      error={error}
      disabled={disabled}
      className={className}
    />
  );
}
