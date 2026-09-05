// The showroom film, encoded for a landing page rather than for an editor.
//
// The original is 1280x720 at 1.7Mbps for 125 seconds — 27MB, three quarters
// of everything this site ships. It is decoration that plays itself in a
// corner of one section, so it is re-encoded far leaner. Nothing is cut: the
// whole two minutes is still there, and the sound is kept because the page
// gives the visitor a button to turn it on.
//
// -movflags +faststart puts the index at the front of the file, so playback
// starts on the first chunk instead of after the whole download.
//
//   node scripts/process-video.mjs [crf] [height]
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import fs from 'node:fs';

const SRC = 'assets/showroom-source.mp4';
const OUT = 'public/video/showroom.mp4';
// 720p because the film is cover-cropped into a portrait frame and has to
// cover about 1024px across there; crf 32 because at that size nothing in the
// carving or the tufting gives way, and it halves the file.
const crf = process.argv[2] ?? '32';
const height = process.argv[3] ?? '720';

// Deliberately no fallback to the file in public/: that one is already
// encoded, and quietly re-encoding an encode loses a generation of quality
// every time this is run. The master is kept out of git — it is 27MB — so a
// fresh clone that needs to re-make the film asks for it back.
if (!fs.existsSync(SRC)) {
  console.error(`${SRC} is not here. It is the camera original and is not in git;`);
  console.error('put it back before re-encoding. public/video/showroom.mp4 is an');
  console.error('encode already and must never be used as the source.');
  process.exit(1);
}

const mb = (f) => (fs.statSync(f).size / 1048576).toFixed(1);
const before = mb(SRC);

execFileSync(ffmpeg, [
  '-y', '-i', SRC,
  '-vf', `scale=-2:${height}`,
  '-r', '24',                       // 24fps: it is a slow pan round a showroom
  '-c:v', 'libx264', '-preset', 'slow', '-crf', crf,
  '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '64k', '-ac', '2',
  '-movflags', '+faststart',
  OUT,
], { stdio: ['ignore', 'ignore', 'ignore'] });

const info = execFileSync(ffprobe.path, [
  '-v', 'error',
  '-show_entries', 'format=duration,bit_rate',
  '-show_entries', 'stream=width,height',
  '-of', 'default=noprint_wrappers=1', OUT,
], { encoding: 'utf8' });

console.log(`${before}MB -> ${mb(OUT)}MB  (crf ${crf}, ${height}p, 24fps)`);
console.log(info.trim().split('\n').map((l) => '  ' + l).join('\n'));
