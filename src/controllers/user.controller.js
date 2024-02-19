const { request, response } = require('express');
const { pool } = require("../config/db");
const bcrypt = require('bcryptjs');

const createUser = async (req = request, res = response) => {
    try {
        const {
            role_id,
            name,
            document_type = 'CC',
            document_number = '',
            address = '',
            phone = null,
            email,
            password
        } = req.body;

        if (name === undefined || email === undefined || password === undefined) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const salts = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salts);

        await pool.query(
            `INSERT INTO user (role_id, name, document_type, document_number, address, phone, email, password) 
            VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?);`,
            [
                role_id,
                name,
                document_type,
                document_number,
                address,
                phone,
                email,
                hash
            ]
        );
        res.json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const getUsers = async (req = request, res = response) => {
    try {
        const [rows] = await pool.query(
            `SELECT *, BIN_TO_UUID(user_id) user_id, BIN_TO_UUID(role_id) role_id FROM user;`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const setUser = async (req = request, res = response) => {
    try {
        const {
            user_id,
            role_id,
            name,
            document_type,
            document_number,
            address,
            phone,
            password
        } = req.body;

        if (role_id === undefined && name === undefined && document_type === undefined && document_number === undefined && address === undefined && phone === undefined && password === undefined) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        let query = "UPDATE user SET ";
        let values = [];

        if (role_id !== undefined) {
            query += "role_id = UUID_TO_BIN(?), ";
            values.push(role_id);
        }

        if (name !== undefined) {
            query += "name = ?, ";
            values.push(name);
        }

        if (document_type !== undefined) {
            query += "document_type = ?, ";
            values.push(document_type);
        }

        if (document_number !== undefined) {
            query += "document_number = ?, ";
            values.push(document_number);
        }

        if (address !== undefined) {
            query += "address = ?, ";
            values.push(address);
        }

        if (phone !== undefined) {
            query += "phone = ?, ";
            values.push(phone);
        }

        if (password !== undefined) {
            const salts = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salts);
            query += "password = ?, ";
            values.push(hash);
        }

        query = query.slice(0, -2);
        query += " WHERE user_id = UUID_TO_BIN(?);";
        values.push(user_id);

        await pool.query(query, values);

        const [rows] = await pool.query(
            `SELECT *, BIN_TO_UUID(user_id) user_id, BIN_TO_UUID(role_id) role_id FROM user WHERE user_id = UUID_TO_BIN(?);`,
            [user_id]
        );

        res.json({ message: 'User updated successfully', user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const changeStatusUser = async (req = request, res = response) => {
    try {
        const { user_id, status } = req.body;

        if (status === undefined) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        await pool.query(
            "UPDATE user SET status = ? WHERE user_id = UUID_TO_BIN(?);",
            [status, user_id]
        );

        const [rows] = await pool.query(
            `SELECT *, BIN_TO_UUID(user_id) user_id, BIN_TO_UUID(role_id) role_id FROM user WHERE user_id = UUID_TO_BIN(?);`,
            [user_id]
        );

        res.json({ message: 'User updated successfully', user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

module.exports = {
    createUser,
    getUsers,
    setUser,
    changeStatusUser
};