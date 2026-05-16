import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import Listing from '../models/Listing.js'
import Match from '../models/Match.js'

const router = express.Router()

router.get('/feed', requireAuth, async (req, res) => {
    const userId = req.user._id

    const myListings = await Listing.find({ userId, active: true })
    if (myListings.length === 0) return res.status(400).json({ error: 'Du musst erst einen Skin einstellen...' })

    const globalMin = Math.min(...myListings.map(l => l.priceMin))
    const globalMax = Math.max(...myListings.map(l => l.priceMax))

    const swiped = await Match.find({ $or: [{ userAId: userId }, { userBId: userId }] })
    const swipedIds = swiped.flatMap(m => [String(m.listingAId), String(m.listingBId)])

    const feed = await Listing.find({
        userId: { $ne: userId },
        active: true,
        price: { $gte: globalMin, $lte: globalMax },
        _id: { $nin: swipedIds }
    })
        .populate('userId', 'username avatar steamId')
        .limit(20)

    res.json(feed)
})

router.post('/action', requireAuth, async (req, res) => {
    const { listingId, action } = req.body
    const userId = req.user._id

    if (!['like', 'dislike'].includes(action)) return res.status(400).json({ error: 'action muss like oder dislike sein' })

    const targetListing = await Listing.findById(listingId).populate('userId', 'username avatar steamId')
    if (!targetListing) return res.status(404).json({ error: 'Listing nicht gefunden' })

    const myListings = await Listing.find({ userId, active: true })
    if (myListings.length === 0) return res.status(400).json({ error: 'Kein eigenes Listing gefunden' })

    if (action === 'dislike') {
        await Match.create({
            listingAId: myListings[0]._id,
            listingBId: listingId,
            userAId: userId,
            userBId: targetListing.userId._id,
            status: 'disliked'
        })
        return res.json({ match: false })
    }

    // Like: Reverse Match prüfen
    const myListingIds = myListings.map(l => l._id)
    const reverseMatch = await Match.findOne({
        listingAId: listingId,
        listingBId: { $in: myListingIds },
        userAId: targetListing.userId._id,
        status: 'liked'
    })

    if (reverseMatch) {
        reverseMatch.status = 'matched'
        await reverseMatch.save()
        return res.json({ match: true, matchId: reverseMatch._id, otherUser: targetListing.userId })
    }

    await Match.create({
        listingAId: myListings[0]._id,
        listingBId: listingId,
        userAId: userId,
        userBId: targetListing.userId._id,
        status: 'liked'
    })

    res.json({ match: false })
})

router.get('/matches', requireAuth, async (req, res) => {
    const userId = req.user._id

    const matches = await Match.find({
        $or: [{ userAId: userId }, { userBId: userId }],
        status: 'matched'
    })
        .populate('listingAId')
        .populate('listingBId')
        .populate('userAId', 'username avatar steamId')
        .populate('userBId', 'username avatar steamId')
        .sort({ createdAt: -1 })

    res.json(matches)
})

export default router