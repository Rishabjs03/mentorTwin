import { Message } from '@/lib/type'

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex max-w-[92%] flex-col sm:max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-emerald-600 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        {message.content}
      </div>

      {/* Source attribution chips — only on assistant messages */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {message.sources.map(source => (
            <span
              key={source}
              className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
            >
              {source}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
