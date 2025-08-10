import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'VisionaryChurch.ai - AI-Powered Church Visitor Management',
    template: '%s | VisionaryChurch.ai'
  },
  description: 'Transform your church visitor experience with AI-powered chat widgets, smart visit planning, and comprehensive analytics. Built for modern churches.',
  keywords: ['church', 'visitor management', 'AI', 'chat widget', 'visit planning', 'analytics'],
  authors: [{ name: 'VisionaryChurch.ai Team' }],
  creator: 'VisionaryChurch.ai',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://visionarychurch.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://visionarychurch.ai',
    title: 'VisionaryChurch.ai - AI-Powered Church Visitor Management',
    description: 'Transform your church visitor experience with AI-powered chat widgets, smart visit planning, and comprehensive analytics.',
    siteName: 'VisionaryChurch.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionaryChurch.ai - AI-Powered Church Visitor Management',
    description: 'Transform your church visitor experience with AI-powered tools.',
    creator: '@visionarychurch',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'bg-white shadow-lg border border-gray-200',
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}