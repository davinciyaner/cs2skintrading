import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import Listing from '../models/Listing.js'
import { getSkinPrice } from '../services/steamMarket.js'

const router = express.Router()

router.get('/mine', requireAuth, async (req, res) => {
    const listings = await Listing.find({ userId: req.user._id, active: true })
    res.json(listings)
})

router.post('/', requireAuth, async (req, res) => {
    const { assetId, marketHashName, iconUrl } = req.body
    if (!assetId || !marketHashName) return res.status(400).json({ error: 'assetId und marketHashName erforderlich' })

    const existing = await Listing.findOne({ userId: req.user._id, assetId, active: true })
    if (existing) return res.status(400).json({ error: 'Skin bereits eingestellt' })

    const priceData = await getSkinPrice(marketHashName)
    if (!priceData) return res.status(400).json({ error: 'Preis konnte nicht ermittelt werden.' })

    const listing = await Listing.create({
        userId: req.user._id,
        steamId: req.user.steamId,
        assetId,
        marketHashName,
        iconUrl: iconUrl || null,
        price: priceData.price,
        priceMin: priceData.priceRange.min,
        priceMax: priceData.priceRange.max
    })

    res.status(201).json(listing)
})

router.delete('/:id', requireAuth, async (req, res) => {
    const listing = await Listing.findOne({ _id: req.params.id, userId: req.user._id })
    if (!listing) return res.status(404).json({ error: 'Listing nicht gefunden' })

    listing.active = false
    await listing.save()
    res.json({ success: true })
})

export default router