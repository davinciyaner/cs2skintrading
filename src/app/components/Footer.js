'use client'
import Link from 'next/link'
import {useI18n} from "@/i18n/request";


export default function Footer() {
    const {t} = useI18n()

    return (
        <footer className="border-t border-white/6 bg-[#080a0f]">
            <div
                className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

                <span className="font-bebas text-lg tracking-widest uppercase text-yellow-400">
                    Skin<span className="text-[#f0ede8]">Swipe</span>
                </span>

                <div className="flex items-center gap-6 text-xs text-[#4a4845]">
                    <Link href="/impressum"
                          className="hover:text-[#f0ede8] transition-colors">{t('footer.impressum')}</Link>
                    <Link href="/datenschutz"
                          className="hover:text-[#f0ede8] transition-colors">{t('footer.datenschutz')}</Link>
                    <Link href="/faq" className="hover:text-[#f0ede8] transition-colors">{t('footer.faq')}</Link>

                    <a href="https://store.steampowered.com/subscriber_agreement/"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="hover:text-[#f0ede8] transition-colors"
                    >
                        {t('footer.steam_agb')}
                    </a>
                </div>

                <p className="text-xs text-[#3a3835]">{t('footer.copy')}</p>
            </div>
        </footer>
    )
}