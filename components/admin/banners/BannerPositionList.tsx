// 위치별 배너 목록 컴포넌트
// components/admin/BannersTab.tsx에서 분리 (기능 변경 없음)

import { Image as ImageIcon } from 'lucide-react';
import BannerCard from './BannerCard';
import {
  BANNER_SIZES,
  BANNER_POSITION_LABELS
} from '@/types/banner.types';
import type {
  AdvertisementBanner,
  BannerPosition,
  PaymentStatus
} from '@/types/banner.types';

type BannerPositionListProps = {
  position: BannerPosition;
  banners: AdvertisementBanner[];
  onCreate: () => void;
  onEdit: (banner: AdvertisementBanner) => void;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onPaymentStatusChange: (id: string, status: PaymentStatus) => void;
};

export default function BannerPositionList({
  position,
  banners,
  onCreate,
  onEdit,
  onDelete,
  onToggleActive,
  onPaymentStatusChange
}: BannerPositionListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {BANNER_POSITION_LABELS[position]}
            </h3>
            <p className="text-sm text-gray-600">
              권장 크기: {BANNER_SIZES[position].width} ×{' '}
              {BANNER_SIZES[position].height}px
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {banners.length}개 배너
        </div>
      </div>

      {banners.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">등록된 배너가 없습니다</p>
          <button
            onClick={onCreate}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            첫 배너 추가하기 →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onPaymentStatusChange={onPaymentStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
