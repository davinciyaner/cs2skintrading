import mongoose from 'mongoose'

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB verbunden')
    } catch (err) {
        console.error('DB Fehler:', err)
        process.exit(1)
    }
}

export default mongoose