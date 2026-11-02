<h1 align="center">academik</h1>

<p align="center"><b>Apprends en jouant, du lycée à la recherche, en construisant ta propre IA.</b><br>
Une leçon de 10 à 20 minutes, le cours est dans le niveau, tout fonctionne <b>hors ligne</b>.<br>
Maths, programmation, IA et cybersécurité — en français et en anglais.</p>

> **Langues / Languages :** **Français** · [English summary](#english)

À chaque module, ton assistant **Kintana** (« étoile » en malgache) apprend quelque chose de nouveau : suivre des règles
logiques, vivre dans un terminal, répondre en Python, chercher vite, comparer des textes, apprendre ses réglages,
prédire le mot suivant, dire si un résultat est réel ou dû au hasard. La suite : classer, prévoir, générer du texte,
chercher dans tes cours en citant ses sources, utiliser des outils, résister aux attaques.

| | |
| --- | --- |
| 🌐 **Site** (même app, dans le navigateur, installable) | <https://raantss18.github.io/academik/> |
| 📱 **Android** (APK) · 🐧 **Linux** (AppImage) | [**Télécharger la dernière version**](https://github.com/raantss18/academik/releases/latest) |
| 📋 **Où on en est** | [`PROGRESS.md`](PROGRESS.md) · [`CHANGELOG.md`](CHANGELOG.md) |

## Comment on joue

- Une **carte-ville** : chaque quartier est un module, chaque bâtiment un niveau. Un niveau s’allume peu à peu quand tu
  progresses, et tout s’allume quand il est réussi à 100 %. Un repère rouge, comme sur une carte, montre où jouer.
- Un niveau = une suite de petites cartes : tu essaies, tu lis, tu réponds. Une seule tentative par carte ; si tu te
  trompes, tu as un indice, **jamais la solution**.
- Le **premier niveau de chaque module est toujours ouvert** : il n’est pas nécessaire de tout réussir pour avancer.
  Les suivants s’ouvrent à 50 %.
- De vrais exercices : un **terminal simulé** (aucun risque pour ton ordinateur) et un **éditeur Python** qui exécute ton
  code sur ton appareil (Pyodide).
- Des **révisions espacées** (FSRS) ramènent les anciens niveaux au bon moment.
- **Sans compte**, tout reste sur ton appareil. Un compte facultatif synchronise la progression d’un appareil à l’autre.
- **Mises à jour** : les nouveaux cours arrivent tout seuls, sans réinstaller ; l’application se met à jour séparément.

## Le parcours

| Modules | Ce que Kintana sait faire |
| --- | --- |
| 0 Raisonner · 1 Le terminal · 2 Python | suivre des règles, vivre dans un dossier, répondre à des commandes |
| 3 Algorithmes · 4 Algèbre linéaire · 5 Analyse | chercher vite, comparer deux textes, apprendre ses réglages |
| 6 Probabilités · 7 Statistique · 8 Données | prédire le mot suivant, distinguer le réel du hasard, lire un corpus |
| 9 à 15 Apprentissage, réseaux, transformers, LLM, RAG, agents | classer, générer, répondre avec ses sources, utiliser des outils |
| 16 à 18 Processus, recherche quantitative, performance | tester honnêtement une hypothèse de marché |
| 19 à 20 Sécurité, évaluer et produire | résister aux attaques, être mesurée et livrée |

Le détail : [`CURSUS.md`](CURSUS.md). Chaque contenu cite sa source ; chaque solution est vérifiée en l’exécutant.

## Pour les développeurs

```bash
git clone https://github.com/raantss18/academik.git && cd academik
npm ci
npm run dev        # http://localhost:5173
npm run verify     # tests, types, build et audit « hors ligne »
node scripts/licenses.mjs   # audit des licences des dépendances
```

Technique : Svelte 5 · Vite · TypeScript · PWA hors ligne · Capacitor (Android) · Tauri (Linux) · Supabase facultatif.
Le contenu est en YAML (`content/niveaux/`), compilé en paquets qui se mettent à jour sans nouvelle version de l’app.

| Je veux… | Lire |
| --- | --- |
| comprendre pourquoi c’est construit ainsi | [`PEDAGOGIE.md`](PEDAGOGIE.md) · [`DESIGN.md`](DESIGN.md) |
| écrire ou corriger un niveau | [`docs/CONTENU.md`](docs/CONTENU.md) · [`docs/QUALITE-COURS.md`](docs/QUALITE-COURS.md) |
| connaître les règles du projet | [`CONSIGNES.md`](CONSIGNES.md) · [`DECISIONS.md`](DECISIONS.md) |
| voir les erreurs déjà corrigées | [`docs/TODO.md`](docs/TODO.md) (§ 0) |
| publier une version | [`docs/RELEASING.md`](docs/RELEASING.md) |
| comprendre les mises à jour | [`docs/MISES-A-JOUR.md`](docs/MISES-A-JOUR.md) |
| faire travailler Codex | [`handoff/README.md`](handoff/README.md) · [`docs/CODEX.md`](docs/CODEX.md) |

## Auteur et contact

**RANIRIAMANJAKA Antsa** — conception et développement

- E-mail : [antsa.raniriamanjaka@univ-antananarivo.mg](mailto:antsa.raniriamanjaka@univ-antananarivo.mg)
- Téléphone / WhatsApp : [+261 33 43 838 82](https://wa.me/261334383882)
- GitHub : [github.com/raantss18](https://github.com/raantss18)

## Licences

Code sous [Apache-2.0](LICENSE) ; contenu selon la licence de chaque source ([`LICENSES.md`](LICENSES.md)) ;
dépendances : [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md). Tout est open source.

---

## English

**academik** is a game for learning by playing, from high school to research, by building your own local AI. Lessons of
10–20 minutes, the course lives inside each level, everything works **offline**. Maths, programming, AI and
cybersecurity, in French and English.

- 🌐 **Website:** <https://raantss18.github.io/academik/> (installable in the browser)
- 📱🐧 **Android and Linux apps:** [download the latest release](https://github.com/raantss18/academik/releases/latest)
- The first level of every module is always open; the next ones unlock at 50 %. One attempt per card, never the answer
  when you are wrong. A simulated terminal and an in-device Python editor are included.
- **Author:** RANIRIAMANJAKA Antsa — [antsa.raniriamanjaka@univ-antananarivo.mg](mailto:antsa.raniriamanjaka@univ-antananarivo.mg) · [WhatsApp +261 33 43 838 82](https://wa.me/261334383882)
