'use client'

import Link from 'next/link'
import {
  Egg,
  LineChart,
  ShoppingBag,
  Sprout,
  Fish,
  Milk,
  PiggyBank,
} from 'lucide-react'

type Atalho = {
  href: string
  label: string
  icon: React.ReactNode
}

const atalhos: Atalho[] = [
  {
    href: '/galinhas',
    label: 'Galinhas',
    icon: <Egg className="h-7 w-7" />,
  },
  {
    href: '/vacas',
    label: 'Vacas',
    icon: <Milk className="h-7 w-7" />,
  },
  {
    href: '/tilapia',
    label: 'Tilápia',
    icon: <Fish className="h-7 w-7" />,
  },
  {
    href: '/horta',
    label: 'Horta',
    icon: <Sprout className="h-7 w-7" />,
  },
  {
    href: '/vendas',
    label: 'Vendas',
    icon: <ShoppingBag className="h-7 w-7" />,
  },
  {
    href: '/despesas',
    label: 'Despesas',
    icon: <PiggyBank className="h-7 w-7" />,
  },
]

export default function DashboardPage() {
  const relatorio = {
    mes: 'Março 2026',
    receita: 'R$ 1.200,00',
    despesa: 'R$ 800,00',
    lucro: 'R$ 400,00',
    ovos: '320 ovos',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-sm font-semibold tracking-[0.25em] text-emerald-900 uppercase">
          Painel da Horta
        </h1>
        <p className="mt-1 text-[11px] text-emerald-800/85">
          Acesse rapidamente cada área da roça do seu pai.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {atalhos.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900 shadow-sm">
              {item.icon}
            </div>
            <span className="text-[12px] font-medium text-emerald-900 text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </section>

      <section>
        <Link
          href="/relatorios"
          className="block rounded-3xl border border-emerald-900/12 bg-white/95 px-4 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-900">
                <LineChart className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-700">
                  Relatórios
                </span>
                <span className="text-sm font-semibold text-emerald-900">
                  {relatorio.mes}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <span className="text-lg">›</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-emerald-900 sm:grid-cols-4">
            <div className="flex flex-col">
              <span className="uppercase tracking-[0.18em] text-emerald-600 text-[10px]">
                Receita
              </span>
              <span className="mt-1 text-sm font-semibold">
                {relatorio.receita}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="uppercase tracking-[0.18em] text-emerald-600 text-[10px]">
                Despesa
              </span>
              <span className="mt-1 text-sm font-semibold">
                {relatorio.despesa}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="uppercase tracking-[0.18em] text-emerald-600 text-[10px]">
                Lucro
              </span>
              <span className="mt-1 text-sm font-semibold">
                {relatorio.lucro}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="uppercase tracking-[0.18em] text-emerald-600 text-[10px]">
                Ovos
              </span>
              <span className="mt-1 text-sm font-semibold">
                {relatorio.ovos}
              </span>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-emerald-700/80">
            Toque para ver o relatório completo com detalhes de todas as
            atividades.
          </p>
        </Link>
      </section>
    </div>
  )
}