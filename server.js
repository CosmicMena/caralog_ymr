'use strict';
const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

const DATA_FILE = path.resolve('./dados.json');
const BACKUP_DIR = path.resolve('./backup');
const PDF_FILE = path.resolve('./catalogo.pdf');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== Rotas CRUD =====

// Ler produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf-8');
    const json = JSON.parse(raw);
    res.json(json.produtos || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adicionar produto
app.post('/api/produtos', async (req, res) => {
  try {
    const novo = req.body;
    const raw = await fsp.readFile(DATA_FILE, 'utf-8');
    const json = JSON.parse(raw);
    json.produtos.push(novo);
    await fsp.writeFile(DATA_FILE, JSON.stringify(json, null, 2));
    res.json({ message: 'Produto adicionado', produto: novo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar produto por id
app.put('/api/produtos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const atualizado = req.body;
    const raw = await fsp.readFile(DATA_FILE, 'utf-8');
    const json = JSON.parse(raw);
    const idx = json.produtos.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Produto não encontrado' });
    json.produtos[idx] = atualizado;
    await fsp.writeFile(DATA_FILE, JSON.stringify(json, null, 2));
    res.json({ message: 'Produto atualizado', produto: atualizado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remover produto
app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const raw = await fsp.readFile(DATA_FILE, 'utf-8');
    const json = JSON.parse(raw);
    json.produtos = json.produtos.filter(p => p.id !== id);
    await fsp.writeFile(DATA_FILE, JSON.stringify(json, null, 2));
    res.json({ message: 'Produto removido', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Gerar PDF =====
app.post('/api/gerar-pdf', async (req, res) => {
  try {
    // Cria pasta backup se não existir
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }
    // Se já existe catalogo.pdf move para backup/
    if (fs.existsSync(PDF_FILE)) {
      const data = new Date();
      const timestamp = data.toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUP_DIR, `catalogo-${timestamp}.pdf`);
      fs.renameSync(PDF_FILE, backupFile);
    }

    // Executa index.js
    exec(
      'node index.js --data ./dados.json --images ./imagens --out ./catalogo.pdf --titulo "Catálogo YMR Industrial" --cols 2',
      (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          return res.status(500).json({ error: stderr });
        }
        console.log(stdout);
        res.json({ message: 'PDF gerado com sucesso!' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
