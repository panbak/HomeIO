const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//const { logger } = require('../helpers');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minLength: 6,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    verification_token: {
        type: String
    },
    last_login: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    this.email = this.email.toLowerCase().trim();
    next();
});

UserSchema.pre('updateOne', async function (next) {
    //logger('user_update', null, this.getQuery()._id.toString(), "Αλλαγή στοιχείων χρήστη");
    if (this.getUpdate().$set.password !== undefined && this.getUpdate().$set.password !== null && (this.getUpdate().$set.password).length > 0) {
        console.log('[UPDATING PASSWORD]');
        const salt = await bcrypt.genSalt();
        this.getUpdate().$set.password = await bcrypt.hash(this.getUpdate().$set.password, salt);
    }
    if (this.getUpdate().$set.email !== undefined && this.getUpdate().$set.email !== null && (this.getUpdate().$set.email).length > 0) {
        this.getUpdate().$set.email = this.getUpdate().$set.email.toLowerCase().trim();
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);