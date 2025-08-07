// app/layout.tsx
import './globals.css' // ← TailwindのCSSを読み込む
import { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
