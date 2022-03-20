require("dotenv").config();
const router = require("express").Router();
const nodemailer = require("nodemailer");
const Order = require("../models/Order");
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

router.post("/send_mail", verifyToken, async (req, res)=> {
    let {url, email, name} = req.body;
    const transport = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: "dineshshah960@gmail.com",
			pass: "SelenaGomez"
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

	transport.sendMail(mailOptions, function (err, info) {
        if(err){
            res.status(500).json({msg: "server error", error: err});
        } else {
            res.status(200).json({msg: "successfully send email", data: info});
        }
     });
})

module.exports = router;
