'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '@/lib/type'
import { MessageBubble } from './MessageBubble'

const SUGGESTIONS = [
  'How do I negotiate a salary offer?',
  'I want to switch careers, where do I start?',
  'How do I prepare for a PM interview?',
]

export function TwinChat({ mentorId, mentorName }: { mentorId: string; mentorName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm ${mentorName}'s AI Twin trained on their mentorship sessions. Ask me anything, I'll answer based on what they've actually shared with mentees.`,
      sources: [],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text?: string) {
    const message = text?.trim() || input.trim()
    if (!message || loading) return

    setMessages(prev => [...prev, { role: 'user', content: message }])
    setInput('')
    setLoading(true)

    const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId, message, conversationHistory: history }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response has no readable body')
      }

      const decoder = new TextDecoder()
      let assistantMessage: Message = { role: 'assistant', content: '', sources: [] }

      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunkText = decoder.decode(value, { stream: true })
        const lines = chunkText.split('\n').filter(Boolean)

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const payloadString = line.slice(6)
          if (payloadString === '[DONE]') continue

          const payload = JSON.parse(payloadString)

          if (payload.type === 'sources') {
            assistantMessage = { ...assistantMessage, sources: payload.sources }
          } else if (payload.type === 'text') {
            assistantMessage = { ...assistantMessage, content: assistantMessage.content + payload.text }
          }

          setMessages(prev => [...prev.slice(0, -1), assistantMessage])
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          sources: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[11px] font-medium">
          {mentorName.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{mentorName} · AI Twin</p>
          <p className="text-[11px] text-gray-400">Responds based on verified session knowledge</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3.5">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {loading && (
          <div className="self-start flex gap-1 items-center bg-gray-100 px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {messages.length === 1 && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-xs text-gray-400">Try asking:</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-2">
        <textarea
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder={`Ask ${mentorName} anything...`}
          rows={1}
          className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-400 max-h-24 leading-relaxed"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}