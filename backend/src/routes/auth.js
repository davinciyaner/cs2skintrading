import express from 'express'
import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import prisma from '../config/db.js'

const router = express.Router()

// Inventar von Steam laden und in DB speichern
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

        // Alle Items upserten (neu oder updaten)
        for (const item of items) {
            await prisma.inventoryItem.upsert({
                where: { userId_assetId: { userId, assetId: item.assetId } },
                update: {
                    marketHashName: item.marketHashName,
                    iconUrl: item.iconUrl,
                    tradable: item.tradable
                },
                create: {
                    userId,
                    assetId: item.assetId,
                    marketHashName: item.marketHashName,
                    iconUrl: item.iconUrl,
                    tradable: item.tradable
                }
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

                const user = await prisma.user.upsert({
                    where: { steamId },
                    update: {
                        username: profile.displayName,
                        avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value,
                    },
                    create: {
                        steamId,
                        username: profile.displayName,
                        avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value,
                        profileUrl: profile._json.profileurl
                    }
                })

                console.log(`User eingeloggt: ${user.username}`)

                // Inventar im Hintergrund syncen (nicht auf Ergebnis warten)
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
            const user = await prisma.user.findUnique({ where: { id } })
            done(null, user)
        } catch (err) {
            done(err)
        }
    })
}

// Route: Steam Login starten
router.get('/steam',
    passport.authenticate('steam', { failureRedirect: '/' })
)

// Route: Steam Callback nach Login
router.get('/steam/return',
    passport.authenticate('steam', { failureRedirect: process.env.FRONTEND_URL }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL + '/listings')
    }
)

// Route: Aktuellen User abrufen
router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Nicht eingeloggt' })
    }
    res.json({
        id: req.user.id,
        steamId: req.user.steamId,
        username: req.user.username,
        avatar: req.user.avatar
    })
})

// Route: Inventar manuell neu syncen
router.post('/sync-inventory', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt' })
    await syncInventory(req.user.id, req.user.steamId)
    res.json({ success: true })
})

// Route: Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect(process.env.FRONTEND_URL)
    })
})

export default router