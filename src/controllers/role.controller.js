const { request, response } = require('express');
const { pool } = require("../config/db");

const createRole = async (req = request, res = response) => {
    try {
        const { name, description } = req.body;

        // Si no se proporciona name o description, devolver una respuesta inmediatamente
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        // Insertar el nuevo rol en la base de datos
        await pool.query(
            "INSERT INTO role (name, description) VALUES (?, ?);",
            [name, description]
        );

        // Obtener el rol recién creado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(role_id) role_id FROM role ORDER BY created_at DESC LIMIT 1;"
        );

        // Devolver el rol creado
        res.json({ message: 'Role created successfully', role: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const getRoles = async (req = request, res = response) => {
    try {
        const [rows, fields] = await pool.query("SELECT *, BIN_TO_UUID(role_id) role_id FROM role;")
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const setRole = async (req = request, res = response) => {
    try {
        const { id, name, description } = req.body;

        // Si no se proporciona name ni description, devolver una respuesta inmediatamente
        if (name === undefined && description === undefined) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Iniciar la consulta y los valores
        let query = "UPDATE role SET ";
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

        // Eliminar la última coma y espacio
        query = query.slice(0, -2);

        // Añadir el id al array de valores
        values.push(id);

        // Añadir el WHERE a la consulta
        query += " WHERE role_id = UUID_TO_BIN(?);";

        // Realizar la consulta
        await pool.query(query, values);

        // Obtener el rol actualizado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(role_id) role_id FROM role WHERE role_id = UUID_TO_BIN(?);",
            [id]
        );

        // Devolver el rol actualizado
        res.json({ message: 'Role updated successfully', role: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

const changeStatusRole = async (req = request, res = response) => {
    try {
        const { id, status } = req.body;

        if (status === undefined) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Ejecutar la consulta
        await pool.query(
            "UPDATE role SET status = ? WHERE role_id = UUID_TO_BIN(?);",
            [status, id]
        );

        // Obtener el rol actualizado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(role_id) role_id FROM role WHERE role_id = UUID_TO_BIN(?);",
            [id]
        );

        // Devolver el rol actualizado
        res.json({ message: 'Role updated successfully', role: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

module.exports = {
    createRole,
    getRoles,
    setRole,
    changeStatusRole
}