const express = require('express');
const router = express.Router();
const DeviceInstance = require('../models/DeviceInstance');
const { errorLogger } = require('../helpers');

router.post('/raw', async (req, res) => {
    //let user = await getUser(req);
    let from = req.body.from;
    let to = req.body.to;

    try {
        let records = await Consumption.find({ timestamp: { '$gte': from, '$lte': to } });
        return res.status(200).json(records);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }

});

router.post('/compact', async (req, res) => {
    //let user = await getUser(req);
    console.log(req)
    let from = req.body.from;
    let to = req.body.to;
    let deviceInstance = await DeviceInstance.findOne({ _id: req.body.device_instance_id }).populate({ path: 'device' });
    if (!deviceInstance) {
        return res.status(404).json({ message: 'Η συσκεύη δεν βρέθηκε' });
    }

    let fromDate = Date.parse(from);
    let toDate = Date.parse(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
        return res.status(400).json({ message: 'Οι ημερομηνίες δεν έχουν την κατάλληλη μορφή' });
    }

    let diffMillis = toDate - fromDate; //difference in milliseconds
    let diffDays = Math.floor(diffMillis / (1000 * 3600 * 24)); //difference in days

    if (diffDays < 0) {
        return res.status(404).json({ message: 'Το χρονικό εύρως δεν είναι έγκυρο' });
    }

    let Consumption = require('../models/Consumption')(deviceInstance.device.device_code);

    let records = null;

    if (diffDays < 2) {
        records = await Consumption.aggregate([
            {
                $match: { start_timestamp: { $gte: new Date(from) }, end_timestamp: { $lte: new Date(to) } }
            },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$start_timestamp" },
                        day: { $dayOfMonth: "$start_timestamp" },
                        month: { $month: "$start_timestamp" },
                        year: { $year: "$start_timestamp" },
                    },
                    sum: {
                        $sum: '$sum'
                    },
                    count: {
                        $sum: '$count'
                    },
                    total_kwh: {
                        $sum: '$total_kwh'
                    }
                }
            }
        ]);
    } else if (diffDays < 32) {
        records = await Consumption.aggregate([
            {
                $match: { start_timestamp: { $gte: new Date(from) }, end_timestamp: { $lte: new Date(to) } }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$start_timestamp" },
                        month: { $month: "$start_timestamp" },
                        year: { $year: "$start_timestamp" },
                    },
                    sum: {
                        $sum: '$sum'
                    },
                    count: {
                        $sum: '$count'
                    },
                    total_kwh: {
                        $sum: '$total_kwh'
                    }
                }
            }
        ]);
    } else if (diffDays < 200) {
        records = await Consumption.aggregate([
            {
                $match: { start_timestamp: { $gte: new Date(from) }, end_timestamp: { $lte: new Date(to) } }
            },
            {
                $group: {
                    _id: {
                        week: { $week: "$start_timestamp" },
                        month: { $month: "$start_timestamp" },
                        year: { $year: "$start_timestamp" }
                    },
                    sum: {
                        $sum: '$sum'
                    },
                    count: {
                        $sum: '$count'
                    },
                    total_kwh: {
                        $sum: '$total_kwh'
                    }
                }
            }
        ]);
    } else if (diffDays < 750) {
        records = await Consumption.aggregate([
            {
                $match: { start_timestamp: { $gte: new Date(from) }, end_timestamp: { $lte: new Date(to) } }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$start_timestamp" },
                        year: { $year: "$start_timestamp" }
                    },
                    sum: {
                        $sum: '$sum'
                    },
                    count: {
                        $sum: '$count'
                    },
                    total_kwh: {
                        $sum: '$total_kwh'
                    }
                }
            }
        ]);
    } else {
        records = await Consumption.aggregate([
            {
                $match: { start_timestamp: { $gte: new Date(from) }, end_timestamp: { $lte: new Date(to) } }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$start_timestamp" }
                    },
                    sum: {
                        $sum: '$sum'
                    },
                    count: {
                        $sum: '$count'
                    },
                    total_kwh: {
                        $sum: '$total_kwh'
                    }
                }
            }
        ]);
    }

    return res.status(200).json(records);

});



router.post('/stats', async (req, res) => {

    let deviceInstance = await DeviceInstance.findOne({ _id: req.body.device_instance_id }).populate({ path: 'device' });
    if (!deviceInstance) {
        return res.status(404).json({ message: 'Η συσκεύη δεν βρέθηκε' });
    }
    let Consumption = require('../models/Consumption')(deviceInstance.device.device_code);

    let today = new Date();
    let before30days = new Date(new Date().setDate(today.getDate() - 30));
    let before7days = new Date(new Date().setDate(today.getDate() - 7));
    let before6months = new Date(new Date().setDate(today.getDate() - 6 * 30));
    let before1year = new Date(new Date().setDate(today.getDate() - 365));

    let stats = [];

    let last30 = await Consumption.aggregate([
        {
            $match: { start_timestamp: { $gte: before30days }, end_timestamp: { $lte: today } }
        },
        {
            $group: {
                _id: "Μηνιαία",
                sum: {
                    $sum: '$sum'
                },
                count: {
                    $sum: '$count'
                },
                total_kwh: {
                    $sum: '$total_kwh'
                }
            }
        }
    ]);

    let lastWeek = await Consumption.aggregate([
        {
            $match: { start_timestamp: { $gte: before7days }, end_timestamp: { $lte: today } }
        },
        {
            $group: {
                _id: "Εβδομαδιαία",
                sum: {
                    $sum: '$sum'
                },
                count: {
                    $sum: '$count'
                },
                total_kwh: {
                    $sum: '$total_kwh'
                }
            }
        }
    ]);


    let lastHalf = await Consumption.aggregate([
        {
            $match: { start_timestamp: { $gte: before6months }, end_timestamp: { $lte: today } }
        },
        {
            $group: {
                _id: "Εξάμηνου",
                sum: {
                    $sum: '$sum'
                },
                count: {
                    $sum: '$count'
                },
                total_kwh: {
                    $sum: '$total_kwh'
                }
            }
        }
    ]);

    let lastYear = await Consumption.aggregate([
        {
            $match: { start_timestamp: { $gte: before1year }, end_timestamp: { $lte: today } }
        },
        {
            $group: {
                _id: "Ετήσια",
                sum: {
                    $sum: '$sum'
                },
                count: {
                    $sum: '$count'
                },
                total_kwh: {
                    $sum: '$total_kwh'
                }
            }
        }
    ]);


    if (lastWeek[0]) {
        stats.push(lastWeek[0]);
    }
    if (last30[0]) {
        stats.push(last30[0]);
    }
    if (lastHalf[0]) {
        stats.push(lastHalf[0]);
    }
    if (lastYear[0]) {
        stats.push(lastYear[0]);
    }

    console.log(stats);

    return res.status(200).json(stats);

});


module.exports = router;
