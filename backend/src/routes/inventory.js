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

    // Steam API Key prüfen
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

// Inventar mit Steam API Key laden
router.post('/sync', requireAuth, async (req, res) => {
    const { id: userId, steamId } = req.user

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.steamApiKey) {
        return res.status(400).json({ error: 'Kein Steam API Key hinterlegt' })
    }

    try {
        // Offizielle Steam API – kein Rate Limit, kein CORS
        const res1 = await fetch(
            `https://api.steampowered.com/IEconItems_730/GetPlayerItems/v1/?key=${user.steamApiKey}&steamid=${steamId}&language=english`
        )

        if (!res1.ok) {
            if (res1.status === 403) {
                return res.status(403).json({ error: 'Steam API Key ungültig oder abgelaufen' })
            }
            return res.status(500).json({ error: 'Steam API nicht erreichbar' })
        }

        const data = await res1.json()
        const steamItems = data?.result?.items

        if (!steamItems || steamItems.length === 0) {
            return res.json({ items: [], synced: 0 })
        }

        // Items verarbeiten
        const items = steamItems
            .filter(item => item.tradable)
            .map(item => ({
                assetId: String(item.id),
                marketHashName: item.market_hash_name || item.name || 'Unknown',
                iconUrl: item.icon_url
                    ? `https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}/360fx360f`
                    : null,
                tradable: !!item.tradable
            }))
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

        res.json({ items: allItems, synced: items.length })
    } catch (err) {
        console.error('Sync Fehler:', err.message)
        res.status(500).json({ error: 'Sync fehlgeschlagen' })
    }
})

export default router