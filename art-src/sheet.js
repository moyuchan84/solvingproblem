// node sheet.js out.png file1 file2 ... -> horizontal contact sheet, each 360px tall
const sharp = require(process.env.SHARP || 'sharp');
(async () => {
  const [out, ...files] = process.argv.slice(2);
  const H = 360; const tiles = [];
  for (const f of files) { const b = await sharp(f).resize({ height: H }).png().toBuffer(); const m = await sharp(b).metadata(); tiles.push({ b, w: m.width }); }
  const W = tiles.reduce((s, t) => s + t.w + 6, 0);
  let x = 0; const comp = tiles.map(t => { const c = { input: t.b, left: x, top: 0 }; x += t.w + 6; return c; });
  await sharp({ create: { width: W, height: H, channels: 4, background: '#888' } }).composite(comp).png().toFile(out);
})();
