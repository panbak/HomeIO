const express = require('express');
const app = express();
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const Log = require('../models/Log');
const Device = require('../models/Device');
const DeviceInstance = require('../models/DeviceInstance');
const { errorLogger } = require('../helpers');

router.get('/uptime', (req, res) => {
    res.status(200).send({ uptime: Date.now() - req.app.locals.servive_started_at });
});


router.get('/user/:email', async (req, res) => {
    // console.log(req.params.email)
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }


    let email = req.params.email;
    try {
        let user = await User.findOne({ email });
        let instances = await DeviceInstance.countDocuments({ user_id: user._id });
        return res.status(200).json({ user: user, instances: instances });
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.get('/users', async (req, res) => {
    try {
        let users = await User.find({});
        return res.status(200).json(users);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.get('/logs/:limit?', async (req, res) => {
    var limit = parseInt(req.params.limit);
    if (!limit) {
        limit = 50;
    }
    try {
        let logs = await Log.find({}).sort({ date: 'desc' }).limit(limit).populate('device_id').populate('user_id');
        console.log(logs);
        return res.status(200).json(logs);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.get('/users/count', async (req, res) => {
    try {
        let userCount = await User.countDocuments({});
        return res.status(200).json(userCount);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});


router.get('/devices/count', async (req, res) => {
    try {
        let deviceCount = await Device.countDocuments({});
        return res.status(200).json(deviceCount);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.get('/instances/count', async (req, res) => {
    try {
        let instanceCount = await DeviceInstance.countDocuments({});
        return res.status(200).json(instanceCount);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});


module.exports = router;