/**
 * Voice Control Panel Component
 * Voice control interface
 */

import React from 'react';

interface VoiceControlPanelProps {
  compact?: boolean;
}

export const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({ compact = false }) => {
  return (
    <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors cursor-pointer`}>
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>
  );
};
