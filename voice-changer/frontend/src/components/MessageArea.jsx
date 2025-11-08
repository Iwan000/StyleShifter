const MessageArea = ({ messages }) => {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${m.isUser ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 rounded-bl-sm'}`}>
              {m.modelName && !m.isUser && (
                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{m.modelName}</div>
              )}
              <p className="whitespace-pre-wrap text-sm">{m.text}</p>
              <div className={`text-[10px] mt-1 ${m.isUser ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MessageArea;

