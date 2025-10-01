'use client';

import { Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  number: number;
  title: string;
  description: string;
  icon?: React.ElementType;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function StepIndicator({ steps, currentStep, className = '' }: StepIndicatorProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gray-200" />
          
          {/* Progress Line Active */}
          <motion.div 
            className="absolute top-12 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Steps */}
          <div className="flex justify-between relative">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.number;
              const isActive = currentStep === step.number;
              const isPending = currentStep < step.number;

              return (
                <motion.div
                  key={step.number}
                  className="flex flex-col items-center flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Step Circle */}
                  <div className="relative mb-3">
                    <motion.div
                      className={`
                        w-24 h-24 rounded-full flex items-center justify-center
                        transition-all duration-300 relative overflow-hidden
                        ${
                          isCompleted
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200'
                            : isActive
                            ? 'bg-white border-3 border-primary-500 text-primary-600 shadow-xl'
                            : 'bg-gray-50 border-2 border-gray-200 text-gray-400'
                        }
                      `}
                      whileHover={isPending ? {} : { scale: 1.05 }}
                      whileTap={isPending ? {} : { scale: 0.95 }}
                    >
                      {/* Background Pattern for Active */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 opacity-50" />
                      )}
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Check className="w-8 h-8" />
                          </motion.div>
                        ) : (
                          <span className="text-2xl font-bold">{step.number}</span>
                        )}
                      </div>

                      {/* Pulse Animation for Active */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-3 border-primary-400"
                          animate={{
                            scale: [1, 1.2, 1.2],
                            opacity: [0.5, 0, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                          }}
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Step Info */}
                  <div className="text-center px-2">
                    <h3
                      className={`
                        font-semibold mb-1 transition-colors
                        ${
                          isActive
                            ? 'text-gray-900 text-base'
                            : isCompleted
                            ? 'text-gray-700 text-sm'
                            : 'text-gray-500 text-sm'
                        }
                      `}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`
                        text-xs transition-all duration-300
                        ${
                          isActive
                            ? 'text-gray-600 opacity-100 max-h-20'
                            : 'text-gray-400 opacity-75 max-h-20'
                        }
                      `}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-6">
          {/* Current Step Info */}
          <div className="flex items-center gap-3">
            <div
              className="
                w-12 h-12 rounded-full flex items-center justify-center
                bg-gradient-to-br from-primary-500 to-primary-600 text-white
                shadow-lg shadow-primary-200
              "
            >
              <span className="text-lg font-bold">{currentStep}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {steps[currentStep - 1]?.title}
              </h3>
              <p className="text-xs text-gray-500">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          {/* Progress Text */}
          <div className="text-right">
            <span className="text-sm font-medium text-gray-900">
              {currentStep} / {steps.length}
            </span>
            <div className="text-xs text-gray-500">단계</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step List for Mobile */}
        <div className="mt-6 space-y-3">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;
            const isPending = currentStep < step.number;

            return (
              <div
                key={step.number}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all
                  ${
                    isActive
                      ? 'bg-primary-50 border border-primary-200'
                      : isCompleted
                      ? 'bg-gray-50'
                      : 'opacity-50'
                  }
                `}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${
                      isCompleted
                        ? 'bg-primary-600 text-white'
                        : isActive
                        ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                    {step.title}
                  </h4>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary-600" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}