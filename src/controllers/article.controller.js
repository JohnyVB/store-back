const { request, response } = require('express');
const { pool } = require("../config/db");

const createArticle = async (req = request, res = response) => {

    const { categoryid, code, name, selling_price, stock, description } = req.body;

    // Verificar si los elementos requeridos existen
    if (!categoryid || !code || !name || !selling_price || !stock || !description) {
        res.status(400).json({ error: "Faltan elementos requeridos en el cuerpo de la solicitud" });
        return;
    }

    // Insertar el nuevo artículo en la base de datos
    try {
        await pool.query(
            "INSERT INTO article (categoryid, code, name, selling_price, stock, description) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?);",
            [categoryid, code, name, selling_price, stock, description]
        );

        // Obtener el artículo recién creado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(article_id) article_id, BIN_TO_UUID(categoryid) categoryid FROM article ORDER BY created_at DESC LIMIT 1;"
        );

        // Devolver el artículo creado
        res.json({ message: 'Article created successfully', article: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el artículo' });
    }

}

const gerAllArticles = async (req = request, res = response) => {
    try {
        // Obtener todos los artículos
        const [rows] = await pool.query(
            `
            SELECT
            BIN_TO_UUID(article_id) article_id, 
            category.name as category,
            article.code,
            article.name,
            article.selling_price,
            article.stock,
            article.description,
            article.status,
            article.created_at
            FROM article
            INNER JOIN category ON article.categoryid = category.category_id
            WHERE article.status = 1;
            `
        );

        // Devolver los artículos
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error retrieving articles' });
    }
}

const getArticlesByCategory = async (req = request, res = response) => {
    try {
        const { categoryid } = req.params;

        // Verificar si el parámetro categoryid viene en la solicitud
        if (!categoryid) {
            res.status(400).json({ error: 'categoryid is required' });
            return;
        }

        // Verificar si el parámetro categoryid es un UUID
        if (!categoryid.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
            res.status(400).json({ error: 'Invalid categoryid' });
            return;
        }

        // Obtener los artículos de una categoría específica
        const [rows] = await pool.query(
            `SELECT 
            BIN_TO_UUID(article_id) article_id,
            category.name as category,
            article.code,
            article.name,
            article.selling_price,
            article.stock,
            article.description,
            article.status,
            article.created_at
            FROM article
            INNER JOIN category ON article.categoryid = category.category_id
            WHERE category.category_id = UUID_TO_BIN(?);`,
            [categoryid]
        );

        // Devolver los artículos de la categoría
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error retrieving articles from the category' });
    }
}

const setArticle = async (req = request, res = response) => {
    try {
        const { article_id } = req.params;
        const { categoryid, code, name, selling_price, stock, description } = req.body;

        // Verificar si el parámetro articleid viene en la solicitud
        if (!article_id) {
            res.status(400).json({ error: 'articleid is required' });
            return;
        }

        // Verificar si el parámetro articleid es un UUID
        if (!article_id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
            res.status(400).json({ error: 'Invalid articleid' });
            return;
        }

        // Iniciar la consulta y los valores
        let query = "UPDATE article SET ";
        let values = [];

        // Añadir categoryid a la consulta si está presente
        if (categoryid !== undefined) {
            query += "categoryid = UUID_TO_BIN(?), ";
            values.push(categoryid);
        }

        // Añadir code a la consulta si está presente
        if (code !== undefined) {
            query += "code = ?, ";
            values.push(code);
        }

        // Añadir name a la consulta si está presente
        if (name !== undefined) {
            query += "name = ?, ";
            values.push(name);
        }

        // Añadir selling_price a la consulta si está presente

        if (selling_price !== undefined) {
            query += "selling_price = ?, ";
            values.push(selling_price);
        }

        // Añadir stock a la consulta si está presente
        if (stock !== undefined) {
            query += "stock = ?, ";
            values.push(stock);
        }

        // Añadir description a la consulta si está presente
        if (description !== undefined) {
            query += "description = ?, ";
            values.push(description);
        }

        // Quitar la última coma y añadir la cláusula WHERE
        query = query.slice(0, -2) + " WHERE article_id = UUID_TO_BIN(?);";
        values.push(article_id);

        // Ejecutar la consulta
        await pool.query(query, values);

        // Obtener el artículo actualizado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(article_id) article_id, BIN_TO_UUID(categoryid) categoryid FROM article WHERE article_id = UUID_TO_BIN(?);",
            [article_id]
        );

        // Devolver el artículo actualizado
        res.json({ message: 'Article updated successfully', article: rows[0] });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error });
    }
}

const setStatusArticle = async (req = request, res = response) => {
    try {
        const { article_id, status } = req.body;

        if (status === undefined) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Ejecutar la consulta
        await pool.query(
            "UPDATE article SET status = ? WHERE article_id = UUID_TO_BIN(?);",
            [status, article_id]
        );

        // Obtener el artículo actualizado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(article_id) article_id, BIN_TO_UUID(categoryid) categoryid FROM article WHERE article_id = UUID_TO_BIN(?);",
            [article_id]
        );

        // Devolver el artículo actualizado
        res.json({ message: 'Article updated successfully', article: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while querying the database' });
    }
}

module.exports = {
    createArticle,
    gerAllArticles,
    getArticlesByCategory,
    setArticle,
    setStatusArticle
}
