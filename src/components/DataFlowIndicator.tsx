import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, User, Home, Package } from 'lucide-react';

interface DataFlowIndicatorProps {
  show: boolean;
  onComplete: () => void;
}

const DataFlowIndicator: React.FC<DataFlowIndicatorProps> = ({ show, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps = [
    { icon: User, label: 'User Profile Data', description: 'Loading farmer information' },
    { icon: Home, label: 'Farm Profile', description: 'Auto-populating farm details' },
    { icon: Package, label: 'Inventory', description: 'Generating inventory items' }
  ];

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setCompleted(true);
          setTimeout(onComplete, 1000);
          return prev;
        }
      });
    }, 800);

    return () => clearInterval(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Setting Up Your Farm Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Auto-populating your farm profile and inventory from your user data
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep || completed;

            return (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : isActive 
                      ? 'bg-primary-100 dark:bg-primary-900/30' 
                      : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <StepIcon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-400'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${
                    isCompleted || isActive 
                      ? 'text-gray-800 dark:text-white' 
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight className={`w-4 h-4 ${
                    isCompleted 
                      ? 'text-green-500' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {completed && (
          <div className="mt-6 text-center">
            <div className="text-green-600 dark:text-green-400 font-medium">
              ✅ Setup Complete!
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your farm data is ready to use
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFlowIndicator;