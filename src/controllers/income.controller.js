const { request, response } = require('express');
const { pool } = require("../config/db");

const createIncome = async (req = request, res = response) => {

    const { userid, receipt_type, receipt_series, receipt_number, tax, total, status } = req.body;

    // Verificar si los elementos requeridos existen
    if (!userid || !receipt_type || !receipt_number || !tax || !total || !status) {
        res.status(400).json({ error: "Required elements are missing from the request body" });
        return;
    }

    // Insertar el nuevo ingreso en la base de datos
    try {
        await pool.query(
            "INSERT INTO income (userid, receipt_type, receipt_series, receipt_number, tax, total, status) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);",
            [userid, receipt_type, receipt_series, receipt_number, tax, total, status]
        );

        // Obtener el ingreso recién creado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(income_id) income_id, BIN_TO_UUID(userid) userid FROM income ORDER BY created_at DESC LIMIT 1;"
        );

        // Devolver el ingreso creado
        res.json({ message: 'Income created successfully', income: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating entry' });
    }

}

const getAllIncomes = async (req = request, res = response) => {
    try {
        // Obtener todos los ingresos
        const [rows] = await pool.query(
            `
            SELECT
            BIN_TO_UUID(income_id) income_id, 
            BIN_TO_UUID(userid) userid,
            user.name,
            income.receipt_type,
            income.receipt_series,
            income.receipt_number,
            income.tax,
            income.total,
            income.status,
            income.created_at
            FROM income
            INNER JOIN user ON income.userid = user.user_id;
            `
        );

        // Devolver los ingresos
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error retrieving entries' });
    }
}

const getIncomesByUser = async (req = request, res = response) => {
    const { userid } = req.params;
    try {
        // Obtener todos los ingresos
        const [rows] = await pool.query(
            `
            SELECT
            BIN_TO_UUID(income_id) income_id, 
            BIN_TO_UUID(userid) userid,
            user.name,
            income.receipt_type,
            income.receipt_series,
            income.receipt_number,
            income.tax,
            income.total,
            income.status,
            income.created_at
            FROM income
            INNER JOIN user ON income.userid = user.user_id
            WHERE user.user_id = UUID_TO_BIN(?);
            `,
            [userid]
        );

        // Devolver los ingresos
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error retrieving entries' });
    }
}

const setStatusIncome = async (req = request, res = response) => {

    const { income_id, status } = req.body;

    // Verificar si los elementos requeridos existen
    if (!income_id || !status) {
        res.status(400).json({ error: "Required elements are missing from the request body" });
        return;
    }

    // Actualizar el estado del ingreso en la base de datos
    try {
        await pool.query(
            "UPDATE income SET status = ? WHERE income_id = UUID_TO_BIN(?);",
            [status, income_id]
        );

        // Obtener el ingreso actualizado
        const [rows] = await pool.query(
            "SELECT *, BIN_TO_UUID(income_id) income_id, BIN_TO_UUID(userid) userid FROM income WHERE income_id = UUID_TO_BIN(?);",
            [income_id]
        );

        // Devolver el ingreso actualizado
        res.json({ message: 'Income status updated successfully', income: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating entry status' });
    }

}

const createIncomeDetail = async (req = request, res = response) => {

    const { incomeid, articleid, quantity, price } = req.body;

    // Verificar si los elementos requeridos existen
    if (!incomeid || !articleid || !quantity || !price) {
        res.status(400).json({ error: "Required elements are missing from the request body" });
        return;
    }

    // Insertar el nuevo detalle de ingreso en la base de datos
    try {
        await pool.query(
            "INSERT INTO income_detail (incomeid, articleid, quantity, price) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?);",
            [incomeid, articleid, quantity, price]
        );

        res.json({ message: 'Income detail created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating entry detail' });
    }

}

const getIncomeDetailByIncome = async (req = request, res = response) => {
    const { incomeid } = req.params;
    try {
        // Obtener todos los detalles de ingreso
        const [rows] = await pool.query(
            `
            SELECT
            BIN_TO_UUID(income_detail_id) income_detail_id, 
            BIN_TO_UUID(incomeid) incomeid,
            BIN_TO_UUID(articleid) articleid,
            article.code,
            article.name,
            income_detail.quantity,
            income_detail.price,
            income_detail.created_at
            FROM income_detail
            INNER JOIN article ON income_detail.articleid = article.article_id
            WHERE income_detail.incomeid = UUID_TO_BIN(?);
            `,
            [incomeid]
        );

        // Devolver los detalles de ingreso
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error retrieving entry details' });
    }
}

module.exports = {
    createIncome,
    getAllIncomes,
    setStatusIncome,
    getIncomesByUser,
    createIncomeDetail,
    getIncomeDetailByIncome,
}