
const Store = require('./models/store');
const Product = require('./models/product');
const BaseJoi = require('joi');
const ExpressError = require('./utils/ExpressError');
const sanitizeHtml = require('sanitize-html');


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log(req.user);
        req.flash('error', 'You must be log in first');
        return res.redirect('/stores/login');
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if (req.user.user !== 'admin') {
        req.flash('error', 'You must be of type admin');
        return res.redirect('/stores/login');
    }

    next();
}

module.exports.isStoreOrAdmin = (req, res, next) => {
    if (req.user.user === 'store') {
        req.flash('success', 'Store access')
    } else if (req.user.user === 'admin') {
        req.flash('success', 'Admin access')
    } else {
        req.flash('error', 'You must be of type admin or store');
        return res.redirect('/stores');
    }
    next();
}

module.exports.isAuth = async (req, res, next) => {
    const { id } = req.params;
    const store = await Store.findById(id);
    const product = await Product.findById(id);
    if (store) {
        if (!store.equals(req.user._id)) {
            req.flash('error', 'You dont have permission');
            return res.redirect(`/stores/${id}`);
        }
        next();
    } else {
        if (!product.store.equals(req.user._id)) {
            req.flash('error', 'You dont have permission');
            return res.redirect(`/stores`);
        }
        next()
    }
}

module.exports.validateProduct = (req, res, next) => {
    const productSchema = Joi.object({
        product: Joi.object({
            brand: Joi.string().required().escapeHTML(),
            name: Joi.string().required().escapeHTML(),
            price: Joi.string().required().min(0).escapeHTML(),
            image: Joi.string().required().escapeHTML(),
            description: Joi.string().escapeHTML(),
            category: Joi.string().escapeHTML()
        }).required()
    })
    const { error } = productSchema.validate(req.body);
    if (error) {
        // const { id } = req.params;
        const msg = error.details.map(el => el.message).join(',')
        // req.flash('error', msg)
        // res.redirect(`/stores/${id}/products/new`)
        throw new ExpressError(msg, 400)
    }
    next()
}

