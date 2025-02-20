const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String,
    },
    lastSeen: {
        type: Date,
        default: null
    }
},
    {
        timestamps: true
    });

userSchema.pre('save', async function (next) {
    if (!this.isModified) {
        next();
    }
    const salt = await bcrypt.genSalt(16);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.verify = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;