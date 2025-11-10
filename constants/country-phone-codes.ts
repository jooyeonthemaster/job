// =====================================================
// 국가별 전화번호 코드 및 형식 정의
// 작성일: 2025-01-20
// =====================================================

export interface CountryPhoneCode {
  code: string;           // 국가 코드 (+82, +86 등)
  name: string;           // 국가명 (한글)
  nameEn: string;         // 국가명 (영문)
  flag: string;           // 플래그 이모지
  iso2: string;           // ISO 3166-1 alpha-2 코드 (KR, CN 등)
  format: string;         // 전화번호 표시 형식
  placeholder: string;    // 입력 예시
  minLength: number;      // 최소 길이 (숫자만)
  maxLength: number;      // 최대 길이 (숫자만)
  pattern?: RegExp;       // 유효성 검증 정규식
}

// =====================================================
// 국가 코드 목록 (한국에서 외국인 근로자가 많이 오는 국가 우선)
// =====================================================

export const COUNTRY_PHONE_CODES: CountryPhoneCode[] = [
  // 한국 (기본)
  {
    code: '+82',
    name: '한국',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    iso2: 'KR',
    format: '010-####-####',
    placeholder: '10-1234-5678',
    minLength: 9,
    maxLength: 11,
    pattern: /^(0)?1[0-9]{8,9}$/,
  },

  // 아시아 주요 국가 (외국인 근로자 많은 순서)
  {
    code: '+84',
    name: '베트남',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    iso2: 'VN',
    format: '### ### ####',
    placeholder: '912 345 678',
    minLength: 9,
    maxLength: 10,
    pattern: /^[0-9]{9,10}$/,
  },
  {
    code: '+86',
    name: '중국',
    nameEn: 'China',
    flag: '🇨🇳',
    iso2: 'CN',
    format: '### #### ####',
    placeholder: '138 1234 5678',
    minLength: 11,
    maxLength: 11,
    pattern: /^1[3-9][0-9]{9}$/,
  },
  {
    code: '+66',
    name: '태국',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    iso2: 'TH',
    format: '## ### ####',
    placeholder: '81 234 5678',
    minLength: 9,
    maxLength: 9,
    pattern: /^[0-9]{9}$/,
  },
  {
    code: '+62',
    name: '인도네시아',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    iso2: 'ID',
    format: '###-###-####',
    placeholder: '812-345-6789',
    minLength: 10,
    maxLength: 13,
    pattern: /^[0-9]{10,13}$/,
  },
  {
    code: '+63',
    name: '필리핀',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    iso2: 'PH',
    format: '### ### ####',
    placeholder: '912 345 6789',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },
  {
    code: '+95',
    name: '미얀마',
    nameEn: 'Myanmar',
    flag: '🇲🇲',
    iso2: 'MM',
    format: '### ### ####',
    placeholder: '912 345 678',
    minLength: 9,
    maxLength: 10,
    pattern: /^[0-9]{9,10}$/,
  },
  {
    code: '+855',
    name: '캄보디아',
    nameEn: 'Cambodia',
    flag: '🇰🇭',
    iso2: 'KH',
    format: '## ### ####',
    placeholder: '12 345 678',
    minLength: 8,
    maxLength: 9,
    pattern: /^[0-9]{8,9}$/,
  },
  {
    code: '+856',
    name: '라오스',
    nameEn: 'Laos',
    flag: '🇱🇦',
    iso2: 'LA',
    format: '## ### ####',
    placeholder: '20 5555 5555',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },
  {
    code: '+977',
    name: '네팔',
    nameEn: 'Nepal',
    flag: '🇳🇵',
    iso2: 'NP',
    format: '##-#######',
    placeholder: '98-1234567',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },
  {
    code: '+91',
    name: '인도',
    nameEn: 'India',
    flag: '🇮🇳',
    iso2: 'IN',
    format: '##### #####',
    placeholder: '98765 43210',
    minLength: 10,
    maxLength: 10,
    pattern: /^[6-9][0-9]{9}$/,
  },
  {
    code: '+92',
    name: '파키스탄',
    nameEn: 'Pakistan',
    flag: '🇵🇰',
    iso2: 'PK',
    format: '### #######',
    placeholder: '300 1234567',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },
  {
    code: '+880',
    name: '방글라데시',
    nameEn: 'Bangladesh',
    flag: '🇧🇩',
    iso2: 'BD',
    format: '#### ######',
    placeholder: '1812 345678',
    minLength: 10,
    maxLength: 10,
    pattern: /^1[3-9][0-9]{8}$/,
  },
  {
    code: '+94',
    name: '스리랑카',
    nameEn: 'Sri Lanka',
    flag: '🇱🇰',
    iso2: 'LK',
    format: '## ### ####',
    placeholder: '71 234 5678',
    minLength: 9,
    maxLength: 9,
    pattern: /^[0-9]{9}$/,
  },
  {
    code: '+976',
    name: '몽골',
    nameEn: 'Mongolia',
    flag: '🇲🇳',
    iso2: 'MN',
    format: '#### ####',
    placeholder: '8812 3456',
    minLength: 8,
    maxLength: 8,
    pattern: /^[0-9]{8}$/,
  },
  {
    code: '+998',
    name: '우즈베키스탄',
    nameEn: 'Uzbekistan',
    flag: '🇺🇿',
    iso2: 'UZ',
    format: '## ### ####',
    placeholder: '91 234 5678',
    minLength: 9,
    maxLength: 9,
    pattern: /^[0-9]{9}$/,
  },
  {
    code: '+7',
    name: '카자흐스탄',
    nameEn: 'Kazakhstan',
    flag: '🇰🇿',
    iso2: 'KZ',
    format: '### ### ####',
    placeholder: '701 234 5678',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },

  // 동아시아
  {
    code: '+81',
    name: '일본',
    nameEn: 'Japan',
    flag: '🇯🇵',
    iso2: 'JP',
    format: '###-####-####',
    placeholder: '90-1234-5678',
    minLength: 10,
    maxLength: 11,
    pattern: /^[0-9]{10,11}$/,
  },

  // 북미
  {
    code: '+1',
    name: '미국/캐나다',
    nameEn: 'USA/Canada',
    flag: '🇺🇸',
    iso2: 'US',
    format: '(###) ###-####',
    placeholder: '(202) 555-1234',
    minLength: 10,
    maxLength: 10,
    pattern: /^[2-9][0-9]{9}$/,
  },

  // 유럽
  {
    code: '+44',
    name: '영국',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    iso2: 'GB',
    format: '#### ######',
    placeholder: '7400 123456',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },
  {
    code: '+49',
    name: '독일',
    nameEn: 'Germany',
    flag: '🇩🇪',
    iso2: 'DE',
    format: '### #######',
    placeholder: '151 12345678',
    minLength: 10,
    maxLength: 11,
    pattern: /^[0-9]{10,11}$/,
  },
  {
    code: '+33',
    name: '프랑스',
    nameEn: 'France',
    flag: '🇫🇷',
    iso2: 'FR',
    format: '# ## ## ## ##',
    placeholder: '6 12 34 56 78',
    minLength: 9,
    maxLength: 9,
    pattern: /^[0-9]{9}$/,
  },
  {
    code: '+39',
    name: '이탈리아',
    nameEn: 'Italy',
    flag: '🇮🇹',
    iso2: 'IT',
    format: '### ### ####',
    placeholder: '312 345 6789',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },
  {
    code: '+34',
    name: '스페인',
    nameEn: 'Spain',
    flag: '🇪🇸',
    iso2: 'ES',
    format: '### ### ###',
    placeholder: '612 345 678',
    minLength: 9,
    maxLength: 9,
    pattern: /^[0-9]{9}$/,
  },

  // 오세아니아
  {
    code: '+61',
    name: '호주',
    nameEn: 'Australia',
    flag: '🇦🇺',
    iso2: 'AU',
    format: '### ### ###',
    placeholder: '412 345 678',
    minLength: 9,
    maxLength: 9,
    pattern: /^[0-9]{9}$/,
  },
  {
    code: '+64',
    name: '뉴질랜드',
    nameEn: 'New Zealand',
    flag: '🇳🇿',
    iso2: 'NZ',
    format: '### ### ###',
    placeholder: '21 123 456',
    minLength: 8,
    maxLength: 10,
    pattern: /^[0-9]{8,10}$/,
  },

  // 남미
  {
    code: '+55',
    name: '브라질',
    nameEn: 'Brazil',
    flag: '🇧🇷',
    iso2: 'BR',
    format: '(##) #####-####',
    placeholder: '(11) 91234-5678',
    minLength: 11,
    maxLength: 11,
    pattern: /^[0-9]{11}$/,
  },
  {
    code: '+52',
    name: '멕시코',
    nameEn: 'Mexico',
    flag: '🇲🇽',
    iso2: 'MX',
    format: '### ### ####',
    placeholder: '222 123 4567',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },

  // 러시아
  {
    code: '+7',
    name: '러시아',
    nameEn: 'Russia',
    flag: '🇷🇺',
    iso2: 'RU',
    format: '### ###-##-##',
    placeholder: '912 345-67-89',
    minLength: 10,
    maxLength: 10,
    pattern: /^[0-9]{10}$/,
  },
];

// =====================================================
// 유틸리티 함수
// =====================================================

/**
 * ISO2 코드로 국가 정보 찾기
 */
export const getCountryByIso2 = (iso2: string): CountryPhoneCode | undefined => {
  return COUNTRY_PHONE_CODES.find((country) => country.iso2 === iso2);
};

/**
 * 국가 코드로 국가 정보 찾기
 */
export const getCountryByCode = (code: string): CountryPhoneCode | undefined => {
  return COUNTRY_PHONE_CODES.find((country) => country.code === code);
};

/**
 * 전화번호 유효성 검증
 */
export const validatePhoneNumber = (
  phoneNumber: string,
  countryCode: string
): { isValid: boolean; error?: string } => {
  const country = getCountryByCode(countryCode);

  if (!country) {
    return { isValid: false, error: '지원하지 않는 국가입니다.' };
  }

  // 숫자만 추출
  const numbersOnly = phoneNumber.replace(/\D/g, '');

  // 길이 검증
  if (numbersOnly.length < country.minLength) {
    return {
      isValid: false,
      error: `전화번호는 최소 ${country.minLength}자리여야 합니다.`,
    };
  }

  if (numbersOnly.length > country.maxLength) {
    return {
      isValid: false,
      error: `전화번호는 최대 ${country.maxLength}자리여야 합니다.`,
    };
  }

  // 패턴 검증
  if (country.pattern && !country.pattern.test(numbersOnly)) {
    return {
      isValid: false,
      error: `올바른 ${country.name} 전화번호 형식이 아닙니다.`,
    };
  }

  return { isValid: true };
};

/**
 * 전화번호 포맷팅
 * @param phoneNumber - 숫자만 포함된 전화번호
 * @param countryCode - 국가 코드
 * @returns 포맷팅된 전화번호
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: string
): string => {
  const country = getCountryByCode(countryCode);
  if (!country) return phoneNumber;

  const numbersOnly = phoneNumber.replace(/\D/g, '');
  let formatted = '';
  let numberIndex = 0;

  for (let i = 0; i < country.format.length && numberIndex < numbersOnly.length; i++) {
    const char = country.format[i];
    if (char === '#') {
      formatted += numbersOnly[numberIndex];
      numberIndex++;
    } else {
      formatted += char;
    }
  }

  return formatted;
};

/**
 * 전체 전화번호 (국가 코드 포함) 생성
 */
export const getFullPhoneNumber = (
  phoneNumber: string,
  countryCode: string
): string => {
  const numbersOnly = phoneNumber.replace(/\D/g, '');
  return `${countryCode}${numbersOnly}`;
};

/**
 * 전화번호에서 숫자만 추출
 */
export const extractNumbers = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};

// =====================================================
// 기본 export
// =====================================================

export default COUNTRY_PHONE_CODES;

