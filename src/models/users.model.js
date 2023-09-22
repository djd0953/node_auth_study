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

userSchema.methods.comparePassword = function (plainPassword, cb)
{
    // bcrypt compare 비교
    if (plainPassword === this.password)
    {
        cb(null, true);
    }
    else
    {
        cb(null, {email:this.email, password: this.password});
    }

    return cb({error: 'error'});
}
const User = mongoose.model('User', userSchema);
module.exports = User;