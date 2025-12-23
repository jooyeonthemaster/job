'use client';

// 광고 배너 관리 메인 페이지 - 리팩토링 완료 (730줄 → 약 130줄)
// 기능 변경 없음, 컴포넌트/훅으로 분리

import { useBannerData } from '@/hooks/useBannerData';
import { useBannerForm } from '@/hooks/useBannerForm';
import { useBannerActions } from '@/hooks/useBannerActions';
import BannerStats from '@/components/admin/banners/BannerStats';
import BannerPositionList from '@/components/admin/banners/BannerPositionList';
import BannerModal from '@/components/admin/banners/BannerModal';
import type { BannerPosition } from '@/types/banner.types';

interface BannersTabProps {
  isActive?: boolean;
}

export default function BannersTab({ isActive = true }: BannersTabProps) {
  // Custom Hooks
  const { banners, stats, loading, loadData } = useBannerData(isActive);
  const {
    showModal,
    editingBanner,
    formData,
    submitting,
    handleCreate,
    handleEdit,
    handleImageUpload,
    setFormData,
    setShowModal,
    setSubmitting
  } = useBannerForm();
  const {
    handleSubmit,
    handleDelete,
    handleToggleActive,
    handlePaymentStatusChange
  } = useBannerActions({
    loadData,
    setShowModal,
    setSubmitting,
    formData,
    editingBanner
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">배너 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 위치별 배너 그룹화
  const bannersByPosition: Record<BannerPosition, typeof banners> = {
    header: banners.filter((b) => b.position === 'header'),
    'jobs-sidebar-1': banners.filter((b) => b.position === 'jobs-sidebar-1'),
    'jobs-sidebar-2': banners.filter((b) => b.position === 'jobs-sidebar-2')
  };

  return (
    <div className="space-y-6">
      {/* 헤더 & 전체 통계 */}
      <BannerStats
        stats={stats}
        onRefresh={loadData}
        onCreate={handleCreate}
      />

      {/* 위치별 배너 목록 */}
      {(['header', 'jobs-sidebar-1', 'jobs-sidebar-2'] as BannerPosition[]).map(
        (position) => (
          <BannerPositionList
            key={position}
            position={position}
            banners={bannersByPosition[position]}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onPaymentStatusChange={handlePaymentStatusChange}
          />
        )
      )}

      {/* 배너 추가/수정 모달 */}
      <BannerModal
        show={showModal}
        editingBanner={editingBanner}
        formData={formData}
        submitting={submitting}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}
