import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import db from '../config/db.js'
import { getSkinPrice } from '../services/steamMarket.js'

const router = express.Router()

router.get('/mine', requireAuth, async (req, res) => {
    const result = await db.execute({
        sql: `SELECT * FROM Listing WHERE userId = ? AND active = 1`,
        args: [req.user.id]
    })
    res.json(result.rows)
})

router.post('/', requireAuth, async (req, res) => {
    const { assetId, marketHashName, iconUrl } = req.body

    if (!assetId || !marketHashName) {
        return res.status(400).json({ error: 'assetId und marketHashName erforderlich' })
    }

    const existing = await db.execute({
        sql: `SELECT id FROM Listing WHERE userId = ? AND assetId = ? AND active = 1`,
        args: [req.user.id, assetId]
    })
    if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Skin bereits eingestellt' })
    }

    const priceData = await getSkinPrice(marketHashName)
    if (!priceData) {
        return res.status(400).json({ error: 'Preis konnte nicht ermittelt werden.' })
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    await db.execute({
        sql: `INSERT INTO Listing (id, userId, steamId, assetId, marketHashName, iconUrl, price, priceMin, priceMax, active, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        args: [id, req.user.id, req.user.steamId, assetId, marketHashName, iconUrl || null,
            priceData.price, priceData.priceRange.min, priceData.priceRange.max]
    })

    const result = await db.execute({ sql: `SELECT * FROM Listing WHERE id = ?`, args: [id] })
    res.status(201).json(result.rows[0])
})

router.delete('/:id', requireAuth, async (req, res) => {
    const result = await db.execute({
        sql: `SELECT id FROM Listing WHERE id = ? AND userId = ?`,
        args: [req.params.id, req.user.id]
    })

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing nicht gefunden' })
    }

    await db.execute({
        sql: `UPDATE Listing SET active = 0 WHERE id = ?`,
        args: [req.params.id]
    })

    res.json({ success: true })
})

export default router