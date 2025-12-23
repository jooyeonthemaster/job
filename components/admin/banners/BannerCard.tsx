// 개별 배너 카드 컴포넌트
// components/admin/BannersTab.tsx에서 분리 (기능 변경 없음)

import Image from 'next/image';
import {
  Pencil,
  Trash2,
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { calculateBannerStats } from '@/lib/supabase/banner-service';
import {
  PAYMENT_STATUS_COLORS
} from '@/types/banner.types';
import type {
  AdvertisementBanner,
  PaymentStatus
} from '@/types/banner.types';

type BannerCardProps = {
  banner: AdvertisementBanner;
  onEdit: (banner: AdvertisementBanner) => void;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onPaymentStatusChange: (id: string, status: PaymentStatus) => void;
};

export default function BannerCard({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
  onPaymentStatusChange
}: BannerCardProps) {
  const stats = calculateBannerStats(banner);

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        {/* 배너 이미지 미리보기 */}
        <div className="relative flex-shrink-0">
          <div
            className="relative bg-gray-100 rounded-lg overflow-hidden"
            style={{
              width: `${Math.min(banner.width, 200)}px`,
              height: `${Math.min(banner.height, 100)}px`
            }}
          >
            <Image
              src={banner.image_url}
              alt={banner.name}
              fill
              sizes="200px"
              className="object-cover"
              unoptimized
              loading="lazy"
            />
          </div>
          {banner.is_active ? (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
              활성
            </div>
          ) : (
            <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
              비활성
            </div>
          )}
        </div>

        {/* 배너 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-lg font-bold text-gray-900 truncate">
                {banner.name}
              </h4>
              {banner.advertiser_name && (
                <p className="text-sm text-gray-600">
                  광고주: {banner.advertiser_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleActive(banner.id, banner.is_active)}
                className={`px-3 py-1 text-xs rounded-lg font-medium ${
                  banner.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {banner.is_active ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* 링크 */}
          {banner.link_url && (
            <a
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mb-2"
            >
              <ExternalLink className="w-3 h-3" />
              {banner.link_url}
            </a>
          )}

          {/* 통계 & 결제 상태 */}
          <div className="flex items-center gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <Eye className="w-4 h-4" />
              <span>{stats.views.toLocaleString()} 노출</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <MousePointerClick className="w-4 h-4" />
              <span>{stats.clicks.toLocaleString()} 클릭</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <TrendingUp className="w-4 h-4" />
              <span>CTR {stats.ctr}%</span>
            </div>
            {banner.payment_amount && (
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <DollarSign className="w-4 h-4" />
                <span>{banner.payment_amount.toLocaleString()}원</span>
              </div>
            )}
          </div>

          {/* 결제 상태 & 액션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={banner.payment_status}
                onChange={(e) =>
                  onPaymentStatusChange(
                    banner.id,
                    e.target.value as PaymentStatus
                  )
                }
                className={`px-3 py-1 text-xs rounded-lg font-medium border-0 ${
                  PAYMENT_STATUS_COLORS[banner.payment_status]
                }`}
              >
                <option value="pending">입금 대기</option>
                <option value="paid">입금 확인</option>
                <option value="confirmed">결제 완료</option>
              </select>
              {banner.payment_note && (
                <span className="text-xs text-gray-500">
                  {banner.payment_note}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(banner)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="수정"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(banner.id, banner.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
