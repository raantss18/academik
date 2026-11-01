#!/usr/bin/env bash
# Construit TOUS les paquets de la version courante (build.json) à partir du code actuel, puis signe release.json.
# Un seul geste, pour qu'un paquet ne soit jamais en retard sur le code (erreur déjà commise deux fois, voir docs/TODO.md § 0, E10).
set -euo pipefail
cd "$(dirname "$0")/.."
V=$(node -p "require('./build.json').version")
mkdir -p release-out
npm run verify
npx cap sync android
( cd android && set -a && . ../release-keys/signing.env && set +a \
  && JAVA_HOME=/usr/lib/jvm/java-21-openjdk ANDROID_HOME="$HOME/Android/Sdk" ANDROID_SDK_ROOT="$HOME/Android/Sdk" ./gradlew assembleRelease -q )
cp android/app/build/outputs/apk/release/app-release.apk "release-out/academik-$V.apk"
rm -rf src-tauri/target/release/bundle/appimage
NO_STRIP=true APPIMAGE_EXTRACT_AND_RUN=1 npx tauri build
cp "src-tauri/target/release/bundle/appimage/academik_${V}_amd64.AppImage" "release-out/academik-$V-x86_64.AppImage"
git fetch -q origin main && git checkout origin/main -- public/app   # point de départ : le release.json réellement publié
node scripts/release.mjs
( cd release-out && sha256sum "academik-$V.apk" "academik-$V-x86_64.AppImage" > SHA256SUMS.txt )
echo "✓ paquets $V prêts dans release-out/ ; release.json signé."
