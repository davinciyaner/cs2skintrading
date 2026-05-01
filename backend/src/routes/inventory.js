import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../config/db.js'

const router = express.Router()

// Inventar aus DB laden
router.get('/', requireAuth, async (req, res) => {
    const userId = req.user.id

    const items = await prisma.inventoryItem.findMany({
        where: { userId, tradable: true },
        orderBy: { createdAt: 'desc' }
    })

    const user = await prisma.user.findUnique({ where: { id: userId } })
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

// Steam API Key speichern
router.post('/apikey', requireAuth, async (req, res) => {
    const { apiKey } = req.body
    if (!apiKey || apiKey.length < 10) {
        return res.status(400).json({ error: 'Ungültiger API Key' })
    }

    await prisma.user.update({
        where: { id: req.user.id },
        data: { steamApiKey: apiKey }
    })

    res.json({ success: true })
})
const lastSyncMap = new Map()
// Inventar mit Steam API Key laden
router.post('/sync', requireAuth, async (req, res) => {
    const now = Date.now()
    const lastSync = lastSyncMap.get(req.user.id)

    if (lastSync && now - lastSync < 30000) {
        return res.status(429).json({
            error: 'Bitte warte kurz, bevor du erneut synchronisierst.'
        })
    }

    const { id: userId, steamId } = req.user

    const user = await prisma.user.findUnique({ where: { id: userId } })

    try {
        const res1 = await fetch(
            `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=100`
        )

        if (!res1.ok) {
            const text = await res1.text().catch(() => '')
            console.error('Steam API Fehler:', res1.status, text)

            if (res1.status === 429) {
                return res.status(429).json({
                    error: 'Zu viele Anfragen an Steam. Bitte warte 1-2 Minuten.'
                })
            }

            if (res1.status === 403) {
                return res.status(403).json({
                    error: 'Steam API Key ungültig oder abgelaufen'
                })
            }

            return res.status(500).json({
                error: `Steam API nicht erreichbar (${res1.status})`
            })
        }

        const data = await res1.json()

        const descriptions = new Map(
            (data.descriptions || []).map(d => [`${d.classid}_${d.instanceid}`, d])
        )

        const steamItems = (data.assets || []).map(asset => {
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

        if (!steamItems || steamItems.length === 0) {
            lastSyncMap.set(req.user.id, now)
            return res.json({ items: [], synced: 0 })
        }

        // Items verarbeiten
        const items = steamItems
            .filter(item => item.tradable)
            .filter(item => item.marketHashName !== 'Unknown')

        for (const item of items) {
            await prisma.inventoryItem.upsert({
                where: { userId_assetId: { userId, assetId: item.assetId } },
                update: { marketHashName: item.marketHashName, iconUrl: item.iconUrl },
                create: {
                    userId,
                    assetId: item.assetId,
                    marketHashName: item.marketHashName,
                    iconUrl: item.iconUrl,
                    tradable: true
                }
            })
        }

        const allItems = await prisma.inventoryItem.findMany({
            where: { userId, tradable: true }
        })
        lastSyncMap.set(req.user.id, now)
        res.json({ items: allItems, synced: items.length })
    } catch (err) {
        console.error('Sync Fehler:', err.message)
        res.status(500).json({ error: 'Sync fehlgeschlagen' })
    }
})

export default router