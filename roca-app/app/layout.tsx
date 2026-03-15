import type { Metadata } from 'next'
import './globals.css'
import type { ReactNode } from 'react'
import { AppShell } from './_shell'

export const metadata: Metadata = {
  title: 'Horta d’Porto | Roça App',
  description: 'Gestão simples e bonita da Horta d’Porto',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#f7f3ea] text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}