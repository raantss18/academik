# academik

**Apprends en jouant, du lycée à la recherche, en construisant ta propre IA.** Une leçon de 10–15 minutes par jour,
le cours est dans le niveau, tout fonctionne **hors ligne**. Maths, programmation, IA et cybersécurité, en français et en anglais.

À chaque module, ton assistant **Kintana** apprend quelque chose de nouveau : chiffrer un message, chercher dans tes
cours, prédire le mot suivant, s'entraîner tout seul, utiliser des outils, résister aux attaques.

| | |
| --- | --- |
| 🌐 Site (même app, dans le navigateur, installable) | <https://raantss18.github.io/academik/> |
| 📱 Android (APK) · 🐧 Linux (AppImage) | [Releases](https://github.com/raantss18/academik/releases/latest) |
| 📋 Où on en est | [`PROGRESS.md`](PROGRESS.md) |

Pourquoi c'est construit ainsi : [`PEDAGOGIE.md`](PEDAGOGIE.md) · Le parcours : [`CURSUS.md`](CURSUS.md) ·
Les règles du projet : [`CONSIGNES.md`](CONSIGNES.md) · Les choix techniques : [`DECISIONS.md`](DECISIONS.md).

Compte facultatif : sans compte, tout reste sur ton appareil. Avec un compte, ta progression te suit d'un appareil à l'autre.

## Développer

```bash
npm ci
npm run dev        # http://localhost:5173
npm run verify     # tests, types, build et audit « hors ligne »
node scripts/licenses.mjs   # audit des licences des dépendances
```

Licences : code Apache-2.0, contenu selon [`LICENSES.md`](LICENSES.md).

---

**English** — Learn by playing, from high school to research, by building your own local AI. 10–15 minute lessons, the
course lives inside each level, fully offline. Maths, programming, AI and cybersecurity, in French and English.
