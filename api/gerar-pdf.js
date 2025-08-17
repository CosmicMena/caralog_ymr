'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const puppeteer = require('puppeteer');

// Função para ler argumentos --key value
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

// Escapar HTML
function escapeHtml(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Converte arquivo para Data URI
async function fileToDataURI(fp) {
  const buf = await fsp.readFile(fp);
  const ext = path.extname(fp).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// Placeholder SVG
function svgPlaceholder(text = 'Sem imagem', w = 1200, h = 900) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="100%" height="100%" fill="#efefef"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="42" fill="#888">${escapeHtml(text)}</text>
     </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Busca imagem por ID
async function findImageDataURI(imagesDir, id) {
  const bases = ['.jpg', '.jpeg', '.png'];
  for (const ext of bases) {
    const full = path.join(imagesDir, `${id}${ext}`);
    if (fs.existsSync(full)) {
      try {
        return await fileToDataURI(full);
      } catch (err) {
        console.warn(`Erro lendo imagem ${full}:`, err.message);
      }
    }
  }
  return svgPlaceholder('Sem imagem');
}

// Mapeamento de labels
function labelFor(key) {
  const map = { type: 'Tipo', size: 'Tamanho', thickness: 'Espessura', gsm: 'GSM' };
  return map[key] || key;
}

// Converte objeto de especificações para pares [label, valor]
function toPairs(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .map(([k, v]) => [labelFor(k), String(v)]);
}

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2));
    const dataPath = path.resolve(args.data || './dados.json');
    const imagesDir = path.resolve(args.images || './imagens');
    const outPath = path.resolve(args.out || './catalogo.pdf');
    const titulo = String(args.titulo || 'Catálogo de Produtos');
    const cols = Math.max(1, Math.min(4, Number(args.cols) || 2));

    if (!fs.existsSync(dataPath)) throw new Error(`Arquivo de dados não encontrado: ${dataPath}`);
    
    const raw = await fsp.readFile(dataPath, 'utf-8');
    const json = JSON.parse(raw);
    const produtos = Array.isArray(json) ? json : (json.produtos || []);
    
    if (!Array.isArray(produtos) || produtos.length === 0) {
      throw new Error('Nenhum produto encontrado em dados.json (esperado array ou campo "produtos")');
    }

    // Monta cards
    const cardsHtml = await Promise.all(produtos.map(async (p) => {
      const id = p.id ?? '';
      const nome = escapeHtml(p.nome ?? '');
      const desc = escapeHtml(p.descricao ?? '');
      let imgURI;
      try { imgURI = await findImageDataURI(imagesDir, id); } 
      catch { imgURI = svgPlaceholder('Erro'); }
      const specs = toPairs(p.especificacoes);

      const specsHtml = specs.length
        ? `<ul class="specs">${specs.map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</li>`).join('')}</ul>`
        : '';

      return `
        <article class="card">
          <div class="image-wrap">
            <img src="${imgURI}" alt="${nome}" />
          </div>
          <h3 class="name">${nome}</h3>
          ${desc ? `<p class="desc">${desc}</p>` : ''}
          ${specsHtml}
        </article>
      `;
    }));

    // HTML final
    const html = `<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(titulo)}</title>
<style>
@page { size: A4; margin: 14mm; }
* { box-sizing: border-box; }
body { margin:0; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; color:#111;}
header { text-align:center; margin-bottom:10mm; }
.title { font-size:20pt; font-weight:700; margin:0 0 4mm 0; letter-spacing:0.2px; }
.subtitle { font-size:10pt; color:#666; margin:0; }
.grid { display:grid; grid-template-columns: repeat(${cols},1fr); gap:6mm; }
.card { border:1px solid #e5e7eb; border-radius:10px; padding:5mm; break-inside:avoid; background:#fff; box-shadow:0 0 0.5mm rgba(0,0,0,0.02); }
.image-wrap { width:100%; padding-top:75%; position:relative; border-radius:8px; overflow:hidden; background:#f7f7f7; border:1px solid #eee; margin-bottom:4mm;}
.image-wrap img { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:contain; display:block;}
.name { font-size:11pt; margin:0 0 2mm 0; line-height:1.25; }
.desc { font-size:9pt; color:#333; margin:0 0 3mm 0; }
.specs { list-style:none; padding:0; margin:0; font-size:9pt; }
.specs li { margin:0 0 1mm 0; }
.specs strong { font-weight:600; }
.card, .image-wrap { page-break-inside: avoid; }
</style>
</head>
<body>
<header>
<h1 class="title">${escapeHtml(titulo)}</h1>
<p class="subtitle">Gerado automaticamente</p>
</header>
<main class="grid">${cardsHtml.join('\n')}</main>
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      margin: { top:'14mm', right:'14mm', bottom:'16mm', left:'14mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:8px; width:100%; text-align:center;"></div>`,
      footerTemplate: `
        <div style="font-size:10px; width:100%; padding:0 12mm; display:flex; justify-content:space-between; color:#6b7280;">
          <span class="date"></span>
          <span>Página <span class="pageNumber"></span>/<span class="totalPages"></span></span>
        </div>`,
    });

    await browser.close();
    console.log('✅ PDF gerado em:', outPath);

  } catch (err) {
    console.error('❌ Erro ao gerar PDF:', err.message);
    process.exit(1);
  }
})();
