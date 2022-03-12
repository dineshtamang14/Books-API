const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true 
    },
    desc: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true,
    },
    categories: { 
        type: Array,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    rating: { 
        type: Number,
        default: 3
    },
    isbn13: {
      type: String,
      default: "1001605784161"  
    }
}, { timestamps: true })


module.exports = mongoose.model("Product", productSchema);
