'use client'
import { useState, useEffect } from 'react'
import {api} from "@/app/lib/api";

// Steam API Key Info Modal
function ApiKeyModal({ onSave, onClose }) {
    const [key, setKey] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    async function handleSave() {
        if (!key || key.length < 10) {
            setError('Bitte gib einen gültigen API Key ein')
            return
        }
        setSaving(true)
        try {
            await api.saveApiKey(key)
            onSave()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '16px'
        }}>
            <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '440px',
                width: '100%'
            }}>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '24px', marginBottom: '8px' }}>
                    Steam API Key einrichten
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
                    Um dein Inventar zu laden brauchst du einen Steam API Key.
                    Das dauert nur 1 Minute.
                </p>

                {/* Schritt-für-Schritt */}
                {[
                    { step: '1', text: 'Geh zu', link: 'https://steamcommunity.com/dev/apikey', linkText: 'steamcommunity.com/dev/apikey' },
                    { step: '2', text: 'Trage als Domain ein: cs2skintrading.vercel.app' },
                    { step: '3', text: 'Klicke auf "Registrieren" und kopiere den Key' },
                ].map(s => (
                    <div key={s.step} style={{
                        display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start'
                    }}>
                        <div style={{
                            background: 'var(--accent)', color: '#000',
                            width: '24px', height: '24px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '13px',
                            flexShrink: 0
                        }}>{s.step}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text)', paddingTop: '3px' }}>
                            {s.text}{' '}
                            {s.link && (
                                <a href={s.link} target="_blank" rel="noopener noreferrer"
                                   style={{ color: 'var(--accent)' }}>
                                    {s.linkText}
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {/* Input */}
                <input
                    type="text"
                    placeholder="Dein Steam API Key (32 Zeichen)"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    style={{
                        width: '100%', padding: '12px', marginTop: '8px',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: '8px', color: 'var(--text)', fontSize: '14px',
                        fontFamily: 'monospace', marginBottom: '8px'
                    }}
                />

                {error && (
                    <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '12px',
                        background: 'transparent', border: '1px solid var(--border)',
                        borderRadius: '8px', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px'
                    }}>
                        Abbrechen
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{
                        flex: 2, padding: '12px',
                        background: 'var(--accent)', border: 'none',
                        borderRadius: '8px', color: '#000', cursor: saving ? 'wait' : 'pointer',
                        fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: 700
                    }}>
                        {saving ? 'Speichern...' : 'Key speichern & Inventar laden'}
                    </button>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '12px', textAlign: 'center' }}>
                    🔒 Dein Key wird sicher gespeichert und nur für dein Inventar genutzt.
                </p>
            </div>
        </div>
    )
}

function InventoryItem({ item, isListed, onAdd, onRemove, loading }) {
    return (
        <div style={{
            background: 'var(--bg2)',
            border: `1px solid ${isListed ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '10px', overflow: 'hidden',
            transition: 'border-color 0.2s',
            boxShadow: isListed ? '0 0 16px rgba(240,180,41,0.1)' : 'none'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #0a0a12 0%, #14141f 100%)',
                padding: '16px', display: 'flex', justifyContent: 'center', height: '100px'
            }}>
                {item.iconUrl
                    ? <img src={item.iconUrl} alt={item.marketHashName} style={{ maxHeight: '80px', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '32px', lineHeight: '80px' }}>🔫</span>
                }
            </div>

            <div style={{ padding: '10px 12px' }}>
                <div style={{
                    fontSize: '11px', color: 'var(--text)', fontWeight: 500,
                    lineHeight: 1.3, marginBottom: '8px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>
                    {item.marketHashName}
                </div>

                {isListed ? (
                    <button onClick={() => onRemove(item)} disabled={loading} style={{
                        width: '100%', padding: '6px',
                        background: 'rgba(240,180,41,0.15)', border: '1px solid var(--accent)',
                        borderRadius: '6px', color: 'var(--accent)',
                        fontSize: '12px', fontWeight: 600, fontFamily: 'Rajdhani, sans-serif',
                        cursor: loading ? 'wait' : 'pointer'
                    }}>✓ EINGESTELLT</button>
                ) : (
                    <button onClick={() => onAdd(item)} disabled={loading} style={{
                        width: '100%', padding: '6px', background: 'transparent',
                        border: '1px solid var(--border)', borderRadius: '6px',
                        color: 'var(--muted)', fontSize: '12px', fontFamily: 'Rajdhani, sans-serif',
                        cursor: loading ? 'wait' : 'pointer', transition: 'all 0.15s'
                    }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                    >+ ANBIETEN</button>
                )}
            </div>
        </div>
    )
}

export default function ListingsPage() {
    const [inventory, setInventory] = useState([])
    const [myListings, setMyListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)
    const [showApiModal, setShowApiModal] = useState(false)
    const [hasApiKey, setHasApiKey] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        setError(null)
        try {
            const [inv, listings] = await Promise.all([
                api.getInventory(),
                api.getMyListings()
            ])
            setInventory(inv.items || [])
            setMyListings(listings || [])
            setHasApiKey(inv.hasApiKey || false)
            if (inv.message) setMessage(inv.message)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleSync() {
        if (!hasApiKey) {
            setShowApiModal(true)
            return
        }
        setSyncing(true)
        try {
            const result = await api.syncInventory()
            setInventory(result.items || [])
            setMessage(null)
            showToast(`${result.synced} Skins geladen!`)
        } catch (err) {
            if (err.message.includes('API Key ungültig')) {
                setShowApiModal(true)
            }
            showToast(err.message, 'error')
        } finally {
            setSyncing(false)
        }
    }

    async function handleApiKeySaved() {
        setShowApiModal(false)
        setHasApiKey(true)
        // Direkt syncen nach Key-Eingabe
        setSyncing(true)
        try {
            const result = await api.syncInventory()
            setInventory(result.items || [])
            setMessage(null)
            showToast(`${result.synced} Skins geladen!`)
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setSyncing(false)
        }
    }

    function isListed(item) {
        return myListings.some(l => l.assetId === item.assetId)
    }

    function getListingId(item) {
        return myListings.find(l => l.assetId === item.assetId)?.id
    }

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    async function handleAdd(item) {
        setActionLoading(true)
        try {
            const listing = await api.createListing({
                assetId: item.assetId,
                marketHashName: item.marketHashName,
                iconUrl: item.iconUrl
            })
            setMyListings(prev => [...prev, listing])
            showToast('Skin eingestellt!')
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setActionLoading(false)
        }
    }

    async function handleRemove(item) {
        const listingId = getListingId(item)
        if (!listingId) return
        setActionLoading(true)
        try {
            await api.deleteListing(listingId)
            setMyListings(prev => prev.filter(l => l.id !== listingId))
            showToast('Skin zurückgezogen')
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div>
            {showApiModal && (
                <ApiKeyModal
                    onSave={handleApiKeySaved}
                    onClose={() => setShowApiModal(false)}
                />
            )}

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>Meine Skins</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Wähle Skins die du tauschen möchtest.</p>
                </div>
                <button onClick={handleSync} disabled={syncing} style={{
                    padding: '8px 16px', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: syncing ? 'var(--muted)' : 'var(--text)',
                    fontSize: '13px', cursor: syncing ? 'wait' : 'pointer',
                    fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em', whiteSpace: 'nowrap'
                }}>
                    {syncing ? '⏳ Lädt...' : '🔄 Inventar aktualisieren'}
                </button>
            </div>

            {!loading && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Im Inventar', value: inventory.length },
                        { label: 'Eingestellt', value: myListings.length }
                    ].map(s => (
                        <div key={s.label} style={{
                            flex: 1, background: 'var(--bg2)',
                            border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px'
                        }}>
                            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    Inventar wird geladen...
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '16px', color: '#ef4444', fontSize: '14px' }}>
                    <strong>Fehler:</strong> {error}
                </div>
            )}

            {!loading && !error && inventory.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
                    <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>
                        {hasApiKey ? 'Keine Skins gefunden' : 'Steam API Key erforderlich'}
                    </h3>
                    <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
                        {message || 'Gib deinen Steam API Key ein um dein Inventar zu laden.'}
                    </p>
                    <button onClick={() => hasApiKey ? handleSync() : setShowApiModal(true)} disabled={syncing} style={{
                        background: 'var(--accent)', color: '#000', border: 'none',
                        padding: '12px 28px', borderRadius: '8px',
                        fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: 700,
                        cursor: syncing ? 'wait' : 'pointer'
                    }}>
                        {hasApiKey ? '🔄 Inventar laden' : '🔑 API Key einrichten'}
                    </button>
                </div>
            )}

            {!loading && !error && inventory.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {inventory.map(item => (
                        <InventoryItem
                            key={item.assetId}
                            item={item}
                            isListed={isListed(item)}
                            onAdd={handleAdd}
                            onRemove={handleRemove}
                            loading={actionLoading}
                        />
                    ))}
                </div>
            )}

            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? 'var(--red)' : 'var(--green)',
                    color: '#fff', padding: '12px 24px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500, zIndex: 999,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}>
                    {toast.msg}
                </div>
            )}
        </div>
    )
}