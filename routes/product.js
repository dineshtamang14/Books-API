const router = require("express").Router();
const Product = require("../models/Product");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
} = require("./verifyToken");


// Create
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const {name, data} = req.files.productImg;

    if(name && data){
        const newProdct = new Product({
            title: req.body.title,
            desc: req.body.desc,
            imgData: data,
            img: `http://localhost:5000/img/`,
            categories: req.body.categories,
            price: req.body.price,
            inStock: req.body.inStock
        });
    
        try {
            const savedProduct = await newProdct.save();
            res.status(201).json(savedProduct);
        } catch (error) {
            res.status(500).json(error);
        }
    }
});

router.get("/img/:id", async (req, res) => {
    const id = req.params.id;
    await Product.findById(id).exec().then(data => {
        res.end(data.imgData);
    }).catch(err => {
        console.log(err);
    })
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
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json(error);
    }
});


// get all product
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
       let products;
       if(qNew){
           products = await Product.find().sort({ createdAt: -1 }).limit(5);
       } else if(qCategory){
           products = await Product.find({ categories: {
               $in: [qCategory],
           } })
       } else {
           products = await Product.find();
       }

       res.status(200).json(products);

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
