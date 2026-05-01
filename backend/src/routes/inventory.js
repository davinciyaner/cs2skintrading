import express from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const CS2_APP_ID = 730
const CS2_CONTEXT_ID = 2

router.get('/', requireAuth, async (req, res) => {
    const steamId = req.user.steamId

    try {
        const response = await fetch(
            `https://steamcommunity.com/inventory/${steamId}/${CS2_APP_ID}/${CS2_CONTEXT_ID}?l=english&count=75`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            }
        )

        if (!response.ok) {
            if (response.status === 403) {
                return res.status(403).json({ error: 'Inventar ist auf privat gestellt' })
            }
            if (response.status === 429) {
                return res.status(429).json({ error: 'Steam Rate Limit – bitte kurz warten' })
            }
            return res.status(500).json({ error: 'Steam nicht erreichbar' })
        }

        const data = await response.json()  // ← fetch braucht .json()
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
                classId: asset.classid,
                marketHashName: desc.market_hash_name,
                name: desc.name,
                iconUrl: desc.icon_url
                    ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}/360fx360f`
                    : null,
                tradable: desc.tradable === 1,
                marketable: desc.marketable === 1
            }
        })

        const tradable = items.filter(item => item.tradable)
        res.json({ items: tradable })

    } catch (err) {
        console.error('Steam Inventar Fehler:', err.message)
        res.status(500).json({ error: 'Inventar konnte nicht geladen werden' })
    }
})

export default router