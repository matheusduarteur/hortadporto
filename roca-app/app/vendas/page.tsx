'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Sale = {
  id: string
  date: string
  product: string
  quantity: number
  unit: string | null
  unit_price: number
  total: number | null
  customer: string | null
  notes: string | null
}

const emptyForm = { date: '', product: '', quantity: '', unit: '', unit_price: '', customer: '', notes: '' }

export default function VendasPage() {
  const [records, setRecords] = useState<Sale[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    setForm((f) => ({ ...f, date: new Date().toISOString().split('T')[0] }))
    loadRecords()
  }, [])

  async function loadRecords() {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)
    if (error) { console.error(error); return }
    setRecords(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('sales').insert({
      date: form.date,
      product: form.product,
      quantity: Number(form.quantity),
      unit: form.unit || null,
      unit_price: Number(form.unit_price),
      customer: form.customer || null,
      notes: form.notes || null,
    })
    setLoading(false)
    if (error) { console.error(error); setMessage({ text: 'Erro ao salvar.', ok: false }); return }
    setMessage({ text: 'Venda registrada!', ok: true })
    setForm((f) => ({ ...emptyForm, date: f.date }))
    loadRecords()
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta venda?')) return
    const { error } = await supabase.from('sales').delete().eq('id', id)
    if (error) { console.error(error); setMessage({ text: 'Erro ao excluir.', ok: false }); return }
    loadRecords()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-6">🛒 Vendas</h1>

      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-4">Nova Venda</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
            <input type="date" required className="input-field" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
            <input type="text" required className="input-field" value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Ex: Ovos, Leite" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
            <input type="number" required step="0.1" min="0" className="input-field" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
            <input type="text" className="input-field" value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Ex: dz, L, kg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário (R$) *</label>
            <input type="number" required step="0.01" min="0" className="input-field" value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input type="text" className="input-field" value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Nome do cliente" />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <input type="text" className="input-field" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="..." />
          </div>
          {form.quantity && form.unit_price && (
            <div className="col-span-2 md:col-span-3 bg-green-50 rounded-lg px-4 py-2 text-sm text-green-800">
              Total: <strong>R$ {(Number(form.quantity) * Number(form.unit_price)).toFixed(2)}</strong>
            </div>
          )}
          <div className="col-span-2 md:col-span-3 flex items-center gap-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Registrar Venda'}
            </button>
            {message && (
              <span className={`text-sm font-medium ${message.ok ? 'text-green-700' : 'text-red-600'}`}>
                {message.text}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-green-800">Vendas Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Produto</th>
                <th className="px-4 py-3 text-right font-medium">Qtd.</th>
                <th className="px-4 py-3 text-left font-medium">Unid.</th>
                <th className="px-4 py-3 text-right font-medium">Preço Unit.</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Nenhuma venda encontrada.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/50">
                    <td className="px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3 font-medium">{r.product}</td>
                    <td className="px-4 py-3 text-right">{Number(r.quantity)}</td>
                    <td className="px-4 py-3">{r.unit || '—'}</td>
                    <td className="px-4 py-3 text-right">R$ {Number(r.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      R$ {Number(r.total || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{r.customer || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(r.id)} className="btn-delete">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
