'use client'

import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-slate-900 flex flex-col">
      {/* TOPO */}
      <Header />

      {/* CONTEÚDO */}
      <main className="flex-1 px-4 pb-6 pt-3 md:px-8 md:pb-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      {/* Não tem mais menu inferior */}
    </div>
  )
}

/* =========================
   TOPO CENTRALIZADO
   ========================= */

function Header() {
  return (
    <header className="w-full border-b border-emerald-900/10 bg-[#fdf9ec]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div className="flex flex-col items-center justify-center gap-2">
          {/* LOGO MAIOR, CENTRALIZADA */}
          <div className="h-16 w-16 rounded-full overflow-hidden border border-emerald-700/30 bg-[#fdf9ec] flex items-center justify-center">
            <img
              src="/horta-logo.png"
              alt="Horta d’Porto"
              className="h-14 w-14 object-contain"
            />
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-base font-semibold tracking-[0.12em] text-emerald-900 uppercase">
              Horta d’Porto
            </span>
            <span className="text-[11px] tracking-[0.24em] text-emerald-700 uppercase">
              Gestão da Roça
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}