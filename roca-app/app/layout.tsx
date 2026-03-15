'use client'

import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Horta d’Porto | Roça App',
  description: 'Gestão simples e bonita da Horta d’Porto',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#f7f3ea] text-slate-900">
        <div className="flex min-h-screen">
          {/* MENU LATERAL (DESKTOP) */}
          <Sidebar />

          {/* CONTEÚDO PRINCIPAL */}
          <div className="flex-1 flex flex-col">
            {/* TOPO + MENU INFERIOR (MOBILE) */}
            <MobileShell />

            {/* ÁREA DAS PÁGINAS */}
            <main className="flex-1 p-4 md:p-8">
              <div className="max-w-6xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}

/* =========================
   MENU LATERAL (DESKTOP)
   ========================= */

function Sidebar() {
  const pathname = usePathname()

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
    <aside
      className="
        hidden md:flex
        flex-col
        bg-[#1b4332]
        text-[#fefae0]
        transition-[width]
        duration-300
        w-[72px]
        hover:w-56
        group
        shadow-[8px_0_24px_rgba(0,0,0,0.25)]
      "
    >
      {/* LOGO / TÍTULO */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl">
          🥕
        </div>
        <div className="flex flex-col overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-sm font-semibold leading-tight">
            Horta d’Porto
          </span>
          <span className="text-[11px] text-[#d8f3dc]/80 leading-tight">
            Roça App
          </span>
        </div>
      </div>

      {/* LINKS DO MENU */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
        {items.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-2xl px-3 py-2.5
                text-sm font-medium
                transition
                ${
                  active
                    ? 'bg-emerald-500 text-emerald-50 shadow-lg shadow-emerald-900/30'
                    : 'text-[#d8f3dc]/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="px-3 py-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] text-[#d8f3dc]/70">
        Feito na roça digital 🌱
      </div>
    </aside>
  )
}

/* =========================
   TOPO + MENU INFERIOR (MOBILE)
   ========================= */

function MobileShell() {
  const pathname = usePathname()

  const items = [
    { href: '/', label: 'Resumo', icon: '🏡' },
    { href: '/galinhas', label: 'Galinhas', icon: '🐔' },
    { href: '/vendas', label: 'Vendas', icon: '🛒' },
    { href: '/relatorios', label: 'Relatórios', icon: '📊' },
  ]

  return (
    <>
      {/* TOPO MOBILE */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1b4332] text-[#fefae0] shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥕</span>
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              Horta d’Porto
            </h1>
            <p className="text-[11px] text-[#d8f3dc]/80 leading-tight">
              Gestão da roça
            </p>
          </div>
        </div>
      </header>

      {/* MENU INFERIOR (BOTTOM NAV) MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-emerald-900/20 bg-[#1b4332] text-[#fefae0] z-50">
        <div className="flex justify-around py-1.5">
          {items.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 text-[11px]"
              >
                <span
                  className={`text-xl ${
                    active ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`${
                    active ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ESPAÇO PRA NÃO COBRIR O CONTEÚDO */}
      <div className="md:hidden h-12" />
    </>
  )
}