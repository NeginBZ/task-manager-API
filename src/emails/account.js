const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'negin.beheshtizavareh@gmail.com',
        subject:'Thanks for joining in!',
        text:`Welcom to the app, ${name}`
        
    })
}

const sendGoodbyeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'negin.beheshtizavareh@gmail.com',
        subject:'Sorry to see you go!',
        text:`Goodbye, ${name},I hope to see you back in sometime soon!`
        
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}