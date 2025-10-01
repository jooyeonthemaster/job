'use client';

import Modal from './Modal';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
  title?: string;
  type?: 'error' | 'warning' | 'success';
}

const ValidationModal = ({ 
  isOpen, 
  onClose, 
  errors, 
  title = '필수 입력 항목을 확인해주세요',
  type = 'error'
}: ValidationModalProps) => {
  
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          title: 'text-red-900',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          title: 'text-yellow-900',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          title: 'text-green-900',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          title: 'text-red-900',
          button: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${colors.bg} ${colors.border} border`}>
            {getIcon()}
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-center text-lg font-semibold mb-4 ${colors.title}`}>
          {title}
        </h3>

        {/* Error List */}
        {errors.length > 0 && (
          <div className={`rounded-lg p-4 mb-6 ${colors.bg} ${colors.border} border`}>
            <ul className={`text-sm ${colors.text} space-y-2`}>
              {errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 text-white font-medium rounded-lg transition-colors ${colors.button}`}
          >
            확인했습니다
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ValidationModal;