const nodemailer = require('nodemailer');

class mailService
{
    constructor()
    {
            this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass:process.env.SMTP_PASSWORD
           }
        })
    }

    async sendActivationMail(to, link)
    {
        console.log(to, link);
        await this.transporter.sendMail ( {
            from: process.env.SMTP_USER,
            to: to,
            subject: "Активация аккаунта на " + process.env.API_URL,
            text: "",
            html:
                `<div>
                    <p>Поздравляем с регистрацией на нашем сайте!</p>
                    <p>Для активации аккаунта перейдите по ссылке: <a href = "${link}">${link}</a></p>
                </div>`
        })
    }

    async sendEventMail(to, link, name, date){
        await this.transporter.sendMail ( {
            from: process.env.SMTP_USER,
            to,
            subject: "Новый опрос на " + process.env.API_URL,
            text: "",
            html:
                `<div>
                    <p>Здравствуйте! Вам назначен новый опрос на сотрудника ${name}.</p>
                    <p>Пожалуйста, пройдите его до ${date}.</p>
                    <p>Для прохождения опроса перейдите по ссылке: <a href = "${link}">${link}</a></p>
                </div>`
        })
    }
    
}

module.exports = new mailService();