import { supabase } from '../lib/supabase.js';
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  try {
    const { data: produtos, error } = await supabase.from('produtos').select('*');
    if (error) throw error;

    const doc = new PDFDocument();
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
