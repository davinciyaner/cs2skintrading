import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
    url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

export async function connectDB() {
    try {
        await prisma.$connect()
        console.log('SQLite verbunden')
    } catch (err) {
        console.error('DB Fehler:', err)
        process.exit(1)
    }
}

export default prisma