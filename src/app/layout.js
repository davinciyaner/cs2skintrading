import './globals.css'
import Navbar from "@/app/components/Navbar";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import FAQ from "./faq/page";

export const metadata = {
    title: 'SkinSwipe – CS2 Skins tauschen | Kostenloses P2P Skin Trading',
    description: 'CS2 Skins tauschen ohne Gebühren. Finde den perfekten Trade mit dem Tinder-Prinzip – swipen, matchen, traden. Kein Steam Tax, keine Bots, echte Spieler.',
    keywords: [
        // Deutsch – hohe Suchvolumen
        'CS2 Skins tauschen',
        'CS2 Trading',
        'CS2 Skin Trade',
        'CS2 Skins handeln',
        'Counter Strike Skins tauschen',
        'CSGO Skins tauschen',
        'CS2 Trading Seite',
        'CS2 Handelsseite',
        'CS2 Skin Swap',
        'CS2 P2P Trading',
        'CS2 Skins ohne Gebühren tauschen',
        'CS2 Steam Tax umgehen',
        'CS2 Trade Bot Alternative',
        'Skins traden CS2',
        'CS2 Inventar tauschen',
        'CS2 Skins tauschen kostenlos',
        'CS2 Skins mit anderen Spielern tauschen',
        'CS2 P2P Skin Tausch',
        'beste CS2 Trading Seite Deutschland',
        'CS2 Skins tauschen ohne Steam',
    ].join(', '),
    openGraph: {
        title: 'SkinSwipe – CS2 Skins tauschen wie Tinder',
        description: 'Swipen, matchen, traden. Tausche CS2 Skins direkt mit anderen Spielern – kostenlos & ohne Gebühren.',
        url: 'https://deinedomain.de',
        siteName: 'SkinSwipe',
        locale: 'de_DE',
        type: 'website',
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
        <FAQ />
        <Footer />
        </body>
        </html>
    )
}