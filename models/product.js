const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
const { Schema } = mongoose;
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        lowercase: true,
        enum: ['phone', 'memory', 'ink', 'audio', 'accessories']
    },
    brand:
    {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description:
    {
        type: String,
        required: true
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    }
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;