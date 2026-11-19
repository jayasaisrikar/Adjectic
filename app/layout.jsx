import localFont from 'next/font/local'
import './style.css'

// Fonts are self-hosted from app/fonts (SIL OFL, licences alongside) so builds never
// depend on fetching from Google Fonts at build time.
const sans = localFont({
  src: [{ path: './fonts/SchibstedGrotesk-Variable.woff2', weight: '400 900', style: 'normal' }],
  variable: '--f-sans',
  display: 'swap',
})
const mono = localFont({
  src: [
    { path: './fonts/IBMPlexMono-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/IBMPlexMono-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/IBMPlexMono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--f-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Adgentic | AI agents for Amazon, TikTok Shop, Walmart, Target and Noon ads',
  description:
    'AI agents manage ads on Amazon, TikTok Shop, Walmart, Target and Noon. Set your spending limits, see why bids changed and verify results in your own ad console.',
  icons: { icon: '/images/adgentic.svg' },
  openGraph: {
    type: 'website',
    siteName: 'Adgentic',
    title: 'Adgentic | AI ad management for marketplace sellers',
    description: 'Autonomous AI agents run your marketplace ads 24/7. They diagnose why ACOS moves and fix the cause, inside hard guardrails.',
  },
  twitter: { card: 'summary_large_image', title: 'Adgentic | AI ad management for marketplace sellers' },
}

export const viewport = { themeColor: '#faf8f4', width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default function Layout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      {/* browser extensions (e.g. Grammarly) inject attributes on <body> before hydration */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
