import { useEffect, useState } from 'react';
import ChatHeader from '../components/ChatHeader';
import MessageArea from '../components/MessageArea';
import InputBar from '../components/InputBar';
import { getModels, transformText } from '../api/client';
import PinnedModelsManager from '../components/PinnedModelsManager';
import TransformPreviewOverlay from '../components/TransformPreviewOverlay';
import StyleShifterModal from '../components/StyleShifterModal';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 'm1', text: 'Hey! How are you doing today?', isUser: true, timestamp: new Date().toISOString() },
  ]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null); // model name or null for None
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPinnedManager, setShowPinnedManager] = useState(false);
  const [pinned, setPinned] = useState([]);
  const [previewText, setPreviewText] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const [showStyleShifter, setShowStyleShifter] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getModels();
        setModels(data || []);
      } catch (e) {
        // ignore
      }
    };
    load();
    const p = localStorage.getItem('pinnedModels');
    if (p) {
      try {
        const arr = JSON.parse(p);
        if (Array.isArray(arr)) setPinned(arr);
      } catch {}
    }
  }, []);

  const simulateReply = () => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: 'r' + Date.now(), text: 'Message received!', isUser: false, timestamp: new Date().toISOString() },
      ]);
    }, 800);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setIsSending(true);

    try {
      const useTransform = !!selectedModel;
      if (useTransform) {
        // Generate preview first; do not send yet
        const result = await transformText(selectedModel, text);
        setPreviewText(result.transformed_text || '');
        setPendingMessage(text);
        // keep input unchanged for cancel path
      } else {
        // Send directly
        setMessages((prev) => [
          ...prev,
          {
            id: 'u' + Date.now(),
            text,
            isUser: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        setInputValue('');
        simulateReply();
      }
    } catch (e) {
      // optionally show toast
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyPreview = () => {
    if (!previewText) return;
    setMessages((prev) => [
      ...prev,
      {
        id: 'u' + Date.now(),
        text: previewText,
        isUser: true,
        timestamp: new Date().toISOString(),
        modelName: selectedModel || undefined,
      },
    ]);
    setPreviewText('');
    setPendingMessage('');
    setInputValue('');
    simulateReply();
  };

  const handleCancelPreview = () => {
    // Restore original input and close preview
    setInputValue(pendingMessage);
    setPreviewText('');
    setPendingMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <ChatHeader />
      <MessageArea messages={messages} />

      {/* Transformation preview overlay */}
      {previewText && (
        <TransformPreviewOverlay
          originalText={pendingMessage}
          transformedText={previewText}
          modelName={selectedModel || 'Model'}
          onApply={handleApplyPreview}
          onCancel={handleCancelPreview}
        />
      )}

      {/* anchored popover handled inside InputBar */}

      <InputBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        disabled={isSending || !!previewText}
        showTransformIcon={!!selectedModel}
        onOpenModelSelector={() => setShowModelSelector((v) => !v)}
        isLoading={isSending}
        modelLabel={selectedModel || 'Off'}
        showModelSelector={showModelSelector}
        models={models.map((m) => m.name)}
        pinned={pinned}
        selectedModel={selectedModel}
        onSelectModel={(name) => { setSelectedModel(name); setShowModelSelector(false); }}
        onSelectOff={() => { setSelectedModel(null); setShowModelSelector(false); }}
        onManagePinned={() => { setShowPinnedManager(true); setShowModelSelector(false); }}
        onOpenStyleShifter={() => { setShowStyleShifter(true); setShowModelSelector(false); }}
        onCloseSelector={() => setShowModelSelector(false)}
      />

      <PinnedModelsManager
        isOpen={showPinnedManager}
        onClose={() => setShowPinnedManager(false)}
        models={models}
        pinned={pinned}
        onSave={(arr) => {
          setPinned(arr);
          localStorage.setItem('pinnedModels', JSON.stringify(arr));
          setShowPinnedManager(false);
        }}
      />

      <StyleShifterModal
        isOpen={showStyleShifter}
        onClose={() => setShowStyleShifter(false)}
        onModelsUpdated={(updated) => setModels(updated)}
      />
    </div>
  );
};

export default ChatPage;
