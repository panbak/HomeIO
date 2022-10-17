const mongoose = require('mongoose');

const DeviceSchema = mongoose.Schema({
    device_code: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: Boolean,
        default: false
    },
    instances: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviceInstance"
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Device', DeviceSchema);