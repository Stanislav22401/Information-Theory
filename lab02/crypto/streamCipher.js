import { Lfsr, parseInitialState } from './lfsr.js';

/**
 * Потоковое шифрование: XOR файла с гаммой LFSR (8 бит на байт).
 * @param {Uint8Array} data
 * @param {string} initialStateBits
 * @returns {{ output: Uint8Array, keyBits: Uint8Array }}
 */
export function streamTransform(data, initialStateBits) {
  const state = parseInitialState(initialStateBits);
  const lfsr = new Lfsr(state);
  const bitCount = data.length * 8;
  const keyBits = lfsr.generateBits(bitCount);
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    let keyByte = 0;
    for (let b = 0; b < 8; b++) {
      keyByte = (keyByte << 1) | keyBits[i * 8 + b];
    }
    output[i] = data[i] ^ keyByte;
  }

  return { output, keyBits };
}
