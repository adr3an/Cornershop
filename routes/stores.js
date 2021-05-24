const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Product = require('../models/product');
const Store = require('../models/store');
const { isLoggedIn, isAdmin, isStoreOrAdmin, isAuth, validateProduct } = require('../middleware');
const categories = ['phone', 'memory', 'ink', 'audio', 'accessories'];
const flash = require('connect-flash');
const users = ['admin', 'store', 'user'];
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');


router.get('/register', (req, res) => {
    res.render('stores/new', { users })
});
router.post('/register', async (req, res) => {
    try {
        const { username, password, user, email, address } = req.body;
        const store = new Store({ email, username, user, email, address });
        const registeredStore = await Store.register(store, password)
        req.login(registeredStore, err => {
            if (err) return (err);
            req.flash('success', 'Welcome to CornerShop!');
            res.redirect('/stores');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/stores/register');
    }

});

router.get('/login', (req, res) => {
    res.render('stores/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/stores/login' }), (req, res) => {
    req.flash('success', 'Welcome back!')
    res.redirect('/stores');
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/stores');
})


//Store routes
router.get('/', async (req, res) => {
    const stores = await Store.find({});
    res.render('stores/index', { stores });
})


router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const store = await Store.findById(id).populate('products');
    res.render('stores/show', { store })
});

router.get('/:id/products/new', isLoggedIn, isAuth, async (req, res) => {
    const { id } = req.params;
    const store = await Store.findById(id);
    res.render('products/new', { categories, id, store });
})

router.post('/:id/products', isLoggedIn, isAuth, validateProduct, async (req, res) => {
    const { id } = req.params;
    const store = await Store.findById(id);
    const product = new Product(req.body.product);
    store.products.push(product);
    product.store = store;
    await store.save();
    await product.save();
    req.flash('success', 'Product successfully added');
    res.redirect(`/stores/${id}`)
});

router.delete('/:id', isLoggedIn, isAuth, async (req, res) => {
    const { id } = req.params;
    await Store.findByIdAndDelete(id);
    req.flash('success', 'store successfuly deleted!');
    res.redirect('/stores');
});

module.exports = router;
