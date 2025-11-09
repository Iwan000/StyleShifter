import { useEffect, useState } from 'react';
import FileUploadZone from './FileUploadZone';
import TrainingPreview from './TrainingPreview';
import {
  getModels,
  searchCharacters,
  getCharacterPreview,
  trainModel,
  trainModelFromPdf,
  getTrainingExamples,
  saveModel,
  transformText,
  transformPdf,
  extractPdf,
} from '../api/client';

// Category icons mapping (same as TrainPage)
const CATEGORY_ICONS = {
  'tv': '📺',
  'movie': '🎬',
  'literature': '📚',
  'historical': '👤',
  'game': '🎮',
  'anime': '🎌',
  'cartoon': '🎨',
};

const MIN_TEXT_CHARS = 50;

const StyleShifterModal = ({ isOpen, onClose, onModelsUpdated }) => {
  const [activeTab, setActiveTab] = useState('new');
  const [models, setModels] = useState([]);

  // New model workflow - changed to match TrainPage
  const [newModelTab, setNewModelTab] = useState('text'); // 'text', 'pdf', or 'character'
  const [searchQuery, setSearchQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [characterError, setCharacterError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [trainingCharacter, setTrainingCharacter] = useState(null);
  const [corpus, setCorpus] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewExamples, setPreviewExamples] = useState([]);
  const [previewDefaultName, setPreviewDefaultName] = useState('');

  // Transform test
  const [testActive, setTestActive] = useState('text');
  const [testModel, setTestModel] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testPdfFile, setTestPdfFile] = useState(null);
  const [testOutputFormat, setTestOutputFormat] = useState('text');
  const [testOutput, setTestOutput] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadModels();
  }, [isOpen]);

  const loadModels = async () => {
    try {
      const data = await getModels();
      setModels(data || []);
      if ((!testModel || !data?.some((m) => m.name === testModel)) && data && data.length > 0) {
        setTestModel(data[0].name);
      }
      onModelsUpdated && onModelsUpdated(data || []);
    } catch {
      // ignore for now
    }
  };

  const handleSearchCharacters = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setCharacterError(null);
    setHasSearched(true);
    setCharacters([]);
    try {
      const result = await searchCharacters(searchQuery.trim());
      setCharacters(result.characters || []);
    } catch {
      setCharacterError('Failed to search characters. Please try again.');
      setCharacters([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCharacter = async (char) => {
    setModalError(null);
    setIsTraining(true);
    setTrainingCharacter(char.name);
    try {
      const preview = await getCharacterPreview(char.name, char.description, char.source);
      setReportId(preview.report_id);
      setPreviewExamples(preview.examples || []);
      setPreviewDefaultName(char.name || '');
      setPreviewOpen(true);
    } catch {
      setModalError('Failed to generate character preview.');
    } finally {
      setIsTraining(false);
      setTrainingCharacter(null);
    }
  };

  const handlePdfFileSelect = async (file) => {
    setPdfFile(file);
    setExtractedText('');
    setModalError(null);

    if (!file) return;

    setIsExtractingPdf(true);
    try {
      const result = await extractPdf(file);
      setExtractedText(result.text || '');
    } catch {
      setModalError('Failed to extract text from PDF. Please try again.');
      setPdfFile(null);
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleTrain = async () => {
    if (newModelTab === 'text' && corpus.trim().length < MIN_TEXT_CHARS) return;
    if (newModelTab === 'pdf' && (isExtractingPdf || !pdfFile || extractedText.length < MIN_TEXT_CHARS)) return;

    setIsTraining(true);
    setModalError(null);
    try {
      let response;
      if (newModelTab === 'text') {
        response = await trainModel(corpus);
      } else if (newModelTab === 'pdf') {
        response = await trainModelFromPdf(pdfFile);
      } else {
        return;
      }
      setReportId(response.report_id);
      const preview = await getTrainingExamples(response.report_id);
      setPreviewExamples(preview.examples || []);
      setPreviewDefaultName('');
      setPreviewOpen(true);
    } catch (err) {
      setModalError(err?.response?.data?.detail || 'Failed to train model.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleSaveModel = async (name) => {
    try {
      await saveModel(reportId, name);
      setPreviewOpen(false);
      await loadModels();
      // Reset to text tab after saving
      setNewModelTab('text');
      setCorpus('');
      setPdfFile(null);
      setSearchQuery('');
      setCharacters([]);
      setHasSearched(false);
    } catch {
      setModalError('Failed to save model.');
    }
  };

  const handleTestTransform = async () => {
    if (!testModel) return;
    setTestLoading(true);
    setTestOutput('');
    try {
      if (testActive === 'text') {
        const res = await transformText(testModel, testInput);
        setTestOutput(res.transformed_text || '');
      } else {
        if (!testPdfFile) return;
        if (testOutputFormat === 'pdf') {
          const blob = await transformPdf(testPdfFile, testModel, 'pdf');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `transformed_${testPdfFile.name}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setTestOutput('PDF downloaded successfully!');
        } else {
          const res = await transformPdf(testPdfFile, testModel, 'text');
          setTestOutput(res.transformed_text || '');
        }
      }
    } catch {
      setTestOutput('Failed to transform.');
    } finally {
      setTestLoading(false);
    }
  };

  const renderNewTab = () => {
    // Calculate validation for text/pdf
    const textToAnalyze = newModelTab === 'text' ? corpus : newModelTab === 'pdf' ? extractedText : '';
    const charCount = textToAnalyze.length;
    const wordCount = textToAnalyze.trim().split(/\s+/).filter(Boolean).length;
    const isValid = newModelTab === 'text'
      ? charCount >= MIN_TEXT_CHARS
      : newModelTab === 'pdf'
        ? !!pdfFile && charCount >= MIN_TEXT_CHARS && !isExtractingPdf
        : false;

    return (
      <div className="space-y-4">
        {/* Tab Switcher - matching TrainPage */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setNewModelTab('text')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
              newModelTab === 'text'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setNewModelTab('pdf')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
              newModelTab === 'pdf'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload PDF
          </button>
          <button
            onClick={() => setNewModelTab('character')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
              newModelTab === 'character'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Browse Characters
          </button>
        </div>

        {/* Text Input Section */}
        {newModelTab === 'text' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Text Corpus
              </label>
              <textarea
                value={corpus}
                onChange={(e) => setCorpus(e.target.value)}
                placeholder="Paste dialogue from SpongeBob, Shakespeare quotes, or any text with a distinctive style..."
                className="textarea-field h-48 text-base"
                disabled={isTraining}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span className={`font-medium ${charCount >= MIN_TEXT_CHARS ? 'text-green-600' : 'text-gray-500'}`}>
                    {charCount} characters
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{wordCount} words</span>
                </div>
                {charCount > 0 && charCount < MIN_TEXT_CHARS && (
                  <span className="text-sm text-amber-600">
                    Need {MIN_TEXT_CHARS - charCount} more characters
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleTrain}
              disabled={!isValid || isTraining}
              className="btn-primary w-full"
            >
              {isTraining ? 'Analyzing style patterns...' : 'Analyze Style'}
            </button>
          </>
        )}

        {/* PDF Upload Section */}
        {newModelTab === 'pdf' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PDF File
              </label>
              <FileUploadZone
                onFileSelect={handlePdfFileSelect}
                accept=".pdf"
                maxSizeMB={10}
                disabled={isTraining || isExtractingPdf}
              />
              {isExtractingPdf && (
                <p className="mt-2 text-sm text-gray-600">Extracting text from PDF…</p>
              )}
              {!isExtractingPdf && extractedText && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className={`font-medium ${charCount >= MIN_TEXT_CHARS ? 'text-green-600' : 'text-gray-500'}`}>
                      {charCount} characters
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{wordCount} words</span>
                  </div>
                  {charCount < MIN_TEXT_CHARS && (
                    <span className="text-amber-600">
                      Need {MIN_TEXT_CHARS - charCount} more characters
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleTrain}
              disabled={!isValid || isTraining}
              className="btn-primary w-full"
            >
              {isTraining ? 'Analyzing style patterns...' : 'Analyze Style'}
            </button>
          </>
        )}

        {/* Character Search Section */}
        {newModelTab === 'character' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search for a Character
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchCharacters()}
                  placeholder="e.g., SpongeBob, Yoda, Shakespeare..."
                  className="input-field flex-1"
                  disabled={isSearching || isTraining}
                />
                <button
                  onClick={handleSearchCharacters}
                  disabled={!searchQuery.trim() || isSearching || isTraining}
                  className="btn-primary px-6"
                >
                  {isSearching ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {hasSearched && !isSearching && (
              <div className="mt-2">
                {characters.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {characters.map((char, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectCharacter(char)}
                        disabled={isTraining}
                        className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
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
                          {isTraining && trainingCharacter === char.name && (
                            <svg className="animate-spin h-5 w-5 text-primary-600 mt-1" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 74 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
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

            {characterError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{characterError}</p>
              </div>
            )}
          </>
        )}

        {/* Error Message */}
        {modalError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{modalError}</p>
          </div>
        )}
      </div>
    );
  };

  const renderTestTab = () => (
    <div className="space-y-4">
      {/* Two column layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left column - input controls */}
        <div className="space-y-4">
          {/* Model selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Model</label>
            <select className="input-field" value={testModel} onChange={(e) => setTestModel(e.target.value)}>
              {models.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Text/PDF tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
            <button onClick={() => setTestActive('text')} className={`px-4 py-2 rounded-md text-sm font-medium ${testActive === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              Text
            </button>
            <button onClick={() => setTestActive('pdf')} className={`px-4 py-2 rounded-md text-sm font-medium ${testActive === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              PDF
            </button>
          </div>

          {/* Input area */}
          {testActive === 'text' ? (
            <textarea className="textarea-field h-40" placeholder="Enter text to transform…" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
          ) : (
            <div>
              <FileUploadZone onFileSelect={setTestPdfFile} accept=".pdf" maxSizeMB={10} />
              {testPdfFile && (
                <div className="mt-3">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Output Format</div>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
                    <button onClick={() => setTestOutputFormat('text')} className={`px-4 py-2 rounded-md text-sm font-medium ${testOutputFormat === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                      Text
                    </button>
                    <button onClick={() => setTestOutputFormat('pdf')} className={`px-4 py-2 rounded-md text-sm font-medium ${testOutputFormat === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                      PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - output box */}
        <div className="flex flex-col">
          {/* Output label - aligned with "Select Model" */}
          <div className="text-sm font-semibold text-gray-700 mb-2">Output</div>

          {/* Output box - stretches to match left column height */}
          <div className="flex-1 px-4 py-3 mb-[6px] bg-gray-50 border-2 border-gray-200 rounded-lg overflow-y-auto">
            {testOutput ? (
              <p className="text-gray-900 whitespace-pre-wrap">{testOutput}</p>
            ) : (
              <p className="text-gray-400 italic">Your transformed output will appear here…</p>
            )}
          </div>

          {testOutput && (
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(testOutput);
                } catch {}
              }}
              className="btn-secondary mt-4"
            >
              Copy to Clipboard
            </button>
          )}
        </div>
      </div>

      {/* Transform button - centered at bottom */}
      <div className="flex justify-center">
        <button
          onClick={handleTestTransform}
          className="btn-primary px-12"
          disabled={testLoading || !testModel || (testActive === 'text' ? !testInput.trim() : !testPdfFile)}
        >
          {testLoading ? 'Transforming…' : 'Transform'}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-start justify-center p-4 pt-32">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">StyleShifter</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 pt-3">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
              <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                New Model
              </button>
              <button onClick={() => setActiveTab('test')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'test' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                Transform
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'new' ? renderNewTab() : renderTestTab()}
            <TrainingPreview
              isOpen={previewOpen}
              onClose={() => setPreviewOpen(false)}
              examples={previewExamples}
              defaultName={previewDefaultName}
              onSave={handleSaveModel}
              isSaving={false}
              title={newModelTab === 'character' ? 'Character Model Preview' : 'Training Preview'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleShifterModal;
