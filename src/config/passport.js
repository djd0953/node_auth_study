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
        await User.findOne({ email: email.toLocaleLowerCase() })
        .then(user => 
        {
            if (!user) return done(null, false, { message: `비번 틀림!` });
            User.comparePassword(password, (err, isMatch) => 
            {
                if (err) return done(err);
                if (isMatch === true) return done(null, user);
        
                return done(null, false, isMatch);
            });
        })
        .catch(err => done(err));
    }
))