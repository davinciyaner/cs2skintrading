const API_URL = process.env.NEXT_PUBLIC_API_URL

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }))
        throw new Error(error.error || 'API Fehler')
    }

    return res.json()
}

export const api = {
    getMe: () => apiFetch('/auth/me'),
    logout: () => apiFetch('/auth/logout'),
    loginUrl: `${API_URL}/auth/steam`,

    syncInventory: () => apiFetch('/api/inventory/sync', { method: 'POST' }),
    saveApiKey: (apiKey) => apiFetch('/api/inventory/apikey', {
        method: 'POST',
        body: JSON.stringify({ apiKey })
    }),
    getInventory: () => apiFetch('/api/inventory'),

    getMyListings: () => apiFetch('/api/listings/mine'),
    createListing: (data) => apiFetch('/api/listings', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteListing: (id) => apiFetch(`/api/listings/${id}`, { method: 'DELETE' }),

    getFeed: () => apiFetch('/api/swipe/feed'),
    swipe: (listingId, action) => apiFetch('/api/swipe/action', {
        method: 'POST',
        body: JSON.stringify({ listingId, action })
    }),
    getMatches: () => apiFetch('/api/swipe/matches')
}