// Cloudinary Configuration
// ⚠️ 이 파일은 클라이언트와 서버 모두에서 사용 가능
// cloudinary SDK는 서버 전용이므로 여기서 import하지 않음

// 클라이언트 설정 (브라우저에서 사용)
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dghxms4ty',
};

// Upload Preset 이름들 (Cloudinary Console에서 생성해야 함)
export const UPLOAD_PRESETS = {
  PROFILE: 'jobmatch_profile',      // 구직자 프로필 사진
  LOGO: 'jobmatch_logo',             // 기업 로고
  BANNER: 'jobmatch_banner',         // 기업 배너
  GENERAL: 'jobmatch_general',       // 일반 이미지
} as const;

// 폴더 구조
export const CLOUDINARY_FOLDERS = {
  PROFILES: 'jobmatch/profiles',
  LOGOS: 'jobmatch/logos',
  BANNERS: 'jobmatch/banners',
  GENERAL: 'jobmatch/general',
} as const;

// 이미지 변환 프리셋
export const IMAGE_TRANSFORMATIONS = {
  // 프로필 사진: 정사각형, 얼굴 중심 크롭
  profile_thumb: {
    width: 150,
    height: 150,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  },
  profile_medium: {
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  },
  // 로고: 투명 배경 유지
  logo_small: {
    width: 100,
    height: 100,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
  },
  logo_medium: {
    width: 200,
    height: 200,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
  },
  // 배너: 와이드 비율
  banner_full: {
    width: 1200,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  },
  banner_thumb: {
    width: 600,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  },
} as const;

// cloudinary SDK는 API 라우트에서만 사용
// export default cloudinary;
