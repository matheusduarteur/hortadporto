'use client'

import Link from 'next/link'

type Atalho = {
  href: string
  label: string
  icon: string
}

const atalhos: Atalho[] = [
  { href: '/galinhas', label: 'Galinhas', icon: '🐔' },
  { href: '/vacas', label: 'Vacas', icon: '🐄' },
  { href: '/tilapia', label: 'Tilápia', icon: '🐟' },
  { href: '/horta', label: 'Horta', icon: '🥬' },
  { href: '/vendas', label: 'Vendas', icon: '🛒' },
  { href: '/despesas', label: 'Despesas', icon: '💸' },
]

export default function DashboardPage() {
  const relatorio = {
    mes: 'Março 2026',
    receita: 'R$ 0,00',
    despesa: 'R$ 0,00',
    lucro: 'R$ 0,00',
    ovos: '0 ovos',
  }

  return (
    <div className="flex flex-col gap-8">
      {/* BLOCO DO TÍTULO / INTRODUÇÃO (PAINEL DA HORTA) */}
      <section className="text-center">
        <h1 className="text-xs font-semibold tracking-[0.28em] text-emerald-900 uppercase">
          Painel da Horta
        </h1>
        <p className="mt-2 text-[11px] text-emerald-800/85">
          Acesse rapidamente cada área da roça do seu pai.
        </p>
      </section>

      {/* GRADE DE ÍCONES REDONDINHOS */}
      <section className="grid grid-cols-2 gap-6 px-4 sm:grid-cols-3">
        {atalhos.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2"
          >
            {/* Bolinha verde com emoji dentro */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c9f5d5] text-2xl shadow-sm">
              {item.icon}
            </div>
            <span className="text-[12px] font-medium text-emerald-900 text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </section>

      {/* CARD DE RELATÓRIOS IGUAL À FOTO */}
      <section className="px-4">
        <Link
          href="/relatorios"
          className="block rounded-[24px] border border-emerald-900/10 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        >
          {/* Cabeçalho do card (ícone + título + mês) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Bolinha com ícone de gráfico */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f5d5] text-2xl">
                📊
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

            {/* Setinha discreta à direita (mais desktop) */}
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <span className="text-lg">›</span>
            </div>
          </div>

          {/* Linha com receita, despesa, lucro, ovos */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-emerald-900 sm:grid-cols-4">
            <div className="flex flex-col">
              <span className="uppercase tracking-[0.22em] text-emerald-600 text-[10px]">
                Receita
              </span>
              <span className="mt-1 text-sm font-semibold">
                {relatorio.receita}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="uppercase tracking-[0.22em] text-emerald-600 text-[10px]">
                Despesa
              </span>
              <span className="mt-1 text-sm font-semibold">
                {relatorio.despesa}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="uppercase tracking-[0.22em] text-emerald-600 text-[10px]">
                Lucro
              </span>
              <span className="mt-1 text-sm font-semibold">
                {relatorio.lucro}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="uppercase tracking-[0.22em] text-emerald-600 text-[10px]">
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