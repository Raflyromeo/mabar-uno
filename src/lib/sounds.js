const ctx = () => new (window.AudioContext || window.webkitAudioContext)();

export function playUnoSound() {
  const ac = ctx();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.1);
    gain.gain.setValueAtTime(0, ac.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.35, ac.currentTime + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.1 + 0.25);
    osc.start(ac.currentTime + i * 0.1);
    osc.stop(ac.currentTime + i * 0.1 + 0.3);
  });
}

export function playWinSound() {
  const ac = ctx();
  const melody = [
    [523.25, 0],
    [659.25, 0.15],
    [783.99, 0.30],
    [1046.5, 0.45],
    [1318.5, 0.60],
    [1568.0, 0.75],
    [2093.0, 0.95],
  ];
  melody.forEach(([freq, t]) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ac.currentTime + t);
    gain.gain.setValueAtTime(0, ac.currentTime + t);
    gain.gain.linearRampToValueAtTime(0.4, ac.currentTime + t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.4);
    osc.start(ac.currentTime + t);
    osc.stop(ac.currentTime + t + 0.5);
  });
}
