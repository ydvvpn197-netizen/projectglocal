/**
 * Onboarding Flow Component
 * Guides new users through the platform
 */

import React from 'react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome to TheGlocal</h2>
        <p className="text-gray-600 text-center mb-6">
          Let's get you started with your community experience.
        </p>
        <div className="space-y-4">
          <button
            onClick={onComplete}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={onSkip}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};