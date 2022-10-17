const nodemailer = require('nodemailer');
require('dotenv/config');

const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: process.env.SMTP,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
    secure: true,
});

// const transporter = nodemailer.createTransport({
//     port: 587,
//     host: process.env.SMTP,
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS,
//     },
// });

transporter.verify().then(console.log).catch(() => {
    console.log("[MAIL ERROR] Could not authenticate");
});

const sendMailConfirmation = (receiver, id) => {
    console.log('called');
    console.log(process.env.EMAIL);
    console.log(process.env.EMAIL_PASS);

    const mailData = {
        from: process.env.EMAIL,  // sender address
        to: receiver,   // list of receivers
        subject: 'HomeIO επιβεβαίωση email',
        text: 'Επιβεβαιώστε τον λογαριασμό σας: ',
        html: '<b>πατώντας τον </b><br /> <a href="https://' + process.env.HOST + '/users/confirm/' + id + '">σύνδεσμο</a>.',
    };

    transporter.sendMail(mailData, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}

exports.sendMailConfirmation = sendMailConfirmation;