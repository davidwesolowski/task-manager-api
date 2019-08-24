const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) =>
{
    const msg = 
    {
        to: email,
        from: 'dawid.wesolowski96@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
    }
    
    sgMail.send(msg);
};

const sendCancellationEmail = (email, name) =>
{
    const msg =
    {
        to: email,
        from: 'dawid.wesolowski96@gmail.com',
        subject: 'Cancellation email',
        text: `Why don't you stay with us, ${name}? Hope you will be back!`
    }

    sgMail.send(msg);
}

module.exports = 
{
    sendWelcomeEmail,
    sendCancellationEmail
}