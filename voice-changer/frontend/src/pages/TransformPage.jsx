import { useState, useEffect } from 'react';
import { getModels, transformText, deleteModel } from '../api/client';

const TransformPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const data = await getModels();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0].name);
      }
    } catch (err) {
      setError('Failed to load models');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleTransform = async () => {
    if (!inputText.trim() || !selectedModel) return;

    setError(null);
    setIsLoading(true);
    setOutputText('');

    try {
      const result = await transformText(selectedModel, inputText);
      setOutputText(result.transformed_text);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to transform text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedModel) return;

    try {
      await deleteModel(selectedModel);
      setShowDeleteConfirm(false);
      setSelectedModel('');
      setOutputText('');
      await loadModels();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete model.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoadingModels) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading models...</p>
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Models Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't trained any models yet. Train your first model to start transforming text!
          </p>
          <a href="/train" className="btn-primary inline-block">
            Train Your First Model
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Transform Your Text
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a trained model and watch your text transform into a different style
          </p>
        </div>

        {/* Model Selector */}
        <div className="card p-6 mb-6 animate-scale-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="model" className="block text-sm font-semibold text-gray-700 mb-2">
                Select Style Model
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input-field"
              >
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger mt-6"
              disabled={!selectedModel}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Column */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Text</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter the text you want to transform..."
              className="textarea-field h-64 mb-4"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{inputText.length} characters</span>
            </div>
            <button
              onClick={handleTransform}
              disabled={!inputText.trim() || isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Transforming...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Transform
                </span>
              )}
            </button>
          </div>

          {/* Output Column */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Transformed Text</h2>
              {outputText && (
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-200"
                >
                  {copied ? (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </span>
                  )}
                </button>
              )}
            </div>
            <div className="h-64 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg overflow-y-auto">
              {outputText ? (
                <p className="text-gray-900 whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-400 italic">Your transformed text will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteConfirm(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
              <div className="mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Model?</h2>
                <p className="text-gray-600">
                  Are you sure you want to delete <strong>{selectedModel}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleDelete} className="btn-danger flex-1">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransformPage;
