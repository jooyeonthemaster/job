// Cloudinary Upload Utilities
// ⚠️ 클라이언트에서 사용 가능한 유틸리티만 export
// 실제 업로드는 API Route를 통해서만 가능
import { CLOUDINARY_FOLDERS } from './config';

export type ImageType = 'profile' | 'logo' | 'banner' | 'general';

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * 이미지 URL에서 public ID 추출
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch {
    return null;
  }
};

/**
 * 이미지 타입에 따른 폴더 경로 반환
 */
export const getFolderPath = (type: ImageType): string => {
  switch (type) {
    case 'profile':
      return CLOUDINARY_FOLDERS.PROFILES;
    case 'logo':
      return CLOUDINARY_FOLDERS.LOGOS;
    case 'banner':
      return CLOUDINARY_FOLDERS.BANNERS;
    default:
      return CLOUDINARY_FOLDERS.GENERAL;
  }
};

/**
 * 파일 크기 검증 (기본 5MB)
 */
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};

/**
 * 파일 타입 검증
 */
export const validateFileType = (file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * 이미지 최적화 URL 생성
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return url;

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.join(',');
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
};

/**
 * 클라이언트에서 사용하는 업로드 함수 (API Route를 통해 처리)
 */
export const uploadToCloudinary = async (
  file: File,
  type: ImageType,
  userId?: string
): Promise<UploadResult> => {
  try {
    // 파일 검증
    if (!validateFileSize(file)) {
      return {
        success: false,
        error: '파일 크기는 5MB 이하여야 합니다.',
      };
    }

    if (!validateFileType(file)) {
      return {
        success: false,
        error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)',
      };
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    
    // folder 추가 (userId가 있으면 포함)
    const folder = userId 
      ? `${getFolderPath(type)}/${userId}` 
      : getFolderPath(type);
    
    formData.append('folder', folder);
    formData.append('type', type);

    // API Route를 통해 업로드
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '업로드 실패');
    }

    const data = await response.json();

    return {
      success: true,
      url: data.url,
      publicId: data.publicId,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || '업로드 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 이미지 타입별 업로드 프리셋 반환
 */
const getUploadPresetByType = (type: ImageType): string => {
  // 나중에 각 타입별로 다른 preset 사용 가능
  return 'jobmatch_unsigned'; // unsigned preset 이름
};

/**
 * 이미지 삭제 (서버사이드에서만 가능)
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};
