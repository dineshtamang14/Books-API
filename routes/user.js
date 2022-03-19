const router = require("express").Router();
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const User = require("../models/User");
const CryptoJS = require("crypto-js");


router.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {
    if(req.body.password){
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.SECTRET_KEY
        )
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json(error);
    }

});


router.delete("/:id", verifyTokenAndAuthorization, async (req, res)=> {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("user has been deleted");
    } catch (error) {
        res.status(500).json(error);
    }
});

// get specific user
router.get("/find/:id", verifyTokenAndAdmin, async (req, res)=> {
    try {
        const user = await User.findById(req.params.id);
        const { dbpassword, ...data } = user._doc;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error);
    }
})

// get alluser
router.get("/", verifyTokenAndAdmin, async (req, res)=> {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch(err){
        res.status(500).json({err});
    }
})

router.get("/", verifyTokenAndAdmin, async (req, res)=>{
    const query = req.query.new;
    try {
        const users = await User.find().sort({ _id: -1 }).limit(5);
        res.status(200).json(users);
    } catch(err){
        res.status(500).json({err});
    }
})


// GET User stats
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            { 
                $project: {
                    month: { $month: "$createdAt" },
                },
             },
             {
                 $group: {
                     _id: "$month",
                     total: { $sum: 1 },
                 },
             }
        ])
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = router;
