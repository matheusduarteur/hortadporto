'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
      {/* NÃO TEM MAIS MENU INFERIOR */}
    </div>
  )
}

/* =========================
   TOPO
   ========================= */

function Header() {
  const pathname = usePathname()

  // Se quiser, dá pra deixar o título da página mudar por rota.
  const tituloPagina =
    pathname === '/' ? 'Painel da Horta' : pathname.replace('/', '')

  return (
    <header className="w-full border-b border-emerald-900/10 bg-[#fdf9ec]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          {/* LOGO MAIOR */}
          <div className="h-14 w-14 rounded-full overflow-hidden border border-emerald-700/30 bg-[#fdf9ec] flex items-center justify-center">
            <img
              src="/horta-logo.png"
              alt="Horta d’Porto"
              className="h-12 w-12 object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-[0.10em] text-emerald-900 uppercase">
              Horta d’Porto
            </span>
            <span className="text-[11px] tracking-[0.22em] text-emerald-700 uppercase">
              Gestão da Roça
            </span>
          </div>
        </div>

        {/* TÍTULO DA PÁGINA (opcional) */}
        <div className="hidden md:block">
          <span className="text-[11px] tracking-[0.25em] uppercase text-emerald-800/80">
            {tituloPagina}
          </span>
        </div>
      </div>
    </header>
  )
}