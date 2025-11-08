import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainModel, saveModel } from '../api/client';
import ModelNameDialog from '../components/ModelNameDialog';

const TrainPage = () => {
  const navigate = useNavigate();
  const [corpus, setCorpus] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState(null);

  const wordCount = corpus.trim().split(/\s+/).filter(Boolean).length;
  const charCount = corpus.length;
  const minChars = 50;
  const isValid = charCount >= minChars;

  const handleTrain = async () => {
    if (!isValid) return;

    setError(null);
    setIsTraining(true);

    try {
      const result = await trainModel(corpus);
      setReportId(result.report_id);
      setShowDialog(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze corpus. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleSaveModel = async (modelName) => {
    setIsSaving(true);
    try {
      await saveModel(reportId, modelName);
      setShowDialog(false);
      // Redirect to transform page
      navigate('/transform');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save model. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Train Your Style Model
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste text from your desired style source. The model will learn the writing patterns,
            tone, and vocabulary to transform your text.
          </p>
        </div>

        {/* Main Card */}
        <div className="card p-8 animate-scale-in">
          {/* Textarea */}
          <div className="mb-6">
            <label htmlFor="corpus" className="block text-sm font-semibold text-gray-700 mb-3">
              Text Corpus
            </label>
            <textarea
              id="corpus"
              value={corpus}
              onChange={(e) => setCorpus(e.target.value)}
              placeholder="Paste dialogue from SpongeBob, Shakespeare quotes, or any text with a distinctive style..."
              className="textarea-field h-64 text-base"
              disabled={isTraining}
            />

            {/* Character/Word Counter */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span className={`font-medium ${charCount >= minChars ? 'text-green-600' : 'text-gray-500'}`}>
                  {charCount} characters
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{wordCount} words</span>
              </div>
              {charCount > 0 && charCount < minChars && (
                <span className="text-sm text-amber-600">
                  Need {minChars - charCount} more characters
                </span>
              )}
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

          {/* Action Button */}
          <button
            onClick={handleTrain}
            disabled={!isValid || isTraining}
            className="btn-primary w-full text-lg py-4"
          >
            {isTraining ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                Analyzing style patterns...
              </span>
            ) : (
              'Analyze Style'
            )}
          </button>

          {/* Tips */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Tips for better results
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                <span>The more text you provide, the better the model will learn the style</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                <span>Use text from a consistent source for clearer patterns</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                <span>Include varied examples to capture different aspects of the style</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Model Name Dialog */}
      <ModelNameDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveModel}
        isLoading={isSaving}
      />
    </div>
  );
};

export default TrainPage;
