const mongoose = require('mongoose');

const LogSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['device_state_change', 'failed_login', 'user_update'],
        required: true
    },
    device_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Log', LogSchema);