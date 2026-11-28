/* art-src/*.png (Gemini 원본) -> assets/ 게임용 WebP
 *
 *   chars__<인물>__<표정>.png -> assets/chars/<인물>/<표정>.webp  1000x1800, 투명, 발끝 아래 가운데, 같은 축척
 *   bg__<id>.png              -> assets/bg/<id>.webp              1920x1080
 *   cg__<id>.png              -> assets/cg/<id>.webp              1920x1080
 *
 * 실행: SHARP=<sharp 경로> node art-src/process.js   (sharp가 설치돼 있으면 SHARP 없이)
 * 결과로 assets/manifest.js를 새로 쓴다.
 */
const fs = require('fs'), path = require('path');
const sharp = require(process.env.SHARP || 'sharp');

const SRC = __dirname, ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'assets');
const CW = 1000, CH = 1800, FOOT = 18;          // 캔버스, 발끝 아래 여백
/* 키 = 캔버스 높이에 대한 비율 (어른 남자 머리끝이 위에서 약 5%, 여덟 살이 약 30%) */
const HEIGHT = {
  doc: .95, driver: .95, stranger: .95,
  mom: .91, mom_day: .91, nurse: .91, clerk: .91, customer: .90,
  grandma: .84, me: .78, doyun: .69, doyun_day: .69
};
/* 허리를 굽힌 자세처럼 원래 키보다 작게 서 있는 그림은 그 인물의 가장 큰 그림 축척을 쓴다 */

/* ---------- 캐릭터: 흰 배경 지우기 ---------- */
async function cutout(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const isBg = i => { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]; return Math.min(r, g, b) >= 238 && Math.max(r, g, b) - Math.min(r, g, b) <= 12; };
  // 가장자리에서 이어진 흰색만 배경으로 (옷의 흰 부분은 선으로 막혀 있어 남는다)
  const bg = new Uint8Array(N), stack = [];
  const push = i => { if (!bg[i] && isBg(i)) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0;
    if (x > 0) push(i - 1); if (x < W - 1) push(i + 1);
    if (y > 0) push(i - W); if (y < H - 1) push(i + W);
  }
  // 남은 덩어리 중 작은 섬(워터마크 반짝이, 먼지)은 지운다
  const lab = new Int32Array(N).fill(-1); const sizes = [];
  for (let s = 0; s < N; s++) {
    if (bg[s] || lab[s] >= 0) continue;
    const id = sizes.length; let n = 0; const st = [s]; lab[s] = id;
    while (st.length) {
      const i = st.pop(); n++; const x = i % W, y = (i / W) | 0;
      const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1];
      for (const j of nb) if (j >= 0 && !bg[j] && lab[j] < 0) { lab[j] = id; st.push(j); }
    }
    sizes.push(n);
  }
  const keepMin = Math.max(...sizes) * 0.01;
  const rgba = Buffer.alloc(N * 4);
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let i = 0; i < N; i++) {
    const on = !bg[i] && sizes[lab[i]] >= keepMin;
    rgba[i * 4] = data[i * 3]; rgba[i * 4 + 1] = data[i * 3 + 1]; rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = on ? 255 : 0;
    if (on) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  // 경계 1px를 반투명으로 (흰 테두리 줄이기)
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x; if (rgba[i * 4 + 3] === 0) continue;
    const edge = !rgba[(i - 1) * 4 + 3] || !rgba[(i + 1) * 4 + 3] || !rgba[(i - W) * 4 + 3] || !rgba[(i + W) * 4 + 3];
    if (edge) { const m = Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]); rgba[i * 4 + 3] = m > 200 ? 90 : 200; }
  }
  return { rgba, W, H, box: { x0, y0, x1, y1 } };
}

async function sprites() {
  const files = fs.readdirSync(SRC).filter(f => /^chars__.+__.+\.png$/.test(f)).sort();
  const cut = {};
  for (const f of files) { const [, who, face] = f.replace('.png', '').split('__'); (cut[who] ||= {})[face] = await cutout(path.join(SRC, f)); }
  const manifest = {};
  for (const who of Object.keys(cut)) {
    const target = (HEIGHT[who] || .9) * CH - FOOT;
    // 인물마다 하나의 축척: 생성 크기가 같으면 가장 큰 키 기준
    const tallest = Math.max(...Object.values(cut[who]).map(c => (c.box.y1 - c.box.y0 + 1) / c.H));
    for (const [face, c] of Object.entries(cut[who])) {
      const scale = target / (tallest * c.H);
      const bw = c.box.x1 - c.box.x0 + 1, bh = c.box.y1 - c.box.y0 + 1;
      let w = Math.round(bw * scale), h = Math.round(bh * scale);
      const fit = Math.min(1, (CW - 8) / w); w = Math.round(w * fit); h = Math.round(h * fit);
      const body = await sharp(c.rgba, { raw: { width: c.W, height: c.H, channels: 4 } })
        .extract({ left: c.box.x0, top: c.box.y0, width: bw, height: bh })
        .resize(w, h, { kernel: 'lanczos3' }).png().toBuffer();
      // 발 가운데 = 아래쪽 5% 줄의 불투명 픽셀 가운데
      const cx = Math.round(((c.box.x0 + c.box.x1) / 2 - c.box.x0) * scale * fit);
      const left = Math.max(0, Math.min(CW - w, Math.round(CW / 2 - cx)));
      const dir = path.join(OUT, 'chars', who); fs.mkdirSync(dir, { recursive: true });
      const out = path.join(dir, face + '.webp');
      await sharp({ create: { width: CW, height: CH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: body, left, top: CH - FOOT - h }]).webp({ quality: 85, alphaQuality: 90 }).toFile(out);
      (manifest[who] ||= {})[face] = `assets/chars/${who}/${face}.webp`;
      console.log('char', who, face, w + 'x' + h, Math.round(fs.statSync(out).size / 1024) + 'KB');
    }
  }
  return manifest;
}

/* ---------- 배경·CG: 오른쪽 아래 반짝이 지우기 + 1920x1080 ---------- */
async function wide(kind) {
  const files = fs.readdirSync(SRC).filter(f => f.startsWith(kind + '__') && f.endsWith('.png')).sort();
  const manifest = {};
  for (const f of files) {
    const id = f.replace('.png', '').split('__')[1];
    const img = sharp(path.join(SRC, f)); const m = await img.metadata();
    const k = m.width / 1376;                         // 반짝이는 1376 기준 (1256, 646) 근처
    const S = Math.round(96 * k), cx = Math.round(1256 * k), cy = Math.round(646 * k);
    const box = { left: cx - S / 2, top: cy - S / 2, width: S, height: S };
    const src = await sharp(path.join(SRC, f)).extract({ ...box, left: box.left - Math.round(110 * k) }).toBuffer();
    // 가장자리가 부드러운 마스크로 옆 영역을 덮는다
    const r = S / 2, mask = Buffer.alloc(S * S * 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - r, y - r) / r, a = d < .6 ? 255 : d > 1 ? 0 : Math.round(255 * (1 - (d - .6) / .4));
      const i = (y * S + x) * 4; mask[i + 3] = a;
    }
    const patch = await sharp(src).ensureAlpha().composite([{ input: mask, raw: { width: S, height: S, channels: 4 }, blend: 'dest-in' }]).png().toBuffer();
    const dir = path.join(OUT, kind); fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, id + '.webp');
    const fixed = await sharp(path.join(SRC, f)).composite([{ input: patch, left: box.left, top: box.top }]).png().toBuffer();
    await sharp(fixed).resize(1920, 1080, { kernel: 'lanczos3', fit: 'cover' }).webp({ quality: 85 }).toFile(out);
    manifest[id] = `assets/${kind}/${id}.webp`;
    console.log(kind, id, Math.round(fs.statSync(out).size / 1024) + 'KB');
  }
  return manifest;
}

(async () => {
  const chars = await sprites(), bg = await wide('bg'), cg = await wide('cg');
  const js = `/* 에셋 목록 — 진짜 일러스트를 여기에 등록한다.
 *
 * art-src/process.js가 자동으로 만든다 (Gemini로 그린 원본 → WebP).
 * 비어 있는 칸은 코드로 그린 임시 그림(js/art.js)이 자동으로 채운다.
 * 규격과 만드는 법은 docs/ART_PIPELINE.md 참고.
 *
 *   배경   assets/bg/<배경id>.webp            1920x1080, 불투명
 *   캐릭터 assets/chars/<인물id>/<표정>.webp   1000x1800, 투명 배경, 발끝이 아래 가운데, 모든 인물 같은 축척
 *   CG     assets/cg/<cgid>.webp              1920x1080, 이야기의 결정적 장면 한 장
 */
window.ASSET_MANIFEST = ${JSON.stringify({ bg, chars, cg }, null, 2)};
`;
  fs.writeFileSync(path.join(OUT, 'manifest.js'), js);
  console.log('manifest written');
})();
