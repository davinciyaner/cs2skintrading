'use client'
import { useState, useEffect } from 'react'
import {api} from "../lib/api";

// Einzelne Skin-Karte im Inventar
function InventoryItem({ item, isListed, onAdd, onRemove, loading }) {
    return (
        <div style={{
            background: 'var(--bg2)',
            border: `1px solid ${isListed ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '10px',
            overflow: 'hidden',
            transition: 'border-color 0.2s',
            opacity: item.tradable ? 1 : 0.4,
            boxShadow: isListed ? '0 0 16px rgba(240,180,41,0.1)' : 'none'
        }}>
            {/* Bild */}
            <div style={{
                background: 'linear-gradient(135deg, #0a0a12 0%, #14141f 100%)',
                padding: '16px',
                display: 'flex',
                justifyContent: 'center',
                height: '100px'
            }}>
                {item.iconUrl ? (
                    <img
                        src={item.iconUrl}
                        alt={item.name}
                        style={{ maxHeight: '80px', objectFit: 'contain' }}
                    />
                ) : (
                    <span style={{ fontSize: '32px', lineHeight: '80px' }}>🔫</span>
                )}
            </div>

            {/* Info */}
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

                {!item.tradable ? (
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Nicht tradebar</div>
                ) : isListed ? (
                    <button
                        onClick={() => onRemove(item)}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '6px',
                            background: 'rgba(240,180,41,0.15)',
                            border: '1px solid var(--accent)',
                            borderRadius: '6px',
                            color: 'var(--accent)',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: 'Rajdhani, sans-serif',
                            letterSpacing: '0.05em',
                            cursor: loading ? 'wait' : 'pointer'
                        }}
                    >
                        ✓ EINGESTELLT
                    </button>
                ) : (
                    <button
                        onClick={() => onAdd(item)}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '6px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            color: 'var(--muted)',
                            fontSize: '12px',
                            fontFamily: 'Rajdhani, sans-serif',
                            letterSpacing: '0.05em',
                            cursor: loading ? 'wait' : 'pointer',
                            transition: 'all 0.15s'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)'
                            e.currentTarget.style.color = 'var(--accent)'
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.color = 'var(--muted)'
                        }}
                    >
                        + ANBIETEN
                    </button>
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
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

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
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function isListed(item) {
        return myListings.some(l => l.assetId === item.assetId)
    }

    function getListingId(item) {
        return myListings.find(l => l.assetId === item.assetId)?._id
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
            showToast(`${item.marketHashName} eingestellt!`)
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
            setMyListings(prev => prev.filter(l => l._id !== listingId))
            showToast('Skin zurückgezogen')
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>Meine Skins</h1>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                    Wähle Skins aus deinem Inventar, die du tauschen möchtest.
                </p>
            </div>

            {/* Stats */}
            {!loading && (
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    {[
                        { label: 'Im Inventar', value: inventory.filter(i => i.tradable).length },
                        { label: 'Eingestellt', value: myListings.length }
                    ].map(s => (
                        <div key={s.label} style={{
                            flex: 1,
                            background: 'var(--bg2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '12px 16px'
                        }}>
                            <div style={{
                                fontFamily: 'Rajdhani, sans-serif',
                                fontSize: '24px',
                                fontWeight: 700,
                                color: 'var(--accent)'
                            }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* States */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    Inventar wird geladen...
                </div>
            )}

            {error && (
                <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#ef4444',
                    fontSize: '14px'
                }}>
                    <strong>Fehler:</strong> {error}
                    {error.includes('privat') && (
                        <div style={{ marginTop: '8px', color: 'var(--muted)' }}>
                            Gehe zu Steam → Profil → Privatsphäre → Inventar auf „Öffentlich" stellen.
                        </div>
                    )}
                </div>
            )}

            {/* Grid */}
            {!loading && !error && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                }}>
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

            {!loading && !error && inventory.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
                    Keine CS2-Skins im Inventar gefunden.
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? 'var(--red)' : 'var(--green)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    zIndex: 999,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}>
                    {toast.msg}
                </div>
            )}
        </div>
    )
}