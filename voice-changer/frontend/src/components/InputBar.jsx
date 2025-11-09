import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const [showManage, setShowManage] = useState(false);
  const [hoverPinnedIdx, setHoverPinnedIdx] = useState(-1);
  const manageCloseTimer = useRef(null);

  const cancelManageClose = () => {
    if (manageCloseTimer.current) {
      clearTimeout(manageCloseTimer.current);
      manageCloseTimer.current = null;
    }
  };

  const scheduleManageClose = (delay = 150) => {
    cancelManageClose();
    manageCloseTimer.current = setTimeout(() => {
      setShowManage(false);
      manageCloseTimer.current = null;
    }, delay);
  };

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
                <div
                  className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-2 max-h-[60vh] overflow-auto"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const name = e.dataTransfer.getData('text/model');
                    if (!name) return;
                    // drop on container: add to pinned (if room)
                    if (!pinned.includes(name)) {
                      const next = [...pinned, name].slice(0, 3);
                      onManagePinned && onManagePinned(next);
                    }
                  }}
                >
                  {/* Title */}
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex items-center gap-2">
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
                    <button
                      onClick={() => navigate('/train')}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
                      title="Open full page"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                  <div className="my-1 h-px bg-gray-200" />
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50" onClick={onSelectOff}>
                    <span className="text-base font-medium text-red-600">Off</span>
                    {!selectedModel && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="my-2 h-px bg-gray-200" />
                  <div className="px-3 py-1 text-sm font-semibold text-gray-500">Style Models</div>
                  <div className="py-1">
                    {(pinned.length > 0 ? pinned.filter((n) => models.includes(n)) : models).slice(0, 3).map((name, idx) => (
                      <button
                        key={name}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${hoverPinnedIdx === idx ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                        onClick={() => onSelectModel && onSelectModel(name)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (hoverPinnedIdx !== idx) setHoverPinnedIdx(idx);
                        }}
                        onDragEnter={() => setHoverPinnedIdx(idx)}
                        onDragLeave={(e) => {
                          // only clear if truly leaving the item
                          if (!e.currentTarget.contains(e.relatedTarget)) setHoverPinnedIdx(-1);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // Prevent container handler from firing
                          const incoming = e.dataTransfer.getData('text/model');
                          if (!incoming) return;

                          const next = [...pinned];
                          const oldIndex = next.indexOf(incoming);

                          if (oldIndex === -1) {
                            // Not pinned - replace at this position
                            next[idx] = incoming;
                          } else if (oldIndex !== idx) {
                            // Already pinned at different position - swap
                            [next[oldIndex], next[idx]] = [next[idx], next[oldIndex]];
                          }
                          // If oldIndex === idx, do nothing (dropped on itself)

                          onManagePinned && onManagePinned(next.slice(0, 3));
                          setHoverPinnedIdx(-1);
                        }}
                      >
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
                    <div
                      className="relative"
                      onMouseEnter={() => {
                        cancelManageClose();
                        setShowManage(true);
                      }}
                      onMouseLeave={() => {
                        scheduleManageClose();
                      }}
                    >
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700"
                        onClick={() => {
                          cancelManageClose();
                          setShowManage(true);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m8-6h2M2 12H4m13.657-6.343l1.414-1.414M4.929 19.071l1.414-1.414M19.071 19.071l-1.414-1.414M6.343 6.343 4.93 4.93" />
                        </svg>
                        <span className="font-medium">Manage Style Models</span>
                      </button>
                    </div>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700" onClick={onOpenStyleShifter}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">Open StyleShifter</span>
                    </button>
                  </div>
            </div>
          </div>
              {/* External manage panel aligned and sized like main popover */}
              {showManage && (
                <div
                  className="absolute z-50 bottom-full mb-2 left-0 w-72"
                  style={{ left: '19rem' }}
                  onMouseEnter={() => {
                    cancelManageClose();
                    setShowManage(true);
                  }}
                  onMouseLeave={() => {
                    scheduleManageClose();
                  }}
                >
                  <div
                    className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 max-h-[60vh] overflow-auto"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const name = e.dataTransfer.getData('text/model');
                      if (!name) return;
                      if (pinned.includes(name)) {
                        const next = pinned.filter((p) => p !== name);
                        onManagePinned && onManagePinned(next);
                      }
                    }}
                  >
                    <div className="text-sm font-semibold text-gray-700 mb-2">Manage Style Models</div>
                    <div className="text-xs text-gray-500 mb-1">All Models</div>
                    <div className="space-y-1">
                      {models.map((name) => (
                        <div
                          key={name}
                          className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 cursor-grab"
                          draggable
                          onDragStart={(e) => {
                            // Prevent drag if clicking on delete button
                            if (e.target.closest('button[data-delete-button]')) {
                              e.preventDefault();
                              return;
                            }
                            e.dataTransfer.setData('text/model', name);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pinned.includes(name)}
                              onChange={(e) => {
                                let next = pinned.slice();
                                if (e.target.checked) {
                                  if (!next.includes(name)) next = [...next, name].slice(0, 3);
                                } else {
                                  next = next.filter((p) => p !== name);
                                }
                                onManagePinned && onManagePinned(next);
                              }}
                            />
                            <span className="text-sm text-gray-800">{name}</span>
                          </div>
                          <button
                            data-delete-button="true"
                            className="p-1.5 rounded hover:bg-red-50 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onDeleteModel && onDeleteModel(name);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            draggable={false}
                            title="Delete model"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
