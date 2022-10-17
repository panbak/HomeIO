const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Device = require('../models/Device');
const DeviceInstance = require('../models/DeviceInstance');
const DeviceShare = require('../models/DeviceShare');
const { getUser, errorLogger } = require('../helpers');
const User = require('../models/User');
const Group = require('../models/Group');
const { getClientStates } = require('../mqtt/clientStates');
const _ = require('underscore');

router.get('/', async (req, res) => {
    let user = await getUser(req);
    let tmpDeviceInstance;
    let tmpDeviceInstances = [];
    try {
        let deviceInstances = await DeviceInstance.find({ user_id: user._id }).populate({ path: 'device', select: ['device_code', 'state'] }).populate('group');
        let deviceStates = await getClientStates(_.pluck(_.pluck(deviceInstances, 'device'), 'device_code'));
        tmpDeviceInstances = deviceInstances.map(deviceInstance => {
            tmpDeviceInstance = { ...deviceInstance };
            tmpDeviceInstance._doc.isOnline = deviceStates[deviceInstance.device.device_code];
            return tmpDeviceInstance._doc;
        });
        return res.status(200).json(tmpDeviceInstances);
    } catch (err) {
        console.log("[ERROR]", err);
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/create',
    body('name').isLength({ min: 3, max: 20 }).trim().escape().withMessage('Το όνομα πρέπει να είναι 3-20 χαρακτήρες'),
    body('description').isLength({ max: 40 }).trim().escape().withMessage('Η περιγραφή πρέπει να είναι 40 χαρακτήρες'),
    body('device_code').isLength({ min: 6, max: 65 }).trim().escape().withMessage('Ο κωδικός συσκεύης πρέπει να είναι 6-10 χαρακτήρες'),
    async (req, res) => {

        const errors = validationResult(req);
        console.log(errors.array());
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let user = await getUser(req);
            let checkIfDoubleEntry = 0;
            await DeviceInstance.find({ user_id: user._id }).populate({ path: 'device', select: 'device_code' }).then((allInstances) => {
                allInstances.forEach((item, index) => {
                    if (item.device.device_code == req.body.device_code) {
                        checkIfDoubleEntry++;
                    }
                });
            });

            if (checkIfDoubleEntry) {
                throw 'Η συσκευή υπάρχει ήδη';
            }

            let countDevices = await Device.countDocuments({ device_code: req.body.device_code });

            if (req.body.group && req.body.group != "none") {
                let group = await Group.findOne({ _id: req.body.group });
                if (!group) {
                    return res.status(400).json({ message: 'Η ομάδα που επιλέξατε δεν υπάρχει' });
                }
            }

            if (countDevices > 0) {
                const device = await Device.findOne({ device_code: req.body.device_code });

                if (req.body.group == 'none') {
                    deviceInstance = new DeviceInstance({
                        user_id: user._id,
                        name: req.body.name,
                        icon: req.body.icon,
                        color: req.body.color,
                        description: req.body.description,
                        device: device._id
                    });
                } else {
                    deviceInstance = new DeviceInstance({
                        user_id: user._id,
                        name: req.body.name,
                        icon: req.body.icon,
                        color: req.body.color,
                        description: req.body.description,
                        device: device._id,
                        group: req.body.group
                    });
                }

                const savedDeviceInstance = deviceInstance.save();

                device.instances.push(deviceInstance);

                await device.save();

                return res.status(200).json(savedDeviceInstance);
            } else {
                let device = new Device({
                    name: req.body.name,
                    description: req.body.description,
                    device_code: req.body.device_code,
                    instances: []
                });
                await device.save();
                device = await Device.findOne({ device_code: req.body.device_code });

                let deviceInstance;
                if (req.body.group == 'none') {
                    deviceInstance = new DeviceInstance({
                        user_id: user._id,
                        name: req.body.name,
                        icon: req.body.icon,
                        color: req.body.color,
                        description: req.body.description,
                        device: device._id
                    });
                } else {
                    deviceInstance = new DeviceInstance({
                        user_id: user._id,
                        name: req.body.name,
                        icon: req.body.icon,
                        color: req.body.color,
                        description: req.body.description,
                        device: device._id,
                        group: req.body.group
                    });
                }

                deviceInstance = await deviceInstance.save();

                device.instances.push(deviceInstance);

                await device.save();

                return res.status(200).json(deviceInstance);
            }
        } catch (err) {
            console.log(err);
            errorLogger(err.toString());
            return res.status(500).json({ message: err });
        }

    });

router.get('/:deviceId', async (req, res) => {
    try {
        const device = await Device.findById(req.params.deviceId);
        return res.status(200).json(device);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/delete/:deviceId', async (req, res) => {
    try {
        const removedDeviceInstance = await DeviceInstance.deleteOne({ _id: req.params.deviceId });
        return res.status(200).json(removedDeviceInstance);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/update/:deviceId', async (req, res) => {
    let newGroup = req.body.group
    if (req.body.group === "none") {
        newGroup = null;
    }
    try {
        const updatedDeviceInstance = await DeviceInstance.updateOne(
            { _id: req.params.deviceId },
            { $set: { name: req.body.name, description: req.body.description, color: req.body.color, icon: req.body.icon, group: newGroup } }
        );
        return res.status(200).json(updatedDeviceInstance);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/shares/sent', async (req, res) => {
    try {
        let user = await getUser(req);
        const deviceShares = await DeviceShare.find({ user_id: user._id, rejected: false }).populate({ path: 'device_instance' }).populate({ path: 'receiver' });
        return res.status(200).json(deviceShares);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/shares', async (req, res) => {
    try {
        let user = await getUser(req);
        const deviceShares = await DeviceShare.find({ receiver: user._id, accepted: false, rejected: false }).populate({ path: 'device_instance' }).populate({ path: 'user_id' });
        return res.status(200).json(deviceShares);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/share', async (req, res) => {
    try {
        let user = await getUser(req);
        let receiver = await User.findOne({ email: (req.body.email).trim().toLowerCase() });
        console.log(receiver);
        if (!receiver) {
            return res.status(403).json({ message: 'Δεν υπάρχει χρήστης με αυτό το email' });
        }
        const deviceInstance = await DeviceInstance.findOne({ user_id: user._id, device: req.body.device });
        console.log(user._id);
        if (deviceInstance) {
            const deviceShare = new DeviceShare({
                user_id: user._id,
                receiver: receiver._id,
                device_instance: deviceInstance._id
            });
            const savedDeviceShare = await deviceShare.save();
            return res.status(200).json(savedDeviceShare);
        } else {
            throw 'Η συσκευή δεν βρέθηκε';
        }
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/share/accept', async (req, res) => {
    try {
        let user = await getUser(req);
        const deviceShare = await DeviceShare.findOne({ _id: req.body.share, receiver: user._id, accepted: false, rejected: false }).populate({ path: 'device_instance' });
        if (deviceShare) {
            const updateShareStatus = await DeviceShare.updateOne(
                { _id: req.body.share },
                { $set: { accepted: true } }
            );

            const deviceInstance = new DeviceInstance({
                user_id: user._id,
                name: deviceShare.device_instance.name,
                icon: deviceShare.device_instance.icon,
                color: deviceShare.device_instance.color,
                description: deviceShare.device_instance.description,
                device: deviceShare.device_instance.device

            });

            const savedDeviceInstance = await deviceInstance.save();
            return res.status(200).json(savedDeviceInstance);
        }
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/share/reject', async (req, res) => {
    try {
        let user = await getUser(req);
        const deviceShare = await DeviceShare.findOne({ _id: req.body.share, receiver: user._id, accepted: false, rejected: false }).populate({ path: 'device_instance' });
        if (deviceShare) {
            const updateShareStatus = await DeviceShare.updateOne(
                { _id: req.body.share },
                { $set: { rejected: true } }
            );
            return res.status(200).json({ message: 'Share invite has been rejected' });
        }
        return res.status(404).json({ message: 'The invite does not exist' });
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/share/cancel', async (req, res) => {
    try {
        let user = await getUser(req);
        const deviceShare = await DeviceShare.findOne({ _id: req.body.share, user_id: user._id, rejected: false });
        if (deviceShare) {
            const updateShareStatus = await DeviceShare.updateOne(
                { _id: req.body.share },
                { $set: { rejected: true } }
            );
            return res.status(200).json({ message: 'Share invite has been canceled' });
        }
        return res.status(404).json({ message: 'The invite does not exist' });
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

module.exports = router;