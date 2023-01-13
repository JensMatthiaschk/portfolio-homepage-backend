import express from 'express'
import cors from 'cors'
import chalk from "chalk";
import nodemailer from 'nodemailer'
import "dotenv/config";

const server = express()
const port = process.env.PORT || 8080

server.use((req, res, next) => {
    console.log(chalk.blue(req.method), chalk.white(req.url));
    next();
});
server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: false }));

let transport = {
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
}

let transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('connection to email client successfully established, congratz!');
    }
});

server.post('/email', async (req, res) => {

    const name = req.body.from_name
    const email = req.body.reply_to
    const message = req.body.message
    const content = `
    from: ${name} 
    <br> 
    email: ${email} 
    <br> 
    message: ${message}`

    var mail = {
        to: process.env.RECEIVING_EMAIL_ADDRESS,
        subject: 'Email from Homepage via Contact Form',
        html: content
    }
    try {

        transporter.sendMail(mail, (err, data) => {
            if (err) {
                res.json({
                    msg: 'fail'
                })
            } else {
                res.json({
                    msg: 'success'
                })
            }
        })
    } catch (error) { return error }
})

server.listen(port, () => console.log('Server listens on http://localhost:' + `${port}`))