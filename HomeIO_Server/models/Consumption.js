const mongoose = require('mongoose');


const ConsumptionSchema = mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: true
    },
    start_timestamp: {
        type: Date,
        required: true
    },
    end_timestamp: {
        type: Date
    },
    measurements: [
        {
            value: {
                type: Number,
                required: true
            },
            kwh: {
                type: Number,
                required: true
            },
            timestamp: {
                type: Date,
                required: true
            }
        }
    ],
    count: {
        type: Number,
        default: 0
    },
    total_kwh: {
        type: Number,
        default: 0
    },
    sum: {
        type: Number,
        default: 0
    }
});


function DynamicConsumptionSchema(prefix) {

    return mongoose.model(prefix + '.Consumption', ConsumptionSchema);
}

module.exports = DynamicConsumptionSchema;