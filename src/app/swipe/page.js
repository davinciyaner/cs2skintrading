'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {api} from "../lib/api";

// Wear-Farbe
function wearColor(wear) {
    const map = {
        'Factory New': '#4ade80',
        'Minimal Wear': '#86efac',
        'Field-Tested': '#fbbf24',
        'Well-Worn': '#f97316',
        'Battle-Scarred': '#ef4444'
    }
    return map[wear] || '#888'
}

// Match Overlay
function MatchOverlay({ onClose, otherUser }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            gap: '20px',
            animation: 'fadeUp 0.3s ease'
        }}>
            <div style={{ fontSize: '80px', animation: 'fadeUp 0.4s ease' }}>🎉</div>
            <h2 style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '40px',
                color: 'var(--accent)',
                letterSpacing: '0.1em'
            }}>
                IT'S A MATCH
            </h2>
            <p style={{ color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
                Ihr wollt beide tauschen!<br />
                Schreib {otherUser?.username || 'dem anderen'} auf Steam an.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {otherUser?.steamId && (
                    <a
                        href={`https://steamcommunity.com/profiles/${otherUser.steamId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            background: 'var(--accent)',
                            color: '#000',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '0.05em'
                        }}
                    >
                        AUF STEAM ÖFFNEN
                    </a>
                )}
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                >
                    Weiter swipen
                </button>
            </div>
        </div>
    )
}

// Haupt-Swipe-Card
function SwipeCard({ listing, onLike, onDislike, disabled }) {
    const [dragX, setDragX] = useState(0)
    const [dragging, setDragging] = useState(false)
    const startX = useRef(null)

    function handleMouseDown(e) {
        startX.current = e.clientX
        setDragging(true)
    }

    function handleMouseMove(e) {
        if (!dragging || startX.current === null) return
        setDragX(e.clientX - startX.current)
    }

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
            style={{
                position: 'absolute',
                width: '100%',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: dragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
                transition: dragging ? 'none' : 'transform 0.3s ease',
                boxShadow: dragX > 0
                    ? `0 8px 40px rgba(34,197,94,${likeOpacity * 0.4})`
                    : dragX < 0
                        ? `0 8px 40px rgba(239,68,68,${nopeOpacity * 0.4})`
                        : 'var(--card-glow)'
            }}
        >
            {/* LIKE / NOPE Labels */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(34,197,94,0.9)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                transform: 'rotate(-12deg)',
                opacity: likeOpacity,
                zIndex: 10
            }}>TRADE</div>

            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(239,68,68,0.9)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                transform: 'rotate(12deg)',
                opacity: nopeOpacity,
                zIndex: 10
            }}>NOPE</div>

            {/* Skin Bild */}
            <div style={{
                background: 'linear-gradient(160deg, #0a0a14 0%, #101020 60%, #0a0a14 100%)',
                padding: '32px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '220px'
            }}>
                {listing.iconUrl ? (
                    <img
                        src={listing.iconUrl}
                        alt={listing.marketHashName}
                        draggable={false}
                        style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                ) : (
                    <span style={{ fontSize: '60px' }}>🔫</span>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '20px' }}>
                <h3 style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '10px',
                    lineHeight: 1.2
                }}>
                    {listing.marketHashName}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    {listing.wear && (
                        <span style={{
                            fontSize: '12px',
                            color: wearColor(listing.wear),
                            background: `${wearColor(listing.wear)}18`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            border: `1px solid ${wearColor(listing.wear)}44`
                        }}>
              {listing.wear}
            </span>
                    )}
                    <span style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'var(--accent)'
                    }}>
            €{listing.price?.toFixed(2)}
          </span>
                </div>

                {/* Anbieter */}
                {listing.userId && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border)'
                    }}>
                        {listing.userId.avatar && (
                            <img
                                src={listing.userId.avatar}
                                alt=""
                                style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                            />
                        )}
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {listing.userId.username}
            </span>
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px' }}>
                <button
                    onClick={onDislike}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        padding: '14px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        color: 'var(--red)',
                        fontSize: '22px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                    ✕
                </button>
                <button
                    onClick={onLike}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        padding: '14px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        color: 'var(--green)',
                        fontSize: '22px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
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
        api.getFeed()
            .then(data => setFeed(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    async function handleSwipe(action) {
        const current = feed[index]
        if (!current || actionLoading) return
        setActionLoading(true)

        try {
            const result = await api.swipe(current.id, action)
            if (result.match) {
                setMatch({ otherUser: current.userId })
            }
            setIndex(prev => prev + 1)
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(false)
        }
    }

    // Loading
    if (loading) return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>⏳</div>
            Feed wird geladen...
        </div>
    )

    // Kein Listing eingestellt
    if (error?.includes('erst einen Skin')) return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h2 style={{ marginBottom: '12px', fontSize: '24px' }}>Noch kein Skin eingestellt</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
                Du musst erst einen Skin anbieten, bevor du swipen kannst.
            </p>
            <Link href="/listings" style={{
                display: 'inline-block',
                background: 'var(--accent)',
                color: '#000',
                padding: '12px 28px',
                borderRadius: '8px',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                letterSpacing: '0.05em'
            }}>
                SKIN EINSTELLEN
            </Link>
        </div>
    )

    // Sonstiger Fehler
    if (error) return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--red)' }}>
            Fehler: {error}
        </div>
    )

    // Feed leer
    if (feed.length === 0 || index >= feed.length) return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ marginBottom: '12px', fontSize: '24px' }}>Alle geswiped!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                Momentan keine weiteren Skins in deiner Preisrange. Schau später wieder vorbei.
            </p>
        </div>
    )

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h1 style={{ fontSize: '28px' }}>Entdecken</h1>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
          {index + 1} / {feed.length}
        </span>
            </div>

            {/* Karten-Stack */}
            <div style={{ position: 'relative', height: '500px', marginBottom: '16px' }}>
                {/* Nächste Karte (im Hintergrund) */}
                {feed[index + 1] && (
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        transform: 'scale(0.96) translateY(12px)',
                        opacity: 0.5,
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            background: 'var(--bg2)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            height: '460px'
                        }} />
                    </div>
                )}

                {/* Aktuelle Karte */}
                <SwipeCard
                    listing={feed[index]}
                    onLike={() => handleSwipe('like')}
                    onDislike={() => handleSwipe('dislike')}
                    disabled={actionLoading}
                />
            </div>

            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                ← ziehen zum Ablehnen · zum Annehmen ziehen →
            </p>

            {/* Match Overlay */}
            {match && (
                <MatchOverlay
                    otherUser={match.otherUser}
                    onClose={() => setMatch(null)}
                />
            )}
        </div>
    )
}