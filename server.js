/*
Aquí usamos mysql2/promise para enseñar
el manejo moderno de asincronía con 
try/catch y consultas parametrizadas (?) 
que previenen Inyección SQL
*/
// se crea las constantes necesarias para levantar el servidor
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

// se crea la constante app y el puerto de escucha del servidor
const app = express();
const PORT = 3000;

// Clave maestra didáctica para proteger las rutas 
// administrativas
const ADMIN_TOKEN = 'profe_taller2_2026';

// Middlewares para habilitar CORS, 
// parsear JSON y servir archivos estáticos
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pool de conexiones a MySQL que permite manejar 
// múltiples conexiones de manera eficiente
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',        // Cambiar según configuración del laboratorio
    password: '',        // Cambiar según configuración del laboratorio
    database: 'tienda_perecederos',
    waitForConnections: true,
    connectionLimit: 10 });

// Middleware de seguridad para proteger el CRUD (Solo Admin)
function verificarAdmin(req, res, next) {
    const tokenCliente = req.headers['x-admin-token'];
    if (tokenCliente !== ADMIN_TOKEN) {
        return res.status(403).json({ 
            error: 'Acceso denegado. Token de administrador inválido o ausente.' 
        });
    }
    next();
}

// ==========================================
// RUTAS DE LA API REST
// ==========================================

// 1. READ (Público y Admin): Obtener todos los productos
// Si la petición viene del cliente público
//  (?vista=cliente), ocultamos los vencidos o sin stock
app.get('/api/productos', async (req, res) => {
    try {
        const { vista } = req.query;
        let sql = 'SELECT * FROM productos ORDER BY fecha_vencimiento ASC';
        
        if (vista === 'cliente') {
            sql = 'SELECT * FROM productos WHERE fecha_vencimiento >= CURDATE() AND stock > 0 ORDER BY fecha_vencimiento ASC';
        }
        
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos: ' + error.message });
    }
});

// 2. Endpoint para validar login del administrador
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_TOKEN) {
        res.json({ ok: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ ok: false, mensaje: 'Contraseña incorrecta' });
    }
});

// 3. CREATE (Protegido): Crear un nuevo producto perecedero
app.post('/api/productos', verificarAdmin, async (req, res) => {
    try {
        const { nombre, categoria, lote, precio, stock, fecha_vencimiento } = req.body;
        const sql = `
            INSERT INTO productos (nombre, categoria, lote, precio, stock, fecha_vencimiento) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [nombre, categoria, lote, precio, stock, fecha_vencimiento]);
        res.status(201).json({ id: result.insertId, mensaje: 'Producto registrado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el producto: ' + error.message });
    }
});

// 4. UPDATE (Protegido): Actualizar un producto existente
app.put('/api/productos/:id', verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, lote, precio, stock, fecha_vencimiento } = req.body;
        const sql = `
            UPDATE productos 
            SET nombre = ?, categoria = ?, lote = ?, precio = ?, stock = ?, fecha_vencimiento = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(sql, [nombre, categoria, lote, precio, stock, fecha_vencimiento, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar: ' + error.message });
    }
});

// 5. DELETE (Protegido): Eliminar un producto (ej. dar de baja por merma/vencimiento)
app.delete('/api/productos/:id', verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado del inventario' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar: ' + error.message });
    }
});

// Iniciar servidor para escuchar peticiones en 
// el puerto definido
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`- Vista Cliente:       http://localhost:${PORT}/index.html`);
    console.log(`- Vista Administrador: http://localhost:${PORT}/admin.html`);
});

