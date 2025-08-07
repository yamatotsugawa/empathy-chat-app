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

const characters = [
  {
    id: 'elephant',
    name: 'ゾウ',
    image: 'elephant.png',
    description: '関西弁で背中を押すおっちゃん',
    systemPrompt: `
あなたは関西弁で励ますゾウのおっちゃんです。
悩みに対してユーモアと温かさで背中を押してください。
ツッコミを入れたり、「なんでやねん！」などの言葉もOK。
返答は120文字以内で。
    `,
  },
  {
    id: 'rabbit',
    name: 'うさぎ',
    image: 'rabbit.png',
    description: 'とにかくポジティブな励まし屋',
    systemPrompt: `
あなたはとにかくポジティブなうさぎです。
共感や質問は不要で、とにかく前向きな言葉で返してください。
「大丈夫」「それもいいね」「むしろチャンス」などの言葉を使って、やさしくカジュアルに励ましてください。
返答は120文字以内で。
    `,
  },
  {
    id: 'owl',
    name: 'ふくろう',
    image: 'owl.png',
    description: '深夜に寄り添う哲学者',
    systemPrompt: `
あなたは深夜にそっと寄り添う哲学者フクロウです。
静かな夜に考えごとをするような口調で、相手の悩みに深く意味を見出すような返答をしてください。
落ち着いたトーンで、120文字以内でお願いします。
    `,
  },
  {
    id: 'turtle',
    name: 'かめ',
    image: 'turtle.png',
    description: 'アドラー心理学の達人',
    systemPrompt: `
あなたはアドラー心理学に精通したカメの先生です。
悩みに対して、「課題の分離」や「他者貢献」などの視点から、優しく簡潔に導いてください。
難しい言葉は避け、やわらかく語りかけてください。
返答は120文字以内で。
    `,
  },
]

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState('rabbit')

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages: Message[] = [...messages, { role: 'user' as const, content: input }]
    setMessages(newMessages)
    setInput('')

    const character = characters.find((c) => c.id === selectedCharacter)
    if (!character) return

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: character.systemPrompt.trim() },
        ...newMessages,
      ],
    })

    const reply = response.choices[0].message.content || ''
    setMessages([...newMessages, { role: 'assistant' as const, content: reply }])
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">悩み相談チャット</h1>

        {/* キャラクター選択 */}
        <div className="flex flex-wrap justify-center gap-6">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char.id)}
              className={`flex flex-col items-center justify-start p-4 rounded-xl border w-40 h-60 shadow-sm transition ${
                selectedCharacter === char.id ? 'bg-blue-50 border-blue-500' : 'bg-white'
              }`}
            >
              <img
                src={`/images/${char.image}`}
                alt={char.name}
                className="w-20 h-20 object-contain mb-2"
              />
              <h2 className="font-bold text-lg">{char.name}</h2>
              <p className="text-sm text-gray-600 text-center leading-tight">{char.description}</p>
            </button>
          ))}
        </div>

        {/* チャット欄 */}
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

        {/* 入力欄 */}
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="悩みを入力してください"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onCompositionStart={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              // IME変換中は送信しない
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
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
