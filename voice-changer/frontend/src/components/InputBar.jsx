import { useRef, useEffect } from 'react';

const InputBar = ({
  inputValue,
  onInputChange,
  onSend,
  disabled = false,
  showTransformIcon = false,
  onOpenModelSelector,
  isLoading = false,
  modelLabel = 'Off',
  showModelSelector = false,
  models = [],
  pinned = [],
  selectedModel = null,
  onSelectModel,
  onSelectOff,
  onManagePinned,
  onOpenStyleShifter,
  onCloseSelector,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) onSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 sticky bottom-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Top utility row (model menu trigger, emoji-like position) */}
        <div className="flex items-center mb-2 relative">
          <button
            type="button"
            onClick={onOpenModelSelector}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2"
            title="Style Models"
            aria-label="Style Models"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.607 2.275.07 2.573-1.066z" />
            </svg>
            <span>{modelLabel || 'Off'}</span>
          </button>

          {showModelSelector && (
            <>
              {/* click-away overlay */}
              <div className="fixed inset-0 z-40" onClick={onCloseSelector} />
              <div className="absolute z-50 bottom-full mb-2 left-0 w-72">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-2">
                  {/* Title */}
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-600 to-primary-400 rounded-md flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-white"
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
                    <div className="text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                      StyleShifter
                    </div>
                  </div>
                  <div className="my-1 h-px bg-gray-200" />
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50" onClick={onSelectOff}>
                    <span className="text-base font-medium text-gray-800">Off</span>
                    {!selectedModel && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="my-2 h-px bg-gray-200" />
                  <div className="px-3 py-1 text-sm font-semibold text-gray-500">Style Models</div>
                  <div className="py-1">
                    {(pinned.length > 0 ? pinned.filter((n) => models.includes(n)) : models).slice(0, 3).map((name) => (
                      <button key={name} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50" onClick={() => onSelectModel && onSelectModel(name)}>
                        <span className="text-base text-gray-800">{name}</span>
                        {selectedModel === name && (
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="my-2 h-px bg-gray-200" />
                  <div className="px-1 py-1 space-y-1">
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700" onClick={onManagePinned}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m8-6h2M2 12H4m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414M19.071 19.071l-1.414-1.414M6.343 6.343 4.93 4.93" />
                      </svg>
                      <span className="font-medium">Manage Style Models</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700" onClick={onOpenStyleShifter}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">Open StyleShifter</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* removed duplicate model button in main row */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full max-h-32 min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !inputValue.trim()}
            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-12 h-12 flex items-center justify-center"
            aria-label={showTransformIcon ? 'Transform then Send' : 'Send'}
            title={showTransformIcon ? 'Transform then Send' : 'Send'}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : showTransformIcon ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.94 2.94a.75.75 0 01.82-.17l13.5 5.63a.75.75 0 010 1.38l-13.5 5.63a.75.75 0 01-1.03-.88L4.4 10 2.23 3.99a.75.75 0 01.71-1.05z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
