/** Вариант 7: размерность регистра = степень многочлена 29 */

export const VARIANT = 7;
export const REGISTER_LENGTH = 29;

/** Примитивный многочлен: x^29 + x^27 + 1 (стандартная таблица PN для степени 29) */
export const POLYNOMIAL_LABEL = 'x^29 + x^27 + 1';

/**
 * Отводы для Galois LFSR (степени < n, кроме x^n).
 * Обратная связь: XOR ячеек с индексами 0 и 27.
 */
export const FEEDBACK_TAPS = [0, 27];
