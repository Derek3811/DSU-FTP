import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DSU Secure Litigation Portal — Legal Production Intake',
  description:
    'HIPAA-Compliant, SOC 2 Type II certified evidence handling, legal production intake, and secure file transfer for litigation support at DSU Discovery.',
  generator: 'v0.app',
  metadataBase: new URL('https://portal.dsudiscovery.com'),
  openGraph: {
    title: 'DSU Secure Litigation Portal',
    description: 'HIPAA-Compliant Evidence Handling & Legal Production',
    siteName: 'DSU Discovery',
    locale: 'en_US',
    type: 'website',
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#07090F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ background: '#07090F' }}
    >
      <body className="font-sans antialiased" style={{ background: '#07090F', color: '#F1F5F9' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

