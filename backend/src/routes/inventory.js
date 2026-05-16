import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import InventoryItem from '../models/InventoryItem.js'

const router = express.Router()
const lastSyncMap = new Map()

router.get('/', requireAuth, async (req, res) => {
    const items = await InventoryItem.find({ userId: req.user._id, tradable: true }).sort({ createdAt: -1 })
    const user = await User.findById(req.user._id)
    const hasApiKey = !!user?.steamApiKey

    if (items.length === 0) {
        return res.json({
            items: [],
            hasApiKey,
            message: hasApiKey
                ? 'Klicke auf "Inventar aktualisieren" um deine Skins zu laden.'
                : 'Bitte gib deinen Steam API Key ein um dein Inventar zu laden.'
        })
    }
    res.json({ items, hasApiKey })
})

router.post('/apikey', requireAuth, async (req, res) => {
    const { apiKey } = req.body
    if (!apiKey || apiKey.length < 10) return res.status(400).json({ error: 'Ungültiger API Key' })
    await User.findByIdAndUpdate(req.user._id, { steamApiKey: apiKey })
    res.json({ success: true })
})

router.post('/sync', requireAuth, async (req, res) => {
    const now = Date.now()
    const lastSync = lastSyncMap.get(String(req.user._id))
    if (lastSync && now - lastSync < 30000) {
        return res.status(429).json({ error: 'Bitte warte kurz, bevor du erneut synchronisierst.' })
    }

    const { steamId } = req.user
    try {
        const res1 = await fetch(`https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=100`)

        if (!res1.ok) {
            if (res1.status === 429) return res.status(429).json({ error: 'Zu viele Anfragen an Steam. Bitte warte 1-2 Minuten.' })
            if (res1.status === 403) return res.status(403).json({ error: 'Steam API Key ungültig oder abgelaufen' })
            return res.status(500).json({ error: `Steam API nicht erreichbar (${res1.status})` })
        }

        const data = await res1.json()
        const descriptions = new Map((data.descriptions || []).map(d => [`${d.classid}_${d.instanceid}`, d]))

        const items = (data.assets || [])
            .map(asset => {
                const desc = descriptions.get(`${asset.classid}_${asset.instanceid}`)
                return {
                    assetId: asset.assetid,
                    marketHashName: desc?.market_hash_name || desc?.name || 'Unknown',
                    iconUrl: desc?.icon_url ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}/360fx360f` : null,
                    tradable: desc?.tradable === 1
                }
            })
            .filter(i => i.tradable && i.marketHashName !== 'Unknown')

        if (items.length === 0) {
            lastSyncMap.set(String(req.user._id), now)
            return res.json({ items: [], synced: 0 })
        }

        for (const item of items) {
            await InventoryItem.findOneAndUpdate(
                { userId: req.user._id, assetId: item.assetId },
                { ...item, userId: req.user._id },
                { upsert: true, new: true }
            )
        }

        const allItems = await InventoryItem.find({ userId: req.user._id, tradable: true })
        lastSyncMap.set(String(req.user._id), now)
        res.json({ items: allItems, synced: items.length })
    } catch (err) {
        console.error('Sync Fehler:', err.message)
        res.status(500).json({ error: 'Sync fehlgeschlagen' })
    }
})

export default router