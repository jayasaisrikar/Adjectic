import { Schibsted_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './style.css'

const sans = Schibsted_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--f-sans', display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-mono', display: 'swap' })

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
