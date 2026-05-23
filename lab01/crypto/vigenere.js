import { ALPHABET, ALPHABET_SIZE, charToIndex, filterRussian, normalizeKey } from './alphabet.js';

/**
 * Виженер с самогенерирующимся ключом (autokey по открытому тексту).
 */
export function vigenereAutokey(text, key, encrypt) {
  const t = filterRussian(text);
  if (!t) throw new Error('В тексте нет русских букв.');
  const k = normalizeKey(key);
  const keyLen = k.length;
  let result = '';
  const decrypted = [];

  for (let i = 0; i < t.length; i++) {
    const pIdx = charToIndex.get(t[i]);
    let keyIdx;
    if (i < keyLen) {
      keyIdx = charToIndex.get(k[i]);
    } else if (encrypt) {
      keyIdx = charToIndex.get(t[i - keyLen]);
    } else {
      keyIdx = charToIndex.get(decrypted[i - keyLen]);
    }

    let outIdx;
    if (encrypt) {
      outIdx = (pIdx + keyIdx) % ALPHABET_SIZE;
    } else {
      outIdx = (pIdx - keyIdx + ALPHABET_SIZE) % ALPHABET_SIZE;
      decrypted.push(ALPHABET[outIdx]);
    }
    result += ALPHABET[outIdx];
  }
  return result;
}
