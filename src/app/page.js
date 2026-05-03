'use client'

import {useEffect, useRef, useState} from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const steps = [
    {icon: '🔑', num: '01', title: 'Steam Login', desc: 'Einloggen mit deinem Steam Account — ein Klick, fertig.'},
    {
        icon: '🃏',
        num: '02',
        title: 'Skins einstellen',
        desc: 'Wähle welche Skins aus deinem Inventar du tauschen willst.'
    },
    {icon: '👆', num: '03', title: 'Swipen', desc: 'Rechts für Skins die du willst. Links für die du nicht willst.'},
    {icon: '🤝', num: '04', title: 'Match & Trade', desc: 'Gegenseitiges Match — Trade direkt über Steam abwickeln.'},
]

const badges = ['Kostenlos', 'Kein Steam Tax', 'Keine Bots', 'P2P Trading']

const CARDS = [
    {emoji: '🔫', name: 'AK-47 | Redline', wear: 'Field-Tested', color: 'from-red-950/60 to-zinc-900'},
    {emoji: '🔪', name: 'Karambit | Fade', wear: 'Factory New', color: 'from-purple-950/60 to-zinc-900'},
    {emoji: '🎯', name: 'AWP | Dragon Lore', wear: 'Minimal Wear', color: 'from-yellow-950/60 to-zinc-900'},
]

const SEQUENCE = ['skip', 'trade', 'match']

export default function Home() {
    const heroRef = useRef(null)
    const [cardIndex, setCardIndex] = useState(0)
    const [action, setAction] = useState(null) // 'skip' | 'trade' | 'match'
    const [seqIndex, setSeqIndex] = useState(0)
    const [showMatch, setShowMatch] = useState(false)

    useEffect(() => {
        const el = heroRef.current
        if (!el) return
        el.style.opacity = '0'
        el.style.transform = 'translateY(20px)'
        requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
        })
    }, [])

    // Auto-animate the card demo
    useEffect(() => {
        const timer = setTimeout(() => {
            const act = SEQUENCE[seqIndex]
            setAction(act)

            if (act === 'match') {
                setTimeout(() => setShowMatch(true), 400)
                setTimeout(() => {
                    setShowMatch(false)
                    setAction(null)
                    setCardIndex(i => (i + 1) % CARDS.length)
                    setSeqIndex(s => (s + 1) % SEQUENCE.length)
                }, 2000)
            } else {
                setTimeout(() => {
                    setAction(null)
                    setCardIndex(i => (i + 1) % CARDS.length)
                    setSeqIndex(s => (s + 1) % SEQUENCE.length)
                }, 900)
            }
        }, 2200)

        return () => clearTimeout(timer)
    }, [cardIndex, seqIndex])

    const card = CARDS[cardIndex]
    const nextCard = CARDS[(cardIndex + 1) % CARDS.length]

    const cardTransform = action === 'skip'
        ? '-translate-x-48 -rotate-12 opacity-0'
        : action === 'trade'
            ? 'translate-x-48 rotate-12 opacity-0'
            : action === 'match'
                ? 'scale-105 opacity-0'
                : 'translate-x-0 rotate-0 opacity-100'

    return (
        <div className="font-dm min-h-screen bg-[#080a0f] text-[#f0ede8] overflow-x-hidden">

            {/* Noise overlay */}
            <div className="noise-bg fixed inset-0 pointer-events-none z-0 opacity-[0.03]"/>

            {/* Glow orbs */}
            <div
                className="fixed -top-50 -right-37.5 w-125 h-125 rounded-full blur-[130px] bg-yellow-500/10 pointer-events-none z-0"/>
            <div
                className="fixed bottom-12.5 -left-25 w-87.5 h-87.5 rounded-full blur-[100px] bg-red-600/6 pointer-events-none z-0"/>

            <div ref={heroRef} className="relative z-10">

                {/* ── HERO ── */}
                <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-12 lg:pt-24 lg:pb-20">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                        {/* Left: Text */}
                        <div>
                            {/* Eyebrow */}
                            <div
                                className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-4 py-1.5 text-yellow-400 text-xs font-medium tracking-widest uppercase mb-8">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"/>
                                Beta — Jetzt kostenlos testen
                            </div>

                            <h1 className="font-bebas text-[clamp(72px,12vw,100px)] leading-[0.9] tracking-wide mb-6">
                                Skins<br/>
                                <span className="text-yellow-400">Swipen.</span><br/>
                                Skins Traden.
                            </h1>

                            <p className="text-[#8a8880] text-base sm:text-lg leading-relaxed font-light mb-8 max-w-md">
                                Das erste Tinder für CS2 Skins. Swipen, matchen, traden —
                                direkt mit echten Spielern. Kein Steam Tax. Keine Bots. Keine Gebühren.
                            </p>

                            <a
                                href={`${API_URL}/auth/steam`}
                                className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-7 py-3.5 rounded-md text-sm tracking-wide transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(255,180,0,0.3)]"
                            >
                                <svg className="w-4 h-4 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273.016c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
                                </svg>
                                Mit Steam einloggen
                            </a>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-8">
                                {badges.map((b) => (
                                    <span key={b}
                                          className="flex items-center gap-1.5 px-3 py-1 border border-white/7 rounded text-xs text-[#5a5855] tracking-wide">
                                            <span className="text-yellow-400 text-[8px]">✦</span>
                                        {b}
                                        </span>
                                ))}
                            </div>
                        </div>

                        {/* Right: Card demo */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative w-55 h-75 sm:w-60 sm:h-80">

                                {/* Back card */}
                                <div
                                    className={`absolute inset-0 bg-linear-to-b ${nextCard.color} border border-white/8 rounded-2xl flex flex-col items-center justify-center gap-3 scale-95 opacity-50 translate-y-3`}>
                                    <span className="text-5xl">{nextCard.emoji}</span>
                                    <div className="text-center">
                                        <p className="text-xs text-white/60 font-medium">{nextCard.name}</p>
                                        <p className="text-xs text-white/30">{nextCard.wear}</p>
                                    </div>
                                </div>

                                {/* Front card */}
                                <div
                                    className={`card-transition absolute inset-0 bg-linear-to-b ${card.color} border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-[0_24px_60px_rgba(0,0,0,0.6)] ${cardTransform}`}>

                                    {/* Skip label */}
                                    <div
                                        className={`absolute top-4 left-4 border-2 border-red-400 text-red-400 font-bebas text-xl px-2 py-0.5 rounded rotate-[-15deg] tracking-widest transition-opacity duration-200 ${action === 'skip' ? 'opacity-100' : 'opacity-0'}`}>
                                        SKIP
                                    </div>

                                    {/* Trade label */}
                                    <div
                                        className={`absolute top-4 right-4 border-2 border-green-400 text-green-400 font-bebas text-xl px-2 py-0.5 rounded rotate-15 tracking-widest transition-opacity duration-200 ${action === 'trade' ? 'opacity-100' : 'opacity-0'}`}>
                                        TRADE
                                    </div>

                                    <span className="text-6xl">{card.emoji}</span>
                                    <div className="text-center px-4">
                                        <p className="text-sm text-white/80 font-semibold">{card.name}</p>
                                        <p className="text-xs text-white/40 mt-1">{card.wear}</p>
                                    </div>

                                    {/* Swipe hint dots */}
                                    <div className="flex gap-1.5 mt-2">
                                        {CARDS.map((_, i) => (
                                            <span key={i}
                                                  className={`block w-1.5 h-1.5 rounded-full transition-all ${i === cardIndex ? 'bg-yellow-400 w-4' : 'bg-white/15'}`}/>
                                        ))}
                                    </div>
                                </div>

                                {/* Match overlay */}
                                {showMatch && (
                                    <div
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl z-10 animate-in fade-in duration-300">
                                        <div className="text-4xl mb-2">🤝</div>
                                        <p className="font-bebas text-2xl text-yellow-400 tracking-widest">IT'S A
                                            MATCH</p>
                                        <p className="text-xs text-white/40 mt-1">Trade über Steam abwickeln</p>
                                    </div>
                                )}
                            </div>

                            {/* Swipe indicators */}
                            <div className="flex gap-8 mt-8 text-sm font-medium">
                                <div
                                    className={`flex items-center gap-2 transition-all duration-200 ${action === 'skip' ? 'text-red-400 scale-110' : 'text-[#3a3835]'}`}>
                                    <span
                                        className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs">✕</span>
                                    Skip
                                </div>
                                <div
                                    className={`flex items-center gap-2 transition-all duration-200 ${action === 'match' ? 'text-yellow-400 scale-110' : 'text-[#3a3835]'}`}>
                                    <span
                                        className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs">🤝</span>
                                    Match
                                </div>
                                <div
                                    className={`flex items-center gap-2 transition-all duration-200 ${action === 'trade' ? 'text-green-400 scale-110' : 'text-[#3a3835]'}`}>
                                    <span
                                        className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs">✓</span>
                                    Trade
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── DIVIDER ── */}
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <div className="h-px bg-linear-to-r from-transparent via-white/6 to-transparent"/>
                </div>

                {/* ── HOW IT WORKS ── */}
                <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
                    <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#3a3835] mb-10">So
                        funktioniert's</p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden">
                        {steps.map((s) => (
                            <div key={s.num} className="bg-[#080a0f] p-6 hover:bg-white/2 transition-colors group">
                                <div className="flex items-start justify-between mb-5">
                                    <span className="text-2xl">{s.icon}</span>
                                    <span
                                        className="font-bebas text-sm text-[#2a2825] tracking-widest group-hover:text-yellow-400/30 transition-colors">{s.num}</span>
                                </div>
                                <h3 className="font-semibold text-[#e8e5e0] text-sm mb-2">{s.title}</h3>
                                <p className="text-xs text-[#4a4845] leading-relaxed font-light">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── BOTTOM CTA ── */}
                <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
                    <div
                        className="relative overflow-hidden rounded-2xl border border-yellow-400/10 bg-linear-to-br from-yellow-950/20 to-transparent p-8 sm:p-12">
                        <div
                            className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full bg-yellow-400/8 pointer-events-none"/>
                        <div className="relative">
                            <h2 className="font-bebas text-4xl sm:text-5xl mb-3 tracking-wide">
                                Bereit zu traden?
                            </h2>
                            <p className="text-[#5a5855] text-sm font-light mb-6 max-w-sm">
                                Kostenlos einloggen und sofort mit dem Swipen anfangen.
                            </p>
                            <a
                                href={`${API_URL}/auth/steam`}
                                className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-md text-sm tracking-wide transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(255,180,0,0.25)]"
                            >
                                <svg className="w-4 h-4 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273.016c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
                                </svg>
                                Jetzt kostenlos starten
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}