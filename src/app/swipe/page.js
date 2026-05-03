'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { api } from "../lib/api"
import AuthGuard from "../components/AuthGuard"
import Image from "next/image";

function wearColor(wear) {
    const map = { 'Factory New': '#4ade80', 'Minimal Wear': '#86efac', 'Field-Tested': '#fbbf24', 'Well-Worn': '#f97316', 'Battle-Scarred': '#ef4444' }
    return map[wear] || '#888'
}

function MatchOverlay({ onClose, otherUser }) {
    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-200 gap-5">
            <div className="text-7xl animate-bounce">🎉</div>
            <h2 className="font-bebas text-5xl text-yellow-400 tracking-[0.15em]">IT&#39;S A MATCH</h2>
            <p className="text-[#6b6865] text-center leading-relaxed text-sm">
                Ihr wollt beide tauschen!<br />
                Schreib {otherUser?.username || 'dem anderen'} auf Steam an.
            </p>
            <div className="flex gap-3 mt-2">
                {otherUser?.steamId && (
                    <a href={`https://steamcommunity.com/profiles/${otherUser.steamId}`} target="_blank" rel="noopener noreferrer"
                       className="bg-yellow-400 hover:bg-yellow-300 text-black font-bebas text-lg tracking-wider px-6 py-3 rounded-lg transition-all">
                        AUF STEAM ÖFFNEN
                    </a>
                )}
                <button onClick={onClose} className="bg-transparent border border-white/8 hover:border-white/20 text-[#6b6865] hover:text-[#f0ede8] px-6 py-3 rounded-lg text-sm cursor-pointer transition-all">
                    Weiter swipen
                </button>
            </div>
        </div>
    )
}

function SwipeCard({ listing, onLike, onDislike, disabled }) {
    const [dragX, setDragX] = useState(0)
    const [dragging, setDragging] = useState(false)
    const startX = useRef(null)

    function handleMouseDown(e) { startX.current = e.clientX; setDragging(true) }
    function handleMouseMove(e) { if (!dragging || startX.current === null) return; setDragX(e.clientX - startX.current) }
    function handleMouseUp() {
        if (!dragging) return
        setDragging(false)
        if (dragX > 80) onLike()
        else if (dragX < -80) onDislike()
        else setDragX(0)
        startX.current = null
    }

    const rotation = dragX * 0.08
    const likeOpacity = Math.max(0, Math.min(1, dragX / 80))
    const nopeOpacity = Math.max(0, Math.min(1, -dragX / 80))

    return (
        <div
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            style={{ transform: `translateX(${dragX}px) rotate(${rotation}deg)`, transition: dragging ? 'none' : 'transform 0.3s ease', boxShadow: dragX > 0 ? `0 8px 40px rgba(34,197,94,${likeOpacity * 0.35})` : dragX < 0 ? `0 8px 40px rgba(239,68,68,${nopeOpacity * 0.35})` : '0 20px 60px rgba(0,0,0,0.5)' }}
            className="absolute w-full bg-[#0f1117] border border-white/8 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
            {/* Labels */}
            <div style={{ opacity: likeOpacity, transform: 'rotate(-12deg)' }} className="absolute top-5 left-5 border-2 border-green-400 text-green-400 font-bebas text-xl px-3 py-0.5 rounded tracking-widest z-10">TRADE</div>
            <div style={{ opacity: nopeOpacity, transform: 'rotate(12deg)' }} className="absolute top-5 right-5 border-2 border-red-400 text-red-400 font-bebas text-xl px-3 py-0.5 rounded tracking-widest z-10">NOPE</div>

            {/* Image */}
            <div className="bg-linear-to-b from-[#0a0a14] to-[#101020] p-8 flex justify-center items-center h-55">
                {listing.iconUrl
                    ? <Image src={listing.iconUrl} alt={listing.marketHashName} draggable={false} className="max-h-40 max-w-full object-contain" />
                    : <span className="text-6xl">🔫</span>
                }
            </div>

            {/* Info */}
            <div className="p-5">
                <h3 className="font-bebas text-2xl text-[#f0ede8] leading-tight mb-3">{listing.marketHashName}</h3>
                <div className="flex justify-between items-center mb-4">
                    {listing.wear && (
                        <span style={{ color: wearColor(listing.wear), background: `${wearColor(listing.wear)}18`, border: `1px solid ${wearColor(listing.wear)}44` }}
                              className="text-xs px-3 py-1 rounded-full">
                            {listing.wear}
                        </span>
                    )}
                    <span className="font-bebas text-2xl text-yellow-400">€{listing.price?.toFixed(2)}</span>
                </div>
                {listing.userId && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/6">
                        {listing.userId.avatar && <Image src={listing.userId.avatar} alt="" className="w-5 h-5 rounded-full" />}
                        <span className="text-xs text-[#4a4845]">{listing.userId.username}</span>
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="px-5 pb-5 flex gap-3">
                <button onClick={onDislike} disabled={disabled}
                        className="flex-1 py-3.5 bg-transparent border border-white/8 hover:bg-red-500/10 hover:border-red-500/40 rounded-xl text-red-400 text-xl cursor-pointer transition-all disabled:opacity-50">✕</button>
                <button onClick={onLike} disabled={disabled}
                        className="flex-1 py-3.5 bg-transparent border border-white/8 hover:bg-green-500/10 hover:border-green-500/40 rounded-xl text-green-400 text-xl cursor-pointer transition-all disabled:opacity-50">♥</button>
            </div>
        </div>
    )
}

export default function SwipePage() {
    const [feed, setFeed] = useState([])
    const [index, setIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState(null)
    const [match, setMatch] = useState(null)

    useEffect(() => {
        api.getFeed().then(setFeed).catch(err => setError(err.message)).finally(() => setLoading(false))
    }, [])

    async function handleSwipe(action) {
        const current = feed[index]
        if (!current || actionLoading) return
        setActionLoading(true)
        try {
            const result = await api.swipe(current.id, action)
            if (result.match) setMatch({ otherUser: current.userId })
            setIndex(prev => prev + 1)
        } catch (err) { console.error(err) }
        finally { setActionLoading(false) }
    }

    if (loading) return (
        <div className="text-center py-20 text-[#4a4845]">
            <div className="text-4xl mb-4">⏳</div>Feed wird geladen...
        </div>
    )

    if (error?.includes('erst einen Skin')) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="font-bebas text-3xl tracking-wide text-[#f0ede8] mb-3">Noch kein Skin eingestellt</h2>
            <p className="text-[#4a4845] text-sm mb-6">Du musst erst einen Skin anbieten, bevor du swipen kannst.</p>
            <Link href="/listings" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bebas text-lg tracking-wider px-8 py-3 rounded-lg transition-all">
                SKIN EINSTELLEN
            </Link>
        </div>
    )

    if (error) return <div className="text-center py-16 text-red-400">Fehler: {error}</div>

    if (feed.length === 0 || index >= feed.length) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="font-bebas text-3xl tracking-wide text-[#f0ede8] mb-3">Alle geswiped!</h2>
            <p className="text-[#4a4845] text-sm">Momentan keine weiteren Skins. Schau später wieder vorbei.</p>
        </div>
    )

    return (
        <AuthGuard>
            <div className="max-w-sm mx-auto px-5 py-10">
                <div className="flex justify-between items-baseline mb-6">
                    <div>
                        <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#3a3835] mb-1">Discover</p>
                        <h1 className="font-bebas text-5xl tracking-wide text-[#f0ede8]">Entdecken</h1>
                    </div>
                    <span className="text-[#3a3835] text-sm">{index + 1} / {feed.length}</span>
                </div>

                <div className="relative h-130 mb-4">
                    {feed[index + 1] && (
                        <div className="absolute w-full scale-[0.96] translate-y-3 opacity-40 pointer-events-none">
                            <div className="bg-[#0f1117] border border-white/6 rounded-2xl h-120" />
                        </div>
                    )}
                    <SwipeCard listing={feed[index]} onLike={() => handleSwipe('like')} onDislike={() => handleSwipe('dislike')} disabled={actionLoading} />
                </div>

                <p className="text-center text-[#3a3835] text-xs">← ziehen zum Ablehnen · zum Annehmen ziehen →</p>

                {match && <MatchOverlay otherUser={match.otherUser} onClose={() => setMatch(null)} />}
            </div>
        </AuthGuard>
    )
}