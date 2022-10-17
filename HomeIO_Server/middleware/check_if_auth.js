const jwt = require('jsonwebtoken');
require('dotenv/config');

const check_if_auth = (req, res, next) => {
    const token = req.header('Authorization');
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let key = process.env.APP_KEY || "$homeIO$"
    if (token) {
        jwt.verify(token, key, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.status(403).json({ message: 'Unauthorized' });
            } else {
                console.log(decodedToken);
                if (decodedToken.ip !== ip) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                next();
            }
        })
    } else {
        return res.status(403).json({ message: 'Unauthorized' });
    }
}

exports.check_if_auth = check_if_auth;