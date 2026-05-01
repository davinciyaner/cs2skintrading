import express from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const CS2_APP_ID = 730
const CS2_CONTEXT_ID = 2

// In-Memory Cache: steamId → { items, cachedAt }
const inventoryCache = new Map()
const CACHE_TTL = 5 * 60 * 1000  // 5 Minuten

router.get('/', requireAuth, async (req, res) => {
    const steamId = req.user.steamId

    // Cache prüfen
    const cached = inventoryCache.get(steamId)
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
        return res.json({ items: cached.items, fromCache: true })
    }

    try {
        const response = await fetch(
            `https://steamcommunity.com/inventory/${steamId}/${CS2_APP_ID}/${CS2_CONTEXT_ID}?l=english&count=75`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                }
            }
        )

        if (!response.ok) {
            // Bei Rate Limit: gecachte Daten zurückgeben falls vorhanden
            if (response.status === 429) {
                if (cached) return res.json({ items: cached.items, fromCache: true })
                return res.status(429).json({ error: 'Steam Rate Limit – bitte warte 2-3 Minuten. Tut mir leid, ist von Steam...' })
            }
            if (response.status === 403) {
                return res.status(403).json({ error: 'Inventar ist auf privat gestellt' })
            }
            return res.status(500).json({ error: 'Steam nicht erreichbar' })
        }

        const data = await response.json()
        const { assets, descriptions } = data

        if (!assets || !descriptions) {
            return res.json({ items: [] })
        }

        const descMap = {}
        for (const desc of descriptions) {
            const key = `${desc.classid}_${desc.instanceid}`
            descMap[key] = desc
        }

        const items = assets.map(asset => {
            const key = `${asset.classid}_${asset.instanceid}`
            const desc = descMap[key] || {}
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

        // In Cache speichern
        inventoryCache.set(steamId, { items, cachedAt: Date.now() })

        res.json({ items })

    } catch (err) {
        console.error('Steam Inventar Fehler:', err.message)
        res.status(500).json({ error: 'Inventar konnte nicht geladen werden' })
    }
})

export default router