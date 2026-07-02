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