// Une seule source : build.json { version, build }. Reporte la version dans package.json, Android (versionName/versionCode),
// Tauri (tauri.conf.json, Cargo.toml). Le numéro de build augmente de 1 à CHAQUE publication (jamais de retour en arrière).
import { readFileSync, writeFileSync } from 'node:fs';
const { version, build } = JSON.parse(readFileSync('build.json', 'utf8'));
const edit = (p, f) => { const s = readFileSync(p, 'utf8'), t = f(s); if (s !== t) { writeFileSync(p, t); console.log('mis à jour :', p); } };
edit('package.json', s => s.replace(/"version": "[^"]+"/, `"version": "${version}"`));
edit('android/app/build.gradle', s => s.replace(/versionCode \d+/, `versionCode ${build}`).replace(/versionName "[^"]+"/, `versionName "${version}"`));
edit('src-tauri/tauri.conf.json', s => s.replace(/"version": "[^"]+"/, `"version": "${version}"`));
edit('src-tauri/Cargo.toml', s => s.replace(/^version = "[^"]+"/m, `version = "${version}"`));
console.log(`version ${version}, build ${build}`);
