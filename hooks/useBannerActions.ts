// 배너 CRUD 액션 훅
// components/admin/BannersTab.tsx에서 분리 (기능 변경 없음)

import { createBanner, updateBanner, deleteBanner, toggleBannerActive, updatePaymentStatus } from '@/lib/supabase/banner-service';
import { BANNER_SIZES } from '@/types/banner.types';
import type { CreateBannerData, PaymentStatus, AdvertisementBanner } from '@/types/banner.types';

type UseBannerActionsProps = {
  loadData: () => Promise<void>;
  setShowModal: (show: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  formData: CreateBannerData;
  editingBanner: AdvertisementBanner | null;
};

export function useBannerActions({
  loadData,
  setShowModal,
  setSubmitting,
  formData,
  editingBanner
}: UseBannerActionsProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== Form Submit Started ===');
    console.log('Form data:', formData);

    if (!formData.name || !formData.image_url || !formData.position) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    console.log('Submitting state set to true');

    try {
      if (editingBanner) {
        console.log('Updating banner...');
        await updateBanner(editingBanner.id, formData);
        console.log('Banner updated successfully');
        alert('배너가 수정되었습니다.');
      } else {
        const size = BANNER_SIZES[formData.position];
        console.log('Creating banner with size:', size);
        const result = await createBanner({
          ...formData,
          width: size.width,
          height: size.height
        });
        console.log('Banner created successfully:', result);
        alert('배너가 생성되었습니다.');
      }

      console.log('Closing modal...');
      setShowModal(false);

      console.log('Loading data...');
      await loadData();
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('=== ERROR in handleSubmit ===');
      console.error('Error:', error);
      console.error('Form data:', formData);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      alert(`저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      console.log('=== Finally block - setting submitting to false ===');
      setSubmitting(false);
      console.log('Submitting state set to false');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 배너를 삭제하시겠습니까?`)) return;

    try {
      await deleteBanner(id);
      alert('배너가 삭제되었습니다.');
      await loadData();
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleBannerActive(id, !isActive);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle active:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handlePaymentStatusChange = async (id: string, status: PaymentStatus) => {
    try {
      await updatePaymentStatus(id, status);
      await loadData();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('결제 상태 변경에 실패했습니다.');
    }
  };

  return {
    handleSubmit,
    handleDelete,
    handleToggleActive,
    handlePaymentStatusChange
  };
}
