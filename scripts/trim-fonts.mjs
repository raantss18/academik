// KaTeX fournit ses polices en woff2, woff et ttf. Tout WebView/navigateur actuel lit le woff2 ; on retire les deux autres formats
// des paquets (APK, AppImage, site) : ~1 Mo de moins, et jamais téléchargés de toute façon (le woff2 est listé en premier).
import { readdirSync, rmSync, statSync } from 'node:fs';
let n = 0, bytes = 0;
for (const f of readdirSync('dist/assets')) if (/^KaTeX_.*\.(woff|ttf)$/.test(f)) { bytes += statSync(`dist/assets/${f}`).size; rmSync(`dist/assets/${f}`); n++; }
console.log(`polices retirées : ${n} fichiers (${(bytes / 1024).toFixed(0)} Ko)`);
