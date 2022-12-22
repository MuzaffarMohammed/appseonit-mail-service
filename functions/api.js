const express = require('express');
const serverless = require('serverless-http');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

var allowedOrigins = ['http://localhost:8888',
    process.env.CLIENT_1,//Appseonit URL
    process.env.CLIENT_2,//Mforce URL
    process.env.CLIENT_3,//SecuPower URL
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'Appseonit CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get("/", (req, res) => {
    res.json({
        message: "This is Appseonit Technologies Private Limited Intellectual Property, any kind of hampering or causing trouble by anyone will be subjected to legal terms!"
    })
});

router.post('/send', (req, res) => {
    const output = `
      <p>You have a new contact request through your website</p>
      ${req.body.clientId == '1' ? ('Subject:' + req.body.subject) : ''}
      <h3>Contact Details</h3>
      <ul> 
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Contact Number: ${req.body.contactNo}</li>
      </ul>
      <h3>Message</h3>
      <p>${req.body.message}</p>
    `;
    // create reusable transporter object using the default SMTP transport
    const obj = {
        host: process.env[`CLIENT_${req.body.clientId}_HOST`],
        port: process.env[`CLIENT_${req.body.clientId}_PORT`],
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env[`CLIENT_${req.body.clientId}_USER`],
            pass: process.env[`CLIENT_${req.body.clientId}_PASS`]
        },
        tls: {
            rejectUnauthorized: false
        }
    }
    let transporter = nodemailer.createTransport(obj);

    // setup email data with unicode symbols
    let mailOptions = {
        from: req.body.name + ' ' + req.body.email, // sender address
        to: process.env[`CLIENT_${req.body.clientId}_USER`], // list of receivers
        subject: 'A contact request from your website', // Subject line
        // text: 'Hello world?', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.send("OK");
    });
});

app.use('/', router);

module.exports = app;
module.exports.handler = serverless(app);