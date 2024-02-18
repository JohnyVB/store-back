const { request, response } = require('express');
const { pool } = require("../config/db");

const controller = {
    test: async (req = request, res = response) => {
        try {
            const [rows, fields] = await pool.query("SELECT *, BIN_TO_UUID(category_id) category_id FROM category;")
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while querying the database' });
        }
    }

}

module.exports = controller;