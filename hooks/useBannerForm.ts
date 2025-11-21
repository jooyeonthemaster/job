// 배너 폼 상태 관리 훅
// components/admin/BannersTab.tsx에서 분리 (기능 변경 없음)

import { useState, useCallback } from 'react';
import type { AdvertisementBanner, CreateBannerData } from '@/types/banner.types';

const initialFormData: CreateBannerData = {
  name: '',
  image_url: '',
  link_url: '',
  alt_text: '',
  position: 'header',
  is_active: true,
  payment_status: 'pending',
  payment_amount: 0,
  payment_note: '',
  advertiser_name: '',
  advertiser_contact: ''
};

export function useBannerForm() {
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdvertisementBanner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateBannerData>(initialFormData);

  // 이미지 업로드 핸들러 (메모이제이션으로 리렌더링 방지)
  const handleImageUpload = useCallback((url: string) => {
    console.log('Image uploaded:', url);
    setFormData(prev => {
      console.log('Previous form data:', prev);
      const newData = { ...prev, image_url: url };
      console.log('New form data:', newData);
      return newData;
    });
  }, []);

  const handleCreate = useCallback(() => {
    setEditingBanner(null);
    setFormData(initialFormData);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((banner: AdvertisementBanner) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      alt_text: banner.alt_text || '',
      position: banner.position,
      is_active: banner.is_active,
      start_date: banner.start_date || undefined,
      end_date: banner.end_date || undefined,
      payment_status: banner.payment_status,
      payment_amount: banner.payment_amount || 0,
      payment_note: banner.payment_note || '',
      advertiser_name: banner.advertiser_name || '',
      advertiser_contact: banner.advertiser_contact || ''
    });
    setShowModal(true);
  }, []);

  return {
    // State
    showModal,
    editingBanner,
    submitting,
    formData,
    // Setters
    setShowModal,
    setSubmitting,
    setFormData,
    // Handlers
    handleImageUpload,
    handleCreate,
    handleEdit
  };
}
