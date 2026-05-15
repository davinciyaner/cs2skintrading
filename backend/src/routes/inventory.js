import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import db from '../config/db.js'

const router = express.Router()
const lastSyncMap = new Map()

router.get('/', requireAuth, async (req, res) => {
    const userId = req.user.id

    const itemsResult = await db.execute({
        sql: `SELECT * FROM InventoryItem WHERE userId = ? AND tradable = 1 ORDER BY createdAt DESC`,
        args: [userId]
    })

    const userResult = await db.execute({
        sql: `SELECT * FROM User WHERE id = ?`,
        args: [userId]
    })

    const user = userResult.rows[0]
    const items = itemsResult.rows
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
    if (!apiKey || apiKey.length < 10) {
        return res.status(400).json({ error: 'Ungültiger API Key' })
    }

    await db.execute({
        sql: `UPDATE User SET steamApiKey = ? WHERE id = ?`,
        args: [apiKey, req.user.id]
    })

    res.json({ success: true })
})

router.post('/sync', requireAuth, async (req, res) => {
    const now = Date.now()
    const lastSync = lastSyncMap.get(req.user.id)

    if (lastSync && now - lastSync < 30000) {
        return res.status(429).json({ error: 'Bitte warte kurz, bevor du erneut synchronisierst.' })
    }

    const { id: userId, steamId } = req.user

    try {
        const res1 = await fetch(
            `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=100`
        )

        if (!res1.ok) {
            const text = await res1.text().catch(() => '')
            console.error('Steam API Fehler:', res1.status, text)
            if (res1.status === 429) return res.status(429).json({ error: 'Zu viele Anfragen an Steam. Bitte warte 1-2 Minuten.' })
            if (res1.status === 403) return res.status(403).json({ error: 'Steam API Key ungültig oder abgelaufen' })
            return res.status(500).json({ error: `Steam API nicht erreichbar (${res1.status})` })
        }

        const data = await res1.json()
        const descriptions = new Map(
            (data.descriptions || []).map(d => [`${d.classid}_${d.instanceid}`, d])
        )

        const items = (data.assets || [])
            .map(asset => {
                const desc = descriptions.get(`${asset.classid}_${asset.instanceid}`)
                return {
                    assetId: asset.assetid,
                    marketHashName: desc?.market_hash_name || desc?.name || 'Unknown',
                    iconUrl: desc?.icon_url
                        ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}/360fx360f`
                        : null,
                    tradable: desc?.tradable === 1
                }
            })
            .filter(item => item.tradable && item.marketHashName !== 'Unknown')

        if (items.length === 0) {
            lastSyncMap.set(req.user.id, now)
            return res.json({ items: [], synced: 0 })
        }

        for (const item of items) {
            await db.execute({
                sql: `INSERT INTO InventoryItem (id, userId, assetId, marketHashName, iconUrl, tradable, createdAt, updatedAt)
                      VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
                      ON CONFLICT(userId, assetId) DO UPDATE SET
                        marketHashName = excluded.marketHashName,
                        iconUrl = excluded.iconUrl,
                        updatedAt = datetime('now')`,
                args: [userId, item.assetId, item.marketHashName, item.iconUrl]
            })
        }

        const allItems = await db.execute({
            sql: `SELECT * FROM InventoryItem WHERE userId = ? AND tradable = 1`,
            args: [userId]
        })

        lastSyncMap.set(req.user.id, now)
        res.json({ items: allItems.rows, synced: items.length })
    } catch (err) {
        console.error('Sync Fehler:', err.message)
        res.status(500).json({ error: 'Sync fehlgeschlagen' })
    }
})

export default router