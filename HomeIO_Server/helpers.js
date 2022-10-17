const User = require('./models/User');
const Log = require('./models/Log');
const ErrorLog = require('./models/ErrorLog');
const jwt = require('jsonwebtoken');

const getUser = async (req) => {
    const token = req.header('Authorization');
    let key = process.env.APP_KEY || "$homeIO$"
    if (token) {
        try {
            const id = await jwt.verify(token, key, async (err, decodedToken) => {
                if (err) {
                    console.log('JWT Verification failed: ' + err);
                }
                return decodedToken.id;
            });
            const user = await User.findById(id);
            return user;
        } catch (e) {
            console.log('Error fetching user: ' + e);
            return false;
        }
    } else {
        return false;
    }
}

const authorize = async (req) => {

    const token = req.header('Authorization');
    console.log('token: ' + token);
    let key = process.env.APP_KEY;
    if (token) {
        return jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return false;
            } else {
                try {
                    await User.updateOne(
                        { _id: decodedToken.id },
                        { $set: { last_login: Date.now() } }
                    );
                } catch (err) {
                    console.log(err);
                    return false;
                }
                return true;
            }
        });
    } else {
        return false;
    }
}

const convertDateToUTC = (date) => {
    let offset = -3//date.getTimezoneOffset() / 60; //greece tmzoffset
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        date.getUTCHours() - offset, date.getUTCMinutes(), date.getUTCSeconds());
}

const logger = async (type, device_id, user_id, description) => {

    let log = new Log({
        type: type,
        description: description,
        device_id: device_id,
        user_id: user_id
    });

    await log.save();
}

const errorLogger = async (message) => {

    let errorLog = new ErrorLog({
        message: message
    });

    await errorLog.save();
}
const jwt_expire = process.env.JWT_EXPIRE_DAYS || 3;
const expireTime = jwt_expire * 24 * 60 * 60;
const createToken = (id, req) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let key = process.env.APP_KEY;
    return jwt.sign({ id, ip }, key, {
        expiresIn: expireTime
    });
}

// const toISOStringWithTimezone = date => {
//     const tzOffset = -date.getTimezoneOffset();
//     const diff = tzOffset >= 0 ? '+' : '-';
//     const pad = n => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
//     return date.getFullYear() +
//         '-' + pad(date.getMonth() + 1) +
//         '-' + pad(date.getDate()) +
//         'T' + pad(date.getHours()) +
//         ':' + pad(date.getMinutes()) +
//         ':' + pad(date.getSeconds()) +
//         diff + pad(tzOffset / 60) +
//         ':' + pad(tzOffset % 60);
// };

// exports.toISOStringWithTimezone = toISOStringWithTimezone;

exports.createToken = createToken;

exports.logger = logger;

exports.errorLogger = errorLogger;

exports.getUser = getUser;

exports.authorize = authorize;

exports.convertDateToUTC = convertDateToUTC;