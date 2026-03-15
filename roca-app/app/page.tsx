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
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-200 bg-white/80 p-5 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-green-900">
          🏡 Resumo
        </h1>
        <p className="mt-1 text-base capitalize text-amber-800">{monthLabel}</p>
        <p className="mt-2 text-sm text-gray-500">
          Veja aqui um resumo rápido da produção e das finanças do mês.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-green-200 bg-white p-10 text-center text-green-800 shadow-sm">
          Carregando informações...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 text-4xl">🐔</div>
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Ovos no mês
            </div>
            <div className="mt-2 text-4xl font-extrabold text-amber-700">
              {data.totalEggs}
            </div>
            <div className="mt-1 text-sm text-gray-400">unidades</div>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 text-4xl">🐄</div>
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Leite no mês
            </div>
            <div className="mt-2 text-4xl font-extrabold text-blue-700">
              {data.totalMilk.toFixed(1)}
            </div>
            <div className="mt-1 text-sm text-gray-400">litros</div>
          </div>

          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 text-4xl">🛒</div>
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Entrou no mês
            </div>
            <div className="mt-2 text-4xl font-extrabold text-green-700">
              {formatMoney(data.totalRevenue)}
            </div>
            <div className="mt-1 text-sm text-gray-400">receita total</div>
          </div>

          <div className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 text-4xl">💸</div>
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Saiu no mês
            </div>
            <div className="mt-2 text-4xl font-extrabold text-red-700">
              {formatMoney(data.totalExpenses)}
            </div>
            <div className="mt-1 text-sm text-gray-400">despesas totais</div>
          </div>

          <div
            className={`rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 xl:col-span-2 ${
              resultado >= 0 ? 'border-green-300' : 'border-red-300'
            }`}
          >
            <div className="mb-3 text-4xl">📊</div>
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Saldo do mês
            </div>
            <div
              className={`mt-2 text-4xl font-extrabold ${
                resultado >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {formatMoney(resultado)}
            </div>
            <div className="mt-1 text-sm text-gray-400">
              {resultado >= 0 ? 'sobrou dinheiro' : 'gastou mais do que entrou'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}