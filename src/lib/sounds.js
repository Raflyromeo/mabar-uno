const audioCache = {};

const getAudio = (path) => {
  if (!audioCache[path]) {
    const audio = new Audio(path);
    audio.preload = 'auto';
    audioCache[path] = audio;
  }
  return audioCache[path];
};

const safePlay = (path) => {
  const base = getAudio(path);
  const clone = base.cloneNode(true);
  clone.volume = 0.9;
  clone.play().catch(() => {});
};

export function playUnoSound() {
  safePlay('/sound-effect/Uno - Sound Effect.mp3');
}

export function playWinSound() {
  safePlay('/sound-effect/win.mp3');
}
