const cloudinary = require('../config/cloudinary');

const uploadCloudinary = async (file) => {
    try {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.tempFilePath, { folder: 'store-back/article' });

        const thumbnailUrl = await new Promise((resolve, reject) => {
            const thumbnailUrl = cloudinary.url(public_id, { width: 150, height: 150, crop: 'fill' });
            if (thumbnailUrl) {
                resolve(thumbnailUrl);
            } else {
                reject('Error in createImageUrl');
            }
        });

        return {
            secure_url,
            thumbnailUrl
        };
    } catch (error) {
        console.error(error);
        throw new Error('Error uploading images');
    }
}

module.exports = {
    uploadCloudinary
}