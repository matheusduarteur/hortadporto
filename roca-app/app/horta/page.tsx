'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type GardenRecord = {
  id: string
  date: string
  bed_name: string | null
  culture: string | null
  input_used: string | null
  input_cost: number | null
  harvest_kg: number | null
  notes: string | null
}

const emptyForm = { date: '', bed_name: '', culture: '', input_used: '', input_cost: '', harvest_kg: '', notes: '' }

export default function HortaPage() {
  const [records, setRecords] = useState<GardenRecord[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    setForm((f) => ({ ...f, date: new Date().toISOString().split('T')[0] }))
    loadRecords()
  }, [])

  async function loadRecords() {
    const { data, error } = await supabase
      .from('garden_records')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)
    if (error) { console.error(error); return }
    setRecords(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('garden_records').insert({
      date: form.date,
      bed_name: form.bed_name || null,
      culture: form.culture || null,
      input_used: form.input_used || null,
      input_cost: form.input_cost ? Number(form.input_cost) : null,
      harvest_kg: form.harvest_kg ? Number(form.harvest_kg) : null,
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
    const { error } = await supabase.from('garden_records').delete().eq('id', id)
    if (error) { console.error(error); setMessage({ text: 'Erro ao excluir.', ok: false }); return }
    loadRecords()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-6">🥬 Horta</h1>

      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-4">Novo Registro</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
            <input type="date" required className="input-field" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canteiro</label>
            <input type="text" className="input-field" value={form.bed_name}
              onChange={(e) => setForm({ ...form, bed_name: e.target.value })} placeholder="Ex: Canteiro A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cultura</label>
            <input type="text" className="input-field" value={form.culture}
              onChange={(e) => setForm({ ...form, culture: e.target.value })} placeholder="Ex: Alface, Tomate" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insumo Usado</label>
            <input type="text" className="input-field" value={form.input_used}
              onChange={(e) => setForm({ ...form, input_used: e.target.value })} placeholder="Ex: Adubo orgânico" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custo Insumo (R$)</label>
            <input type="number" step="0.01" min="0" className="input-field" value={form.input_cost}
              onChange={(e) => setForm({ ...form, input_cost: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colheita (kg)</label>
            <input type="number" step="0.1" min="0" className="input-field" value={form.harvest_kg}
              onChange={(e) => setForm({ ...form, harvest_kg: e.target.value })} placeholder="0.0" />
          </div>
          <div className="col-span-2 md:col-span-3">
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
                <th className="px-4 py-3 text-left font-medium">Canteiro</th>
                <th className="px-4 py-3 text-left font-medium">Cultura</th>
                <th className="px-4 py-3 text-left font-medium">Insumo</th>
                <th className="px-4 py-3 text-right font-medium">Custo (R$)</th>
                <th className="px-4 py-3 text-right font-medium">Colheita (kg)</th>
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
                    <td className="px-4 py-3">{r.bed_name || '—'}</td>
                    <td className="px-4 py-3">{r.culture || '—'}</td>
                    <td className="px-4 py-3">{r.input_used || '—'}</td>
                    <td className="px-4 py-3 text-right">{r.input_cost != null ? `R$ ${Number(r.input_cost).toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 text-right">{r.harvest_kg != null ? `${Number(r.harvest_kg).toFixed(1)} kg` : '—'}</td>
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
