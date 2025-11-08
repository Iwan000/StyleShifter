import { useState, useEffect } from 'react';

const TrainingPreview = ({ isOpen, onClose, examples = [], defaultName = '', onSave, isSaving = false, title = 'Review Model Preview' }) => {
  const [modelName, setModelName] = useState(defaultName || '');

  useEffect(() => {
    setModelName(defaultName || '');
  }, [defaultName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modelName.trim()) {
      onSave(modelName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scale-in">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">Review the sample transformations before saving your model.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close" disabled={isSaving}>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Examples */}
          <div className="space-y-3 mb-6">
            {examples.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-gray-700">Generating example transformations...</span>
              </div>
            ) : (
              examples.map((ex, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Example {idx + 1}</div>
                  <p className="text-gray-900 whitespace-pre-wrap">{ex}</p>
                </div>
              ))
            )}
          </div>

          {/* Name + Actions */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
              <input
                id="modelName"
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="input-field"
                placeholder="e.g., Shakespeare, Yoda, SpongeBob"
                disabled={isSaving}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={isSaving}>Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={isSaving || !modelName.trim()}>
                {isSaving ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

export default TrainingPreview;

