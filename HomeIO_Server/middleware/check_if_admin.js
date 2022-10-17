const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv/config');

const check_if_admin = (req, res, next) => {
    const token = req.header('Authorization');
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let key = process.env.APP_KEY || "$homeIO$"
    if (token) {
        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.status(403).json({ message: 'Unauthorized' });
            } else {
                if (decodedToken.ip !== ip) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                let user = await User.findOne({ _id: decodedToken.id });
                if (user.role === "admin") {
                    next();
                } else {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
            }
        })
    } else {
        return res.status(403).json({ message: 'Unauthorized' });
    }
}

exports.check_if_admin = check_if_admin;