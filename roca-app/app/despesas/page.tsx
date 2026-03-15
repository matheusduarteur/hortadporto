'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Expense = {
  id: string
  date: string
  category: string | null
  description: string | null
  amount: number
  related_to: string | null
  notes: string | null
}

const emptyForm = { date: '', category: '', description: '', amount: '', related_to: '', notes: '' }

export default function DespesasPage() {
  const [records, setRecords] = useState<Expense[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    setForm((f) => ({ ...f, date: new Date().toISOString().split('T')[0] }))
    loadRecords()
  }, [])

  async function loadRecords() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)
    if (error) { console.error(error); return }
    setRecords(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('expenses').insert({
      date: form.date,
      category: form.category || null,
      description: form.description || null,
      amount: Number(form.amount),
      related_to: form.related_to || null,
      notes: form.notes || null,
    })
    setLoading(false)
    if (error) { console.error(error); setMessage({ text: 'Erro ao salvar.', ok: false }); return }
    setMessage({ text: 'Despesa registrada!', ok: true })
    setForm((f) => ({ ...emptyForm, date: f.date }))
    loadRecords()
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta despesa?')) return
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) { console.error(error); setMessage({ text: 'Erro ao excluir.', ok: false }); return }
    loadRecords()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-6">💸 Despesas</h1>

      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-4">Nova Despesa</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
            <input type="date" required className="input-field" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
            <input type="number" required step="0.01" min="0" className="input-field" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input type="text" className="input-field" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Ração, Insumo" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" className="input-field" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhe da despesa" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relacionado a</label>
            <input type="text" className="input-field" value={form.related_to}
              onChange={(e) => setForm({ ...form, related_to: e.target.value })} placeholder="Ex: Galinhas, Horta" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <input type="text" className="input-field" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="..." />
          </div>
          <div className="col-span-2 md:col-span-3 flex items-center gap-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Registrar Despesa'}
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
          <h2 className="text-lg font-semibold text-green-800">Despesas Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Categoria</th>
                <th className="px-4 py-3 text-left font-medium">Descrição</th>
                <th className="px-4 py-3 text-left font-medium">Relac. a</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhuma despesa encontrada.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/50">
                    <td className="px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3">{r.category || '—'}</td>
                    <td className="px-4 py-3">{r.description || '—'}</td>
                    <td className="px-4 py-3">{r.related_to || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-700">
                      R$ {Number(r.amount).toFixed(2)}
                    </td>
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
