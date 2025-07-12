import './globals.css'

import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'

import MainLayout from '@/components/layouts/main-layout'
import TanstackProvider from '@/components/providers/tanstack-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const outfitSans = Outfit({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Arkoa – La gestion des congés, simplifiée',
  description:
    'Arkoa est une application web dédiée aux entreprises pour simplifier les demandes et la gestion des congés.',
  keywords: [
    'gestion des congés',
    'application entreprise',
    'RH',
    'demande de congé',
    'Arkoa',
    'outil RH',
  ],
  authors: [{ name: 'Arkoa' }],
  creator: 'Arkoa',
  metadataBase: new URL('https://arkoa.app'),
  openGraph: {
    title: 'Arkoa – La gestion des congés, simplifiée',
    description:
      'Arkoa permet aux entreprises de gérer simplement les demandes de congés des collaborateurs. Gain de temps garanti.',
    url: 'https://arkoa.app',
    siteName: 'Arkoa',
    images: [
      {
        url: 'https://arkoa.app/images/logo_arkoa.svg',
        width: 1200,
        height: 630,
        alt: 'Aperçu de l’application Arkoa',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1.0',
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
  icons: {
    icon: '/logo_arkoa.svg',
    apple: '/logo_arkoa.svg',
    shortcut: '/logo_arkoa.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${outfitSans.variable} antialiased`}>
        <TanstackProvider>
          <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem
            disableTransitionOnChange
          >
            <MainLayout>{children}</MainLayout>
          </ThemeProvider>
          <Toaster />
        </TanstackProvider>
      </body>
    </html>
  )
}
