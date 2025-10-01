'use client';

import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Star, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JobSlot {
  position: 'top' | 'middle' | 'bottom';
  index: number;
  row: number;
  col: number;
  isOccupied: boolean;
  occupiedBy?: {
    id: string;
    title: string;
    company: string;
    priority: number;
  };
}

interface JobPositionAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobCompany: string;
  postingTier: 'standard' | 'top' | 'premium';
  currentJobs: any[];
  onAssign: (position: 'top' | 'middle' | 'bottom', priority: number) => void;
}

export default function JobPositionAssignModal({
  isOpen,
  onClose,
  jobTitle,
  jobCompany,
  postingTier,
  currentJobs,
  onAssign
}: JobPositionAssignModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<'top' | 'middle' | 'bottom' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<JobSlot | null>(null);
  const [slots, setSlots] = useState<{
    top: JobSlot[];
    middle: JobSlot[];
    bottom: JobSlot[];
  }>({
    top: [],
    middle: [],
    bottom: []
  });

  // 그리드 구조 정의
  const GRID_CONFIG = {
    top: { cols: 4, rows: 5, total: 20, label: '최상단 영역', color: 'red' },
    middle: { cols: 5, rows: 5, total: 25, label: '중단 영역', color: 'blue' },
    bottom: { cols: 6, rows: 5, total: 30, label: '하단 영역', color: 'gray' }
  };

  // 슬롯 생성 및 현재 할당 상태 반영
  useEffect(() => {
    const createSlots = () => {
      const newSlots: typeof slots = { top: [], middle: [], bottom: [] };

      (['top', 'middle', 'bottom'] as const).forEach(position => {
        const config = GRID_CONFIG[position];
        const occupiedJobs = currentJobs.filter(j => j.display?.position === position);
        
        for (let i = 0; i < config.total; i++) {
          const row = Math.floor(i / config.cols);
          const col = i % config.cols;
          const priority = i + 1;
          
          const occupiedJob = occupiedJobs.find(j => j.display?.priority === priority);
          
          newSlots[position].push({
            position,
            index: i,
            row,
            col,
            isOccupied: !!occupiedJob,
            occupiedBy: occupiedJob ? {
              id: occupiedJob.id,
              title: occupiedJob.title,
              company: occupiedJob.company?.name || '',
              priority: occupiedJob.display.priority
            } : undefined
          });
        }
      });

      setSlots(newSlots);
    };

    if (isOpen) {
      createSlots();
    }
  }, [isOpen, currentJobs]);

  const handleSlotClick = (slot: JobSlot) => {
    if (slot.isOccupied) return;
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    if (selectedSlot) {
      const priority = selectedSlot.index + 1;
      onAssign(selectedSlot.position, priority);
      onClose();
    }
  };

  const renderGrid = (position: 'top' | 'middle' | 'bottom') => {
    const config = GRID_CONFIG[position];
    const positionSlots = slots[position];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{config.label}</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {config.cols}×{config.rows} ({config.total}개)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
              <span className="text-gray-600">선택 가능</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
              <span className="text-gray-600">할당됨</span>
            </div>
          </div>
        </div>

        <div 
          className="grid gap-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
          style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
        >
          {positionSlots.map((slot) => {
            const isSelected = selectedSlot?.position === slot.position && selectedSlot?.index === slot.index;
            
            return (
              <button
                key={`${slot.position}-${slot.index}`}
                onClick={() => handleSlotClick(slot)}
                disabled={slot.isOccupied}
                className={`
                  relative aspect-square rounded-lg border-2 transition-all
                  ${slot.isOccupied 
                    ? 'bg-gray-200 border-gray-300 cursor-not-allowed' 
                    : isSelected
                      ? 'bg-primary-500 border-primary-600 shadow-lg scale-105'
                      : 'bg-white border-green-400 hover:bg-green-50 hover:border-green-500 hover:scale-105 cursor-pointer'
                  }
                `}
                title={slot.isOccupied ? `${slot.occupiedBy?.company} - ${slot.occupiedBy?.title}` : `위치 ${slot.index + 1}`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                  {slot.isOccupied ? (
                    <>
                      <span className="text-[10px] font-bold text-gray-600 truncate w-full text-center">
                        {slot.occupiedBy?.company}
                      </span>
                      <span className="text-[8px] text-gray-500">
                        #{slot.occupiedBy?.priority}
                      </span>
                    </>
                  ) : isSelected ? (
                    <>
                      <Check className="w-4 h-4 text-white mb-0.5" />
                      <span className="text-[10px] text-white font-bold">
                        #{slot.index + 1}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      {slot.index + 1}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span>총 {config.total}개 슬롯</span>
          <span>•</span>
          <span className="text-green-600">
            사용 가능: {positionSlots.filter(s => !s.isOccupied).length}개
          </span>
          <span>•</span>
          <span className="text-gray-500">
            할당됨: {positionSlots.filter(s => s.isOccupied).length}개
          </span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {postingTier === 'premium' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      <Zap className="w-3 h-3" />
                      프리미엄
                    </span>
                  )}
                  {postingTier === 'top' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" />
                      최상단
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{jobTitle}</h2>
                <p className="text-white/90 mt-1">{jobCompany}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/90">
                  <p className="font-medium mb-1">영화관 좌석처럼 원하는 위치를 선택하세요</p>
                  <ul className="space-y-1 text-xs text-white/80">
                    <li>• 낮은 번호일수록 위쪽에 노출됩니다</li>
                    <li>• 회색 블록은 이미 다른 공고가 차지한 자리입니다</li>
                    <li>• 초록색 테두리 블록을 클릭하여 선택하세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {renderGrid('top')}
            {renderGrid('middle')}
            {renderGrid('bottom')}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                {selectedSlot ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {GRID_CONFIG[selectedSlot.position].label} - 위치 #{selectedSlot.index + 1}
                        </p>
                        <p className="text-xs text-gray-500">
                          우선순위: {selectedSlot.index + 1} (낮을수록 위)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">위치를 선택해주세요</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedSlot}
                  className={`
                    px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
                    ${selectedSlot
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Check className="w-5 h-5" />
                  위치 할당
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

