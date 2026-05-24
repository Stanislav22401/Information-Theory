const PREVIEW_BYTES = 128;

/**
 * @param {Uint8Array} data
 * @param {number} [maxBytes]
 * @returns {string}
 */
export function bytesToBinaryString(data, maxBytes = PREVIEW_BYTES) {
  const limit = Math.min(data.length, maxBytes);
  const parts = [];
  for (let i = 0; i < limit; i++) {
    parts.push(data[i].toString(2).padStart(8, '0'));
  }
  let text = parts.join(' ');
  if (data.length > limit) {
    text += `\n… (показано ${limit} из ${data.length} байт)`;
  }
  return text;
}

/**
 * @param {Uint8Array} bits — 0/1
 * @param {number} [maxBits]
 * @returns {string}
 */
export function bitsToBinaryString(bits, maxBits = PREVIEW_BYTES * 8) {
  const limit = Math.min(bits.length, maxBits);
  let text = '';
  for (let i = 0; i < limit; i++) {
    if (i > 0 && i % 8 === 0) text += ' ';
    text += bits[i];
  }
  if (bits.length > limit) {
    text += `\n… (показано ${limit} из ${bits.length} бит)`;
  }
  return text;
}
