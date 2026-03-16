'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type MilkRecord = {
  id: string
  date: string
  animal_name: string | null
  liters: number
  feed_kg: number | null
  feed_cost: number | null
  extra_cost: number | null
  notes: string | null
}

const emptyForm = { date: '', animal_name: '', liters: '', feed_kg: '', feed_cost: '', extra_cost: '', notes: '' }

export default function VacasPage() {
  const [records, setRecords] = useState<MilkRecord[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    setForm((f) => ({ ...f, date: new Date().toISOString().split('T')[0] }))
    loadRecords()
  }, [])

  async function loadRecords() {
    const { data, error } = await supabase
      .from('milk_records')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)
    if (error) { console.error(error); return }
    setRecords(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('milk_records').insert({
      date: form.date,
      animal_name: form.animal_name || null,
      liters: Number(form.liters),
      feed_kg: form.feed_kg ? Number(form.feed_kg) : null,
      feed_cost: form.feed_cost ? Number(form.feed_cost) : null,
      extra_cost: form.extra_cost ? Number(form.extra_cost) : null,
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
    const { error } = await supabase.from('milk_records').delete().eq('id', id)
    if (error) { console.error(error); setMessage({ text: 'Erro ao excluir.', ok: false }); return }
    loadRecords()
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-extrabold tracking-tight text-slate-900">🐄 Vacas / Leite</h1>

      <div className="card-section">
        <h2 className="text-xs font-semibold tracking-[0.22em] text-emerald-700 uppercase mb-4">Novo Registro</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1.5">Data *</label>
            <input type="date" required className="input-field" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1.5">Litros de Leite *</label>
            <input type="number" required step="0.1" min="0" className="input-field" value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })} placeholder="0.0" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1.5">Nome do Animal</label>
            <input type="text" className="input-field" value={form.animal_name}
              onChange={(e) => setForm({ ...form, animal_name: e.target.value })} placeholder="Ex: Mimosa" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1.5">Ração (kg)</label>
            <input type="number" step="0.1" min="0" className="input-field" value={form.feed_kg}
              onChange={(e) => setForm({ ...form, feed_kg: e.target.value })} placeholder="0.0" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1.5">Custo Ração (R$)</label>
            <input type="number" step="0.01" min="0" className="input-field" value={form.feed_cost}
              onChange={(e) => setForm({ ...form, feed_cost: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1.5">Custo Extra (R$)</label>
            <input type="number" step="0.01" min="0" className="input-field" value={form.extra_cost}
              onChange={(e) => setForm({ ...form, extra_cost: e.target.value })} placeholder="0.00" />
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-1.5">Observações</label>
            <input type="text" className="input-field" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="..." />
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-3 flex items-center gap-4 pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            {message && (
              <span className={`text-sm font-medium ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                {message.text}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="card-section overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-xs font-semibold tracking-[0.22em] text-emerald-700 uppercase">Registros Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50/70">
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">Animal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">Litros</th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">Ração (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">Custo Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">Obs.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">Nenhum registro encontrado.</td>
                </tr>
              ) : (
                records.map((r) => {
                  const custoTotal = (Number(r.feed_cost || 0) + Number(r.extra_cost || 0))
                  return (
                    <tr key={r.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-4 py-3 text-slate-700">{r.date}</td>
                      <td className="px-4 py-3 text-slate-700">{r.animal_name || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-800">{Number(r.liters).toFixed(1)} L</td>
                      <td className="px-4 py-3 text-right text-slate-600">{r.feed_kg ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{custoTotal > 0 ? `R$ ${custoTotal.toFixed(2)}` : '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{r.notes || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(r.id)} className="btn-delete">Excluir</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
