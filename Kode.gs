// ============================================================
// BACKEND API — Generator Fasilitator Pelatihan Ahli
// Arraihan Academy • WA 085832288819
// Mengelola: Demo 3 hari + Lisensi + Admin lisensi
// ============================================================
const DEMO_DAYS = 3;
const P = () => PropertiesService.getScriptProperties();
const sh = n => SpreadsheetApp.openById(P().getProperty('SPREADSHEET_ID')).getSheetByName(n);
const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

function doGet() { return out({ success: true, message: 'API aktif — Arraihan Academy' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const p = JSON.parse(e.postData.contents), d = p.data || {};
    const map = { status, activate, adminCreate, adminList, adminRevoke, adminReset };
    if (!map[p.action]) return out({ success: false, message: 'Action tidak dikenal' });
    return out(map[p.action](d));
  } catch (err) {
    return out({ success: false, message: err.message });
  } finally { try { lock.releaseLock(); } catch (x) {} }
}

function licRows() {
  const v = sh('Licenses').getDataRange().getValues();
  return v.slice(1).map((r, i) => ({ row: i + 2, key: r[0], nama: r[1], durasi: Number(r[2]), status: r[3], device: r[4], act: r[5], exp: r[6], created: r[7] }));
}

// Cek status perangkat: lisensi aktif / demo berjalan / kedaluwarsa
function status(d) {
  if (!d.deviceId) throw new Error('deviceId kosong');
  const now = Date.now();
  const l = licRows().find(x => x.device === d.deviceId && x.status === 'aktif');
  if (l) {
    if (!l.exp) return { success: true, mode: 'licensed', nama: l.nama, sisaHari: null };
    const sisa = new Date(l.exp) - now;
    if (sisa > 0) return { success: true, mode: 'licensed', nama: l.nama, sisaHari: Math.ceil(sisa / 864e5) };
    return { success: true, mode: 'expired', message: 'Lisensi berakhir. Hubungi Arraihan Academy untuk perpanjangan.' };
  }
  const s = sh('Demos'), v = s.getDataRange().getValues();
  const r = v.find((x, i) => i > 0 && x[0] === d.deviceId);
  let start;
  if (r) start = new Date(r[1]).getTime();
  else { start = now; s.appendRow([d.deviceId, new Date(now).toISOString()]); }
  const sisa = DEMO_DAYS * 864e5 - (now - start);
  return { success: true, mode: 'demo', sisaMs: Math.max(0, sisa), expired: sisa <= 0 };
}

// Aktivasi kode lisensi → terikat ke 1 perangkat
function activate(d) {
  const key = String(d.key || '').trim().toUpperCase();
  if (!key || !d.deviceId) return { success: false, message: 'Kode lisensi wajib diisi.' };
  const l = licRows().find(x => x.key === key);
  if (!l) return { success: false, message: 'Kode lisensi tidak ditemukan.' };
  if (l.status === 'dicabut') return { success: false, message: 'Lisensi ini telah dicabut.' };
  if (l.device && l.device !== d.deviceId) return { success: false, message: 'Lisensi sudah dipakai di perangkat lain. Hubungi admin untuk reset.' };
  if (!l.device) {
    const now = new Date();
    const exp = l.durasi > 0 ? new Date(now.getTime() + l.durasi * 864e5).toISOString() : '';
    sh('Licenses').getRange(l.row, 4, 1, 4).setValues([['aktif', d.deviceId, now.toISOString(), exp]]);
  }
  return Object.assign(status({ deviceId: d.deviceId }), { message: 'Aktivasi berhasil. Terima kasih!' });
}

// ---------- ADMIN (butuh ADMIN_KEY dari Script Properties) ----------
function auth(d) { if (!d.adminKey || d.adminKey !== P().getProperty('ADMIN_KEY')) throw new Error('Admin key salah.'); }
function findLic(k) { const l = licRows().find(x => x.key === k); if (!l) throw new Error('Lisensi tidak ditemukan'); return l; }

function adminCreate(d) {
  auth(d);
  const n = Math.min(Number(d.jumlah) || 1, 50), s = sh('Licenses'), keys = [];
  for (let i = 0; i < n; i++) {
    const k = 'AA-' + [0, 1, 2].map(() => Utilities.getUuid().replace(/-/g, '').slice(0, 4).toUpperCase()).join('-');
    s.appendRow([k, d.nama || '', Number(d.durasi) || 0, 'belum', '', '', '', new Date().toISOString()]);
    keys.push(k);
  }
  return { success: true, keys };
}
function adminList(d) { auth(d); return { success: true, data: licRows() }; }
function adminRevoke(d) { auth(d); sh('Licenses').getRange(findLic(d.key).row, 4).setValue('dicabut'); return { success: true }; }
function adminReset(d) { auth(d); sh('Licenses').getRange(findLic(d.key).row, 4, 1, 4).setValues([['belum', '', '', '']]); return { success: true }; }

// ============================================================
// SETUP — Jalankan SEKALI
// ============================================================
function setupAppEnvironment() {
  const APP = 'Generator Fasilitator Pelatihan Ahli';
  const root = DriveApp.createFolder('📁 ' + APP);
  const ss = SpreadsheetApp.create('🗃️ Database — ' + APP);
  DriveApp.getFileById(ss.getId()).moveTo(root);
  const cfg = ss.getActiveSheet().setName('AppConfig');
  const adminKey = Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
  cfg.appendRow(['key', 'value']);
  cfg.appendRow(['SPREADSHEET_ID', ss.getId()]);
  cfg.appendRow(['ADMIN_KEY', adminKey]);
  ss.insertSheet('Demos').appendRow(['device_id', 'started_at']);
  ss.insertSheet('Licenses').appendRow(['key', 'nama', 'durasi_hari', 'status', 'device_id', 'activated_at', 'expires_at', 'created_at']);
  P().setProperties({ SPREADSHEET_ID: ss.getId(), ROOT_FOLDER_ID: root.getId(), ADMIN_KEY: adminKey });
  Logger.log('✅ Setup selesai');
  Logger.log('🔑 ADMIN_KEY (simpan, dipakai di Aplikasi Admin Lisensi): ' + adminKey);
  Logger.log('📊 ' + ss.getUrl());
}
