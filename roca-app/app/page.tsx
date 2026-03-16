'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

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

type DashboardResumo = {
  receita: number
  despesa: number
  lucro: number
  ovos: number
}

function getMonthRange(date = new Date()) {
  const ano = date.getFullYear()
  const mes = date.getMonth() // 0-11

  const inicio = new Date(ano, mes, 1)
  const fim = new Date(ano, mes + 1, 1)

  const pad = (n: number) => String(n).padStart(2, '0')

  // formato 'YYYY-MM-DD' para comparar com coluna date
  const inicioStr = `${inicio.getFullYear()}-${pad(inicio.getMonth() + 1)}-01`
  const fimStr = `${fim.getFullYear()}-${pad(fim.getMonth() + 1)}-01`

  // label tipo "Março 2026"
  const labelMes = inicio.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  return { inicioStr, fimStr, labelMes }
}

export default function DashboardPage() {
  const [{ inicioStr, fimStr, labelMes }] = useState(() => getMonthRange())
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [loadingResumo, setLoadingResumo] = useState(true)

  useEffect(() => {
    async function carregarResumo() {
      try {
        // 1) vendas -> sales.total
        const { data: vendas, error: errVendas } = await supabase
          .from('sales')
          .select('total, date')
          .gte('date', inicioStr)
          .lt('date', fimStr)

        if (errVendas) {
          console.error('Erro ao carregar vendas:', errVendas)
        }

        const receita =
          (vendas ?? []).reduce(
            (acc, v) => acc + Number((v as any).total ?? 0),
            0
          ) || 0

        // 2) despesas -> expenses.amount
        const { data: despesas, error: errDespesas } = await supabase
          .from('expenses')
          .select('amount, date')
          .gte('date', inicioStr)
          .lt('date', fimStr)

        if (errDespesas) {
          console.error('Erro ao carregar despesas:', errDespesas)
        }

        const despesa =
          (despesas ?? []).reduce(
            (acc, d) => acc + Number((d as any).amount ?? 0),
            0
          ) || 0

        // 3) ovos -> egg_records.quantity
        const { data: ovosData, error: errOvos } = await supabase
          .from('egg_records')
          .select('quantity, date')
          .gte('date', inicioStr)
          .lt('date', fimStr)

        if (errOvos) {
          console.error('Erro ao carregar ovos:', errOvos)
        }

        const ovos =
          (ovosData ?? []).reduce(
            (acc, o) => acc + Number((o as any).quantity ?? 0),
            0
          ) || 0

        setResumo({
          receita,
          despesa,
          lucro: receita - despesa,
          ovos,
        })
      } catch (e) {
        console.error('Erro geral ao carregar resumo do dashboard:', e)
      } finally {
        setLoadingResumo(false)
      }
    }

    carregarResumo()
  }, [inicioStr, fimStr])

  const receitaText =
    resumo && !loadingResumo
      ? `R$ ${resumo.receita.toFixed(2)}`
      : loadingResumo
      ? 'Carregando...'
      : 'R$ 0,00'

  const despesaText =
    resumo && !loadingResumo
      ? `R$ ${resumo.despesa.toFixed(2)}`
      : loadingResumo
      ? 'Carregando...'
      : 'R$ 0,00'

  const lucroText =
    resumo && !loadingResumo
      ? `R$ ${resumo.lucro.toFixed(2)}`
      : loadingResumo
      ? 'Carregando...'
      : 'R$ 0,00'

  const ovosText =
    resumo && !loadingResumo
      ? `${resumo.ovos} ovos`
      : loadingResumo
      ? 'Carregando...'
      : '0 ovos'

  return (
    <div className="min-h-screen bg-[#f4f1eb]">
      {/* CABEÇALHO */}
      <section className="bg-gradient-to-br from-emerald-900 to-emerald-700 px-6 pb-10 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
          Painel da Horta
        </p>
        <p className="mt-1 text-sm font-medium capitalize text-emerald-100/70">
          {labelMes}
        </p>
      </section>

      <div className="mx-auto max-w-lg px-4 pb-4">
        {/* ATALHOS */}
        <section className="-mt-5">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {atalhos.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 shadow-md transition-all active:scale-95 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                  {item.icon}
                </div>
                <span className="text-[11px] font-semibold text-emerald-900 text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CARD DE RELATÓRIOS */}
        <section className="mt-6">
          <Link
            href="/relatorios"
            className="block rounded-3xl bg-emerald-900 px-5 py-5 shadow-xl transition-all active:scale-[0.98] hover:bg-emerald-800"
          >
            {/* Cabeçalho do card (ícone + título + mês) */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Bolinha com ícone de gráfico */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700/60 text-xl">
                  📊
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                    Relatórios
                  </span>
                  <span className="text-base font-bold capitalize text-white">
                    {labelMes}
                  </span>
                </div>
              </div>

              {/* Setinha discreta à direita */}
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700/50 text-emerald-300">
                <span className="text-lg">›</span>
              </div>
              <span className="text-xl text-emerald-400 sm:hidden">›</span>
            </div>

            {/* Grid de métricas */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-800/60 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                  Receita
                </span>
                <p className="mt-1 text-xl font-bold leading-tight text-emerald-300">
                  {receitaText}
                </p>
              </div>

              <div className="rounded-2xl bg-rose-900/40 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-300">
                  Despesa
                </span>
                <p className="mt-1 text-xl font-bold leading-tight text-rose-300">
                  {despesaText}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-800/60 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                  Lucro
                </span>
                <p
                  className={`mt-1 text-xl font-bold leading-tight ${
                    resumo && resumo.lucro < 0
                      ? 'text-rose-300'
                      : 'text-emerald-300'
                  }`}
                >
                  {lucroText}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-900/30 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                  Ovos
                </span>
                <p className="mt-1 text-xl font-bold leading-tight text-amber-300">
                  {ovosText}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-emerald-400/70">
              Toque para ver o relatório completo com detalhes de todas as
              atividades.
            </p>
          </Link>
        </section>
      </div>
    </div>
  )
}