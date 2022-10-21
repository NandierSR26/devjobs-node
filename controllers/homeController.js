const mongoose = require('mongoose');
const Vacante = mongoose.model('vacante');

exports.mostrarTrabajos = async(req, res) => {

    const vacantes = await Vacante.find().lean();

    if(!vacantes) return next();

    let userAuthenticated;

    if (req.user) {
        userAuthenticated = true;
    } else {
        userAuthenticated = false;
    }

    console.log(userAuthenticated);

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y publica trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes,
        userAuthenticated
    })
}