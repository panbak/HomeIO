const express = require('express');
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const router = express.Router();
const { getUser, errorLogger } = require('../helpers');

router.get('/', async (req, res) => {
    let user = await getUser(req);
    try {
        const groups = await Group.find({ user_id: user._id }).exec();
        return res.status(200).json(groups);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/create',
    body('name').isLength({ min: 3, max: 20 }).trim().escape().withMessage('Το όνομα πρέπει να είναι 3-20 χαρακτήρες'),
    body('description').isLength({ max: 40 }).trim().escape().withMessage('Η περιγραφή πρέπει να είναι 40 χαρακτήρες'),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let user = await getUser(req);
        if (!user) {
            return res.status(403).json({ message: 'Απαιτείται σύνδεση' });
        }
        const group = new Group({
            user_id: user._id,
            name: req.body.name,
            description: req.body.description
        });

        try {
            const savedGroup = await group.save();
            return res.status(200).json(savedGroup);
        } catch (err) {
            return res.status(403).json({ message: err });
        }
    });

router.get('/:groupId', async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        return res.status(200).json(group);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/delete/:groupId', async (req, res) => {
    try {
        const removedGroup = await Group.deleteOne({ _id: req.params.groupId, user_id: req.body.user_id });
        return res.status(200).json(removedGroup);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

router.post('/update/:groupId', async (req, res) => {
    try {
        const updatedGroup = await Group.updateOne(
            { _id: req.params.groupId },
            { $set: { name: req.body.name, description: req.body.description } }
        );
        return res.status(200).json(updatedGroup);
    } catch (err) {
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

module.exports = router;