import express from 'express'
import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import db from '../config/db.js'

const router = express.Router()

async function syncInventory(userId, steamId) {
    try {
        const res = await fetch(
            `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=75`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                }
            }
        )

        if (!res.ok) {
            console.warn(`Inventar sync fehlgeschlagen für ${steamId}: ${res.status}`)
            return
        }

        const data = await res.json()
        const { assets, descriptions } = data
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
        }).filter(item => item.tradable && item.marketHashName !== 'Unknown')

        for (const item of items) {
            await db.execute({
                sql: `INSERT INTO InventoryItem (id, userId, assetId, marketHashName, iconUrl, tradable, createdAt, updatedAt)
                      VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                      ON CONFLICT(userId, assetId) DO UPDATE SET
                        marketHashName = excluded.marketHashName,
                        iconUrl = excluded.iconUrl,
                        tradable = excluded.tradable,
                        updatedAt = datetime('now')`,
                args: [userId, item.assetId, item.marketHashName, item.iconUrl, item.tradable ? 1 : 0]
            })
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
                const steamId = profile.id
                const username = profile.displayName
                const avatar = profile.photos?.[2]?.value || profile.photos?.[0]?.value
                const profileUrl = profile._json.profileurl

                // Upsert User
                await db.execute({
                    sql: `INSERT INTO User (id, steamId, username, avatar, profileUrl, createdAt)
                          VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, datetime('now'))
                          ON CONFLICT(steamId) DO UPDATE SET
                            username = excluded.username,
                            avatar = excluded.avatar`,
                    args: [steamId, username, avatar, profileUrl]
                })

                const result = await db.execute({
                    sql: `SELECT * FROM User WHERE steamId = ?`,
                    args: [steamId]
                })

                const user = result.rows[0]
                console.log(`User eingeloggt: ${user.username}`)

                syncInventory(user.id, steamId)

                return done(null, user)
            } catch (err) {
                return done(err)
            }
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM User WHERE id = ?`,
                args: [id]
            })
            done(null, result.rows[0] ?? null)
        } catch (err) {
            done(err)
        }
    })
}

router.get('/steam',
    passport.authenticate('steam', { failureRedirect: '/' })
)

router.get('/steam/return',
    passport.authenticate('steam', { failureRedirect: process.env.FRONTEND_URL }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL + '/listings')
    }
)

router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt' })
    res.json({
        id: req.user.id,
        steamId: req.user.steamId,
        username: req.user.username,
        avatar: req.user.avatar
    })
})

router.post('/sync-inventory', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt' })
    await syncInventory(req.user.id, req.user.steamId)
    res.json({ success: true })
})

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect(process.env.FRONTEND_URL)
    })
})

export default router