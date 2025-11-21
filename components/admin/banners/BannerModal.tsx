// 배너 추가/수정 모달 컴포넌트
// components/admin/BannersTab.tsx에서 분리 (기능 변경 없음)

import CloudinaryUpload from '@/components/CloudinaryUpload';
import { BANNER_SIZES } from '@/types/banner.types';
import type {
  AdvertisementBanner,
  BannerPosition,
  CreateBannerData,
  PaymentStatus
} from '@/types/banner.types';

type BannerModalProps = {
  show: boolean;
  editingBanner: AdvertisementBanner | null;
  formData: CreateBannerData;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: CreateBannerData) => void;
  onImageUpload: (url: string) => void;
};

export default function BannerModal({
  show,
  editingBanner,
  formData,
  submitting,
  onClose,
  onSubmit,
  onFormDataChange,
  onImageUpload
}: BannerModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {editingBanner ? '배너 수정' : '배너 추가'}
          </h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* 배너 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배너 이름 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="예: 삼성전자 채용 광고"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          {/* 배너 위치 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배너 위치 <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.position}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  position: e.target.value as BannerPosition
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              required
            >
              <option value="header">
                헤더 우측 (400 × 50px)
              </option>
              <option value="jobs-sidebar-1">
                채용공고 사이드바 상단 (160 × 600px)
              </option>
              <option value="jobs-sidebar-2">
                채용공고 사이드바 하단 (160 × 600px)
              </option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              권장 크기: {BANNER_SIZES[formData.position].width} ×{' '}
              {BANNER_SIZES[formData.position].height}px
            </p>
          </div>

          {/* 배너 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배너 이미지 <span className="text-red-600">*</span>
            </label>
            <CloudinaryUpload
              type="banner"
              onUploadSuccess={onImageUpload}
              currentImageUrl={formData.image_url}
              label="배너 이미지 업로드"
            />
            {formData.image_url && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 break-all">{formData.image_url}</p>
              </div>
            )}
          </div>

          {/* 링크 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              링크 URL (선택)
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => onFormDataChange({ ...formData, link_url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* 광고주 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                광고주 이름
              </label>
              <input
                type="text"
                value={formData.advertiser_name}
                onChange={(e) =>
                  onFormDataChange({ ...formData, advertiser_name: e.target.value })
                }
                placeholder="회사명 또는 개인명"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처
              </label>
              <input
                type="text"
                value={formData.advertiser_contact}
                onChange={(e) =>
                  onFormDataChange({ ...formData, advertiser_contact: e.target.value })
                }
                placeholder="이메일 또는 전화번호"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                광고비 (원)
              </label>
              <input
                type="number"
                value={formData.payment_amount}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    payment_amount: parseInt(e.target.value) || 0
                  })
                }
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                결제 상태
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    payment_status: e.target.value as PaymentStatus
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="pending">입금 대기</option>
                <option value="paid">입금 확인</option>
                <option value="confirmed">결제 완료</option>
              </select>
            </div>
          </div>

          {/* 결제 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 메모
            </label>
            <input
              type="text"
              value={formData.payment_note}
              onChange={(e) =>
                onFormDataChange({ ...formData, payment_note: e.target.value })
              }
              placeholder="입금자명, 입금일 등"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* 활성화 체크박스 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                onFormDataChange({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              배너 활성화 (즉시 노출)
            </label>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? '저장 중...' : (editingBanner ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
