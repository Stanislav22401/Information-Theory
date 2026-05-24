import { REGISTER_LENGTH, POLYNOMIAL_LABEL, VARIANT } from './crypto/variant.js';
import { filterBinaryDigits } from './crypto/lfsr.js';
import { streamTransform } from './crypto/streamCipher.js';
import { bytesToBinaryString, bitsToBinaryString } from './crypto/binary.js';

const $ = (id) => document.getElementById(id);

const modeSelect = $('mode');
const stateInput = $('register-state');
const fileInput = $('file-input');
const fileNameEl = $('file-name');
const keyOutput = $('key-output');
const inputBinary = $('input-binary');
const outputBinary = $('output-binary');
const statusEl = $('status');
const btnProcess = $('btn-process');
const btnDownload = $('btn-download');

/** @type {Uint8Array|null} */
let loadedFile = null;
/** @type {string} */
let loadedFileName = '';
/** @type {Uint8Array|null} */
let resultFile = null;

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = 'status' + (type ? ` ${type}` : '');
}

function onStateInput() {
  const filtered = filterBinaryDigits(stateInput.value);
  if (stateInput.value !== filtered) {
    stateInput.value = filtered;
  }
  const len = filtered.length;
  $('state-len').textContent = `${len} / ${REGISTER_LENGTH}`;
  $('state-len').classList.toggle('is-invalid', len > 0 && len !== REGISTER_LENGTH);
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    loadedFile = new Uint8Array(reader.result);
    loadedFileName = file.name;
    fileNameEl.textContent = `${file.name} (${loadedFile.length} байт)`;
    resultFile = null;
    btnDownload.disabled = true;
    keyOutput.value = '';
    inputBinary.value = '';
    outputBinary.value = '';
    setStatus('Файл загружен.', 'ok');
    fileInput.value = '';
  };
  reader.onerror = () => {
    setStatus('Ошибка чтения файла.', 'err');
    fileInput.value = '';
  };
  reader.readAsArrayBuffer(file);
});

stateInput.addEventListener('input', onStateInput);

btnProcess.addEventListener('click', () => {
  setStatus('');
  if (!loadedFile || loadedFile.length === 0) {
    setStatus('Загрузите файл.', 'err');
    return;
  }

  try {
    const { output, keyBits } = streamTransform(loadedFile, stateInput.value);
    resultFile = output;

    keyOutput.value = bitsToBinaryString(keyBits);
    inputBinary.value = bytesToBinaryString(loadedFile);
    outputBinary.value = bytesToBinaryString(output);

    btnDownload.disabled = false;
    const mode = modeSelect.value === 'encrypt' ? 'Зашифровано' : 'Расшифровано';
    setStatus(`${mode}: ${loadedFile.length} байт.`, 'ok');
  } catch (e) {
    resultFile = null;
    btnDownload.disabled = true;
    keyOutput.value = '';
    outputBinary.value = '';
    setStatus(e.message || String(e), 'err');
  }
});

btnDownload.addEventListener('click', () => {
  if (!resultFile) return;
  const encrypt = modeSelect.value === 'encrypt';
  const base = loadedFileName.replace(/\.[^/.]+$/, '') || 'file';
  const ext = loadedFileName.includes('.') ? loadedFileName.slice(loadedFileName.lastIndexOf('.')) : '';

  const blob = new Blob([resultFile], { type: 'application/octet-stream' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = encrypt ? `${base}.enc` : `${base}.dec${ext}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
  setStatus('Файл сохранён.', 'ok');
});

$('poly-label').textContent = POLYNOMIAL_LABEL;
$('variant-label').textContent = String(VARIANT);
$('register-len').textContent = String(REGISTER_LENGTH);
stateInput.maxLength = REGISTER_LENGTH + 32;
onStateInput();
