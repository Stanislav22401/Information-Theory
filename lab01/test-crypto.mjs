import { filterRussian } from './crypto/alphabet.js';
import { columnarDouble } from './crypto/columnar.js';
import { vigenereAutokey } from './crypto/vigenere.js';

function assertRoundTrip(name, fn, text, ...keys) {
  const enc = fn(text, ...keys, true);
  const dec = fn(enc, ...keys, false);
  if (dec !== filterRussian(text)) {
    console.error(name, 'FAIL');
    console.error('  in:', filterRussian(text));
    console.error('  enc:', enc);
    console.error('  dec:', dec);
    process.exit(1);
  }
  console.log(name, 'OK', `len=${filterRussian(text).length}`);
}

assertRoundTrip('columnar', columnarDouble, 'ПРИМЕР ТЕКСТА ДЛЯ ПРОВЕРКИ ШИФРОВАНИЯ', 'ключ', 'шифр');
assertRoundTrip('columnar-short', columnarDouble, 'АБВ', 'ка', 'бв');
assertRoundTrip('vigenere', vigenereAutokey, 'СООБЩЕНИЕ СЕКРЕТНОЕ', 'тайна');
assertRoundTrip('vigenere-long', vigenereAutokey, 'А'.repeat(50), 'ключ');

console.log('All tests passed');
