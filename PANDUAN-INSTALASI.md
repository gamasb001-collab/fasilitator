# PANDUAN INSTALASI — Generator Fasilitator Pelatihan Ahli
Arraihan Academy • WA 085832288819

Ada **3 bagian**: (1) Backend Google Apps Script, (2) Aplikasi Generator (demo 3 hari + lisensi), (3) Aplikasi Admin Lisensi (terpisah, hanya untuk Anda).

## 1. Backend (Google Apps Script) — sekali saja
1. Buka https://script.google.com → **Proyek Baru**.
2. Hapus isi `Code.gs`, tempel seluruh isi **Kode.gs**.
3. Pilih fungsi `setupAppEnvironment` → ▶ Run → izinkan akses Drive & Sheets. **Jalankan SEKALI saja.**
4. Buka *Execution Log*, **salin `ADMIN_KEY`** (password Aplikasi Admin).
5. **Deploy → New deployment → Web app** · Execute as: **Me** · Access: **Anyone** → Deploy → **salin URL `/exec`**.

## 2. Isi URL backend
- Di ZIP generator: buka `js/config.js`, ganti `XXXX` pada `GAS_URL`.
- Di ZIP admin: buka `index.html`, ganti `XXXX` pada `GAS_URL`.

## 3. Deploy ke GitHub Pages (lewat terminal, JANGAN "Upload files" di web)
Lakukan **dua kali**: sekali untuk generator, sekali untuk admin (repo berbeda, mis. `generator-fasilitator` dan `admin-lisensi-aa`).
1. Ekstrak ZIP. Folder hasil ekstrak **adalah** folder tempat `git init` dijalankan; pastikan `dir`/`ls` menampilkan `index.html` di baris teratas.
2. Buat repository **Public** baru di github.com (tanpa README).
3. Di terminal, di dalam folder tersebut:
```
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
(Password = Personal Access Token dengan scope **repo**; layar tidak menampilkan karakter saat mengetik, itu normal.)
4. Repo → **Settings → Pages** → Branch `main`, folder `/ (root)` → Save. Tunggu 1–2 menit.

## 4. Cara kerja
- Pengguna baru otomatis mulai **demo 3 hari** (dihitung server per perangkat, tidak bisa direset dengan hapus cache).
- Setelah demo habis, generator terkunci → pengguna memasukkan **kode lisensi** `AA-XXXX-XXXX-XXXX`.
- Buat kode di **Aplikasi Admin** (durasi hari, 0 = seumur hidup). Kode terikat ke 1 perangkat; pindah perangkat → klik **Reset** di admin. **Cabut** untuk menonaktifkan.

## 5. Tes
Buka generator → banner demo tampil → isi form → Buat Dokumen. Buat kode di admin → aktivasi di generator → banner berubah "Lisensi aktif". Cek sheet `Demos` dan `Licenses` di Google Sheets.
