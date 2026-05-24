import {
  computePublicKey,
  encryptFileBytes,
  decryptFileBlocks,
  validateDecryptParams,
} from './crypto/rsa.js';
import { encryptedToDecimalString } from './crypto/format.js';

const $ = (id) => document.getElementById(id);

/** @type {bigint|null} */
let encKo = null;
/** @type {bigint|null} */
let encN = null;
/** @type {Uint8Array|null} */
let encPlain = null;
/** @type {Uint8Array|null} */
let encResult = null;
/** @type {string} */
let encResultName = '';

/** @type {Uint8Array|null} */
let decCipher = null;
/** @type {Uint8Array|null} */
let decResult = null;
/** @type {string} */
let decSourceName = '';
/** @type {string} */
let decResultDownloadName = 'decrypted.bin';

function setStatus(el, message, type = '') {
  el.textContent = message;
  el.className = 'status' + (type ? ` ${type}` : '');
}

function downloadBytes(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ——— Вкладки ———
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.toggle('is-active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    $('panel-encrypt').classList.toggle('hidden', tab.dataset.tab !== 'encrypt');
    $('panel-decrypt').classList.toggle('hidden', tab.dataset.tab !== 'decrypt');
  });
});

// ——— Шифрование ———
const encStatus = $('enc-status');

function updateKeyInfo(ko, n, phi) {
  $('enc-key-info').textContent = `KO (e): ${ko} · r = p·q: ${n} · φ(r): ${phi}`;
}

$('btn-enc-calc').addEventListener('click', () => {
  setStatus(encStatus, '');
  try {
    const { ko, n, phi } = computePublicKey($('enc-p').value, $('enc-q').value, $('enc-kc').value);
    encKo = ko;
    encN = n;
    updateKeyInfo(ko, n, phi);
    setStatus(encStatus, 'Открытый ключ KO вычислен.', 'ok');
  } catch (e) {
    encKo = null;
    encN = null;
    $('enc-key-info').textContent = 'KO (e): — · r = p·q: — · φ(r): —';
    setStatus(encStatus, e.message || String(e), 'err');
  }
});

$('enc-file-input').addEventListener('change', () => {
  const file = $('enc-file-input').files?.[0];
  if (!file) return;
  if (!$('enc-filename').value.trim()) {
    $('enc-filename').value = file.name;
  }
  const reader = new FileReader();
  reader.onload = () => {
    encPlain = new Uint8Array(reader.result);
    $('enc-file-meta').textContent = `${file.name} (${encPlain.length} байт)`;
    encResult = null;
    $('btn-enc-download').disabled = true;
    $('enc-decimal').value = '';
    setStatus(encStatus, 'Файл загружен.', 'ok');
    $('enc-file-input').value = '';
  };
  reader.onerror = () => setStatus(encStatus, 'Ошибка чтения файла.', 'err');
  reader.readAsArrayBuffer(file);
});

$('btn-enc-run').addEventListener('click', () => {
  setStatus(encStatus, '');
  const name = $('enc-filename').value.trim();
  if (!name) {
    setStatus(encStatus, 'Укажите имя входного файла.', 'err');
    return;
  }
  if (!encPlain || encPlain.length === 0) {
    setStatus(encStatus, 'Выберите входной файл.', 'err');
    return;
  }

  try {
    const { ko, n, phi } = computePublicKey($('enc-p').value, $('enc-q').value, $('enc-kc').value);
    encKo = ko;
    encN = n;
    updateKeyInfo(ko, n, phi);

    encResult = encryptFileBytes(encPlain, ko, n);
    const base = name.replace(/\.[^/.]+$/, '') || 'file';
    encResultName = `${base}.rsa.enc`;

    $('enc-decimal').value = encryptedToDecimalString(encResult);
    $('btn-enc-download').disabled = false;
    setStatus(
      encStatus,
      `Зашифровано «${name}»: ${encPlain.length} байт → ${encResult.length} байт (${encPlain.length} блоков по 16 бит).`,
      'ok'
    );
  } catch (e) {
    encResult = null;
    $('btn-enc-download').disabled = true;
    $('enc-decimal').value = '';
    setStatus(encStatus, e.message || String(e), 'err');
  }
});

$('btn-enc-download').addEventListener('click', () => {
  if (!encResult) return;
  downloadBytes(encResult, encResultName);
  setStatus(encStatus, 'Зашифрованный файл сохранён.', 'ok');
});

// ——— Дешифрование ———
const decStatus = $('dec-status');

$('dec-file-input').addEventListener('change', () => {
  const file = $('dec-file-input').files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    decCipher = new Uint8Array(reader.result);
    decSourceName = file.name;
    $('dec-file-meta').textContent = `${file.name} (${decCipher.length} байт)`;
    decResult = null;
    $('btn-dec-download').disabled = true;
    setStatus(decStatus, 'Файл загружен.', 'ok');
    $('dec-file-input').value = '';
  };
  reader.onerror = () => setStatus(decStatus, 'Ошибка чтения файла.', 'err');
  reader.readAsArrayBuffer(file);
});

$('btn-dec-run').addEventListener('click', () => {
  setStatus(decStatus, '');
  if (!decCipher || decCipher.length === 0) {
    setStatus(decStatus, 'Выберите зашифрованный файл.', 'err');
    return;
  }

  try {
    const { n, d } = validateDecryptParams($('dec-r').value, $('dec-kc').value);
    decResult = decryptFileBlocks(decCipher, d, n);
    $('btn-dec-download').disabled = false;
    const base = decSourceName.replace(/\.rsa\.enc$/i, '').replace(/\.enc$/i, '') || 'decrypted';
    decResultDownloadName = `${base}.dec`;
    setStatus(
      decStatus,
      `Расшифровано: ${decCipher.length} байт → ${decResult.length} байт.`,
      'ok'
    );
  } catch (e) {
    decResult = null;
    $('btn-dec-download').disabled = true;
    setStatus(decStatus, e.message || String(e), 'err');
  }
});

$('btn-dec-download').addEventListener('click', () => {
  if (!decResult) return;
  const name = decResultDownloadName;
  downloadBytes(decResult, name);
  setStatus(decStatus, 'Расшифрованный файл сохранён.', 'ok');
});
