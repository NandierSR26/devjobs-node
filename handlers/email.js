const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: "nandierruizacosta@gmail.com",
      clientId: "724751063745-r0hs4h93c6aoiseieds8o20bpt383b69.apps.googleusercontent.com",
      clientSecret: "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",
      refreshToken: "1//049QeJedYjJFaCgYIARAAGAQSNwF-L9Ir77JlSNCQSBBK4HCmZ3ZwTpBwtgQeoEWwLWSbhPeSsjWM09Htzy7sybwOmuJhMgn7BjE",
      accessToken: "ya29.A0ARrdaM-3ZnzmhogA4xgT7Vm1SfL5ApQTIksz66YF9p0z0cWTmLMymE2i4GyLgtmyCUrZ5iT0rpnEvBwzncFQVBImDu_t3yutwOm55IugHXVwMB9lNwAcOHGiqj27qTAgxRaBsHlQkFmiTgun7MCjr6SYc_e-YUNnWUtBVEFTQVRBU0ZRRl91NjFWSjZVSk5CaVk1cUxjRFpOcHdpQ2VEZw0163",
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