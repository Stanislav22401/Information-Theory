import { gcd, modInverse, modPow, parseBigInt, isProbablePrime } from './math.js';

/**
 * @param {bigint} p
 * @param {bigint} q
 * @param {bigint} kc — закрытый ключ d
 */
export function validateEncryptParams(p, q, kc) {
  if (p < 2n) throw new Error('p должно быть простым числом ≥ 2.');
  if (q < 2n) throw new Error('q должно быть простым числом ≥ 2.');
  if (p === q) throw new Error('p и q должны быть различны.');
  if (!isProbablePrime(p)) throw new Error('p не является простым числом.');
  if (!isProbablePrime(q)) throw new Error('q не является простым числом.');

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (n <= 255n) {
    throw new Error('Модуль r = p·q должен быть > 255 (для побайтового шифрования 8 бит).');
  }
  if (kc <= 1n || kc >= phi) {
    throw new Error(`KС (d) должно быть в интервале (1, φ(r)), φ(r) = ${phi}.`);
  }
  if (gcd(kc, phi) !== 1n) {
    throw new Error('НОД(KС, φ(r)) должен быть равен 1.');
  }

  return { n, phi };
}

/**
 * Вычисление открытого ключа KO (e) по p, q и закрытому KС (d).
 * @returns {{ ko: bigint, n: bigint, phi: bigint }}
 */
export function computePublicKey(p, q, kc) {
  const pb = parseBigInt(p);
  const qb = parseBigInt(q);
  const d = parseBigInt(kc);
  const { n, phi } = validateEncryptParams(pb, qb, d);
  const ko = modInverse(d, phi);
  return { ko, n, phi, p: pb, q: qb, kc: d };
}

/**
 * @param {bigint} r — модуль n
 * @param {bigint} kc — закрытый ключ d
 */
export function validateDecryptParams(r, kc) {
  const n = parseBigInt(r);
  const d = parseBigInt(kc);
  if (n < 256n) throw new Error('Модуль r должен быть > 255.');
  if (d <= 1n) throw new Error('KС (d) должно быть > 1.');
  if (d >= n) throw new Error('KС (d) должно быть < r.');
  return { n, d };
}

/**
 * Побайтовое шифрование: каждый байт → 16-битный блок (big-endian).
 * @param {Uint8Array} data
 * @param {bigint} ko — e
 * @param {bigint} n
 * @returns {Uint8Array}
 */
export function encryptFileBytes(data, ko, n) {
  const out = new Uint8Array(data.length * 2);
  for (let i = 0; i < data.length; i++) {
    const m = BigInt(data[i]);
    if (m >= n) {
      throw new Error(`Байт ${m} ≥ r (${n}). Увеличьте p и q.`);
    }
    const c = modPow(m, ko, n);
    out[i * 2] = Number((c >> 8n) & 0xffn);
    out[i * 2 + 1] = Number(c & 0xffn);
  }
  return out;
}

/**
 * Расшифрование: 16-битные блоки → байты.
 * @param {Uint8Array} data — длина кратна 2
 * @param {bigint} kc — d
 * @param {bigint} n — r
 * @returns {Uint8Array}
 */
export function decryptFileBlocks(data, kc, n) {
  if (data.length % 2 !== 0) {
    throw new Error('Размер зашифрованного файла должен быть чётным (блоки по 16 бит).');
  }
  const out = new Uint8Array(data.length / 2);
  for (let i = 0; i < out.length; i++) {
    const c = (BigInt(data[i * 2]) << 8n) | BigInt(data[i * 2 + 1]);
    if (c >= n) {
      throw new Error(`Блок ${c} ≥ r (${n}) на позиции ${i}.`);
    }
    const m = modPow(c, kc, n);
    if (m > 255n) {
      throw new Error(`Расшифрованное значение ${m} > 255 на позиции ${i}.`);
    }
    out[i] = Number(m);
  }
  return out;
}
