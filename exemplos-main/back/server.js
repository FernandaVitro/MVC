const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config()

const app = express();

app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
    host : 'localhost',
    user: 'root',
    password: '',
    database:'exemplos',


    "host":process.env.DB_LOCAL,
    "password":process.env.DB_PASSWORD,
    "user":process.env.DB_USER,
    "database":process.env.DB_DATABASE,

};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release(); // Libera a conexão de volta para o pool
    })
    .catch(error => {
        console.error('❌ Falha ao conectar ao banco de dados MySQL:');
        console.error(error.message);
    });

// Rota GET - Listar todos
app.get('/pessoas', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM pessoas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota POST - Criar
app.post('/pessoas', async (req, res) => {
    const {
        nome_razao_social, nome_social_fantasia, cep, endereco,
        numero, bairro, cidade, estado, documento, tipo, email
    } = req.body;

    const query = `
        INSERT INTO pessoas 
        (nome_razao_social, nome_social_fantasia, cep, endereco, numero, bairro, cidade, estado, documento, tipo, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        nome_razao_social,
        nome_social_fantasia || null,
        cep || null,
        endereco || null,
        numero || null,
        bairro || null,
        cidade || null,
        estado || null,
        documento,
        tipo,
        email || null
    ];

    try {
        const [result] = await pool.execute(query, values);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error("Erro no MySQL:", error.message);
        res.status(500).json({ error: "Erro interno no banco de dados: " + error.message });
    }
});
// Rota PUT - Atualizar
app.put('/pessoas/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nome_razao_social, nome_social_fantasia, cep, endereco,
        numero, bairro, cidade, estado, pais, documento, tipo, email
    } = req.body;

    const query = `
        UPDATE pessoas 
        SET nome_razao_social = ?, nome_social_fantasia = ?, cep = ?, endereco = ?, 
            numero = ?, bairro = ?, cidade = ?, estado = ?, pais = ?, documento = ?, 
            tipo = ?, email = ? 
        WHERE id = ?
    `;

    const values = [
        nome_razao_social, nome_social_fantasia || null, cep || null, endereco || null,
        numero || null, bairro || null, cidade || null, estado || null, pais || 'Brasil',
        documento, tipo, email || null, id
    ];

    try {
        const [result] = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota DELETE - Remover
app.delete('/pessoas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM pessoas WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicialização
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});


// produtos - Listar todos
app.get('/produtos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota POST - Criar
app.post('/produtos', async (req, res) => {
    const {
        nome, descricao, preco, estoque, categoria
    } = req.body;

    const query = `
        INSERT INTO produtos 
        (nome,descricao,preco,estoque,categoria) 
        VALUES (?, ?, ?, ?, ?)
    `;


    const values = [
        nome,
        descricao || null,
        preco || 0,
        estoque || 0,
        categoria || null
    ];

    try {
        const [result] = await pool.execute(query, values);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error("Erro no MySQL:", error.message);
        res.status(500).json({ error: "Erro interno no banco de dados: " + error.message });
    }
});
// produtos - remover
app.delete('/produtos/:id_produtos', async (req, res) => {
    const { id_produtos } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM produtos WHERE id_produtos = ?', [id_produtos]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota PUT - Atualizar produtos
app.put('/produtos/:id_produtos', async (req, res) => {
    const { id_produtos } = req.params;
    const { nome, descricao, preco, estoque, categoria } = req.body;

    const query = `
        UPDATE produtos
        SET nome = ?, descricao = ?, preco = ?, estoque = ?, categoria = ?
        WHERE id_produtos = ?
    `;

    const values = [
        nome,
        descricao || null,
        preco || 0,
        estoque || 0,
        categoria || null,
        id_produtos
    ];

    try {
        const [result] = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }

        res.json({
            id_produtos,
            nome,
            descricao,
            preco,
            estoque,
            categoria
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});