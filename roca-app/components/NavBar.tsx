'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/', icon: '🏡', label: 'Resumo' },
  { href: '/galinhas', icon: '🐔', label: 'Galinhas' },
  { href: '/vacas', icon: '🐄', label: 'Vacas' },
  { href: '/tilapia', icon: '🐟', label: 'Tilápia' },
  { href: '/horta', icon: '🥬', label: 'Horta' },
  { href: '/vendas', icon: '🛒', label: 'Vendas' },
  { href: '/despesas', icon: '💸', label: 'Despesas' },
  { href: '/relatorios', icon: '📊', label: 'Relatórios' },
]

export default function NavBar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-900 to-emerald-800 text-white h-16 flex items-center justify-between px-4 shadow-xl">

        {/* Logo + Nome */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-xl shadow-md">
            🌿
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-wide">
              Horta d' Porto
            </span>
            <span className="text-xs text-green-200">
              gestão da roça
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-white text-green-900 shadow'
                  : 'text-green-100 hover:bg-green-800'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg bg-green-800 hover:bg-green-700 text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-16 left-0 right-0 bg-gradient-to-b from-green-900 to-green-800 shadow-xl rounded-b-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-800'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-2xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}