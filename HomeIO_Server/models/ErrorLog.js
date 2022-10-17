const mongoose = require('mongoose');

const ErrorLogSchema = mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('ErrorLog', ErrorLogSchema);