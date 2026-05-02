import './globals.css'
import Navbar from "@/app/components/Navbar";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
    title: 'SkinSwipe – CS2 Skins tauschen | CS2 Trading',
    description: 'Tausche CS2 Skins einfach und sicher. Finde den perfekten Trade mit dem Tinder-Prinzip. Kostenlos & ohne Gebühren.',
    keywords: 'CS2 Skins tauschen, CS2 Trading, Counter Strike Skins, Skin Swap',
    openGraph: {
        title: 'SkinSwipe – CS2 Skin Trading',
        description: 'CS2 Skins tauschen wie Tinder',
        url: 'https://deinedomain.de',
        siteName: 'SkinSwipe',
    }
}

export default function RootLayout({ children }) {
    return (
        <html lang="de">
        <SpeedInsights />
        <Analytics />
        <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px', flex: 1 }}>
            {children}
        </main>
        <Footer />
        </body>
        </html>
    )
}