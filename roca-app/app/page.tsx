'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Atalho = {
  href?: string
  label: string
  icon: string
}

// atalhos da grade (9 ícones)
const atalhos: Atalho[] = [
  { href: '/galinhas', label: 'Galinhas', icon: '🐔' },
  { href: '/vacas', label: 'Vacas', icon: '🐄' },
  { href: '/tilapia', label: 'Tilápia', icon: '🐟' },
  { href: '/horta', label: 'Horta', icon: '🥬' },
  { href: '/vendas', label: 'Vendas', icon: '🛒' },
  { href: '/despesas', label: 'Despesas', icon: '💸' },
  { href: '/dia-de-feira', label: 'Dia de Feira', icon: '🛍️' },
  { label: 'Identificador', icon: '📷' }, // ainda sem link
  { label: 'Investimentos', icon: '💼' }, // ainda sem link
]

// itens do menu suspenso (pode ter mais que 9)
const menuItems: Atalho[] = [
  { href: '/galinhas', label: 'Galinhas', icon: '🐔' },
  { href: '/vacas', label: 'Vacas', icon: '🐄' },
  { href: '/tilapia', label: 'Tilápia', icon: '🐟' },
  { href: '/horta', label: 'Horta', icon: '🥬' },
  { href: '/vendas', label: 'Vendas', icon: '🛒' },
  { href: '/despesas', label: 'Despesas', icon: '💸' },
  { href: '/relatorios', label: 'Relatórios', icon: '📊' },
  { href: '/dia-de-feira', label: 'Dia de Feira', icon: '🛍️' },
  { label: 'Identificador', icon: '📷' },
  { label: 'Investimentos', icon: '💼' },
]

type DashboardResumo = {
  receita: number
  despesa: number
  lucro: number
  ovos: number
}

type PeriodOption = 'today' | 'last7' | 'last30' | 'custom'

function formatHeaderDate() {
  // label tipo "segunda-feira, 16 de março de 2026"
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// retorna { inicioStr, fimStr } em formato YYYY-MM-DD (fim exclusivo)
function getRangeFromPeriod(
  period: PeriodOption,
  customStart?: string | null,
  customEnd?: string | null
) {
  const pad = (n: number) => String(n).padStart(2, '0')

  const today = new Date()
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  ) // amanhã 00:00

  let start: Date

  if (period === 'today') {
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  } else if (period === 'last7') {
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
  } else if (period === 'last30') {
    start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 30
    )
  } else {
    // custom
    if (customStart && customEnd) {
      const s = new Date(customStart)
      const e = new Date(customEnd)
      const startCustom = new Date(s.getFullYear(), s.getMonth(), s.getDate())
      const endCustom = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1)
      return {
        inicioStr: `${startCustom.getFullYear()}-${pad(
          startCustom.getMonth() + 1
        )}-${pad(startCustom.getDate())}`,
        fimStr: `${endCustom.getFullYear()}-${pad(
          endCustom.getMonth() + 1
        )}-${pad(endCustom.getDate())}`,
      }
    } else {
      // fallback: últimos 30 dias
      start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 30
      )
    }
  }

  const inicioStr = `${start.getFullYear()}-${pad(
    start.getMonth() + 1
  )}-${pad(start.getDate())}`
  const fimStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
    end.getDate()
  )}`

  return { inicioStr, fimStr }
}

function formatPeriodLabel(
  period: PeriodOption,
  customStart?: string | null,
  customEnd?: string | null
) {
  if (period === 'today') return 'Hoje'
  if (period === 'last7') return 'Últimos 7 dias'
  if (period === 'last30') return 'Últimos 30 dias'

  if (period === 'custom' && customStart && customEnd) {
    const toBR = (d: string) => {
      const [y, m, day] = d.split('-')
      return `${day}/${m}/${y}`
    }
    return `Personalizado: ${toBR(customStart)} – ${toBR(customEnd)}`
  }

  return 'Período'
}

export default function DashboardPage() {
  // data exibida no topo (Painel da Horta)
  const [labelMes, setLabelMes] = useState<string>(formatHeaderDate)

  // estado do período dos relatórios
  const [period, setPeriod] = useState<PeriodOption>('last30')
  const [customStart, setCustomStart] = useState<string | null>(null)
  const [customEnd, setCustomEnd] = useState<string | null>(null)

  // range efetivo usado nas consultas
  const [{ inicioStr, fimStr }, setRange] = useState(() =>
    getRangeFromPeriod('last30')
  )

  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [loadingResumo, setLoadingResumo] = useState(true)

  // dropdown e popup de período
  const [showPeriodOptions, setShowPeriodOptions] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [tempCustomStart, setTempCustomStart] = useState('')
  const [tempCustomEnd, setTempCustomEnd] = useState('')

  // menu suspenso do topo
  const [menuAberto, setMenuAberto] = useState(false)

  // Atualiza header date quando volta a ficar visível
  useEffect(() => {
    function updateLabelDate() {
      setLabelMes(formatHeaderDate())
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        updateLabelDate()
      }
    }

    updateLabelDate()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Atualiza range quando período muda
  useEffect(() => {
    const range = getRangeFromPeriod(period, customStart, customEnd)
    setRange(range)
  }, [period, customStart, customEnd])

  // Carrega resumo quando o range muda
  useEffect(() => {
    async function carregarResumo() {
      setLoadingResumo(true)
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

  // por enquanto, números do plantel fixos (vamos ligar no banco depois)
  const galinhasCount = 0
  const vacasCount = 0
  const tilapiasCount = 0

  const periodLabel = formatPeriodLabel(period, customStart, customEnd)

  function handleChoosePeriod(option: PeriodOption) {
    setShowPeriodOptions(false)
    if (option === 'custom') {
      // abre modal com datas atuais ou vazias
      setTempCustomStart(customStart ?? '')
      setTempCustomEnd(customEnd ?? '')
      setShowCustomModal(true)
    } else {
      setPeriod(option)
    }
  }

  function applyCustomDates() {
    if (!tempCustomStart || !tempCustomEnd) {
      return
    }
    setCustomStart(tempCustomStart)
    setCustomEnd(tempCustomEnd)
    setPeriod('custom')
    setShowCustomModal(false)
  }

  return (
    <div className="bg-[#f4f1eb] min-h-screen">
      {/* TOPO / LOGO / MENU SUSPENSO */}
      <header className="flex items-center justify-between bg-[#f4f1eb] px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {/* se tiver logo, coloca aqui */}
          {/* <img src="/horta-logo.png" ... /> */}
          <span className="text-sm font-extrabold uppercase tracking-[0.25em] text-emerald-900">
            Roça App
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuAberto((prev) => !prev)}
            className="flex items-center gap-1 rounded-full bg-emerald-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 shadow-md active:scale-95"
          >
            Menu
            <span className="text-[10px]">▾</span>
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-emerald-900/30 bg-emerald-950/95 py-1 shadow-xl z-30">
              {menuItems.map((item) =>
                item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-50 hover:bg-emerald-800/70 active:bg-emerald-700/70"
                    onClick={() => setMenuAberto(false)}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-200/70 italic"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </header>

      {/* CABEÇALHO */}
      <section className="bg-gradient-to-br from-emerald-900 to-emerald-700 px-6 pb-10 pt-6">
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
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            {atalhos.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-3 shadow-md transition-all active:scale-95 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xl">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-900 text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-3 shadow-md opacity-90"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xl">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-900 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* CARD DE RELATÓRIOS FINANCEIROS / OVOS */}
        <section className="mt-6">
          <div className="relative">
            <Link
              href="/relatorios"
              className="block rounded-3xl bg-emerald-900 px-5 py-5 shadow-xl transition-all active:scale-[0.98] hover:bg-emerald-800"
            >
              {/* Cabeçalho do card (ícone + título + período) */}
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

                    {/* PERÍODO SELETOR */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowPeriodOptions((prev) => !prev)
                      }}
                      className="inline-flex items-center gap-1 text-left text-sm font-bold capitalize text-white"
                    >
                      <span>{periodLabel}</span>
                      <span className="text-emerald-300 text-xs">▾</span>
                    </button>
                  </div>
                </div>

                {/* Setinha à direita (continua apontando que é link para /relatorios) */}
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

            {/* DROPDOWN DE PERÍODO */}
            {showPeriodOptions && (
              <div className="absolute left-5 right-5 top-[4.1rem] z-20 rounded-2xl border border-emerald-700/40 bg-emerald-950/95 py-2 shadow-xl">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 hover:bg-emerald-800/60"
                  onClick={() => handleChoosePeriod('today')}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 hover:bg-emerald-800/60"
                  onClick={() => handleChoosePeriod('last7')}
                >
                  Últimos 7 dias
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 hover:bg-emerald-800/60"
                  onClick={() => handleChoosePeriod('last30')}
                >
                  Últimos 30 dias
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 hover:bg-emerald-800/60"
                  onClick={() => handleChoosePeriod('custom')}
                >
                  Data personalizada
                </button>
              </div>
            )}
          </div>
        </section>

        {/* MODAL DE DATA PERSONALIZADA */}
        {showCustomModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl">
              <h3 className="text-sm font-semibold text-slate-800">
                Escolher período personalizado
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Início
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={tempCustomStart}
                    onChange={(e) => setTempCustomStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Fim
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={tempCustomEnd}
                    onChange={(e) => setTempCustomEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="text-sm font-medium text-slate-500"
                  onClick={() => setShowCustomModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  onClick={applyCustomDates}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CARD DE PLANTEL DE ANIMAIS */}
        <section className="mt-4">
          <div className="block rounded-3xl bg-emerald-800 px-5 py-5 shadow-xl">
            {/* Cabeçalho do card */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700/80 text-lg">
                🐾
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Plantel de animais
                </span>
                <span className="text-xs text-emerald-100/90">
                  Visão rápida do total de animais na propriedade
                </span>
              </div>
            </div>

            {/* Grid com os tipos de animais */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-900/70 px-3 py-3 text-center">
                <div className="mb-1 text-2xl">🐔</div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  Galinhas
                </span>
                <p className="mt-1 text-xl font-bold leading-tight text-emerald-50">
                  {galinhasCount}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-900/70 px-3 py-3 text-center">
                <div className="mb-1 text-2xl">🐄</div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  Vacas
                </span>
                <p className="mt-1 text-xl font-bold leading-tight text-emerald-50">
                  {vacasCount}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-900/70 px-3 py-3 text-center">
                <div className="mb-1 text-2xl">🐟</div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  Tilápias
                </span>
                <p className="mt-1 text-xl font-bold leading-tight text-emerald-50">
                  {tilapiasCount}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-emerald-100/80">
              Em breve, estes números serão atualizados automaticamente a partir
              dos registros de galinhas, vacas e tanques de tilápia.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}