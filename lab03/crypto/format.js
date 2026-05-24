const PREVIEW_BLOCKS = 200;

/**
 * 16-битные блоки файла как числа в десятичной системе.
 * @param {Uint8Array} encrypted — побайтово пара (hi, lo)
 * @param {number} [maxBlocks]
 * @returns {string}
 */
export function encryptedToDecimalString(encrypted, maxBlocks = PREVIEW_BLOCKS) {
  if (encrypted.length % 2 !== 0) {
    return '(некорректная длина файла)';
  }
  const blockCount = encrypted.length / 2;
  const limit = Math.min(blockCount, maxBlocks);
  const parts = [];
  for (let i = 0; i < limit; i++) {
    const v = (encrypted[i * 2] << 8) | encrypted[i * 2 + 1];
    parts.push(String(v));
  }
  let text = parts.join(' ');
  if (blockCount > limit) {
    text += `\n… (показано ${limit} из ${blockCount} блоков)`;
  }
  return text;
}
