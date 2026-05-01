import express from 'express'
import axios from 'axios'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// CS2 App ID und Context ID
const CS2_APP_ID = 730
const CS2_CONTEXT_ID = 2

// Steam Inventar des eingeloggten Users laden
router.get('/', requireAuth, async (req, res) => {
    const steamId = req.user.steamId

    try {
        const url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APP_ID}/${CS2_CONTEXT_ID}`
        const response = await axios.get(url, {
            params: {
                l: 'english',
                count: 75  // Max Items pro Request
            },
            headers: {
                // User-Agent setzen um Steam-Blocking zu vermeiden
                'User-Agent': 'Mozilla/5.0'
            }
        })

        const { assets, descriptions } = response.data

        if (!assets || !descriptions) {
            return res.json({ items: [] })
        }

        // Assets mit Descriptions zusammenführen
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
                tradable: desc.tradable === 1,  // Nur tradable Skins zeigen
                marketable: desc.marketable === 1
            }
        })

        // Nur tradbare Skins zurückgeben
        const tradable = items.filter(item => item.tradable)

        res.json({ items: tradable })
    } catch (err) {
        console.error('Steam Inventar Fehler:', err.message)
        // Steam Rate-Limiting oder privates Inventar
        if (err.response?.status === 403) {
            return res.status(403).json({ error: 'Inventar ist auf privat gestellt' })
        }
        res.status(500).json({ error: 'Inventar konnte nicht geladen werden' })
    }
})

export default router