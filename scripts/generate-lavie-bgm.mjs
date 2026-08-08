import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const lameBundle = readFileSync(require.resolve("lamejs/lame.all.js"), "utf8");
const lamejs = new Function(`${lameBundle}; return lamejs;`)();

const sampleRate = 32000;
const outputDir = path.join(process.cwd(), "public", "audio", "concepts");

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function frequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function panGains(pan) {
  const angle = ((pan + 1) * Math.PI) / 4;
  return [Math.cos(angle), Math.sin(angle)];
}

function createTrack(duration) {
  const length = Math.ceil(duration * sampleRate);
  return { duration, left: new Float32Array(length), right: new Float32Array(length) };
}

function addTone(track, {
  midi,
  start,
  duration,
  gain = 0.2,
  pan = 0,
  attack = 0.02,
  release = 0.25,
  color = "warm",
}) {
  const from = Math.max(0, Math.floor(start * sampleRate));
  const to = Math.min(track.left.length, Math.ceil((start + duration + release) * sampleRate));
  const hz = frequency(midi);
  const [leftGain, rightGain] = panGains(pan);

  for (let index = from; index < to; index += 1) {
    const time = index / sampleRate - start;
    const sustainEnd = Math.max(attack, duration);
    let envelope;
    if (time < attack) envelope = time / attack;
    else if (time < sustainEnd) envelope = 1 - (time - attack) / Math.max(0.01, sustainEnd - attack) * 0.25;
    else envelope = Math.max(0, 0.75 * (1 - (time - sustainEnd) / release));

    const phase = Math.PI * 2 * hz * time;
    let wave;
    if (color === "bass") {
      wave = Math.sin(phase) * 0.78 + Math.sin(phase * 2) * 0.15 + Math.sin(phase * 3) * 0.07;
    } else if (color === "glass") {
      wave = Math.sin(phase) * 0.58 + Math.sin(phase * 2.01) * 0.2 + Math.sin(phase * 3.99) * 0.12;
      envelope *= Math.exp(-time * 1.1);
    } else if (color === "pluck") {
      wave = Math.sin(phase) * 0.48 + Math.sin(phase * 2) * 0.3 + Math.sin(phase * 3) * 0.12;
      envelope *= Math.exp(-time * 2.6);
    } else {
      wave = Math.sin(phase) * 0.64 + Math.sin(phase * 2) * 0.18 + Math.sin(phase * 0.5) * 0.12;
    }

    const sample = wave * envelope * gain;
    track.left[index] += sample * leftGain;
    track.right[index] += sample * rightGain;
  }
}

function addChord(track, notes, start, duration, gain = 0.12, spread = 0.5, color = "warm") {
  notes.forEach((midi, index) => {
    const pan = notes.length === 1 ? 0 : -spread + (index / (notes.length - 1)) * spread * 2;
    addTone(track, { midi, start, duration, gain, pan, attack: color === "warm" ? 0.16 : 0.025, release: 0.7, color });
  });
}

function addKick(track, start, gain = 0.55) {
  const length = Math.floor(sampleRate * 0.48);
  const from = Math.floor(start * sampleRate);
  for (let offset = 0; offset < length && from + offset < track.left.length; offset += 1) {
    const time = offset / sampleRate;
    const phase = Math.PI * 2 * (48 * time + 62 * (1 - Math.exp(-time * 22)) / 22);
    const click = Math.exp(-time * 75) * Math.sin(Math.PI * 2 * 950 * time) * 0.12;
    const sample = (Math.sin(phase) * Math.exp(-time * 10) + click) * gain;
    track.left[from + offset] += sample;
    track.right[from + offset] += sample;
  }
}

function addSnare(track, start, random, gain = 0.28, pan = 0) {
  const length = Math.floor(sampleRate * 0.32);
  const from = Math.floor(start * sampleRate);
  const [leftGain, rightGain] = panGains(pan);
  let noiseState = 0;
  for (let offset = 0; offset < length && from + offset < track.left.length; offset += 1) {
    const time = offset / sampleRate;
    noiseState = noiseState * 0.25 + (random() * 2 - 1) * 0.75;
    const noise = noiseState * Math.exp(-time * 15);
    const body = Math.sin(Math.PI * 2 * 185 * time) * Math.exp(-time * 18) * 0.4;
    const sample = (noise + body) * gain;
    track.left[from + offset] += sample * leftGain;
    track.right[from + offset] += sample * rightGain;
  }
}

function addHat(track, start, random, gain = 0.08, open = false, pan = 0.2) {
  const length = Math.floor(sampleRate * (open ? 0.28 : 0.07));
  const from = Math.floor(start * sampleRate);
  const [leftGain, rightGain] = panGains(pan);
  let previous = 0;
  for (let offset = 0; offset < length && from + offset < track.left.length; offset += 1) {
    const time = offset / sampleRate;
    const noise = random() * 2 - 1;
    const high = noise - previous * 0.92;
    previous = noise;
    const sample = high * Math.exp(-time * (open ? 15 : 60)) * gain;
    track.left[from + offset] += sample * leftGain;
    track.right[from + offset] += sample * rightGain;
  }
}

function addShaker(track, start, random, gain = 0.045, pan = -0.25) {
  const length = Math.floor(sampleRate * 0.12);
  const from = Math.floor(start * sampleRate);
  const [leftGain, rightGain] = panGains(pan);
  let smooth = 0;
  for (let offset = 0; offset < length && from + offset < track.left.length; offset += 1) {
    const time = offset / sampleRate;
    const noise = random() * 2 - 1;
    smooth = smooth * 0.7 + noise * 0.3;
    const sample = (noise - smooth) * Math.sin(Math.min(1, time * 35) * Math.PI) * Math.exp(-time * 18) * gain;
    track.left[from + offset] += sample * leftGain;
    track.right[from + offset] += sample * rightGain;
  }
}

function addStereoDelay(track, seconds = 0.24, feedback = 0.16) {
  const delay = Math.floor(seconds * sampleRate);
  for (let index = delay; index < track.left.length; index += 1) {
    track.left[index] += track.right[index - delay] * feedback;
    track.right[index] += track.left[index - delay] * feedback;
  }
}

function finalize(track) {
  addStereoDelay(track);
  const fade = sampleRate * 1.2;
  let peak = 0;
  for (let index = 0; index < track.left.length; index += 1) {
    const edge = Math.min(1, index / fade, (track.left.length - index - 1) / fade);
    track.left[index] = Math.tanh(track.left[index] * 1.18) * edge;
    track.right[index] = Math.tanh(track.right[index] * 1.18) * edge;
    peak = Math.max(peak, Math.abs(track.left[index]), Math.abs(track.right[index]));
  }
  const scale = peak > 0 ? 0.92 / peak : 1;
  return { ...track, scale };
}

function wavBuffer(track) {
  const bytesPerSample = 2;
  const channels = 2;
  const dataLength = track.left.length * channels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  buffer.writeUInt16LE(channels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  for (let index = 0; index < track.left.length; index += 1) {
    const byteOffset = 44 + index * 4;
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, track.left[index] * track.scale)) * 32767), byteOffset);
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, track.right[index] * track.scale)) * 32767), byteOffset + 2);
  }
  return buffer;
}

function mp3Buffer(track) {
  const encoder = new lamejs.Mp3Encoder(2, sampleRate, 128);
  const blockSize = 1152;
  const chunks = [];
  for (let offset = 0; offset < track.left.length; offset += blockSize) {
    const length = Math.min(blockSize, track.left.length - offset);
    const left = new Int16Array(length);
    const right = new Int16Array(length);
    for (let index = 0; index < length; index += 1) {
      left[index] = Math.round(Math.max(-1, Math.min(1, track.left[offset + index] * track.scale)) * 32767);
      right[index] = Math.round(Math.max(-1, Math.min(1, track.right[offset + index] * track.scale)) * 32767);
    }
    const encoded = encoder.encodeBuffer(left, right);
    if (encoded.length) chunks.push(Buffer.from(encoded));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));
  return Buffer.concat(chunks);
}

function chromeAfterglow() {
  const bpm = 92;
  const beat = 60 / bpm;
  const bars = 12;
  const track = createTrack(bars * beat * 4 + 1.1);
  const random = seededRandom(271);
  const chords = [
    [53, 57, 60, 64],
    [50, 53, 57, 60],
    [48, 52, 55, 59],
    [55, 59, 62, 65],
  ];
  const bassRoots = [41, 38, 36, 43];
  const motif = [69, 72, 76, 74, 72, 69, 67, 69];

  for (let bar = 0; bar < bars; bar += 1) {
    const start = bar * beat * 4;
    const chord = chords[bar % chords.length];
    const body = bar < 2 ? 0.7 : bar > 9 ? 0.78 : 1;
    addChord(track, chord, start, beat * 3.7, 0.105 * body, 0.62, "warm");
    addTone(track, { midi: bassRoots[bar % 4], start, duration: beat * 1.3, gain: 0.32 * body, release: 0.18, color: "bass" });
    addTone(track, { midi: bassRoots[bar % 4] + 7, start: start + beat * 1.75, duration: beat * 0.45, gain: 0.2 * body, release: 0.12, color: "bass" });
    addTone(track, { midi: bassRoots[bar % 4] + (bar % 2 ? 10 : 12), start: start + beat * 2.75, duration: beat * 0.65, gain: 0.18 * body, release: 0.16, color: "bass" });

    if (bar >= 1) {
      [0, 2.5].forEach((offset) => addKick(track, start + beat * offset, 0.43 * body));
      [1, 3].forEach((offset) => addSnare(track, start + beat * offset, random, 0.22 * body, -0.08));
      for (let step = 0; step < 8; step += 1) addHat(track, start + beat * step / 2, random, 0.042 * body, step === 7, 0.22);
    }

    if (bar >= 4 && bar <= 9) {
      const phrase = bar % 2 === 0 ? motif.slice(0, 4) : motif.slice(4);
      phrase.forEach((midi, index) => addTone(track, {
        midi,
        start: start + beat * (0.45 + index * 0.72),
        duration: beat * 0.45,
        gain: 0.105,
        pan: index % 2 ? 0.18 : -0.18,
        release: 0.3,
        color: "glass",
      }));
    }
  }
  return finalize(track);
}

function silverPulse() {
  const bpm = 116;
  const beat = 60 / bpm;
  const bars = 16;
  const track = createTrack(bars * beat * 4 + 1);
  const random = seededRandom(811);
  const chords = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 55, 59]];
  const roots = [45, 43, 41, 40];
  const hook = [76, 74, 72, 69, 71, 72, 67, 69];

  for (let bar = 0; bar < bars; bar += 1) {
    const start = bar * beat * 4;
    const body = bar < 2 ? 0.66 : bar === 8 ? 0.55 : bar > 13 ? 0.82 : 1;
    const chord = chords[bar % 4];
    [0.5, 1.5, 2.5, 3.5].forEach((offset) => addChord(track, chord, start + beat * offset, beat * 0.38, 0.1 * body, 0.55, "pluck"));
    [0, 1.5, 2, 3.25].forEach((offset, index) => addTone(track, {
      midi: roots[bar % 4] + (index === 1 ? 7 : index === 3 ? 12 : 0),
      start: start + beat * offset,
      duration: beat * 0.42,
      gain: 0.26 * body,
      release: 0.1,
      color: "bass",
    }));
    for (let pulse = 0; pulse < 4; pulse += 1) addKick(track, start + beat * pulse, 0.44 * body);
    [1, 3].forEach((offset) => addSnare(track, start + beat * offset, random, 0.2 * body, -0.12));
    for (let step = 0; step < 8; step += 1) addHat(track, start + beat * step / 2, random, 0.05 * body, step % 4 === 3, 0.3);
    if (bar >= 4 && bar < 14 && bar % 2 === 0) {
      hook.forEach((midi, index) => addTone(track, {
        midi,
        start: start + beat * index / 2,
        duration: beat * 0.3,
        gain: 0.075,
        pan: index % 2 ? 0.25 : -0.25,
        release: 0.16,
        color: "pluck",
      }));
    }
  }
  return finalize(track);
}

function softCurrent() {
  const bpm = 78;
  const beat = 60 / bpm;
  const bars = 10;
  const track = createTrack(bars * beat * 4 + 1.2);
  const random = seededRandom(1409);
  const chords = [
    [48, 52, 55, 59],
    [45, 48, 52, 55],
    [41, 45, 48, 52],
    [43, 47, 50, 54],
  ];
  const roots = [36, 33, 29, 31];
  const melody = [67, 69, 72, 71, 69, 64, 67, 62];

  for (let bar = 0; bar < bars; bar += 1) {
    const start = bar * beat * 4;
    const body = bar === 0 ? 0.62 : bar > 7 ? 0.8 : 1;
    addChord(track, chords[bar % 4], start, beat * 3.9, 0.09 * body, 0.72, "warm");
    addTone(track, { midi: roots[bar % 4], start: start + beat * 0.1, duration: beat * 2.6, gain: 0.25 * body, attack: 0.18, release: 0.65, color: "bass" });
    if (bar >= 2) {
      [0, 2.75].forEach((offset) => addKick(track, start + beat * offset, 0.32 * body));
      addSnare(track, start + beat * 2, random, 0.14 * body, -0.22);
      for (let step = 1; step < 8; step += 2) addShaker(track, start + beat * step / 2, random, 0.045 * body, step % 4 ? -0.3 : 0.3);
    }
    if (bar >= 3 && bar <= 8) {
      const notes = bar % 2 ? melody.slice(0, 4) : melody.slice(4);
      notes.forEach((midi, index) => addTone(track, {
        midi,
        start: start + beat * (0.35 + index * 0.88),
        duration: beat * 0.62,
        gain: 0.09,
        pan: -0.16 + index * 0.1,
        attack: 0.04,
        release: 0.55,
        color: "glass",
      }));
    }
  }
  return finalize(track);
}

function fluidStudy({ bpm, seed, transpose = 0, air = 0.35, pulse = 0.6, duration = 66 }) {
  const beat = 60 / bpm;
  const track = createTrack(duration);
  const random = seededRandom(seed);
  const bars = Math.ceil(duration / (beat * 4));
  const warmChords = [
    [53, 57, 60, 64],
    [50, 53, 57, 60],
    [48, 52, 55, 59],
    [55, 59, 62, 65],
  ];
  const airyChords = [
    [52, 55, 59, 62],
    [48, 52, 55, 59],
    [45, 48, 52, 55],
    [50, 53, 57, 60],
  ];
  const progression = air > 0.55 ? airyChords : warmChords;
  const bassRoots = air > 0.55 ? [40, 36, 33, 38] : [41, 38, 36, 43];
  const scale = air > 0.55 ? [0, 3, 5, 7, 10, 12] : [0, 2, 4, 7, 9, 12];
  const motifRoot = 67 + transpose;
  const motif = Array.from({ length: 8 }, (_, index) => motifRoot + scale[(index * 3 + seed) % scale.length]);

  for (let bar = 0; bar < bars; bar += 1) {
    const start = bar * beat * 4;
    if (start >= duration - 0.8) break;
    const section = bar / Math.max(1, bars - 1);
    const edge = section < 0.12 ? 0.62 + section * 3 : section > 0.84 ? Math.max(0.55, 1 - (section - 0.84) * 2.2) : 1;
    const variation = (bar + seed) % 4;
    const chord = progression[(bar + Math.floor(seed / 7)) % progression.length].map((note) => note + transpose);
    const bass = bassRoots[(bar + Math.floor(seed / 7)) % bassRoots.length] + transpose;

    addChord(track, chord, start, beat * 3.75, (0.072 + air * 0.035) * edge, 0.68, "warm");
    if (variation === 1 || variation === 3) {
      addChord(track, chord.slice(1), start + beat * 2.5, beat * 0.45, 0.04 * edge, 0.5, "glass");
    }
    addTone(track, {
      midi: bass,
      start: start + beat * 0.06,
      duration: beat * (air > 0.55 ? 2.25 : 1.45),
      gain: (0.22 + pulse * 0.1) * edge,
      attack: air > 0.55 ? 0.12 : 0.025,
      release: 0.35,
      color: "bass",
    });
    if (air < 0.72) {
      addTone(track, {
        midi: bass + (variation % 2 ? 7 : 12),
        start: start + beat * (variation === 2 ? 2.25 : 1.75),
        duration: beat * 0.48,
        gain: 0.15 * pulse * edge,
        release: 0.14,
        color: "bass",
      });
    }

    if (bar >= 1 && section < 0.92) {
      const kicks = air > 0.62 ? [0, 2.75] : variation % 2 ? [0, 1.75, 3] : [0, 2.5];
      kicks.forEach((offset) => addKick(track, start + beat * offset, (0.25 + pulse * 0.18) * edge));
      if (air > 0.65) {
        addSnare(track, start + beat * 2, random, 0.12 * edge, -0.18);
      } else {
        [1, 3].forEach((offset) => addSnare(track, start + beat * offset, random, 0.15 * edge, -0.1));
      }
      const hatGain = 0.024 + pulse * 0.025;
      for (let step = 0; step < 8; step += 1) {
        if (air > 0.7 && step % 2 === 0) continue;
        addHat(track, start + beat * (step / 2 + (step % 2 ? 0.025 : 0)), random, hatGain * edge, step === 7, 0.24);
      }
      if (air > 0.45) {
        for (let step = 1; step < 8; step += 2) addShaker(track, start + beat * step / 2, random, 0.022 * edge, step % 4 ? -0.26 : 0.26);
      }
    }

    if (section > 0.23 && section < 0.82 && (bar + seed) % 2 === 0) {
      motif.slice(0, air > 0.65 ? 3 : 4).forEach((midi, index) => addTone(track, {
        midi,
        start: start + beat * (0.42 + index * (air > 0.65 ? 0.96 : 0.72)),
        duration: beat * (air > 0.65 ? 0.7 : 0.44),
        gain: (0.052 + (1 - air) * 0.045) * edge,
        pan: index % 2 ? 0.2 : -0.2,
        attack: air > 0.65 ? 0.07 : 0.025,
        release: 0.42,
        color: "glass",
      }));
    }
  }
  return finalize(track);
}

const concepts = [
  { file: "01-chrome-afterglow.mp3", title: "Chrome Afterglow", bpm: 92, seed: 271, transpose: 0, air: 0.34, pulse: 0.72, duration: 68 },
  { file: "02-soft-current.mp3", title: "Soft Current", bpm: 78, seed: 1409, transpose: 0, air: 0.78, pulse: 0.38, duration: 72 },
  { file: "03-mercury-veil.mp3", title: "Mercury Veil", bpm: 86, seed: 337, transpose: -2, air: 0.58, pulse: 0.55, duration: 65 },
  { file: "04-pearl-static.mp3", title: "Pearl Static", bpm: 82, seed: 461, transpose: 2, air: 0.69, pulse: 0.46, duration: 70 },
  { file: "05-slow-mirror.mp3", title: "Slow Mirror", bpm: 88, seed: 593, transpose: -3, air: 0.42, pulse: 0.65, duration: 66 },
  { file: "06-warm-alloy.mp3", title: "Warm Alloy", bpm: 94, seed: 719, transpose: 1, air: 0.3, pulse: 0.76, duration: 64 },
  { file: "07-night-surface.mp3", title: "Night Surface", bpm: 80, seed: 853, transpose: -1, air: 0.74, pulse: 0.4, duration: 73 },
  { file: "08-afterlight.mp3", title: "Afterlight", bpm: 90, seed: 977, transpose: 3, air: 0.48, pulse: 0.61, duration: 67 },
  { file: "09-quiet-orbit.mp3", title: "Quiet Orbit", bpm: 76, seed: 1097, transpose: 0, air: 0.82, pulse: 0.32, duration: 74 },
  { file: "10-satin-weather.mp3", title: "Satin Weather", bpm: 84, seed: 1223, transpose: 2, air: 0.64, pulse: 0.48, duration: 69 },
  { file: "11-still-moving.mp3", title: "Still Moving", bpm: 96, seed: 1361, transpose: -2, air: 0.36, pulse: 0.74, duration: 63 },
  { file: "12-pale-gravity.mp3", title: "Pale Gravity", bpm: 79, seed: 1487, transpose: -4, air: 0.8, pulse: 0.35, duration: 72 },
  { file: "13-fluid-memory.mp3", title: "Fluid Memory", bpm: 87, seed: 1607, transpose: 1, air: 0.56, pulse: 0.58, duration: 68 },
  { file: "14-glass-hours.mp3", title: "Glass Hours", bpm: 81, seed: 1741, transpose: 4, air: 0.72, pulse: 0.43, duration: 71 },
  { file: "15-formless-dawn.mp3", title: "Formless Dawn", bpm: 85, seed: 1871, transpose: 0, air: 0.67, pulse: 0.5, duration: 75 },
];

await mkdir(outputDir, { recursive: true });
for (const concept of concepts) {
  const track = fluidStudy(concept);
  await writeFile(path.join(outputDir, concept.file), mp3Buffer(track));
  console.log(`${concept.file}: ${track.duration.toFixed(1)}s`);
}
