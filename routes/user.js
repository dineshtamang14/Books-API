const dotenv = require("dotenv");
dotenv.config();
const router = require("express").Router();
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const {google} = require("googleapis");


router.post("/forgot", (req, res) => {
    User.find({ email: req.body.email })
    .exec()
    .then((user) => {
        if(user.length < 1){
            return res.status(401).json({
                msg: "Auth failed"
            })
        } else {
            const email = req.body.email;
            const name = user[0].name;
            const id = user[0]._id;

            const CLIENT_ID = "1003759860094-al4ov7v4antggbe7aaf3im3o473folg5.apps.googleusercontent.com";
            const CLIENT_SECRET = "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";
            const REDIRECT_URI = "https://developers.google.com/oauthplayground";
            const REFRESH_TOKEN = "1//043MxkbS87n6fCgYIARAAGAQSNwF-L9IruRRomknlQnE-wAHr8xN1WhgtRzvaNLMixYpx_d-fnIjZkoD--X4sfDjsqFKIlZsVMe4";
        
            const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
            oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
        
            async function sendMail(){
                try {
                    const accessToken = await oAuth2Client.getAccessToken();
                    const transport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            type: 'OAuth2',
                            user: 'dineshshah960@gmail.com',
                            clientId: CLIENT_ID,
                            clientSecret: CLIENT_SECRET,
                            refreshToken: REFRESH_TOKEN,
                            accessToken: accessToken
                        }
                    })
        
                    const mailOptions = {
                        from: "dineshshah960@gmail.com",
                        to: email,
                        subject: "Password Reset Confirmation",
                        html: `<div className="email" style="
                        border: 1px solid black;
                        padding: 20px;
                        font-family: sans-serif;
                        line-height: 2;
                        font-size: 20px; 
                        ">
                        <h4>Hello, ${name}</h4>
                        <h5>please visit this link to reset your password</h5>
                        <h6>https://book-website-project.herokuapp.com/reset/${id}</h6>
                        <h6>have a great day sir..</h6>
                         </div>
                    `
                    };
        
                   const result = await transport.sendMail(mailOptions); 
                   return result;
        
                } catch (error) {
                    console.log(error);
                }
            }
        
            sendMail().then((result) => {
                res.status(200).json({msg: "successfully send email", data: result});
            }).catch((error) => {
                res.status(500).json({msg: "server error", error: error.message});
            })
        }
    })
});

router.patch("/:id", async (req, res) => {
    try {    
        const newPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
        console.log(newPassword);
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                password: newPassword
            }
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
router.get("/", verifyTokenAndAdmin, async (req, res)=>{
    const query = req.query.new;
    try {
        const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();
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
