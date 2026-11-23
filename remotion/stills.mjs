// node stills.mjs <outdir> <frame> [<frame> ...]   (absolute frames of the Recap composition)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs';
const out = process.argv[2]; const frames = process.argv.slice(3).map(Number);
const chrome = process.env.CHROME || '/usr/bin/google-chrome';
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const browser = await openBrowser('chrome', {browserExecutable: chrome});
const comp = await selectComposition({serveUrl, id: 'Recap', browserExecutable: chrome});
fs.mkdirSync(out, {recursive: true});
for (const f of frames) { await renderStill({serveUrl, composition: comp, frame: f, output: `${out}/f${String(f).padStart(6, '0')}.png`, puppeteerInstance: browser}); console.log('ok', f); }
await browser.close({silent: true});
