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
const upload = require("express-fileupload");
dotenv.config();


const app = express();

app.use(morgan('dev'));
app.use(upload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 5000;
const mongodburl = process.env.URL;

mongoose.connect(mongodburl).then(() => {
    console.log("DB Connected")
}).catch(err => console.log(err));

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/carts", cartRoute);
app.use("/orders", orderRoute);
app.use("/payment", paymentRoute);
app.use((req, res)=> {
    res.status(404).json({
        msg: "404 NOT FOUND!"
    })
})

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})
