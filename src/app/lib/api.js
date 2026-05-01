const API_URL = process.env.NEXT_PUBLIC_API_URL

// Basis-Fetch mit Credentials (für Session-Cookie)
async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: 'include',  // Session-Cookie mitsenden!
        headers: { 'Content-Type': 'application/json' },
        ...options
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }))
        throw new Error(error.error || 'API Fehler')
    }

    return res.json()
}

// Auth
export const api = {
    // User
    getMe: () => apiFetch('/auth/me'),
    logout: () => apiFetch('/auth/logout'),
    loginUrl: `${API_URL}/auth/steam`,

    // Inventar
    getInventory: () => apiFetch('/api/inventory'),

    // Listings
    getMyListings: () => apiFetch('/api/listings/mine'),
    createListing: (data) => apiFetch('/api/listings', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteListing: (id) => apiFetch(`/api/listings/${id}`, { method: 'DELETE' }),

    // Swipe
    getFeed: () => apiFetch('/api/swipe/feed'),
    swipe: (listingId, action) => apiFetch('/api/swipe/action', {
        method: 'POST',
        body: JSON.stringify({ listingId, action })
    }),
    getMatches: () => apiFetch('/api/swipe/matches')
}