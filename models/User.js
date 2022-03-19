const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    img: {
        type: String,
    },
    status: {
        type: String,
        default: "active"
    },
    transaction: {
        type: Number,
        default: 2000
    }
}, { timestamps: true })


module.exports = mongoose.model("User", userSchema);
