import { useEffect, useState } from 'react';

const PinnedModelsManager = ({ isOpen, onClose, models = [], pinned = [], onSave }) => {
  const [selected, setSelected] = useState(pinned || []);

  useEffect(() => {
    setSelected(pinned || []);
  }, [pinned, isOpen]);

  if (!isOpen) return null;

  const toggle = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => n !== name));
    } else {
      if (selected.length >= 3) return; // max 3
      setSelected([...selected, name]);
    }
  };

  const handleSave = () => {
    onSave(selected);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Pinned Models</h2>
              <p className="text-sm text-gray-600">Choose up to 3 models for quick access.</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100" onClick={onClose} aria-label="Close">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
            {models.length === 0 ? (
              <div className="p-3 text-sm text-gray-600 bg-gray-50 rounded-lg border">No models yet.</div>
            ) : (
              models.map((m) => {
                const active = selected.includes(m.name);
                return (
                  <button
                    key={m.name}
                    onClick={() => toggle(m.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 border-2 rounded-lg text-left ${active ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="font-medium text-gray-900">{m.name}</span>
                    {active && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={selected.length > 3}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinnedModelsManager;

