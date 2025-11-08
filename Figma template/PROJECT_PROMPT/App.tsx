import { useState } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { MessageArea } from './components/MessageArea';
import { InputArea } from './components/InputArea';
import { PDFUpload } from './components/PDFUpload';
import { TrainingSuccess } from './components/TrainingSuccess';
import { TransformationPreview } from './components/TransformationPreview';
import { PinnedModelsManager } from './components/PinnedModelsManager';
import { ModelManagement } from './components/ModelManagement';
import { BrowseCharacters } from './components/BrowseCharacters';
import { CharacterModelSuccess } from './components/CharacterModelSuccess';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  modelName?: string;
}

export interface Model {
  id: string;
  name: string;
  lastUsed?: Date;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  source: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you doing today?',
      isUser: true,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: 'Greetings, dear friend! I trust this day finds you in excellent spirits!',
      isUser: false,
      timestamp: new Date(Date.now() - 3500000),
      modelName: 'Formal English',
    },
  ]);

  const [models, setModels] = useState<Model[]>([
    { id: '1', name: 'Formal English', lastUsed: new Date() },
    { id: '2', name: 'Casual Slang', lastUsed: new Date(Date.now() - 86400000) },
    { id: '3', name: 'Poetic Style', lastUsed: new Date(Date.now() - 172800000) },
  ]);

  const [pinnedModelIds, setPinnedModelIds] = useState<string[]>(['1', '2', '3']);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [showTrainingSuccess, setShowTrainingSuccess] = useState(false);
  const [showPinnedManager, setShowPinnedManager] = useState(false);
  const [pinnedManagerReturnToChat, setPinnedManagerReturnToChat] = useState(false);
  const [showModelManagement, setShowModelManagement] = useState(false);
  const [showBrowseCharacters, setShowBrowseCharacters] = useState(false);
  const [showCharacterSuccess, setShowCharacterSuccess] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [transformationPreview, setTransformationPreview] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('');

  const getSelectedModelName = () => {
    if (!selectedModel) return 'None (Original Text)';
    return models.find(m => m.id === selectedModel)?.name || 'None (Original Text)';
  };

  const transformText = (text: string, modelId: string | null): string => {
    if (!modelId) return text;
    
    const model = models.find(m => m.id === modelId);
    if (!model) return text;

    // Mock transformations based on model
    if (model.name === 'Formal English') {
      return text
        .replace(/hey/gi, 'Greetings')
        .replace(/how are you/gi, 'I trust this day finds you well')
        .replace(/!/g, '.');
    } else if (model.name === 'Casual Slang') {
      return text
        .replace(/hello/gi, 'yo')
        .replace(/how are you/gi, 'what\'s up')
        .replace(/\./g, '!');
    } else if (model.name === 'Poetic Style') {
      return `Like whispers of the wind, I say: ${text}`;
    }
    
    return text;
  };

  const handleInputChange = (text: string) => {
    setCurrentInput(text);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    if (selectedModel && selectedModel !== 'none') {
      // Show preview
      const transformed = transformText(text, selectedModel);
      setTransformationPreview(transformed);
      setPendingMessage(text);
    } else {
      // Send directly
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setCurrentInput('');
      
      // Simulate response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Message received!',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleApplyTransformation = () => {
    if (!transformationPreview) return;

    const modelName = models.find(m => m.id === selectedModel)?.name;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: transformationPreview,
      isUser: true,
      timestamp: new Date(),
      modelName,
    };
    
    setMessages([...messages, newMessage]);
    setTransformationPreview(null);
    setPendingMessage('');
    setCurrentInput('');

    // Update model last used
    if (selectedModel) {
      setModels(models.map(m => 
        m.id === selectedModel ? { ...m, lastUsed: new Date() } : m
      ));
    }

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'That sounds great!',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleCancelTransformation = () => {
    // Keep the original text in the input when canceling
    setCurrentInput(pendingMessage);
    setTransformationPreview(null);
    setPendingMessage('');
  };

  const handleSelectModel = (modelId: string | null) => {
    setSelectedModel(modelId);
  };

  const handleTrainNewModel = () => {
    setShowModelManagement(true);
  };

  const handleTrainingComplete = () => {
    setShowPDFUpload(false);
    setShowTrainingSuccess(true);
  };

  const handleSaveModel = (modelName: string) => {
    const newModel: Model = {
      id: Date.now().toString(),
      name: modelName,
      lastUsed: new Date(),
    };
    setModels([newModel, ...models]);
    setSelectedModel(newModel.id);
    setShowTrainingSuccess(false);
    
    // Auto-pin the new model if there's space
    if (pinnedModelIds.length < 3) {
      setPinnedModelIds([...pinnedModelIds, newModel.id]);
      // Return to model management
      setShowModelManagement(true);
    } else {
      // Show pinned models manager to let user choose
      setShowPinnedManager(true);
    }
  };

  const handleTrainAnother = () => {
    setShowTrainingSuccess(false);
    setShowPDFUpload(true);
  };

  const handleClosePinnedManager = () => {
    setShowPinnedManager(false);
    // Return to model management only if not opened from chat
    if (!pinnedManagerReturnToChat) {
      setShowModelManagement(true);
    }
    setPinnedManagerReturnToChat(false);
  };

  const handleSavePinnedModels = (newPinnedIds: string[]) => {
    setPinnedModelIds(newPinnedIds);
  };

  const handleDeleteModel = (modelId: string) => {
    // Remove model from models list
    setModels(models.filter(m => m.id !== modelId));
    
    // Remove from pinned if it was pinned
    setPinnedModelIds(pinnedModelIds.filter(id => id !== modelId));
    
    // Deselect if it was selected
    if (selectedModel === modelId) {
      setSelectedModel(null);
    }
  };

  const handleTrainNewFromManagement = () => {
    setShowModelManagement(false);
    setShowPDFUpload(true);
  };

  const handleBrowseCharacters = () => {
    setShowModelManagement(false);
    setShowBrowseCharacters(true);
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setShowBrowseCharacters(false);
    setShowCharacterSuccess(true);
  };

  const handleSaveCharacterModel = (modelName: string) => {
    const newModel: Model = {
      id: Date.now().toString(),
      name: modelName,
      lastUsed: new Date(),
    };
    setModels([newModel, ...models]);
    setSelectedModel(newModel.id);
    setShowCharacterSuccess(false);
    setSelectedCharacter(null);
    
    // Auto-pin the new model if there's space
    if (pinnedModelIds.length < 3) {
      setPinnedModelIds([...pinnedModelIds, newModel.id]);
      // Return to model management
      setShowModelManagement(true);
    } else {
      // Show pinned models manager to let user choose
      setShowPinnedManager(true);
    }
  };

  const handleBrowseAnotherCharacter = () => {
    setShowCharacterSuccess(false);
    setSelectedCharacter(null);
    setShowBrowseCharacters(true);
  };

  if (showPDFUpload) {
    return (
      <PDFUpload
        onClose={() => {
          setShowPDFUpload(false);
          setShowModelManagement(true);
        }}
        onTrainingComplete={handleTrainingComplete}
      />
    );
  }

  if (showTrainingSuccess) {
    return (
      <TrainingSuccess
        onSave={handleSaveModel}
        onTrainAnother={handleTrainAnother}
      />
    );
  }

  if (showPinnedManager) {
    return (
      <PinnedModelsManager
        models={models}
        pinnedModelIds={pinnedModelIds}
        onClose={handleClosePinnedManager}
        onSave={handleSavePinnedModels}
      />
    );
  }

  if (showBrowseCharacters) {
    return (
      <BrowseCharacters
        onClose={() => {
          setShowBrowseCharacters(false);
          setShowModelManagement(true);
        }}
        onSelectCharacter={handleSelectCharacter}
      />
    );
  }

  if (showCharacterSuccess && selectedCharacter) {
    return (
      <CharacterModelSuccess
        character={selectedCharacter}
        onSave={handleSaveCharacterModel}
        onBrowseAnother={handleBrowseAnotherCharacter}
      />
    );
  }

  if (showModelManagement) {
    return (
      <ModelManagement
        onClose={() => setShowModelManagement(false)}
        models={models}
        onTrainNew={handleTrainNewFromManagement}
        onBrowseCharacters={handleBrowseCharacters}
        onDeleteModel={handleDeleteModel}
        transformText={transformText}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
      
      <MessageArea messages={messages} />

      {transformationPreview && (
        <TransformationPreview
          originalText={pendingMessage}
          transformedText={transformationPreview}
          modelName={getSelectedModelName()}
          onApply={handleApplyTransformation}
          onCancel={handleCancelTransformation}
        />
      )}

      <InputArea
        selectedModelName={getSelectedModelName()}
        onSendMessage={handleSendMessage}
        onInputChange={handleInputChange}
        inputValue={currentInput}
        disabled={!!transformationPreview}
        models={models}
        pinnedModelIds={pinnedModelIds}
        selectedModelId={selectedModel}
        onSelectModel={handleSelectModel}
        onTrainNewModel={handleTrainNewModel}
        onManagePinned={() => {
          setPinnedManagerReturnToChat(true);
          setShowPinnedManager(true);
        }}
      />
    </div>
  );
}
