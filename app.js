/* 越南跨年之旅 — 程式（資料請改 data.js） */
(function () {
  'use strict';

  /* ================= 小工具 ================= */
  const APP_VER = window.APP_VER || '0';
  const APP_DATE = window.APP_DATE || '';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n, cls) => `<svg class="ic ${cls || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const pad = n => String(n).padStart(2, '0');
  const fmt = n => Math.round(Number(n) || 0).toLocaleString('en-US');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const DOW = ['日', '一', '二', '三', '四', '五', '六'];
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HAS_API = typeof API_URL === 'string' && /^https:\/\//.test(API_URL) || /^http:\/\/(localhost|127\.)/.test(typeof API_URL === 'string' ? API_URL : '');
  const IMGS = (typeof IMG !== 'undefined' && IMG) || { cover: 'images/cover.svg', banners: null };

  /* ================= 插圖（細線 SVG，跟著風格變色；全部內建，離線可用） ================= */
  const ARTS = {
    lotus: `<path class="d" d="M18 66h84M36 73h48"/><path d="M60 64C46 64 30 56 26 44c12 0 26 8 34 20z"/><path d="M60 64c14 0 30-8 34-20-12 0-26 8-34 20z"/><path d="M60 64C48 58 40 44 42 30c10 5 16 18 18 34z"/><path d="M60 64c12-6 20-20 18-34-10 5-16 18-18 34z"/><path class="a" d="M60 64c-9-13-8-32 0-44 8 12 9 31 0 44z"/>`,
    plane: `<path class="d nd" stroke-dasharray="2 5" d="M10 64Q60 -4 110 52"/><circle class="f" cx="10" cy="64" r="2.5"/><circle class="f" cx="110" cy="52" r="2.5"/><path class="d cl1" d="M22 34h10a4 4 0 000-8 6 6 0 00-11 2 3 3 0 001 6z"/><path class="d cl2" d="M82 70h9a3.5 3.5 0 000-7 5 5 0 00-9.5 1.5A3 3 0 0082 70z"/><g class="a" {pos}><path d="M-9 0L7-1.6 10 0 7 1.6zM-1-1l-5-7h3l7 6.2M-1 1l-5 7h3l7-6.2M-7-.6l-2.5-3.8h1.6l3 3.6"/>{fly}</g>`,
    cityhall: `<path class="d" d="M10 70h100"/><path d="M22 70V50h76v20"/><path d="M18 50h84"/><path d="M52 50V28h16v22"/><path d="M50 28h20M54 28l6-14 6 14"/><path class="a" d="M60 14V5M60 6h7l-2 2.2 2 2.2h-7"/><circle class="a" cx="60" cy="38" r="3.5"/><path d="M26 50V40h12v10M24 40h16M27 40c0-5.500 10-5.500 10 0"/><path d="M82 50V40h12v10M80 40h16M83 40c0-5.500 10-5.500 10 0"/><path class="d" d="M30 70V61a3 3 0 016 0v9M43 70V61a3 3 0 016 0v9M71 70V61a3 3 0 016 0v9M84 70V61a3 3 0 016 0v9M56 70V59a4 4 0 018 0v11"/>`,
    suitcase: `<path class="d" d="M12 72h96"/><rect x="26" y="28" width="50" height="38" rx="5"/><path d="M42 28v-7a3 3 0 013-3h12a3 3 0 013 3v7"/><path class="d" d="M38 28v38M64 28v38"/><circle cx="36" cy="69.500" r="2.500"/><circle cx="66" cy="69.500" r="2.500"/><path class="a" d="M60 20l9 5-2 10-9-3z"/><path class="a" d="M78 66l15-15 15 15z"/><path class="a d" d="M85.500 58.500h15M82 62h22"/>`,
    coins: `<path class="d" d="M14 72h92"/><ellipse cx="42" cy="44" rx="18" ry="6"/><path d="M24 44v8c0 3.300 8 6 18 6s18-2.700 18-6v-8"/><path d="M24 52v8c0 3.300 8 6 18 6s18-2.700 18-6v-8"/><path d="M24 60v6c0 3.300 8 6 18 6s18-2.700 18-6v-6"/><circle class="a" cx="86" cy="52" r="15"/><circle class="a d" cx="86" cy="52" r="11"/><circle class="a" cx="84.800" cy="54.300" r="3.400"/><path class="a" d="M88.300 45v13M85.800 47.300h5"/><path class="a tw" d="M70 20v8M66 24h8"/><path class="a tw t2" d="M105 26v6M102 29h6"/>`,
    pho: `<path class="d" d="M20 72h80"/><path d="M30 46h60c0 14-12 22-30 22S30 60 30 46z"/><path d="M26 46h68"/><path class="d" d="M38 53c6 3 12-3 18 0s12-3 18 0"/><path d="M70 40l28-20M75 42l25-16"/><g class="a steam"><path d="M46 38c-3-4 3-6 0-10s3-6 0-9"/><path d="M58 38c-3-4 3-6 0-10s3-6 0-9"/></g>`,
    phin: `<path class="d" d="M24 72h72"/><path d="M40 24h40M56 24v-4h8v4"/><path d="M44 24l3 16h26l3-16"/><path d="M36 40h48"/><path d="M46 44h28l-3 28H49z"/><path class="a" d="M48.500 62h23"/><circle class="f drip" cx="60" cy="46" r="1.700"/>`,
    fireworks: `<path class="d" d="M10 74h100M38 73V54M84 73V46M66 73v-8"/><g transform="translate(38 34) scale(1.35)"><g class="a burst"><path d="M0-5v-9M0 5v9M-5 0h-9M5 0h9M-3.500-3.500l-6.400-6.400M3.500 3.500l6.400 6.400M3.500-3.500l6.400-6.400M-3.500 3.500l-6.400 6.400"/></g></g><g transform="translate(84 26)"><g class="burst b2"><path d="M0-5v-9M0 5v9M-5 0h-9M5 0h9M-3.500-3.500l-6.400-6.400M3.500 3.500l6.400 6.400M3.500-3.500l6.400-6.400M-3.500 3.500l-6.400 6.400"/></g></g><g transform="translate(66 54) scale(.6)"><g class="a burst b3"><path d="M0-5v-9M0 5v9M-5 0h-9M5 0h9M-3.500-3.500l-6.400-6.400M3.500 3.500l6.400 6.400M3.500-3.500l6.400-6.400M-3.500 3.500l-6.400 6.400"/></g></g>`,
    church: `<path class="d" d="M14 72h92"/><path d="M52 72V36h16v36"/><path class="a" d="M52 36l8-22 8 22"/><path class="a" d="M60 14V6M57 9h6"/><circle cx="60" cy="46" r="3.500"/><path d="M56 72V62a4 4 0 018 0v10"/><path d="M52 50H34v22M68 50h18v22"/><path d="M30 50l5-8h17M68 42h17l5 8"/><path class="d" d="M40 72V61a2.500 2.500 0 015 0v11M75 72V61a2.500 2.500 0 015 0v11"/><path d="M36 42v-7l2.500-5 2.500 5v7M79 42v-7l2.500-5 2.500 5v7"/>`,
    palm: `<path class="d" d="M10 72c16-4 30 2 50-1s34-3 50 1"/><path d="M42 71c0-14 2-26 6-36"/><path d="M48 35c-7-7-17-6-22 0M48 35c-3-10-12-13-19-11M48 35c1-10 9-15 17-13M48 35c8-5 17-1 20 6M48 35c6 2 9 8 9 14M48 35c-6 2-10 8-11 14"/><path class="d" d="M86 71c0-9 1-17 3-23"/><path class="d" d="M89 48c-5-5-11-4-15 0M89 48c-1-7 4-11 10-10M89 48c5-3 11-1 13 4M89 48c-4 2-6 6-6 10"/><path class="a" d="M58 70l11-10 11 10z"/><path class="a d" d="M63.500 65h11"/>`,
    market: `<path class="d" d="M10 72h100"/><path d="M48 72V34h24v38"/><path d="M44 34h32l-6-9H50z"/><path d="M55 25v-7h10v7M60 18v-5"/><circle class="a" cx="60" cy="44" r="5"/><path class="a" d="M60 41v3l2 1.500"/><path d="M54 72V60a6 6 0 0112 0v12"/><path d="M48 54H20v18M72 54h28v18"/><path d="M16 54l5-7h27M72 47h27l5 7"/><path class="d" d="M28 72v-9h8v9M84 72v-9h8v9"/>`
  };
  function art(name, cls) {
    let body = ARTS[name] || ARTS.lotus;
    body = body.replace('{fly}', reduced ? '' : '<animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path="M10 64Q60 -4 110 52" keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear"/>')
      .replace('{pos}', reduced ? 'transform="translate(62 28) rotate(-6)"' : '');
    if (cls && cls.indexOf('draw') >= 0) body = body.replace(/<(path|circle|ellipse|rect)(?![^>]*class="[^"]*(?:nd|\bf\b))/g, '<$1 pathLength="1"');
    return `<svg class="art art-${name} ${cls || ''}" viewBox="0 0 120 80" aria-hidden="true">${body}</svg>`;
  }
  /** 斗笠小機車 */
  function scooter(id, cls) {
    return `<svg ${id ? `id="${id}"` : ''} class="sct ${cls || ''}" viewBox="0 0 64 46" aria-hidden="true"><circle class="puff" cx="2" cy="35" r="2.200"/><circle class="puff p2" cx="-3" cy="31" r="2.800"/><circle class="puff p3" cx="-9" cy="34" r="3.400"/><g class="body">
    <circle cx="15" cy="37" r="6.200" fill="none" stroke="var(--ink)" stroke-width="2"/><circle cx="49" cy="37" r="6.200" fill="none" stroke="var(--ink)" stroke-width="2"/>
    <path d="M6 31c0-6 5-9 12-9h9c2 0 3 1.500 3 3.500V33H7z" fill="var(--acc)"/><path d="M9 21h17" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
    <path d="M28 33h11l5-15" fill="none" stroke="var(--acc)" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M41 16l8-1.500" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    <circle cx="46.500" cy="19" r="4.600" fill="#fff6e0" stroke="var(--ink)" stroke-width="1.200"/><ellipse class="eye" cx="47.300" cy="19" rx="1.500" ry="1.900" fill="#1a1512"/>
    <path d="M35 13.500L46 3.500l11 10z" fill="#ecdcae" stroke="var(--ink)" stroke-width="1.200" stroke-linejoin="round"/><path d="M40.500 9h11M38 11.500h16" stroke="rgba(0,0,0,.18)" stroke-width=".8"/>
  </g></svg>`;
  }
  const SKYLINE = `<svg class="sky" viewBox="0 0 360 64" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle class="moon" cx="304" cy="15" r="7"/><path d="M0 58h10V44h12v14h6V34h14v24h8V46h10v12h6V26h5l4-12 4 12h5v32h8V40h12v18h6V30h10V20h8v10h6v28h10V44h14v14h6V36l7-12 7 12v22h8V48h12v10h8V22h4V10h6v12h4v36h10V42h12v16h8V50h14v8h6V34h12v24h10V46h10v12h14"/><path class="gr" d="M0 61.500h360"/></svg>`;
  function dayArt(key, title) {
    const m = (typeof DAY_ART !== 'undefined' && DAY_ART) ? DAY_ART[key] : null; if (m && ARTS[m]) return m;
    const t = title || '';
    if (/煙火|跨年|倒數/.test(t)) return 'fireworks';
    if (/教堂/.test(t)) return 'church';
    if (/地道|古芝|湄公|美萩/.test(t)) return 'palm';
    if (/市場|夜市|採買/.test(t)) return 'market';
    if (/機場|回家|返程/.test(t)) return 'plane';
    return 'cityhall';
  }
  /** 數字跳動 */
  function countUp(root) {
    if (reduced || !root) return;
    $$('.cu', root).forEach(el => {
      const to = +el.dataset.to; if (!(to > 0)) return;
      const t0 = performance.now(), d = 800;
      const f = t => { const k = Math.min((t - t0) / d, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
  }
  /** 全部完成時放煙火 */
  function celebrate() {
    if (reduced) return;
    const cv = document.createElement('canvas'); cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:88;pointer-events:none';
    document.body.appendChild(cv);
    const r = Math.min(window.devicePixelRatio || 1, 2), W = cv.width = innerWidth * r, H = cv.height = innerHeight * r, ctx = cv.getContext('2d');
    const cs = getComputedStyle(document.documentElement), cols = [cs.getPropertyValue('--acc').trim() || '#db5236', cs.getPropertyValue('--ink').trim() || '#efe6d6'];
    const ps = [], boom = (x, y, n) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (Math.random() * 4.2 + 1.6) * r; ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: cols[i % 2], s: (Math.random() * 1.8 + 1.2) * r }); } };
    boom(W * .3, H * .34, 48); setTimeout(() => boom(W * .72, H * .27, 48), 260); setTimeout(() => boom(W * .5, H * .44, 64), 540);
    const t0 = performance.now();
    const step = t => {
      ctx.clearRect(0, 0, W, H);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .07 * r; p.vx *= .985; p.vy *= .985; p.l -= .011; if (p.l > 0) { ctx.globalAlpha = p.l; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.3); ctx.fill(); } });
      if (t - t0 < 2400) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
  }
  /** 記帳成功：一枚硬幣飛進底部的「記帳」 */
  function coinFly(a) {
    const nb = $('#nav button[data-p=wallet]');
    if (reduced || !a || !nb || !document.body.animate) return;
    const b = nb.getBoundingClientRect(), c = document.createElement('div');
    c.className = 'coin'; c.textContent = TRIP.cur.sym; c.style.left = (a.left + a.width / 2 - 16) + 'px'; c.style.top = (a.top + a.height / 2 - 16) + 'px';
    document.body.appendChild(c);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    c.animate([{ transform: 'translate(0,0) scale(.6) rotateY(0)', opacity: 0 }, { transform: `translate(${dx * .4}px,${dy * .4 - 96}px) scale(1.15) rotateY(360deg)`, opacity: 1, offset: .45 }, { transform: `translate(${dx}px,${dy}px) scale(.45) rotateY(720deg)`, opacity: .35 }],
      { duration: 780, easing: 'cubic-bezier(.4,0,.3,1)' }).onfinish = () => { c.remove(); nb.classList.remove('bump'); void nb.offsetWidth; nb.classList.add('bump'); };
  }

  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 空間不足就算了 */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } }
  };

  let toastT;
  function toast(msg, ms) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms || 2600);
  }
  /** 防試算表公式注入：開頭不能是 = + - @ */
  function badText(s) {
    if (/^[=+\-@]/.test(String(s).trim())) { toast('開頭不能是 = + - @ 這些符號'); return true; }
    return false;
  }

  /* ================= 時間（以行程當地時區為準） ================= */
  const SIM = (() => { const m = /[?&]now=(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?)/.exec(location.search); return m ? m[1] : null; })();
  function mk(date, mins, ms) { const p = date.split('-').map(Number); return { date, key: p[1] + '/' + p[2], mins, ms }; }
  function tripNow() {
    if (SIM) {
      const [d, t = '00:00'] = SIM.split('T'); const [hh, mm] = t.split(':').map(Number);
      return mk(d, hh * 60 + mm, Date.parse(d + 'T' + t + ':00' + TRIP.tzOffset));
    }
    const now = new Date(), p = {};
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: TRIP.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(now).forEach(x => { p[x.type] = x.value; });
      return mk(`${p.year}-${p.month}-${p.day}`, (+p.hour % 24) * 60 + (+p.minute), now.getTime());
    } catch (e) {
      return mk(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, now.getHours() * 60 + now.getMinutes(), now.getTime());
    }
  }
  const FIRST = TRIP.days[0].date, LAST = TRIP.days[TRIP.days.length - 1].date;
  function phase(n) { return n.date < FIRST ? 'before' : n.date > LAST ? 'after' : 'during'; }
  function deviceDate() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function todayStr() { const n = tripNow(); return (SIM || phase(n) === 'during') ? n.date : deviceDate(); }
  function normKey(k) { const m = /^\s*0?(\d{1,2})\s*[\/\-.]\s*0?(\d{1,2})\s*$/.exec(String(k)); return m ? (+m[1]) + '/' + (+m[2]) : String(k).trim(); }
  function keyDate(key) {
    const t = TRIP.days.find(d => d.key === key); if (t) return t.date;
    const p = key.split('/').map(Number), sy = +FIRST.slice(0, 4), sm = +FIRST.slice(5, 7);
    return `${p[0] >= sm ? sy : sy + 1}-${pad(p[0] || 1)}-${pad(p[1] || 1)}`;
  }
  function dateKey(date) { const p = date.split('-').map(Number); return p[1] + '/' + p[2]; }
  function dowOf(date) { return DOW[new Date(date + 'T12:00:00').getDay()]; }
  function toMins(t) { const m = /^(\d{1,2})[:：](\d{2})/.exec(String(t || '').trim()); return m ? (+m[1]) * 60 + (+m[2]) : null; }
  function hm(mins) { const h = Math.floor(mins / 60), m = mins % 60; return (h ? h + ' 時 ' : '') + m + ' 分'; }

  /* ================= 狀態 ================= */
  let user = LS.get('ft_user', null);          // {name, token, local}
  let D = null;                                // 個人資料（會同步到雲端）
  let itin = LS.get('ft_itin', null) || { days: DAYS, items: ITIN, src: 'built-in', ts: 0 };
  let members = LS.get('ft_members', []);
  let splits = LS.get('ft_splits', []);
  let splitQ = LS.get('ft_splitq', []);
  let wx = LS.get('ft_wx', null), wxState = wx ? 'ok' : 'loading';
  let fx = LS.get('ft_fx', null), fxState = fx ? 'ok' : 'loading';
  let page = 'home', curDay = TRIP.days[0].key, curGroup = GROUPS[0].id, walletTab = 'add';
  let started = false;
  const F = { mode: 'me', cur: 'VND', amt: '', cat: LS.get('ft_lastcat', CATS[0]), note: '', payer: '', who: null, split: 'even', custom: {} };

  function blankD() {
    return { v: 1, ts: 0, exp: [], todoAdd: [], todoDel: [], todoChk: {}, buyAdd: [], buyDel: [], buyChk: {}, flight: '', budget: 0, rate: 0 };
  }
  function loadD() { D = Object.assign(blankD(), LS.get('ft_d_' + user.name, {})); }
  let pushT;
  function saveD() {
    D.ts = Date.now(); LS.set('ft_d_' + user.name, D); LS.set('ft_dirty', 1);
    clearTimeout(pushT); pushT = setTimeout(pushD, 1500);
  }
  const canSync = () => HAS_API && user && user.token && navigator.onLine;
  const rate = () => (D && D.rate > 0) ? D.rate : (fx && fx.rate) || TRIP.defaultRate;
  const toTwd = (amt, cur) => cur === 'TWD' ? amt : amt * rate();
  const myGroup = () => (D && D.flight) || (GROUPS.length === 1 ? GROUPS[0].id : '');

  /* ================= 後端 ================= */
  async function api(action, body) {
    const payload = Object.assign({ action }, user && user.token ? { name: user.name, token: user.token } : {}, body || {});
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 25000);
    try {
      const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow', signal: ctl.signal });
      const j = await r.json();
      if (j && j.err === 'AUTH' && action !== 'login') authFail();
      return j;
    } catch (e) { return { ok: false, err: 'NET', msg: navigator.onLine ? '連不上試算表。若網路正常，請主辦人確認 Apps Script 部署的「誰可以存取」是「所有人」' : '目前沒有網路，請連上網路再登入' }; }
    finally { clearTimeout(t); }
  }
  function authFail() {
    if (!user) return;
    user.token = null; LS.set('ft_user', user);
    showLogin('登入已失效（可能是主辦人改了團體密碼），請重新登入');
  }
  async function pushD() {
    if (!canSync() || !LS.get('ft_dirty', 0)) return;
    const ts = D.ts, j = await api('saveData', { data: JSON.stringify(D), ts });
    if (j.ok && D.ts === ts) LS.set('ft_dirty', 0);
  }
  async function pullD() {
    if (!canSync()) return;
    const j = await api('getData');
    if (!j.ok) return;
    adoptCloud(j.data, j.ts);
  }
  function adoptCloud(data, ts) {
    if (data && !LS.get('ft_dirty', 0) && Number(ts) > (D.ts || 0)) {
      try { D = Object.assign(blankD(), JSON.parse(data)); LS.set('ft_d_' + user.name, D); renderAll(); } catch (e) { /* 壞資料就忽略 */ }
    } else if (LS.get('ft_dirty', 0) || !data) { LS.set('ft_dirty', 1); pushD(); }
  }

  /* ---------- 行程 ---------- */
  function setItin(j, src) {
    itin = {
      days: (j.days && j.days.length ? j.days : DAYS).map(d => Object.assign({}, d, { date: normKey(d.date) })),
      items: j.items.map(it => Object.assign({}, it, { date: normKey(it.date) })), src, ts: Date.now()
    };
    LS.set('ft_itin', itin);
    if (started) { rItin(); rHomeNext(); }
  }
  async function loadItin() {
    if (!HAS_API || !navigator.onLine) return;
    try {
      const r = await fetch(API_URL + (API_URL.indexOf('?') < 0 ? '?' : '&') + 'action=itin', { redirect: 'follow' });
      const j = await r.json();
      if (!j.ok) return;
      if (j.items && j.items.length) {
        setItin(j, 'sheet');
        if (ITIN_PATCHES.length && canSync()) {
          const p = await api('patchItin', { patches: ITIN_PATCHES });
          if (p.ok && p.applied && p.applied.length) { toast('已套用行程更新（舊的已備份）'); loadItinOnce(); }
        }
      } else if (canSync()) {
        const s = await api('seedItin', { days: DAYS, items: ITIN });
        if (s.ok && s.seeded) { toast('已把行程寫進試算表', 3600); loadItinOnce(); }
      }
    } catch (e) { /* 沒網路：用上次的 */ }
  }
  async function loadItinOnce() {
    try {
      const r = await fetch(API_URL + (API_URL.indexOf('?') < 0 ? '?' : '&') + 'action=itin', { redirect: 'follow' });
      const j = await r.json(); if (j.ok && j.items && j.items.length) setItin(j, 'sheet');
    } catch (e) { /* noop */ }
  }
  function dayKeys() {
    const keys = [];
    (itin.days || []).forEach(d => { const k = normKey(d.date); if (k && !keys.includes(k)) keys.push(k); });
    (itin.items || []).forEach(it => { const k = normKey(it.date); if (k && !keys.includes(k)) keys.push(k); });
    if (!keys.length) TRIP.days.forEach(d => keys.push(d.key));
    return keys.sort((a, b) => keyDate(a).localeCompare(keyDate(b)));
  }
  function dayInfo(key) { return (itin.days || []).find(d => normKey(d.date) === key) || { date: key, title: '', hotel: '', pax: '' }; }
  function itemsOf(key, group) {
    return (itin.items || []).filter(it => normKey(it.date) === key && (!it.group || !group || it.group === group || GROUPS.length === 1))
      .map((it, i) => Object.assign({ m: toMins(it.time), cm: toMins(it.close), i }, it))
      .sort((a, b) => (a.m == null ? 9999 : a.m) - (b.m == null ? 9999 : b.m) || a.i - b.i);
  }
  function hotelFor(key) { return HOTELS.find(h => (h.nights || []).map(normKey).includes(key)) || null; }
  function tonightHotel() {
    const n = tripNow(); let key = n.key;
    if (phase(n) === 'before') key = TRIP.days[0].key;
    else if (n.mins < 5 * 60) { const i = TRIP.days.findIndex(d => d.key === key); if (i > 0) key = TRIP.days[i - 1].key; }
    return hotelFor(key) || (phase(n) === 'during' ? null : HOTELS[0] || null);
  }
  function mapUrl(place, nav) {
    const q = encodeURIComponent(place);
    return nav ? `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=${TRIP.navMode || 'transit'}`
      : `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  /* ---------- 分帳 ---------- */
  function allMembers() { const m = members.slice(); if (user && !m.includes(user.name)) m.push(user.name); return m; }
  async function flushQ() {
    if (!canSync()) return;
    while (splitQ.length) {
      const op = splitQ[0];
      const j = op.op === 'add' ? await api('addSplit', { rec: op.rec }) : await api('delSplit', { id: op.id });
      if (j.ok || (j.err !== 'NET' && j.err !== 'AUTH')) {
        if (!j.ok) toast(j.msg || '有一筆分帳沒同步成功');
        splitQ.shift(); LS.set('ft_splitq', splitQ);
      } else break;
    }
  }
  async function loadSplits() {
    if (!canSync()) return;
    await flushQ();
    if (splitQ.length) return;
    const j = await api('listSplits');
    if (j.ok) {
      splits = j.splits || []; members = j.members || members;
      LS.set('ft_splits', splits); LS.set('ft_members', members);
      if (page === 'wallet') rWallet(); rHomeSpend();
    }
  }
  function settle(net) {
    const cr = [], db = [], res = [];
    Object.keys(net).forEach(k => { const v = Math.round(net[k]); if (v > 0) cr.push([k, v]); else if (v < 0) db.push([k, -v]); });
    for (let i = db.length - 1; i >= 0; i--) {               // 金額剛好相同的先配對，轉帳次數最少
      const j = cr.findIndex(c => c[1] === db[i][1]);
      if (j >= 0) { res.push({ from: db[i][0], to: cr[j][0], amt: db[i][1] }); cr.splice(j, 1); db.splice(i, 1); }
    }
    const big = (a, b) => b[1] - a[1];
    while (cr.length && db.length) {
      cr.sort(big); db.sort(big);
      const a = Math.min(cr[0][1], db[0][1]);
      res.push({ from: db[0][0], to: cr[0][0], amt: a });
      cr[0][1] -= a; db[0][1] -= a;
      if (!cr[0][1]) cr.shift(); if (!db[0][1]) db.shift();
    }
    return res;
  }

  /* ---------- 天氣與匯率 ---------- */
  async function getJson(url, ms) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || 9000);
    try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
    finally { clearTimeout(t); }
  }
  async function loadWx(force) {
    if (!force && wx && Date.now() - wx.ts < 30 * 60000) { wxState = 'ok'; return; }
    wxState = wx ? 'ok' : 'loading'; rHomeWx();
    try {
      const cities = [];
      for (const c of CITIES) {
        const j = await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${encodeURIComponent(TRIP.tz)}&forecast_days=16`);
        cities.push({ name: c.name, t: j.current.temperature_2m, code: j.current.weather_code, daily: j.daily });
      }
      wx = { ts: Date.now(), cities }; LS.set('ft_wx', wx); wxState = 'ok';
    } catch (e) { wxState = wx ? 'stale' : 'err'; }
    rHomeWx(); if (page === 'itin') rDay();
  }
  async function loadFx(force) {
    if (!force && fx && Date.now() - fx.ts < 6 * 3600000) { fxState = 'ok'; return; }
    fxState = fx ? 'ok' : 'loading'; rHomeFx();
    try {
      const j = await getJson('https://open.er-api.com/v6/latest/' + TRIP.home.code);
      const v = j && j.rates && j.rates[TRIP.cur.code];
      if (!(v > 0)) throw new Error('no rate');
      fx = { ts: Date.now(), rate: 1 / v }; LS.set('ft_fx', fx); fxState = 'ok';
    } catch (e) { fxState = fx ? 'stale' : 'err'; }
    rHomeFx();
  }
  function wxIcon(code) {
    if (code === 0) return 'sun'; if (code <= 2) return 'pcloud'; if (code === 3) return 'cloud';
    if (code <= 48) return 'fog'; if (code <= 67) return 'rain'; if (code <= 77) return 'snow';
    if (code <= 82) return 'rain'; if (code <= 86) return 'snow'; return 'storm';
  }
  function wxText(code) {
    if (code === 0) return '晴'; if (code <= 2) return '多雲時晴'; if (code === 3) return '陰';
    if (code <= 48) return '霧'; if (code <= 67) return '雨'; if (code <= 77) return '雪';
    if (code <= 82) return '陣雨'; if (code <= 86) return '陣雪'; return '雷雨';
  }
  function wxFor(date) {
    const c = wx && wx.cities && wx.cities[0]; if (!c || !c.daily) return null;
    const i = c.daily.time.indexOf(date); if (i < 0) return null;
    return { code: c.daily.weather_code[i], hi: Math.round(c.daily.temperature_2m_max[i]), lo: Math.round(c.daily.temperature_2m_min[i]), rain: c.daily.precipitation_probability_max[i] };
  }
  function stamp(ts) { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }

  /* ================= 風格 ================= */
  const THEMES = [
    { id: 'lacquer', name: '漆藝夜色', sw: ['#0e0c0b', '#efe6d6', '#db5236'], color: '#0e0c0b', sfx: 'Vèo!' },
    { id: 'indo', name: '印度支那懷舊', sw: ['#f2e7c9', '#27362d', '#2c6b57'], color: '#f2e7c9', sfx: 'Xoạch', font: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap' },
    { id: 'neon', name: '西貢霓虹', sw: ['#0a0618', '#ff3fa8', '#2de2ff'], color: '#0a0618', sfx: 'BÍP BÍP', font: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,600;0,700;1,700&display=swap' }
  ];
  let theme = LS.get('ft_theme', 'lacquer');
  function applyTheme(id) {
    const t = THEMES.find(x => x.id === id) || THEMES[0]; theme = t.id;
    document.documentElement.dataset.theme = t.id;
    const m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', t.color);
    if (t.font && !$('link[data-font="' + t.id + '"]')) {         // 其他風格的字型，切換時才下載
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = t.font; l.dataset.font = t.id; document.head.appendChild(l);
    }
    LS.set('ft_theme', t.id);
  }

  /* ================= 封面 ================= */
  let sparkRun = false;
  function cover() {
    $('#coverArt').style.backgroundImage = `url("${IMGS.cover}?v=${APP_VER}")`;
    const a = TRIP.days[0], b = TRIP.days[TRIP.days.length - 1];
    $('#cvKicker').textContent = (TRIP.destLocal || '').toUpperCase();
    $('#cvTitle').innerHTML = Array.from(TRIP.title).map((c, i) => `<span style="animation-delay:${(.3 + i * .08).toFixed(2)}s">${esc(c)}</span>`).join('');
    $('#cvSub').textContent = `${a.date.replace(/-/g, '.')} — ${b.date.slice(5).replace('-', '.')}　${TRIP.dest}`;
    $('#cvLocal').textContent = TRIP.enterLocal || '';
    if (!reduced) sparks();
  }
  function sparks() {
    const cv = $('#sparks'); if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d'); let W, H, ps = [], fw = [], last = 0, nextFw = 900;
    const size = () => { const r = Math.min(window.devicePixelRatio || 1, 2); W = cv.width = cv.clientWidth * r; H = cv.height = cv.clientHeight * r; };
    const born = (any) => ({ x: Math.random() * W, y: any ? Math.random() * H : H + 10, r: (Math.random() * 1.6 + .6) * (W / 400), vy: -(Math.random() * .25 + .08) * (H / 800), vx: (Math.random() - .5) * .12, a: Math.random() * .6 + .2, p: Math.random() * 6.3 });
    size(); for (let i = 0; i < 46; i++) ps.push(born(true));
    window.addEventListener('resize', size);
    sparkRun = true;
    const step = (t) => {
      if (!sparkRun) return;
      if (document.hidden) { requestAnimationFrame(step); return; }     // 看不到就不畫，省電
      const dt = Math.min(t - last, 50) || 16; last = t;
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p, i) => {
        p.y += p.vy * dt; p.x += (p.vx + Math.sin(t / 1400 + p.p) * .05) * dt;
        if (p.y < -10) ps[i] = born(false);
        const tw = .55 + .45 * Math.sin(t / 500 + p.p);
        ctx.beginPath(); ctx.fillStyle = `rgba(232,${96 + (i % 3) * 30},54,${p.a * tw})`;
        ctx.shadowColor = 'rgba(219,82,54,.9)'; ctx.shadowBlur = 8; ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill();
      });
      if (t > nextFw) {                                    // 跨年煙火：每隔幾秒在上半部綻放一朵
        nextFw = t + 1900 + Math.random() * 2400;
        const x = W * (.14 + Math.random() * .72), y = H * (.08 + Math.random() * .26), warm = Math.random() < .6, n = 30, sp = (Math.random() * .05 + .1) * (W / 400);
        for (let k = 0; k < n; k++) { const a = k / n * 6.283 + Math.random() * .1, v = sp * (.7 + Math.random() * .5); fw.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: warm ? '238,110,74' : '239,230,214' }); }
      }
      ctx.shadowBlur = 0;
      fw = fw.filter(p => p.l > 0);
      fw.forEach(p => {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .00009 * dt * (W / 400); p.vx *= .985; p.vy *= .985; p.l -= dt / 1500;
        ctx.beginPath(); ctx.fillStyle = `rgba(${p.c},${Math.max(p.l, 0) * .9})`; ctx.arc(p.x, p.y, 1.6 * (W / 400), 0, 6.3); ctx.fill();
      });
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function leaveCover() {
    $('#cover').classList.add('out'); sparkRun = false;
    setTimeout(() => { const c = $('#cover'); if (c) c.remove(); }, 700);
  }

  /* ================= 登入 ================= */
  function showLogin(msg) {
    $('#login').classList.add('on');
    $('#lgGroupF').classList.toggle('hide', !HAS_API);
    $('#lgPin').parentNode.classList.toggle('hide', !HAS_API);
    $('#lgNote').textContent = HAS_API
      ? '第一次用：取一個暱稱、設自己的密碼就加入了。換手機時用同一組登入，記帳和勾選會跟著回來。'
      : '主辦人還沒接上試算表，目前是單機模式：資料只存在這支手機。先取個暱稱就能用。';
    $('#lgErr').textContent = msg || '';
    if (user && user.name) $('#lgName').value = user.name;
  }
  async function doLogin(ev) {
    ev.preventDefault();
    const name = $('#lgName').value.trim(), pin = $('#lgPin').value, group = $('#lgGroup').value;
    const err = $('#lgErr'), btn = $('#lgBtn');
    if (!name) { err.textContent = '請輸入暱稱'; return; }
    if (/^[=+\-@]/.test(name)) { err.textContent = '暱稱開頭不能是 = + - @'; return; }
    if (!HAS_API) { user = { name, local: true }; LS.set('ft_user', user); $('#login').classList.remove('on'); start(); return; }
    if (pin.length < 4) { err.textContent = '個人密碼至少 4 個字'; return; }
    if (!group) { err.textContent = '請輸入團體密碼'; return; }
    btn.disabled = true; btn.textContent = '登入中…'; err.textContent = '';
    const j = await api('login', { name, pin, group });
    btn.disabled = false; btn.textContent = '進入行程';
    if (!j.ok) { err.textContent = j.msg || '登入失敗'; return; }
    const hadLocal = LS.get('ft_d_' + j.name, null);
    user = { name: j.name, token: j.token }; LS.set('ft_user', user);
    members = j.members || []; LS.set('ft_members', members);
    $('#lgPin').value = ''; $('#lgGroup').value = '';
    $('#login').classList.remove('on');
    loadD();
    if (hadLocal && (hadLocal.ts || 0) > (Number(j.ts) || 0)) LS.set('ft_dirty', 1);
    start();
    adoptCloud(j.data, j.ts);
    if (j.isNew) toast(`歡迎加入，${j.name}！`);
  }

  /* ================= 啟動 ================= */
  function start() {
    if (!D) loadD();
    started = true;
    $('#app').classList.remove('hide'); $('#nav').classList.remove('hide');
    const n = tripNow();
    const keys = dayKeys();
    const h = /#d=([\d\/]+)/.exec(location.hash);
    if (h && keys.includes(normKey(h[1]))) { curDay = normKey(h[1]); page = 'itin'; }
    else if (keys.includes(n.key)) curDay = n.key;
    else curDay = keys[0];
    curGroup = myGroup() || GROUPS[0].id;
    renderAll(); go(page, true);
    loadItin(); pullD(); loadSplits(); loadWx(); loadFx();
  }
  function renderAll() { if (!started) return; rHome(); rFlight(); rItin(); rPrep(); rWallet(); }
  function go(p, quiet) {
    page = p;
    $$('.page').forEach(el => el.classList.toggle('on', el.id === 'p-' + p));
    $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.p === p));
    if (!quiet) window.scrollTo(0, 0);
    if (p === 'itin') { rDay(true); moveMascot(true); }
    if (p === 'home') { countUp($('#h-hero')); countUp($('#h-spend')); }
    if (p === 'wallet') loadSplits();
    banner(p);
  }
  function banner(p) {                       // 分頁橫幅（可選）：用到才下載
    const src = IMGS.banners && IMGS.banners[p]; if (!src) return;
    const el = $('#p-' + p + ' .ph'); if (el && !el.dataset.bg) { el.dataset.bg = 1; el.style.backgroundImage = `linear-gradient(180deg,transparent,var(--bg)),url("${src}?v=${APP_VER}")`; }
  }
  const head = (code, local, title, a) => `<header class="ph">${a ? art(a, 'ph-art draw') : ''}<div class="ph-code">${code} <i>/</i> <span>${local}</span></div><h1>${title}</h1><div class="ph-line"></div></header>`;

  /* ================= 主頁 ================= */
  function rHome() {
    $('#p-home').innerHTML = head('HOME-2027', 'Trang chủ', '主頁', 'lotus') +
      `<div class="card hero" id="h-hero" style="animation-delay:.02s"></div>
       <div class="card" id="h-next" style="animation-delay:.08s"></div>
       <div class="card" style="animation-delay:.14s"><h3>工具箱 <span class="r">離線可用</span></h3><div class="tools">
         <button data-act="toHotel">${ic('bed')}回住宿</button>
         <button data-act="driver">${ic('car')}給司機看</button>
         <button data-act="phrases">${ic('chat')}會話卡</button>
         <button data-act="sos" class="sos">${ic('sos')}緊急求助</button>
         <button data-act="tips">${ic('info')}旅遊須知</button></div></div>
       <div class="card" id="h-wx" style="animation-delay:.2s"></div>
       <div class="card" id="h-fx" style="animation-delay:.26s"></div>
       <div class="card" id="h-prog" style="animation-delay:.32s"></div>
       <div class="card" id="h-spend" style="animation-delay:.38s"></div>
       <div class="card" style="animation-delay:.44s"><h3>畫面風格</h3><div class="themes">${THEMES.map(t =>
        `<button data-act="theme" data-id="${t.id}" class="${t.id === theme ? 'on' : ''}"><span class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span>${t.name}</button>`).join('')}</div></div>
       <div class="scene">${SKYLINE}${scooter('', 'rider')}</div>
       <div class="foot">LAST UPDATE ${APP_DATE}・v${APP_VER}<br><button data-act="logout">${esc(user.name)}・登出</button></div>`;
    rHomeHero(); rHomeNext(); rHomeWx(); rHomeFx(); rHomeProg(); rHomeSpend();
    countUp($('#h-hero')); countUp($('#h-spend'));
  }
  function rHomeHero() {
    const el = $('#h-hero'); if (!el) return;
    const n = tripNow(), ph = phase(n), ms = Date.parse(TRIP.depart) - n.ms;
    let dateTxt, big;
    if (ph === 'during' || SIM) dateTxt = `${n.key}（${dowOf(n.date)}）${pad(Math.floor(n.mins / 60))}:${pad(n.mins % 60)}・越南時間`;
    else { const d = new Date(); dateTxt = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${DOW[d.getDay()]}）`; }
    if (ms > 0) {
      const dd = Math.floor(ms / 86400000), hh = Math.floor(ms % 86400000 / 3600000);
      const pr = Math.max(.05, Math.min(.95, 1 - ms / (60 * 86400000)));     // 最後 60 天，小飛機慢慢往胡志明市靠近
      big = `<h3>出發倒數</h3><div class="big"><span class="cu" data-to="${dd}">${dd}</span><small>天</small><span class="cu" data-to="${hh}">${hh}</span><small>時</small></div>
        <div class="trk"><b>${esc(FLIGHTS[0] ? FLIGHTS[0].from.code : '')}</b><div class="trk-l"><i style="width:${pr * 100}%"></i><span style="left:${pr * 100}%">${ic('plane')}</span></div><b>${esc(FLIGHTS[0] ? FLIGHTS[0].to.code : '')}</b></div>`;
    } else if (ph === 'after') big = `<h3>旅程</h3><div class="big" style="font-size:24px">平安回家，辛苦了</div>`;
    else {
      const i = Math.max(TRIP.days.findIndex(d => d.date === n.date), 0);
      big = `<h3>旅行中</h3><div class="big">第 ${i + 1}<small>天／共 ${TRIP.days.length} 天</small></div>
        <div class="dots">${TRIP.days.map((d, k) => `<i class="${k < i ? 'p' : k === i ? 'n' : ''}"></i>`).join('<u></u>')}</div>`;
    }
    el.innerHTML = `<div class="date">${dateTxt}</div><div style="margin-top:12px">${big}</div>`;
  }
  function rHomeNext() {
    const el = $('#h-next'); if (!el) return;
    const n = tripNow(), ph = phase(n), keys = dayKeys();
    let key = keys.includes(n.key) && ph === 'during' ? n.key : keys[0], live = ph === 'during' && keys.includes(n.key);
    if (ph === 'after') { el.innerHTML = `<h3>下一站</h3><div class="next-t">旅程結束</div><p class="note">記帳和分帳還可以繼續看。</p>`; return; }
    let its = itemsOf(key, myGroup());
    let next = live ? its.find(it => it.m != null && it.m > n.mins) : its[0];
    if (live && !next) {                      // 今天排完了，看明天
      const k2 = keys[keys.indexOf(key) + 1];
      if (k2) { const a = itemsOf(k2, myGroup()); if (a[0]) next = Object.assign({ tomorrow: true }, a[0]); }
    }
    const d = dayInfo(key);
    const list = (live ? its.filter(it => it.m == null || it.m >= n.mins - 30) : its).filter(it => it.type !== '備註').slice(0, 5);
    el.innerHTML = `<h3>${live ? '下一站' : '第一站'} <span class="r">${esc(key)}（${dowOf(keyDate(key))}）</span></h3>` +
      (next ? `<div class="next-t">${esc(next.text)}</div><div class="mute" style="font-size:13px">${next.tomorrow ? '明天 ' : ''}${esc(next.time || '')}${next.place ? '・' + esc(next.place) : ''}</div>` : `<div class="next-t">今天的行程都走完了</div>`) +
      `<h3 style="margin-top:16px">${live ? '今日行程' : '當天行程'} <span class="r">${esc(d.title || '')}</span></h3>` +
      (list.length ? `<ul class="sum">${list.map(it => `<li><b>${esc(it.time || '—')}</b><span>${esc(it.text)}</span></li>`).join('')}</ul>` : `<p class="note">還沒有安排。</p>`) +
      `<button class="btn ghost sm" style="margin-top:12px" data-act="go" data-p="itin">看完整行程 ${ic('chev', 's')}</button>`;
  }
  function rHomeWx() {
    const el = $('#h-wx'); if (!el) return;
    let h = `<h3>天氣 <span class="r">${wx ? '更新 ' + stamp(wx.ts) : ''} <button data-act="wxReload" aria-label="重新整理">${ic('refresh', 's')}</button></span></h3>`;
    if (wxState === 'loading') h += `<div class="loading">${art('phin', 'sm')}<span>讀取中…</span></div>`;
    else if (wxState === 'err') h += `<p class="note">現在抓不到天氣（可能沒網路）。<button class="btn ghost sm" data-act="wxReload">再試一次</button></p>`;
    else {
      h += wx.cities.map(c => `<div class="wx-now">${ic(wxIcon(c.code), 'wxa wx-' + wxIcon(c.code))}<div class="grow"><div class="big" style="font-size:28px">${Math.round(c.t)}°<small>${esc(c.name)}・${wxText(c.code)}</small></div></div></div>`).join('');
      const days = TRIP.days.map(d => ({ d, w: wxFor(d.date) }));
      if (days.some(x => x.w)) {
        h += `<div class="wx-days">${days.map(x => x.w
          ? `<div><b>${x.d.key}</b>${ic(wxIcon(x.w.code))}<span class="num">${x.w.lo}–${x.w.hi}°</span><b>${x.w.rain == null ? '' : '雨 ' + x.w.rain + '%'}</b></div>`
          : `<div><b>${x.d.key}</b>${ic('clock')}<b>未提供</b></div>`).join('')}</div>`;
      } else {
        const s = new Date(FIRST + 'T12:00:00'); s.setDate(s.getDate() - 15);
        h += `<p class="note">旅行期間的每日預報，大約 ${s.getMonth() + 1}/${s.getDate()} 起會出現（預報只到 16 天內）。</p>`;
      }
      if (wxState === 'stale') h += `<p class="note acc">更新失敗，顯示的是舊資料。</p>`;
    }
    el.innerHTML = h + `<p class="note">資料來源：Open-Meteo</p>`;
  }
  let fxDir = 'toHome';
  function rHomeFx() {
    const el = $('#h-fx'); if (!el) return;
    const u = TRIP.cur.unit || 1, r = (fx && fx.rate) || 0;
    let h = `<h3>匯率 <span class="r">${fx ? '更新 ' + stamp(fx.ts) : ''} <button data-act="fxReload" aria-label="重新整理">${ic('refresh', 's')}</button></span></h3>`;
    if (fxState === 'loading') h += `<p class="note">讀取中…</p>`;
    else if (fxState === 'err') h += `<p class="note">現在抓不到匯率，先用備用值 1 ${TRIP.cur.sym} ≈ ${TRIP.defaultRate} 台幣。<button class="btn ghost sm" data-act="fxReload">再試一次</button></p>`;
    if (r) {
      h += `<div class="big" style="font-size:26px">${fmt(u)}<small>${TRIP.cur.sym} ≈ NT$</small>${(r * u).toFixed(2)}</div>
        <div class="mute" style="font-size:12px">1 ${TRIP.cur.name} = ${r.toFixed(5)} 台幣・NT$1 ≈ ${fmt(1 / r)} ${TRIP.cur.sym}</div>
        <div class="fx-row"><input class="inp" id="fxIn" inputmode="decimal" placeholder="${fxDir === 'toHome' ? '輸入越南盾' : '輸入台幣'}">
          <button data-act="fxSwap" aria-label="換方向">${ic('swap')}</button><div class="grow num" id="fxOut" style="font-size:18px;text-align:right">—</div></div>
        <button class="btn ghost sm" style="margin-top:12px" data-act="fxApply">套用到記帳匯率</button>
        ${D && D.rate > 0 ? `<span class="mute" style="font-size:12px;margin-left:8px">目前記帳用 ${D.rate.toFixed(5)}</span>` : ''}`;
      if (fxState === 'stale') h += `<p class="note acc">更新失敗，顯示的是舊資料。</p>`;
    }
    el.innerHTML = h + `<p class="note">資料來源：open.er-api.com。這是市場匯率，跟銀行、金飾店的換匯價會差一點。</p>`;
  }
  function fxCalc() {
    const i = $('#fxIn'), o = $('#fxOut'); if (!i || !o) return;
    const v = parseFloat(i.value.replace(/,/g, '')), r = (fx && fx.rate) || TRIP.defaultRate;
    o.textContent = !(v > 0) ? '—' : fxDir === 'toHome' ? 'NT$ ' + fmt(v * r) : fmt(v / r) + ' ' + TRIP.cur.sym;
  }
  function listOf(kind) {
    const base = kind === 'todo' ? TODO : BUY, del = D[kind + 'Del'], add = D[kind + 'Add'], chk = D[kind + 'Chk'];
    const items = base.filter(x => !del.includes(x.id)).concat(add);
    return { items, done: items.filter(x => chk[x.id]).length, chk };
  }
  function rHomeProg() {
    const el = $('#h-prog'); if (!el) return;
    const a = listOf('todo'), b = listOf('buy'), g = myGroup();
    const fl = FLIGHTS.filter(f => f.group === g);
    const bar = (t, x) => `<div class="row" style="margin-top:10px"><div class="grow">${t}</div><div class="num mute">${x.done}/${x.items.length}</div></div><div class="bar"><i style="width:${x.items.length ? x.done / x.items.length * 100 : 0}%"></i></div>`;
    el.innerHTML = `<h3>出發前進度</h3>${bar('待辦', a)}${bar('待買', b)}
      <div class="row" style="margin-top:14px">${ic('plane')}<div class="grow">${D.flight && fl.length ? '我的航班 <span class="num">' + fl.map(f => f.no).join('／') + '</span>' : '還沒登記我搭哪班'}</div>
      <button class="btn ghost sm" data-act="go" data-p="flight">${D.flight ? '查看' : '去登記'}</button></div>`;
  }
  function myLedger() {
    const out = D.exp.map(e => Object.assign({ kind: 'me' }, e));
    splits.forEach(s => { const v = s.shares && s.shares[user.name]; if (v > 0) out.push({ kind: 'split', id: s.id, date: s.date, twd: v, cat: s.cat, note: s.note, payer: s.payer }); });
    return out.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.ts || 0) - (a.ts || 0));
  }
  function rHomeSpend() {
    const el = $('#h-spend'); if (!el || !D) return;
    const led = myLedger(), t = todayStr();
    const sum = a => a.reduce((s, e) => s + (e.twd || 0), 0);
    const today = sum(led.filter(e => e.date === t)), all = sum(led);
    el.innerHTML = `<h3>我的花費 <span class="r">台幣</span></h3>
      <div class="row"><div class="grow"><div class="mute" style="font-size:12px">今天</div><div class="big" style="font-size:24px"><span class="cu" data-to="${Math.round(today)}">${fmt(today)}</span></div></div>
      <div class="grow"><div class="mute" style="font-size:12px">全部</div><div class="big" style="font-size:24px"><span class="cu" data-to="${Math.round(all)}">${fmt(all)}</span></div></div></div>` +
      (D.budget > 0 ? `<div class="row" style="margin-top:10px"><div class="grow mute" style="font-size:12px">預算 NT$ ${fmt(D.budget)}</div><div class="num mute">${Math.round(all / D.budget * 100)}%</div></div><div class="bar"><i style="width:${Math.min(all / D.budget * 100, 100)}%"></i></div>`
        : `<p class="note">到「記帳 → 我的帳」可以設定預算。</p>`);
  }

  /* ================= 航班 ================= */
  let justReg = false;
  function rFlight() {
    const g = myGroup();
    let h = head('FLIGHT-' + (FLIGHTS[0] ? FLIGHTS[0].no : ''), 'Chuyến bay', '航班', 'plane');
    GROUPS.forEach(gr => {
      const fl = FLIGHTS.filter(f => f.group === gr.id); if (!fl.length) return;
      if (GROUPS.length > 1) h += `<div class="lbl" style="margin:18px 20px 0">${esc(gr.name)}</div>`;
      fl.forEach((f, fi) => {
        h += `<article class="ticket" style="animation-delay:${fi * .12}s">${D.flight === gr.id ? `<span class="tk-stamp ${justReg ? 'hit' : ''}">ĐÃ ĐĂNG KÝ</span>` : ''}<div class="tk-top">
          <div class="tk-dir"><span>${esc(f.dir)}・${esc(f.airline)}</span><span class="route-txt">${esc(f.from.city)} → ${esc(f.to.city)}</span></div>
          <div class="tk-route"><div><div class="code">${esc(f.from.code)}</div><div class="time">${esc(f.from.time)}</div><div class="city">${esc(f.from.city)} ${esc(f.from.term)}</div></div>
            <div class="tk-mid">${ic('plane')}<span>${esc(f.dur)}</span></div>
            <div style="text-align:right"><div class="code">${esc(f.to.code)}</div><div class="time">${esc(f.to.time)}</div><div class="city">${esc(f.to.city)} ${esc(f.to.term)}</div></div></div></div>
          <div class="tk-tear"></div>
          <div class="tk-bot"><div><b>DATE</b>${f.date.slice(5).replace('-', '/')}（${esc(f.dow)}）</div><div><b>FLIGHT</b><span class="num">${esc(f.no)}</span></div><div><b>FROM</b>${esc(f.from.term)}</div><div><b>TO</b>${esc(f.to.term)}</div></div>
          ${f.transfer ? `<div class="tk-note">轉機：${esc(f.transfer)}</div>` : ''}${f.note ? `<div class="tk-note">${esc(f.note)}</div>` : ''}</article>`;
      });
      h += `<div style="margin:0 16px"><button class="btn ${D.flight === gr.id ? 'ghost' : ''}" data-act="regFlight" data-g="${gr.id}">${D.flight === gr.id ? ic('check', 's') + ' 已登記：我搭這組航班' : '登記：我搭這組航班'}</button></div>`;
    });
    h += `<p class="note" style="margin:16px 20px">起降時間都是當地時間。越南比台灣慢 1 小時。${g ? '' : '登記之後，主頁和「回住宿」會用你的組別來判斷。'}</p>`;
    $('#p-flight').innerHTML = h; justReg = false;
  }

  /* ================= 行程 ================= */
  const MASCOT = scooter('mascot');
  function rItin() {
    const keys = dayKeys(); if (!keys.includes(curDay)) curDay = keys[0];
    const n = tripNow();
    $('#p-itin').innerHTML = head('ROUTE-SGN', 'Lịch trình', '行程', 'cityhall') +
      `<div class="axis-wrap">${MASCOT}<div class="axis">${keys.map(k =>
        `<button data-act="day" data-k="${k}" class="${k === curDay ? 'on' : ''} ${k === n.key ? 'today' : ''}"><b>${k}</b>${dowOf(keyDate(k))}</button>`).join('')}</div></div>` +
      (GROUPS.length > 1 ? `<div class="groups">${GROUPS.map(g => `<button data-act="grp" data-g="${g.id}" class="${g.id === curGroup ? 'on' : ''}">${esc(g.name)}</button>`).join('')}</div>` : '') +
      `<div id="it-day"></div><div class="swipe-hint">← 左右滑動切換日期 →</div>`;
    rDay(true); moveMascot(true);
  }
  function rDay(anim) {
    const el = $('#it-day'); if (!el) return;
    const d = dayInfo(curDay), date = keyDate(curDay), its = itemsOf(curDay, GROUPS.length > 1 ? curGroup : ''), n = tripNow();
    const live = n.key === curDay && n.date === date, w = wxFor(date), ht = hotelFor(curDay);
    let nowI = -1, nextI = -1;
    if (live) its.forEach((it, i) => { if (it.m == null) return; if (it.m <= n.mins) nowI = i; else if (nextI < 0) nextI = i; });
    let h = `<div class="card day">${art(dayArt(curDay, d.title), 'day-art' + (anim ? ' draw' : ''))}${live ? '<div class="live">TODAY・旅行當天模式</div>' : ''}
      <button class="share" data-act="share" aria-label="分享這一天">${ic('share')}</button>
      <h2>${esc(d.title || curDay)}</h2><div class="meta">
      <span>${ic('bed', 's')}${esc(d.hotel || (ht && ht.name) || '住宿未定')}</span>
      ${d.pax ? `<span>${ic('people', 's')}${esc(d.pax)} 人</span>` : ''}
      <span>${w ? ic(wxIcon(w.code), 's') + `${w.lo}–${w.hi}°${w.rain == null ? '' : '・雨 ' + w.rain + '%'}` : ic('cloud', 's') + '天氣 16 天內才有預報'}</span></div></div>`;
    if (!its.length) h += `<div class="empty">${art('pho', 'md')}這一天還沒有行程。<br>主辦人在試算表的「行程」分頁新增就會出現。</div>`;
    else {
      h += `<div class="tl ${anim ? 'in' : ''}">` + its.map((it, i) => {
        const cls = ['ti', 'type-' + esc(it.type)]; if (live && nowI >= 0 && i < nowI) cls.push('past'); if (i === nowI) cls.push('now'); if (i === nextI) cls.push('next');
        const tags = [];
        const tIcon = it.type === '餐廳' ? 'food' : it.type === '交通' ? (it.trans === '飛機' ? 'plane' : 'car') : it.type === '備註' ? 'note' : 'sight';
        if (i === nowI) tags.push(`<span class="tag meet">進行中</span>`);
        if (i === nextI) tags.push(`<span class="tag a">下一個${it.m != null ? '・' + hm(it.m - n.mins) + '後' : ''}</span>`);
        if (/集合|會合/.test(it.text)) tags.push(`<span class="tag meet">${ic('flag', 's')}集合</span>`);
        tags.push(`<span class="tag">${ic(tIcon, 's')}${esc(it.type || '景點')}</span>`);
        if (it.trans) tags.push(`<span class="tag">${esc(it.trans)}</span>`);
        if (it.pax) tags.push(`<span class="tag">${ic('people', 's')}${esc(it.pax)} 人</span>`);
        if (it.group && GROUPS.length > 1) tags.push(`<span class="tag">${esc(it.group)} 組</span>`);
        if (it.tbd) tags.push(`<span class="tag o">待定</span>`);
        if (it.close) {
          if (live && it.cm != null && i >= nowI && (i === nowI || i === nextI || it.cm - n.mins <= 180)) {   // 當下、下一個、或 3 小時內關門才倒數
            const left = it.cm - n.mins;
            tags.push(left <= 0 ? `<span class="tag hot">已關門 ${esc(it.close)}</span>` : `<span class="tag ${left <= 45 ? 'hot' : 'a'}">${ic('clock', 's')}距關門 ${hm(left)}</span>`);
          } else tags.push(`<span class="tag">${ic('clock', 's')}${esc(it.close)} 關門</span>`);
        }
        const title = it.place ? `<a class="map" href="${mapUrl(it.place, live)}" target="_blank" rel="noopener">${esc(it.text)} ${ic('pin', 's')}</a>` : esc(it.text);
        return `<div class="${cls.join(' ')}" style="animation-delay:${Math.min(i, 12) * 45}ms"><div class="ti-time">${esc(it.time || '')}</div><div class="ti-dot"></div>
          <div class="ti-tt">${title}</div><div class="ti-tags">${tags.join('')}</div>${it.note ? `<div class="ti-note">${esc(it.note)}</div>` : ''}</div>`;
      }).join('') + `</div>`;
      if (live) h += `<p class="note" style="margin:10px 20px 0">旅行當天：點景點會直接開 Google 地圖導航。</p>`;
    }
    el.innerHTML = h;
    $$('#p-itin .axis button').forEach(b => b.classList.toggle('on', b.dataset.k === curDay));
  }
  function moveMascot(instant) {
    const m = $('#mascot'), b = $('#p-itin .axis button.on'); if (!m || !b || !b.offsetWidth) return;
    if (instant) m.style.transition = 'none';
    m.style.transform = `translateX(${b.offsetLeft + b.offsetWidth / 2}px)`;
    if (instant) { void m.offsetWidth; m.style.transition = ''; }
    else { m.classList.remove('go'); void m.offsetWidth; m.classList.add('go'); }
  }
  function setDay(k, dir) {
    if (k === curDay) return;
    const keys = dayKeys(); if (dir == null) dir = keys.indexOf(k) > keys.indexOf(curDay) ? 1 : -1;
    curDay = k; swoosh(dir); rDay(true); moveMascot(false);
    try { history.replaceState(null, '', location.pathname + location.search + '#d=' + k); } catch (e) { /* noop */ }
  }
  function swoosh(dir) {
    if (reduced) return;
    const s = $('#swoosh'), t = THEMES.find(x => x.id === theme) || THEMES[0];
    s.classList.remove('on'); void s.offsetWidth;
    s.classList.toggle('rev', dir < 0); $('b', s).textContent = t.sfx; s.classList.add('on');
    clearTimeout(swoosh.t); swoosh.t = setTimeout(() => s.classList.remove('on'), 520);
  }
  async function shareDay() {
    const url = location.origin + location.pathname + '#d=' + curDay, d = dayInfo(curDay);
    const text = `${TRIP.title}｜${curDay}（${dowOf(keyDate(curDay))}）${d.title || ''}`;
    try {
      if (navigator.share) await navigator.share({ title: TRIP.title, text, url });
      else { await navigator.clipboard.writeText(text + '\n' + url); toast('已複製這一天的連結，貼到 LINE 就可以了'); }
    } catch (e) { if (e && e.name !== 'AbortError') toast('分享失敗，請長按網址複製'); }
  }

  /* ================= 準備 ================= */
  const lanterns = t => `<div class="lanterns">${Array.from(t).map(c => `<span>${esc(c)}</span>`).join('')}</div>`;
  function listHtml(kind) {
    const L = listOf(kind);
    return `<p class="count">完成 ${L.done}/${L.items.length}</p><ul class="list" data-kind="${kind}">` +
      L.items.map(x => `<li class="${L.chk[x.id] ? 'done' : ''}" data-id="${esc(x.id)}">
        <button class="ck" data-act="chk" aria-label="打勾">${ic('check')}</button><div class="tx" data-act="chk">${esc(x.text)}</div>
        <span class="stamp">${esc(TRIP.doneStamp)}</span><button class="del" data-act="delItem" aria-label="刪除">${ic('x', 's')}</button></li>`).join('') +
      `</ul><form class="adder" data-kind="${kind}"><input class="inp" maxlength="60" placeholder="${kind === 'todo' ? '新增待辦，按 Enter' : '新增想買的東西，按 Enter'}" enterkeyhint="done"><button type="submit" aria-label="新增">${ic('plus')}</button></form>`;
  }
  function rPrep() {
    let h = head('PREP-LIST', 'Chuẩn bị', '準備', 'suitcase') + lanterns('出發前待辦') + listHtml('todo') + lanterns('待買清單') + listHtml('buy');
    h += lanterns('住宿') + `<div style="margin:14px 16px 0"><button class="btn ghost" data-act="driver">${ic('car', 's')} 給司機看：越南文地址大字版</button></div>`;
    if (!HOTELS.length) h += `<div class="card hotel">${art('palm', 'corner')}<h4>住宿尚未安排</h4><p class="mute">訂好之後，主辦人把飯店名稱、越南文地址、電話、入住退房時間填進 data.js 的 HOTELS，這裡和「回住宿」「給司機看」就會出現。</p></div>`;
    HOTELS.forEach(x => {
      h += `<div class="card hotel"><h4>${esc(x.name)}</h4>${x.nameLocal ? `<p class="mute">${esc(x.nameLocal)}</p>` : ''}
        ${x.nights ? `<p>${ic('bed', 's')}<span>${x.nights.map(esc).join('、')} 晚</span></p>` : ''}
        ${x.addrLocal ? `<p>${ic('pin', 's')}<a href="${mapUrl(x.addrLocal)}" target="_blank" rel="noopener">${esc(x.addrLocal)}</a></p>` : ''}
        ${x.tel ? `<p>${ic('phone', 's')}<a href="tel:${esc(String(x.tel).replace(/[^\d+]/g, ''))}">${esc(x.tel)}</a></p>` : ''}
        ${x.checkin || x.checkout ? `<p>${ic('clock', 's')}<span>入住 ${esc(x.checkin || '—')}・退房 ${esc(x.checkout || '—')}</span></p>` : ''}
        ${x.station ? `<p>${ic('route', 's')}<span>${esc(x.station)}</span></p>` : ''}</div>`;
    });
    $('#p-prep').innerHTML = h;
  }

  /* ================= 記帳 ================= */
  function rWallet() {
    let h = head('WALLET-VND', 'Chi tiêu', '記帳', 'coins') + `<div class="seg">${[['add', '記一筆'], ['mine', '我的帳'], ['group', '團體分帳']].map(x =>
      `<button data-act="wtab" data-t="${x[0]}" class="${walletTab === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div><div id="w-body"></div>`;
    $('#p-wallet').innerHTML = h;
    walletTab === 'add' ? rAdd() : walletTab === 'mine' ? rMine() : rGroup();
  }
  function rAdd() {
    const ms = allMembers(); if (!F.payer || !ms.includes(F.payer)) F.payer = user.name;
    if (!F.whoSet || !F.who) F.who = ms.slice(); else F.who = F.who.filter(x => ms.includes(x));   // 沒動過就預設全員（含剛加入的人）
    const sym = F.cur === 'VND' ? TRIP.cur.sym : 'NT$';
    let h = `<div class="card"><div class="row"><div class="seg sm">${[['me', '個人'], ['split', '分帳']].map(x => `<button data-act="fMode" data-v="${x[0]}" class="${F.mode === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div>
      <div class="grow"></div><div class="seg sm">${[['VND', TRIP.cur.name], ['TWD', '台幣']].map(x => `<button data-act="fCur" data-v="${x[0]}" class="${F.cur === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div></div>
      <div class="amt" style="margin-top:16px"><span class="sym">${sym}</span><input id="fAmt" inputmode="numeric" pattern="[0-9]*" placeholder="0" value="${esc(F.amt)}" autocomplete="off"><span class="eq" id="fEq"></span></div>
      <div class="chips">${QUICK[F.cur].map(v => `<button data-act="fQuick" data-v="${v}">${F.cur === 'VND' ? fmt(v / 1000) + 'k' : fmt(v)}</button>`).join('')}${F.cur === 'VND' ? '<button data-act="fZeros">＋000</button>' : ''}</div>
      <div class="lbl">分類</div><div class="chips line">${CATS.map(c => `<button data-act="fCat" data-v="${esc(c)}" class="${F.cat === c ? 'on' : ''}">${esc(c)}</button>`).join('')}</div>
      <div class="lbl">說明（可不填）</div><input class="inp" id="fNote" maxlength="40" style="margin-top:8px;padding:10px 12px" value="${esc(F.note)}" placeholder="例如：河粉、Grab 去市場">`;
    if (F.mode === 'split') {
      h += `<div class="lbl">誰先付的</div><div class="chips line">${ms.map(m => `<button data-act="fPayer" data-v="${esc(m)}" class="${F.payer === m ? 'on' : ''}">${esc(m)}</button>`).join('')}</div>
        <div class="row" style="margin-top:16px"><div class="lbl" style="margin:0">分給誰</div><div class="grow"></div><div class="seg sm">${[['even', '均分'], ['custom', '自訂金額']].map(x => `<button data-act="fSplit" data-v="${x[0]}" class="${F.split === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div></div>
        <div class="chips line">${ms.map(m => `<button data-act="fWho" data-v="${esc(m)}" class="${F.who.includes(m) ? 'on' : ''}">${esc(m)}</button>`).join('')}</div>`;
      if (F.split === 'custom') h += F.who.map(m => `<div class="who"><div class="grow">${esc(m)}</div><span class="mute">${sym}</span><input class="inp fCus" data-m="${esc(m)}" inputmode="numeric" pattern="[0-9]*" value="${esc(F.custom[m] || '')}" placeholder="0"></div>`).join('') + `<p class="note" id="fRemain"></p>`;
      if (ms.length < 2) h += `<p class="note">目前只有你一個成員。其他人登入後就會出現在這裡。</p>`;
    }
    h += `<button class="btn" style="margin-top:20px" data-act="fSave">記下來</button>
      <p class="note">記帳匯率：1 ${TRIP.cur.sym} = ${rate().toFixed(5)} 台幣${D.rate > 0 ? '（自訂）' : ''}</p></div>`;
    $('#w-body').innerHTML = h; fEq();
  }
  const numOf = s => parseFloat(String(s || '').replace(/[^\d.]/g, '')) || 0;
  function fEq() {
    const eq = $('#fEq'); if (!eq) return; const v = numOf(F.amt);
    eq.textContent = !v ? '' : F.cur === 'VND' ? '≈ NT$ ' + fmt(v * rate()) : '≈ ' + fmt(v / rate()) + ' ' + TRIP.cur.sym;
    const rm = $('#fRemain'); if (rm) { const s = F.who.reduce((a, m) => a + numOf(F.custom[m]), 0), left = v - s; rm.textContent = left === 0 ? '金額剛好分完。' : left > 0 ? `還有 ${fmt(left)} 沒分配。` : `多分了 ${fmt(-left)}。`; rm.classList.toggle('acc', left !== 0); }
  }
  function fSave() {
    const sb = $('[data-act=fSave]'), rc = sb ? sb.getBoundingClientRect() : null;
    const amt = numOf(F.amt); if (!(amt > 0)) { toast('請先輸入金額'); const i = $('#fAmt'); if (i) i.focus(); return; }
    const note = (F.note || '').trim(); if (badText(note)) return;
    const twd = Math.round(toTwd(amt, F.cur) * 100) / 100, date = todayStr();
    LS.set('ft_lastcat', F.cat);
    if (F.mode === 'me') {
      D.exp.push({ id: uid(), ts: Date.now(), date, amt, cur: F.cur, twd, cat: F.cat, note }); saveD();
    } else {
      if (!F.who.length) { toast('請選擇要分給誰'); return; }
      const shares = {};
      if (F.split === 'even') F.who.forEach(m => { shares[m] = Math.round(twd / F.who.length * 100) / 100; });
      else {
        const s = F.who.reduce((a, m) => a + numOf(F.custom[m]), 0);
        if (Math.abs(s - amt) > 0.5) { toast('自訂金額加起來要等於總金額'); return; }
        F.who.forEach(m => { const v = numOf(F.custom[m]); if (v > 0) shares[m] = Math.round(toTwd(v, F.cur) * 100) / 100; });
      }
      const rec = { id: uid(), ts: Date.now(), by: user.name, date, payer: F.payer, amount: amt, cur: F.cur, rate: rate(), twd, cat: F.cat, note, shares };
      splits.push(Object.assign({ pending: HAS_API }, rec)); LS.set('ft_splits', splits);
      if (HAS_API) { splitQ.push({ op: 'add', rec }); LS.set('ft_splitq', splitQ); flushQ().then(loadSplits); }
    }
    F.amt = ''; F.note = ''; F.custom = {}; F.whoSet = false;
    toast(F.mode === 'me' ? '記下來了' : (navigator.onLine || !HAS_API ? '分帳記下來了' : '離線中：已先存手機，上線後自動上傳'));
    rAdd(); rHomeSpend(); coinFly(rc);
  }
  function rMine() {
    const led = myLedger(), sum = led.reduce((s, e) => s + (e.twd || 0), 0);
    const byCat = {}; led.forEach(e => { byCat[e.cat || '其他'] = (byCat[e.cat || '其他'] || 0) + e.twd; });
    const cats = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]);
    let h = `<div class="card"><h3>總花費 <span class="r">台幣・含我分到的份額</span></h3><div class="big"><span class="cu" data-to="${Math.round(sum)}">${fmt(sum)}</span></div>` +
      (D.budget > 0 ? `<div class="row" style="margin-top:10px"><div class="grow mute" style="font-size:12px">預算 NT$ ${fmt(D.budget)}・剩 ${fmt(D.budget - sum)}</div><div class="num mute">${Math.round(sum / D.budget * 100)}%</div></div><div class="bar"><i style="width:${Math.min(sum / D.budget * 100, 100)}%"></i></div>` : '') +
      `<div class="who"><div class="grow mute">我的預算（台幣）</div><input class="inp" id="mBudget" inputmode="numeric" pattern="[0-9]*" value="${D.budget || ''}" placeholder="不設定"></div>
       <div class="who"><div class="grow mute">自訂匯率（1 ${TRIP.cur.sym} = ? 台幣）</div><input class="inp" id="mRate" inputmode="decimal" value="${D.rate || ''}" placeholder="${((fx && fx.rate) || TRIP.defaultRate).toFixed(5)}"></div>
       <p class="note">匯率留空＝用主頁抓到的市場匯率。改匯率只影響之後記的帳。</p></div>`;
    if (cats.length) h += `<div class="card"><h3>分類統計</h3>${cats.map(c => `<div class="row" style="margin-top:8px"><div class="grow">${esc(c)}</div><div class="num">${fmt(byCat[c])}</div></div><div class="bar"><i style="width:${sum ? byCat[c] / sum * 100 : 0}%"></i></div>`).join('')}</div>`;
    h += `<div class="card"><h3>明細 <span class="r"><button data-act="export">${ic('download', 's')} 匯出備份</button></span></h3>`;
    if (!led.length) h += `<div class="empty" style="padding:8px 0 4px">${art('pho', 'md')}還沒有任何紀錄。<br>到「記一筆」開始記帳。</div>`;
    let cur = null;
    led.forEach(e => {
      if (e.date !== cur) {
        if (cur !== null) h += `</ul>`;
        cur = e.date; const day = led.filter(x => x.date === cur).reduce((s, x) => s + x.twd, 0);
        h += `<div class="dayhd"><span>${esc(cur ? dateKey(cur) + '（' + dowOf(cur) + '）' : '')}</span><span class="num">小計 ${fmt(day)}</span></div><ul class="led">`;
      }
      h += `<li><span class="c">${esc(e.cat || '')}</span><span class="n">${esc(e.note || (e.kind === 'split' ? '分帳' : e.cat || ''))}${e.kind === 'split' ? `<small>分帳・${esc(e.payer)}付</small>` : e.cur === 'VND' ? `<small>${fmt(e.amt)} ${TRIP.cur.sym}</small>` : ''}</span>
        <span class="v">${fmt(e.twd)}</span>${e.kind === 'me' ? `<button class="x" data-act="delExp" data-id="${esc(e.id)}" aria-label="刪除">${ic('x', 's')}</button>` : '<span class="x"></span>'}</li>`;
    });
    if (cur !== null) h += `</ul>`;
    h += `</div>`;
    $('#w-body').innerHTML = h;
    if (rMine.fresh) { countUp($('#w-body')); rMine.fresh = false; }
  }
  function rGroup() {
    const ms = allMembers(), paid = {}, owe = {}; ms.forEach(m => { paid[m] = 0; owe[m] = 0; });
    splits.forEach(s => {
      paid[s.payer] = (paid[s.payer] || 0) + s.twd;
      Object.keys(s.shares || {}).forEach(m => { owe[m] = (owe[m] || 0) + s.shares[m]; });
    });
    const names = Object.keys(paid), net = {}; names.forEach(m => { net[m] = paid[m] - (owe[m] || 0); });
    const plan = settle(net);
    let h = '';
    if (!HAS_API) h += `<p class="note" style="margin:12px 20px 0">單機模式：分帳只存在這支手機。接上試算表後，全團才會同步。</p>`;
    else if (!navigator.onLine) h += `<p class="note" style="margin:12px 20px 0">離線中，顯示的是上次的分帳紀錄。</p>`;
    h += `<div class="card"><h3>結算建議 <span class="r">最少轉帳次數</span></h3>` +
      (plan.length ? `<ul class="settle">${plan.map(p => `<li><b>${esc(p.from)}</b>${ic('chev', 's')}<b>${esc(p.to)}</b><span class="v">NT$ ${fmt(p.amt)}</span></li>`).join('')}</ul>` : `<p class="note">目前沒有人需要轉帳。</p>`) + `</div>`;
    h += `<div class="card"><h3>每人墊付與應分攤 <span class="r">台幣</span></h3><ul class="led">${names.map(m => `<li><span class="n">${esc(m)}</span><span class="v mute">墊 ${fmt(paid[m])}</span><span class="v mute">攤 ${fmt(owe[m] || 0)}</span><span class="v" style="width:70px;text-align:right">${net[m] >= 0 ? '+' : ''}${fmt(net[m])}</span></li>`).join('')}</ul></div>`;
    h += `<div class="card"><h3>分帳紀錄 <span class="r">${splits.length} 筆</span></h3>`;
    if (!splits.length) h += `<p class="note">還沒有分帳。到「記一筆」切到「分帳」就能新增。</p>`;
    else h += `<ul class="led">${splits.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)).map(s => `<li><span class="c">${esc(s.date ? dateKey(s.date) : '')}</span>
      <span class="n">${esc(s.note || s.cat)}<small>${esc(s.payer)}付・${Object.keys(s.shares || {}).length} 人分${s.pending ? '・待上傳' : ''}</small></span>
      <span class="v">${fmt(s.twd)}</span>${(s.by === user.name || s.payer === user.name) ? `<button class="x" data-act="delSplit" data-id="${esc(s.id)}" aria-label="刪除">${ic('x', 's')}</button>` : '<span class="x"></span>'}</li>`).join('')}</ul>`;
    h += `</div>`;
    $('#w-body').innerHTML = h;
  }
  function exportCsv() {
    const led = myLedger(), q = s => '"' + String(s == null ? '' : s).replace(/"/g, '""').replace(/^([=+\-@])/, "'$1") + '"';
    const rows = [['日期', '種類', '分類', '說明', '原幣金額', '幣別', '台幣'].map(q).join(',')]
      .concat(led.map(e => [e.date, e.kind === 'split' ? '分帳' : '個人', e.cat, e.note, e.amt || '', e.cur || '', Math.round(e.twd)].map(q).join(',')));
    const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `記帳備份_${user.name}_${todayStr()}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ================= 工具箱（彈出面板） ================= */
  function openSheet(title, html) { $('#shTitle').textContent = title; $('#shBody').innerHTML = html; $('#sheet').classList.add('on'); $('#sheet').scrollTop = 0; document.body.style.overflow = 'hidden'; }
  function closeSheet() { $('#sheet').classList.remove('on'); document.body.style.overflow = ''; }
  function toHotel() {
    const x = tonightHotel();
    if (!x || !x.addrLocal) { toast('今晚的住宿還沒填地址（主辦人填 data.js 的 HOTELS）', 3600); return; }
    window.open(mapUrl(x.addrLocal, true), '_blank', 'noopener');
  }
  function driver() {
    const x = tonightHotel();
    openSheet('給司機看', x && x.addrLocal
      ? `<div class="driver"><div class="sh-art">${scooter('', 'big')}</div><p class="mute">Làm ơn đưa tôi đến địa chỉ này（請帶我去這個地址）</p><div class="ad">${esc(x.nameLocal || x.name)}<br>${esc(x.addrLocal)}</div>
          ${x.tel ? `<p class="note">飯店電話 <a href="tel:${esc(String(x.tel).replace(/[^\d+]/g, ''))}">${esc(x.tel)}</a></p>` : ''}<p class="note">把手機直接拿給司機看。</p></div>`
      : `<div class="driver"><div class="sh-art">${scooter('', 'big')}</div><div class="ad" style="font-size:20px">住宿尚未安排</div><p class="note">訂好住宿後，主辦人把越南文地址填進 data.js 的 HOTELS，這裡就會用大字顯示今晚住宿的地址。</p></div>`);
  }
  function phrases() {
    const cats = []; PHRASES.forEach(p => { if (!cats.includes(p.cat)) cats.push(p.cat); });
    openSheet('越南語會話卡', `<div class="sh-art">${art('pho', 'draw')}</div><p class="note" style="margin:0 20px">點一句會放大成白底大字，直接拿給店員看。</p>` + cats.map(c => `<div class="ph-cat">${esc(c)}</div><ul class="ph-list">` +
      PHRASES.map((p, i) => p.cat === c ? `<li data-act="zoom" data-i="${i}"><div class="zh">${esc(p.zh)}<span class="lo">${esc(p.lo)}</span></div>${ic('chev', 's')}</li>` : '').join('') + `</ul>`).join(''));
  }
  let wake = null;
  async function zoom(i) {
    const p = PHRASES[i]; if (!p) return;
    $('#zmLo').textContent = p.lo; $('#zmZh').textContent = p.zh; $('#zoom').classList.add('on');
    try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; }
  }
  function closeZoom() { $('#zoom').classList.remove('on'); if (wake) { wake.release().catch(() => { }); wake = null; } }
  function sos() {
    const pv = LS.get('ft_private', { ins: '', card: '' });
    const tel = s => String(s).replace(/[^\d+]/g, '');
    openSheet('緊急求助', `<ul class="sos">${SOS.map(s => `<li><div class="t">${esc(s.name)}<small>${esc(s.note || '')}</small></div><a class="call" href="tel:${esc(tel(s.tel))}">${esc(s.show || s.tel)}</a></li>`).join('')}</ul>
      <div class="card"><h3>${esc(SOS_OFFICE.name)}</h3><p style="margin:0;font-size:14px"><a href="${mapUrl(SOS_OFFICE.addr)}" target="_blank" rel="noopener">${esc(SOS_OFFICE.addr)}</a></p></div>
      <div class="card"><h3>我的電話 <span class="r">${ic('lock', 's')} 只存在這支手機</span></h3>
        <div class="field" style="margin-top:0"><label>保險公司海外急難救助電話</label><div class="row"><input class="inp pv" data-k="ins" inputmode="tel" value="${esc(pv.ins)}" placeholder="+886…">${pv.ins ? `<a class="btn sm" href="tel:${esc(tel(pv.ins))}">撥打</a>` : ''}</div></div>
        <div class="field"><label>信用卡掛失電話</label><div class="row"><input class="inp pv" data-k="card" inputmode="tel" value="${esc(pv.card)}" placeholder="+886…">${pv.card ? `<a class="btn sm" href="tel:${esc(tel(pv.card))}">撥打</a>` : ''}</div></div>
        <p class="note">這兩格不會上傳，也不會同步到其他手機。</p></div>`);
  }
  function tips() {
    openSheet('旅遊須知', `<div class="sh-art">${art('suitcase', 'draw')}</div><div class="tips">${TIPS.map((t, i) => `<details ${i === 0 ? 'open' : ''}><summary>${esc(t.t)}</summary><p>${esc(t.d)}</p></details>`).join('')}</div>
      <p class="note" style="margin:16px 20px">規定可能變動，出發前請再看一次官方公告。查證日期 ${APP_DATE}。</p>`);
  }

  /* ================= 事件 ================= */
  function toggleItem(li) {
    const kind = li.parentNode.dataset.kind, id = li.dataset.id, chk = D[kind + 'Chk'];
    if (chk[id]) delete chk[id]; else chk[id] = 1;
    saveD();
    li.classList.toggle('done', !!chk[id]);
    if (chk[id] && !reduced) { li.classList.remove('stamping'); void li.offsetWidth; li.classList.add('stamping'); }
    const L = listOf(kind), c = li.parentNode.previousElementSibling; if (c) c.textContent = `完成 ${L.done}/${L.items.length}`;
    if (chk[id] && L.items.length && L.done === L.items.length) { celebrate(); toast(kind === 'todo' ? '待辦全部完成！Tuyệt vời!' : '東西都買齊了！Tuyệt vời!', 3200); }
    rHomeProg();
  }
  const ACT = {
    enter() { leaveCover(); if (user && (user.token || (user.local && !HAS_API))) start(); else showLogin(user && user.local ? '主辦人已接上試算表，請設定密碼重新登入（原本的資料會保留）' : ''); },
    go(el) { go(el.dataset.p); },
    theme(el) {
      const run = () => { applyTheme(el.dataset.id); $$('.themes button').forEach(b => b.classList.toggle('on', b.dataset.id === theme)); };
      if (document.startViewTransition && !reduced) document.startViewTransition(run); else run();     // 換風格時整頁柔和淡入
    },
    logout() { if (!confirm('要登出嗎？這支手機上的資料會保留，下次用同一組暱稱密碼登入就能繼續。')) return; LS.del('ft_user'); location.hash = ''; location.reload(); },
    toHotel, driver, phrases, sos, tips, closeSheet, closeZoom,
    zoom(el) { zoom(+el.dataset.i); },
    wxReload() { loadWx(true); }, fxReload() { loadFx(true); },
    fxSwap() { fxDir = fxDir === 'toHome' ? 'toLocal' : 'toHome'; const v = $('#fxIn') ? $('#fxIn').value : ''; rHomeFx(); if ($('#fxIn')) { $('#fxIn').value = v; fxCalc(); } },
    fxApply() { if (!fx) return; D.rate = +fx.rate.toFixed(6); saveD(); rHomeFx(); toast('已套用到記帳匯率'); if (walletTab !== 'group') rWallet(); },
    regFlight(el) { D.flight = D.flight === el.dataset.g ? '' : el.dataset.g; justReg = !!D.flight; saveD(); curGroup = myGroup() || GROUPS[0].id; rFlight(); rHomeProg(); rHomeNext(); toast(D.flight ? '已登記你的航班' : '已取消登記'); },
    day(el) { setDay(el.dataset.k); },
    grp(el) { curGroup = el.dataset.g; rItin(); },
    share() { shareDay(); },
    chk(el) { toggleItem(el.closest('li')); },
    delItem(el) {
      const li = el.closest('li'), kind = li.parentNode.dataset.kind, id = li.dataset.id;
      if (!confirm('要刪掉這一項嗎？')) return;
      const add = D[kind + 'Add'], i = add.findIndex(x => x.id === id);
      if (i >= 0) add.splice(i, 1); else D[kind + 'Del'].push(id);
      delete D[kind + 'Chk'][id]; saveD(); rPrep(); rHomeProg();
    },
    wtab(el) { walletTab = el.dataset.t; rMine.fresh = walletTab === 'mine'; rWallet(); if (walletTab === 'group') loadSplits(); },
    fMode(el) { F.mode = el.dataset.v; rAdd(); }, fCur(el) { F.cur = el.dataset.v; F.amt = ''; F.custom = {}; rAdd(); },
    fQuick(el) { F.amt = String(el.dataset.v); $('#fAmt').value = F.amt; fEq(); },
    fZeros() { if (numOf(F.amt)) { F.amt = String(numOf(F.amt) * 1000); $('#fAmt').value = F.amt; fEq(); } },
    fCat(el) { F.cat = el.dataset.v; $$('[data-act=fCat]').forEach(b => b.classList.toggle('on', b.dataset.v === F.cat)); },
    fPayer(el) { F.payer = el.dataset.v; $$('[data-act=fPayer]').forEach(b => b.classList.toggle('on', b.dataset.v === F.payer)); },
    fWho(el) { F.whoSet = true; const m = el.dataset.v, i = F.who.indexOf(m); if (i >= 0) F.who.splice(i, 1); else F.who.push(m); rAdd(); },
    fSplit(el) { F.split = el.dataset.v; rAdd(); },
    fSave,
    delExp(el) { if (!confirm('要刪掉這筆紀錄嗎？')) return; D.exp = D.exp.filter(e => e.id !== el.dataset.id); saveD(); rMine(); rHomeSpend(); },
    delSplit(el) {
      if (!confirm('要刪掉這筆分帳嗎？全團都會看不到這筆。')) return;
      const id = el.dataset.id; splits = splits.filter(s => s.id !== id); LS.set('ft_splits', splits);
      const qi = splitQ.findIndex(o => o.op === 'add' && o.rec.id === id);
      if (qi >= 0) splitQ.splice(qi, 1); else if (HAS_API) splitQ.push({ op: 'del', id });
      LS.set('ft_splitq', splitQ); flushQ(); rGroup(); rHomeSpend();
    },
    export: exportCsv
  };
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]'); if (!el) return;
    const fn = ACT[el.dataset.act]; if (fn) fn(el, ev);
  });
  document.addEventListener('submit', ev => {
    const f = ev.target;
    if (f.id === 'lgForm') { doLogin(ev); return; }
    if (f.classList.contains('adder')) {
      ev.preventDefault();
      const inp = $('input', f), text = inp.value.trim(), kind = f.dataset.kind;
      if (!text || badText(text)) return;
      D[kind + 'Add'].push({ id: 'u' + uid(), text }); saveD(); rPrep(); rHomeProg();
      const again = $(`.adder[data-kind="${kind}"] input`); if (again) again.focus();
    }
  });
  document.addEventListener('input', ev => {
    const t = ev.target;
    if (t.id === 'fAmt') { t.value = t.value.replace(/[^\d.]/g, ''); F.amt = t.value; fEq(); }
    else if (t.id === 'fNote') F.note = t.value;
    else if (t.classList.contains('fCus')) { t.value = t.value.replace(/[^\d.]/g, ''); F.custom[t.dataset.m] = t.value; fEq(); }
    else if (t.id === 'fxIn') fxCalc();
  });
  document.addEventListener('change', ev => {
    const t = ev.target;
    if (t.id === 'mBudget') { D.budget = Math.max(0, Math.round(numOf(t.value))); saveD(); rMine(); rHomeSpend(); }
    else if (t.id === 'mRate') { const v = parseFloat(t.value); D.rate = v > 0 && v < 100 ? v : 0; saveD(); rMine(); rHomeFx(); }
    else if (t.classList.contains('pv')) { const pv = LS.get('ft_private', { ins: '', card: '' }); pv[t.dataset.k] = t.value.trim(); LS.set('ft_private', pv); sos(); }
  });

  /* 左右滑動換天（要明顯橫向才算，不影響上下捲動） */
  let sx = 0, sy = 0, st = 0;
  const pi = $('#p-itin');
  pi.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  pi.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2.2 || Date.now() - st > 700) return;
    const keys = dayKeys(), i = keys.indexOf(curDay) + (dx < 0 ? 1 : -1);
    if (i >= 0 && i < keys.length) setDay(keys[i], dx < 0 ? 1 : -1);
  }, { passive: true });

  /* 網路狀態 */
  function net() {
    $('#offbar').classList.toggle('on', !navigator.onLine); document.body.classList.toggle('off', !navigator.onLine);
    if (navigator.onLine && started) { pushD(); loadSplits(); loadItin(); loadWx(); loadFx(); }
  }
  window.addEventListener('online', net); window.addEventListener('offline', net);
  window.addEventListener('resize', () => { if (page === 'itin') moveMascot(true); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && started) { rHomeHero(); rHomeNext(); if (page === 'itin') rDay(); loadItin(); } });
  setInterval(() => { if (!started || document.hidden) return; rHomeHero(); if (page === 'home') rHomeNext(); if (page === 'itin') rDay(); }, 60000);
  window.addEventListener('hashchange', () => {
    const h = /#d=([\d\/]+)/.exec(location.hash); if (!h || !started) return;
    const k = normKey(h[1]); if (dayKeys().includes(k)) { if (page !== 'itin') go('itin'); if (k !== curDay) setDay(k); }
  });

  /* Service Worker：離線可用；有新版時自動換上 */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const had = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.register('sw.js').catch(() => { });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } });
  }

  /* ================= 開始 ================= */
  applyTheme(theme);
  { const rd = $('#swoosh em'); if (rd) rd.innerHTML = scooter('', ''); const la = $('#lgArt'); if (la) la.innerHTML = art('lotus', 'draw'); }
  cover();
  net();
  if (user && user.local && HAS_API) { /* 之前是單機模式，現在接上試算表了：要重新登入 */ }
  else if (user && /#d=/.test(location.hash) && (user.token || user.local)) { $('#cover').remove(); sparkRun = false; start(); }   // 分享連結：直接看那一天
  if (SIM) console.log('[模擬時間]', SIM);
})();
