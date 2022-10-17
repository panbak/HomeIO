const { convertDateToUTC } = require('../helpers');

const saveConsumption = async (device, data) => {
    let Consumption = require('../models/Consumption')(device.device_code);
    //console.log(new Date(Date.parse(data.timestamp)));

    let UTCtimestamp = convertDateToUTC(new Date(Date.parse(data.timestamp)));
    let UTCStartTimestamp = new Date(UTCtimestamp.getTime()).setMinutes(0, 0);
    let UTCEndTimestamp = new Date(UTCtimestamp.getTime()).setMinutes(59, 59);

    try {
        let record = await Consumption.findOne({ start_timestamp: UTCStartTimestamp, end_timestamp: UTCEndTimestamp });
        //console.log('RECORD: ' + record);
        if (record == null) {
            const consumption = new Consumption({
                device: device._id,
                start_timestamp: UTCStartTimestamp,
                end_timestamp: UTCEndTimestamp,
                measurements: { value: data.value, kwh: (data.value * (1 / 60)) / 1000, timestamp: UTCtimestamp }, //watt*(1 hour/60 minutes)/1000 to convert to kwh assuming sampling is done for every minute
                count: 1,
                sum: data.value,
                total_kwh: (data.value * (1 / 60)) / 1000
            });
            await consumption.save();
        } else {
            const updatedConsumption = await Consumption.updateOne(
                { _id: record._id },
                { $inc: { count: 1, sum: data.value, total_kwh: (data.value * (1 / 60)) / 1000 }, $push: { measurements: { value: data.value, kwh: (data.value * (1 / 60)) / 1000, timestamp: UTCtimestamp } } }
            );
        }

        return true;

    } catch (err) {
        return false;
    }

}

exports.saveConsumption = saveConsumption;