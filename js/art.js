/* 그럴 땐 어떻게 — 임시 그림(코드로 그린 SVG)
 *
 * 비주얼 노벨 레이어 구조의 "빈자리 채우기"용 그림이다.
 *   배경(bg)  : 800x500 한 장. 동생이 침대에 누운 모습처럼 배경에 붙는 것은 배경 차분(room_sick, room_towel …)
 *   캐릭터    : 인물마다 표정 차분. 모든 인물이 같은 캔버스 비율(200x360, 발끝이 아래 가운데)이라
 *               같은 높이로 띄우면 키 차이가 그대로 보인다.
 * 진짜 일러스트가 생기면 assets/manifest.js에 경로만 적으면 이 그림 대신 그 이미지가 쓰인다.
 */
window.ART = (function () {
  const W = 800, H = 500;

  /* ---------- 배경 ---------- */
  function stars(n, seed, x0, y0, w, h) {
    let s = seed, out = '';
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) {
      out += `<circle cx="${x0 + r() * w}" cy="${y0 + r() * h}" r="${0.8 + r() * 1.6}" fill="#fff" opacity="${0.4 + r() * 0.6}"/>`;
    }
    return out;
  }

  function room(morning) {
    const wall = morning ? ['#F3E3C8', '#E9CFA6'] : ['#2E3760', '#1F2645'];
    const sky = morning ? ['#FFC98A', '#FFE9C4'] : ['#0E1638', '#24306A'];
    return `
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall[0]}"/><stop offset="1" stop-color="${wall[1]}"/></linearGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFD27A" stop-opacity="${morning ? 0 : 0.55}"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#wall)"/>
    <rect y="350" width="${W}" height="150" fill="${morning ? '#C9A57A' : '#3B3355'}"/>
    <rect y="348" width="${W}" height="6" fill="${morning ? '#B08A5E' : '#2A2440'}"/>
    <!-- 창문 -->
    <rect x="470" y="55" width="220" height="170" rx="8" fill="${morning ? '#FFF6E6' : '#47507E'}"/>
    <rect x="482" y="67" width="196" height="146" rx="4" fill="url(#sky)"/>
    ${morning
      ? `<circle cx="590" cy="200" r="40" fill="#FFB35C"/><rect x="482" y="200" width="196" height="13" fill="#F2B880"/>`
      : `<circle cx="630" cy="105" r="22" fill="#FFF3C4"/><circle cx="640" cy="98" r="20" fill="#24306A"/>${stars(18, 7, 486, 72, 186, 130)}`}
    <rect x="577" y="67" width="6" height="146" fill="${morning ? '#FFF6E6' : '#47507E'}"/>
    <rect x="482" y="136" width="196" height="6" fill="${morning ? '#FFF6E6' : '#47507E'}"/>
    <g transform="translate(0 -50)">
    <!-- 책상과 스탠드 -->
    <circle cx="725" cy="300" r="140" fill="url(#lamp)"/>
    <rect x="650" y="330" width="150" height="14" rx="3" fill="${morning ? '#9C7350' : '#6B4F3A'}"/>
    <rect x="662" y="344" width="10" height="60" fill="${morning ? '#8A6444' : '#5A4231'}"/>
    <path d="M725 330 L725 270 L705 250" stroke="#E8E2D0" stroke-width="5" fill="none"/>
    <path d="M688 236 L722 236 L712 258 L698 258 Z" fill="#F2C14E"/>
    <!-- 침대 -->
    <rect x="40" y="300" width="22" height="110" rx="5" fill="${morning ? '#A87C55' : '#6B4F3A'}"/>
    <rect x="50" y="350" width="380" height="50" rx="10" fill="${morning ? '#FFFFFF' : '#D9DCEB'}"/>
    <rect x="50" y="392" width="380" height="18" rx="4" fill="${morning ? '#A87C55' : '#6B4F3A'}"/>
    <rect x="70" y="326" width="110" height="38" rx="18" fill="${morning ? '#FFFFFF' : '#EEF0F8'}"/>
    </g>
    <!-- 벽 그림 -->
    <rect x="250" y="110" width="110" height="80" rx="4" fill="${morning ? '#FFFFFF' : '#C9CDE0'}"/>
    <path d="M262 176 L290 140 L312 166 L326 150 L348 176 Z" fill="#7FB8A4"/>
    <circle cx="330" cy="130" r="9" fill="#F2C14E"/>`;
  }

  const BG = {
    room: () => room(false),
    morning: () => room(true),
    hall: () => `
      <rect width="${W}" height="${H}" fill="#D8D3C4"/>
      <rect width="${W}" height="40" fill="#C4BEAD"/>
      <rect x="300" y="12" width="200" height="12" rx="6" fill="#FFFDF2"/>
      <rect y="410" width="${W}" height="90" fill="#A9A08B"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${i * 100}" y="410" width="2" height="90" fill="#968D78"/>`).join('')}
      <rect x="70" y="140" width="160" height="270" rx="6" fill="#6E7A8C"/>
      <rect x="84" y="154" width="132" height="242" rx="3" fill="#7E8A9C"/>
      <circle cx="200" cy="285" r="7" fill="#E0C46A"/>
      <rect x="110" y="110" width="80" height="24" rx="4" fill="#3E4656"/><text x="150" y="128" text-anchor="middle" font-size="16" fill="#fff" font-family="sans-serif">1203</text>
      <rect x="540" y="140" width="160" height="270" rx="6" fill="#8C6E5A"/>
      <rect x="554" y="154" width="132" height="242" rx="3" fill="#9C7E69"/>
      <circle cx="570" cy="285" r="7" fill="#E0C46A"/>
      <rect x="580" y="110" width="80" height="24" rx="4" fill="#3E4656"/><text x="620" y="128" text-anchor="middle" font-size="16" fill="#fff" font-family="sans-serif">1204</text>`,
    street: () => `
      <defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1230"/><stop offset="1" stop-color="#2A3470"/></linearGradient>
      <radialGradient id="sl" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#FFE3A0" stop-opacity="0.5"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#nsky)"/>
      ${stars(30, 3, 0, 0, 800, 150)}
      <rect x="0" y="150" width="140" height="270" fill="#1A2048"/><rect x="150" y="200" width="120" height="220" fill="#222A58"/>
      <rect x="520" y="170" width="130" height="250" fill="#1A2048"/><rect x="660" y="120" width="140" height="300" fill="#222A58"/>
      ${[[20, 180], [70, 220], [20, 300], [180, 240], [230, 300], [540, 200], [600, 260], [690, 160], [740, 240], [690, 330]].map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="26" fill="#FFD98A" opacity="0.85"/>`).join('')}
      <rect y="420" width="${W}" height="80" fill="#2C2F3E"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${250 + i * 45}" y="440" width="26" height="60" fill="#E9E9EF" opacity="0.8"/>`).join('')}
      <rect x="0" y="412" width="${W}" height="10" fill="#555A6E"/>
      <path d="M300 420 L360 160 L440 160 L500 420 Z" fill="url(#sl)"/>
      <rect x="396" y="150" width="8" height="270" fill="#4A4F66"/><rect x="380" y="146" width="40" height="10" rx="5" fill="#FFE3A0"/>`,
    clinic: () => `
      <rect width="${W}" height="${H}" fill="#DCEFEA"/>
      <rect y="400" width="${W}" height="100" fill="#B9D6CF"/>
      <rect x="230" y="40" width="340" height="66" rx="12" fill="#2F4A7A"/>
      <circle cx="275" cy="73" r="20" fill="#FFE08A"/><circle cx="284" cy="66" r="17" fill="#2F4A7A"/>
      <text x="420" y="85" text-anchor="middle" font-size="28" fill="#fff" font-family="'Jua','Gowun Dodum',sans-serif">달빛어린이병원</text>
      <rect x="470" y="250" width="300" height="150" rx="10" fill="#FFFFFF"/>
      <rect x="470" y="250" width="300" height="18" rx="6" fill="#8CC7B8"/>
      <text x="620" y="300" text-anchor="middle" font-size="20" fill="#2F4A7A" font-family="'Jua',sans-serif">접수 · 수납</text>
      ${[40, 110, 180].map(x => `<rect x="${x}" y="330" width="56" height="16" rx="6" fill="#F2A93B"/><rect x="${x + 4}" y="346" width="6" height="40" fill="#8B7A66"/><rect x="${x + 46}" y="346" width="6" height="40" fill="#8B7A66"/>`).join('')}
      <rect x="60" y="150" width="120" height="90" rx="6" fill="#FFFFFF"/><text x="120" y="190" text-anchor="middle" font-size="14" fill="#2F4A7A" font-family="sans-serif">밤·휴일에도</text><text x="120" y="212" text-anchor="middle" font-size="14" fill="#2F4A7A" font-family="sans-serif">어린이 진료</text>`,
    er: () => `
      <rect width="${W}" height="${H}" fill="#E6EBF2"/>
      <rect y="400" width="${W}" height="100" fill="#C3CCD9"/>
      <rect x="290" y="34" width="220" height="64" rx="8" fill="#D63A3A"/>
      <text x="400" y="78" text-anchor="middle" font-size="32" fill="#fff" font-family="'Jua',sans-serif">응급실</text>
      ${[40, 260, 540].map(x => `<rect x="${x}" y="130" width="200" height="12" fill="#9AA6B8"/><path d="M${x} 142 q25 20 50 0 q25 20 50 0 q25 20 50 0 q25 20 50 0 L${x + 200} 380 L${x} 380 Z" fill="#9FC4E6" opacity="0.85"/>`).join('')}
      <rect x="560" y="330" width="180" height="30" rx="6" fill="#FFFFFF"/><rect x="570" y="360" width="8" height="40" fill="#7B8597"/><rect x="722" y="360" width="8" height="40" fill="#7B8597"/>`
  };

  /* ---------- 인물 ---------- */
  const PEOPLE = {
    me:      { skin: '#F4D1B3', hair: '#3A2A22', style: 'bob',   top: '#F2C14E', bottom: '#46557A', scale: 0.95 },
    doyun:   { skin: '#F6D7BC', hair: '#2A211C', style: 'messy', top: '#8EC5E8', bottom: '#8EC5E8', scale: 0.78, pj: true },
    mom:     { skin: '#F2CDAE', hair: '#2B201B', style: 'long',  top: '#6F8FB8', bottom: '#3E4560', scale: 1.04 },
    grandma: { skin: '#EFCCAE', hair: '#C9C6C2', style: 'bun',   top: '#B5677A', bottom: '#5B5466', scale: 0.98 },
    nurse:   { skin: '#F1CFB0', hair: '#2D2420', style: 'tied',  top: '#7CC4B4', bottom: '#7CC4B4', scale: 1.02 },
    doc:     { skin: '#EAC6A6', hair: '#2E2A28', style: 'short', top: '#FFFFFF', bottom: '#4A5068', scale: 1.05, glasses: true, coat: true },
    driver:  { skin: '#E8C2A0', hair: '#38302B', style: 'cap',   top: '#5A6E8C', bottom: '#3B4152', scale: 1.0 }
  };

  function eyes(mood) {
    switch (mood) {
      case 'sick': return `<path d="M-26 -212 q8 5 16 0 M10 -212 q8 5 16 0" stroke="#2A2220" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      case 'smile': return `<path d="M-26 -208 q8 -9 16 0 M10 -208 q8 -9 16 0" stroke="#2A2220" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      case 'surprised': return `<circle cx="-18" cy="-210" r="7" fill="#fff" stroke="#2A2220" stroke-width="3"/><circle cx="18" cy="-210" r="7" fill="#fff" stroke="#2A2220" stroke-width="3"/><circle cx="-18" cy="-210" r="3" fill="#2A2220"/><circle cx="18" cy="-210" r="3" fill="#2A2220"/>`;
      case 'worry': return `<ellipse cx="-18" cy="-209" rx="4.5" ry="6" fill="#2A2220"/><ellipse cx="18" cy="-209" rx="4.5" ry="6" fill="#2A2220"/><path d="M-28 -226 L-10 -230 M28 -226 L10 -230" stroke="#2A2220" stroke-width="3" stroke-linecap="round"/>`;
      default: return `<ellipse cx="-18" cy="-209" rx="4.5" ry="6" fill="#2A2220"/><ellipse cx="18" cy="-209" rx="4.5" ry="6" fill="#2A2220"/>`;
    }
  }
  function mouth(mood) {
    switch (mood) {
      case 'smile': return `<path d="M-12 -190 q12 12 24 0" stroke="#7A3B30" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      case 'surprised': return `<ellipse cx="0" cy="-186" rx="6" ry="8" fill="#7A3B30"/>`;
      case 'worry': case 'sick': return `<path d="M-10 -184 q10 -8 20 0" stroke="#7A3B30" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      default: return `<path d="M-9 -188 q9 6 18 0" stroke="#7A3B30" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    }
  }
  function hairBack(p) {
    if (p.style === 'bob') return `<path d="M-58 -215 q0 -64 58 -64 q58 0 58 64 l0 46 q-12 8 -22 0 l0 -40 l-72 0 l0 40 q-10 8 -22 0 Z" fill="${p.hair}"/>`;
    if (p.style === 'long') return `<path d="M-58 -215 q0 -66 58 -66 q58 0 58 66 l4 96 q-30 10 -40 0 l-4 -80 l-36 0 l-36 0 l-4 80 q-10 10 -40 0 Z" fill="${p.hair}"/>`;
    if (p.style === 'tied') return `<circle cx="0" cy="-268" r="18" fill="${p.hair}"/>`;
    if (p.style === 'bun') return `<circle cx="0" cy="-276" r="22" fill="${p.hair}"/>`;
    return '';
  }
  function hairFront(p) {
    switch (p.style) {
      case 'bob': return `<path d="M-54 -222 q4 -54 54 -54 q50 0 54 54 q-30 -6 -48 -30 q-20 26 -60 30 Z" fill="${p.hair}"/>`;
      case 'messy': return `<path d="M-52 -220 q-4 -58 52 -58 q56 0 52 58 l-10 -14 l-8 12 l-10 -16 l-10 12 l-12 -16 l-10 14 l-12 -14 l-10 14 Z" fill="${p.hair}"/>`;
      case 'bun': return `<path d="M-54 -218 q2 -56 54 -56 q52 0 54 56 q-26 -24 -54 -24 q-28 0 -54 24 Z" fill="${p.hair}"/>`;
      case 'long': return `<path d="M-54 -220 q2 -56 54 -56 q52 0 54 56 q-36 -8 -54 -32 q-18 24 -54 32 Z" fill="${p.hair}"/>`;
      case 'tied': return `<path d="M-54 -218 q2 -56 54 -56 q52 0 54 56 q-20 -30 -54 -30 q-34 0 -54 30 Z" fill="${p.hair}"/>`;
      case 'cap': return `<path d="M-54 -226 q2 -52 54 -52 q52 0 54 52 Z" fill="#2F3B52"/><rect x="-4" y="-232" width="76" height="10" rx="5" fill="#2F3B52"/>`;
      default: return `<path d="M-52 -222 q4 -54 52 -54 q48 0 52 54 q-24 -18 -52 -18 q-28 0 -52 18 Z" fill="${p.hair}"/>`;
    }
  }

  function person(id, mood, flush) {
    const p = PEOPLE[id] || PEOPLE.me;
    const coat = p.coat ? `<path d="M-46 -150 L-56 -10 L56 -10 L46 -150 Z" fill="#FFFFFF" stroke="#D5DAE3" stroke-width="2"/><path d="M0 -150 L0 -20" stroke="#D5DAE3" stroke-width="2"/>` : '';
    return `
      <rect x="-30" y="-70" width="24" height="70" rx="10" fill="${p.bottom}"/>
      <rect x="6" y="-70" width="24" height="70" rx="10" fill="${p.bottom}"/>
      <rect x="-34" y="-8" width="30" height="10" rx="5" fill="#2E2A33"/><rect x="4" y="-8" width="30" height="10" rx="5" fill="#2E2A33"/>
      <path d="M-44 -150 q44 -22 88 0 l6 90 q-50 14 -100 0 Z" fill="${p.top}"/>
      ${p.pj ? `<circle cx="-14" cy="-110" r="4" fill="#fff" opacity="0.7"/><circle cx="14" cy="-90" r="4" fill="#fff" opacity="0.7"/>` : ''}
      ${coat}
      <rect x="-62" y="-146" width="20" height="78" rx="10" fill="${p.coat ? '#FFFFFF' : p.top}"/>
      <rect x="42" y="-146" width="20" height="78" rx="10" fill="${p.coat ? '#FFFFFF' : p.top}"/>
      <circle cx="-52" cy="-66" r="10" fill="${p.skin}"/><circle cx="52" cy="-66" r="10" fill="${p.skin}"/>
      <rect x="-10" y="-166" width="20" height="20" fill="${p.skin}"/>
      ${hairBack(p)}
      <circle cx="0" cy="-212" r="52" fill="${p.skin}"/>
      ${hairFront(p)}
      ${eyes(mood)}
      ${p.glasses ? `<circle cx="-18" cy="-209" r="13" fill="none" stroke="#3A3F4E" stroke-width="3"/><circle cx="18" cy="-209" r="13" fill="none" stroke="#3A3F4E" stroke-width="3"/><path d="M-5 -210 h10" stroke="#3A3F4E" stroke-width="3"/>` : ''}
      <ellipse cx="-30" cy="-192" rx="9" ry="5" fill="${flush ? '#F07B7B' : '#F2A7A0'}" opacity="${flush ? 0.9 : 0.45}"/>
      <ellipse cx="30" cy="-192" rx="9" ry="5" fill="${flush ? '#F07B7B' : '#F2A7A0'}" opacity="${flush ? 0.9 : 0.45}"/>
      ${mouth(mood)}`;
  }

  function lying(mood, flush, towel) {
    const p = PEOPLE.doyun;
    return `
      <g transform="translate(0 -50)"><g transform="translate(125 340)">
        <circle cx="0" cy="0" r="40" fill="${p.skin}"/>
        <path d="M-40 -6 q-2 -42 40 -42 q42 0 40 42 l-8 -10 l-8 9 l-8 -12 l-8 9 l-10 -12 l-8 10 l-10 -11 l-8 11 Z" fill="${p.hair}"/>
        <path d="M-20 4 q6 4 12 0 M8 4 q6 4 12 0" stroke="#2A2220" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${mood === 'smile' ? '<path d="M-8 20 q8 7 16 0" stroke="#7A3B30" stroke-width="3" fill="none" stroke-linecap="round"/>' : '<path d="M-7 22 q7 -5 14 0" stroke="#7A3B30" stroke-width="3" fill="none" stroke-linecap="round"/>'}
        <ellipse cx="-24" cy="14" rx="7" ry="4" fill="#F07B7B" opacity="${flush ? 0.9 : 0.4}"/><ellipse cx="24" cy="14" rx="7" ry="4" fill="#F07B7B" opacity="${flush ? 0.9 : 0.4}"/>
        ${towel ? '<rect x="-26" y="-34" width="52" height="16" rx="6" fill="#FFFFFF" opacity="0.95"/>' : ''}
        ${flush && !towel ? '<path d="M44 -30 q6 -8 0 -16 M56 -26 q6 -8 0 -16" stroke="#FF9F6E" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>' : ''}
      </g>
      <path d="M160 330 q120 -26 262 4 l0 56 l-262 0 Z" fill="#7FA7D9"/>
      <path d="M160 330 q120 -26 262 4" stroke="#6A93C6" stroke-width="4" fill="none"/></g>`;
  }

  /* 배경 차분: '기본배경_차분' 이름 규칙 */
  const BG_VARIANTS = {
    room_sick:     ['room', () => lying('sick', true, false)],
    room_towel:    ['room', () => lying('smile', true, true)],
    morning_sick:  ['morning', () => lying('sick', true, false)],
    morning_towel: ['morning', () => lying('smile', false, true)]
  };
  function bgSVG(id) {
    const v = BG_VARIANTS[id];
    const base = v ? v[0] : id;
    const body = (BG[base] || BG.room)() + (v ? v[1]() : '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
  }

  /* 캐릭터 한 명 = 독립된 투명 그림. 캔버스 200x360, 발끝은 (100, 352) */
  function spriteSVG(id, face) {
    const sc = (PEOPLE[id] || {}).scale || 1;
    const flush = id === 'doyun' && face === 'sick';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -350 200 360"><g transform="translate(0 2) scale(${sc})">${person(id, face, flush)}</g></svg>`;
  }

  const toURI = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const M = () => window.ASSET_MANIFEST || { bg: {}, chars: {}, cg: {} };

  /* 실제 일러스트가 있으면 그 경로, 없으면 임시 SVG */
  function bg(id) { return (M().bg || {})[id] || toURI(bgSVG(id)); }
  function sprite(id, face) {
    const c = (M().chars || {})[id] || {};
    return c[face] || c.normal || toURI(spriteSVG(id, face));
  }
  function cg(id) { return (M().cg || {})[id] || null; }
  const faces = { me: ['normal', 'worry', 'surprised', 'smile'], doyun: ['sick', 'smile', 'normal'], grandma: ['normal', 'worry', 'smile'], mom: ['normal', 'worry', 'smile'], nurse: ['normal', 'smile'], doc: ['normal', 'smile'], driver: ['normal', 'smile'] };
  const bgs = ['room', 'room_sick', 'room_towel', 'morning', 'morning_sick', 'morning_towel', 'hall', 'street', 'clinic', 'er'];

  return { bg, sprite, cg, bgSVG, spriteSVG, faces, bgs, isReal: { bg: id => !!(M().bg || {})[id], sprite: (id, f) => !!((M().chars || {})[id] || {})[f] } };
})();
