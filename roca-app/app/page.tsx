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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">🏡 Dashboard</h1>
        <p className="text-amber-800 mt-1 capitalize">{monthLabel}</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-green-800">Carregando...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-xl border-2 border-amber-300 bg-white p-5 shadow-sm">
            <div className="text-3xl mb-2">🐔</div>
            <div className="text-sm text-gray-500 font-medium">Ovos (mês)</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">{data.totalEggs}</div>
            <div className="text-xs text-gray-400">unidades</div>
          </div>

          <div className="rounded-xl border-2 border-blue-300 bg-white p-5 shadow-sm">
            <div className="text-3xl mb-2">🐄</div>
            <div className="text-sm text-gray-500 font-medium">Leite (mês)</div>
            <div className="text-2xl font-bold text-blue-800 mt-1">{data.totalMilk.toFixed(1)}</div>
            <div className="text-xs text-gray-400">litros</div>
          </div>

          <div className="rounded-xl border-2 border-green-300 bg-white p-5 shadow-sm">
            <div className="text-3xl mb-2">🛒</div>
            <div className="text-sm text-gray-500 font-medium">Receita (mês)</div>
            <div className="text-2xl font-bold text-green-800 mt-1">
              R$ {data.totalRevenue.toFixed(2)}
            </div>
          </div>

          <div className="rounded-xl border-2 border-red-300 bg-white p-5 shadow-sm">
            <div className="text-3xl mb-2">💸</div>
            <div className="text-sm text-gray-500 font-medium">Despesas (mês)</div>
            <div className="text-2xl font-bold text-red-800 mt-1">
              R$ {data.totalExpenses.toFixed(2)}
            </div>
          </div>

          <div
            className={`rounded-xl border-2 bg-white p-5 shadow-sm col-span-2 md:col-span-1 ${
              resultado >= 0 ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm text-gray-500 font-medium">Resultado (mês)</div>
            <div
              className={`text-2xl font-bold mt-1 ${
                resultado >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              R$ {resultado.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">{resultado >= 0 ? 'lucro' : 'prejuízo'}</div>
          </div>
        </div>
      )}
    </div>
  )
}
