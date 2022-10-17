const brute_store = {};

const MAX_ATTEMPTS = process.env.MAX_ATTEMPTS || 5;
const ATTEMPT_TIMEOUT = process.env.ATTEMPT_TIMEOUT || 24; //hours

const prevent_brute_force = (req, res, next) => {
    let now = Date.now();
    //check for block timeout
    console.log('test');
    Object.keys(brute_store).forEach((ip) => {
        if (now - brute_store[ip].last_attempt >= ATTEMPT_TIMEOUT * 60 * 60) {
            brute_store[ip] = { attempts: 0, last_attempt: 0 };
        }
    });
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (brute_store.hasOwnProperty(ip) && brute_store[ip].attempts >= MAX_ATTEMPTS) {
        return res.status(429).json({ message: 'Too many requests' });
    } else {
        next();
    }
}

const failedAttempt = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (brute_store.hasOwnProperty(ip)) {
        console.log('hasprop');
        brute_store[ip] = { attempts: brute_store[ip].attempts + 1, last_attempt: Date.now() };
    } else {
        console.log('not');
        brute_store[ip] = { attempts: 1, last_attempt: Date.now() };
    }
}

const resetAttempts = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    brute_store[ip] = 0;
}

exports.prevent_brute_force = prevent_brute_force;
exports.failedAttempt = failedAttempt;
exports.resetAttempts = resetAttempts;
