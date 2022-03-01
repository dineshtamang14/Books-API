const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const userRoute = require("./routes/user");
const authRouter = require("./routes/auth");
dotenv.config();


const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
const mongodburl = process.env.URL;

mongoose.connect(mongodburl).then(() => {
    console.log("DB Connected")
}).catch(err => console.log(err));

app.use("/auth", authRouter);
app.use("/users", userRoute);

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})
