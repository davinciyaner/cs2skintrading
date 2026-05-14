'use client'
import {useState, useEffect} from 'react'
import Link from 'next/link'
import {usePathname, useRouter} from 'next/navigation'
import {api} from '../lib/api'
import Image from "next/image";
import {useI18n} from "../../i18n/request";

export default function Navbar() {
    const [user, setUser] = useState(null)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        api.getMe().then(setUser).catch(() => setUser(null))
    }, [])

    const links = [
        {href: '/swipe', label: 'Swipen'},
        {href: '/listings', label: 'Meine Skins'},
        {href: '/matches', label: 'Matches'},
    ]

    const { switchLocale, locale } = useI18n()

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between h-15 px-6 bg-[rgba(8,10,15,0.95)] backdrop-blur-md border-b border-white/6">

            {/* Logo */}
            <Link href="/public"
                  className="font-bebas text-[22px] tracking-widest uppercase text-yellow-400 hover:text-yellow-300 transition-colors">
                Skin<span className="text-[#f0ede8]">Swipe</span>
            </Link>

            {/* Nav Links */}
            {user && (
                <div className="flex gap-1">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                                pathname === link.href
                                    ? 'text-yellow-400 bg-yellow-400/10'
                                    : 'text-[#6b6865] hover:text-[#f0ede8] hover:bg-white/5'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Language Switcher */}
                <div className="flex gap-1 text-xs font-medium">
                    <button onClick={() => switchLocale('en')} className={locale === 'en' ? 'text-yellow-400' : 'text-[#6b6865]'}>EN</button>
                    <span className="text-white/20">|</span>
                    <button onClick={() => switchLocale('de')} className={locale === 'de' ? 'text-yellow-400' : 'text-[#6b6865]'}>DE</button>
                </div>

                {/* User or Login */}
                {user ? (
                    <>
                    <Image
                        src={user.avatar}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="rounded-full border border-white/10"
                    />
                    <span className="text-xs text-[#6b6865] hidden sm:block">{user.username}</span>

                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`}
                    className="text-xs text-[#6b6865] hover:text-[#f0ede8] px-3 py-1.5 border border-white/10 hover:border-white/20 rounded-md transition-all duration-150"
                    >
                    Logout
                    </a>
                    </>
                    ) : (

                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/steam`}
                    className="font-bebas text-sm tracking-widest uppercase bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-1.5 rounded-md transition-all duration-150 hover:-translate-y-px"
                    >
                    Steam Login
                    </a>
                    )}
            </div>
        </nav>
    )
}