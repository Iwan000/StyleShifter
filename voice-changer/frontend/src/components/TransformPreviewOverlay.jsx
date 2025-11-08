const TransformPreviewOverlay = ({ originalText, transformedText, modelName, onApply, onCancel }) => {
  if (!transformedText) return null;

  return (
    <div className="w-full bg-blue-50/90 border-t border-b border-blue-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-semibold text-blue-700">Transformed with {modelName}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs font-medium text-gray-500 mb-1">Original</div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{originalText}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-medium text-blue-700 mb-1">Transformed</div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{transformedText}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="btn-secondary">Cancel</button>
            <button onClick={onApply} className="btn-primary">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformPreviewOverlay;

