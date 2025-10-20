'use client';

import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Sparkles, TrendingUp, Grid3x3, Eye } from 'lucide-react';
import { getAllJobs, type JobWithCompany } from '@/lib/supabase/admin-service';
import { supabase } from '@/lib/supabase/config';

interface GridSlot {
  position: 'top' | 'middle' | 'bottom';
  priority: number;
  job: JobWithCompany | null;
}

interface JobGridLayoutEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JobGridLayoutEditor({
  isOpen,
  onClose,
  onSuccess
}: JobGridLayoutEditorProps) {
  const [slots, setSlots] = useState<GridSlot[]>([]);
  const [unassignedJobs, setUnassignedJobs] = useState<JobWithCompany[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allJobs = await getAllJobs();

      // 활성화되고 결제 완료된 공고만 필터링
      const activeJobs = allJobs.filter(
        job => job.status === 'active' && job.payment_status === 'confirmed'
      );

      // 슬롯 초기화 (16개: top 4, middle 8, bottom 4)
      const initialSlots: GridSlot[] = [];

      // Top zone: 4 slots
      for (let i = 0; i < 4; i++) {
        initialSlots.push({
          position: 'top',
          priority: i + 1,
          job: null
        });
      }

      // Middle zone: 8 slots (2 rows x 4 cols)
      for (let i = 0; i < 8; i++) {
        initialSlots.push({
          position: 'middle',
          priority: i + 1,
          job: null
        });
      }

      // Bottom zone: 4 slots
      for (let i = 0; i < 4; i++) {
        initialSlots.push({
          position: 'bottom',
          priority: i + 1,
          job: null
        });
      }

      // 기존 할당된 공고를 슬롯에 배치
      activeJobs.forEach(job => {
        if (job.display_position && job.display_priority) {
          const slotIndex = initialSlots.findIndex(
            slot =>
              slot.position === job.display_position &&
              slot.priority === job.display_priority &&
              slot.job === null
          );
          if (slotIndex !== -1) {
            initialSlots[slotIndex].job = job;
          }
        }
      });

      setSlots(initialSlots);

      // 할당 안 된 공고 목록
      const assigned = initialSlots.filter(s => s.job !== null).map(s => s.job!.id);
      setUnassignedJobs(activeJobs.filter(job => !assigned.includes(job.id)));
    } catch (error) {
      console.error('Failed to load grid data:', error);
      alert('데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (!selectedJob) return;

    const newSlots = [...slots];

    // 기존에 선택한 공고가 다른 슬롯에 있으면 제거
    const existingSlotIndex = newSlots.findIndex(s => s.job?.id === selectedJob.id);
    if (existingSlotIndex !== -1) {
      newSlots[existingSlotIndex].job = null;
    }

    // 현재 슬롯에 이미 공고가 있으면 unassigned로 이동
    if (newSlots[slotIndex].job) {
      setUnassignedJobs(prev => [...prev, newSlots[slotIndex].job!]);
    }

    // 새 공고 할당
    newSlots[slotIndex].job = selectedJob;
    setSlots(newSlots);

    // unassigned에서 제거
    setUnassignedJobs(prev => prev.filter(j => j.id !== selectedJob.id));
    setSelectedJob(null);
  };

  const handleRemoveFromSlot = (slotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSlots = [...slots];
    const removedJob = newSlots[slotIndex].job;

    if (removedJob) {
      newSlots[slotIndex].job = null;
      setSlots(newSlots);
      setUnassignedJobs(prev => [...prev, removedJob]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 모든 공고의 위치를 일괄 업데이트
      const updates = slots
        .filter(slot => slot.job !== null)
        .map(slot => ({
          id: slot.job!.id,
          display_position: slot.position,
          display_priority: slot.priority,
          display_assigned_at: new Date().toISOString(),
        }));

      // 할당 해제된 공고들
      const unassigns = unassignedJobs.map(job => ({
        id: job.id,
        display_position: null,
        display_priority: null,
        display_assigned_at: null,
      }));

      // 일괄 업데이트
      for (const update of [...updates, ...unassigns]) {
        await supabase
          .from('jobs')
          .update({
            display_position: update.display_position,
            display_priority: update.display_priority,
            display_assigned_at: update.display_assigned_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', update.id);
      }

      alert('✅ 공고 배치가 저장되었습니다!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'premium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
          <Sparkles className="w-3 h-3" />
          Premium
        </span>
      );
    } else if (tier === 'top') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          <TrendingUp className="w-3 h-3" />
          Top
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
          Standard
        </span>
      );
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">레이아웃 로딩 중...</p>
        </div>
      </div>
    );
  }

  const topSlots = slots.filter(s => s.position === 'top');
  const middleSlots = slots.filter(s => s.position === 'middle');
  const bottomSlots = slots.filter(s => s.position === 'bottom');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-start justify-center">
        <div className="bg-white rounded-xl w-full max-w-7xl my-8">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">공고 배치 에디터</h2>
                <p className="text-sm text-gray-600">클릭하여 공고를 배치하세요</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '저장하기'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex gap-6 p-6">
            {/* Grid Layout - 70% */}
            <div className="flex-1 space-y-6">
              {/* Top Zone */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">🔴 최상단 영역</h3>
                  <span className="text-xs text-gray-500">Premium / Top 공고 전용</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {topSlots.map((slot, index) => (
                    <div
                      key={`top-${index}`}
                      onClick={() => handleSlotClick(slots.indexOf(slot))}
                      className={`
                        relative h-32 rounded-lg border-2 transition-all cursor-pointer
                        ${slot.job
                          ? slot.job.posting_tier === 'premium'
                            ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                            : slot.job.posting_tier === 'top'
                            ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          : selectedJob
                          ? 'border-dashed border-primary-300 bg-primary-50 hover:border-primary-400'
                          : 'border-dashed border-gray-300 bg-white hover:border-gray-400'
                        }
                      `}
                    >
                      {slot.job ? (
                        <div className="p-3 h-full flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            {getTierBadge(slot.job.posting_tier)}
                            <button
                              onClick={(e) => handleRemoveFromSlot(slots.indexOf(slot), e)}
                              className="p-1 hover:bg-white/80 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                            {slot.job.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {slot.job.companies?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-400">{slot.priority}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {selectedJob ? '클릭하여 배치' : '빈 슬롯'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Zone */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">🔵 중단 영역</h3>
                  <span className="text-xs text-gray-500">메인 공고 영역</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {middleSlots.map((slot, index) => (
                    <div
                      key={`middle-${index}`}
                      onClick={() => handleSlotClick(slots.indexOf(slot))}
                      className={`
                        relative h-32 rounded-lg border-2 transition-all cursor-pointer
                        ${slot.job
                          ? 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          : selectedJob
                          ? 'border-dashed border-primary-300 bg-primary-50 hover:border-primary-400'
                          : 'border-dashed border-gray-300 bg-white hover:border-gray-400'
                        }
                      `}
                    >
                      {slot.job ? (
                        <div className="p-3 h-full flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            {getTierBadge(slot.job.posting_tier)}
                            <button
                              onClick={(e) => handleRemoveFromSlot(slots.indexOf(slot), e)}
                              className="p-1 hover:bg-white/80 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                            {slot.job.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {slot.job.companies?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-400">{slot.priority}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {selectedJob ? '클릭하여 배치' : '빈 슬롯'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Zone */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">⚪ 하단 영역</h3>
                  <span className="text-xs text-gray-500">추가 공고 영역</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {bottomSlots.map((slot, index) => (
                    <div
                      key={`bottom-${index}`}
                      onClick={() => handleSlotClick(slots.indexOf(slot))}
                      className={`
                        relative h-32 rounded-lg border-2 transition-all cursor-pointer
                        ${slot.job
                          ? 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          : selectedJob
                          ? 'border-dashed border-primary-300 bg-primary-50 hover:border-primary-400'
                          : 'border-dashed border-gray-300 bg-white hover:border-gray-400'
                        }
                      `}
                    >
                      {slot.job ? (
                        <div className="p-3 h-full flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            {getTierBadge(slot.job.posting_tier)}
                            <button
                              onClick={(e) => handleRemoveFromSlot(slots.indexOf(slot), e)}
                              className="p-1 hover:bg-white/80 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                            {slot.job.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {slot.job.companies?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-400">{slot.priority}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {selectedJob ? '클릭하여 배치' : '빈 슬롯'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Unassigned Jobs Sidebar - 30% */}
            <div className="w-80 shrink-0">
              <div className="sticky top-24">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    할당 대기 공고 ({unassignedJobs.length})
                  </h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {unassignedJobs.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        모든 공고가 배치되었습니다
                      </p>
                    ) : (
                      unassignedJobs.map(job => (
                        <button
                          key={job.id}
                          onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                          className={`
                            w-full text-left p-3 rounded-lg border-2 transition-all
                            ${selectedJob?.id === job.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-2">
                            {getTierBadge(job.posting_tier)}
                          </div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {job.companies?.name}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {selectedJob && (
                  <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-sm font-medium text-primary-900 mb-2">
                      선택된 공고
                    </p>
                    <p className="text-sm text-primary-700">
                      {selectedJob.title}
                    </p>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="mt-3 w-full px-3 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      선택 취소
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
