import { filterRussian } from './crypto/alphabet.js';
import { columnarDouble } from './crypto/columnar.js';
import { vigenereAutokey } from './crypto/vigenere.js';

const $ = (id) => document.getElementById(id);

const algorithmSelect = $('algorithm');
const modeSelect = $('mode');
const keysColumnar = $('keys-columnar');
const keysVigenere = $('keys-vigenere');
const inputText = $('input-text');
const outputText = $('output-text');
const statusEl = $('status');
const btnProcess = $('btn-process');
const btnClear = $('btn-clear');
const btnDownload = $('btn-download');
const btnCopy = $('btn-copy');
const fileInput = $('file-input');

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = 'status' + (type ? ` ${type}` : '');
}

function updateAlgorithmUI() {
  const isColumnar = algorithmSelect.value === 'columnar';
  keysColumnar.classList.toggle('hidden', !isColumnar);
  keysVigenere.classList.toggle('hidden', isColumnar);
}

function setOutput(text) {
  outputText.value = text;
  const has = text.length > 0;
  btnDownload.disabled = !has;
  btnCopy.disabled = !has;
}

function process() {
  setStatus('');
  const encrypt = modeSelect.value === 'encrypt';
  const raw = inputText.value;

  try {
    let result;
    if (algorithmSelect.value === 'columnar') {
      const k1 = $('key1').value;
      const k2 = $('key2').value;
      if (!k1.trim() || !k2.trim()) {
        throw new Error('Введите оба ключевых слова.');
      }
      result = columnarDouble(raw, k1, k2, encrypt);
    } else {
      const k = $('key-vigenere').value;
      if (!k.trim()) throw new Error('Введите начальный ключ.');
      result = vigenereAutokey(raw, k, encrypt);
    }

    const filteredIn = filterRussian(raw);
    setOutput(result);
    setStatus(
      `${encrypt ? 'Зашифровано' : 'Расшифровано'}: ${filteredIn.length} → ${result.length} букв.`,
      'ok'
    );
  } catch (e) {
    setOutput('');
    setStatus(e.message || String(e), 'err');
  }
}

function downloadResult() {
  const text = outputText.value;
  if (!text) return;
  const mode = modeSelect.value === 'encrypt' ? 'encrypted' : 'decrypted';
  const algo = algorithmSelect.value === 'columnar' ? 'columnar' : 'vigenere';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `${algo}_${mode}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
  setStatus('Файл сохранён.', 'ok');
}

async function copyResult() {
  const text = outputText.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setStatus('Результат скопирован в буфер обмена.', 'ok');
  } catch {
    setStatus('Не удалось скопировать (разрешите доступ к буферу).', 'err');
  }
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    inputText.value = String(reader.result ?? '');
    setStatus(`Загружен файл: ${file.name}`, 'ok');
    fileInput.value = '';
  };
  reader.onerror = () => {
    setStatus('Ошибка чтения файла.', 'err');
    fileInput.value = '';
  };
  reader.readAsText(file, 'UTF-8');
});

algorithmSelect.addEventListener('change', updateAlgorithmUI);
btnProcess.addEventListener('click', process);
btnClear.addEventListener('click', () => {
  inputText.value = '';
  setOutput('');
  setStatus('');
});
btnDownload.addEventListener('click', downloadResult);
btnCopy.addEventListener('click', copyResult);

updateAlgorithmUI();
