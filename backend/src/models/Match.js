import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema({
    listingAId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    listingBId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    userAId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userBId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'liked' },
}, { timestamps: true })

export default mongoose.model('Match', matchSchema)