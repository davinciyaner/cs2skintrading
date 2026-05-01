import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../config/db.js'

const router = express.Router()

// Inventar aus DB laden (kein Steam-Request mehr)
router.get('/', requireAuth, async (req, res) => {
    const userId = req.user.id

    const items = await prisma.inventoryItem.findMany({
        where: { userId, tradable: true },
        orderBy: { createdAt: 'desc' }
    })

    if (items.length === 0) {
        // Noch keine Items in DB – manuellen Sync triggern
        return res.json({
            items: [],
            message: 'Inventar wird geladen – bitte kurz warten und Seite neu laden.'
        })
    }

    res.json({ items })
})

// Manueller Sync-Button
router.post('/sync', requireAuth, async (req, res) => {
    const { id: userId, steamId } = req.user

    try {
        const fetchRes = await fetch(
            `${process.env.FRONTEND_URL}/api/inventory?steamId=${steamId}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                }
            }
        )

        if (!fetchRes.ok) {
            if (fetchRes.status === 429) {
                return res.status(429).json({ error: 'Steam Rate Limit – bitte 60 Sekunden warten' })
            }
            if (fetchRes.status === 403) {
                return res.status(403).json({ error: 'Inventar ist auf privat gestellt' })
            }
            return res.status(500).json({ error: 'Steam nicht erreichbar' })
        }

        const data = await fetchRes.json()
        const { assets, descriptions } = data

        if (!assets || !descriptions) return res.json({ items: [], synced: 0 })

        const descMap = {}
        for (const desc of descriptions) {
            descMap[`${desc.classid}_${desc.instanceid}`] = desc
        }

        const items = assets.map(asset => {
            const desc = descMap[`${asset.classid}_${asset.instanceid}`] || {}
            return {
                assetId: asset.assetid,
                marketHashName: desc.market_hash_name || 'Unknown',
                iconUrl: desc.icon_url
                    ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}/360fx360f`
                    : null,
                tradable: desc.tradable === 1
            }
        }).filter(item => item.tradable && item.marketHashName !== 'Unknown')

        for (const item of items) {
            await prisma.inventoryItem.upsert({
                where: { userId_assetId: { userId, assetId: item.assetId } },
                update: { marketHashName: item.marketHashName, iconUrl: item.iconUrl },
                create: { userId, assetId: item.assetId, marketHashName: item.marketHashName, iconUrl: item.iconUrl, tradable: true }
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

// Inventar-Rohdaten vom Frontend entgegennehmen und speichern
router.post('/save', requireAuth, async (req, res) => {
    const { id: userId } = req.user
    const { assets, descriptions } = req.body

    if (!assets || !descriptions) {
        return res.status(400).json({ error: 'Keine Inventar-Daten' })
    }

    const descMap = {}
    for (const desc of descriptions) {
        descMap[`${desc.classid}_${desc.instanceid}`] = desc
    }

    const items = assets.map(asset => {
        const desc = descMap[`${asset.classid}_${asset.instanceid}`] || {}
        return {
            assetId: asset.assetid,
            marketHashName: desc.market_hash_name || 'Unknown',
            iconUrl: desc.icon_url
                ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}/360fx360f`
                : null,
            tradable: desc.tradable === 1
        }
    }).filter(item => item.tradable && item.marketHashName !== 'Unknown')

    for (const item of items) {
        await prisma.inventoryItem.upsert({
            where: { userId_assetId: { userId, assetId: item.assetId } },
            update: { marketHashName: item.marketHashName, iconUrl: item.iconUrl },
            create: { userId, assetId: item.assetId, marketHashName: item.marketHashName, iconUrl: item.iconUrl, tradable: true }
        })
    }

    const allItems = await prisma.inventoryItem.findMany({
        where: { userId, tradable: true }
    })

    res.json({ items: allItems, synced: items.length })
})

export default router