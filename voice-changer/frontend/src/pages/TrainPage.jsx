import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainModel, saveModel, trainModelFromPdf, extractPdf, searchCharacters, trainFromCharacter } from '../api/client';
import ModelNameDialog from '../components/ModelNameDialog';
import FileUploadZone from '../components/FileUploadZone';

// Category icons mapping
const CATEGORY_ICONS = {
  'tv': '📺',
  'movie': '🎬',
  'literature': '📚',
  'historical': '👤',
  'game': '🎮',
  'anime': '🎌',
  'cartoon': '🎨',
};

const TrainPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'pdf', or 'character'
  const [corpus, setCorpus] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState(null);

  // Character search state
  const [searchQuery, setSearchQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Calculate stats based on active tab
  const textToAnalyze = activeTab === 'text' ? corpus : extractedText;
  const wordCount = textToAnalyze.trim().split(/\s+/).filter(Boolean).length;
  const charCount = textToAnalyze.length;
  const minChars = 50;
  const isValid = activeTab === 'text'
    ? charCount >= minChars
    : pdfFile !== null && extractedText.length >= minChars;

  // Handle PDF file selection
  const handlePdfFileSelect = async (file) => {
    setPdfFile(file);
    setExtractedText('');
    setError(null);

    if (!file) return;

    setIsExtracting(true);
    try {
      const result = await extractPdf(file);
      setExtractedText(result.text);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to extract text from PDF. Please try again.');
      setPdfFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle character search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setCharacters([]);

    try {
      const result = await searchCharacters(searchQuery);
      setCharacters(result.characters || []);
    } catch (err) {
      setSearchError('Failed to search characters. Please try again.');
      setCharacters([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle character selection for training
  const handleCharacterSelect = async (character) => {
    setError(null);
    setIsTraining(true);

    try {
      const result = await trainFromCharacter(character.name, character.description, character.source);
      setReportId(result.report_id);
      setShowDialog(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze character. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleTrain = async () => {
    if (!isValid) return;

    setError(null);
    setIsTraining(true);

    try {
      let result;
      if (activeTab === 'text') {
        result = await trainModel(corpus);
      } else {
        result = await trainModelFromPdf(pdfFile);
      }
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-slide-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Train Your Style Model
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Provide text, upload a PDF, or browse famous characters to create your style model
          </p>
        </div>

        {/* Main Card */}
        <div className="card p-6 animate-scale-in">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                activeTab === 'pdf'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab('character')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                activeTab === 'character'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Characters
            </button>
          </div>

          {/* Text Input Section */}
          {activeTab === 'text' ? (
            <div className="mb-6">
              <label htmlFor="corpus" className="block text-sm font-semibold text-gray-700 mb-3">
                Text Corpus
              </label>
              <textarea
                id="corpus"
                value={corpus}
                onChange={(e) => setCorpus(e.target.value)}
                placeholder="Paste dialogue from SpongeBob, Shakespeare quotes, or any text with a distinctive style..."
                className="textarea-field h-48 text-base"
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
          ) : activeTab === 'pdf' ? (
            /* PDF Upload Section */
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                PDF File
              </label>
              <FileUploadZone
                onFileSelect={handlePdfFileSelect}
                accept=".pdf"
                maxSizeMB={10}
                disabled={isTraining || isExtracting}
              />

              {/* Extracting Status */}
              {isExtracting && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-slide-up">
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600 mr-3"
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
                    <span className="text-sm text-blue-800">Extracting text from PDF...</span>
                  </div>
                </div>
              )}

              {/* Extracted Text Preview */}
              {extractedText && (
                <div className="mt-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Extracted Text Preview</span>
                    <div className="flex gap-4 text-sm">
                      <span className={`font-medium ${charCount >= minChars ? 'text-green-600' : 'text-gray-500'}`}>
                        {charCount} characters
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{wordCount} words</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {extractedText.substring(0, 500)}
                      {extractedText.length > 500 && '...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Character Search Section */
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search for a Character
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., SpongeBob, Yoda, Shakespeare..."
                  className="input-field flex-1"
                  disabled={isSearching || isTraining}
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching || isTraining}
                  className="btn-primary px-6"
                >
                  {isSearching ? (
                    <svg
                      className="animate-spin h-5 w-5"
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
                  ) : (
                    'Search'
                  )}
                </button>
              </div>

              {/* Search Results */}
              {hasSearched && !isSearching && (
                <div className="mt-4">
                  {characters.length > 0 ? (
                    <div className="space-y-3">
                      {characters.map((char, index) => (
                        <button
                          key={index}
                          onClick={() => handleCharacterSelect(char)}
                          disabled={isTraining}
                          className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">
                              {CATEGORY_ICONS[char.category] || '🎭'}
                            </span>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{char.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{char.description}</p>
                              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                {char.source}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-600">
                        Sorry, I don't have this character in my database. Please use 'Paste Text' or 'Upload PDF'.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {searchError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{searchError}</p>
                </div>
              )}
            </div>
          )}

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

          {/* Action Button - Only for text and PDF tabs */}
          {activeTab !== 'character' && (
            <button
              onClick={handleTrain}
              disabled={!isValid || isTraining}
              className="btn-primary w-full text-lg py-3"
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
          )}
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
