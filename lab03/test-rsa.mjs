import { computePublicKey, encryptFileBytes, decryptFileBlocks } from './crypto/rsa.js';
import { modPow } from './crypto/math.js';

// Пример: P=131, Q=227, d=3 (форум СИБГУТИ)
const { ko, n, kc } = computePublicKey(131, 227, 3);
console.log('n=', n, 'e=', ko, 'd=', kc);

const plain = new Uint8Array([72, 105]);
const enc = encryptFileBytes(plain, ko, n);
const dec = decryptFileBlocks(enc, kc, n);

if (dec[0] !== 72 || dec[1] !== 105) {
  console.error('round-trip FAIL', dec);
  process.exit(1);
}

// m=11111, c = m^e mod n
const m = 11111n;
const c = modPow(m, ko, n);
const m2 = modPow(c, kc, n);
if (m2 !== m) {
  console.error('modPow FAIL', m2);
  process.exit(1);
}

console.log('All tests passed');
