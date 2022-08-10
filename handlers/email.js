const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      type: process.env.EMAIL_type,
      user: process.env.EMAIL_user,
      clientId: process.env.EMAIL_clientId,
      clientSecret: process.env.EMAIL_clientSecret,
      refreshToken: process.env.EMAIL_refreshToken,
      accessToken: process.env.EMAIL_accessToken,
    },
  });

// utilizar templates de handlebars
transport.use('compile', hbs({
    viewEngine : {
        layoutsDir: __dirname+'/../views/emails',
        defaultLayout: 'reset'
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.handlebars'
}))

exports.enviar = async(opciones) => {
    const opcionesEmail = {
        from: 'debJobs <noreply@debjobs.com',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        }
    }

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}