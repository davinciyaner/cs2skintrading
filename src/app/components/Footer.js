import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-white/[0.06] bg-[#080a0f]">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Logo */}
                <span className="font-bebas text-lg tracking-[0.1em] uppercase text-yellow-400">
                    Skin<span className="text-[#f0ede8]">Swipe</span>
                </span>

                {/* Links */}
                <div className="flex items-center gap-6 text-xs text-[#4a4845]">
                    <Link href="/impressum" className="hover:text-[#f0ede8] transition-colors">Impressum</Link>
                    <Link href="/datenschutz" className="hover:text-[#f0ede8] transition-colors">Datenschutz</Link>
                    <Link href="/faq" className="hover:text-[#f0ede8] transition-colors">FAQ</Link>
                    <a
                        href="https://store.steampowered.com/subscriber_agreement/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#f0ede8] transition-colors"
                    >
                        Steam AGB
                    </a>
                </div>

                {/* Copy */}
                <p className="text-xs text-[#3a3835]">
                    © 2026 cs2tradeskins · Nicht mit Valve assoziiert
                </p>
            </div>
        </footer>
    )
}