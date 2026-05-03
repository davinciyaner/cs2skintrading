'use client'
import {useState, useEffect} from 'react'
import {api} from "../lib/api";
import AuthGuard from "../components/AuthGuard";


function MatchCard({match, currentUserId}) {
    // Herausfinden wer der andere User ist
    const isUserA = match.userAId === currentUserId
    const otherUser = isUserA ? match.userB : match.userA
    const mySkin = isUserA ? match.listingA : match.listingB
    const theirSkin = isUserA ? match.listingB : match.listingA

    return (
        <AuthGuard>
            <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '12px'
            }}>
                {/* Header */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    {otherUser?.avatar && (
                        <img
                            src={otherUser.avatar}
                            alt={otherUser.username}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                border: '2px solid var(--accent)'
                            }}
                        />
                    )}
                    <div>
                        <div style={{fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '16px'}}>
                            {otherUser?.username}
                        </div>
                        <div style={{fontSize: '11px', color: 'var(--muted)'}}>Match gefunden</div>
                    </div>
                    <div style={{
                        marginLeft: 'auto',
                        background: 'rgba(240,180,41,0.15)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 600
                    }}>
                        MATCH
                    </div>
                </div>

                {/* Skins */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)'}}>
                    {/* Mein Skin */}
                    <div style={{background: 'var(--bg2)', padding: '12px', textAlign: 'center'}}>
                        <div style={{
                            fontSize: '10px',
                            color: 'var(--muted)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Dein Skin
                        </div>
                        {mySkin?.iconUrl && (
                            <img src={mySkin.iconUrl} alt={mySkin.marketHashName}
                                 style={{maxHeight: '60px', objectFit: 'contain', marginBottom: '6px'}}/>
                        )}
                        <div style={{fontSize: '11px', color: 'var(--text)', lineHeight: 1.3}}>
                            {mySkin?.marketHashName}
                        </div>
                        <div style={{fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px'}}>
                            €{mySkin?.price?.toFixed(2)}
                        </div>
                    </div>

                    {/* Ihr Skin */}
                    <div style={{background: 'var(--bg2)', padding: '12px', textAlign: 'center'}}>
                        <div style={{
                            fontSize: '10px',
                            color: 'var(--muted)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Ihr Skin
                        </div>
                        {theirSkin?.iconUrl && (
                            <img src={theirSkin.iconUrl} alt={theirSkin.marketHashName}
                                 style={{maxHeight: '60px', objectFit: 'contain', marginBottom: '6px'}}/>
                        )}
                        <div style={{fontSize: '11px', color: 'var(--text)', lineHeight: 1.3}}>
                            {theirSkin?.marketHashName}
                        </div>
                        <div style={{fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginTop: '4px'}}>
                            €{theirSkin?.price?.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Steam Link */}
                <div style={{padding: '12px 16px'}}>
                    <a
                        href={`https://steamcommunity.com/profiles/${otherUser?.steamId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px',
                            background: 'var(--accent)',
                            color: '#000',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textDecoration: 'none'
                        }}
                    >
                        AUF STEAM ANSCHREIBEN
                    </a>
                </div>
            </div>
        </AuthGuard>
    )
}

export default function MatchesPage() {
    const [matches, setMatches] = useState([])
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const me = await api.getMe()
                setUser(me)
                const data = await api.getMatches()
                setMatches(data)
            } catch (err) {
                // nicht eingeloggt – kein redirect, einfach leere State
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    if (loading) return (
        <div style={{textAlign: 'center', padding: '60px 0', color: 'var(--muted)'}}>
            <div style={{fontSize: '32px', marginBottom: '12px'}}>⏳</div>
            Lädt...
        </div>
    )

    if (!user) return (
        <div style={{textAlign: 'center', padding: '60px 0'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🔒</div>
            <h2 style={{marginBottom: '12px', fontSize: '24px'}}>Nicht eingeloggt</h2>
            <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/auth/steam`}
                style={{
                    display: 'inline-block',
                    background: 'var(--accent)',
                    color: '#000',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px'
                }}
            >
                MIT STEAM EINLOGGEN
            </a>
        </div>
    )

    return (
        <div>
            <div style={{marginBottom: '24px'}}>
                <h1 style={{fontSize: '28px', marginBottom: '6px'}}>Matches</h1>
                <p style={{color: 'var(--muted)', fontSize: '14px'}}>
                    {matches.length > 0
                        ? `${matches.length} Match${matches.length > 1 ? 'es' : ''} gefunden`
                        : 'Noch keine Matches'}
                </p>
            </div>

            {matches.length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 0', color: 'var(--muted)'}}>
                    <div style={{fontSize: '48px', marginBottom: '16px'}}>🎯</div>
                    <p>Noch keine Matches.<br/>Geh swipen!</p>
                </div>
            ) : (
                matches.map(match => (
                    <MatchCard key={match.id} match={match} currentUserId={user.id}/>
                ))
            )}
        </div>
    )
}