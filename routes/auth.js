const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// Register user 
router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY)
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch(err){
        res.status(500).json(err);
    }
});


//login user
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        !user && res.status(401).json("Wrong crendentials");

        const hashPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const password = hashPassword.toString(CryptoJS.enc.Utf8);

        if(password !== req.body.password){
            res.status(401).json("Wrong crendentials");
        }

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        },
            process.env.JWT_SEC,
            { expiresIn: "1d" }
        )

        const { dbpassword, ...data } = user._doc;
        res.status(200).json({...data, accessToken});

    } catch(err){
        res.status(500).json(err);
    }
})


module.exports = router;
