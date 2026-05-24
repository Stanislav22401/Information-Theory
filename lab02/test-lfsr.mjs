import { Lfsr, parseInitialState } from './crypto/lfsr.js';
import { streamTransform } from './crypto/streamCipher.js';
import { REGISTER_LENGTH } from './crypto/variant.js';

const state = parseInitialState('1' + '0'.repeat(REGISTER_LENGTH - 1));
const lfsr = new Lfsr(state);
const bits = lfsr.generateBits(16);
console.log('first 16 bits:', [...bits].join(''));

const data = new Uint8Array([0x48, 0x69]);
const init = '1' + '0'.repeat(28);
const { output: enc, keyBits } = streamTransform(data, init);
const { output: dec } = streamTransform(enc, init);

if (dec[0] !== data[0] || dec[1] !== data[1]) {
  console.error('round-trip FAIL', dec);
  process.exit(1);
}
if (keyBits.length !== 16) {
  console.error('key length FAIL');
  process.exit(1);
}
console.log('stream round-trip OK');

try {
  parseInitialState('0'.repeat(29));
  console.error('zero state should fail');
  process.exit(1);
} catch {
  console.log('zero state rejected OK');
}

console.log('All tests passed');
