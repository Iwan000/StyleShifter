import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getModels } from '../api/client';

const Navbar = () => {
  const location = useLocation();
  const [modelCount, setModelCount] = useState(0);

  useEffect(() => {
    loadModelCount();
  }, [location]);

  const loadModelCount = async () => {
    try {
      const models = await getModels();
      setModelCount(models.length);
    } catch (error) {
      console.error('Failed to load model count:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Text Voice Changer
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/train"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/train')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Train
            </Link>
            <Link
              to="/transform"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/transform')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Transform
            </Link>

            {/* Model Count Badge */}
            {modelCount > 0 && (
              <div className="ml-4 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-200">
                <span className="text-sm font-semibold text-primary-700">
                  {modelCount} {modelCount === 1 ? 'model' : 'models'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
