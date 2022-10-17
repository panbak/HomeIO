const Device = require('../models/Device');
const Log = require('../models/Log');
const { saveConsumption } = require('../actions/consumptions');
const { logger } = require('../helpers');
const _ = require('underscore');

const commandParser = async (packet, client) => {
    var device;
    var data; //get data. call toString to cast Buffer objects
    try {
        data = JSON.parse(packet.payload.toString());
    } catch (e) {
        console.log("[PARSING ERROR] Error parsing payload: ", packet.payload.toString(), e);
        return;
    }
    console.log(data);
    let topic_parts = packet.topic.split('/'); //split packet to device and theme
    try {
        device = await Device.findOne({ device_code: topic_parts[0] }).populate('instances', 'user_id');
    } catch (e) {
        console.log('[Error finding device]');
    }
    console.log("command for topic parts: ", topic_parts);
    switch (topic_parts[1]) {
        case 'state':
            try {
                // console.log(typeof _.pluck(device.instances, 'user_id').map(i => i.toString())[0]);
                // console.log(typeof client.entity_object._id);
                console.log("[INSTANCES]", device);
                if (_.pluck(device.instances, 'user_id').map(i => i.toString()).includes(client.entity_object._id.toString())) { //check if user has access to device
                    device.set({ state: data.value });
                    await device.save();

                    console.log("[STATE CHANGE] for: ", device.device_code, " to ", device.state);
                }

                let description = "Η κατάσταση της συσκευής άλλαξε σε : ";
                if (device.state) {
                    description += 'Απενεργοποιημένη';
                } else {
                    description += 'Ενεργοποιημένη';
                }

                logger('device_state_change', device._id, client.entity_object._id.toString(), description);

            } catch (e) {
                console.log(`Error while toggling device: ${topic_parts[0]} `, e);
            }
            break;
        case 'consumption':
            try {
                if (topic_parts[0] === client.entity_object.device_code && client.entity_type === "device") {
                    await saveConsumption(device, data);
                } else {
                    throw ('device ' + client.entity_object.device_code + ' cannot publish in this channel');
                }
            } catch (e) {
                console.log(`Error while saving consumption: ${topic_parts[0]} `, e);
            }
            break;
        case '':
            console.log('no topic');
    }
}

exports.commandParser = commandParser;