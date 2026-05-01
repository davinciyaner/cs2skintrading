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

async function getInventoryDirect() {
    // SteamID vom Backend holen
    const me = await apiFetch('/auth/me')
    const steamId = me.steamId

    // Inventar direkt von Steam laden (Browser-IP, nicht Server-IP)
    const res = await fetch(
        `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=75`
    )

    if (!res.ok) {
        if (res.status === 429) throw new Error('Steam Rate Limit – bitte kurz warten')
        if (res.status === 403) throw new Error('Inventar ist auf privat gestellt')
        throw new Error('Inventar konnte nicht geladen werden')
    }

    const data = await res.json()
    const { assets, descriptions } = data

    if (!assets || !descriptions) return { items: [] }

    const descMap = {}
    for (const desc of descriptions) {
        descMap[`${desc.classid}_${desc.instanceid}`] = desc
    }

    const items = assets.map(asset => {
        const desc = descMap[`${asset.classid}_${asset.instanceid}`] || {}
        return {
            assetId: asset.assetid,
            marketHashName: desc.market_hash_name,
            name: desc.name,
            iconUrl: desc.icon_url
                ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}/360fx360f`
                : null,
            tradable: desc.tradable === 1,
            marketable: desc.marketable === 1
        }
    }).filter(item => item.tradable)

    return { items }
}

// Auth
export const api = {
    getMe: () => apiFetch('/auth/me'),
    logout: () => apiFetch('/auth/logout'),
    loginUrl: `${API_URL}/auth/steam`,

    getInventory: getInventoryDirect,  // ← direkt von Steam

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