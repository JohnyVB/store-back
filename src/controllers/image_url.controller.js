const { request, response } = require('express');
const { pool } = require("../config/db");
const { uploadCloudinary } = require('../helpers/uploadCloudinary.helper');


const createImageUrl = async (req = request, res = response) => {
    const { articleid } = req.body;
    const { file } = req.files;

    if (Array.isArray(file)) {
        file.forEach(async (fil) => {
            const type = fil.mimetype.split('/')[1];
            if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') {
                return res.json({ message: 'The image is not valid' });
            }
            try {
                const { secure_url, thumbnailUrl } = await uploadCloudinary(fil);

                await pool.query(
                    "INSERT INTO image_url (articleid, url, thumbnail) VALUES (UUID_TO_BIN(?), ?, ?);",
                    [articleid, secure_url, thumbnailUrl]
                );

            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error uploading images' });
            }
        });

        return res.json({ message: 'Images uploaded successfully' });
    }

    const type = file.mimetype.split('/')[1];
    if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') {
        return res.json({ message: 'The image is not valid' });
    }

    try {
        const { secure_url, thumbnailUrl } = await uploadCloudinary(file);

        await pool.query(
            "INSERT INTO image_url (articleid, url, thumbnail) VALUES (UUID_TO_BIN(?), ?, ?);",
            [articleid, secure_url, thumbnailUrl]
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