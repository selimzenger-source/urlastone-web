'use client'

import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import AdminDashboard from '@/components/admin/AdminDashboard'

const ADMIN_PASSWORD = 'urlastone2026'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
    } else {
      setError('Şifre yanlış')
    }
  }

  if (authenticated) {
    return <AdminDashboard onLogout={() => setAuthenticated(false)} adminPassword={password} />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            URLA<span className="font-light">STONE</span>
          </h1>
          <p className="text-white/40 text-sm font-mono">Yönetim Paneli</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          <div className="mb-6">
            <label className="block text-white/50 text-xs font-mono mb-2">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Admin şifresi"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold-400/40 transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-full font-medium text-sm hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  )
}
