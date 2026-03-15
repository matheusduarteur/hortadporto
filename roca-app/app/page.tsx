'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { Leaf, PiggyBank, Users, Ruler } from 'lucide-react'

export default function DashboardPage() {
  const resumo = {
    producaoSemanal: '350 kg',
    receitaTotal: 'R$ 1.200',
    clientesAtivos: 58,
    areaCultivada: '0,5 ha',
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HERO / CAPA DO RESUMO */}
      <HeroResumo />

      {/* GRID DE CARDS DO RESUMO */}
      <section className="grid gap-3 sm:grid-cols-2">
        <ResumoCard
          icon={<Leaf className="h-4 w-4" />}
          titulo="Produção semanal"
          valor={resumo.producaoSemanal}
          destaqueColor="text-emerald-700"
        />

        <ResumoCard
          icon={<PiggyBank className="h-4 w-4" />}
          titulo="Receita total"
          valor={resumo.receitaTotal}
          destaqueColor="text-emerald-700"
        />

        <ResumoCard
          icon={<Users className="h-4 w-4" />}
          titulo="Clientes ativos"
          valor={String(resumo.clientesAtivos)}
          destaqueColor="text-emerald-700"
        />

        <ResumoCard
          icon={<Ruler className="h-4 w-4" />}
          titulo="Área cultivada"
          valor={resumo.areaCultivada}
          destaqueColor="text-emerald-700"
        />
      </section>
    </div>
  )
}

/* =========================
   HERO DO RESUMO
   ========================= */

function HeroResumo() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-[#fdf9ec] shadow-sm">
      {/* Faixa de foto ao fundo */}
      <div className="relative h-32 w-full overflow-hidden">
        {/* se não tiver essa imagem ainda, pode trocar por um fundo liso */}
        <Image
          src="/horta-cover.jpg"
          alt="Horta d’Porto"
          fill
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/0" />
      </div>

      {/* Título RESUMO sobreposto */}
      <div className="absolute inset-x-0 top-4 flex flex-col items-center text-center text-emerald-50">
        <span className="text-[10px] tracking-[0.25em] uppercase">
          Horta d’Porto
        </span>
        <h1 className="mt-1 text-lg font-semibold tracking-[0.22em] uppercase">
          Resumo
        </h1>
      </div>

      {/* Bloco inferior com logo e texto */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-4 pb-4 pt-2 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          {/* LOGO REDONDINHA DA HORTA */}
          <div className="h-12 w-12 rounded-full overflow-hidden border border-emerald-700/30 bg-[#fdf9ec] flex items-center justify-center">
            <img
              src="/horta-logo.png"
              alt="Horta d’Porto"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.1em] text-emerald-900 uppercase">
              Horta d’Porto
            </span>
            <span className="text-[11px] tracking-[0.2em] text-emerald-700 uppercase">
              Gestão da Roça Agroecológica
            </span>
          </div>
        </div>

        <p className="max-w-xs text-[11px] text-emerald-800/80 md:text-xs text-center md:text-right">
          Visão rápida da produção, receita, clientes e área cultivada da
          semana.
        </p>
      </div>
    </section>
  )
}

/* =========================
   CARD DO RESUMO
   ========================= */

type ResumoCardProps = {
  icon: ReactNode
  titulo: string
  valor: string
  destaqueColor?: string
}

function ResumoCard({ icon, titulo, valor, destaqueColor }: ResumoCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-emerald-900/12 bg-white/90 px-4 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-2 text-emerald-900">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-800">
          {icon}
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em]">
          {titulo}
        </span>
      </div>
      <div className={`mt-3 text-xl font-semibold ${destaqueColor}`}>
        {valor}
      </div>
    </div>
  )
}