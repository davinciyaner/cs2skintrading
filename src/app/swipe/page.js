'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { api } from '../lib/api'
import AuthGuard from '../components/AuthGuard'

function wearColor(wear) {
    const map = {
        'Factory New': '#4ade80',
        'Minimal Wear': '#86efac',
        'Field-Tested': '#fbbf24',
        'Well-Worn': '#f97316',
        'Battle-Scarred': '#ef4444'
    }
    return map[wear] || '#6b6865'
}

function MatchOverlay({ onClose, otherUser }) {
    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[200] gap-5">
            <div className="text-[80px] animate-bounce">🎉</div>
            <h2 className="font-bebas text-5xl text-yellow-400 tracking-widest">IT'S A MATCH</h2>
            <p className="text-[#4a4845] text-sm text-center leading-relaxed">
                Ihr wollt beide tauschen!<br />
                Schreib {otherUser?.username || 'dem anderen'} auf Steam an.
            </p>
            <div className="flex gap-3 mt-2">
                {otherUser?.steamId && (
                    <a
                        href={`https://steamcommunity.com/profiles/${otherUser.steamId}`}
                        target="_blank" rel="noopener noreferrer"
                        className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg font-bebas text-lg tracking-widest transition-all"
                    >
                        Auf Steam öffnen
                    </a>
                )}
                <button onClick={onClose}
                        className="border border-white/[0.08] text-[#6b6865] hover:text-[#f0ede8] hover:border-white/20 px-6 py-3 rounded-lg text-sm transition-all">
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ transform: `translateX(${dragX}px) rotate(${rotation}deg)`, transition: dragging ? 'none' : 'transform 0.3s ease', boxShadow: dragX > 0 ? `0 8px 40px rgba(74,222,128,${likeOpacity * 0.3})` : dragX < 0 ? `0 8px 40px rgba(239,68,68,${nopeOpacity * 0.3})` : '0 20px 60px rgba(0,0,0,0.5)' }}
            className="absolute w-full bg-[#0e1117] border border-white/[0.08] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
            {/* TRADE label */}
            <div style={{ opacity: likeOpacity }} className="absolute top-5 left-5 border-2 border-green-400 text-green-400 font-bebas text-xl px-3 py-0.5 rounded -rotate-12 tracking-widest z-10">
                TRADE
            </div>
            {/* NOPE label */}
            <div style={{ opacity: nopeOpacity }} className="absolute top-5 right-5 border-2 border-red-400 text-red-400 font-bebas text-xl px-3 py-0.5 rounded rotate-12 tracking-widest z-10">
                NOPE
            </div>

            {/* Image */}
            <div className="bg-gradient-to-br from-[#0a0a12] to-[#101020] p-8 flex justify-center items-center h-[220px]">
                {listing.iconUrl
                    ? <img src={listing.iconUrl} alt={listing.marketHashName} draggable={false} className="max-h-[160px] max-w-full object-contain" />
                    : <span className="text-6xl">🔫</span>
                }
            </div>

            {/* Info */}
            <div className="p-5">
                <h3 className="font-bebas text-2xl text-[#f0ede8] leading-tight mb-3">{listing.marketHashName}</h3>
                <div className="flex justify-between items-center mb-4">
                    {listing.wear && (
                        <span style={{ color: wearColor(listing.wear), background: `${wearColor(listing.wear)}18`, borderColor: `${wearColor(listing.wear)}44` }}
                              className="text-xs px-3 py-1 rounded-full border">
                            {listing.wear}
                        </span>
                    )}
                    <span className="font-bebas text-2xl text-yellow-400">€{listing.price?.toFixed(2)}</span>
                </div>

                {listing.userId && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                        {listing.userId.avatar && <img src={listing.userId.avatar} alt="" className="w-5 h-5 rounded-full" />}
                        <span className="text-xs text-[#4a4845]">{listing.userId.username}</span>
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="px-5 pb-5 flex gap-3">
                <button onClick={onDislike} disabled={disabled}
                        className="flex-1 py-3.5 border border-white/[0.08] rounded-xl text-red-400 text-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all disabled:opacity-40">
                    ✕
                </button>
                <button onClick={onLike} disabled={disabled}
                        className="flex-1 py-3.5 border border-white/[0.08] rounded-xl text-green-400 text-xl hover:bg-green-500/10 hover:border-green-500/30 transition-all disabled:opacity-40">
                    ♥
                </button>
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
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-sm">Feed wird geladen...</p>
        </div>
    )

    if (error?.includes('erst einen Skin')) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="font-bebas text-4xl text-[#f0ede8] mb-2">Noch kein Skin eingestellt</h2>
            <p className="text-[#4a4845] text-sm mb-6">Du musst erst einen Skin anbieten, bevor du swipen kannst.</p>
            <Link href="/listings" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black px-7 py-3 rounded-lg font-bebas text-lg tracking-widest transition-all">
                Skin einstellen
            </Link>
        </div>
    )

    if (error) return (
        <div className="text-center py-16 text-red-400">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-sm">Fehler: {error}</p>
        </div>
    )

    if (feed.length === 0 || index >= feed.length) return (
        <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="font-bebas text-4xl text-[#f0ede8] mb-2">Alle geswiped!</h2>
            <p className="text-[#4a4845] text-sm">Momentan keine weiteren Skins. Schau später wieder vorbei.</p>
        </div>
    )

    return (
        <AuthGuard>
            <div className="max-w-sm mx-auto px-5 py-10">
                {/* Header */}
                <div className="flex justify-between items-baseline mb-6">
                    <div>
                        <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#3a3835] mb-1">Entdecken</p>
                        <h1 className="font-bebas text-5xl tracking-wide text-[#f0ede8]">Swipen</h1>
                    </div>
                    <span className="text-xs text-[#3a3835]">{index + 1} / {feed.length}</span>
                </div>

                {/* Card stack */}
                <div className="relative h-[500px] mb-5">
                    {feed[index + 1] && (
                        <div className="absolute w-full scale-[0.96] translate-y-3 opacity-40 pointer-events-none">
                            <div className="bg-[#0e1117] border border-white/[0.07] rounded-2xl h-[460px]" />
                        </div>
                    )}
                    <SwipeCard listing={feed[index]} onLike={() => handleSwipe('like')} onDislike={() => handleSwipe('dislike')} disabled={actionLoading} />
                </div>

                <p className="text-center text-[#3a3835] text-xs">← ablehnen · annehmen →</p>

                {match && <MatchOverlay otherUser={match.otherUser} onClose={() => setMatch(null)} />}
            </div>
        </AuthGuard>
    )
}