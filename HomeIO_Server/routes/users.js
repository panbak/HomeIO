const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getUser, errorLogger } = require('../helpers');
require('dotenv/config');



router.get('/logout', async (req, res) => {
    res.status(200);
    res.json('logout route');
});

router.post('/update',
    body('email').isEmail().normalizeEmail().withMessage('Το email πρέπει να είναι της μορφής mail@mail.com'),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let user = false;
        try {
            user = await getUser(req);
        } catch (err) {
            errorLogger(err.toString());
            return res.status(500).json({ message: 'Η επεξεργασία των στοιχείων απέτυχε' });
        }

        if (!user) {
            return res.status(403).json({ message: 'Απαιτείται σύνδεση' });
        }

        try {
            let userObj = {};
            if ((req.body.password).length == 0) {
                userObj = { $set: { email: req.body.email } };
            } else {
                userObj = { $set: { email: req.body.email, password: req.body.password } };
            }
            const updatedUser = await User.updateOne(
                { _id: user._id },
                userObj
            );
            return res.status(200).json(updatedUser);
        } catch (err) {
            console.log(err);
            errorLogger(err.toString());
            return res.status(500).json(err);
        }
    });


module.exports = router;