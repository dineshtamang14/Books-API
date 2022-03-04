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
                category: product.categories,
                rating: product.rating,
                isbn13: product.isbn13,
                price: product.price,
                image: product.image,
                inStock: product.inStock,
                url: "https://itbook.store/files/9781617294136/chapter2.pdf"
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
    const qCategory = req.query.category;
    let regex = new RegExp(qname, 'i');
    try {
       let products;
       if(qNew){
           products = await Product.find().sort({ createdAt: -1 }).limit(5);
       } else if(qname){
           products = await Product.find({ title: regex })
       } else if(qCategory){
            products = await Product.find({
                categories: {
                    $in: [qCategory],
                },
            });
       } else {
           products = await Product.find();
       }

       const response = {
        count: products.length,
        Books: products.map((doc) => {
          return {
            title: doc.title,
            subtitle: doc.subtitle,
            category: doc.categories,
            rating: doc.rating,
            isbn13: doc.isbn13,
            price: doc.price,
            image: doc.image,
            inStock: doc.inStock,
            url: "https://itbook.store/files/9781617294136/chapter2.pdf"
          };
        }),
      };

       res.status(200).json(response);

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
