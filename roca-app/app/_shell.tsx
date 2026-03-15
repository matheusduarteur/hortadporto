'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-slate-900 flex flex-col">
      {/* TOPO (MOBILE + DESKTOP) */}
      <Header />

      {/* CONTEÚDO */}
      <main className="flex-1 px-4 pb-16 pt-3 md:px-8 md:pb-20">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* MENU INFERIOR (MOBILE FIRST, MAS FUNCIONA NO DESKTOP TAMBÉM) */}
      <BottomNav />
    </div>
  )
}

/* =========================
   TOPO
   ========================= */

function Header() {
  return (
    <header className="w-full border-b border-emerald-900/10 bg-[#f7f3ea]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          {/* LOGO REDONDINHA */}
          <div className="h-10 w-10 rounded-full overflow-hidden border border-emerald-700/30 bg-[#fdf9ec] flex items-center justify-center">
            {/* Se quiser pode usar <Image /> de next/image, mas vamos simples */}
            <img
              src="/horta-logo.png"
              alt="Horta d’Porto"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.08em] text-emerald-900 uppercase">
              Horta d’Porto
            </span>
            <span className="text-[11px] tracking-[0.18em] text-emerald-700 uppercase">
              Gestão da Roça
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

/* =========================
   MENU INFERIOR (MOBILE)
   ========================= */

function BottomNav() {
  const pathname = usePathname()

  // TODOS os ícones que você comentou: galinha, vaca, tilápia, horta, etc.
  const items = [
    { href: '/', label: 'Resumo', icon: '🏡' },
    { href: '/galinhas', label: 'Galinhas', icon: '🐔' },
    { href: '/vacas', label: 'Vacas', icon: '🐄' },
    { href: '/tilapia', label: 'Tilápia', icon: '🐟' },
    { href: '/horta', label: 'Horta', icon: '🥬' },
    { href: '/vendas', label: 'Vendas', icon: '🛒' },
    { href: '/despesas', label: 'Despesas', icon: '💸' },
    { href: '/relatorios', label: 'Relatórios', icon: '📊' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-emerald-900/15 bg-[#1b4332] text-[#fefae0] z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-2 py-1.5 md:px-8">
        <div className="flex w-full items-center justify-between gap-1 overflow-x-auto">
          {items.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center flex-1 min-w-[56px]"
              >
                <span
                  className={`text-xl ${
                    active ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] ${
                    active ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}