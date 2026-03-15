'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type FishRecord = {
  id: string
  date: string
  tank_name: string | null
  feed_kg: number | null
  feed_cost: number | null
  mortality: number | null
  notes: string | null
}

const emptyForm = { date: '', tank_name: '', feed_kg: '', feed_cost: '', mortality: '', notes: '' }

export default function TilapiaPage() {
  const [records, setRecords] = useState<FishRecord[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    setForm((f) => ({ ...f, date: new Date().toISOString().split('T')[0] }))
    loadRecords()
  }, [])

  async function loadRecords() {
    const { data, error } = await supabase
      .from('fish_records')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)
    if (error) { console.error(error); return }
    setRecords(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('fish_records').insert({
      date: form.date,
      tank_name: form.tank_name || null,
      feed_kg: form.feed_kg ? Number(form.feed_kg) : null,
      feed_cost: form.feed_cost ? Number(form.feed_cost) : null,
      mortality: form.mortality ? Number(form.mortality) : null,
      notes: form.notes || null,
    })
    setLoading(false)
    if (error) { console.error(error); setMessage({ text: 'Erro ao salvar.', ok: false }); return }
    setMessage({ text: 'Registro salvo!', ok: true })
    setForm((f) => ({ ...emptyForm, date: f.date }))
    loadRecords()
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este registro?')) return
    const { error } = await supabase.from('fish_records').delete().eq('id', id)
    if (error) { console.error(error); setMessage({ text: 'Erro ao excluir.', ok: false }); return }
    loadRecords()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-6">🐟 Tilápia</h1>

      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-4">Novo Registro</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
            <input type="date" required className="input-field" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanque</label>
            <input type="text" className="input-field" value={form.tank_name}
              onChange={(e) => setForm({ ...form, tank_name: e.target.value })} placeholder="Ex: Tanque 1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ração (kg)</label>
            <input type="number" step="0.1" min="0" className="input-field" value={form.feed_kg}
              onChange={(e) => setForm({ ...form, feed_kg: e.target.value })} placeholder="0.0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custo Ração (R$)</label>
            <input type="number" step="0.01" min="0" className="input-field" value={form.feed_cost}
              onChange={(e) => setForm({ ...form, feed_cost: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mortalidade</label>
            <input type="number" min="0" className="input-field" value={form.mortality}
              onChange={(e) => setForm({ ...form, mortality: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <input type="text" className="input-field" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="..." />
          </div>
          <div className="col-span-2 md:col-span-3 flex items-center gap-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Salvar'}
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
          <h2 className="text-lg font-semibold text-green-800">Registros Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Tanque</th>
                <th className="px-4 py-3 text-right font-medium">Ração (kg)</th>
                <th className="px-4 py-3 text-right font-medium">Custo (R$)</th>
                <th className="px-4 py-3 text-right font-medium">Mortalidade</th>
                <th className="px-4 py-3 text-left font-medium">Obs.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nenhum registro encontrado.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/50">
                    <td className="px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3">{r.tank_name || '—'}</td>
                    <td className="px-4 py-3 text-right">{r.feed_kg ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{r.feed_cost != null ? `R$ ${Number(r.feed_cost).toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 text-right">{r.mortality ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.notes || '—'}</td>
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
