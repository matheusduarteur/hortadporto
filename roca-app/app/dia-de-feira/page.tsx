'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { QRCodeSVG } from 'qrcode.react'

// tipo simples pro estado da venda
type FeiraSale = {
  amount: string // string pra facilitar input; convertemos pra número na hora de salvar
}

const LOCAL_PIX_KEY = 'rocaapp_pix_key'

export default function DiaDeFeiraPage() {
  const [pixKey, setPixKey] = useState<string>('')
  const [editingPixKey, setEditingPixKey] = useState<boolean>(false)

  const [sale, setSale] = useState<FeiraSale>({ amount: '' })
  const [qrPayload, setQrPayload] = useState<string | null>(null)
  const [loadingQR, setLoadingQR] = useState(false)
  const [savingSale, setSavingSale] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null
  )

  // carrega a chave PIX do localStorage na montagem
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(LOCAL_PIX_KEY)
    if (stored) {
      setPixKey(stored)
    } else {
      setEditingPixKey(true) // primeira vez: já abre edição
    }
  }, [])

  function handleSavePixKey() {
    if (!pixKey.trim()) {
      setMessage({ text: 'Informe uma chave PIX válida.', ok: false })
      return
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_PIX_KEY, pixKey.trim())
    }
    setEditingPixKey(false)
    setMessage({ text: 'Chave PIX salva!', ok: true })
    setTimeout(() => setMessage(null), 2500)
  }

  // Gera um payload PIX **de exemplo** com chave + valor.
  // Em produção, o ideal é usar uma lib específica de payload PIX.
  function buildPixPayload(key: string, amount: number): string {
    // Aqui é um placeholder simplificado.
    // O QR Code PIX real usa padrão EMVCo + BACEN.
    // Pra testes/demonstração, podemos usar um formato simples
    // ou depois plugar uma lib como "pix-payload" ou similar.
    return `PIX|KEY=${key}|AMOUNT=${amount.toFixed(2)}|MSG=Roça App Dia de Feira`
  }

  function handleGenerateQR() {
    if (!pixKey.trim()) {
      setMessage({ text: 'Cadastre sua chave PIX primeiro.', ok: false })
      return
    }
    const amountNumber = Number(
      sale.amount.replace(',', '.').replace(/[^0-9.]/g, '')
    )
    if (!amountNumber || amountNumber <= 0) {
      setMessage({ text: 'Informe um valor válido para a venda.', ok: false })
      return
    }

    setLoadingQR(true)
    try {
      const payload = buildPixPayload(pixKey.trim(), amountNumber)
      setQrPayload(payload)
      setMessage(null)
    } catch (e) {
      console.error(e)
      setMessage({ text: 'Erro ao gerar QR Code.', ok: false })
    } finally {
      setLoadingQR(false)
    }
  }

  async function handleSaveSale() {
    if (!sale.amount || !qrPayload) {
      setMessage({
        text: 'Gere o QR Code antes de registrar a venda.',
        ok: false,
      })
      return
    }

    const amountNumber = Number(
      sale.amount.replace(',', '.').replace(/[^0-9.]/g, '')
    )
    if (!amountNumber || amountNumber <= 0) {
      setMessage({ text: 'Valor da venda inválido.', ok: false })
      return
    }

    setSavingSale(true)
    try {
      const { error } = await supabase.from('sales').insert({
        total: amountNumber,
        date: new Date().toISOString().split('T')[0], // data de hoje (YYYY-MM-DD)
        source: 'dia-de-feira', // se sua tabela não tiver essa coluna, remova/ajuste
      })

      if (error) {
        console.error(error)
        setMessage({ text: 'Erro ao registrar venda.', ok: false })
      } else {
        setMessage({ text: 'Venda registrada com sucesso!', ok: true })
        setSale({ amount: '' })
        setQrPayload(null)
      }
    } catch (e) {
      console.error(e)
      setMessage({ text: 'Erro inesperado ao registrar venda.', ok: false })
    } finally {
      setSavingSale(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          🛒 Dia de Feira
        </h1>
        <p className="text-xs text-slate-500">
          Registre rapidamente uma venda na feira e gere o QR Code PIX para o
          cliente pagar na hora.
        </p>
      </header>

      {/* BLOCO DE CONFIGURAÇÃO DA CHAVE PIX */}
      <section className="card-section">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Chave PIX
          </h2>
          {!editingPixKey && (
            <button
              type="button"
              onClick={() => setEditingPixKey(true)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Alterar
            </button>
          )}
        </div>

        {editingPixKey ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Cole ou digite sua chave PIX (CPF, e-mail, telefone ou aleatória)"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSavePixKey}
              className="btn-primary whitespace-nowrap"
            >
              Salvar chave
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-700">
            Chave PIX atual:{' '}
            <span className="break-all font-semibold text-emerald-800">
              {pixKey}
            </span>
          </p>
        )}
      </section>

      {/* BLOCO DE VENDA RÁPIDA */}
      <section className="card-section">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Nova venda na feira
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Coluna esquerda: valor + ações */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Valor da venda (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0,00"
                value={sale.amount}
                onChange={(e) => setSale({ amount: e.target.value })}
              />
              <p className="mt-1 text-[10px] text-slate-400">
                No futuro você poderá montar a venda escolhendo os produtos. Por
                enquanto, informe apenas o valor total.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleGenerateQR}
                disabled={loadingQR || !pixKey}
                className="btn-primary disabled:opacity-60"
              >
                {loadingQR ? 'Gerando QR...' : 'Gerar QR Code PIX'}
              </button>

              {qrPayload && (
                <button
                  type="button"
                  onClick={handleSaveSale}
                  disabled={savingSale}
                  className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                >
                  {savingSale ? 'Salvando...' : 'Registrar venda'}
                </button>
              )}
            </div>

            {message && (
              <p
                className={`text-sm font-medium ${
                  message.ok ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {message.text}
              </p>
            )}
          </div>

          {/* Coluna direita: QR Code */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 px-4 py-5">
            {qrPayload ? (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  QR Code para o cliente pagar
                </p>
                <div className="rounded-2xl bg-white p-4 shadow-md">
                  <QRCodeSVG value={qrPayload} size={168} />
                </div>
                <p className="mt-3 max-w-xs text-center text-[11px] text-slate-500">
                  Peça para o cliente abrir o app do banco e escanear este QR
                  Code PIX. Depois, toque em{' '}
                  <span className="font-semibold">“Registrar venda”</span> para
                  salvar no seu histórico.
                </p>
              </>
            ) : (
              <p className="text-center text-xs text-slate-500">
                Informe o valor da venda e clique em{' '}
                <span className="font-semibold">“Gerar QR Code PIX”</span> para
                criar o código de pagamento.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}