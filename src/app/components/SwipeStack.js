'use client'
import { useState } from 'react'
import { api } from '../../lib/api'

// Einzelne Skin-Karte
function SkinCard({ listing, onLike, onDislike, isTop }) {
    const skin = listing

    return (
        <div style={{
            position: 'absolute',
            width: '100%',
            background: '#1a1a2e',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid #2a2a4a',
            cursor: isTop ? 'grab' : 'default',
            transition: 'transform 0.2s ease'
        }}>
            {/* Skin Bild */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
                padding: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '240px'
            }}>
                {skin.iconUrl ? (
                    <img
                        src={skin.iconUrl}
                        alt={skin.marketHashName}
                        style={{ maxWidth: '280px', maxHeight: '200px', objectFit: 'contain' }}
                    />
                ) : (
                    <div style={{ color: '#444', fontSize: '48px' }}>🔫</div>
                )}
            </div>

            {/* Skin Info */}
            <div style={{ padding: '20px' }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#e0e0ff',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    {skin.marketHashName}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
              background: '#2a2a4a',
              color: '#8888cc',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '13px'
          }}>
            {skin.wear || 'Unbekannt'}
          </span>

                    <span style={{
                        color: '#4ade80',
                        fontSize: '20px',
                        fontWeight: '700'
                    }}>
            ${skin.price?.toFixed(2)}
          </span>
                </div>

                {/* Anbieter */}
                {skin.userId && (
                    <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {skin.userId.avatar && (
                            <img
                                src={skin.userId.avatar}
                                alt={skin.userId.username}
                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                            />
                        )}
                        <span style={{ color: '#666', fontSize: '13px' }}>
              {skin.userId.username}
            </span>
                    </div>
                )}
            </div>

            {/* Buttons nur auf oberster Karte */}
            {isTop && (
                <div style={{
                    padding: '0 20px 20px',
                    display: 'flex',
                    gap: '16px'
                }}>
                    <button
                        onClick={onDislike}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'transparent',
                            border: '2px solid #ef4444',
                            borderRadius: '12px',
                            color: '#ef4444',
                            fontSize: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.target.style.background = '#ef444422'}
                        onMouseOut={e => e.target.style.background = 'transparent'}
                    >
                        ✕
                    </button>
                    <button
                        onClick={onLike}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'transparent',
                            border: '2px solid #4ade80',
                            borderRadius: '12px',
                            color: '#4ade80',
                            fontSize: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.target.style.background = '#4ade8022'}
                        onMouseOut={e => e.target.style.background = 'transparent'}
                    >
                        ♥
                    </button>
                </div>
            )}
        </div>
    )
}

// Match-Overlay
function MatchOverlay({ match, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            gap: '24px'
        }}>
            <div style={{ fontSize: '64px' }}>🎉</div>
            <h2 style={{ color: '#4ade80', fontSize: '32px', margin: 0 }}>It's a Match!</h2>
            <p style={{ color: '#aaa', textAlign: 'center', maxWidth: '300px' }}>
                Ihr wollt beide tauschen. Nehmt auf Steam Kontakt auf!
            </p>
            <button
                onClick={onClose}
                style={{
                    background: '#4ade80',
                    color: '#000',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}
            >
                Weiter swipen
            </button>
        </div>
    )
}

// Haupt SwipeStack Komponente
export default function SwipeStack({ initialFeed }) {
    const [feed, setFeed] = useState(initialFeed || [])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [matchData, setMatchData] = useState(null)
    const [loading, setLoading] = useState(false)

    const currentListing = feed[currentIndex]

    async function handleSwipe(action) {
        if (!currentListing || loading) return
        setLoading(true)

        try {
            const result = await api.swipe(currentListing._id, action)

            if (result.match) {
                setMatchData(result)
            }

            setCurrentIndex(prev => prev + 1)
        } catch (err) {
            console.error('Swipe Fehler:', err)
        } finally {
            setLoading(false)
        }
    }

    if (feed.length === 0 || currentIndex >= feed.length) {
        return (
            <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '60px 20px'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔫</div>
                <h3 style={{ color: '#aaa' }}>Keine weiteren Skins</h3>
                <p>Komm später wieder oder füge mehr Skins hinzu.</p>
            </div>
        )
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Stack: aktuelle + nächste Karte andeuten */}
            <div style={{ position: 'relative', height: '480px' }}>
                {/* Nächste Karte (dahinter) */}
                {feed[currentIndex + 1] && (
                    <div style={{ transform: 'scale(0.95) translateY(10px)', opacity: 0.6 }}>
                        <SkinCard listing={feed[currentIndex + 1]} isTop={false} />
                    </div>
                )}

                {/* Aktuelle Karte */}
                <SkinCard
                    listing={currentListing}
                    isTop={true}
                    onLike={() => handleSwipe('like')}
                    onDislike={() => handleSwipe('dislike')}
                />
            </div>

            {/* Fortschritt */}
            <p style={{ textAlign: 'center', color: '#555', marginTop: '16px', fontSize: '13px' }}>
                {currentIndex + 1} / {feed.length}
            </p>

            {/* Match Overlay */}
            {matchData && (
                <MatchOverlay
                    match={matchData}
                    onClose={() => setMatchData(null)}
                />
            )}
        </div>
    )
}