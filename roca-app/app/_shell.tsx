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
   CARD DE CLIMA (OpenWeather)
   ========================= */

type WeatherData = {
  temp: number | null
  feelsLike: number | null
  description: string | null
  humidity: number | null
  willRain: boolean | null
  rainLastHour: number | null
  iconCode: string | null
}

function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    feelsLike: null,
    description: null,
    humidity: null,
    willRain: null,
    rainLastHour: null,
    iconCode: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

    if (!apiKey) {
      setLoading(false)
      return
    }

    let intervalId: number | undefined

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
        const feelsLike = data.main?.feels_like ?? null
        const description = data.weather?.[0]?.description ?? null
        const humidity = data.main?.humidity ?? null
        const iconCode = data.weather?.[0]?.icon ?? null

        const rainLastHour =
          data.rain && typeof data.rain['1h'] === 'number'
            ? data.rain['1h']
            : null

        const descText = (description || '').toLowerCase()
        const willRain =
          descText.includes('chuva') ||
          (rainLastHour !== null && rainLastHour > 0)

        setWeather({
          temp,
          feelsLike,
          description,
          humidity,
          willRain,
          rainLastHour,
          iconCode,
        })
      } catch (error) {
        console.error('Erro ao carregar clima:', error)
      } finally {
        setLoading(false)
      }
    }

    // 1) busca quando abre
    fetchWeather()

    // 2) busca de novo a cada 10 minutos (enquanto estiver ativo)
    intervalId = window.setInterval(fetchWeather, 10 * 60 * 1000)

    // 3) quando a aba voltar a ficar visível (depois de minimizar / trocar app),
    //     busca de novo na hora
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchWeather()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // limpeza quando o componente for desmontado
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const tempText =
    weather.temp !== null ? `${Math.round(weather.temp)}°C` : '—°C'

  const feelsLikeText =
    weather.feelsLike !== null ? `${Math.round(weather.feelsLike)}°` : null

  const humidityText =
    weather.humidity !== null ? `${weather.humidity}%` : '—%'

  const rainText =
    weather.willRain === null
      ? 'Sem previsão'
      : weather.willRain
      ? weather.rainLastHour
        ? `Chuva ${weather.rainLastHour.toFixed(1)} mm`
        : 'Pode chover'
      : 'Sem chuva'

  const iconUrl = weather.iconCode
    ? `https://openweathermap.org/img/wn/${weather.iconCode}@2x.png`
    : null

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-emerald-100/90 px-3 py-2 shadow-sm min-w-[180px]">
      {/* BOLINHA COM ÍCONE DE CLIMA OFICIAL */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/90">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={weather.description ?? 'Condição do tempo'}
            className="h-9 w-9"
          />
        ) : (
          <span className="text-lg text-emerald-50">☁️</span>
        )}
      </div>

      {/* TEXTOS DO CARD */}
      <div className="flex flex-col leading-tight flex-1">
        {/* Temperatura + sensação */}
        <span className="text-sm font-semibold text-emerald-900">
          {loading ? 'Carregando...' : tempText}
          {!loading && feelsLikeText && (
            <span className="ml-1 text-[10px] font-normal text-emerald-800/80">
              (sensação {feelsLikeText})
            </span>
          )}
        </span>

        {/* Descrição simples (sem nome de cidade) */}
        <span className="text-[10px] text-emerald-800">
          {loading ? 'Carregando' : weather.description || 'Sem dados'}
        </span>

        {/* Umidade + chuva */}
        <span className="text-[9px] text-emerald-800/80">
          Umidade {humidityText} · {rainText}
        </span>
      </div>
    </div>
  )
}