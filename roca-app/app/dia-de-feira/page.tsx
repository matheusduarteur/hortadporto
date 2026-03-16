'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { QRCodeSVG } from 'qrcode.react'

type FeiraSale = {
  amount: string
}

const LOCAL_PIX_KEY = 'rocaapp_pix_key'

/**
 * ====== FUNÇÕES DE PAYLOAD PIX (SEM LIB EXTERNA) ======
 */

// monta um campo EMV: ID + tamanho (2 dígitos) + valor
function emvField(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0')
  return `${id}${len}${value}`
}

// CRC16 CCITT-FALSE (polinômio 0x1021, inicial 0xFFFF)
function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Gera o payload PIX EMV conforme padrão BR Code
function buildPixPayload(key: string, amount: number): string {
  const chave = key.trim()

  // Merchant Account Information (ID 26)
  const merchantAccount =
    emvField('00', 'BR.GOV.BCB.PIX') + // GUI do BACEN
    emvField('01', chave)

  const merchantAccountField = emvField('26', merchantAccount)

  const nomeRecebedor = "HORTA D'PORTO".slice(0, 25).toUpperCase()
  const cidade = 'SAO PAULO' // sem acento, até 15 chars

  const payloadSemCRC =
    emvField('00', '01') + // Payload Format Indicator
    emvField('01', '12') + // BR Code versão 2
    merchantAccountField +
    emvField('52', '0000') + // MCC genérico
    emvField('53', '986') + // Moeda BRL
    emvField('54', amount.toFixed(2)) + // valor
    emvField('58', 'BR') + // país
    emvField('59', nomeRecebedor) +
    emvField('60', cidade) +
    emvField(
      '62',
      emvField('05', 'ROCAAPP') // txid
    )

  // adiciona campo CRC (63) com placeholder e calcula
  const payloadParaCRC = payloadSemCRC + '6304'
  const crc = crc16(payloadParaCRC)

  return payloadParaCRC + crc
}

/**
 * ====== COMPONENTE PRINCIPAL ======
 */

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(LOCAL_PIX_KEY)
    if (stored) {
      setPixKey(stored)
    } else {
      setEditingPixKey(true)
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
      setMessage({ text: 'Erro ao gerar QR Code PIX.', ok: false })
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
      // IMPORTANTE: compatível com a tabela `sales` que você mostrou
      const { data, error } = await supabase.from('sales').insert({
        date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD'
        product: 'Dia de Feira',                      // nome genérico
        quantity: 1,                                  // 1 venda
        unit: 'un',
        unit_price: amountNumber,                     // valor da venda
        customer: null,
        notes: null,
      })

      console.log('Resultado insert Dia de Feira:', { data, error })

      if (error) {
        console.error('Erro ao registrar venda:', error)
        setMessage({
          text: `Erro ao registrar venda: ${error.message ?? ''}`,
          ok: false,
        })
        return
      }

      setMessage({ text: 'Venda registrada com sucesso!', ok: true })
      setQrPayload(null)
      setSale({ amount: '' })
      setTimeout(() => setMessage(null), 2500)
    } catch (e: any) {
      console.error('Erro inesperado ao salvar venda:', e)
      setMessage({
        text: 'Erro inesperado ao salvar venda.',
        ok: false,
      })
    } finally {
      setSavingSale(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f1eb] px-4 pb-6 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
          Dia de Feira
        </p>
        <h1 className="text-lg font-bold text-emerald-950">
          Gerar PIX para venda rápida
        </h1>
      </header>

      {/* BLOCO CHAVE PIX */}
      <section className="mb-4 rounded-2xl bg-white p-4 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Sua chave PIX
            </p>
            {editingPixKey ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Digite sua chave (CPF, e-mail, celular...)"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSavePixKey}
                  className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 shadow-sm hover:bg-emerald-700"
                >
                  Salvar chave
                </button>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {pixKey}
                </p>
                <button
                  type="button"
                  onClick={() => setEditingPixKey(true)}
                  className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700"
                >
                  Editar chave
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* BLOCO VENDA + QR */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
        {/* Coluna esquerda */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Nova venda na feira
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Valor da venda (R$) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="0,00"
              value={sale.amount}
              onChange={(e) => setSale({ amount: e.target.value })}
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Por enquanto, informe apenas o valor total da venda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateQR}
              disabled={loadingQR || !pixKey}
              className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 shadow-sm hover:bg-emerald-800 disabled:opacity-60"
            >
              {loadingQR ? 'Gerando QR...' : 'Gerar QR Code PIX'}
            </button>

            {qrPayload && (
              <button
                type="button"
                onClick={handleSaveSale}
                disabled={savingSale}
                className="rounded-full border border-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
              >
                {savingSale ? 'Salvando...' : 'Registrar venda'}
              </button>
            )}
          </div>

          {message && (
            <p
              className={`mt-3 text-sm font-medium ${
                message.ok ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        {/* Coluna direita: QR Code */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-4">
          {qrPayload ? (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                QR Code para o cliente pagar
              </p>
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <QRCodeSVG value={qrPayload} size={188} />
              </div>
              <p className="mt-3 max-w-xs text-center text-[11px] text-slate-500">
                Peça para o cliente abrir o app do banco e escanear este QR
                Code PIX. O valor e sua chave já vão preenchidos
                automaticamente.
              </p>
            </>
          ) : (
            <p className="max-w-xs text-center text-xs text-slate-500">
              Informe o valor e clique em{' '}
              <span className="font-semibold">“Gerar QR Code PIX”</span> para
              criar o código de pagamento.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}