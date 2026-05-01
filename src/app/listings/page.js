'use client'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

function InventoryItem({ item, isListed, onAdd, onRemove, loading }) {
    return (
        <div style={{
            background: 'var(--bg2)',
            border: `1px solid ${isListed ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '10px',
            overflow: 'hidden',
            transition: 'border-color 0.2s',
            boxShadow: isListed ? '0 0 16px rgba(240,180,41,0.1)' : 'none'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #0a0a12 0%, #14141f 100%)',
                padding: '16px',
                display: 'flex',
                justifyContent: 'center',
                height: '100px'
            }}>
                {item.iconUrl ? (
                    <img src={item.iconUrl} alt={item.name} style={{ maxHeight: '80px', objectFit: 'contain' }} />
                ) : (
                    <span style={{ fontSize: '32px', lineHeight: '80px' }}>🔫</span>
                )}
            </div>

            <div style={{ padding: '10px 12px' }}>
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text)',
                    fontWeight: 500,
                    lineHeight: 1.3,
                    marginBottom: '8px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {item.marketHashName}
                </div>

                {isListed ? (
                    <button
                        onClick={() => onRemove(item)}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '6px',
                            background: 'rgba(240,180,41,0.15)',
                            border: '1px solid var(--accent)',
                            borderRadius: '6px', color: 'var(--accent)',
                            fontSize: '12px', fontWeight: 600,
                            fontFamily: 'Rajdhani, sans-serif',
                            cursor: loading ? 'wait' : 'pointer'
                        }}
                    >✓ EINGESTELLT</button>
                ) : (
                    <button
                        onClick={() => onAdd(item)}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '6px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '6px', color: 'var(--muted)',
                            fontSize: '12px', fontFamily: 'Rajdhani, sans-serif',
                            cursor: loading ? 'wait' : 'pointer',
                            transition: 'all 0.15s'
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
    const [emptyMessage, setEmptyMessage] = useState(null)

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
            if (inv.message) setEmptyMessage(inv.message)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleSync() {
        setSyncing(true)
        try {
            const result = await api.syncInventory()
            setInventory(result.items || [])
            setEmptyMessage(null)
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
        return myListings.find(l => l.assetId === item.assetId)?._id || myListings.find(l => l.assetId === item.assetId)?.id
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
            showToast(`Skin eingestellt!`)
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
            setMyListings(prev => prev.filter(l => (l.id || l._id) !== listingId))
            showToast('Skin zurückgezogen')
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>Meine Skins</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                        Wähle Skins die du tauschen möchtest.
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: syncing ? 'var(--muted)' : 'var(--text)',
                        fontSize: '13px',
                        cursor: syncing ? 'wait' : 'pointer',
                        fontFamily: 'Rajdhani, sans-serif',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {syncing ? '⏳ Lädt...' : '🔄 Inventar aktualisieren'}
                </button>
            </div>

            {/* Stats */}
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

            {/* Leer + Sync Hinweis */}
            {!loading && !error && inventory.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>
                        {emptyMessage || 'Keine Skins gefunden.'}
                    </p>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        style={{
                            background: 'var(--accent)', color: '#000',
                            border: 'none', padding: '12px 28px',
                            borderRadius: '8px', fontFamily: 'Rajdhani, sans-serif',
                            fontSize: '16px', fontWeight: 700,
                            cursor: syncing ? 'wait' : 'pointer'
                        }}
                    >
                        {syncing ? 'Lädt...' : '🔄 Inventar laden'}
                    </button>
                </div>
            )}

            {/* Grid */}
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