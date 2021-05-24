const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose')
const Product = require('./product')

const storeSchema = new Schema({
    name: {
        type: String,

    },

    address: {
        type: String,
        required: [true, "address required"]
    },
    email: {
        type: String,
        required: [true, "Email required"]
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    user: {
        type: String,
        lowercase: true,
        enum: ['admin', 'store', 'user'],
        required: [true, "type required"]

    },
});

storeSchema.plugin(passportLocalMongoose);

storeSchema.post('findOneAndDelete', async function (store) {
    if (store.products.length) {
        await Product.deleteMany({ _id: { $in: store.products } });
    }
});

const Store = mongoose.model('Store', storeSchema);


module.exports = Store;