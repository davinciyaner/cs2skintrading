import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    steamId: { type: String, required: true },
    assetId: { type: String, required: true },
    marketHashName: { type: String, required: true },
    iconUrl: String,
    floatValue: Number,
    wear: String,
    price: { type: Number, required: true },
    priceMin: { type: Number, required: true },
    priceMax: { type: Number, required: true },
    active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Listing', listingSchema)