// Scans ./audio for audio files (in natural/alphabetical order) and writes playlist.js.
// Usage: node build-playlist.js
const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, 'audio');
const EXTS = new Set(['.mp3', '.m4a', '.aac', '.wav', '.ogg', '.oga', '.flac', '.opus']);

let files = [];
try {
  files = fs.readdirSync(AUDIO_DIR)
    .filter(f => EXTS.has(path.extname(f).toLowerCase()) && !f.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
} catch (e) {
  console.error('No ./audio folder found. Create it and add your tracks.');
  process.exit(1);
}

// Preserve any titles already set in the current playlist.js (keyed by src).
const existingTitles = {};
try {
  const prev = fs.readFileSync(path.join(__dirname, 'playlist.js'), 'utf8');
  const m = prev.match(/window\.TRACKS\s*=\s*(\[[\s\S]*?\]);/);
  if (m) {
    // eslint-disable-next-line no-eval
    const arr = eval(m[1]);
    arr.forEach(t => { if (t && t.src && t.title) existingTitles[t.src] = t.title; });
  }
} catch (e) { /* no previous file */ }

const tracks = files.map(f => {
  const src = 'audio/' + f;
  const t = { src };
  if (existingTitles[src]) t.title = existingTitles[src];
  return t;
});

const body = tracks.map(t =>
  '  ' + JSON.stringify(t)
).join(',\n');
const out = '// Playlist (order = play order). Titles are preserved across rebuilds.\n' +
  'window.TRACKS = [\n' + body + '\n];\n';

fs.writeFileSync(path.join(__dirname, 'playlist.js'), out);
console.log(`Wrote playlist.js with ${tracks.length} track(s):`);
files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
