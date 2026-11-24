/* 그럴 땐 어떻게 — 이야기 엔진
 * 에피소드 데이터(window.EPISODE)를 읽어 장면, 대사, 선택지, 게이지, 단서 카드, 엔딩 회고를 그린다.
 */
(function () {
  const $ = s => document.querySelector(s);
  const EP = window.EPISODE;
  const STEPS = ['살피기', '알아보기', '떠올리기', '해보기', '돌아보기'];
  const AGES = { low: '초등 1~3학년', mid: '초등 4~6학년', teen: '중학생' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let S = null;
  let queue = [], qi = 0, node = null, typing = null;

  /* ---------- 저장(이 브라우저에서 찾은 엔딩만) ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('gdh.endings') || '[]'); } catch (e) { return []; } },
    add(t) { try { const a = store.get(); if (!a.includes(t)) { a.push(t); localStorage.setItem('gdh.endings', JSON.stringify(a)); } } catch (e) {} }
  };

  /* ---------- 상태 ---------- */
  const won = n => n.toLocaleString('ko-KR') + '원';
  function newState(age) {
    const st = EP.start;
    const s = { age, money: st.money, min: 0, cond: st.cond, worry: st.worry, cards: new Set(), done: new Set(), flags: {}, seenCards: 0 };
    s.won = won;
    s.clock = () => { const t = (st.clock + s.min) % 1440; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
    s.apply = fx => apply(fx);
    return s;
  }
  const val = v => (typeof v === 'function' ? v(S) : v && typeof v === 'object' && !Array.isArray(v) ? (v[S.age] ?? v.mid ?? v.low) : v);
  const clamp = n => Math.max(0, Math.min(100, n));

  function apply(fx) {
    if (typeof fx === 'function') fx = fx(S);
    if (!fx) return;
    if (fx.money) S.money = Math.max(0, S.money + fx.money);
    if (fx.min) {
      S.min += fx.min;
      if (!S.cards.has('care')) S.cond = clamp(S.cond - Math.round(fx.min / 10));
    }
    if (fx.cond) S.cond = clamp(S.cond + fx.cond);
    if (fx.worry) S.worry = clamp(S.worry + fx.worry);
    if (fx.flags) Object.assign(S.flags, fx.flags);
    (fx.cards || []).forEach(k => {
      const c = EP.cards[k];
      if (!c || S.cards.has(k)) return;
      if (c.ages && !c.ages.includes(S.age)) return;
      S.cards.add(k);
      toast(`💡 알게 된 것: ${c.t}`);
    });
    hud();
  }

  /* ---------- HUD ---------- */
  function hud() {
    $('#g-clock').textContent = S.clock();
    $('#g-money').textContent = won(S.money);
    setBar('#g-cond', S.cond);
    setBar('#g-worry', S.worry);
    $('#cards-count').textContent = S.cards.size;
  }
  function setBar(sel, v) {
    const el = $(sel);
    el.style.setProperty('--v', v + '%');
    el.setAttribute('aria-valuenow', v);
    el.dataset.level = v < 35 ? 'low' : v < 65 ? 'mid' : 'high';
  }
  function steps(i) {
    $('#steps').innerHTML = STEPS.map((s, k) => `<li class="${k === i ? 'on' : k < i ? 'past' : ''}">${s}</li>`).join('');
  }

  /* ---------- 장면 ---------- */
  function goto(id) {
    id = EP.redirect ? EP.redirect(S, id) : id;
    node = EP.nodes[id];
    if (!node) { console.error('없는 장면', id); return; }
    S.node = id;
    if (node.enter) node.enter(S);
    steps(val(node.step) ?? 0);
    const lines = (typeof node.lines === 'function' ? node.lines(S) : node.lines || [])
      .filter(l => l && (!l[2] || l[2].includes(S.age)))
      .map(l => [l[0], val(l[1])]);
    queue = lines; qi = 0;
    $('#phone-log').innerHTML = '';
    $('#choices').innerHTML = '';
    $('#choices').hidden = true;
    $('#hint').hidden = true;
    const phone = node.phone;
    $('#phone').hidden = !phone;
    if (phone) { $('#phone-title').textContent = phone.title; $('#phone').dataset.app = phone.app; }
    S.had = null;
    showLine();
  }

  function drawStage(speaker) {
    $('#stage-art').innerHTML = ART.scene(val(node.bg), val(node.cast), speaker);
  }

  function showLine() {
    const line = queue[qi];
    if (!line) { drawStage(null); return finishNode(); }
    const [who, text] = line;
    drawStage(who);
    const name = EP.names[who] ?? who;
    const nameEl = $('#speaker');
    nameEl.textContent = name;
    nameEl.hidden = !name;
    $('#dialog').dataset.who = who;
    if (node.phone && (EP.phoneSpeakers.includes(who) || (who === 'me' && !text.startsWith('(')))) {
      const b = document.createElement('div');
      b.className = 'bubble ' + (who === 'me' ? 'mine' : 'theirs');
      b.textContent = text.replace(/^"|"$/g, '');
      $('#phone-log').appendChild(b);
      $('#phone-log').scrollTop = 1e6;
    }
    type(text);
    $('#next').hidden = false;
  }

  function type(text) {
    const el = $('#line');
    clearInterval(typing);
    if (reduce) { el.textContent = text; typing = null; return; }
    let i = 0; el.textContent = '';
    typing = setInterval(() => {
      i += 1; el.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(typing); typing = null; }
    }, 24);
    el.dataset.full = text;
  }

  function advance() {
    if (!$('#choices').hidden) return;
    if (typing) { clearInterval(typing); typing = null; $('#line').textContent = $('#line').dataset.full; return; }
    if (qi < queue.length) { qi += 1; showLine(); }
  }

  function finishNode() {
    $('#next').hidden = true;
    if (node.ending) return showEnding();
    let choices = node.choices;
    if (!choices) {
      const nx = val(node.next) || 'hub';
      choices = [{ kind: 'cont', text: '계속', go: nx }];
    }
    renderChoices(choices);
  }

  function status(c) {
    if (c.ages && !c.ages.includes(S.age)) return 'hidden';
    if (c.once && S.done.has(c.id)) return 'hidden';
    if (c.hide && c.hide(S)) return 'hidden';
    const ok = (!c.need || c.need.every(k => S.cards.has(k))) &&
      (!c.needAny || c.needAny.some(k => S.cards.has(k))) &&
      (!c.when || c.when(S));
    if (ok) return 'show';
    return c.locked ? 'locked' : 'hidden';
  }

  function renderChoices(list) {
    const box = $('#choices');
    box.innerHTML = '';
    const label = { explore: '알아보기', act: '해보기', cont: '' };
    const shown = list.map(c => [c, status(c)]).filter(([, st]) => st !== 'hidden');
    // 알아보기 먼저, 해보기 다음, 잠긴 것은 마지막
    shown.sort((a, b) => (a[1] === 'locked') - (b[1] === 'locked'));
    shown.forEach(([c, st], i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.id = 'choice-' + (c.id || i);
      b.className = `choice ${c.kind || 'act'} ${st}`;
      const tag = st === 'locked' ? '잠김' : label[c.kind || 'act'];
      b.innerHTML = `${tag ? `<span class="tag">${tag}</span>` : ''}<span class="txt"></span>`;
      b.querySelector('.txt').textContent = st === 'locked' ? val(c.locked) : val(c.text);
      if (st === 'locked') { b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
      else b.addEventListener('click', () => choose(c));
      box.appendChild(b);
    });
    box.hidden = false;
    if (node === EP.nodes.hub && S.age !== 'teen' && EP.hint) {
      $('#hint').textContent = '💡 ' + EP.hint(S);
      $('#hint').hidden = false;
    }
    const first = box.querySelector('button:not([disabled])');
    if (first && document.activeElement && document.activeElement.classList.contains('choice')) first.focus();
  }

  function choose(c) {
    if (c.id) S.done.add(c.id);
    S.had = new Set(S.cards); // 장면 대사는 '고르기 전에 알던 것' 기준으로 쓸 수 있다
    apply(c.fx);
    goto(val(c.go));
  }

  /* ---------- 엔딩과 회고 ---------- */
  function showEnding() {
    const e = node.ending;
    const title = val(e.title);
    store.add(title);
    $('#end-title').textContent = title;
    $('#end-summary').textContent = val(e.summary);
    $('#end-powers').innerHTML = EP.powers.map(p => {
      const on = p.ok(S);
      return `<li class="${on ? 'on' : ''}"><b>${p.n}</b><span>${on ? p.d : '이번에는 쓰지 않았어요'}</span></li>`;
    }).join('');
    const missed = Object.entries(EP.cards)
      .filter(([k, c]) => !S.cards.has(k) && (!c.ages || c.ages.includes(S.age)))
      .map(([, c]) => `<li>${c.hint}</li>`);
    $('#end-missed').innerHTML = missed.length ? missed.join('') : '<li>모든 단서를 찾아냈어요!</li>';
    $('#end-missed-wrap').querySelector('h3').textContent = missed.length ? `이런 방법도 있었어요 (${missed.length})` : '이런 방법도 있었어요';
    $('#end-q').innerHTML = (EP.questions[S.age] || []).map(q => `<li>${q}</li>`).join('');
    $('#end-stats').textContent = `걸린 시간 ${S.min >= 60 ? Math.floor(S.min / 60) + '시간 ' : ''}${S.min % 60 ? (S.min % 60) + '분' : ''} · 남은 돈 ${won(S.money)} · 알게 된 것 ${S.cards.size}개`;
    $('#end-count').textContent = `이 기기에서 찾은 엔딩 ${Math.min(store.get().length, EP.endingCount)} / ${EP.endingCount}`;
    $('#toast').hidden = true;
    $('#ending').hidden = false;
    $('#ending').scrollTop = 0;
    $('#end-retry').focus();
  }

  /* ---------- 카드 서랍, 알림 ---------- */
  function openCards() {
    const list = [...S.cards].map(k => EP.cards[k]);
    $('#cards-list').innerHTML = list.length
      ? list.map(c => `<li><b>${c.t}</b><span>${c.d}</span></li>`).join('')
      : '<li class="empty"><span>아직 알게 된 것이 없어요. "알아보기"를 눌러 단서를 모아 보세요.</span></li>';
    $('#cards').hidden = false;
    $('#cards-close').focus();
  }
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* ---------- 시작 ---------- */
  function start(age) {
    S = newState(age);
    $('#title').hidden = true;
    $('#ending').hidden = true;
    $('#age-chip').textContent = AGES[age];
    hud();
    goto(EP.start.node);
  }

  function boot() {
    $('#ep-title').textContent = EP.title;
    $('#ep-blurb').textContent = EP.blurb;
    $('#title-art').innerHTML = ART.scene('room', [['doyun', 'sick', 'bed', { flush: true }], ['me', 'worry', 'right']]);
    const found = store.get().length;
    $('#title-count').textContent = found ? `찾은 엔딩 ${Math.min(found, EP.endingCount)} / ${EP.endingCount}` : `엔딩 ${EP.endingCount}가지`;
    document.querySelectorAll('[data-age]').forEach(b => b.addEventListener('click', () => start(b.dataset.age)));
    $('#dialog').addEventListener('click', advance);
    $('#next').addEventListener('click', e => { e.stopPropagation(); advance(); });
    document.addEventListener('keydown', e => {
      if ((e.key === ' ' || e.key === 'Enter') && $('#title').hidden && $('#ending').hidden && $('#cards').hidden && $('#choices').hidden && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); advance(); }
      if (e.key === 'Escape') $('#cards').hidden = true;
    });
    $('#cards-btn').addEventListener('click', openCards);
    $('#cards-close').addEventListener('click', () => { $('#cards').hidden = true; });
    $('#cards').addEventListener('click', e => { if (e.target.id === 'cards') $('#cards').hidden = true; });
    $('#end-retry').addEventListener('click', () => start(S.age));
    $('#end-home').addEventListener('click', () => { $('#ending').hidden = true; boot.title(); });
    $('#home-btn').addEventListener('click', () => boot.title());
  }
  boot.title = () => {
    const found = store.get().length;
    $('#title-count').textContent = found ? `찾은 엔딩 ${Math.min(found, EP.endingCount)} / ${EP.endingCount}` : `엔딩 ${EP.endingCount}가지`;
    $('#title').hidden = false;
  };

  boot();
})();
