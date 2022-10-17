const mongoose = require('mongoose');

const DeviceInstanceSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: false
    },
    color: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DeviceInstance', DeviceInstanceSchema);