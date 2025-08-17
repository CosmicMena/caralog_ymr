import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.resolve('./dados.json');

export default async function handler(req, res) {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const json = JSON.parse(raw);

    switch (req.method) {
      case 'GET':
        return res.status(200).json(json.produtos || []);

      case 'POST':
        const novo = req.body;
        json.produtos.push(novo);
        await fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2));
        return res.status(200).json({ message: 'Produto adicionado', produto: novo });

      case 'PUT':
        const id = parseInt(req.query.id);
        const atualizado = req.body;
        const idx = json.produtos.findIndex(p => p.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Produto não encontrado' });
        json.produtos[idx] = atualizado;
        await fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2));
        return res.status(200).json({ message: 'Produto atualizado', produto: atualizado });

      case 'DELETE':
        const delId = parseInt(req.query.id);
        json.produtos = json.produtos.filter(p => p.id !== delId);
        await fs.writeFile(DATA_FILE, JSON.stringify(json, null, 2));
        return res.status(200).json({ message: 'Produto removido', id: delId });

      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
