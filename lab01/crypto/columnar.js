import { filterRussian, normalizeKey } from './alphabet.js';

/**
 * Порядок столбцов по ключу (стабильная сортировка при равных буквах).
 */
function columnOrder(keyword) {
  const cols = keyword.length;
  const order = [...Array(cols).keys()];
  order.sort((a, b) => {
    const ca = keyword[a];
    const cb = keyword[b];
    if (ca !== cb) return ca.localeCompare(cb, 'ru');
    return a - b;
  });
  return order;
}

/** Длина каждого столбца при записи текста построчно. */
function columnHeights(totalLen, cols, rows) {
  const heights = new Array(cols).fill(rows);
  const rem = totalLen % cols;
  if (rem !== 0) {
    for (let c = rem; c < cols; c++) heights[c] = rows - 1;
  }
  return heights;
}

/**
 * Столбцовый шифр: запись построчно, чтение по столбцам в порядке ключа.
 */
function columnarTransform(text, keyword, encrypt) {
  const cols = keyword.length;
  const rows = Math.ceil(text.length / cols);
  const order = columnOrder(keyword);
  const heights = columnHeights(text.length, cols, rows);

  if (encrypt) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (idx < text.length) grid[r][c] = text[idx++];
      }
    }
    let result = '';
    for (const c of order) {
      for (let r = 0; r < heights[c]; r++) {
        result += grid[r][c];
      }
    }
    return result;
  }

  const columns = Array.from({ length: cols }, () => []);
  let idx = 0;
  for (const c of order) {
    for (let r = 0; r < heights[c]; r++) {
      columns[c].push(text[idx++]);
    }
  }

  let result = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (columns[c].length > 0) result += columns[c].shift();
    }
  }
  return result;
}

/**
 * Столбцовый метод с двумя ключевыми словами (двойная перестановка).
 */
export function columnarDouble(text, key1, key2, encrypt) {
  const t = filterRussian(text);
  if (!t) throw new Error('В тексте нет русских букв.');
  const k1 = normalizeKey(key1);
  const k2 = normalizeKey(key2);
  if (encrypt) {
    return columnarTransform(columnarTransform(t, k1, true), k2, true);
  }
  return columnarTransform(columnarTransform(t, k2, false), k1, false);
}
