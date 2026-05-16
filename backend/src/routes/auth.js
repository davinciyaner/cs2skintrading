import express from 'express'
import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import User from '../models/User.js'
import InventoryItem from '../models/InventoryItem.js'

const router = express.Router()

async function syncInventory(userId, steamId) {
    try {
        const res = await fetch(
            `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=75`,
            { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
        )
        if (!res.ok) return

        const { assets, descriptions } = await res.json()
        if (!assets || !descriptions) return

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
        }).filter(i => i.tradable && i.marketHashName !== 'Unknown')

        for (const item of items) {
            await InventoryItem.findOneAndUpdate(
                { userId, assetId: item.assetId },
                { ...item, userId },
                { upsert: true, new: true }
            )
        }
        console.log(`Inventar sync: ${items.length} Items für ${steamId}`)
    } catch (err) {
        console.error('Inventar sync Fehler:', err.message)
    }
}

export function setupSteamStrategy() {
    passport.use(new SteamStrategy(
        {
            returnURL: process.env.STEAM_RETURN_URL,
            realm: process.env.STEAM_REALM,
            apiKey: process.env.STEAM_API_KEY
        },
        async (identifier, profile, done) => {
            try {
                const user = await User.findOneAndUpdate(
                    { steamId: profile.id },
                    {
                        username: profile.displayName,
                        avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value,
                        profileUrl: profile._json.profileurl
                    },
                    { upsert: true, new: true }
                )
                syncInventory(user._id, profile.id)
                return done(null, user)
            } catch (err) {
                return done(err)
            }
        }
    ))

    passport.serializeUser((user, done) => done(null, user._id))

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id)
            done(null, user)
        } catch (err) {
            done(err)
        }
    })
}

router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }))

router.get('/steam/return',
    passport.authenticate('steam', { failureRedirect: process.env.FRONTEND_URL }),
    (req, res) => res.redirect(process.env.FRONTEND_URL + '/listings')
)

router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt' })
    res.json({
        id: req.user._id,
        steamId: req.user.steamId,
        username: req.user.username,
        avatar: req.user.avatar
    })
})

router.post('/sync-inventory', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt' })
    await syncInventory(req.user._id, req.user.steamId)
    res.json({ success: true })
})

router.get('/logout', (req, res) => {
    req.logout(() => res.redirect(process.env.FRONTEND_URL))
})

export default router