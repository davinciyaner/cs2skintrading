
const priceCache = new Map()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export async function getSkinPrice(marketHashName) {
    const cached = priceCache.get(marketHashName)
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        return cached.data
    }

    try {
        const params = new URLSearchParams({
            appid: '730',
            currency: '3',
            market_hash_name: marketHashName
        })

        const res = await fetch(
            `https://steamcommunity.com/market/priceoverview/?${params}`,
            { signal: AbortSignal.timeout(5000) }
        )

        if (!res.ok) {
            if (res.status === 429) console.warn('Steam Rate Limit')
            return null
        }

        const data = await res.json()
        if (!data.success) return null

        const raw = data.median_price || data.lowest_price || '0'
        const price = parseFloat(raw.replace(/[^0-9.,]/g, '').replace(',', '.'))
        if (!price || isNaN(price)) return null

        const result = {
            price,
            priceRange: { min: +(price * 0.85).toFixed(2), max: +(price * 1.15).toFixed(2) }
        }

        priceCache.set(marketHashName, { data: result, cachedAt: Date.now() })
        return result
    } catch (err) {
        console.error('Steam Market Fehler:', err.message)
        return null
    }
}