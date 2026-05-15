import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const isLocal = process.env.DATABASE_URL?.startsWith('file:')

const libsql = createClient({
    url: process.env.DATABASE_URL,
    authToken: isLocal ? undefined : process.env.DATABASE_AUTH_TOKEN
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

export async function connectDB() {
    try {
        await prisma.$connect()
        console.log('DB verbunden:', isLocal ? 'lokal' : 'Turso')
    } catch (err) {
        console.error('DB Fehler:', err)
        process.exit(1)
    }
}

export default prisma