const mongoose = require('mongoose');

const DeviceShareSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    device_instance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeviceInstance",
        required: true
    },
    accepted: {
        type: Boolean,
        default: false
    },
    rejected: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DeviceShare', DeviceShareSchema);