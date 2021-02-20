const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();


const sendNotification = async () => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth:{user:process.env.MAIL_USER, pass:process.env.MAIL_PASS}
    });


    let info = await transporter.sendMail({
        from: process.env.MAIL_SENDER,
        to: process.env.MAIL_RECEIVER,
        subject: "Received new feedback!",
        text: "CatsOpinion has received new contact!!!",
    });

    return info;

}


module.exports = {sendNotification};



