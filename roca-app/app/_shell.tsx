'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-slate-900 flex flex-col">
      {/* TOPO: LOGO + CLIMA */}
      <Header />

      {/* CONTEÚDO: aqui entra o page.tsx (Painel da Horta, emojis, relatório) */}
      <main className="flex-1 px-4 pb-6 pt-3 md:px-8 md:pb-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

/* =========================
   HEADER: LOGO + CARD DE CLIMA
   ========================= */

function Header() {
  return (
    <header className="w-full border-b border-emerald-900/10 bg-[#fdf9ec]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        {/* LOGO + TÍTULO À ESQUERDA */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-emerald-700/30 bg-[#fdf9ec] flex items-center justify-center">
            <img
              src="/horta-logo.png"
              alt="Horta d’Porto"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.10em] text-emerald-900 uppercase">
              Horta d’Porto
            </span>
            <span className="text-[11px] tracking-[0.20em] text-emerald-700 uppercase">
              Gestão da Roça
            </span>
          </div>
        </div>

        {/* CARD DE CLIMA À DIREITA */}
        <div className="ml-3 flex-shrink-0">
          <WeatherCard />
        </div>
      </div>
    </header>
  )
}

/* =========================
   CARD DE CLIMA (MORRINHOS - BA)
   ========================= */

type WeatherData = {
  temp: number | null
  description: string | null
  humidity: number | null
  willRain: boolean | null
}

function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    description: null,
    humidity: null,
    willRain: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

    if (!apiKey) {
      setLoading(false)
      return
    }

    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=Morrinhos,BR&units=metric&lang=pt_br&appid=' +
            apiKey
        )

        if (!res.ok) {
          throw new Error('Erro ao buscar clima')
        }

        const data = await res.json()

        const temp = data.main?.temp ?? null
        const description = data.weather?.[0]?.description ?? null
        const humidity = data.main?.humidity ?? null

        const descText = (description || '').toLowerCase()
        const willRain = descText.includes('chuva')

        setWeather({
          temp,
          description,
          humidity,
          willRain,
        })
      } catch (error) {
        console.error('Erro ao carregar clima:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const tempText =
    weather.temp !== null ? `${Math.round(weather.temp)}°C` : '—°C'
  const humidityText =
    weather.humidity !== null ? `${weather.humidity}%` : '—%'
  const rainText =
    weather.willRain === null
      ? 'Sem previsão'
      : weather.willRain
      ? 'Pode chover'
      : 'Sem chuva'

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-3 py-2 shadow-sm">
      {/* bolinha com ícone de clima */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-emerald-50 text-sm">
        ☁️
      </div>

      <div className="flex flex-col leading-tight">
        {/* Temperatura */}
        <span className="text-xs font-semibold text-emerald-900">
          {loading ? 'Carregando...' : tempText}
        </span>

        {/* Descrição (sem "Morrinhos") */}
        <span className="text-[10px] text-emerald-800">
          {loading ? 'Carregando' : weather.description || 'Sem dados'}
        </span>

        {/* Umidade + se vai chover */}
        <span className="text-[9px] text-emerald-800/80">
          Umidade {humidityText} · {rainText}
        </span>
      </div>
    </div>
  )
}