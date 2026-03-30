'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  MessageSquare,
  Gem,
  MapPin,
  LogOut,
  Menu,
  X,
  FileText,
  Star,
  Image,
  BookOpen,
} from 'lucide-react'
import AdminOverview from './AdminOverview'
import AdminTeklifler from './AdminTeklifler'
import AdminTaslar from './AdminTaslar'
import AdminProjeler from './AdminProjeler'
import AdminReferanslar from './AdminReferanslar'
import AdminKatalog from './AdminKatalog'
import AdminHeroSlides from './AdminHeroSlides'
import AdminBlog from './AdminBlog'

const tabs = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero Slaytları', icon: Image },
  { id: 'teklifler', label: 'Teklif Talepleri', icon: MessageSquare },
  { id: 'taslar', label: 'Taş Yönetimi', icon: Gem },
  { id: 'projeler', label: 'Proje Yönetimi', icon: MapPin },
  { id: 'referanslar', label: 'Referanslar', icon: Star },
  { id: 'katalog', label: 'Katalog', icon: FileText },
  { id: 'blog', label: 'Blog Yönetimi', icon: BookOpen },
]

export default function AdminDashboard({ onLogout, adminPassword }: { onLogout: () => void; adminPassword: string }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex overflow-x-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-white">
              URLA<span className="font-light">STONE</span>
            </h1>
            <p className="text-white/30 text-[10px] font-mono mt-1">ADMİN PANELİ</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/[0.05] transition-all duration-200"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen min-w-0 overflow-x-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <h2 className="font-heading text-lg font-semibold text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/40 text-xs font-mono">Çevrimiçi</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'hero' && <AdminHeroSlides />}
          {activeTab === 'teklifler' && <AdminTeklifler />}
          {activeTab === 'taslar' && <AdminTaslar />}
          {activeTab === 'projeler' && <AdminProjeler adminPassword={adminPassword} />}
          {activeTab === 'referanslar' && <AdminReferanslar />}
          {activeTab === 'katalog' && <AdminKatalog />}
          {activeTab === 'blog' && <AdminBlog />}
        </div>
      </main>
    </div>
  )
}
