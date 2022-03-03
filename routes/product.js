const router = require("express").Router();
const Product = require("../models/Product");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
} = require("./verifyToken");


// Create
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const newProdct = new Product(req.body);
    
        try {
            const savedProduct = await newProdct.save();
            res.status(201).json(savedProduct);
        } catch (error) {
            res.status(500).json(error);
    }
});


// update 
router.patch("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json(error);
    }
})


// delete
router.delete("/", verifyTokenAndAdmin, async (req, res)=> {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted");
    } catch (error) {
        res.status(500).json(error);
    }
});

// get all product
router.get("/find/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json({
            Book: {
                title: product.title,
                subtitle: product.subtitle,
                isbn13: product.isbn13,
                price: product.price,
                image: product.image,
                productDes: product.productDes,
            }
        })
    } catch (error) {
        res.status(500).json(error);
    }
});


// get all product
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qname = req.query.search;
    try {
       let products;
       if(qNew){
           products = await Product.find().sort({ createdAt: -1 }).limit(5);
       } else if(qname){
           products = await Product.find({ title: qname })
       } else {
           products = await Product.find();
       }

       const response = {
        count: products.length,
        Books: products.map((doc) => {
          return {
            title: doc.title,
            subtitle: doc.subtitle,
            isbn13: doc.isbn13,
            price: doc.price,
            image: doc.image,
            productDes: doc.productDes,
          };
        }),
      };

       res.status(200).json(response);

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
