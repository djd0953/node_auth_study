const express = require('express');
const { default: mongoose } = require('mongoose');
const passport = require('passport');
const cookieSession = require('cookie-session');
const path = require('path');
const app = express();
const port = 4000;

const cookieEncryptionKey = 'super-secret-key';

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
mongoose.connect('mongodb+srv://userHJJ:HJJ@cluster0.nu6j2ch.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('mongodb connected'))
.catch(err => console.error(err));

app.get("/login", (req, res) => 
{
    res.render("login");
});

app.post('/login', (req, res, next) => 
{
    passport.authenticate('local', (err, user, info) => 
    {
        if (err) return next(err);
        if (user === false) 
        {
            return res.json(info);
        }

        req.logIn(user, (err) => 
        {
            if (err) return next(err);
            res.redirect('/');
        });
    })(req, res, next);
});

app.get('/', (req, res) =>
{
    res.render('index');
})

app.get('/signup', (req,res) => 
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

app.listen(port, () => 
{
    console.log(`Listen on ${port}`);
})