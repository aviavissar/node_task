const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'aviavissar@gmail.com',
        subject: `welcome ${name}`,
        text: `hi ${name} i hope its will be great`
    })
}

const sendGoodbyeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'aviavissar@gmail.com',
        subject: `we are sorry to see you go, ${name}`,
        text: `hi ${name} i hope you will came back`
    })
}


module.exports={
    sendWelcomeMail,sendGoodbyeMail
}