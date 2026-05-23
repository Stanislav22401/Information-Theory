/** Русский алфавит (33 буквы, Ё после Е) */
export const ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
export const ALPHABET_SIZE = ALPHABET.length;
export const charToIndex = new Map([...ALPHABET].map((ch, i) => [ch, i]));

/**
 * Оставляет только русские буквы, приводит к верхнему регистру.
 * @param {string} text
 * @returns {string}
 */
export function filterRussian(text) {
  const upper = text.toUpperCase();
  let out = '';
  for (const ch of upper) {
    if (charToIndex.has(ch)) out += ch;
  }
  return out;
}

/**
 * Ключ только из букв алфавита.
 * @param {string} key
 * @returns {string}
 */
export function normalizeKey(key) {
  const k = filterRussian(key);
  if (!k) throw new Error('Ключ должен содержать хотя бы одну русскую букву.');
  return k;
}
