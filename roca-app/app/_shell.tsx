'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const isHome = pathname === '/'

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-slate-900 flex flex-col relative">
      {/* TOPO: LOGO + CLIMA */}
      <Header />

      {/* BOTÃO DE VOLTAR FLUTUANTE (MOBILE, FORA DA HOME) */}
      {!isHome && (
        <button
          onClick={handleBack}
          className="
            fixed left-3 top-[62px] z-30
            flex h-9 w-9 items-center justify-center
            rounded-full bg-emerald-500 text-white
            shadow-lg shadow-emerald-800/25
            border border-emerald-700/60
            md:hidden
          "
          aria-label="Voltar"
        >
          ‹
        </button>
      )}

      {/* CONTEÚDO */}
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
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
        {/* LOGO + NOME DO APP */}
        <div className="flex items-center gap-3">
          {/* ÍCONE / LOGO REDONDO */}
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-emerald-700/40 bg-[#fdf9ec] shadow-sm">
            <img
              src="/horta-logo.png"
              alt="Roça App"
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* NOME DO APP */}
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-emerald-900 via-emerald-700 to-lime-700 bg-clip-text text-lg font-black uppercase italic tracking-[0.18em] text-transparent">
              Roça App
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-900/70">
              Controle da roça em um só lugar
            </span>
          </div>
        </div>

        {/* CARD DE CLIMA – FICA ABAIXO EM MOBILE, AO LADO EM DESKTOP */}
        <div className="md:ml-3 md:flex-shrink-0">
          <WeatherCard />
        </div>
      </div>
    </header>
  )
}

/* =========================
   CARD DE CLIMA (OpenWeather por lat/lon)
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
          'https://api.openweathermap.org/data/2.5/weather?lat=-14.620972971351303&lon=-40.29520315068608&units=metric&lang=pt_br&appid=' +
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

    // 3) quando a aba voltar a ficar visível, busca de novo na hora
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
    <div className="flex min-w-[190px] items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/95 px-3 py-2 shadow-sm">
      {/* ÍCONE DE CLIMA */}
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
      <div className="flex flex-1 flex-col leading-tight">
        {/* Temperatura + sensação */}
        <span className="text-sm font-semibold text-emerald-950">
          {loading ? 'Carregando...' : tempText}
          {!loading && feelsLikeText && (
            <span className="ml-1 text-[10px] font-normal text-emerald-800/80">
              (sensação {feelsLikeText})
            </span>
          )}
        </span>

        {/* Descrição simples */}
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