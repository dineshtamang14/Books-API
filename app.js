const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const paymentRoute = require("./routes/stripe");
dotenv.config();


const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongodburl = process.env.URL;

mongoose.connect(mongodburl).then(() => {
    console.log("DB Connected")
}).catch(err => console.log(err));

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/carts", cartRoute);
app.use("/orders", orderRoute);
app.use("/checkout", paymentRoute);
app.get("/", (req, res)=> {
    res.status(200).json({
        msg: "Book api is working correctly!"
    })
})
app.use((req, res)=> {
    res.status(404).json({
        msg: "404 NOT FOUND!"
    })
})

module.exports = app;
