import express from 'express'
import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import prisma from '../config/db.js'

const router = express.Router()

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
                return done(null, user)
            } catch (err) {
                return done(err)
            }
        }
    ))

    // Prisma nutzt string-IDs (cuid), kein _id
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
        res.redirect(process.env.FRONTEND_URL + '/swipe')
    }
)

// Route: Aktuellen User abrufen
router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Nicht eingeloggt' })
    }
    res.json({
        steamId: req.user.steamId,
        username: req.user.username,
        avatar: req.user.avatar
    })
})

// Route: Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect(process.env.FRONTEND_URL)
    })
})

export default router