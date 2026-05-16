let audioEl: HTMLAudioElement | null = null;
let audioUrl: string | null = null;

function createClickWav(): Blob {
  const sampleRate = 8000;
  const duration = 0.035;
  const numSamples = Math.floor(sampleRate * duration);
  const channels = 1;
  const bitsPerSample = 16;
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 100);
    const sample = Math.sin(2 * Math.PI * 800 * t) * env * 0.8;
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function getAudioElement(): HTMLAudioElement | null {
  if (audioEl) return audioEl;

  try {
    const blob = createClickWav();
    audioUrl = URL.createObjectURL(blob);
    audioEl = new Audio(audioUrl);
    audioEl.preload = 'auto';
    audioEl.volume = 0.9;
    return audioEl;
  } catch {
    return null;
  }
}

/**
 * Вызови внутри обработчика жеста (click/touchstart).
 * На iOS элемент <audio> заблокирован до первого программного play() в жесте.
 */
export function ensureHapticContext(): void {
  if (typeof navigator.vibrate === 'function') return;

  const el = getAudioElement();
  if (!el) return;

  const saved = el.volume;
  el.volume = 0;
  el.play()
    .then(() => {
      el!.pause();
      el!.currentTime = 0;
      el!.volume = saved;
    })
    .catch(() => {});
}

export function triggerHaptic(_duration = 200): void {
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(_duration);
    return;
  }

  const el = getAudioElement();
  if (!el) return;

  el.currentTime = 0;
  el.play().catch(() => {});
}
