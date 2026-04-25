'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <Image src="/logo.png" alt="URLASTONE" width={160} height={48} className="mb-10 opacity-80" />

      <p className="font-mono text-[#b39345] text-sm tracking-widest uppercase mb-4">404</p>
      <h1 className="font-heading text-3xl md:text-4xl text-white mb-4">
        Sayfa Bulunamadı
      </h1>
      <p className="font-body text-white/50 text-base max-w-md mb-10">
        Aradığınız sayfa taşınmış veya kaldırılmış olabilir.
        Ürünlerimizi keşfetmek için aşağıdaki bağlantıları kullanabilirsiniz.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/"
          className="px-6 py-3 bg-[#b39345] hover:bg-[#d2b96e] text-black font-body font-semibold rounded-xl transition-colors text-sm">
          Ana Sayfa
        </Link>
        <Link href="/urunlerimiz"
          className="px-6 py-3 border border-white/20 hover:border-[#b39345] text-white font-body rounded-xl transition-colors text-sm">
          Ürünlerimiz
        </Link>
        <Link href="/projelerimiz"
          className="px-6 py-3 border border-white/20 hover:border-[#b39345] text-white font-body rounded-xl transition-colors text-sm">
          Projelerimiz
        </Link>
        <Link href="/simulasyon"
          className="px-6 py-3 border border-white/20 hover:border-[#b39345] text-white font-body rounded-xl transition-colors text-sm">
          AI Simülasyon
        </Link>
      </div>
    </div>
  )
}
