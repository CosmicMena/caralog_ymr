import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.resolve('./dados.json');

export default async function handler(req, res) {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const produtos = JSON.parse(raw).produtos || [];

    const doc = new PDFDocument({ autoFirstPage: true });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=catalogo.pdf');
      res.send(pdfBuffer);
    });

    doc.fontSize(20).text('Catálogo YMR Industrial', { align: 'center' });
    doc.moveDown();

    produtos.forEach(prod => {
      doc.fontSize(14).text(`Nome: ${prod.nome}`);
      doc.fontSize(12).text(`Descrição: ${prod.descricao}`);
      if (prod.especificacoes) {
        Object.entries(prod.especificacoes).forEach(([key, val]) => {
          doc.text(`${key}: ${val}`);
        });
      }
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
