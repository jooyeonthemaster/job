'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  updatePaymentStatus,
  calculateBannerStats,
  getTotalStats
} from '@/lib/supabase/banner-service';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import type {
  AdvertisementBanner,
  BannerPosition,
  CreateBannerData,
  PaymentStatus
} from '@/types/banner.types';
import {
  BANNER_SIZES,
  BANNER_POSITION_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS
} from '@/types/banner.types';
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Calendar,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';

export default function BannersTab() {
  const [banners, setBanners] = useState<AdvertisementBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdvertisementBanner | null>(null);
  const [stats, setStats] = useState<any>(null);

  // 폼 상태
  const [formData, setFormData] = useState<CreateBannerData>({
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
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bannersData, statsData] = await Promise.all([
        getAllBanners(),
        getTotalStats()
      ]);
      setBanners(bannersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load banners:', error);
      alert('데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
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
    });
    setShowModal(true);
  };

  const handleEdit = (banner: AdvertisementBanner) => {
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
  };

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

  const handlePaymentStatusChange = async (
    id: string,
    status: PaymentStatus
  ) => {
    try {
      await updatePaymentStatus(id, status);
      await loadData();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('결제 상태 변경에 실패했습니다.');
    }
  };

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
  const bannersByPosition: Record<BannerPosition, AdvertisementBanner[]> = {
    header: banners.filter((b) => b.position === 'header'),
    'jobs-sidebar-1': banners.filter((b) => b.position === 'jobs-sidebar-1'),
    'jobs-sidebar-2': banners.filter((b) => b.position === 'jobs-sidebar-2')
  };

  return (
    <div className="space-y-6">
      {/* 헤더 & 전체 통계 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">광고 배너 관리</h2>
            <p className="text-gray-600 mt-1">
              사이트에 노출되는 광고 배너를 관리합니다
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              배너 추가
            </button>
          </div>
        </div>

        {/* 전체 통계 */}
        {stats && (
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">전체 배너</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.totalBanners}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">활성 배너</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {stats.activeBanners}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">총 노출</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {stats.totalViews.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <MousePointerClick className="w-4 h-4" />
                <span className="text-sm font-medium">총 클릭</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {stats.totalClicks.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-pink-700 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">평균 CTR</span>
              </div>
              <div className="text-2xl font-bold text-pink-900">
                {stats.averageCTR}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 위치별 배너 목록 */}
      {(['header', 'jobs-sidebar-1', 'jobs-sidebar-2'] as BannerPosition[]).map(
        (position) => (
          <div key={position} className="bg-white rounded-xl shadow-sm p-6">
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
                {bannersByPosition[position].length}개 배너
              </div>
            </div>

            {bannersByPosition[position].length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">등록된 배너가 없습니다</p>
                <button
                  onClick={handleCreate}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  첫 배너 추가하기 →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bannersByPosition[position].map((banner) => {
                  const stats = calculateBannerStats(banner);
                  return (
                    <div
                      key={banner.id}
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
                              className="object-cover"
                              unoptimized
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
                                onClick={() => handleToggleActive(banner.id, banner.is_active)}
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
                                  handlePaymentStatusChange(
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
                                onClick={() => handleEdit(banner)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="수정"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(banner.id, banner.name)}
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
                })}
              </div>
            )}
          </div>
        )
      )}

      {/* 배너 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBanner ? '배너 수정' : '배너 추가'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 배너 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배너 이름 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    setFormData({
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
                  onUploadSuccess={handleImageUpload}
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
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
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
                      setFormData({ ...formData, advertiser_name: e.target.value })
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
                      setFormData({ ...formData, advertiser_contact: e.target.value })
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
                      setFormData({
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
                      setFormData({
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
                    setFormData({ ...formData, payment_note: e.target.value })
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
                    setFormData({ ...formData, is_active: e.target.checked })
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
                  onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
}
