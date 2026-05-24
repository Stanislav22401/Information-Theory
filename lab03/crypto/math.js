/**
 * Быстрое возведение в степень: base^exp mod mod.
 * @param {bigint} base
 * @param {bigint} exp
 * @param {bigint} mod
 * @returns {bigint}
 */
export function modPow(base, exp, mod) {
  if (mod === 1n) return 0n;
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    e >>= 1n;
    b = (b * b) % mod;
  }
  return result;
}

/**
 * Расширенный алгоритм Евклида: gcd(a,b) и коэффициенты x,y: a*x + b*y = gcd.
 * @param {bigint} a
 * @param {bigint} b
 * @returns {{ gcd: bigint, x: bigint, y: bigint }}
 */
export function extendedGcd(a, b) {
  if (b === 0n) {
    return { gcd: a, x: 1n, y: 0n };
  }
  const { gcd, x: x1, y: y1 } = extendedGcd(b, a % b);
  return {
    gcd,
    x: y1,
    y: x1 - (a / b) * y1,
  };
}

/**
 * @param {bigint} a
 * @param {bigint} m
 * @returns {bigint}
 */
export function modInverse(a, m) {
  const { gcd, x } = extendedGcd(((a % m) + m) % m, m);
  if (gcd !== 1n) {
    throw new Error('Обратный элемент не существует (НОД ≠ 1).');
  }
  return ((x % m) + m) % m;
}

/** @param {bigint} a @param {bigint} b */
export function gcd(a, b) {
  return extendedGcd(a, b).gcd;
}

/**
 * @param {bigint} n
 * @returns {boolean}
 */
export function isProbablePrime(n) {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;
  const small = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  for (const p of small) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }
  const witnesses = [2n, 3n, 5n, 7n, 11n];
  for (const a of witnesses) {
    if (a % n === 0n) continue;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = (x * x) % n;
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

/**
 * @param {string|number|bigint} value
 * @returns {bigint}
 */
export function parseBigInt(value) {
  const s = String(value).trim();
  if (!/^\d+$/.test(s)) {
    throw new Error('Ожидается целое неотрицательное число.');
  }
  return BigInt(s);
}
