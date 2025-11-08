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
} from '../api/client';

const MIN_TEXT_CHARS = 50;

const StyleShifterModal = ({ isOpen, onClose, onModelsUpdated }) => {
  const [activeTab, setActiveTab] = useState('new');
  const [models, setModels] = useState([]);

  // New model workflow
  const [section, setSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [characterError, setCharacterError] = useState(null);
  const [trainTab, setTrainTab] = useState('text');
  const [corpus, setCorpus] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
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
    setCharacters([]);
    try {
      const result = await searchCharacters(searchQuery.trim());
      setCharacters(result.characters || []);
    } catch {
      setCharacterError('Failed to search characters. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCharacter = async (char) => {
    setIsTraining(true);
    setModalError(null);
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
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setModalError(null);
    try {
      const response = trainTab === 'text' ? await trainModel(corpus) : await trainModelFromPdf(pdfFile);
      setReportId(response.report_id);
      const preview = await getTrainingExamples(response.report_id);
      setPreviewExamples(preview.examples || []);
      setPreviewDefaultName('');
      setPreviewOpen(true);
    } catch {
      setModalError('Failed to train model.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleSaveModel = async (name) => {
    try {
      await saveModel(reportId, name);
      setPreviewOpen(false);
      await loadModels();
      setSection('home');
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

  const renderNewTab = () => (
    <div className="space-y-4">
      {section === 'home' && (
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setSection('browse')} className="px-4 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100">
              Browse Characters
            </button>
            <button onClick={() => setSection('train')} className="px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
              Train New Model
            </button>
          </div>
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{modalError}</div>
          )}
        </div>
      )}

      {section === 'browse' && (
        <div className="card p-4 space-y-4">
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchCharacters()}
            />
            <button onClick={handleSearchCharacters} className="btn-primary">
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            <button onClick={() => setSection('home')} className="btn-secondary">Back</button>
          </div>
          {characterError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{characterError}</div>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {characters.length === 0 && !isSearching ? (
              <div className="p-3 text-sm text-gray-600 bg-gray-50 border rounded-lg">No results. Try another query.</div>
            ) : (
              characters.map((c, idx) => (
                <div key={idx} className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-600">{c.description}</div>
                      <div className="mt-1 inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{c.source}</div>
                    </div>
                    <button onClick={() => handleSelectCharacter(c)} className="btn-primary" disabled={isTraining}>
                      {isTraining ? 'Generating...' : 'Generate Model'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {section === 'train' && (
        <div className="card p-4 space-y-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
            <button onClick={() => setTrainTab('text')} className={`px-4 py-2 rounded-md text-sm font-medium ${trainTab === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              Text
            </button>
            <button onClick={() => setTrainTab('pdf')} className={`px-4 py-2 rounded-md text-sm font-medium ${trainTab === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              PDF
            </button>
          </div>
          {trainTab === 'text' ? (
            <textarea className="textarea-field h-40" placeholder="Paste training text..." value={corpus} onChange={(e) => setCorpus(e.target.value)} />
          ) : (
            <FileUploadZone onFileSelect={setPdfFile} accept=".pdf" maxSizeMB={10} />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleTrain}
              className="btn-primary"
              disabled={isTraining || (trainTab === 'text' ? corpus.trim().length < MIN_TEXT_CHARS : !pdfFile)}
            >
              {isTraining ? 'Training…' : 'Train'}
            </button>
            <button onClick={() => setSection('home')} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTestTab = () => (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Model</label>
          <select className="input-field" value={testModel} onChange={(e) => setTestModel(e.target.value)}>
            {models.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
          <button onClick={() => setTestActive('text')} className={`px-4 py-2 rounded-md text-sm font-medium ${testActive === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Text
          </button>
          <button onClick={() => setTestActive('pdf')} className={`px-4 py-2 rounded-md text-sm font-medium ${testActive === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            PDF
          </button>
        </div>
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
        <button
          onClick={handleTestTransform}
          className="btn-primary"
          disabled={testLoading || !testModel || (testActive === 'text' ? !testInput.trim() : !testPdfFile)}
        >
          {testLoading ? 'Transforming…' : 'Transform'}
        </button>
      </div>
      <div className="space-y-3">
        <div className="text-sm font-semibold text-gray-700">Output</div>
        <div className="h-64 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg overflow-y-auto">
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
            className="btn-secondary"
          >
            Copy to Clipboard
          </button>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
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
                Transform Test
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
              title={section === 'browse' ? 'Character Model Preview' : 'Training Preview'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleShifterModal;
