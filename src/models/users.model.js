const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            minLength: 5
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        }
    }
);

const saltRounds = 10;

userSchema.pre('save', function (next)
{
    let user = this;

    if (user.isModified('password'))
    {
        bcrypt.genSalt(saltRounds, function (err, salt)
        {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hashPassword)
            {
                if (err) return next(err);
                user.password = hashPassword;
                next();
            })
        })
    }
    else
    {
        next();
    }
})

userSchema.statics.ComparePass = async function (email, plainPassword, cb)
{
    let user = await User.findOne({ email: email.toLocaleLowerCase() });
    
    if (!user) return cb({error: `아이디 없음!`});

    let isMatch = await bcrypt.compare(plainPassword, user.password);

    if (isMatch) return cb(null, user, null);
    else return cb({error: `비밀번호 틀림!`});
}

const User = mongoose.model('User', userSchema);
module.exports = User;