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

  /* ---------- 무대: 비주얼 노벨 레이어 ----------
   * 배경 레이어 → 캐릭터 레이어 → CG 레이어 → 휴대폰 화면 → 대사창
   * 같은 인물은 장면이 바뀌어도 그대로 남아 표정·자리만 바뀐다(깜빡이지 않음).
   */
  const POS = { farleft: 12, left: 24, center: 50, right: 76, farright: 88 };
  const Stage = {
    bgId: null, cast: new Map(),
    bg(id) {
      if (!id || id === this.bgId) return;
      this.bgId = id;
      const layer = $('#layer-bg');
      const img = new Image();
      img.className = 'bg'; img.alt = ''; img.src = ART.bg(id);
      layer.appendChild(img);
      const olds = [...layer.children].filter(x => x !== img);
      requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('in')));
      setTimeout(() => olds.forEach(o => o.remove()), reduce ? 0 : 500);
    },
    show(id, pos, face) {
      let c = this.cast.get(id);
      if (!c) {
        const el = document.createElement('div');
        el.className = 'sprite'; el.dataset.id = id;
        el.innerHTML = '<img alt="">';
        $('#layer-chars').appendChild(el);
        c = { el, face: null, pos: null };
        this.cast.set(id, c);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
      }
      if (pos && pos !== c.pos) { c.pos = pos; c.el.style.left = (POS[pos] ?? parseFloat(pos)) + '%'; }
      this.face(id, face || c.face || 'normal');
    },
    face(id, face) {
      const c = this.cast.get(id);
      if (!c || !face || face === c.face) return;
      c.face = face;
      const img = c.el.querySelector('img');
      img.src = ART.sprite(id, face);
      img.alt = `${EP.names[id] || id} (${face})`;
    },
    hide(id) {
      const c = this.cast.get(id);
      if (!c) return;
      this.cast.delete(id);
      c.el.classList.remove('in');
      setTimeout(() => c.el.remove(), reduce ? 0 : 350);
    },
    set(list) {
      const keep = new Set(list.map(x => x[0]));
      [...this.cast.keys()].forEach(k => { if (!keep.has(k)) this.hide(k); });
      list.forEach(([id, face, pos]) => this.show(id, pos, face));
    },
    speak(who) {
      const onStage = this.cast.has(who);
      this.cast.forEach((c, id) => c.el.classList.toggle('dim', onStage && id !== who));
    },
    cg(id) {
      const src = id && ART.cg(id);
      const layer = $('#layer-cg');
      if (!src) { layer.classList.remove('in'); return; }
      layer.querySelector('img').src = src;
      layer.classList.add('in');
    },
    shake() {
      if (reduce) return;
      const st = $('#stage');
      st.classList.remove('shake'); void st.offsetWidth; st.classList.add('shake');
    },
    reset() { this.bgId = null; this.cast.clear(); $('#layer-bg').innerHTML = ''; $('#layer-chars').innerHTML = ''; this.cg(null); }
  };

  /* 대본 지시어: ['@bg', id] ['@show', 인물, 자리, 표정] ['@hide', 인물] ['@face', 인물, 표정] ['@cg', id|null] ['@shake'] */
  function direct(l) {
    const [cmd, a, b, c] = l;
    if (cmd === '@bg') Stage.bg(val(a));
    else if (cmd === '@show') Stage.show(a, b, c);
    else if (cmd === '@hide') Stage.hide(a);
    else if (cmd === '@face') Stage.face(a, b);
    else if (cmd === '@cg') Stage.cg(a);
    else if (cmd === '@shake') Stage.shake();
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
      .filter(l => l && (String(l[0]).startsWith('@') || !l[2] || l[2].includes(S.age)))
      .map(l => (String(l[0]).startsWith('@') ? l : [l[0], val(l[1])]));
    queue = lines; qi = 0;
    Stage.bg(val(node.bg));
    Stage.set(val(node.cast) || []);
    Stage.cg(val(node.cg) || null);
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

  function showLine() {
    while (queue[qi] && String(queue[qi][0]).startsWith('@')) { direct(queue[qi]); qi += 1; }
    const line = queue[qi];
    if (!line) { Stage.speak(null); return finishNode(); }
    let [who, text] = line;
    if (who.includes('@')) { const [id, face] = who.split('@'); who = id; Stage.face(id, face); }
    Stage.speak(who);
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
    Stage.reset();
    $('#title').hidden = true;
    $('#ending').hidden = true;
    $('#age-chip').textContent = AGES[age];
    hud();
    goto(EP.start.node);
  }

  function boot() {
    $('#ep-title').textContent = EP.title;
    $('#ep-blurb').textContent = EP.blurb;
    const ta = EP.titleArt || { bg: 'room_sick', cast: [['me', 'worry', 'right']] };
    $('#title-art').innerHTML = `<img class="bg in" alt="" src="${ART.bg(ta.bg)}">` +
      ta.cast.map(([id, face, pos]) => `<div class="sprite in" style="left:${POS[pos] ?? 50}%"><img alt="" src="${ART.sprite(id, face)}"></div>`).join('');
    const found = store.get().length;
    $('#title-count').textContent = found ? `찾은 엔딩 ${Math.min(found, EP.endingCount)} / ${EP.endingCount}` : `엔딩 ${EP.endingCount}가지`;
    if (window.CATALOG) {
      $('#roadmap').innerHTML = CATALOG.map(g => `<section><h3>${g.age}</h3><ul>${g.items.map(i => `<li class="${i.ready ? 'ready' : ''}">${i.t}<span>${i.ready ? '플레이 가능' : '준비 중'}</span></li>`).join('')}</ul></section>`).join('');
    }
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
