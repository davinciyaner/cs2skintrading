import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import db from '../config/db.js'

const router = express.Router()

router.get('/feed', requireAuth, async (req, res) => {
    const userId = req.user.id

    const myListingsResult = await db.execute({
        sql: `SELECT * FROM Listing WHERE userId = ? AND active = 1`,
        args: [userId]
    })
    const myListings = myListingsResult.rows

    if (myListings.length === 0) {
        return res.status(400).json({ error: 'Du musst erst einen Skin einstellen...' })
    }

    const globalMin = Math.min(...myListings.map(l => l.priceMin))
    const globalMax = Math.max(...myListings.map(l => l.priceMax))

    const swipedResult = await db.execute({
        sql: `SELECT listingAId, listingBId FROM Match WHERE userAId = ? OR userBId = ?`,
        args: [userId, userId]
    })
    const swipedIds = swipedResult.rows.flatMap(m => [m.listingAId, m.listingBId])

    const placeholders = swipedIds.length > 0 ? swipedIds.map(() => '?').join(',') : 'NULL'
    const feedResult = await db.execute({
        sql: `SELECT l.*, u.id as u_id, u.username, u.avatar, u.steamId as u_steamId
              FROM Listing l
              JOIN User u ON l.userId = u.id
              WHERE l.userId != ?
                AND l.active = 1
                AND l.price >= ? AND l.price <= ?
                ${swipedIds.length > 0 ? `AND l.id NOT IN (${placeholders})` : ''}
              LIMIT 20`,
        args: [userId, globalMin, globalMax, ...swipedIds]
    })

    const feed = feedResult.rows.map(row => ({
        ...row,
        user: { id: row.u_id, username: row.username, avatar: row.avatar, steamId: row.u_steamId }
    }))

    res.json(feed)
})

router.post('/action', requireAuth, async (req, res) => {
    const { listingId, action } = req.body
    const userId = req.user.id

    if (!['like', 'dislike'].includes(action)) {
        return res.status(400).json({ error: 'action muss like oder dislike sein' })
    }

    const targetResult = await db.execute({
        sql: `SELECT l.*, u.id as u_id, u.username, u.avatar, u.steamId as u_steamId
              FROM Listing l JOIN User u ON l.userId = u.id WHERE l.id = ?`,
        args: [listingId]
    })

    if (targetResult.rows.length === 0) {
        return res.status(404).json({ error: 'Listing nicht gefunden' })
    }

    const targetListing = targetResult.rows[0]
    const targetUser = { id: targetListing.u_id, username: targetListing.username, avatar: targetListing.avatar, steamId: targetListing.u_steamId }

    const myListingsResult = await db.execute({
        sql: `SELECT * FROM Listing WHERE userId = ? AND active = 1`,
        args: [userId]
    })
    const myListings = myListingsResult.rows

    if (action === 'dislike') {
        if (myListings.length > 0) {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
            await db.execute({
                sql: `INSERT INTO Match (id, listingAId, listingBId, userAId, userBId, status, createdAt)
                      VALUES (?, ?, ?, ?, ?, 'disliked', datetime('now'))`,
                args: [id, myListings[0].id, listingId, userId, targetListing.userId]
            })
        }
        return res.json({ match: false })
    }

    // Like: Reverse Match prüfen
    const myListingIds = myListings.map(l => l.id)
    const placeholders = myListingIds.map(() => '?').join(',')

    const reverseResult = await db.execute({
        sql: `SELECT * FROM Match WHERE listingBId IN (${placeholders}) AND listingAId = ? AND userAId = ? AND status = 'liked'`,
        args: [...myListingIds, listingId, targetListing.userId]
    })

    if (reverseResult.rows.length > 0) {
        const reverseMatch = reverseResult.rows[0]
        await db.execute({
            sql: `UPDATE Match SET status = 'matched' WHERE id = ?`,
            args: [reverseMatch.id]
        })
        return res.json({ match: true, matchId: reverseMatch.id, otherUser: targetUser })
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    await db.execute({
        sql: `INSERT INTO Match (id, listingAId, listingBId, userAId, userBId, status, createdAt)
              VALUES (?, ?, ?, ?, ?, 'liked', datetime('now'))`,
        args: [id, myListings[0].id, listingId, userId, targetListing.userId]
    })

    res.json({ match: false })
})

router.get('/matches', requireAuth, async (req, res) => {
    const userId = req.user.id

    const result = await db.execute({
        sql: `SELECT m.*,
              la.id as la_id, la.marketHashName as la_name, la.iconUrl as la_icon, la.price as la_price,
              lb.id as lb_id, lb.marketHashName as lb_name, lb.iconUrl as lb_icon, lb.price as lb_price,
              ua.id as ua_id, ua.username as ua_username, ua.avatar as ua_avatar, ua.steamId as ua_steamId,
              ub.id as ub_id, ub.username as ub_username, ub.avatar as ub_avatar, ub.steamId as ub_steamId
              FROM Match m
              JOIN Listing la ON m.listingAId = la.id
              JOIN Listing lb ON m.listingBId = lb.id
              JOIN User ua ON m.userAId = ua.id
              JOIN User ub ON m.userBId = ub.id
              WHERE (m.userAId = ? OR m.userBId = ?) AND m.status = 'matched'
              ORDER BY m.createdAt DESC`,
        args: [userId, userId]
    })

    const matches = result.rows.map(row => ({
        ...row,
        listingA: { id: row.la_id, marketHashName: row.la_name, iconUrl: row.la_icon, price: row.la_price },
        listingB: { id: row.lb_id, marketHashName: row.lb_name, iconUrl: row.lb_icon, price: row.lb_price },
        userA: { id: row.ua_id, username: row.ua_username, avatar: row.ua_avatar, steamId: row.ua_steamId },
        userB: { id: row.ub_id, username: row.ub_username, avatar: row.ub_avatar, steamId: row.ub_steamId }
    }))

    res.json(matches)
})

export default router