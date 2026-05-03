'use client'
import { useState, useEffect } from 'react'
import { api } from '@/app/lib/api'

function ApiKeyModal({ onSave, onClose }) {
    const [key, setKey] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    async function handleSave() {
        if (!key || key.length < 10) { setError('Bitte gib einen gültigen API Key ein'); return }
        setSaving(true); setError(null)
        try { await api.saveApiKey(key); onSave() }
        catch (err) { setError(err.message) }
        finally { setSaving(false) }
    }

    return (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#0e1117] border border-white/[0.08] rounded-2xl p-7 max-w-md w-full">
                <h2 className="font-bebas text-3xl tracking-wide text-[#f0ede8] mb-2">Steam API Key einrichten</h2>
                <p className="text-[#4a4845] text-sm mb-6 leading-relaxed">
                    Um dein Inventar zu laden brauchst du einen Steam API Key. Das dauert nur 1 Minute.
                </p>

                {[
                    { step: '1', text: 'Geh zu', link: 'https://steamcommunity.com/dev/apikey', linkText: 'steamcommunity.com/dev/apikey' },
                    { step: '2', text: 'Trage als Domain ein: skinswipe.gg' },
                    { step: '3', text: 'Klicke auf "Registrieren" und kopiere den Key' },
                ].map(s => (
                    <div key={s.step} className="flex gap-3 mb-3 items-start">
                        <div className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {s.step}
                        </div>
                        <div className="text-sm text-[#8a8880] pt-0.5">
                            {s.text}{' '}
                            {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300">{s.linkText}</a>}
                        </div>
                    </div>
                ))}

                <input
                    type="text"
                    placeholder="Dein Steam API Key (32 Zeichen)"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    className="w-full mt-4 px-4 py-3 bg-[#080a0f] border border-white/[0.08] rounded-lg text-[#f0ede8] text-sm font-mono placeholder:text-[#3a3835] focus:outline-none focus:border-yellow-400/40"
                />

                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

                <div className="flex gap-2 mt-4">
                    <button onClick={onClose} className="flex-1 py-3 border border-white/[0.08] rounded-lg text-[#4a4845] text-sm hover:border-white/20 hover:text-[#8a8880] transition-all">
                        Abbrechen
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex-[2] py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bebas text-lg tracking-widest rounded-lg transition-all disabled:opacity-50">
                        {saving ? 'Speichern...' : 'Key speichern'}
                    </button>
                </div>
                <p className="text-xs text-[#3a3835] mt-3 text-center">🔒 Dein Key wird sicher gespeichert und nur für dein Inventar genutzt.</p>
            </div>
        </div>
    )
}

function InventoryItem({ item, isListed, onAdd, onRemove, loading }) {
    return (
        <div className={`bg-[#0e1117] rounded-xl overflow-hidden border transition-all duration-200 ${isListed ? 'border-yellow-400/50 shadow-[0_0_20px_rgba(255,180,0,0.08)]' : 'border-white/[0.07] hover:border-white/[0.14]'}`}>
            <div className="bg-gradient-to-br from-[#0a0a12] to-[#14141f] p-4 flex justify-center h-[100px]">
                {item.iconUrl
                    ? <img src={item.iconUrl} alt={item.marketHashName} className="max-h-[80px] object-contain" />
                    : <span className="text-4xl leading-[80px]">🔫</span>
                }
            </div>
            <div className="p-3">
                <p className="text-xs text-[#8a8880] font-medium leading-tight mb-3 line-clamp-2">{item.marketHashName}</p>
                {isListed ? (
                    <button onClick={() => onRemove(item)} disabled={loading}
                            className="w-full py-1.5 bg-yellow-400/10 border border-yellow-400/40 rounded-md text-yellow-400 text-xs font-bebas tracking-widest hover:bg-yellow-400/20 transition-all disabled:opacity-50">
                        ✓ Eingestellt
                    </button>
                ) : (
                    <button onClick={() => onAdd(item)} disabled={loading}
                            className="w-full py-1.5 border border-white/[0.08] rounded-md text-[#4a4845] text-xs font-bebas tracking-widest hover:border-yellow-400/40 hover:text-yellow-400 transition-all disabled:opacity-50">
                        + Anbieten
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
    const [syncing, setSyncing] = useState(false)
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)
    const [showApiModal, setShowApiModal] = useState(false)
    const [hasApiKey, setHasApiKey] = useState(false)
    const [message, setMessage] = useState(null)
    const [lastSync, setLastSync] = useState(0)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true); setError(null)
        try {
            const [inv, listings] = await Promise.all([api.getInventory(), api.getMyListings()])
            setInventory(inv.items || [])
            setMyListings(listings || [])
            setHasApiKey(inv.hasApiKey || false)
            if (inv.message) setMessage(inv.message)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    async function handleSync() {
        if (!hasApiKey) { setShowApiModal(true); return }
        const now = Date.now()
        if (now - lastSync < 30000) { showToast('Bitte warte kurz.', 'error'); return }
        setLastSync(now); setSyncing(true)
        try {
            const result = await api.syncInventory()
            setInventory(result.items || [])
            setMessage(null)
            showToast(`${result.synced} Skins geladen!`)
        } catch (err) {
            if (err.message.includes('API Key ungültig')) setShowApiModal(true)
            else showToast(err.message, 'error')
        } finally { setSyncing(false) }
    }

    async function handleApiKeySaved() {
        setShowApiModal(false); setHasApiKey(true); showToast('API Key gespeichert!')
        await loadData()
    }

    const isListed = item => myListings.some(l => l.assetId === item.assetId)
    const getListingId = item => myListings.find(l => l.assetId === item.assetId)?.id

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    async function handleAdd(item) {
        setActionLoading(true)
        try {
            const listing = await api.createListing({ assetId: item.assetId, marketHashName: item.marketHashName, iconUrl: item.iconUrl })
            setMyListings(prev => [...prev, listing])
            showToast('Skin eingestellt!')
        } catch (err) { showToast(err.message, 'error') }
        finally { setActionLoading(false) }
    }

    async function handleRemove(item) {
        const listingId = getListingId(item)
        if (!listingId) return
        setActionLoading(true)
        try {
            await api.deleteListing(listingId)
            setMyListings(prev => prev.filter(l => l.id !== listingId))
            showToast('Skin zurückgezogen')
        } catch (err) { showToast(err.message, 'error') }
        finally { setActionLoading(false) }
    }

    return (
        <div className="max-w-2xl mx-auto px-5 py-10">
            {showApiModal && <ApiKeyModal onSave={handleApiKeySaved} onClose={() => setShowApiModal(false)} />}

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#3a3835] mb-1">Inventar</p>
                    <h1 className="font-bebas text-5xl tracking-wide text-[#f0ede8]">Meine Skins</h1>
                    <p className="text-[#4a4845] text-sm mt-1">Wähle Skins die du tauschen möchtest.</p>
                </div>
                <button onClick={handleSync} disabled={syncing}
                        className="mt-2 px-4 py-2 border border-white/[0.08] rounded-lg text-[#6b6865] text-xs font-medium hover:border-white/20 hover:text-[#f0ede8] transition-all disabled:opacity-40 whitespace-nowrap">
                    {syncing ? '⏳ Lädt...' : '🔄 Aktualisieren'}
                </button>
            </div>

            {/* Stats */}
            {!loading && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {[{ label: 'Im Inventar', value: inventory.length }, { label: 'Eingestellt', value: myListings.length }].map(s => (
                        <div key={s.label} className="bg-[#0e1117] border border-white/[0.07] rounded-xl p-4">
                            <div className="font-bebas text-3xl text-yellow-400">{s.value}</div>
                            <div className="text-xs text-[#4a4845] mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-center py-16 text-[#4a4845]">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-sm">Inventar wird geladen...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                    <strong>Fehler:</strong> {error}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && inventory.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">🔑</div>
                    <h3 className="font-bebas text-3xl text-[#f0ede8] mb-2">
                        {hasApiKey ? 'Keine Skins gefunden' : 'API Key erforderlich'}
                    </h3>
                    <p className="text-[#4a4845] text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                        {message || 'Gib deinen Steam API Key ein um dein Inventar zu laden.'}
                    </p>
                    <button onClick={() => hasApiKey ? handleSync() : setShowApiModal(true)} disabled={syncing}
                            className="bg-yellow-400 hover:bg-yellow-300 text-black px-7 py-3 rounded-lg font-bebas text-lg tracking-widest transition-all disabled:opacity-50">
                        {hasApiKey ? '🔄 Inventar laden' : '🔑 API Key einrichten'}
                    </button>
                </div>
            )}

            {/* Grid */}
            {!loading && !error && inventory.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5">
                    {inventory.map(item => (
                        <InventoryItem key={item.assetId} item={item} isListed={isListed(item)} onAdd={handleAdd} onRemove={handleRemove} loading={actionLoading} />
                    ))}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-sm font-medium z-[999] shadow-xl ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                    {toast.msg}
                </div>
            )}
        </div>
    )
}