import mongoose from 'mongoose'

const inventoryItemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assetId: { type: String, required: true },
    marketHashName: { type: String, required: true },
    iconUrl: String,
    tradable: { type: Boolean, default: true },
}, { timestamps: true })

inventoryItemSchema.index({ userId: 1, assetId: 1 }, { unique: true })

export default mongoose.model('InventoryItem', inventoryItemSchema)