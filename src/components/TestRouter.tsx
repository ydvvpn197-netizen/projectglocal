import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const TestRouter: React.FC = () => {
  const location = useLocation();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Router Test</h1>
      
      <div className="mb-6">
        <p className="text-lg mb-2">Current Location: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code></p>
        <p className="text-lg mb-2">Search: <code className="bg-gray-100 px-2 py-1 rounded">{location.search}</code></p>
        <p className="text-lg">Hash: <code className="bg-gray-100 px-2 py-1 rounded">{location.hash}</code></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link 
          to="/" 
          className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
        >
          Home (/)
        </Link>
        
        <Link 
          to="/about" 
          className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
        >
          About (/about)
        </Link>
        
        <Link 
          to="/discover" 
          className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center"
        >
          Discover (/discover)
        </Link>
        
        <Link 
          to="/community" 
          className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-center"
        >
          Community (/community)
        </Link>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click on any of the navigation buttons above</li>
          <li>Check if the URL changes in the address bar</li>
          <li>Verify that the current location display updates</li>
          <li>Try using the browser's back/forward buttons</li>
          <li>Refresh the page to see if it loads the correct route</li>
        </ol>
      </div>
    </div>
  );
};
