import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Horta do Porto',
  description: 'Sistema de gestão rural simples e prático',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#0f5c2e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Horta do Porto" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-[#f8f4ea] via-[#f6f1e5] to-[#efe7d5] text-slate-800 antialiased">
        <NavBar />
        <main className="min-h-screen pt-16">
          <div className="mx-auto max-w-5xl px-4 py-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}