#!/usr/bin/env bash
# Publie la release GitHub de la version courante (build.json) : étiquette, fiche lisible (scripts/release-notes.mjs),
# fichiers versionnés + noms stables (academik.apk, academik-x86_64.AppImage) pour un lien « télécharger » qui ne change jamais.
# À lancer après scripts/build-release.sh, sur le commit fusionné de main. La PR de release.json reste à faire (voir docs/RELEASING.md).
set -euo pipefail
cd "$(dirname "$0")/.."
V=$(node -p "require('./build.json').version")
git tag "v$V" && git push -q origin "v$V"
cp "release-out/academik-$V.apk" release-out/academik.apk
cp "release-out/academik-$V-x86_64.AppImage" release-out/academik-x86_64.AppImage
gh release create "v$V" "release-out/academik-$V.apk" "release-out/academik-$V-x86_64.AppImage" release-out/academik.apk release-out/academik-x86_64.AppImage release-out/SHA256SUMS.txt \
  --title "academik $V" --notes "temporaire"
node scripts/release-notes.mjs "$V" > "release-out/NOTES-$V.md"   # les tailles viennent de la release qu'on vient de créer
gh release edit "v$V" --notes-file "release-out/NOTES-$V.md"
echo "✓ release v$V publiée : https://github.com/raantss18/academik/releases/tag/v$V"
