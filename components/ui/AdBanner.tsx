'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getBannerByPosition, recordBannerClick } from '@/lib/supabase/banner-service';
import type { BannerPosition, AdvertisementBanner } from '@/types/banner.types';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  position: BannerPosition;
  width: number;
  height: number;
}

export default function AdBanner({ position, width, height }: AdBannerProps) {
  const [banner, setBanner] = useState<AdvertisementBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadBanner();
  }, [position]);

  const loadBanner = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getBannerByPosition(position);
      setBanner(data);
    } catch (err) {
      console.error('Failed to load banner:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!banner || !banner.link_url) return;

    // 클릭수 기록 (비동기, await 없이)
    recordBannerClick(banner.id);

    // 새 탭에서 링크 열기
    window.open(banner.link_url, '_blank', 'noopener,noreferrer');
  };

  // 로딩 중
  if (loading) {
    return (
      <div
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center animate-pulse"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-400">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 에러 또는 배너 없음 - Placeholder 표시
  if (error || !banner) {
    return (
      <div
        className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 transition-all duration-300 group"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-400 group-hover:text-primary-600 transition-colors">
            광고 배너 영역
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5 group-hover:text-primary-500">
            {width} x {height}
          </div>
        </div>
      </div>
    );
  }

  // 배너 표시
  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={handleClick}
    >
      {/* 배너 이미지 */}
      <Image
        src={banner.image_url}
        alt={banner.alt_text || banner.name}
        fill
        className="object-cover"
        unoptimized // Cloudinary 이미지는 이미 최적화되어 있음
        priority={position === 'header'} // 헤더는 우선 로딩
      />

      {/* 링크 있을 때만 호버 효과 */}
      {banner.link_url && (
        <>
          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

          {/* 외부 링크 아이콘 (호버 시 표시) */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
              <ExternalLink className="w-3 h-3 text-primary-600" />
            </div>
          </div>
        </>
      )}

      {/* 광고 표시 (하단 좌측) */}
      <div className="absolute bottom-1 left-1 bg-gray-900/80 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded">
        AD
      </div>
    </div>
  );
}
