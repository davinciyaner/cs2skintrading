import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../config/db.js'
import { getSkinPrice } from '../services/steamMarket.js'

const router = express.Router()

// Eigene Listings abrufen
router.get('/mine', requireAuth, async (req, res) => {
    const listings = await prisma.listing.findMany({
        where: { userId: req.user.id, active: true }
    })
    res.json(listings)
})

// Neues Listing erstellen
router.post('/', requireAuth, async (req, res) => {
    const { assetId, marketHashName, iconUrl } = req.body

    if (!assetId || !marketHashName) {
        return res.status(400).json({ error: 'assetId und marketHashName erforderlich' })
    }

    // Bereits eingestellt?
    const existing = await prisma.listing.findFirst({
        where: { userId: req.user.id, assetId, active: true }
    })
    if (existing) {
        return res.status(400).json({ error: 'Skin bereits eingestellt' })
    }

    // Preis von Steam Market holen
    const priceData = await getSkinPrice(marketHashName)
    if (!priceData) {
        return res.status(400).json({
            error: 'Preis konnte nicht ermittelt werden. Skin möglicherweise nicht handelbar.'
        })
    }

    const listing = await prisma.listing.create({
        data: {
            userId: req.user.id,
            steamId: req.user.steamId,
            assetId,
            marketHashName,
            iconUrl: iconUrl || null,
            price: priceData.price,
            priceMin: priceData.priceRange.min,
            priceMax: priceData.priceRange.max
        }
    })

    res.status(201).json(listing)
})

// Listing deaktivieren
router.delete('/:id', requireAuth, async (req, res) => {
    const listing = await prisma.listing.findFirst({
        where: { id: req.params.id, userId: req.user.id }
    })

    if (!listing) {
        return res.status(404).json({ error: 'Listing nicht gefunden' })
    }

    await prisma.listing.update({
        where: { id: listing.id },
        data: { active: false }
    })

    res.json({ success: true })
})

export default router