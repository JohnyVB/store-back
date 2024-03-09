const cloudinary = require('../config/cloudinary');

const uploadCloudinary = async (file, folder) => {
    try {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.tempFilePath, { folder });

        const thumbnailUrl = await new Promise((resolve, reject) => {
            const thumbnailUrl = cloudinary.url(public_id, { width: folder.includes('gallery') ? 300 : 150, height: 150, crop: 'fill' });
            if (thumbnailUrl) {
                resolve(thumbnailUrl);
            } else {
                reject('Error in createImageUrl');
            }
        });

        return {
            secure_url,
            public_id,
            thumbnailUrl
        };
    } catch (error) {
        console.error(error);
        throw new Error('Error uploading images');
    }
}

const updateCloudinary = async (file, publicid, folder) => {
    try {
        await deleteCloudinary(publicid, folder);
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.tempFilePath, { folder });
        const thumbnailUrl = await new Promise((resolve, reject) => {
            const thumbnailUrl = cloudinary.url(public_id, { width: folder.includes('gallery') ? 300 : 150, height: 150, crop: 'fill' });
            if (thumbnailUrl) {
                resolve(thumbnailUrl);
            } else {
                reject('Error in createImageUrl');
            }
        });

        return {
            secure_url,
            public_id,
            thumbnailUrl
        };
    } catch (error) {
        console.error(error);
        throw new Error('Error uploading images');
    }
}

const deleteCloudinary = async (publicid, folder) => {
    try {
        await cloudinary.uploader.destroy(`${folder}/` + publicid);
    } catch (error) {
        console.error(error);
        throw new Error('Error deleting image');
    }
}

module.exports = {
    uploadCloudinary,
    updateCloudinary,
    deleteCloudinary
}