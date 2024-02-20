const jwt = require('jsonwebtoken');

const createJWT = (uid) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ uid }, process.env.PRIVATE_KEY, { expiresIn: '12h' }, (err, token) => {
            if (err) {
                reject('Failed to generate the token');
            } else {
                resolve(token);
            }
        });
    });
}

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
            if (err) {
                reject('Failed to verify the token');
            } else {
                resolve(decoded);
            }
        });
    });
}

module.exports = {
    createJWT,
    verifyToken
}