const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users.model');

// req.logIn(user)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// client => session => request
passport.deserializeUser((id, done) => {
    User.findById(id)
    .then(user => {
        done(null, user);
    });
});

passport.use('local', new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, async (email, password, done) => 
    {
        await User.ComparePass(email, password, (err, user, info) => 
        {
            return done(err, user, info);
        })
    }
))