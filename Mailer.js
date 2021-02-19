const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();


const sendMail = async (data) => {
    let mailSender = "";
    if(sender == ""){
        mailSender = process.env.FAKE_SENDER
    }
    else{
        mailSender = sender;
    }

    const transport = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth:{user: process.env.MAIL_USER, pass: process.env.MAIL_PASS}
    });

    let info = await transport.sendMail({
        from: mailSender,
        to: process.env.MAIL_RECEIVER,
        subject: subject,
        text: text,
        html: ""
    });
}

module.exports = {sendMail};