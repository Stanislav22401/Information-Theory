/** Вариант 7: размерность регистра = степень многочлена 29 */

export const VARIANT = 7;
export const REGISTER_LENGTH = 29;

/** Примитивный многочлен: x^29 + x^2 + 1 */
export const POLYNOMIAL_LABEL = 'x^29 + x^2 + 1';

/**
 * Отводы для Galois LFSR (степени < n, кроме x^n).
 * Обратная связь: XOR ячеек с индексами 0 и 2.
 */
export const FEEDBACK_TAPS = [0, 2];
