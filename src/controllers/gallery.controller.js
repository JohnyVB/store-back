const { request, response } = require('express');

const { pool } = require("../config/db");
const { uploadCloudinary, updateCloudinary, deleteCloudinary } = require('../helpers/handleCloudinary.helper');

const createImageGallery = async (req = request, res = response) => {
    const { file } = req.files;
    const { position = 1 } = req.body;

    if (Array.isArray(file)) {
        file.forEach(async (fil, index) => {
            const type = fil.mimetype.split('/')[1];
            if (type !== 'png' && type !== 'jpg' && type !== 'jpeg' && type !== 'webp') {
                return res.json({ message: 'The image is not valid' });
            }
            try {
                const { secure_url, public_id, thumbnailUrl } = await uploadCloudinary(fil, 'store-back/gallery');

                await pool.query(
                    "INSERT INTO gallery (image_url, public_id, thumbnail, position) VALUES (?, ?, ?, ?);",
                    [secure_url, public_id.split('/')[2], thumbnailUrl, index + 1]
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
        const { secure_url, public_id, thumbnailUrl } = await uploadCloudinary(file, 'store-back/gallery');

        await pool.query(
            "INSERT INTO gallery (image_url, public_id, thumbnail, position) VALUES (?, ?, ?, ?);",
            [secure_url, public_id.split('/')[2], thumbnailUrl, Number(position)]
        );

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error uploading images' });
    }

    return res.json({ message: 'Image uploaded successfully' });
}

const getImagesGallery = async (req = request, res = response) => {
    try {
        const images = await pool.query(
            "SELECT *, BIN_TO_UUID(image_id) image_id FROM gallery ORDER BY position ASC;"
        );

        return res.json(images[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error getting images' });
    }
}

const setImageGallery = async (req = request, res = response) => {
    const { image_id, publicid } = req.body;
    const { file } = req.files;
    const type = file.mimetype.split('/')[1];
    if (type !== 'png' && type !== 'jpg' && type !== 'jpeg' && type !== 'webp') {
        return res.json({ message: 'The image is not valid' });
    }
    try {
        const { secure_url, public_id, thumbnailUrl } = await updateCloudinary(file, publicid, 'store-back/gallery');
        await pool.query(
            "UPDATE gallery SET image_url = ?, public_id = ?, thumbnail = ? WHERE image_id = UUID_TO_BIN(?);",
            [secure_url, public_id, thumbnailUrl, image_id]
        );
        return res.json({ message: 'Image updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating images' });
    }
}

const setPositionImageGallery = async (req = request, res = response) => {
    const { image_id, position } = req.body;
    try {
        await pool.query(
            "UPDATE gallery SET position = ? WHERE image_id = UUID_TO_BIN(?);",
            [Number(position), image_id]
        );
        return res.json({ message: 'Position updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating position' });
    }
}

const deleteImageGallery = async (req = request, res = response) => {
    const { image_id, publicid } = req.body;
    try {
        await pool.query(
            "DELETE FROM gallery WHERE image_id = UUID_TO_BIN(?);",
            [image_id]
        );
        await deleteCloudinary(publicid, 'store-back/gallery');
        return res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error deleting images' });
    }
}

module.exports = {
    createImageGallery,
    getImagesGallery,
    setImageGallery,
    setPositionImageGallery,
    deleteImageGallery,
}