if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const categories = ['phone', 'memory', 'ink', 'audio', 'accessories'];

//declarations packages
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const ExpressError = require('./utils/ExpressError');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
// const dbUrl = ;
const dbUrl = 'mongodb://localhost:27017/storeApp';
const MongoDBStore = require('connect-mongo');

//models declarations
const Product = require('./models/product');
const Store = require('./models/store');

//routes
const productRoutes = require('./routes/products');
const storeRoutes = require('./routes/stores');


mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => {
        console.log("Mongo connected");
    })
    .catch(err => {
        console.log(err);
    })

app.engine('ejs', ejsMate);


//app.set
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//app.use
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.use(mongoSanitize({
    replaceWith: '_xxx'
}));

app.use(express.urlencoded({ extended: true }));
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));
//serve public directory 
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret: 'secret',
    touchAfter: 24 * 3600
});

store.on("error", function (e) {
    console.log("Session Store Error!");
});
const secret = process.env.SECRET || 'secret'
const sessionConfig = {
    name: '_cuuid',
    secret,
    store,
    resave: false,
    saveUninitialized: true,
    cookie: {
        HttpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Store.authenticate()));

passport.serializeUser(Store.serializeUser());
passport.deserializeUser(Store.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});



app.use('/products', productRoutes);
app.use('/stores', storeRoutes);

//routes 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'something went wrong' } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', { err });
})

app.listen(process.env.PORT, () => {
    console.log(`serving on ${port}`);
});