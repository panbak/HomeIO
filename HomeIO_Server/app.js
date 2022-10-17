const express = require('express');
const app = express();
const cors = require('cors');
const http = require("http");
const https = require("https");
const fs = require("fs");
const mongoose = require('mongoose');
const helmet = require('helmet');
const { check_if_auth } = require('./middleware/check_if_auth');
const { check_if_admin } = require('./middleware/check_if_admin');
const { authorize } = require('./helpers');
const { initMQTT } = require('./mqtt/initMQTT');
const bcrypt = require('bcrypt');
const { sendMailConfirmation } = require('./mail');
const { logger, createToken, errorLogger } = require('./helpers');
const { body, validationResult } = require('express-validator');
const { failedAttempt, resetAttempts, prevent_brute_force } = require('./middleware/prevent_brute_force');

const Device = require('./models/Device');
const User = require('./models/User');

require('dotenv/config');

const NODE_ENV = process.env.NODE_ENV || "production";

if (NODE_ENV === "production") {
    console.log("Reading ssl certificate files..");
    const privateKey = fs.readFileSync(`${process.env.CERTIFICATES_FOLDER}/privkey.pem`, 'utf8');
    const certificate = fs.readFileSync(`${process.env.CERTIFICATES_FOLDER}/cert.pem`, 'utf8');
    const ca = fs.readFileSync(`${process.env.CERTIFICATES_FOLDER}/chain.pem`, 'utf8');

    var credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    console.log("Certificates found!");
}

app.locals.servive_started_at = Date.now();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet()); //collection of security middlewares

app.disable('x-powered-by'); //dont send the technology used in the headers. reduces fingerprinting.

if (NODE_ENV === "production") {
    app.enable('trust proxy');
    app.use(function (request, response, next) {
        if (!request.secure) {
            return response.redirect("https://" + request.headers.host + request.url);
        }
        next();
    });
}


//import routes
const groupRoutes = require('./routes/groups');
const deviceRoutes = require('./routes/devices');
const userRoutes = require('./routes/users');
const consumptionRoutes = require('./routes/consumptions');
const adminRoutes = require('./routes/admin');

//ROUTES
const subfolder = process.env.SUBFOLDER || "";

app.get(`${subfolder}`, (req, res) => {
    res.status(200).json("Open admin web app or client mobile app to start.");
});

app.get(`${subfolder}/datetime`, (req, res) => {
    res.status(200).send(new Date());
});

app.post(`${subfolder}/device/login`, prevent_brute_force, body('device_code').isLength({ min: 6, max: 65 }).trim().escape().withMessage('Ο κωδικός συσκεύης δεν είναι έγκυρος'), async (req, res) => {
    console.log('[DEVICE LOGIN REQUEST]');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let code = (req.body.device_code).toLowerCase().trim();
    const device = await Device.findOne({ device_code: code });
    try {
        if (device) {
            const token = createToken(device._id, req);
            resetAttempts(req);
            return res.status(200).send(token);
        }
        failedAttempt(req);
        return res.status(403).json({ message: 'Η συσκεύη δεν υπάρχει.' });
    } catch (err) {
        console.log(err);
        errorLogger(err.toString());
        return res.status(500).json(err);
    }
});

app.get(`${subfolder}/device/:deviceCode/state`, async (req, res) => {
    console.log(req.params.deviceCode);
    try {
        const device = await Device.findOne({ device_code: req.params.deviceCode.toLowerCase() });
        return res.status(200).send(device.state);
    } catch (err) {
        console.log(err);
        errorLogger(err.toString());
        return res.status(500).json({ message: err });
    }
});

app.get(`${subfolder}/users/confirm/:token`, async (req, res) => {
    let id = req.params.token
    const user = await User.findOne({ verification_token: token });
    if (user.verified) {
        return res.status(200).json({ message: 'You are already verified.' });
    } else {
        try {
            const updatedUser = await User.updateOne(
                { _id: id },
                { $set: { 'verified': true } }
            );
            return res.status(200).json({ message: 'You have been verified' });
        } catch (err) {
            errorLogger(err.toString());
            return res.status(500).json({ message: err });
        }
    }
});

app.post(`${subfolder}/users/register`,
    body('email').normalizeEmail().trim().isEmail().withMessage('Το email πρέπει να είναι της μορφής mail@mail.com'),
    body('password').isLength({ min: 8, max: 50 }).withMessage('Ο κωδικός πρέπει να είναι 8-20 χαρακτήρες').not().isLowercase().withMessage('Ο κωδικός πρέπει να περιέχει κεφαλαία και μικρά γράμματα').not().isUppercase().withMessage('Ο κωδικός πρέπει να περιέχει κεφαλαία και μικρά γράμματα').not().isNumeric().withMessage('Ο κωδικός πρέπει να περιέχει αριθμούς').not().isAlpha().withMessage('Ο κωδικός πρέπει να περιέχει γράμματα'),
    async (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let user_exists = await User.findOne({ email: req.body.email });
        if (user_exists) {
            return res.status(400).json({ message: 'Υπάρχει ήδη λογαριασμός με αυτό το email' });
        }

        const salt = await bcrypt.genSalt();
        let email_token = await bcrypt.hash(req.body.email, salt);
        const user = new User({
            email: req.body.email,
            password: req.body.password,
            verification_token: email_token,
            verified: true
        });
        try {
            const savedUser = await user.save();
            //const token = createToken(savedUser._id, req);
            //sendMailConfirmation(savedUser.email, email_token);
            return res.status(200).json({ message: 'Μπορείτε να συνδεθείτε στον λογαριασμό σας' });
            return res.status(200).json({ message: 'Σας έχει σταλεί email με τον κωδικό ενεργοποίησης' });
        } catch (err) {
            console.log(err);
            errorLogger(err.toString());
            return res.status(500).json({ message: err });
        }
    });

app.post(`${subfolder}/users/login`,
    prevent_brute_force,
    body('email').normalizeEmail().trim().isEmail().withMessage('Το email πρέπει να είναι της μορφής mail@mail.com'),
    body('password').isLength({ max: 50 }).withMessage('Ο κωδικός πρέπει να είναι 8-20 χαρακτήρες'),
    async (req, res) => {
        console.log('[LOGIN REQUEST]');
        const errors = validationResult(req);
        console.log(errors.array());
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        let email = (req.body.email).toLowerCase().trim();
        //console.log("pass: " + req.body.email);
        const user = await User.findOne({ email: email });
        //console.log("USER: " + user.password);
        try {
            if (user) {
                if (!user.verified) {
                    return res.status(403).json({ message: 'Δεν έχετε ενεργοποιήσει τον λογαριασμό σας.' });
                }
                const auth = await bcrypt.compare(req.body.password, user.password);
                console.log("IS AUTH: " + auth);
                if (auth) {
                    const token = createToken(user._id, req);
                    console.log("TOKEN: " + token);
                    resetAttempts(req);
                    return res.status(200).json({ user: user, jwt: token });
                }

                logger('failed_login', null, user._id.toString(), "Αποτυχία σύνδεσης");
                failedAttempt(req);
                return res.status(403).json({ message: 'Το email και ο κωδικός δεν ταιριάζουν' });
            }
            failedAttempt(req);
            return res.status(403).json({ message: 'Δεν υπάρχει λογαριασμός με το συγκεκριμένο email' });
        } catch (err) {
            console.log(err);
            errorLogger(err.toString());
            return res.status(500).json(err);
        }
    });

app.post(`${subfolder}/authorize`, async (req, res) => {
    let auth = await authorize(req);
    console.log('auth: ' + auth);
    if (auth) {
        res.status(200).json(1);
    } else {
        res.status(403).json(0);
    }
});

app.use(`${subfolder}/devices`, check_if_auth, deviceRoutes);
app.use(`${subfolder}/users`, check_if_auth, userRoutes);
app.use(`${subfolder}/consumptions`, check_if_auth, consumptionRoutes);
app.use(`${subfolder}/admin`, check_if_admin, adminRoutes);
app.use(`${subfolder}/groups`, check_if_auth, groupRoutes);

//connect to mongoDB
//process.env.DB_CONNECTION
mongoose.connect("mongodb+srv://homeio:homeio12345@cluster0.z3jhc.mongodb.net/HOMEIO_SERVER_DB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => {
    console.log('DB has connected');
});


app.get('*', function (req, res) {
    res.status(404);
    res.send({ message: 'The requested route does not exist' });
});


const APP_PORT = process.env.APP_PORT || 80;
const SECURE_PORT = process.env.SECURE_PORT || 443;
//listen
//app.listen(APP_PORT);
http.createServer(app).listen(APP_PORT);
if (NODE_ENV === "production") {
    https.createServer(credentials, app).listen(SECURE_PORT);
    console.log('HTTPS Server listening on port', SECURE_PORT);
} else {
    console.log('HTTP Server listening on port', APP_PORT);
}


initMQTT(process.env.MQTT_PORT || 1883);