const mongoose = require('mongoose');
const Vacante = mongoose.model('vacante');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const multer = require('multer');
const shortid = require('shortid');
const { subirArchivo } = require('../helpers/subir-archivo');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

// agregar las vacantes a la DB
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    // usuario autor de la vacante
    vacante.autor = req.user._id;

    // crear arreglo de habilidades
    vacante.skills = req.body.skills.split(',');

    // almacenar vacante en la db
    const nuevaVacante = await vacante.save();

    // redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

// muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor').lean();
    let userAuthenticated;

    if (vacante.autor._id.toString() === req.user?._id.toString()) {
        userAuthenticated = true;
    } else {
        userAuthenticated = false;
    }

    // si no hay resultados
    if (!vacante) return next();

    res.render('vacante', {
        nombrePagina: vacante.titulo,
        vacante,
        userAuthenticated,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();

    if (!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

exports.editarVacante = async (req, res, next) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
        new: true,
        runValidators: true
    })

    res.redirect(`/vacantes/${vacante.url}`);
}

//  validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
    // sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    // validar
    req.checkBody('titulo', 'Agrega un titulo a la vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una ubicacion').notEmpty();
    req.checkBody('contrato', 'Selecciona un contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores = req.validationErrors();

    if (errores) {
        // recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));

        return res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }

    next();
}

exports.eliminarVacante = async (req, res, next) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if (verificarAutor(vacante, req.user)) {
        // si es el usuario
        vacante.remove();
        res.status(200).send('Vacante Eliminada correctamente');
    } else {
        // no permitido
        res.status(403).send('Error')
    }


}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    } else {
        return true;
    }
}


// almacenar los candidatos en la base de datos
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    // sino existe la vacante
    if (!vacante) return next();

    const cv = await subirArchivo(req.files, undefined, 'cv');

    // todo bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv
    }

    // almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu Curriculum Correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id).lean();

    if (vacante.autor != req.user._id.toString()) {
        return next();
    }

    if (!vacante) return next();


    res.render('candidatos', {
        nombrePagina: `Candidatos vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })

}

// buscador de vacantes
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    }).lean();

    res.render('home', {
        nombrePagina: 'Resultados para la busqueda: ' + req.body.q,
        barra: true,
        vacantes
    })
}