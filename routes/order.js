require("dotenv").config();
const router = require("express").Router();
const nodemailer = require("nodemailer");
const Order = require("../models/Order");
const {google} = require("googleapis");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
} = require("./verifyToken");


// create order 
router.post("/", verifyToken, async (req, res) => {
    const newOrder = new Order(req.body);

    try {
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json(error);
    }
});


// update order 
router.patch("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, { 
                $set: req.body, 
            }, { new: true}
        );
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json(error);
    }
});


// delete order 
router.delete("/:id", verifyTokenAndAdmin, async (req, res)=> {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order has been deleted!");
    } catch (error) {
        res.status(500).json(error);
    }
});


// get users orders 
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json(error);
    }
});


// get all orders 
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json(error);
    }
});


// get monthly income status
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const productId = req.query.pid;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  
    try {
      const income = await Order.aggregate([
        { $match: { createdAt: { $gte: previousMonth }, ...(productId && { 
            products: { $elemMatch: { productId } },
        }), } },
        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales" },
          },
        },
      ]);
      res.status(200).json(income);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// sending mail to customer
router.post("/send_mail", async (req, res)=> {
    let {url, email, name} = req.body;

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
                subject: "Book purchase delivery",
                html: `<div className="email" style="
                border: 1px solid black;
                padding: 20px;
                font-family: sans-serif;
                line-height: 2;
                font-size: 20px; 
                ">
                <h5>Thank your ${name} for shopping with us!</h5>
                <ol type="1">
                <h5>Here is the pdf links of your ordered books: </h5>
                ${url.map(
                  function(item) {
                    return `<li>${item.pdf}</li>`
                  }
                )}</ol>
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
})

module.exports = router;
