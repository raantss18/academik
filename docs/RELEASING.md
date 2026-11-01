# Publier une version de l'application

1. `build.json` : nouvelle `version` ; **`build` + 1** (il ne baisse jamais). `node scripts/sync-version.mjs` reporte partout.
2. `CHANGELOG.md` : renommer `## [Non publié]` en `## [X.Y.Z] — AAAA-MM-JJ` avec `### Message fr` / `### Message en`
   (2 à 4 lignes sur **ce que la version permet de faire**, pas le journal technique), puis rouvrir `## [Non publié]`.
3. Construire : `npm run verify` ; APK : `npx cap sync android` puis, dans `android/`, `set -a; . ../release-keys/signing.env; set +a;
   JAVA_HOME=/usr/lib/jvm/java-21-openjdk ANDROID_HOME=~/Android/Sdk ./gradlew assembleRelease` ; AppImage :
   `NO_STRIP=true npx tauri build`. Copier dans `release-out/` sous `academik-X.Y.Z.apk` et `academik-X.Y.Z-x86_64.AppImage`.
4. **Tester l'APK sur l'émulateur par-dessus la version précédente** : la progression doit être conservée.
5. `node scripts/release.mjs` : écrit et **signe** `public/app/release.json(.sig)` (clé : `release-keys/update.key`).
6. Release GitHub **avant** de fusionner (les liens de `release.json` doivent exister) :
   `gh release create vX.Y.Z release-out/* --title "academik X.Y.Z" --notes-file …` (marquée *Latest*), puis PR + fusion : le site publie `release.json`.
7. Le **numéro de version n'est jamais affiché sur le site** (seulement dans l'APK/AppImage et sur GitHub).

Clés (jamais dans Git, à sauvegarder) : `release-keys/academik.jks` (signature Android), `release-keys/update.key` (signature de `release.json`).
Perdre l'une des deux = impossible de publier des mises à jour que les apps installées accepteront.
