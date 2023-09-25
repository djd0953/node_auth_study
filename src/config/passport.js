const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users.model');

// req.logIn(user)
passport.serializeUser((user, done) => 
{
    console.log(user);
    done(null, user.id);
});

// client => session => request
passport.deserializeUser((id, done) => 
{
    User.findById(id)
    .then(user => {
        done(null, user);
    });
});

const localStrategyConfig = new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, async (email, password, done) => 
    {
        await User.ComparePass(email, password, (err, user, info) => 
        {
            return done(err, user, info);
        })
    }
);
passport.use('local', localStrategyConfig);

const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const GoogleStrategyConfig = new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: '/auth/google/callback',
    scope: ['email', 'profile']
}, async (accessToken, refreshToken, profile, done) => 
{
    await User.findOne({googleID: profile.id})
    .then((err, user) =>
    {
        if (err) return done(err);

        if (!user)
        {
            user = new User();
            user.email = profile.emails[0].value;
            user.googleId = profile.id;
            user.save()
            .then(() => 
            {
                return done(null, user);
            })
            .catch((err) => 
            {
                console.log(err);
                return done(err);
            })
        }
        else
        {
            return done(null, user);
        }

    });
});

passport.use('google', GoogleStrategyConfig);
