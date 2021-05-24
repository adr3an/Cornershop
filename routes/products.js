const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Product = require('../models/product');
const Store = require('../models/store');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isStoreOrAdmin, isAuth, validateProduct } = require('../middleware');
const categories = ['phone', 'memory', 'ink', 'audio', 'accessories'];
const flash = require('connect-flash');
const ExpressError = require('../utils/ExpressError')

//product routes
router.get('/', catchAsync(async (req, res) => {

    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category }).populate('store');
        res.render("products/index", { products, category });
    } else {
        const products = await Product.find({}).populate('store');

        res.render("products/index", { products, category: 'All' });
    }

}));
router.get('/new', isLoggedIn, isStoreOrAdmin, catchAsync(async (req, res) => {
    const store = await Store.findById(id);
    res.render('products/new', { categories, store });
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('store');
    res.render('products/show', { product })
}));


// router.post('/new', isLoggedIn, async (req, res) => {
//     const product = new Product(req.body.product);
//     await product.save();
//     res.redirect('/products')
// });


router.get('/:id/edit', isLoggedIn, isAuth, catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
}));

router.put('/:id', isLoggedIn, isAuth, validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, req.body.product, { runValidators: true, new: true });
    req.flash('success', 'Campground successfully edited')
    res.redirect(`/products/${id}`)
}));

router.delete('/:id', isLoggedIn, isAuth, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Product successfully deleted!')
    res.redirect('/products');
}));

module.exports = router;