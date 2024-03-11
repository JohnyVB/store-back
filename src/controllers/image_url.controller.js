const { request, response } = require('express');
const { pool } = require("../config/db");
const { uploadCloudinary, updateCloudinary, deleteCloudinary } = require('../helpers/handleCloudinary.helper');


const createImageUrl = async (req = request, res = response) => {
    const { articleid } = req.body;
    const { file } = req.files;

    if (Array.isArray(file)) {
        file.forEach(async (fil, index) => {
            const type = fil.mimetype.split('/')[1];
            if (type !== 'png' && type !== 'jpg' && type !== 'jpeg' && type !== 'webp') {
                return res.json({ message: 'The image is not valid' });
            }
            try {
                const { secure_url, public_id, thumbnailUrl } = await uploadCloudinary(fil, 'store-back/article');

                await pool.query(
                    "INSERT INTO image_url (articleid, url, public_id, thumbnail, main) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?);",
                    [articleid, secure_url, public_id.split('/')[2], thumbnailUrl, index + 1]
                );

            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error uploading images' });
            }
        });

        return res.json({ message: 'Images uploaded successfully' });
    }

    const type = file.mimetype.split('/')[1];
    if (type !== 'png' && type !== 'jpg' && type !== 'jpeg' && type !== 'webp') {
        return res.json({ message: 'The image is not valid' });
    }

    try {
        const { secure_url, public_id, thumbnailUrl } = await uploadCloudinary(file, 'store-back/article');

        const images = await pool.query(
            "SELECT * FROM image_url WHERE articleid = UUID_TO_BIN(?);",
            [articleid]
        );

        const main = images[0].length + 1;

        await pool.query(
            "INSERT INTO image_url (articleid, url, public_id, thumbnail, main) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?);",
            [articleid, secure_url, public_id.split('/')[2], thumbnailUrl, main]
        );

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error uploading images' });
    }

    return res.json({ message: 'Images uploaded successfully' });
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
        const { secure_url, public_id, thumbnailUrl } = await updateCloudinary(file, publicid, 'store-back/article');
        await pool.query(
            "UPDATE image_url SET url = ?, public_id = ?, thumbnail = ? WHERE url_id = UUID_TO_BIN(?);",
            [secure_url, public_id.split('/')[2], thumbnailUrl, url_id]
        );
        res.json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error uploading image' });
    }
}

const deleteImageUrl = async (req = request, res = response) => {
    const { url_id, publicid } = req.body;
    try {
        await pool.query(
            "DELETE FROM image_url WHERE url_id = UUID_TO_BIN(?);",
            [url_id]
        );
        await deleteCloudinary(publicid, 'store-back/article');
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error deleting image' });
    }
}

module.exports = {
    createImageUrl,
    getImagesByArticle,
    setImageUrl,
    deleteImageUrl,
}