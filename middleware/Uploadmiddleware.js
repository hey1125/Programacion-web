const multer  = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Guardar el archivo en memoria (buffer) para luego subirlo a Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Middleware que sube el buffer a Cloudinary y pone la URL en req.file.path
function uploadToCloudinary(req, res, next) {

    // Si no vino ningún archivo, continuar sin problema
    if (!req.file) return next();

    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'commerce-connect/products',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: 'Error al subir la imagen' });
            }
            // Guardamos la URL segura donde el controlador espera encontrarla
            req.file.path = result.secure_url;
            next();
        }
    );

    // Convertir el buffer a stream y enviarlo a Cloudinary
    Readable.from(req.file.buffer).pipe(stream);
}

module.exports = { upload, uploadToCloudinary };