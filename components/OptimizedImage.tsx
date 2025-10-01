'use client';

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  type?: 'profile' | 'logo' | 'banner' | 'general';
  priority?: boolean;
}

/**
 * Cloudinary 최적화된 이미지 컴포넌트
 * - 자동 포맷 선택 (WebP, AVIF)
 * - 자동 품질 최적화
 * - Lazy loading
 * - 반응형 지원
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  type = 'general',
  priority = false,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // Cloudinary URL인지 확인
  const isCloudinaryUrl = src?.includes('cloudinary.com');

  // public ID 추출 (Cloudinary URL인 경우)
  const getPublicId = (url: string): string => {
    if (!isCloudinaryUrl) return '';
    
    try {
      // https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/image.jpg
      // → folder/image
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      return matches ? matches[1] : url;
    } catch {
      return url;
    }
  };

  // 타입별 크롭 설정
  const getCropConfig = () => {
    switch (type) {
      case 'profile':
        return {
          crop: 'thumb' as const,
          gravity: 'face' as const,
        };
      case 'logo':
        return {
          crop: 'fit' as const,
          gravity: 'center' as const,
        };
      case 'banner':
        return {
          crop: 'fill' as const,
          gravity: 'auto' as const,
        };
      default:
        return {
          crop: 'fill' as const,
          gravity: 'auto' as const,
        };
    }
  };

  const cropConfig = getCropConfig();

  // 에러 발생 시 대체 이미지
  if (error || !src) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  // Cloudinary 이미지인 경우
  if (isCloudinaryUrl) {
    const publicId = getPublicId(src);
    
    return (
      <CldImage
        src={publicId || src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...cropConfig}
        quality="auto"
        format="auto"
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setError(true)}
      />
    );
  }

  // 일반 이미지 URL인 경우
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setError(true)}
    />
  );
}
