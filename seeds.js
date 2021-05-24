const Product = require('./models/product');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/storeApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Mongo connected");
    })
    .catch(err => {
        console.log(err);
    });

// const p = new Product({
//     name: "iphone 7",
//     price: 700.99,
//     category: 'phone',
// })

// p.save().then(p => {
//     console.log(p);
// })
//     .catch(e => {
//         console.log(e);
//     });
const deleteAllProducts = async () => {
    await Product.deleteMany({}).then(res => {
        console.log("all products deleted");
    }).catch(e => {
        console.log("fail");
    })
}

// const seedProducts = [
//     {
//         name: "iphone 5",
//         price: 400.99,
//         category: 'phone',
//     },
//     {
//         name: "HP 664",
//         price: 25.99,
//         category: 'ink',
//     },
//     {
//         name: "Klip Lite Blast",
//         price: 215.99,
//         category: 'audio',
//     },
//     {
//         name: "Podium ",
//         price: 15.99,
//         category: 'accessories',
//     },
// ]


deleteAllProducts();



// const p = new Product({
//     name: "iphone 7",
//     price: 700.99,
//     category: 'phone',
// })

// p.save().then(p => {
//     console.log(p);
// })
//     .catch(e => {
//         console.log(e);
//     });






// Product.insertMany(seedProducts)
//     .then(res => {
//         console.log(res)
//     })
//     .catch(e => {
//         console.log(e)
//     });
