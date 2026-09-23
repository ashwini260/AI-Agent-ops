import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquareText, Info } from 'lucide-react'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { sendChatQuery } from '../services/chatService.js'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const question = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await sendChatQuery(question)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          citations: data.citations || [],
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message}`,
          citations: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    'What is the printed total for invoice INV-100001?',
    'Show me all invoices with total mismatches',
    'Which hospital has the most invoices?',
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Ask Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask questions about indexed invoice documents with cited evidence
        </p>
      </div>

      <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 sm:mx-6 lg:mx-8">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          Search covers every successfully indexed PDF from both the bulk folder
          and UI uploads. Answers include citation cards linking to the source
          document and page.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquareText className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">
              Ask a question about your indexed invoices to get started.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q)
                  }}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <LoadingSpinner size="sm" label="Searching indexed documents..." />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your invoices..."
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
