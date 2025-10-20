'use client';

import { useState } from 'react';
import { X, MapPin, ArrowUp, ArrowDown } from 'lucide-react';
import { updateJobDisplayPosition } from '@/lib/supabase/admin-service';

interface JobPositionAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    posting_tier: string;
    display_position: string | null;
    display_priority: number | null;
  };
  onSuccess: () => void;
}

export default function JobPositionAssignModal({
  isOpen,
  onClose,
  job,
  onSuccess
}: JobPositionAssignModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<'top' | 'middle' | 'bottom'>(
    (job?.display_position as 'top' | 'middle' | 'bottom') || 'middle'
  );
  const [priority, setPriority] = useState<number>(job?.display_priority || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const handleSubmit = async () => {
    if (!job) return;
    
    setLoading(true);
    setError('');

    try {
      await updateJobDisplayPosition(job.id, selectedPosition, priority);
      alert('공고 위치가 설정되었습니다.');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to assign position:', err);
      setError(err.message || '위치 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const positions = [
    {
      value: 'top',
      label: '최상단 영역',
      description: '프리미엄/최상단 공고 영역',
      color: 'red',
      icon: ArrowUp
    },
    {
      value: 'middle',
      label: '중단 영역',
      description: '일반 공고 영역',
      color: 'blue',
      icon: MapPin
    },
    {
      value: 'bottom',
      label: '하단 영역',
      description: '일반 공고 하단 영역',
      color: 'gray',
      icon: ArrowDown
    }
  ];

  const tierLabels: Record<string, string> = {
    premium: '프리미엄',
    top: '최상단',
    standard: '일반'
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">공고 위치 설정</h2>
            <p className="text-sm text-gray-600 mt-1">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 공고 정보 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">공고 등급</p>
                <p className="font-medium text-gray-900">
                  {tierLabels[job.posting_tier] || job.posting_tier}
                </p>
              </div>
              <div>
                <p className="text-gray-600">현재 위치</p>
                <p className="font-medium text-gray-900">
                  {job.display_position ? positions.find(p => p.value === job.display_position)?.label : '미할당'}
                </p>
              </div>
            </div>
          </div>

          {/* 위치 선택 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              노출 위치 선택 <span className="text-red-500">*</span>
            </label>
            <div className="grid gap-3">
              {positions.map((position) => {
                const Icon = position.icon;
                const isSelected = selectedPosition === position.value;
                
                return (
                  <button
                    key={position.value}
                    onClick={() => setSelectedPosition(position.value as 'top' | 'middle' | 'bottom')}
                    className={`
                      p-4 border-2 rounded-lg text-left transition-all
                      ${isSelected
                        ? `border-${position.color}-500 bg-${position.color}-50`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${isSelected ? `bg-${position.color}-100` : 'bg-gray-100'}
                      `}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? `text-${position.color}-600` : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isSelected ? `text-${position.color}-900` : 'text-gray-900'
                        }`}>
                          {position.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{position.description}</p>
                      </div>
                      {isSelected && (
                        <div className={`w-5 h-5 rounded-full bg-${position.color}-500 flex items-center justify-center`}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 우선순위 설정 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              우선순위 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="999"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <p className="text-sm text-gray-600">
                숫자가 낮을수록 상단에 노출됩니다 (1이 최상단)
              </p>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">💡 위치 설정 가이드</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>최상단 영역:</strong> 프리미엄 공고 전용 (우선 노출)</li>
              <li>• <strong>중단 영역:</strong> 일반 공고 메인 영역</li>
              <li>• <strong>하단 영역:</strong> 추가 공고 영역</li>
              <li>• 같은 영역 내에서는 우선순위 숫자로 정렬됩니다</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리중...' : '위치 설정'}
          </button>
        </div>
      </div>
    </div>
  );
}


