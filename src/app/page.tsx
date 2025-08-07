'use client'

import { useState } from 'react'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
content: `
あなたはどんな悩みにもポジティブに変換して励ます役割です。
共感や質問は不要で、とにかく明るく前向きな言葉で返してください。
否定やアドバイスは避けて、ひたすら「大丈夫」「それもいいね」「むしろチャンス」などの言葉で包んでください。
返答は200文字以内。言葉はやさしく、カジュアルに。
`


        },
        ...newMessages
      ]
    })

    const reply = response.choices[0].message.content || ''
    setMessages([...newMessages, { role: 'assistant', content: reply }])
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">悩み相談チャット</h1>
        <div className="h-[400px] overflow-y-auto space-y-4 border rounded-md p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[75%] p-3 rounded-xl text-sm whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-blue-100 self-end ml-auto text-gray-800'
                  : 'bg-green-100 self-start mr-auto text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="悩みを入力してください"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault() // Enterでの送信を無効化
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}
