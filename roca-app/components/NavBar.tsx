'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/', icon: '🏡', label: 'Dashboard' },
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-green-900 text-white h-14 flex items-center justify-between px-4 shadow-lg">
        <Link href="/" className="text-xl font-bold tracking-wide flex items-center gap-2">
          🌿 Roça App
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-green-700 text-white'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-green-800 text-white text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-14 left-0 right-0 bg-green-900 shadow-xl"
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
                      : 'text-green-200 hover:bg-green-800 hover:text-white'
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
