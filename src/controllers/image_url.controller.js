const { request, response } = require('express');
const { pool } = require("../config/db");
const cloudinary = require('../config/cloudinary');

const createImageUrl = async (req = request, res = response) => {
    const { articleid } = req.body;
    const { file } = req.files;
    let notUploaded = [];
    try {
        file.forEach(async (fil) => {
            const type = fil.mimetype.split('/')[1];
            if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') {
                notUploaded.push(fil.name);
                return;
            }
            try {
                const { secure_url } = await cloudinary.uploader.upload(fil.tempFilePath, { folder: 'store-back/article' });
                // Insertar la nueva imagen en la base de datos
                await pool.query(
                    "INSERT INTO image_url (articleid, url) VALUES (UUID_TO_BIN(?), ?);",
                    [articleid, secure_url]
                );
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error uploading images' });
            }
        });

        if (notUploaded.length > 0) {
            return res.json({ message: 'The following images are not valid: ' + notUploaded.join(', ') });
        }

        res.json({ message: 'Images uploaded successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error in createImageUrl' });
    }
}

const getImagesByArticle = async (req = request, res = response) => {
    const { articleid } = req.params;
    try {
        const images = await pool.query(
            "SELECT *, BIN_TO_UUID(url_id) url_id, BIN_TO_UUID(articleid) articleid FROM image_url WHERE articleid = UUID_TO_BIN(?);",
            [articleid]
        );
        res.json(images[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error in getImagesByArticle' });
    }
}

const setImageUrl = async (req = request, res = response) => {
    const { url_id, publicid } = req.body;
    const { file } = req.files;
    const type = file.mimetype.split('/')[1];
    if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') {
        return res.json({ message: 'The image is not valid' });
    }
    try {
        await cloudinary.uploader.destroy('store-back/article/' + publicid);
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.tempFilePath, { folder: 'store-back/article' });
        await pool.query(
            "UPDATE image_url SET url = ?, public_id = ? WHERE url_id = UUID_TO_BIN(?);",
            [secure_url, public_id.split('/')[2], url_id]
        );
        res.json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error uploading image' });
    }
}

module.exports = {
    createImageUrl,
    getImagesByArticle,
    setImageUrl
}