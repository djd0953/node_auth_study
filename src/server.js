require('dotenv').config();
const express = require('express');
const { default: mongoose } = require('mongoose');
const passport = require('passport');
const cookieSession = require('cookie-session');
const {checkAuthenticated, checkNotAuthenticated} = require('./middlewares/auth.js');
const path = require('path');
const app = express();
const port = process.env.PORT;

const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_KEY;

app.use(cookieSession({
    keys: [cookieEncryptionKey]
}));

// register regenerate & save after the cookieSession middleware initialization
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb();
        };
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb();
        };
    }
    next();
});

const User = require("./models/users.model.js");

// view engine setup
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport.js');

mongoose.set('strictQuery', false);
mongoose.connect(`${process.env.MONGO_URI}`)
.then(() => console.log('mongodb connected'))
.catch(err => console.error(err));

app.get('/', checkAuthenticated, (req, res) =>
{
    res.render('index');
})

app.get("/login", checkNotAuthenticated, (req, res) => 
{
    res.render("login");
});

app.post('/login', (req, res, next) => 
{
    passport.authenticate('local', (err, user, info) => 
    {
        if (err)
        {
            console.log(err);
            res.redirect('/login');
        }

        if (user === false) 
        {
            console.log(err, user, info);
            res.redirect('/login');
            // console.log(info);
            // res.redirect('/');
        }

        req.logIn(user, (err) => 
        {
            if (err) return next(err);
            res.redirect('/');
        });
    })(req, res, next);
});

app.get('/signup', checkNotAuthenticated, (req,res) => 
{
    res.render('signup');
});

app.post('/signup', async (req, res) => 
{
    // user 객체를 생성
    const user = new User(req.body);

    try
    {
        // user 컬렉션에 유저를 저장
        await user.save();
        return res.status(200).json({success: true});
    }
    catch (err)
    {

    }
})

app.post('/logout', async (req, res, next) => 
{
    req.logout(function (err)
    {
        if (err) return next(err);
        res.redirect('/login');
    })
})

app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/callback', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));

app.listen(port, () => 
{
    console.log(`Listen on ${port}`);
})