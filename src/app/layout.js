import './globals.css'
import Footer from "./components/Footer"
import {Analytics} from "@vercel/analytics/next"
import {SpeedInsights} from "@vercel/speed-insights/next"
import Navbar from "./components/Navbar"
import {Bebas_Neue, DM_Sans} from 'next/font/google'
import {I18nProvider} from "../i18n/request";


export const metadata = {
    title: 'SkinSwipe – CS2 Skins tauschen | Kostenloses P2P Skin Trading ohne Steam Tax',
    description: 'CS2 Skins tauschen ohne Gebühren & ohne Steam Tax. Swipen, matchen, traden – direkt mit echten Spielern. Kein Bot, kein 15% Steam Fee. Die beste P2P CS2 Trading Seite 2026.',
    keywords: [
        // Deutsch – Core
        'CS2 Skins tauschen',
        'CS2 Trading',
        'CS2 Skin Trade',
        'CS2 Skins handeln',
        'CS2 Trading Seite',
        'CS2 Skin Swap',
        'CS2 P2P Trading',
        'CS2 Skins tauschen kostenlos',
        'CS2 Skins ohne Gebühren tauschen',
        'CS2 Steam Tax umgehen',
        'CS2 Trade Bot Alternative',
        'CS2 Inventar tauschen',
        'beste CS2 Trading Seite Deutschland',
        'CS2 Skins mit anderen Spielern tauschen',
        'CS2 P2P Skin Tausch',
        'CS2 Handelsseite',
        'Counter Strike Skins tauschen',
        'CSGO Skins tauschen',
        'Skins traden CS2',
        'CS2 Skins tauschen ohne Steam',
        'CS2 Skin Marktplatz',
        'CS2 Skin verkaufen',
        'CS2 Skin kaufen',
        'CS2 Messer tauschen',
        'CS2 Knife Trade',
        'CS2 Gloves tauschen',
        'CS2 AK47 tauschen',
        'CS2 AWP tauschen',
        'CS2 Skin Wert',
        'CS2 Trading ohne Gebühren 2026',
        'CS2 Skin Tauschbörse',
        'CS2 Skins traden 2026',
        // Englisch – High Volume
        'CS2 skin trading',
        'trade CS2 skins',
        'CS2 skin swap',
        'CS2 P2P trading',
        'best CS2 trading site 2026',
        'CS2 skin trade no fee',
        'CS2 trade without steam tax',
        'CS2 skin marketplace',
        'free CS2 skin trading',
        'CS2 skin exchange',
        'CSGO skin trading',
        'trade csgo skins',
        'CS2 knife trade',
        'CS2 skin trade site',
        'CS2 peer to peer trading',
        'CS2 skins no bot',
        'CS2 skin trading platform',
        'CS2 inventory trade',
        'CS2 skin trade no commission',
        'CS2 trading site no fees',
        'best P2P CS2 marketplace',
        'CS2 skin swap site',
        'counter strike 2 skin trade',
        'CS2 skin trade 2026',
        'CS2 trading alternative steam market',
    ].join(', '),
    openGraph: {
        title: 'SkinSwipe – CS2 Skins tauschen wie Tinder | 0% Gebühren',
        description: 'Swipen, matchen, traden. Tausche CS2 Skins direkt mit echten Spielern – kostenlos, ohne Steam Tax, ohne Bots.',
        url: 'https://cs2skintrading.vercel.app',
        siteName: 'SkinSwipe',
        locale: 'de_DE',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SkinSwipe – CS2 Skins tauschen ohne Gebühren',
        description: 'Das erste Tinder für CS2 Skins. Swipen, matchen, traden – P2P, kostenlos, kein Steam Tax.',
    },
    alternates: {
        canonical: 'https://cs2skintrading.vercel.app',
    },
    robots: {
        index: true,
        follow: true,
    }
}


const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bebas',
})

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm',
})

export default async function RootLayout({children}) {
    return (
        <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
        <body style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: '#0a0a0f',
            color: '#f0ede8'
        }}>
        <I18nProvider>
            <SpeedInsights/>
            <Analytics/>
            <Navbar/>
            <main className="flex-1">{children}</main>
            <Footer/>
        </I18nProvider>
        </body>
        </html>
    )
}