import 'dotenv/config'

import express from 'express'
import session from 'express-session'
import passport from 'passport'
import cors from 'cors'

import { setupSteamStrategy } from './routes/auth.js'
import authRouter from './routes/auth.js'
import listingsRouter from './routes/listings.js'
import swipeRouter from './routes/swipe.js'
import inventoryRouter from './routes/inventory.js'
import MongoStore from "connect-mongo";
import {connectDB} from "./config/db.js";


const app = express()
app.set('trust proxy', 1)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}))

await connectDB()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())

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