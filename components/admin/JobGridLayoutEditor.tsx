'use client';

import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { type JobWithCompany } from '@/lib/supabase/admin-service';
import { supabase } from '@/lib/supabase/config';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { SortableGridSlot } from './SortableGridSlot';

interface GridSlot {
  id: string;
  position: 'top' | 'middle' | 'bottom';
  priority: number;
  job: JobWithCompany | null;
}

const generateEmptyId = () => `empty-${Math.random().toString(36).substr(2, 9)}`;

interface JobGridLayoutEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedJobId?: string | null;
}

export default function JobGridLayoutEditor({
  isOpen,
  onClose,
  onSuccess,
  preselectedJobId
}: JobGridLayoutEditorProps) {
  // 3개 섹션별 슬롯
  const [topSlots, setTopSlots] = useState<GridSlot[]>([]);      // 20개 (4열 x 5행)
  const [middleSlots, setMiddleSlots] = useState<GridSlot[]>([]); // 25개 (5열 x 5행)
  const [bottomSlots, setBottomSlots] = useState<GridSlot[]>([]); // 30개 (6열 x 5행)

  const [unassignedJobs, setUnassignedJobs] = useState<JobWithCompany[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<JobWithCompany | null>(null);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 75; // Top 20 + Middle 25 + Bottom 30

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, currentPage]);

  // preselectedJobId가 변경되면 선택 상태 업데이트
  useEffect(() => {
    if (isOpen && preselectedJobId && unassignedJobs.length > 0) {
      const preselectedJob = unassignedJobs.find(job => job.id === preselectedJobId);
      if (preselectedJob) {
        setSelectedJob(preselectedJob);
      }
    }
  }, [preselectedJobId, unassignedJobs, isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 결제 완료된 공고만 DB에서 직접 필터링 (active + pending_approval + draft 포함, 테스트 결제 포함)
      const { data: allJobs, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo,
            industry
          )
        `)
        .in('status', ['active', 'pending_approval', 'draft'])
        .not('payment_status', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activeJobs = (allJobs || []) as JobWithCompany[];

      // 페이지 기반 priority 계산
      // 페이지 1: Top 1-20, Middle 1-25, Bottom 1-30
      // 페이지 2: Top 21-40, Middle 26-50, Bottom 31-60
      const topStart = (currentPage - 1) * 20 + 1;
      const middleStart = (currentPage - 1) * 25 + 1;
      const bottomStart = (currentPage - 1) * 30 + 1;

      // Top 슬롯 초기화 (20개: 4열 x 5행)
      const initialTopSlots: GridSlot[] = [];
      for (let i = 0; i < 20; i++) {
        initialTopSlots.push({
          id: generateEmptyId(),
          position: 'top',
          priority: topStart + i,
          job: null
        });
      }

      // Middle 슬롯 초기화 (25개: 5열 x 5행)
      const initialMiddleSlots: GridSlot[] = [];
      for (let i = 0; i < 25; i++) {
        initialMiddleSlots.push({
          id: generateEmptyId(),
          position: 'middle',
          priority: middleStart + i,
          job: null
        });
      }

      // Bottom 슬롯 초기화 (30개: 6열 x 5행)
      const initialBottomSlots: GridSlot[] = [];
      for (let i = 0; i < 30; i++) {
        initialBottomSlots.push({
          id: generateEmptyId(),
          position: 'bottom',
          priority: bottomStart + i,
          job: null
        });
      }

      // 기존 할당된 공고를 슬롯에 배치
      activeJobs.forEach(job => {
        if (job.display_position && job.display_priority) {
          let targetSlots: GridSlot[];

          if (job.display_position === 'top') {
            targetSlots = initialTopSlots;
          } else if (job.display_position === 'middle') {
            targetSlots = initialMiddleSlots;
          } else {
            targetSlots = initialBottomSlots;
          }

          const slotIndex = targetSlots.findIndex(
            slot =>
              slot.priority === job.display_priority &&
              slot.job === null
          );

          if (slotIndex !== -1) {
            targetSlots[slotIndex].job = job;
            targetSlots[slotIndex].id = job.id;
          }
        }
      });

      setTopSlots(initialTopSlots);
      setMiddleSlots(initialMiddleSlots);
      setBottomSlots(initialBottomSlots);

      // 할당 안 된 공고 목록
      const allAssigned = [
        ...initialTopSlots,
        ...initialMiddleSlots,
        ...initialBottomSlots
      ]
        .filter(s => s.job !== null)
        .map(s => s.job!.id);

      const unassigned = activeJobs.filter(job => !allAssigned.includes(job.id));
      setUnassignedJobs(unassigned);

      // preselectedJobId가 있으면 해당 공고를 자동 선택
      if (preselectedJobId) {
        const preselectedJob = activeJobs.find(job => job.id === preselectedJobId);
        if (preselectedJob) {
          setSelectedJob(preselectedJob);

          // 공고가 이미 할당되어 있으면 해당 슬롯으로 스크롤
          setTimeout(() => {
            const jobSlot = document.querySelector(`[data-job-id="${preselectedJobId}"]`);
            if (jobSlot) {
              jobSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              // 미할당 공고면 사이드바로 스크롤
              const sidebar = document.querySelector('.job-sidebar');
              if (sidebar) {
                sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }, 300);
        }
      }
    } catch (error) {
      console.error('Failed to load grid data:', error);
      alert('데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (section: 'top' | 'middle' | 'bottom', slotIndex: number) => {
    if (!selectedJob) return;

    const allSlots = [...topSlots, ...middleSlots, ...bottomSlots];
    let targetSlots: GridSlot[];
    let setTargetSlots: React.Dispatch<React.SetStateAction<GridSlot[]>>;

    if (section === 'top') {
      targetSlots = [...topSlots];
      setTargetSlots = setTopSlots;
    } else if (section === 'middle') {
      targetSlots = [...middleSlots];
      setTargetSlots = setMiddleSlots;
    } else {
      targetSlots = [...bottomSlots];
      setTargetSlots = setBottomSlots;
    }

    // 기존 위치에서 제거
    const existingTopIndex = topSlots.findIndex(s => s.job?.id === selectedJob.id);
    const existingMiddleIndex = middleSlots.findIndex(s => s.job?.id === selectedJob.id);
    const existingBottomIndex = bottomSlots.findIndex(s => s.job?.id === selectedJob.id);

    if (existingTopIndex !== -1) {
      const newTopSlots = [...topSlots];
      newTopSlots[existingTopIndex].job = null;
      setTopSlots(newTopSlots);
    }
    if (existingMiddleIndex !== -1) {
      const newMiddleSlots = [...middleSlots];
      newMiddleSlots[existingMiddleIndex].job = null;
      setMiddleSlots(newMiddleSlots);
    }
    if (existingBottomIndex !== -1) {
      const newBottomSlots = [...bottomSlots];
      newBottomSlots[existingBottomIndex].job = null;
      setBottomSlots(newBottomSlots);
    }

    // 현재 슬롯에 있는 공고를 미할당으로 이동
    if (targetSlots[slotIndex].job) {
      setUnassignedJobs(prev => [...prev, targetSlots[slotIndex].job!]);
    }

    // 새 위치에 할당
    targetSlots[slotIndex].job = selectedJob;
    targetSlots[slotIndex].id = selectedJob.id;
    setTargetSlots(targetSlots);

    // 선택된 공고를 미할당 목록에서 제거
    setUnassignedJobs(prev => prev.filter(j => j.id !== selectedJob.id));
    setSelectedJob(null);
  };

  const handleRemoveFromSlot = (section: 'top' | 'middle' | 'bottom', slotIndex: number) => {
    let targetSlots: GridSlot[];
    let setTargetSlots: React.Dispatch<React.SetStateAction<GridSlot[]>>;

    if (section === 'top') {
      targetSlots = [...topSlots];
      setTargetSlots = setTopSlots;
    } else if (section === 'middle') {
      targetSlots = [...middleSlots];
      setTargetSlots = setMiddleSlots;
    } else {
      targetSlots = [...bottomSlots];
      setTargetSlots = setBottomSlots;
    }

    const job = targetSlots[slotIndex].job;
    if (job) {
      setUnassignedJobs(prev => [...prev, job]);
      targetSlots[slotIndex].job = null;
      targetSlots[slotIndex].id = generateEmptyId();
      setTargetSlots(targetSlots);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findContainer = (id: string) => {
    if (topSlots.find((item) => item.id === id)) return 'top';
    if (middleSlots.find((item) => item.id === id)) return 'middle';
    if (bottomSlots.find((item) => item.id === id)) return 'bottom';
    return null;
  };

  const normalizeSlots = (slots: GridSlot[], limit: number, section: 'top' | 'middle' | 'bottom', startPriority: number) => {
    let newSlots = [...slots];
    // limit 초과 시 처리
    if (newSlots.length > limit) {
      const jobs = newSlots.filter(s => s.job);
      if (jobs.length <= limit) {
        newSlots = jobs;
      } else {
        const ejected = jobs.slice(limit);
        newSlots = jobs.slice(0, limit);
        setUnassignedJobs(prev => {
          const existingIds = new Set(prev.map(j => j.id));
          const newJobs = ejected.map(s => s.job!).filter(j => !existingIds.has(j.id));
          return [...prev, ...newJobs];
        });
      }
    }

    // 빈 슬롯 채우기
    while (newSlots.length < limit) {
      newSlots.push({
        id: generateEmptyId(),
        position: section,
        priority: 0,
        job: null
      });
    }

    return newSlots.map((slot, idx) => ({
      ...slot,
      position: section,
      priority: startPriority + idx
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    setActiveId(id as string);

    const allSlots = [...topSlots, ...middleSlots, ...bottomSlots];
    const slot = allSlots.find(s => s.id === id);
    if (slot && slot.job) {
      setActiveJob(slot.job);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const getSlots = (c: string) => c === 'top' ? topSlots : c === 'middle' ? middleSlots : bottomSlots;
    const setSlots = (c: string, s: GridSlot[]) => c === 'top' ? setTopSlots(s) : c === 'middle' ? setMiddleSlots(s) : setBottomSlots(s);

    const activeItems = getSlots(activeContainer);
    const overItems = getSlots(overContainer);

    const activeIndex = activeItems.findIndex(i => i.id === active.id);
    const overIndex = overItems.findIndex(i => i.id === overId);

    let newIndex;
    if (overId in overItems) {
      newIndex = overItems.length + 1;
    } else {
      const isBelowLastItem =
        over &&
        overIndex === overItems.length - 1 &&
        // @ts-ignore
        event.delta.y > 0;

      const modifier = isBelowLastItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    setSlots(activeContainer, [
      ...activeItems.filter(item => item.id !== active.id)
    ]);
    setSlots(overContainer, [
      ...overItems.slice(0, newIndex),
      activeItems[activeIndex],
      ...overItems.slice(newIndex, overItems.length)
    ]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findContainer(active.id as string);
    const overContainer = over ? findContainer(over.id as string) : null;

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const slots = activeContainer === 'top' ? topSlots : activeContainer === 'middle' ? middleSlots : bottomSlots;
      const setSlots = activeContainer === 'top' ? setTopSlots : activeContainer === 'middle' ? setMiddleSlots : setBottomSlots;

      const oldIndex = slots.findIndex(s => s.id === active.id);
      const newIndex = slots.findIndex(s => s.id === over!.id);

      if (oldIndex !== newIndex) {
        setSlots(arrayMove(slots, oldIndex, newIndex));
      }
    }

    setActiveId(null);
    setActiveJob(null);
  };

  useEffect(() => {
    if (!activeId && !loading) {
      const topStart = (currentPage - 1) * 20 + 1;
      const middleStart = (currentPage - 1) * 25 + 1;
      const bottomStart = (currentPage - 1) * 30 + 1;

      setTopSlots(prev => normalizeSlots(prev, 20, 'top', topStart));
      setMiddleSlots(prev => normalizeSlots(prev, 25, 'middle', middleStart));
      setBottomSlots(prev => normalizeSlots(prev, 30, 'bottom', bottomStart));
    }
  }, [activeId, currentPage, loading]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const allSlots = [
        ...topSlots.map(s => ({ ...s, section: 'top' as const })),
        ...middleSlots.map(s => ({ ...s, section: 'middle' as const })),
        ...bottomSlots.map(s => ({ ...s, section: 'bottom' as const }))
      ];

      const changedSlots = allSlots.filter(slot => slot.job !== null);

      // 모든 공고의 위치를 일괄 업데이트 (위치 할당 = 자동 승인)
      const updatePromises = changedSlots.map(slot => {
        return supabase
          .from('jobs')
          .update({
            display_position: slot.position,
            display_priority: slot.priority,
            status: 'active'  // 위치 할당 시 자동으로 활성화
          })
          .eq('id', slot.job!.id);
      });

      // 할당 해제된 공고들의 display_position을 null로 (위치 해제 = 승인 취소)
      const unassignPromises = unassignedJobs.map(job => {
        return supabase
          .from('jobs')
          .update({
            display_position: null,
            display_priority: null,
            status: 'pending_approval'  // 위치 해제 시 승인 대기로 되돌림
          })
          .eq('id', job.id);
      });

      await Promise.all([...updatePromises, ...unassignPromises]);

      alert('레이아웃이 저장되었습니다!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('저장에 실패했습니다: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('현재 변경사항을 모두 취소하고 초기화하시겠습니까?')) {
      loadData();
      setSelectedJob(null);
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'premium') {
      return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">프리미엄</span>;
    } else if (tier === 'top') {
      return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">탑</span>;
    } else {
      return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded">일반</span>;
    }
  };

  const renderSlot = (slot: GridSlot, section: 'top' | 'middle' | 'bottom', index: number, size: 'large' | 'medium' | 'small', isOverlay = false) => {
    const hasJob = !!slot.job;
    const isSelected = selectedJob?.id === slot.job?.id;

    const sizeClasses = {
      large: 'h-32',
      medium: 'h-28',
      small: 'h-24'
    };

    // SortableGridSlot needs unique ID
    const Component = isOverlay ? 'div' : SortableGridSlot;

    return (
      <Component
        key={isOverlay ? undefined : slot.id}
        id={isOverlay ? 'overlay-item' : slot.id}
        disabled={!hasJob && !isOverlay} // 빈 슬롯도 드래그 가능하게 하려면 제거. 현재: 빈 슬롯 드래그 불가 (직관적).
        // 하지만 빈 슬롯이 드래그가 안되면, 빈 슬롯을 "건너뛰는" 인터랙션이 됨.
        // 드래그 앤 드롭에서 "빈 공간"을 드래그해서 위치를 바꾸는 건 드묾.
        // 단, "Job"을 드래그해서 "빈 슬롯"에 놓는 건 가능.

        data-job-id={hasJob ? slot.job?.id : undefined}
        onClick={() => {
          if (isOverlay) return;
          hasJob ? handleRemoveFromSlot(section, index) : handleSlotClick(section, index);
        }}
        className={`
          ${sizeClasses[size]} rounded-lg border-2 transition-all relative overflow-hidden cursor-pointer
          ${hasJob
            ? 'bg-white border-gray-200 hover:border-red-400 hover:shadow-md'
            : 'border-dashed border-gray-300 bg-gray-50 hover:border-primary-500 hover:bg-primary-50'
          }
          ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
          ${isOverlay ? 'shadow-2xl scale-105 z-50 opacity-90 cursor-grabbing' : ''}
        `}
      >
        {hasJob ? (
          <div className="p-2 h-full flex flex-col pointer-events-none"> {/* content no pointer events to prevent child click interference */}
            <div className="flex items-start justify-between mb-1">
              {getTierBadge(slot.job!.posting_tier)}
              <span className="text-[10px] text-gray-400">#{slot.priority}</span>
            </div>
            <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1 text-left">
              {slot.job!.title}
            </p>
            <p className="text-[10px] text-gray-600 line-clamp-1 text-left">
              {slot.job!.companies?.name}
            </p>
            {!isOverlay && (
              <div className="mt-auto pt-1">
                <div className="text-[10px] text-red-600 font-medium opacity-0 group-hover:opacity-100">
                  클릭하여 제거
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-[10px] font-medium">#{slot.priority}</span>
            <span className="text-[9px]">빈 슬롯</span>
          </div>
        )}
      </Component>
    );
  };

  if (!isOpen) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                채용공고 그리드 레이아웃 편집기
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                실제 /jobs 페이지에 표시되는 공고 위치를 관리합니다 (페이지당 75개 슬롯)
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 페이지네이션 */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-2">
                  페이지 {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    모두 저장
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">레이아웃 로딩 중...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex">
              {/* 메인 그리드 영역 (70%) */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Top 섹션 - 4열 그리드 */}
                <div className="mb-12">
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-md p-4 mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <span>🔥</span>
                      Top 섹션 (프리미엄/탑 공고)
                      <span className="text-sm font-normal text-white/80">- 4열 그리드, 최대 20개</span>
                    </h3>
                  </div>
                  <SortableContext items={topSlots.map(s => s.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-4 gap-3">
                      {topSlots.map((slot, idx) => renderSlot(slot, 'top', idx, 'large'))}
                    </div>
                  </SortableContext>
                </div>

                {/* Middle 섹션 - 5열 그리드 */}
                <div className="mb-12">
                  <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-md p-4 mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <span>⭐</span>
                      Middle 섹션 (추천 공고)
                      <span className="text-sm font-normal text-white/80">- 5열 그리드, 최대 25개</span>
                    </h3>
                  </div>
                  <SortableContext items={middleSlots.map(s => s.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-5 gap-3">
                      {middleSlots.map((slot, idx) => renderSlot(slot, 'middle', idx, 'medium'))}
                    </div>
                  </SortableContext>
                </div>

                {/* Bottom 섹션 - 6열 그리드 */}
                <div>
                  <div className="bg-gradient-to-r from-green-900 to-emerald-800 rounded-md p-4 mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <span>📋</span>
                      Bottom 섹션 (일반 공고)
                      <span className="text-sm font-normal text-white/80">- 6열 그리드, 최대 30개</span>
                    </h3>
                  </div>
                  <SortableContext items={bottomSlots.map(s => s.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-6 gap-2.5">
                      {bottomSlots.map((slot, idx) => renderSlot(slot, 'bottom', idx, 'small'))}
                    </div>
                  </SortableContext>
                </div>
              </div>

              {/* 사이드바 - 미할당 공고 (30%) */}
              <div className="w-80 border-l border-gray-200 flex flex-col job-sidebar">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    할당 대기 공고 ({unassignedJobs.length}개)
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    결제 완료 + 미할당 공고 표시 (임시저장 포함)
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="제목, 회사명 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {unassignedJobs
                    .filter(job => {
                      if (!searchTerm) return true;
                      const term = searchTerm.toLowerCase();
                      return (
                        job.title.toLowerCase().includes(term) ||
                        job.companies?.name.toLowerCase().includes(term)
                      );
                    })
                    .map(job => (
                      <button
                        key={job.id}
                        data-job-id={job.id}
                        onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                        className={`
                            w-full text-left p-3 rounded-lg border-2 transition-all
                            ${selectedJob?.id === job.id
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-offset-2'
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
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {job.companies?.name}
                        </p>
                      </button>
                    ))}

                  {unassignedJobs.filter(job => {
                    if (!searchTerm) return true;
                    const term = searchTerm.toLowerCase();
                    return (
                      job.title.toLowerCase().includes(term) ||
                      job.companies?.name.toLowerCase().includes(term)
                    );
                  }).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">
                        {searchTerm ? '검색 결과가 없습니다' : '모든 공고가 배치되었습니다'}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          <DragOverlay>
            {activeId && activeJob ? (
              renderSlot({ id: activeId, position: 'top', priority: 0, job: activeJob }, 'top', 0, 'medium', true)
            ) : null}
          </DragOverlay>
        </div>
      </div>
    </DndContext>
  );
}
