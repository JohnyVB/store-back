const { request, response } = require('express');
const { pool } = require("../config/db");

const createCategory = async (req = request, res = response) => {
    try {
        const { name, description } = req.body;

        // Si no se proporciona name o description, devolver una respuesta inmediatamente
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        // Insertar la nueva categoría en la base de datos
        const [result] = await pool.query(
            "INSERT INTO category (name, description) VALUES (?, ?);",
            [name, description]
        );

        // Obtener la categoría recién creada
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(category_id) category_id FROM category WHERE category_id = UUID_TO_BIN(?);",
            [result.insertId]
        );

        // Devolver la categoría creada
        res.json({ message: 'Category created successfully', category: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const getCategories = async (req = request, res = response) => {
    try {
        const [rows, fields] = await pool.query("SELECT *, BIN_TO_UUID(category_id) category_id FROM category;")
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const setCategory = async (req = request, res = response) => {
    try {
        const { id, name, description } = req.body;

        // Si no se proporciona name ni description, devolver una respuesta inmediatamente
        if (name === undefined && description === undefined) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Iniciar la consulta y los valores
        let query = "UPDATE category SET ";
        let values = [];

        // Añadir name a la consulta si está presente
        if (name !== undefined) {
            query += "name = ?, ";
            values.push(name);
        }

        // Añadir description a la consulta si está presente
        if (description !== undefined) {
            query += "description = ?, ";
            values.push(description);
        }

        // Quitar la última coma y añadir la cláusula WHERE
        query = query.slice(0, -2) + " WHERE category_id = UUID_TO_BIN(?);";
        values.push(id);

        // Ejecutar la consulta
        await pool.query(query, values);

        // Obtener la categoría actualizada
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(category_id) category_id FROM category WHERE category_id = UUID_TO_BIN(?);",
            [id]
        );

        // Devolver la categoría actualizada
        res.json({ message: 'Category updated successfully', category: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const changeStatusCategory = async (req = request, res = response) => {
    try {
        const { id, status } = req.body;

        if (status === undefined) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Ejecutar la consulta
        await pool.query(
            "UPDATE category SET status = ? WHERE category_id = UUID_TO_BIN(?);",
            [status, id]
        );

        // Obtener la categoría actualizada
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(category_id) category_id FROM category WHERE category_id = UUID_TO_BIN(?);",
            [id]
        );

        // Devolver la categoría actualizada
        res.json({ message: 'Category updated successfully', category: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

module.exports = {
    createCategory,
    getCategories,
    setCategory,
    changeStatusCategory
};