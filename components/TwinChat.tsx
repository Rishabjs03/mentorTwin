'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Message } from '@/lib/type'
import { MessageBubble } from './MessageBubble'

const SUGGESTIONS = [
  'How can i start with my design career?',
  'How do I negotiate a salary offer?',
  'I want to switch careers, where do I start?',
  'How do I prepare for a PM interview?',
]

export function TwinChat({ mentorId, mentorName }: { mentorId: string; mentorName: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm ${mentorName}'s AI Twin trained on their mentorship sessions. Ask me anything, I'll answer based on what they've actually shared with mentees.`,
      sources: [],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: 'smooth',
    })
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-gray-100 bg-white/95 px-4 py-3.5 backdrop-blur-sm sm:px-5">
        <button
          onClick={() => router.push('/')}
          className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-900"
          aria-label="Go back to home"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[11px] font-medium">
          {mentorName.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{mentorName} · AI Twin</p>
          <p className="text-[11px] text-gray-400">Responds based on verified session knowledge</p>
        </div>
      </div>

      <div
        ref={scrollAreaRef}
        className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4 scroll-smooth overscroll-contain sm:px-5"
      >
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
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <p className="pt-1 text-xs text-gray-400 sm:pt-2">Try asking:</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="rounded-lg bg-emerald-50 px-3 py-2 text-left text-xs text-emerald-700 transition-colors hover:bg-emerald-100 sm:max-w-xs"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 flex items-end gap-2 border-t border-gray-100 bg-white/95 px-3 py-3 backdrop-blur-sm sm:px-4">
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
          className="max-h-24 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm leading-relaxed text-gray-900 outline-none placeholder-gray-400 focus:border-emerald-400"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 transition-colors hover:bg-emerald-700 disabled:bg-gray-200 sm:h-9 sm:w-9"
        >
          <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
