# Practice Sesi 1 — Build Automation & CI Pipeline (2 Jam)

> **Format:** Hands-on berjenjang **Pemula → Menengah → Advanced**, penuh study case.
> **Durasi target:** ~120 menit. Tiap case ada estimasi waktu.
> **Hasil akhir:** Satu repo dengan CI pipeline lengkap (multi-stage, matrix, cache,
> artifact, reusable workflow) di **GitHub Actions**, plus versi **GitLab CI**.

---

## 🎯 Peta Materi & Waktu (silakan tempel di papan)

| Blok | Case | Level | Materi | Menit |
|------|------|-------|--------|-------|
| A. Fondasi | Case 0–2 | Pemula | Build automation, npm scripts, pipeline pertama | 30 |
| B. Pipeline Inti | Case 3–5 | Menengah | Stages, triggers, build matrix | 35 |
| C. Optimasi | Case 6–7 | Menengah–Adv | Cache, artifact, job `needs`, conditional | 30 |
| D. Advanced | Case 8–9 | Advanced | Reusable workflow, build validation gate, badge | 20 |
| E. Bonus (jika ada waktu) | Case 10–12 | Menengah–Adv | Build flow (bundle→artifact), notifikasi, validasi lanjutan | 30 |
| F. Wrap-up | — | — | GitLab CI, troubleshooting, diskusi | 5 |

> **Masih ada waktu lebih setelah semua case?** Lanjutkan ke
> `extend/practice-sesi1-extend.md` — 21 case tambahan (Docker multi-stage, publish +
> tagging + rollback, CD deploy, security SCA/SAST/container, monorepo, dll) yang
> memetakan **seluruh slide deck** pelatihan.

**Konsep silabus yang dicakup:** Introduction to Build Automation · CI Pipeline
Components · Pipeline Stages · YAML Pipeline Configuration · Trigger-Based Automation
· Build Validation · Introduction to GitHub Actions / GitLab CI.

---

## 0. Instruksi untuk Agent (WAJIB baca)

Kamu adalah coding agent. Bangun project ini **case demi case sesuai urutan**.

**Aturan main:**
1. Kerjakan **per CASE**. Setiap case: buat/edit file, lalu jalankan **Verifikasi**.
   Jangan lanjut kalau verifikasi belum lolos.
2. Root project: `practive-ngajar/`. Semua path relatif ke situ.
3. Komentar kode: **Bahasa Indonesia singkat** (biar gampang dijelaskan ke murid).
4. Jangan `git push` kecuali user minta. Cukup siapkan file.
5. Di tiap case ada bagian **"Untuk Pengajar"** — biarkan apa adanya, itu skrip ngajar.
6. Setelah semua selesai, isi **Acceptance Criteria** paling bawah.

**Struktur akhir yang diharapkan:**
```
practive-ngajar/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # pipeline utama
│       ├── nightly.yml            # scheduled build (advanced)
│       └── reusable-node.yml      # reusable workflow (advanced)
├── src/
│   ├── stringUtils.js
│   └── mathUtils.js
├── scripts/
│   ├── validate-build.js
│   ├── build-bundle.js       # bonus: bundling (Case 10)
│   └── check-size.js         # bonus: performance budget (Case 12)
├── .eslintrc.json
├── .gitignore
├── package.json
├── .gitlab-ci.yml
└── README.md
```

---

# BLOK A — FONDASI (Pemula) · ~30 menit

## CASE 0 — Inisialisasi Project · ⏱️ 8 menit

**Konsep:** _Introduction to Build Automation_. Build automation = mengganti langkah
manual (ketik perintah satu-satu) dengan perintah standar yang bisa dijalankan mesin.

### 0.1 `package.json`
```json
{
  "name": "ci-cd-belajar",
  "version": "1.0.0",
  "description": "Project latihan CI/CD (Sesi 1 & 2)",
  "main": "src/stringUtils.js",
  "type": "commonjs",
  "scripts": {
    "lint": "eslint src scripts",
    "build": "node scripts/validate-build.js",
    "start": "node -e \"console.log(require('./src/stringUtils').capitalize('halo dunia'))\""
  },
  "keywords": ["ci", "cd", "belajar"],
  "license": "MIT",
  "devDependencies": {
    "eslint": "^8.57.0"
  }
}
```

### 0.2 `.gitignore`
```
node_modules/
dist/
coverage/
reports/
*.log
```

**Verifikasi:**
```bash
npm install
```
> Sukses install eslint + terbentuk `package-lock.json`.

**Untuk Pengajar:** tanyakan ke murid — "kalau tiap orang jalanin langkah beda-beda,
apa yang bisa kacau?" → jawaban mengarah ke *reproducibility*, inti build automation.

---

## CASE 1 — Kode Aplikasi (bahan yang di-build) · ⏱️ 10 menit

**Konsep:** CI butuh sesuatu untuk di-build & divalidasi. Ini artifact kita.

### 1.1 `src/stringUtils.js`
```javascript
// Kumpulan util string sederhana — bahan untuk pipeline & testing.

/** Kapitalkan huruf pertama tiap kata. */
function capitalize(text) {
  if (typeof text !== 'string') throw new TypeError('text harus string');
  return text
    .split(' ')
    .map((kata) => (kata ? kata[0].toUpperCase() + kata.slice(1) : kata))
    .join(' ');
}

/** Balik urutan karakter. */
function reverse(text) {
  if (typeof text !== 'string') throw new TypeError('text harus string');
  return text.split('').reverse().join('');
}

/** Hitung jumlah kata (abaikan spasi berlebih). */
function wordCount(text) {
  if (typeof text !== 'string') throw new TypeError('text harus string');
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

/** Cek apakah string palindrom (abaikan huruf besar/kecil & spasi). */
function isPalindrome(text) {
  if (typeof text !== 'string') throw new TypeError('text harus string');
  const bersih = text.toLowerCase().replace(/\s+/g, '');
  return bersih === bersih.split('').reverse().join('');
}

module.exports = { capitalize, reverse, wordCount, isPalindrome };
```

### 1.2 `src/mathUtils.js` (dipakai untuk case testing lanjutan di Sesi 2)
```javascript
// Util matematika sederhana.

/** Penjumlahan. */
function add(a, b) {
  return a + b;
}

/** Pembagian dengan proteksi bagi nol. */
function divide(a, b) {
  if (b === 0) throw new RangeError('tidak bisa membagi dengan nol');
  return a / b;
}

/** Cek bilangan prima. */
function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

module.exports = { add, divide, isPrime };
```

**Verifikasi:**
```bash
npm start
```
> Output: `Halo Dunia`

---

## CASE 2 — Lint + Build Script Lokal · ⏱️ 12 menit

**Konsep:** _CI Pipeline Components_. Sebelum masuk CI, kita pastikan tiap komponen
jalan **lokal** dulu: **lint** (kualitas) dan **build validation** (kelayakan).

### 2.1 `.eslintrc.json`
```json
{
  "root": true,
  "env": { "node": true, "es2021": true, "jest": true },
  "parserOptions": { "ecmaVersion": 2021, "sourceType": "script" },
  "extends": "eslint:recommended",
  "rules": {
    "no-unused-vars": "error",
    "no-console": "off",
    "eqeqeq": "error"
  }
}
```

### 2.2 `scripts/validate-build.js`
```javascript
// Build validation: pastikan modul valid, lalu hasilkan artifact di dist/.
const fs = require('fs');
const path = require('path');
const stringUtils = require('../src/stringUtils');
const mathUtils = require('../src/mathUtils');

console.log('🔍 Menjalankan build validation...');

const wajib = {
  stringUtils: ['capitalize', 'reverse', 'wordCount', 'isPalindrome'],
  mathUtils: ['add', 'divide', 'isPrime'],
};

const modul = { stringUtils, mathUtils };
for (const [namaModul, fungsiList] of Object.entries(wajib)) {
  for (const fn of fungsiList) {
    if (typeof modul[namaModul][fn] !== 'function') {
      console.error(`❌ Build GAGAL: ${namaModul}.${fn} tidak ada.`);
      process.exit(1); // exit != 0 => pipeline gagal
    }
  }
}

// Smoke test ringan
if (stringUtils.capitalize('a b') !== 'A B' || mathUtils.add(2, 3) !== 5) {
  console.error('❌ Build GAGAL: smoke test tidak sesuai.');
  process.exit(1);
}

const distDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(
  path.join(distDir, 'build-info.json'),
  JSON.stringify({ status: 'ok', modul: Object.keys(wajib) }, null, 2)
);
console.log('✅ Build validation LULUS → dist/build-info.json');
```

**Verifikasi:**
```bash
npm run lint && npm run build
```
> Lint lolos, muncul `✅ Build validation LULUS`, file `dist/build-info.json` ada.

**Untuk Pengajar:** ubah sengaja satu fungsi jadi typo → jalankan `npm run build` →
tunjukkan `exit code 1`. Cek dengan `echo $?`. Inilah cara CI tahu "gagal".

---

# BLOK B — PIPELINE INTI (Menengah) · ~35 menit

## CASE 3 — Pipeline GitHub Actions Pertama · ⏱️ 12 menit

**Konsep:** _YAML Pipeline Configuration_ + _Pipeline Stages_ + _Introduction to
GitHub Actions_. Satu file YAML mendefinisikan: kapan jalan (`on`), di mana
(`runs-on`), dan langkah apa (`steps`).

Buat `.github/workflows/ci.yml`:
```yaml
# ============================================================
# CI Pipeline — GitHub Actions (versi dasar)
# Stages: Checkout -> Setup -> Install -> Lint -> Build
# ============================================================
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build & Validate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Build & validate
        run: npm run build
```

**Verifikasi (simulasi runner secara lokal):**
```bash
npm ci && npm run lint && npm run build
```
> Tiga tahap lolos berurutan — inilah yang dijalankan GitHub runner.

**Untuk Pengajar:** bedah anatomi YAML: `name` → `on` → `jobs` → `steps`.
Tekankan `uses` (action siap pakai) vs `run` (perintah shell).

---

## CASE 4 — Trigger-Based Automation (banyak study case) · ⏱️ 13 menit

**Konsep:** _Trigger-Based Automation_. Bagian `on:` menentukan **kapan** pipeline
jalan. Kita eksplor beberapa skenario nyata.

Buat file terpisah biar mudah dibandingkan: `.github/workflows/triggers-demo.yml`:
```yaml
# Demo berbagai trigger. (Hanya bahan belajar — job-nya cuma echo.)
name: Triggers Demo

on:
  # Case A: setiap push ke branch tertentu
  push:
    branches: [main, 'release/**']
    # Case B: hanya jika file di path ini berubah (hemat resource)
    paths:
      - 'src/**'
      - 'package.json'

  # Case C: setiap PR menuju main
  pull_request:
    branches: [main]

  # Case D: saat ada tag versi (mis. v1.2.0) -> cocok untuk release
  # (dipisah karena push tag beda dari push branch)
  # Aktifkan dengan menaruh di push.tags jika perlu:
  # push:
  #   tags: ['v*.*.*']

  # Case E: terjadwal (cron) — "nightly build"
  schedule:
    - cron: '0 22 * * *'   # tiap hari 22:00 UTC

  # Case F: tombol manual di tab Actions
  workflow_dispatch:
    inputs:
      alasan:
        description: 'Alasan menjalankan manual'
        required: false
        default: 'uji coba'

jobs:
  info:
    runs-on: ubuntu-latest
    steps:
      - name: Tampilkan pemicu
        run: |
          echo "Pipeline dipicu oleh: ${{ github.event_name }}"
          echo "Branch/Ref: ${{ github.ref }}"
```

**Study case untuk didiskusikan (jawab di komentar file atau lisan):**
1. **Path filter** — kenapa build tidak perlu jalan saat hanya `README.md` diubah?
2. **Tag trigger** — kenapa cocok untuk _release pipeline_, bukan tiap commit?
3. **Schedule** — kegunaan nightly build (deteksi kerusakan dependency eksternal).
4. **workflow_dispatch** — kapan butuh trigger manual?

**Verifikasi (YAML valid secara struktur):**
```bash
node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/triggers-demo.yml','utf8');if(!s.includes('workflow_dispatch'))process.exit(1);console.log('OK: triggers-demo.yml siap')"
```

**Untuk Pengajar:** ini bagian paling "aha" buat pemula. Tunjukkan bahwa satu pipeline
bisa punya banyak pintu masuk.

---

## CASE 5 — Build Matrix (uji banyak versi Node) · ⏱️ 10 menit

**Konsep:** Menengah. _Build matrix_ = jalankan job yang sama di banyak konfigurasi
(mis. beberapa versi Node) secara paralel. Menjamin kompatibilitas.

Edit `ci.yml` — ganti job `build` menjadi versi matrix:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build (Node ${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false          # biar semua versi tetap dites walau satu gagal
      matrix:
        node: ['18', '20', '22']
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

**Verifikasi lokal (pakai versi Node yang terpasang):**
```bash
npm ci && npm run lint && npm run build
```
> Lolos. Di GitHub, job ini otomatis jalan 3x (Node 18/20/22) paralel.

**Untuk Pengajar:** jelaskan `fail-fast: false` — default `true` akan membatalkan
job lain begitu satu gagal. Diskusikan trade-off (hemat waktu vs info lengkap).

---

# BLOK C — OPTIMASI (Menengah–Advanced) · ~30 menit

## CASE 6 — Caching & Artifacts · ⏱️ 15 menit

**Konsep:** _CI Pipeline Components_ tingkat lanjut. **Cache** mempercepat build
(tidak download dependency berulang). **Artifact** menyimpan hasil build untuk
diunduh / dipakai job lain.

Edit `ci.yml` — tambahkan artifact + jadikan satu job matrix + upload:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build (Node ${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node: ['18', '20', '22']
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'          # <-- caching dependency npm otomatis

      - run: npm ci
      - run: npm run lint
      - run: npm run build

      # Upload artifact hanya dari satu versi (Node 20) biar tidak dobel
      - name: Upload build artifact
        if: matrix.node == '20'
        uses: actions/upload-artifact@v4
        with:
          name: build-info
          path: dist/build-info.json
          retention-days: 7
```

**Study case:**
- Kenapa `cache: 'npm'` butuh `package-lock.json`? (kunci cache = hash lockfile)
- Kenapa artifact di-upload hanya dari 1 versi matrix? (hindari konflik nama)

**Verifikasi:**
```bash
rm -rf dist && npm run build && test -f dist/build-info.json && echo "Artifact OK"
```

**Untuk Pengajar:** tunjukkan bahwa cache = kecepatan, artifact = hasil yang dibawa
ke stage berikutnya (jembatan menuju CD/deploy).

---

## CASE 7 — Multi-Job + `needs` + Conditional · ⏱️ 15 menit

**Konsep:** Advanced-pemula. _Pipeline Stages_ sebagai **job terpisah** yang saling
bergantung (`needs`). Plus **conditional execution** (`if`).

Ini pola nyata: `lint` → `build` → `package` (hanya di `main`).

Edit `ci.yml` menjadi 3 job berantai:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # JOB 1: Quality gate
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  # JOB 2: Build — hanya jalan kalau lint sukses
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint]                 # <-- ketergantungan antar-job
    strategy:
      fail-fast: false
      matrix:
        node: ['18', '20', '22']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ matrix.node }}', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - if: matrix.node == '20'
        uses: actions/upload-artifact@v4
        with: { name: build-info, path: dist/build-info.json }

  # JOB 3: Package — hanya di push ke main (bukan di PR)
  package:
    name: Package (main only)
    runs-on: ubuntu-latest
    needs: [build]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with: { name: build-info }
      - name: Tampilkan hasil
        run: |
          echo "Siap di-package. Isi build-info:"
          cat build-info.json
```

**Study case:**
- Gambarkan graf: `lint → build → package`. Apa yang terjadi kalau `lint` gagal?
- Kenapa `package` dibatasi `if:` hanya ke `main`? (PR belum layak dirilis)

**Verifikasi lokal (simulasi rantai):**
```bash
npm ci && npm run lint && npm run build && echo "Rantai lint->build OK"
```

**Untuk Pengajar:** gambar DAG (directed graph) job di papan. Ini konsep inti
pipeline modern: stage = job, panah = `needs`.

---

# BLOK D — ADVANCED · ~20 menit

## CASE 8 — Reusable Workflow (DRY untuk banyak repo) · ⏱️ 12 menit

**Konsep:** Advanced. Daripada copy-paste YAML, buat **reusable workflow** yang
bisa dipanggil pipeline lain. Ini praktik tim skala besar.

### 8.1 Reusable workflow — `.github/workflows/reusable-node.yml`
```yaml
# Reusable workflow: bisa dipanggil workflow lain lewat `uses`.
name: Reusable Node CI

on:
  workflow_call:                 # <-- kunci: bikin workflow ini "dipanggil"
    inputs:
      node-version:
        required: false
        type: string
        default: '20'
      run-lint:
        required: false
        type: boolean
        default: true

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - if: ${{ inputs.run-lint }}
        run: npm run lint
      - run: npm run build
```

### 8.2 Pemanggil — `.github/workflows/nightly.yml`
```yaml
# Nightly build memanggil reusable workflow. Menggabungkan scheduled trigger + reuse.
name: Nightly

on:
  schedule:
    - cron: '0 22 * * *'
  workflow_dispatch: {}

jobs:
  nightly-ci:
    uses: ./.github/workflows/reusable-node.yml   # <-- panggil reusable workflow
    with:
      node-version: '20'
      run-lint: true
```

**Study case:**
- Apa untung reusable workflow untuk perusahaan dengan 50 repo?
- Bedakan **reusable workflow** vs **composite action** (singkat: workflow memanggil
  job utuh; composite action membungkus beberapa `steps`).

**Verifikasi (struktur):**
```bash
node -e "const fs=require('fs');for(const f of ['reusable-node.yml','nightly.yml']){const s=fs.readFileSync('.github/workflows/'+f,'utf8');if(f.includes('reusable')&&!s.includes('workflow_call'))process.exit(1);}console.log('OK: reusable + nightly siap')"
```

---

## CASE 9 — Build Validation Gate + Status Badge + GitLab CI · ⏱️ 8 menit

**Konsep:** _Build Validation_ sebagai **gerbang**. Plus perkenalan **status badge**
dan **branch protection** (konsep). Ditutup versi **GitLab CI** untuk perbandingan.

### 9.1 Status badge di `README.md`
Tambahkan (ganti `USER/REPO` nanti saat repo dibuat):
```markdown
![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)
```

### 9.2 `README.md` lengkap
```markdown
# CI/CD Belajar — Sesi 1

![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)

Project latihan **build automation & CI pipeline**.

## Perintah lokal
| Perintah        | Fungsi                             |
|-----------------|------------------------------------|
| `npm install`   | pasang dependency                  |
| `npm run lint`  | cek kualitas kode                  |
| `npm run build` | build + validasi (`dist/`)         |
| `npm start`     | jalankan contoh app                |

## Pipeline
- `.github/workflows/ci.yml` — pipeline utama (lint → build → package)
- `.github/workflows/nightly.yml` — nightly build (memanggil reusable workflow)
- `.github/workflows/reusable-node.yml` — reusable workflow
- `.gitlab-ci.yml` — versi GitLab (perbandingan)

Alur: **Checkout → Install → Lint → Build → (Package di main)**.

## Branch Protection (konsep)
Di Settings → Branches, aktifkan "Require status checks to pass before merging",
pilih job `Lint` & `Build`. Efeknya: PR tidak bisa di-merge kalau CI merah.
Inilah **build validation gate** yang sesungguhnya.
```

### 9.3 `.gitlab-ci.yml` (perbandingan)
```yaml
# CI Pipeline versi GitLab — konsep sama, sintaks beda.
image: node:20

stages:
  - lint
  - build

cache:
  key:
    files: [package-lock.json]
  paths: [node_modules/]

lint_job:
  stage: lint
  script:
    - npm ci
    - npm run lint

build_job:
  stage: build
  needs: [lint_job]              # sama seperti `needs` di GitHub
  script:
    - npm ci
    - npm run build
  artifacts:
    paths: [dist/build-info.json]
    expire_in: 1 week
  rules:                          # setara trigger conditional
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: on_success
    - when: on_success
```

**Verifikasi akhir (jalankan seluruh pipeline lokal):**
```bash
npm ci && npm run lint && npm run build && test -f dist/build-info.json && echo "🎉 PIPELINE SESI 1 LENGKAP"
```

**Untuk Pengajar:** tutup dengan membandingkan tabel GitHub vs GitLab
(stages, needs, artifacts, rules). Tekankan: **konsep universal, sintaks beda**.

---

# BLOK E — BONUS (jika masih ada waktu) · ~30 menit

> Tiga case ini **melanjutkan project yang sama** (bukan demo terpisah). Aman
> dikerjakan setelah CASE 9 tanpa mengubah yang sudah jadi. Kalau waktu masih sisa
> banyak, lanjut ke `extend/practice-sesi1-extend.md`.

## CASE 10 — Build Automation Flow: Bundle → Artifact · ⏱️ 12 menit

**Konsep:** _Build Automation Flow_ (dari slide): `Source → Dependencies → Compile →
Bundle → Artifact`. App kita JS jadi tak perlu compile berat — kita buat tahap
**bundle** (satukan `src/` jadi 1 file output) sebagai artifact nyata yang bisa dideploy.

### 10.1 `scripts/build-bundle.js`
```javascript
// Bundling: satukan semua modul src/ menjadi satu file dist/bundle.js + manifest.
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(distDir, { recursive: true });

// 1) SOURCE: kumpulkan file .js di src/
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.js'));

// 2) COMPILE (validasi sintaks): require tiap modul, gagal = sintaks rusak
for (const f of files) require(path.join(srcDir, f));

// 3) BUNDLE: gabungkan isi semua file
const bundle = files
  .map((f) => `// ==== ${f} ====\n` + fs.readFileSync(path.join(srcDir, f), 'utf8'))
  .join('\n\n');
fs.writeFileSync(path.join(distDir, 'bundle.js'), bundle);

// 4) ARTIFACT: manifest untuk traceability
fs.writeFileSync(
  path.join(distDir, 'manifest.json'),
  JSON.stringify({ files, bytes: Buffer.byteLength(bundle), status: 'ready' }, null, 2)
);

console.log(`🎁 Bundle dibuat: dist/bundle.js (${files.length} modul, ${Buffer.byteLength(bundle)} bytes)`);
```

### 10.2 Tambahkan script di `package.json`
```json
    "bundle": "node scripts/build-bundle.js"
```

### 10.3 Sisipkan ke pipeline `ci.yml` (tambah step di job `build`, setelah `npm run build`)
```yaml
      - name: Bundle (source -> artifact)
        run: npm run bundle
```
Lalu ubah artifact upload agar ikut membawa bundle (opsional):
```yaml
      - if: matrix.node == '20'
        uses: actions/upload-artifact@v4
        with:
          name: build-info
          path: |
            dist/build-info.json
            dist/bundle.js
            dist/manifest.json
```

**Verifikasi:**
```bash
npm run bundle && test -f dist/bundle.js && test -f dist/manifest.json && echo "Flow bundle→artifact OK"
```

**Untuk Pengajar:** cocokkan 4 langkah kode dengan diagram slide "Build Automation Flow".
Tekankan: artifact = hasil akhir siap deploy, bukan sekadar file mentah.

---

## CASE 11 — Notifikasi & Ringkasan Hasil (feedback loop) · ⏱️ 8 menit

**Konsep:** _CI Pipeline Components_ menutup dengan **notify** ke developer (slide
end-to-end: "✅ build passed → Slack"). Kita tulis **Job Summary** (tampil di UI Actions)
+ contoh notifikasi Slack opsional.

Tambahkan job `notify` di `ci.yml` (paling bawah, setelah job `package`):
```yaml
  notify:
    name: Notify hasil
    runs-on: ubuntu-latest
    needs: [build, package]
    if: always()                 # jalan walau ada job gagal, untuk lapor status
    steps:
      - name: Ringkasan ke Job Summary
        run: |
          echo "## Ringkasan CI" >> "$GITHUB_STEP_SUMMARY"
          echo "- Commit: \`${{ github.sha }}\`" >> "$GITHUB_STEP_SUMMARY"
          echo "- Build: ${{ needs.build.result }}" >> "$GITHUB_STEP_SUMMARY"
          echo "- Package: ${{ needs.package.result }}" >> "$GITHUB_STEP_SUMMARY"

      - name: Notifikasi Slack (opsional)
        if: ${{ secrets.SLACK_WEBHOOK != '' }}
        run: |
          STATUS="${{ needs.build.result }}"
          curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"CI ${STATUS}: ${{ github.repository }}@${{ github.sha }}\"}" \
            "${{ secrets.SLACK_WEBHOOK }}"
```

**Study case:**
- Kenapa job notify pakai `if: always()`? (biar tetap lapor saat build gagal)
- Kenapa Slack webhook disimpan sebagai **secret**, bukan ditulis di YAML?

**Verifikasi (struktur):**
```bash
grep -q "GITHUB_STEP_SUMMARY" .github/workflows/ci.yml && echo "OK job summary ditambahkan"
```

**Untuk Pengajar:** ini "loop terakhir" di diagram end-to-end slide — pipeline tak
berguna kalau developer tak tahu hasilnya. Feedback cepat = inti CI.

---

## CASE 12 — Build Validation Lanjutan: Security + Performance Budget · ⏱️ 12 menit

**Konsep:** _Build Validation_ (dari slide) lebih dari sekadar "build sukses". Tambah
2 gerbang: **security scan** (dependency rentan) & **performance budget** (batas ukuran).

### 12.1 Security audit — tambah step di job `build` (`ci.yml`), setelah `npm ci`
```yaml
      - name: Security audit (dependency)
        run: npm audit --audit-level=high
```

### 12.2 Performance budget — `scripts/check-size.js`
```javascript
// Performance budget: gagalkan build jika bundle melebihi batas.
const fs = require('fs');
const path = require('path');

const MAX_BYTES = 50 * 1024; // 50KB (contoh; sesuaikan)
const bundle = path.join(__dirname, '..', 'dist', 'bundle.js');

if (!fs.existsSync(bundle)) {
  console.error('❌ dist/bundle.js belum ada — jalankan `npm run bundle` (Case 10) dulu.');
  process.exit(1);
}
const size = fs.statSync(bundle).size;
console.log(`Bundle: ${(size / 1024).toFixed(1)} KB (budget ${MAX_BYTES / 1024} KB)`);
if (size > MAX_BYTES) {
  console.error('❌ Melebihi performance budget! Perlu refactor / tree-shaking.');
  process.exit(1);
}
console.log('✅ Performance budget LULUS');
```

### 12.3 Tambahkan script + step pipeline
`package.json`:
```json
    "budget": "node scripts/check-size.js"
```
`ci.yml` (di job `build`, setelah `npm run bundle`):
```yaml
      - name: Performance budget
        run: npm run budget
```

**Verifikasi:**
```bash
npm run bundle && npm run budget && npm audit --audit-level=high; echo "Validasi lanjutan selesai"
```
> `npm audit` boleh menemukan isu — yang penting perintahnya jalan & dibahas.

**Study case:**
- Beda "build sukses" vs "build tervalidasi"? (kompilasi jalan ≠ aman & lean)
- Contoh nyata (slide): library besar bikin bundle membengkak → budget gagal → refactor.

**Untuk Pengajar:** hubungkan ke slide "Validation Gates" — setelah build, artifact
lewati gerbang: coverage (Sesi 2) · security · budget. Semua hijau = siap rilis.

---

## 🧯 Troubleshooting (bahan bantu saat murid stuck)

| Gejala | Kemungkinan sebab | Solusi |
|--------|-------------------|--------|
| `npm ci` error "lock file missing" | belum ada `package-lock.json` | jalankan `npm install` sekali |
| Lint error `no-unused-vars` | ada variabel tak terpakai | hapus / pakai variabel |
| Build exit 1 tapi bingung kenapa | validasi gagal | baca pesan `❌` di `validate-build.js` |
| Workflow tidak jalan di GitHub | salah `branches` di `on` | cek nama branch (`main` vs `master`) |
| Matrix cuma jalan 1x | typo di `strategy.matrix` | pastikan indentasi YAML benar |

---

## ✅ Acceptance Criteria (checklist Agent)

- [ ] `npm install` sukses, `package-lock.json` ada.
- [ ] `npm start` → `Halo Dunia`.
- [ ] `npm run lint` lolos.
- [ ] `npm run build` → `✅ Build validation LULUS` + `dist/build-info.json`.
- [ ] `.github/workflows/ci.yml` final: 3 job (`lint`→`build`→`package`) + matrix + artifact.
- [ ] `.github/workflows/triggers-demo.yml` ada (push/PR/schedule/dispatch/paths).
- [ ] `.github/workflows/reusable-node.yml` (punya `workflow_call`) + `nightly.yml` (memanggilnya).
- [ ] `.gitlab-ci.yml` ada.
- [ ] `README.md` ada (badge + tabel + branch protection).
- [ ] Perintah akhir `npm ci && npm run lint && npm run build` lolos.

**Bonus (Blok E — jika dikerjakan):**
- [ ] `npm run bundle` → `dist/bundle.js` + `dist/manifest.json` terbentuk.
- [ ] `ci.yml` punya step bundle + job `notify` (Job Summary, `if: always()`).
- [ ] `npm run budget` lolos + step `npm audit --audit-level=high` di pipeline.

## 🎓 Rangkuman Diskusi Kelas
1. Kenapa build automation > manual? (reproducibility, kecepatan, konsistensi)
2. Anatomi YAML: `on` (trigger) · `jobs`/`steps` (stages).
3. Trigger: push, PR, tag, schedule, manual, path filter.
4. Matrix & fail-fast — jaminan kompatibilitas.
5. Cache vs Artifact — kecepatan vs hasil.
6. `needs` + `if` — membentuk DAG pipeline.
7. Reusable workflow — DRY skala tim.
8. Build validation gate + branch protection — kualitas terjaga otomatis.
9. (Bonus) Build automation flow: source → bundle → artifact.
10. (Bonus) Notify/feedback loop — CI tak berguna tanpa hasil sampai ke developer.
11. (Bonus) Validasi berlapis: build sukses ≠ aman & lean (security + budget).

> **Kalau waktu masih sisa:** lanjut ke `extend/practice-sesi1-extend.md` — 21 case
> yang memetakan seluruh slide deck (Docker multi-stage, publish+tagging+rollback,
> CD deploy, security SCA/SAST/container, monorepo, approval gate, dll).

> **Lanjut Sesi 2:** kita sisipkan **testing** ke pipeline ini + laporan & failure handling.
