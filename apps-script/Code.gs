/**
 * 越南跨年之旅 — Google 試算表後端（Apps Script）  版本 1.0.0
 * 貼到：試算表 → 擴充功能 → Apps Script，把原本的內容全部換成這份
 * 部署：部署 → 新增部署作業 → 網頁應用程式 → 執行身分「我」、存取權「所有人」
 * ↓↓↓ 第 7 行：把引號裡的字改成你們的團體密碼（GitHub 上的版本不要放真的密碼）
 */
const GROUP_PASSWORD = '請改成你們的團體密碼';

const PLACEHOLDER = '請改成你們的' + '團體密碼';
const CHUNK = 45000;          // 個人資料每格最多字數
const MAX_FAIL = 8;           // 個人密碼最多錯幾次
const LOCK_MIN = 15;          // 鎖定幾分鐘
const BLANK_ROWS = 200;       // 行程分頁預留的空白列

const SH = {
  members: '成員', splits: '分帳紀錄', data: '個人資料',
  days: '每日', itin: '行程', backup: '行程備份'
};
const HEAD = {
  members: ['暱稱', 'salt', '密碼雜湊', '加入時間', '失敗次數', '鎖定到', '登入憑證'],
  splits: ['id', '建立時間', '記帳人', '日期', '付款人', '金額', '幣別', '匯率', '台幣金額', '分類', '說明', '分攤'],
  data: ['暱稱', '更新時間', '資料1', '資料2', '資料3', '資料4'],
  days: ['日期', '標題', '住宿', '人數'],
  itin: ['日期', '時間', '類型', '內容', '交通', '地點', '關門時間', '組別', '人數', '待定', '備註'],
  backup: ['備份時間', '原因', '日期', '時間', '類型', '內容', '交通', '地點', '關門時間', '組別', '人數', '待定', '備註']
};
const TYPES = ['景點', '餐廳', '交通', '備註'];
const TRANS = ['步行', 'Grab', '計程車', '包車', '地鐵', '公車', '船', '飛機'];
const ITIN_NOTE =
  '【填寫說明】一列一個項目，改完存檔，網頁重新整理就會更新。\n' +
  '日期：寫 12/31、1/1 這種格式（跟「每日」分頁一致）。\n' +
  '時間：24 小時制，例如 09:30。\n' +
  '類型、交通：用下拉選單。\n' +
  '地點：填 Google 地圖找得到的名稱（越南文最準）。\n' +
  '關門時間：例如 17:30，旅行當天會倒數提醒。\n' +
  '組別：全員參加就留空。人數：只有部分人參加時填，例如 2。\n' +
  '待定：還沒確定就打勾。\n' +
  '內容裡寫「集合」或「會合」，網頁會特別標出來。\n' +
  '開頭不要用 = + - @。';

/* ================= 入口 ================= */

function doGet(e) {
  try {
    const a = (e && e.parameter && e.parameter.action) || 'ping';
    if (a === 'itin') return out(readItin());
    return out({ ok: true, app: 'familytrip', ver: '1.0.0' });
  } catch (err) {
    return out({ ok: false, err: 'SERVER', msg: String(err && err.message || err) });
  }
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out(fail('BAD', '資料格式錯誤')); }
  try {
    if (GROUP_PASSWORD === PLACEHOLDER || !GROUP_PASSWORD) {
      return out(fail('NOPW', '主辦人還沒在 Apps Script 設定團體密碼'));
    }
    switch (b.action) {
      case 'login':     return out(withLock(function () { return login(b); }));
      case 'getData':   return out(authed(b, function (m) { return { ok: true, data: readData(m.name).data, ts: readData(m.name).ts }; }));
      case 'saveData':  return out(withLock(function () { return authed(b, function (m) { return saveData(m.name, b.data, b.ts); }); }));
      case 'listSplits':return out(authed(b, function () { return { ok: true, splits: readSplits(), members: memberNames() }; }));
      case 'addSplit':  return out(withLock(function () { return authed(b, function (m) { return addSplit(m.name, b.rec); }); }));
      case 'delSplit':  return out(withLock(function () { return authed(b, function (m) { return delSplit(m.name, b.id); }); }));
      case 'seedItin':  return out(withLock(function () { return authed(b, function () { return seedItin(b.days, b.items); }); }));
      case 'patchItin': return out(withLock(function () { return authed(b, function () { return patchItin(b.patches); }); }));
      default:          return out(fail('BAD', '不認得的動作'));
    }
  } catch (err) {
    if (err && err.code) return out(fail(err.code, err.message));
    return out(fail('SERVER', String(err && err.message || err)));
  }
}

/* ================= 小工具 ================= */

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function fail(code, msg, extra) {
  const o = { ok: false, err: code, msg: msg };
  if (extra) for (const k in extra) o[k] = extra[k];
  return o;
}
function oops(code, msg) { const e = new Error(msg); e.code = code; return e; }

function withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function sha(s) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}

/** 防公式注入：使用者輸入的文字開頭不能是 = + - @ */
function safe(v, max, what) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim();
  if (/^[=+\-@]/.test(s)) throw oops('INJECT', (what || '文字') + '開頭不能是 = + - @');
  if (max && s.length > max) s = s.substring(0, max);
  return s;
}
function num(v) {
  const n = Number(v);
  if (!isFinite(n)) throw oops('BAD', '金額不是數字');
  return n;
}

function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

/** 取得分頁；沒有就建立並放好表頭、格式、下拉選單 */
function sheet(key) {
  const book = ss();
  let sh = book.getSheetByName(SH[key]);
  if (sh) return sh;
  sh = book.insertSheet(SH[key]);
  const head = HEAD[key];
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  sh.setFrozenRows(1);
  if (key === 'itin') formatItin(sh);
  if (key === 'days') sh.getRange(2, 1, 60, 4).setNumberFormat('@');
  if (key === 'members' || key === 'data' || key === 'splits') {
    sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), head.length).setNumberFormat('@');
  }
  return sh;
}

function formatItin(sh) {
  const rows = BLANK_ROWS + 100;
  if (sh.getMaxRows() < rows + 1) sh.insertRowsAfter(sh.getMaxRows(), rows + 1 - sh.getMaxRows());
  sh.getRange(2, 1, rows, HEAD.itin.length).setNumberFormat('@');           // 全部純文字，日期時間不會被亂轉
  const dv = SpreadsheetApp.newDataValidation;
  sh.getRange(2, 3, rows, 1).setDataValidation(dv().requireValueInList(TYPES, true).setAllowInvalid(true).build());
  sh.getRange(2, 5, rows, 1).setDataValidation(dv().requireValueInList(TRANS, true).setAllowInvalid(true).build());
  sh.getRange(2, 10, rows, 1).setNumberFormat('General').setDataValidation(dv().requireCheckbox().build());
  sh.getRange(1, 1).setNote(ITIN_NOTE);
}

/** 第一次使用時手動執行一次也可以：建立所有分頁 */
function setup() {
  Object.keys(SH).forEach(function (k) { sheet(k); });
}

function rows(key) {
  const sh = sheet(key);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, Math.max(sh.getLastColumn(), HEAD[key].length)).getValues();
}

/* ================= 成員與登入 ================= */

function findMember(name) {
  const all = rows('members');
  for (let i = 0; i < all.length; i++) {
    if (String(all[i][0]) === name) {
      let tokens = [];
      try { tokens = JSON.parse(all[i][6] || '[]'); } catch (e) { tokens = []; }
      return {
        row: i + 2, name: name, salt: String(all[i][1]), hash: String(all[i][2]),
        fails: Number(all[i][4]) || 0, lockUntil: Number(all[i][5]) || 0, tokens: tokens
      };
    }
  }
  return null;
}
function memberNames() {
  return rows('members').map(function (r) { return String(r[0]); }).filter(function (s) { return s; });
}
function tokenHash(token) { return sha(token + '|' + GROUP_PASSWORD); }

function login(b) {
  if (String(b.group || '') !== GROUP_PASSWORD) return fail('GROUP', '團體密碼不對');
  const name = safe(b.name, 12, '暱稱');
  const pin = String(b.pin || '');
  if (!name) return fail('BAD', '請輸入暱稱');
  if (pin.length < 4) return fail('BAD', '個人密碼至少 4 個字');
  const sh = sheet('members');
  const now = Date.now();
  let m = findMember(name);
  let isNew = false;
  if (!m) {
    isNew = true;
    const salt = Utilities.getUuid();
    sh.appendRow([name, salt, sha(salt + '|' + pin), new Date(now).toISOString(), '0', '0', '[]']);
    m = findMember(name);
  } else {
    if (m.lockUntil > now) {
      return fail('LOCKED', '密碼錯太多次，請 ' + Math.ceil((m.lockUntil - now) / 60000) + ' 分鐘後再試');
    }
    if (sha(m.salt + '|' + pin) !== m.hash) {
      const fails = m.fails + 1;
      if (fails >= MAX_FAIL) {
        sh.getRange(m.row, 5, 1, 2).setValues([['0', String(now + LOCK_MIN * 60000)]]);
        return fail('LOCKED', '密碼錯 ' + MAX_FAIL + ' 次，鎖定 ' + LOCK_MIN + ' 分鐘');
      }
      sh.getRange(m.row, 5).setValue(String(fails));
      return fail('PIN', '這個暱稱已有人使用，個人密碼不對（還可以試 ' + (MAX_FAIL - fails) + ' 次）');
    }
  }
  const token = Utilities.getUuid() + Utilities.getUuid();
  const tokens = m.tokens.concat([tokenHash(token)]).slice(-5);   // 最多 5 支裝置同時登入
  sh.getRange(m.row, 5, 1, 3).setValues([['0', '0', JSON.stringify(tokens)]]);
  const d = readData(name);
  return { ok: true, token: token, isNew: isNew, name: name, members: memberNames(), data: d.data, ts: d.ts };
}

/** 驗證登入憑證（憑證是用個人密碼登入後才拿得到，改團體密碼會讓所有憑證失效） */
function authed(b, fn) {
  const name = String(b.name || '');
  const m = name ? findMember(name) : null;
  if (!m || !b.token || m.tokens.indexOf(tokenHash(String(b.token))) < 0) {
    return fail('AUTH', '登入已失效，請重新登入');
  }
  return fn(m);
}

/* ================= 個人資料（分段存） ================= */

function dataRow(name) {
  const all = rows('data');
  for (let i = 0; i < all.length; i++) if (String(all[i][0]) === name) return { row: i + 2, vals: all[i] };
  return null;
}
function readData(name) {
  const r = dataRow(name);
  if (!r) return { data: '', ts: 0 };
  return { data: r.vals.slice(2).join(''), ts: Number(r.vals[1]) || 0 };
}
function saveData(name, data, ts) {
  data = String(data == null ? '' : data);
  if (data.length > CHUNK * 20) return fail('BIG', '個人資料太大了');
  if (data && data.charAt(0) !== '{') return fail('BAD', '資料格式錯誤');
  const sh = sheet('data');
  const parts = [];
  for (let i = 0; i < data.length; i += CHUNK) parts.push(data.substring(i, i + CHUNK));
  const r = dataRow(name);
  const row = r ? r.row : sh.getLastRow() + 1;
  const width = Math.max(sh.getLastColumn(), parts.length + 2, HEAD.data.length);
  const line = [name, String(Number(ts) || Date.now())].concat(parts);
  while (line.length < width) line.push('');
  sh.getRange(row, 1, 1, width).setNumberFormat('@').setValues([line]);
  return { ok: true, ts: Number(line[1]) };
}

/* ================= 分帳 ================= */

function readSplits() {
  return rows('splits').filter(function (r) { return r[0]; }).map(function (r) {
    let shares = {};
    try { shares = JSON.parse(r[11] || '{}'); } catch (e) { shares = {}; }
    return {
      id: String(r[0]), ts: Number(r[1]) || 0, by: String(r[2]), date: String(r[3]), payer: String(r[4]),
      amount: Number(r[5]) || 0, cur: String(r[6]), rate: Number(r[7]) || 0, twd: Number(r[8]) || 0,
      cat: String(r[9]), note: String(r[10]), shares: shares
    };
  });
}
function addSplit(by, rec) {
  if (!rec) return fail('BAD', '沒有資料');
  const names = memberNames();
  const payer = safe(rec.payer, 12, '付款人');
  if (names.indexOf(payer) < 0) return fail('BAD', '付款人不在成員名單');
  const shares = {};
  let n = 0;
  for (const k in (rec.shares || {})) {
    const who = safe(k, 12, '成員');
    if (names.indexOf(who) < 0) return fail('BAD', '分攤的人不在成員名單');
    shares[who] = Math.round(num(rec.shares[k]) * 100) / 100;
    n++;
  }
  if (!n) return fail('BAD', '請選擇要分給誰');
  const amount = num(rec.amount), twd = num(rec.twd);
  if (amount <= 0 || twd <= 0) return fail('BAD', '金額要大於 0');
  const cur = rec.cur === 'TWD' ? 'TWD' : 'VND';
  const id = String(rec.id || Utilities.getUuid()).replace(/[^\w-]/g, '').substring(0, 40) || Utilities.getUuid();
  const exist = readSplits();
  for (let i = 0; i < exist.length; i++) if (exist[i].id === id) return { ok: true, id: id, dup: true };  // 重送不會重複記
  sheet('splits').appendRow([
    id, String(Date.now()), by, safe(rec.date, 10, '日期'), payer, String(amount), cur, String(num(rec.rate || 0)),
    String(twd), safe(rec.cat, 10, '分類'), safe(rec.note, 60, '說明'), JSON.stringify(shares)
  ]);
  return { ok: true, id: id };
}
function delSplit(by, id) {
  const sh = sheet('splits');
  const all = rows('splits');
  for (let i = 0; i < all.length; i++) {
    if (String(all[i][0]) === String(id)) {
      if (String(all[i][2]) !== by && String(all[i][4]) !== by) return fail('DENY', '只有記帳人或付款人可以刪除');
      sh.deleteRow(i + 2);
      return { ok: true };
    }
  }
  return { ok: true, gone: true };
}

/* ================= 行程 ================= */

function truthy(v) { return v === true || /^(true|是|v|✓|1)$/i.test(String(v).trim()); }

function readItin() {
  const days = rows('days').filter(function (r) { return String(r[0]).trim(); }).map(function (r) {
    return { date: String(r[0]).trim(), title: String(r[1]), hotel: String(r[2]), pax: String(r[3]) };
  });
  const items = rows('itin').filter(function (r) { return String(r[0]).trim() && String(r[3]).trim(); }).map(function (r) {
    return {
      date: String(r[0]).trim(), time: String(r[1]).trim(), type: String(r[2]).trim(), text: String(r[3]),
      trans: String(r[4]), place: String(r[5]), close: String(r[6]).trim(), group: String(r[7]).trim(),
      pax: String(r[8]).trim(), tbd: truthy(r[9]), note: String(r[10] || '')
    };
  });
  return { ok: true, days: days, items: items, ts: Date.now() };
}

function itemRow(it) {
  return [
    safe(it.date, 10, '日期'), safe(it.time, 8, '時間'), safe(it.type, 6, '類型'), safe(it.text, 120, '內容'),
    safe(it.trans, 10, '交通'), safe(it.place, 120, '地點'), safe(it.close, 8, '關門時間'), safe(it.group, 6, '組別'),
    safe(it.pax, 6, '人數'), !!it.tbd, safe(it.note, 200, '備註')
  ];
}

/** 試算表還沒有行程時，把網站內建的行程寫進去；已經有就絕不覆蓋 */
function seedItin(days, items) {
  const cur = readItin();
  if (cur.items.length) return { ok: true, seeded: false };
  if (!items || !items.length) return { ok: true, seeded: false };
  const shD = sheet('days'), shI = sheet('itin');
  if (!cur.days.length && days && days.length) {
    const d = days.map(function (x) { return [safe(x.date, 10), safe(x.title, 60), safe(x.hotel, 80), safe(x.pax, 6)]; });
    shD.getRange(2, 1, d.length, 4).setNumberFormat('@').setValues(d);
  }
  const r = items.map(itemRow);
  shI.getRange(2, 1, r.length, HEAD.itin.length).setValues(r);
  return { ok: true, seeded: true, count: r.length };
}

/** 整天覆寫：每個 id 只套用一次，套用前先備份那一天 */
function patchItin(patches) {
  if (!patches || !patches.length) return { ok: true, applied: [] };
  const props = PropertiesService.getScriptProperties();
  let done = [];
  try { done = JSON.parse(props.getProperty('patches') || '[]'); } catch (e) { done = []; }
  const shI = sheet('itin'), shB = sheet('backup');
  const applied = [];
  patches.forEach(function (p) {
    const id = String(p.id || '');
    if (!id || done.indexOf(id) >= 0 || !p.date || !p.items) return;
    const all = rows('itin').filter(function (r) { return String(r[0]).trim() || String(r[3]).trim(); });
    const keep = [], old = [];
    all.forEach(function (r) { (String(r[0]).trim() === String(p.date) ? old : keep).push(r.slice(0, HEAD.itin.length)); });
    const stamp = new Date().toISOString();
    if (old.length) {
      const b = old.map(function (r) { return [stamp, '覆寫 ' + id].concat(r); });
      shB.getRange(shB.getLastRow() + 1, 1, b.length, HEAD.backup.length).setValues(b);
    }
    const next = keep.concat(p.items.map(function (it) { it.date = p.date; return itemRow(it); }));
    const last = shI.getLastRow();
    if (last > 1) shI.getRange(2, 1, last - 1, HEAD.itin.length).clearContent();
    if (next.length) shI.getRange(2, 1, next.length, HEAD.itin.length).setValues(next);
    done.push(id); applied.push(id);
  });
  props.setProperty('patches', JSON.stringify(done));
  return { ok: true, applied: applied };
}
