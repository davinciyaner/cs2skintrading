import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    steamId: { type: String, unique: true, required: true },
    username: String,
    avatar: String,
    profileUrl: String,
    steamApiKey: String,
}, { timestamps: true })

export default mongoose.model('User', UserSchema)