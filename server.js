
/**
 * SERVIDOR BACKEND - COLECTOR PRO
 * 
 * Instruções de instalação no seu servidor:
 * 1. Crie uma pasta e coloque este arquivo 'server.js' dentro.
 * 2. Instale as dependências rodando: 
 *    npm install express cors sqlite3 body-parser ip
 * 3. Inicie o servidor:
 *    node server.js
 * 
 * O banco de dados 'cars.db' será criado automaticamente.
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3001; // Porta do servidor

// Middleware
app.use(cors()); // Permite conexões do frontend
app.use(bodyParser.json({ limit: '50mb' })); // Limite aumentado para aceitar fotos em Base64
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Banco de Dados SQLite
const dbPath = path.resolve(__dirname, 'cars.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 1. Criar tabela se não existir
    db.run(`CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      category TEXT,
      imageUrl TEXT,
      images TEXT, -- Armazena JSON array de strings
      dateAdded INTEGER
    )`, (err) => {
      if (!err) {
        // 2. Migração: Verificar se a coluna 'images' existe (para quem já rodou a versão anterior)
        db.all("PRAGMA table_info(cars)", (err, rows) => {
          if (!err) {
            const hasImagesColumn = rows.some(r => r.name === 'images');
            if (!hasImagesColumn) {
              console.log("⚠️ Atualizando banco de dados: Adicionando coluna 'images'...");
              db.run("ALTER TABLE cars ADD COLUMN images TEXT");
            }
          }
        });
      }
    });
  });
}

// Rotas da API

// 1. Listar todos os carros
app.get('/api/cars', (req, res) => {
  const sql = 'SELECT * FROM cars ORDER BY dateAdded DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Parse JSON string back to array
    const cars = rows.map(car => ({
      ...car,
      images: car.images ? JSON.parse(car.images) : [car.imageUrl]
    }));
    res.json({ data: cars });
  });
});

// 2. Adicionar carro
app.post('/api/cars', (req, res) => {
  const { id, name, brand, model, category, imageUrl, images, dateAdded } = req.body;
  const sql = `INSERT INTO cars (id, name, brand, model, category, imageUrl, images, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const imagesJson = JSON.stringify(images || [imageUrl]);
  const params = [id, name, brand, model, category, imageUrl, imagesJson, dateAdded];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Carro salvo com sucesso', data: req.body });
  });
});

// 3. Atualizar carro
app.put('/api/cars/:id', (req, res) => {
  const { name, brand, model, category, imageUrl, images } = req.body;
  const { id } = req.params;
  
  const sql = `UPDATE cars SET name = ?, brand = ?, model = ?, category = ?, imageUrl = ?, images = ? WHERE id = ?`;
  const imagesJson = JSON.stringify(images || [imageUrl]);
  const params = [name, brand, model, category, imageUrl, imagesJson, id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Carro atualizado com sucesso', data: req.body });
  });
});

// 4. Deletar carro
app.delete('/api/cars/:id', (req, res) => {
  const sql = 'DELETE FROM cars WHERE id = ?';
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Carro deletado', changes: this.changes });
  });
});

// Função auxiliar para encontrar o IP da rede local
function getLocalExternalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pula endereços internos (127.0.0.1) e não IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalExternalIP();
  console.log('\n==================================================');
  console.log(`🚀 SERVIDOR RODANDO! - COLECTOR PRO`);
  console.log(`📂 Porta: ${PORT}`);
  console.log(`--------------------------------------------------`);
  console.log(`PARA USAR NO APP, COPIE ESTE ENDEREÇO:`);
  console.log(`👉 http://${localIP}:${PORT}`);
  console.log(`==================================================\n`);
});