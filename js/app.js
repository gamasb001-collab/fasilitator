const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lines = t => (t || '').split('\n').map(x => x.trim()).filter(Boolean);
const devId = (() => { let d = localStorage.getItem('aa_dev'); if (!d) { d = 'D' + crypto.randomUUID(); localStorage.setItem('aa_dev', d); } return d; })();
let st = null, timer = null;

async function api(action, data = {}) {
  try {
    const r = await fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, data }) });
    return await r.json();
  } catch (e) { return { success: false, message: 'Gagal terhubung ke server: ' + e.message }; }
}
function notif(m, t = 'ok') { const n = $('#notif'); n.textContent = m; n.className = 'notif show ' + t; setTimeout(() => n.classList.remove('show'), 3000); }

// ---------- Lisensi & Demo ----------
function applyStatus(s) {
  st = s; clearInterval(timer);
  const lic = $('#lic'), blocked = s.mode === 'expired' || (s.mode === 'demo' && s.expired);
  if (!s.success) { lic.textContent = '⚠️ Server tidak terhubung'; showLock(s.message || 'Tidak dapat memeriksa lisensi.', false); return; }
  if (s.mode === 'licensed') lic.textContent = '✅ Lisensi aktif' + (s.sisaHari ? ' • sisa ' + s.sisaHari + ' hari' : ' • seumur hidup');
  else if (s.mode === 'demo' && !s.expired) {
    const end = Date.now() + s.sisaMs, tick = () => { const ms = Math.max(0, end - Date.now()), h = Math.floor(ms / 36e5);
      lic.innerHTML = '⏳ Demo: sisa ' + Math.floor(h / 24) + ' hari ' + (h % 24) + ' jam • <a href="#" id="alink" style="color:#fff">Aktivasi</a>';
      if (!ms) location.reload(); };
    tick(); timer = setInterval(tick, 60000);
    setTimeout(() => $('#alink')?.addEventListener('click', e => { e.preventDefault(); showLock('Masukkan kode lisensi dari Arraihan Academy.', true); }), 0);
  }
  if (blocked) { lic.textContent = '🔒 Demo/lisensi berakhir'; showLock(s.message || 'Masa demo 3 hari telah berakhir. Aktifkan lisensi untuk melanjutkan.', false); }
}
function showLock(msg, closable) {
  $('#lm').textContent = msg; $('#lock').hidden = false; $('#cls').hidden = !closable;
  $('#wa').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Halo Arraihan Academy, saya ingin lisensi Generator Fasilitator Pelatihan Ahli.');
}
async function init() { applyStatus(await api('status', { deviceId: devId })); }
const unlocked = () => st && st.success && (st.mode === 'licensed' || (st.mode === 'demo' && !st.expired));

// ---------- Generator ----------
const REG = {
  umum: ['Kepmenaker No. 333 Tahun 2020 (SKKNI Standardisasi, Pelatihan Kerja, dan Sertifikasi)', 'Kepmenaker No. 3 Tahun 2021 (KKNI Bidang Pelatihan Kerja dan Sertifikasi)', 'Permenaker No. 6 Tahun 2025 tentang Penyelenggaraan Pelatihan Vokasi'],
  asn: ['Permen PANRB No. 42 Tahun 2021 tentang Jabatan Fungsional Widyaiswara', 'Peraturan LAN No. 13 Tahun 2020 tentang Akreditasi Pelatihan', 'Peraturan LAN No. 7 Tahun 2021 tentang Pelatihan Fungsional Widyaiswara'],
  kes: ['UU No. 17 Tahun 2023 tentang Kesehatan', 'PP No. 28 Tahun 2024', 'Permenkes No. 13 Tahun 2025 tentang Akreditasi Lembaga Pelatihan Bidang Kesehatan', 'Kepdirjen SDMK HK.02.02/F/131/2025']
};
const METODE = ['Ceramah interaktif', 'Diskusi kelompok', 'Studi kasus', 'Simulasi', 'Roleplay', 'Praktik'];
const tbl = (h, rows) => '<table><tr>' + h.map(x => '<th>' + x + '</th>').join('') + '</tr>' + rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>';
const head = v => '<p><b>Pelatihan:</b> ' + esc(v.pelatihan) + '<br><b>Mata pelatihan:</b> ' + esc(v.mata) + '<br><b>Alokasi:</b> ' + v.jp + ' JP (' + v.jp * 45 + ' menit) • ' + esc(v.mode) + '<br><b>Sasaran:</b> ' + esc(v.sasaran || '—') + '</p>';
const lemah = /^(memahami|mengetahui|paham|tahu)/i;

function ihbList(v, M) {
  const I = lines(v.ihb); let w = '';
  const out = M.map((m, i) => { const x = I[i] || 'Menjelaskan ' + m.toLowerCase(); if (lemah.test(x)) w += '<p class="warn">⚠️ IHB "' + esc(x) + '" memakai kata kerja tidak terukur. Gunakan: menjelaskan, mengidentifikasi, menyusun, mendemonstrasikan, menganalisis.</p>'; return x; });
  return { out, w };
}

const GEN = {
  rbpmp(v) {
    const M = lines(v.materi); if (!M.length) return '<p class="warn">Isi minimal 1 materi pokok.</p>';
    const { out, w } = ihbList(v, M), per = v.jp / M.length, f = n => (Math.round(n * 10) / 10).toString();
    const rows = M.map((m, i) => [i + 1, esc(out[i]), esc(m), METODE[i % 3] + ', ' + METODE[3 + i % 3], 'Bahan tayang, modul, lembar kerja' + (v.mode !== 'luring' ? ', LMS/video conference' : ''), 'T: ' + f(per * .4) + ' • P: ' + f(per * .2) + ' • PL: ' + f(per * .4) + ' = <b>' + f(per) + '</b>', 'Sesuai regulasi acuan']);
    return '<h3>RBPMP — Rancang Bangun Pembelajaran Mata Pelatihan</h3>' + head(v) + w +
      tbl(['No', 'Indikator Hasil Belajar', 'Materi Pokok & Sub Materi', 'Metode', 'Media & Alat Bantu', 'Alokasi (JP)', 'Referensi'], rows) +
      '<p><b>Regulasi acuan:</b></p><ul>' + REG[v.bidang].map(r => '<li>' + r + '</li>').join('') + '</ul><p class="muted">T = Teori, P = Penugasan/Diskusi, PL = Praktik Lapangan. 1 JP = 45 menit.</p>';
  },
  rp(v) {
    const M = lines(v.materi).map(esc).join('; ') || esc(v.mata), tot = v.jp * 45, pct = [.12, .45, .33, .10];
    let mn = pct.map(p => Math.round(tot * p)); mn[3] += tot - mn.reduce((a, b) => a + b, 0);
    const dr = v.mode !== 'luring' ? ' (via platform daring/LMS)' : '';
    const rows = [
      ['Pendahuluan', 'Menyapa, bina suasana (BLC), apersepsi: "Pengalaman apa terkait ' + esc(v.mata) + ' di tempat kerja Bapak/Ibu?", menyampaikan tujuan dan IHB.', 'Memperkenalkan diri, menyepakati norma kelas, menjawab apersepsi.', 'Curah pendapat, tanya jawab • Bahan tayang, flipchart' + dr, mn[0]],
      ['Penyajian Materi', 'Menyajikan secara interaktif: ' + M + '. Memberi pertanyaan pemantik di tiap sub materi.', 'Menyimak, bertanya, berdiskusi, mencatat poin kunci.', 'Ceramah interaktif, diskusi • Modul, slide' + dr, mn[1]],
      ['Penerapan / Aplikasi', 'Membagi kelompok, membagikan lembar kerja/kasus, memfasilitasi, memberi umpan balik konstruktif.', 'Mengerjakan studi kasus/simulasi/roleplay, mempresentasikan, menerima umpan balik.', 'Studi kasus, simulasi, roleplay • Lembar kerja, panduan diskusi', mn[2]],
      ['Penilaian & Penutup', 'Mengevaluasi ketercapaian IHB (kuis/post-test), merangkum bersama, menyusun Rencana Tindak Lanjut (RTL), menutup dengan motivasi.', 'Menjawab evaluasi, menyusun RTL, memberi umpan balik.', 'Tanya jawab, refleksi • Soal evaluasi, form RTL', mn[3]]
    ];
    return '<h3>Rencana Pembelajaran (RP/SAP)</h3>' + head(v) + tbl(['Tahapan', 'Kegiatan Fasilitator', 'Kegiatan Peserta', 'Metode & Media', 'Waktu (menit)'], rows) + '<p><b>Total:</b> ' + tot + ' menit = ' + v.jp + ' JP.</p>';
  },
  kak(v) {
    const M = lines(v.materi);
    return '<h3>KERANGKA ACUAN KERJA (KAK/TOR)</h3><h3>' + esc(v.pelatihan) + '</h3>' +
      '<p><b>A. Latar Belakang</b><br>Peningkatan kompetensi ' + esc(v.sasaran || 'peserta') + ' pada bidang ' + esc(v.mata) + ' diperlukan agar pelaksanaan tugas berjalan efektif dan sesuai standar. [Sesuaikan dengan data/masalah instansi Anda.]</p>' +
      '<p><b>B. Dasar Hukum</b></p><ul>' + REG[v.bidang].map(r => '<li>' + r + '</li>').join('') + '</ul>' +
      '<p><b>C. Tujuan</b><br>Umum: meningkatkan kompetensi peserta pada ' + esc(v.mata) + '.<br>Khusus: ' + (M.length ? M.map(m => 'peserta mampu menjelaskan/menerapkan ' + esc(m.toLowerCase())).join('; ') : '[isi tujuan khusus]') + '.</p>' +
      '<p><b>D. Sasaran:</b> ' + esc(v.sasaran || '[isi]') + '</p><p><b>E. Metode:</b> ' + v.mode + ' — ceramah interaktif, diskusi, studi kasus, simulasi, praktik (andragogi).</p>' +
      '<p><b>F. Waktu & Tempat:</b> ' + v.jp + ' JP (' + v.jp * 45 + ' menit); [tanggal & lokasi].</p>' +
      '<p><b>G. Struktur Materi</b></p>' + tbl(['No', 'Materi', 'JP'], (M.length ? M : ['[materi]']).map((m, i) => [i + 1, esc(m), Math.round(v.jp / (M.length || 1) * 10) / 10])) +
      '<p><b>H. Luaran:</b> peserta lulus evaluasi, Rencana Tindak Lanjut, laporan pelatihan.</p><p><b>I. Evaluasi:</b> Model Kirkpatrick Level 1–4.</p><p><b>J. Anggaran:</b> [lampirkan rincian biaya].</p>';
  },
  eval(v) {
    const M = lines(v.materi);
    return '<h3>Instrumen Evaluasi — Model Kirkpatrick</h3>' + head(v) + tbl(['Level', 'Aspek', 'Instrumen', 'Waktu'], [
      ['1 Reaksi', 'Kepuasan thd penyelenggaraan & fasilitator', 'Kuesioner skala Likert 1–5 (materi, metode, fasilitator, sarana)', 'Akhir pelatihan'],
      ['2 Pembelajaran', 'Pengetahuan, keterampilan, sikap', 'Pre-test & post-test (' + (M.length || 'n') + ' materi), uji praktik/lembar observasi', 'Awal & akhir'],
      ['3 Perilaku', 'Penerapan di tempat kerja', 'Evaluasi Pasca Pelatihan (EPP): wawancara/kuesioner ke peserta & atasan', '1–3 bulan pasca'],
      ['4 Dampak', 'Kinerja organisasi/layanan', 'Analisis indikator kinerja sebelum-sesudah', '3–6 bulan pasca']
    ]) + '<h3>Contoh Butir Level 1 (1 = Sangat Kurang, 5 = Sangat Baik)</h3><ol>' +
      ['Kesesuaian materi dengan kebutuhan kerja', 'Kejelasan penyampaian fasilitator', 'Ketepatan metode pembelajaran', 'Kualitas modul dan media', 'Kesempatan berpartisipasi aktif', 'Kenyamanan sarana & pelayanan panitia'].map(x => '<li>' + x + '</li>').join('') + '</ol>' +
      (M.length ? '<h3>Kisi-kisi Pre/Post-test</h3>' + tbl(['No', 'Materi', 'Jumlah soal'], M.map((m, i) => [i + 1, esc(m), 3])) : '');
  }
};

// ---------- Events ----------
$('#f').addEventListener('submit', e => {
  e.preventDefault();
  if (!unlocked()) return showLock('Aktifkan lisensi untuk menggunakan generator.', false);
  const v = Object.fromEntries(new FormData(e.target)); v.jp = Math.max(1, +v.jp || 1);
  $('#hasil').innerHTML = GEN[v.jenis](v); $('#tools').hidden = false;
  $('#hasil').scrollIntoView({ behavior: 'smooth' });
});
$('#cp').onclick = async () => { try { await navigator.clipboard.writeText($('#hasil').innerText); notif('Tersalin'); } catch { notif('Gagal menyalin', 'error'); } };
$('#pr').onclick = () => print();
$('#dl').onclick = () => {
  const h = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><meta charset="utf-8"><style>table{border-collapse:collapse}td,th{border:1px solid #000;padding:4px}</style><body>' + $('#hasil').innerHTML + '</body></html>';
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff', h], { type: 'application/msword' })); a.download = 'dokumen-pelatihan.doc'; a.click();
};
$('#cls').onclick = () => $('#lock').hidden = true;
$('#act').onclick = async () => {
  const b = $('#act'); b.disabled = true; b.textContent = 'Memeriksa…';
  const r = await api('activate', { key: $('#key').value, deviceId: devId });
  b.disabled = false; b.textContent = 'Aktifkan';
  if (r.success) { notif(r.message); $('#lock').hidden = true; applyStatus(r); } else notif(r.message || 'Gagal', 'error');
};
init();
