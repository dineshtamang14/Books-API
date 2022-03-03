const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true 
    },
    subtitle: {
        type: String,
        required: true
    },
    isbn13: {
      type: String,
      default: "1001605784161"  
    },
    price: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })


module.exports = mongoose.model("Product", productSchema);
