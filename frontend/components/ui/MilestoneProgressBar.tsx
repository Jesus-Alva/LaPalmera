// components/ui/MilestoneProgressBar.tsx
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
  steps: string[];
}

export default function MilestoneProgressBar({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="relative">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  initial={{ scale: 1 }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </motion.div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-gray-200">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}