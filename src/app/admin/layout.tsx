import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel',
  manifest: '/admin-manifest.json',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="max-w-full overflow-x-hidden">{children}</div>
}
