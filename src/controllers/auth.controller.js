const { request, response } = require('express');
const { pool } = require("../config/db");
const bcrypt = require('bcryptjs');
const { createJWT, verifyToken } = require('../helpers/jwt.helper');

const login = async (req = request, res = response) => {
    try {
        const { email, password } = req.body;

        if (email === undefined || password === undefined) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [rows] = await pool.query(
            `
            SELECT 
            BIN_TO_UUID(user_id) user_id,
            role.name as role,
            user.name,
            user.document_type,
            user.document_number,
            user.address,
            user.phone,
            user.email,
            user.password,
            user.status
            FROM user 
            INNER JOIN role ON user.roleid = role.role_id
            WHERE email = ?;
            `,
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Email or password incorrect' });
        }

        const user = rows[0];

        if (user.status === 0) {
            return res.status(400).json({ message: 'User is inactive' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ message: 'Email or password incorrect' });
        }

        delete user.password;
        const token = await createJWT(user.user_id);
        res.json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const checkToken = async (req = request, res = response) => {
    try {
        const { token } = req.body;
        if (token === undefined || token === '' || token === null) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const decode = await verifyToken(token);
        const newToken = await createJWT(decode.uid);
        res.json({ token: newToken });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error });
    }
}

module.exports = {
    login,
    checkToken
}