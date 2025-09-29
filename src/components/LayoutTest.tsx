/**
 * Layout Test Component
 * Simple component to test the layout structure
 */

import React from 'react';
import { ResponsiveLayout } from './ResponsiveLayout';

export const LayoutTest: React.FC = () => {
  return (
    <ResponsiveLayout 
      showHeader={true}
      showFooter={true}
      showSidebar={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Layout Test</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Header Test</h2>
              <p className="text-gray-600">
                This page should have a header with navigation, search, and user menu.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Footer Test</h2>
              <p className="text-gray-600">
                This page should have a footer with links and contact information.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Sidebar Test</h2>
              <p className="text-gray-600">
                This page should NOT have a sidebar (showSidebar=false).
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Layout Structure</h2>
              <p className="text-gray-600">
                The layout should be consistent across all pages with proper header, footer, and content areas.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-700">
              If you can see this content with a header above and footer below, the layout is working correctly!
            </p>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default LayoutTest;
