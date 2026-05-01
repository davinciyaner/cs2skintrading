import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../config/db.js'

const router = express.Router()

// Feed: Skins in passender Preisrange zum Swipen
router.get('/feed', requireAuth, async (req, res) => {
    const userId = req.user.id

    const allListings = await prisma.listing.findMany()
    console.log('ALLE Listings in DB:', allListings.length)

    // Direkt nach "ALLE Listings in DB" Log
    const otherListings = await prisma.listing.findMany({
        where: {
            NOT: { userId: userId }  // ← andere Syntax
        }
    })
    console.log('Fremde Listings (NOT syntax):', otherListings.length)

    const activeOther = await prisma.listing.findMany({
        where: { userId: { not: userId }, active: true }
    })
    console.log('Fremde Listings (active):', activeOther.length)


    const myListings = await prisma.listing.findMany({
        where: { userId, active: true }
    })
    console.log('Meine Listings:', myListings.length)

    if (myListings.length === 0) {
        return res.status(400).json({ error: 'Du musst erst einen Skin einstellen...' })
    }

    const globalMin = Math.min(...myListings.map(l => l.priceMin))
    const globalMax = Math.max(...myListings.map(l => l.priceMax))
    console.log('Preisrange:', globalMin, '-', globalMax)

    const existingMatches = await prisma.match.findMany({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
        select: { listingAId: true, listingBId: true }
    })
    const swipedIds = existingMatches.flatMap(m => [m.listingAId, m.listingBId])
    console.log('Bereits geswiped:', swipedIds.length)

    const feed = await prisma.listing.findMany({
        where: {
            userId: { not: userId },
            active: true,
            id: { notIn: swipedIds.length > 0 ? swipedIds : ['_'] },
            price: { gte: globalMin, lte: globalMax }
        },
        include: {
            user: { select: { id: true, username: true, avatar: true, steamId: true } }
        },
        take: 20
    })
    console.log('Feed Ergebnis:', feed.length)

    res.json(feed)
})

// Swipe: Like oder Dislike
router.post('/action', requireAuth, async (req, res) => {
    const { listingId, action } = req.body
    const userId = req.user.id

    if (!['like', 'dislike'].includes(action)) {
        return res.status(400).json({ error: 'action muss like oder dislike sein' })
    }

    const targetListing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { user: { select: { id: true, username: true, avatar: true, steamId: true } } }
    })

    if (!targetListing) {
        return res.status(404).json({ error: 'Listing nicht gefunden' })
    }

    if (action === 'dislike') {
        // Dislike als leeren Match-Eintrag speichern damit wir ihn nicht nochmal zeigen
        const myListing = await prisma.listing.findFirst({ where: { userId, active: true } })
        if (myListing) {
            await prisma.match.create({
                data: {
                    listingAId: myListing.id,
                    listingBId: listingId,
                    userAId: userId,
                    userBId: targetListing.userId,
                    status: 'disliked'
                }
            })
        }
        return res.json({ match: false })
    }

    // Like: Prüfen ob Gegenseite bereits geliked hat
    const myListings = await prisma.listing.findMany({
        where: { userId, active: true }
    })
    const myListingIds = myListings.map(l => l.id)

    const reverseMatch = await prisma.match.findFirst({
        where: {
            listingAId: { in: myListingIds },
            listingBId: listingId,
            userBId: userId,
            status: 'liked'
        }
    })

    if (reverseMatch) {
        // Gegenseitiges Match!
        await prisma.match.update({
            where: { id: reverseMatch.id },
            data: { status: 'matched' }
        })

        return res.json({
            match: true,
            matchId: reverseMatch.id,
            otherUser: targetListing.user
        })
    }

    // Like speichern
    const myBestListing = myListings[0]
    await prisma.match.create({
        data: {
            listingAId: myBestListing.id,
            listingBId: listingId,
            userAId: userId,
            userBId: targetListing.userId,
            status: 'liked'
        }
    })

    res.json({ match: false })
})

// Meine Matches abrufen
router.get('/matches', requireAuth, async (req, res) => {
    const userId = req.user.id

    const matches = await prisma.match.findMany({
        where: {
            OR: [{ userAId: userId }, { userBId: userId }],
            status: 'matched'
        },
        include: {
            listingA: true,
            listingB: true,
            userA: { select: { id: true, username: true, avatar: true, steamId: true } },
            userB: { select: { id: true, username: true, avatar: true, steamId: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    res.json(matches)
})

export default router