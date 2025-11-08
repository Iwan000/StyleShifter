import { useState } from 'react';

const ModelNameDialog = ({ isOpen, onClose, onSave, isLoading }) => {
  const [modelName, setModelName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modelName.trim()) {
      onSave(modelName.trim());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setModelName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Name Your Model
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Give your style model a memorable name to identify it later.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                id="modelName"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="input-field"
                placeholder="e.g., SpongeBob, Shakespeare, etc."
                autoFocus
                disabled={isLoading}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={isLoading || !modelName.trim()}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Model'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModelNameDialog;
