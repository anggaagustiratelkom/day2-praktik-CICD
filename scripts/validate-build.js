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