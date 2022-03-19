const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true 
    },
    img: {
        type: String,
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
    number: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: "Mumbai, India"
    },
    isAdmin: {
        type: Boolean,
        default: false
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
