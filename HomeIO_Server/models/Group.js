const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeviceInstance",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Group', GroupSchema);