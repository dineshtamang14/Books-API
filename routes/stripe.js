const router = require("express").Router();
const Stripe = require("stripe");
const stripe = Stripe("sk_test_51JiB7XSJjBncn0lk4MWAmVZhAjAOAg5M8sctRMUOowEWGQMC9vM6C9fDIvLKdMbof6gJeM0q3K79g1jLiW37NFvu00E2tlgPjZ");


router.post("/payment", (req, res) => {
    stripe.charges.create({
        source: req.body.tokenId,
        amount: req.body.amount,
        currency: "inr",
    }, (stripeErr, stripeRes) => {
        if(stripeErr){
            res.status(500).json(stripeErr);
        } else {
            res.status(200).json(stripeRes);
        }
    });
});


module.exports = router;