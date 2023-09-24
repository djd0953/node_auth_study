const mongoose = require('mongoose');

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

userSchema.statics.ComparePass = async function (email, plainPassword, cb)
{
    let user = await User.findOne({ email: email.toLocaleLowerCase() });
    
    if (!user) return cb(null, false, {message: `비번 틀림!`});
    if (plainPassword === user.password) return cb(null, user);
    else return cb(null, false, {message: `비번 틀림!2`});
}

const User = mongoose.model('User', userSchema);
module.exports = User;