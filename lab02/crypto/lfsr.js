import { REGISTER_LENGTH, FEEDBACK_TAPS } from './variant.js';

/**
 * Оставляет только символы 0 и 1.
 * @param {string} raw
 * @returns {string}
 */
export function filterBinaryDigits(raw) {
  let out = '';
  for (const ch of raw) {
    if (ch === '0' || ch === '1') out += ch;
  }
  return out;
}

/**
 * @param {string} bits — строка из 0/1 длины REGISTER_LENGTH
 * @returns {number[]}
 */
export function parseInitialState(bits) {
  const b = filterBinaryDigits(bits);
  if (b.length !== REGISTER_LENGTH) {
    throw new Error(`Начальное состояние: ровно ${REGISTER_LENGTH} бит (0 и 1). Сейчас: ${b.length}.`);
  }
  if (!/[1]/.test(b)) {
    throw new Error('Начальное состояние не может быть нулевым.');
  }
  return [...b].map((c) => Number(c));
}

/**
 * Galois LFSR: сдвиг вправо, новый бит на позиции n−1.
 * Выходной бит — младший разряд (позиция 0) перед сдвигом.
 */
export class Lfsr {
  /** @param {number[]} initialState */
  constructor(initialState) {
    if (initialState.length !== REGISTER_LENGTH) {
      throw new Error(`Длина регистра должна быть ${REGISTER_LENGTH}.`);
    }
    this.state = initialState.slice();
    this.taps = FEEDBACK_TAPS;
  }

  /** @returns {0|1} */
  nextBit() {
    const out = this.state[0];
    let feedback = 0;
    for (const tap of this.taps) {
      feedback ^= this.state[tap];
    }
    for (let i = 0; i < REGISTER_LENGTH - 1; i++) {
      this.state[i] = this.state[i + 1];
    }
    this.state[REGISTER_LENGTH - 1] = feedback;
    return out;
  }

  /**
   * Генерирует битовый ключ для заданного числа бит.
   * @param {number} bitCount
   * @returns {Uint8Array} массив 0/1
   */
  generateBits(bitCount) {
    const bits = new Uint8Array(bitCount);
    for (let i = 0; i < bitCount; i++) {
      bits[i] = this.nextBit();
    }
    return bits;
  }
}
