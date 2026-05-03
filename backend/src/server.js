import 'dotenv/config'

import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'

import { connectDB } from './config/db.js'
import { setupSteamStrategy } from './routes/auth.js'
import authRouter from './routes/auth.js'
import listingsRouter from './routes/listings.js'
import swipeRouter from './routes/swipe.js'
import inventoryRouter from './routes/inventory.js'
import connectSqlite3 from 'connect-sqlite3'
const SQLiteStore = connectSqlite3(session)

const app = express()
app.set('trust proxy', 1)

await connectDB()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}))


app.use(passport.initialize())
app.use(passport.session())
setupSteamStrategy()

app.use('/auth', authRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/swipe', swipeRouter)
app.use('/api/inventory', inventoryRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.listen(process.env.PORT, () => {
    console.log(`Backend läuft auf Port ${process.env.PORT}`)
})