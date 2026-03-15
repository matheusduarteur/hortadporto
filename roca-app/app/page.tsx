'use client'

import Link from 'next/link'

type Atalho = {
  href: string
  label: string
  icon: string
  bg: string
}

const atalhos: Atalho[] = [
  { href: '/galinhas', label: 'Galinhas', icon: '🐔', bg: 'bg-emerald-100' },
  { href: '/vacas', label: 'Vacas', icon: '🐄', bg: 'bg-emerald-100' },
  { href: '/tilapia', label: 'Tilápia', icon: '🐟', bg: 'bg-emerald-100' },
  { href: '/horta', label: 'Horta', icon: '🥬', bg: 'bg-emerald-100' },
  { href: '/vendas', label: 'Vendas', icon: '🛒', bg: 'bg-emerald-100' },
  { href: '/despesas', label: 'Despesas', icon: '💸', bg: 'bg-emerald-100' },
  {
    href: '/relatorios',
    label: 'Relatórios',
    icon: '📊',
    bg: 'bg-emerald-100',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* TÍTULO DA TELA (opcional) */}
      <h1 className="text-xs font-semibold tracking-[0.25em] text-emerald-900 uppercase text-center">
        Painel da Horta
      </h1>

      {/* GRADE DE ATALHOS */}
      <section className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {atalhos.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${item.bg} text-2xl shadow-sm`}
            >
              {item.icon}
            </div>
            <span className="text-[11px] font-medium text-emerald-900 text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}