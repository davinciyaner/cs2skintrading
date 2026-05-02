import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaLibSql } from '@prisma/adapter-libsql';

const isLocal = process.env.DATABASE_URL?.startsWith('file:')

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: isLocal ? undefined : process.env.DATABASE_AUTH_TOKEN
})

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