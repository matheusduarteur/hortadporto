'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { start, end }
}

type CategoryTotal = { category: string; total: number }

export default function RelatoriosPage() {
  const [receita, setReceita] = useState(0)
  const [despesas, setDespesas] = useState(0)
  const [categorias, setCategorias] = useState<CategoryTotal[]>([])
  const [loading, setLoading] = useState(true)
  const [monthLabel, setMonthLabel] = useState('')

  useEffect(() => {
    setMonthLabel(
      new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    )

    async function fetchData() {
      const { start, end } = getMonthRange()

      const [sales, expenses] = await Promise.all([
        supabase.from('sales').select('total').gte('date', start).lte('date', end),
        supabase.from('expenses').select('amount, category').gte('date', start).lte('date', end),
      ])

      if (sales.error) console.error(sales.error)
      if (expenses.error) console.error(expenses.error)

      const totalReceita = sales.data?.reduce((s, r) => s + Number(r.total || 0), 0) || 0
      const totalDespesas = expenses.data?.reduce((s, r) => s + Number(r.amount || 0), 0) || 0

      setReceita(totalReceita)
      setDespesas(totalDespesas)

      // Group by category
      const catMap: Record<string, number> = {}
      expenses.data?.forEach((r) => {
        const cat = r.category || 'Sem categoria'
        catMap[cat] = (catMap[cat] || 0) + Number(r.amount || 0)
      })
      const sorted = Object.entries(catMap)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
      setCategorias(sorted)

      setLoading(false)
    }

    fetchData()
  }, [])

  const resultado = receita - despesas

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">📊 Relatórios</h1>
        <p className="text-amber-800 mt-1 capitalize">{monthLabel}</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-green-800">Carregando...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border-2 border-green-300 p-6 shadow-sm">
              <div className="text-3xl mb-3">🛒</div>
              <div className="text-sm text-gray-500 font-medium mb-1">Receita Total</div>
              <div className="text-3xl font-bold text-green-700">R$ {receita.toFixed(2)}</div>
            </div>

            <div className="bg-white rounded-xl border-2 border-red-300 p-6 shadow-sm">
              <div className="text-3xl mb-3">💸</div>
              <div className="text-sm text-gray-500 font-medium mb-1">Despesas Totais</div>
              <div className="text-3xl font-bold text-red-700">R$ {despesas.toFixed(2)}</div>
            </div>

            <div className={`bg-white rounded-xl border-2 p-6 shadow-sm ${resultado >= 0 ? 'border-green-500' : 'border-red-500'}`}>
              <div className="text-3xl mb-3">📊</div>
              <div className="text-sm text-gray-500 font-medium mb-1">
                Resultado — {resultado >= 0 ? 'Lucro' : 'Prejuízo'}
              </div>
              <div className={`text-3xl font-bold ${resultado >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                R$ {resultado.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Expenses by category */}
          {categorias.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-green-800">Despesas por Categoria</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {categorias.map((c) => (
                  <div key={c.category} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💸</span>
                      <span className="font-medium text-gray-700">{c.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-red-400 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (c.total / despesas) * 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-red-700 min-w-[90px] text-right">
                        R$ {c.total.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 w-10 text-right">
                        {despesas > 0 ? `${((c.total / despesas) * 100).toFixed(0)}%` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-red-50 flex justify-between items-center border-t border-red-100">
                <span className="font-semibold text-red-800">Total</span>
                <span className="font-bold text-red-800">R$ {despesas.toFixed(2)}</span>
              </div>
            </div>
          )}

          {categorias.length === 0 && despesas === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              Nenhuma despesa registrada neste mês.
            </div>
          )}
        </>
      )}
    </div>
  )
}
