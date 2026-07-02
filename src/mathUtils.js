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