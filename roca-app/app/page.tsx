'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { start, end }
}

interface DashboardData {
  totalEggs: number
  totalMilk: number
  totalRevenue: number
  totalExpenses: number
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalEggs: 0,
    totalMilk: 0,
    totalRevenue: 0,
    totalExpenses: 0,
  })
  const [loading, setLoading] = useState(true)
  const [monthLabel, setMonthLabel] = useState('')

  useEffect(() => {
    setMonthLabel(
      new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    )

    async function fetchData() {
      const { start, end } = getMonthRange()

      const [eggs, milk, sales, expenses] = await Promise.all([
        supabase.from('egg_records').select('quantity').gte('date', start).lte('date', end),
        supabase.from('milk_records').select('liters').gte('date', start).lte('date', end),
        supabase.from('sales').select('total').gte('date', start).lte('date', end),
        supabase.from('expenses').select('amount').gte('date', start).lte('date', end),
      ])

      if (eggs.error) console.error(eggs.error)
      if (milk.error) console.error(milk.error)
      if (sales.error) console.error(sales.error)
      if (expenses.error) console.error(expenses.error)

      setData({
        totalEggs: eggs.data?.reduce((s, r) => s + (r.quantity || 0), 0) || 0,
        totalMilk: milk.data?.reduce((s, r) => s + Number(r.liters || 0), 0) || 0,
        totalRevenue: sales.data?.reduce((s, r) => s + Number(r.total || 0), 0) || 0,
        totalExpenses: expenses.data?.reduce((s, r) => s + Number(r.amount || 0), 0) || 0,
      })

      setLoading(false)
    }

    fetchData()
  }, [])

  const resultado = data.totalRevenue - data.totalExpenses

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white via-emerald-50 to-amber-50 px-5 py-5 shadow-[0_12px_35px_rgba(0,0,0,0.08)]">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">
          🏡 Resumo
        </h1>
        <p className="mt-1 text-lg font-medium capitalize text-amber-700">{monthLabel}</p>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-white/60 bg-white/90 px-5 py-10 text-center text-emerald-900 shadow-[0_12px_35px_rgba(0,0,0,0.08)]">
          Carregando...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[28px] border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-5 shadow-[0_10px_30px_rgba(245,158,11,0.12)]">
            <div className="mb-3 text-4xl">🐔</div>
            <div className="text-[15px] font-semibold text-slate-500">Ovos (mês)</div>
            <div className="mt-2 text-3xl font-extrabold text-amber-700">{data.totalEggs}</div>
            <div className="mt-1 text-sm text-slate-400">unidades</div>
          </div>

          <div className="rounded-[28px] border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-5 shadow-[0_10px_30px_rgba(14,165,233,0.12)]">
            <div className="mb-3 text-4xl">🐄</div>
            <div className="text-[15px] font-semibold text-slate-500">Leite (mês)</div>
            <div className="mt-2 text-3xl font-extrabold text-sky-700">
              {data.totalMilk.toFixed(1)}
            </div>
            <div className="mt-1 text-sm text-slate-400">litros</div>
          </div>

          <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-[0_10px_30px_rgba(16,185,129,0.12)]">
            <div className="mb-3 text-4xl">🛒</div>
            <div className="text-[15px] font-semibold text-slate-500">Receita (mês)</div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-700">
              {formatMoney(data.totalRevenue)}
            </div>
          </div>

          <div className="rounded-[28px] border border-rose-200 bg-gradient-to-br from-white to-rose-50 p-5 shadow-[0_10px_30px_rgba(244,63,94,0.12)]">
            <div className="mb-3 text-4xl">💸</div>
            <div className="text-[15px] font-semibold text-slate-500">Despesas (mês)</div>
            <div className="mt-2 text-3xl font-extrabold text-rose-700">
              {formatMoney(data.totalExpenses)}
            </div>
          </div>

          <div
            className={`col-span-2 rounded-[30px] border p-5 shadow-[0_12px_35px_rgba(0,0,0,0.08)] ${
              resultado >= 0
                ? 'border-emerald-300 bg-gradient-to-br from-white to-emerald-50'
                : 'border-rose-300 bg-gradient-to-br from-white to-rose-50'
            }`}
          >
            <div className="mb-3 text-4xl">📊</div>
            <div className="text-[15px] font-semibold text-slate-500">Resultado (mês)</div>
            <div
              className={`mt-2 text-4xl font-extrabold ${
                resultado >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatMoney(resultado)}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {resultado >= 0 ? 'lucro' : 'prejuízo'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}