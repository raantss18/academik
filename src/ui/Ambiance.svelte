<script lang="ts">
  // Fond d'une leçon : dégradé du quartier (repli CSS toujours présent) + un petit programme GPU (WebGL) pour une brume lente et quelques lucioles.
  // Discret par conception : contraste du texte préservé, aucun clignotement, pause si l'onglet est caché ou qu'on saisit du texte,
  // image fixe si l'utilisateur demande moins d'animations ou si l'appareil est lent.
  import { onMount } from 'svelte';
  import { ambianceDe, melange, rgb, type Palette } from '../lib/ambiance';
  import { theme } from '../lib/theme.svelte';

  let { module, lit = 0, eclat = 0, fete = false }: { module: number; lit?: number; eclat?: number; fete?: boolean } = $props();
  let canvas: HTMLCanvasElement | undefined = $state(), prefersDark = $state(typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
  const nuit = $derived(theme.value === 'dark' || (theme.value === 'auto' && prefersDark));
  const pal = $derived<Palette>(nuit ? ambianceDe(module).nuit : ambianceDe(module).jour);

  // Silhouette du quartier (déterministe par module) : une fenêtre s'allume à chaque bonne réponse, comme sur l'accueil.
  function graine(m: number) { let s = (m + 1) * 2654435761 >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const immeubles = $derived.by(() => {
    const r = graine(module), liste: { x: number; w: number; h: number; f: { x: number; y: number; rang: number }[] }[] = []; let x = -4, n = 0;
    while (x < 304) { const w = 14 + Math.floor(r() * 14), h = 28 + Math.floor(r() * 64), f: { x: number; y: number; rang: number }[] = [];
      for (let ry = 0; ry < Math.floor((h - 8) / 9); ry++) for (let cx = 0; cx < Math.floor((w - 4) / 6); cx++) f.push({ x: x + 3 + cx * 6, y: 120 - h + 5 + ry * 9, rang: n++ });
      liste.push({ x, w, h, f }); x += w + 2; }
    const ordre = liste.flatMap(b => b.f), rangs = ordre.map((_, i) => i).sort(() => r() - 0.5);
    ordre.forEach((f, i) => { f.rang = rangs[i]; }); return liste;
  });
  const total = $derived(immeubles.reduce((s, b) => s + b.f.length, 0)), nbAllumees = $derived(Math.round(total * Math.max(0, Math.min(1, fete ? 1 : lit))));
  const tour = $derived(melange(pal.haut, pal.bas, nuit ? 0.15 : 0.55)), eteint = $derived(melange(pal.haut, pal.bas, nuit ? 0.55 : 0.8));

  onMount(() => {
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null, onMq = () => (prefersDark = !!mq?.matches);
    mq?.addEventListener?.('change', onMq);
    const cv = canvas;
    return () => { mq?.removeEventListener?.('change', onMq); cv?.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext(); };   // libère la mémoire graphique en quittant la leçon
  });

  // Contexte WebGL perdu (le système reprend la mémoire graphique d'une app en arrière-plan, pilote réinitialisé…) : le canvas devenait
  // blanc avec l'icône d'image cassée. On le cache (le dégradé CSS reste) et on relance le programme quand le contexte revient (E48).
  let perdu = $state(false), relance = $state(0);
  $effect(() => {
    const cv = canvas; if (!cv) return;
    void relance;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); if (!gl) return; // repli : le dégradé CSS
    const sh = (type: number, src: string) => { const o = gl.createShader(type)!; gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `precision mediump float;uniform vec2 r;uniform float t,d;uniform vec3 a,b,c;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 uv=gl_FragCoord.xy/r;vec3 col=mix(a,b,smoothstep(0.,1.,1.-uv.y));
        vec2 q=uv*vec2(r.x/r.y,1.)*2.2;float f=n(q+vec2(t*.03,t*.02))*.55+n(q*2.+vec2(-t*.02,t*.04))*.3;col+=(b-a)*(f-.4)*.22;
        for(int i=0;i<10;i++){float fi=float(i);vec2 pos=vec2(fract(h(vec2(fi,1.))+t*.010*(.5+h(vec2(fi,2.)))),fract(h(vec2(fi,3.))+t*.007*(.4+h(vec2(fi,4.)))));
          pos.x+=sin(t*.5+fi)*.01;float dd=length((uv-pos)*vec2(r.x/r.y,1.));float tw=.5+.5*sin(t*.9+fi*2.);
          col=mix(col,c,(d>.5?.55:.2)*tw*smoothstep(.012,0.,dd));}
        col=mix(col,a,.25*length(uv-.5));gl_FragColor=vec4(col,1.);}`));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const lp = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const U = (k: string) => gl.getUniformLocation(prog, k);
    let scale = 0.4, tt = 0, last = performance.now(), dernier = 0, avant = performance.now(), raf = 0, saisie = false, lent = 0, frames = 0, arret = matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    // Redimensionner efface le canvas : on redessine aussitôt, sinon une rotation laissait un fond vide quand l'animation est figée (moins d'animations, appareil lent) (E48).
    const resize = () => { cv.width = Math.max(1, Math.round(innerWidth * scale)); cv.height = Math.max(1, Math.round(innerHeight * scale)); gl.viewport(0, 0, cv.width, cv.height); if (!gl.isContextLost()) draw(); };
    const draw = () => {
      gl.uniform2f(U('r'), cv.width, cv.height); gl.uniform1f(U('t'), tt); gl.uniform1f(U('d'), nuit ? 0 : 1);
      gl.uniform3fv(U('a'), rgb(pal.haut)); gl.uniform3fv(U('b'), rgb(pal.bas)); gl.uniform3fv(U('c'), rgb(pal.lueur)); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      const dt = now - last; last = now;
      // 20 images/s suffisent : la brume avance de quelques pixels par seconde ; 60 images/s triplaient le travail du GPU pour rien (E48).
      if (document.hidden || saisie || arret) avant = now;   // en pause : le temps de l'animation ne saute pas à la reprise
      else if (now - dernier >= 50) {
        dernier = now;
        tt += (now - avant) / 1000; avant = now; draw(); frames++;
        if (frames > 30 && dt > 34 && ++lent > 20) { if (scale > 0.25) { scale = 0.25; resize(); lent = 0; } else { arret = true; } } // appareil lent : on réduit puis on fige
      }
      raf = requestAnimationFrame(loop);
    };
    const focus = (e: Event) => { const el = e.target as HTMLElement; saisie = e.type === 'focusin' && /^(INPUT|TEXTAREA)$/.test(el.tagName); };
    resize(); draw(); addEventListener('resize', resize); addEventListener('focusin', focus); addEventListener('focusout', focus);
    const lost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); perdu = true; };
    const restored = () => { perdu = false; relance++; };
    cv.addEventListener('webglcontextlost', lost); cv.addEventListener('webglcontextrestored', restored);
    raf = requestAnimationFrame(loop);
    return () => { cv.removeEventListener('webglcontextlost', lost); cv.removeEventListener('webglcontextrestored', restored); cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('focusin', focus); removeEventListener('focusout', focus); };   // pas de loseContext() ici : l'effet se relance à chaque changement de palette (thème) et retrouverait un contexte perdu (E48)
  });
</script>

<div class="amb" style="--haut:{pal.haut};--bas:{pal.bas};--tour:{tour};--eteint:{eteint};--allume:{nuit ? '#ffd36b' : '#e0a21a'};--halo:{nuit ? '#ffcf80' : '#e8b44a'}" aria-hidden="true">
  <canvas bind:this={canvas} class:perdu></canvas>
  {#if eclat > 0}{#key eclat}<span class="luciole" style="top:{18 + (eclat * 23) % 40}%"></span>{/key}{/if}
  {#if fete}<div class="fete"></div>{/if}
  <svg class="ville" viewBox="0 0 300 120" preserveAspectRatio="xMidYMax slice">
    {#each immeubles as b}
      <rect x={b.x} y={120 - b.h} width={b.w} height={b.h} fill="var(--tour)" />
      {#each b.f as f}<rect class="fen" class:on={f.rang < nbAllumees} x={f.x} y={f.y} width="3.2" height="4.6" rx=".6" />{/each}
    {/each}
  </svg>
</div>

<style>
  .amb { position: fixed; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(to bottom, var(--haut), var(--bas)); }
  canvas { width: 100%; height: 100%; display: block; } canvas.perdu { visibility: hidden; }
  .ville { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: min(24vh, 190px); }
  .fen { fill: var(--eteint); transition: fill .6s, filter .6s; } .fen.on { fill: var(--allume); filter: drop-shadow(0 0 1.6px var(--halo)); }
  /* Récompenses rares et discrètes : une luciole traverse l'écran après trois bonnes réponses d'affilée ; la fin d'un boss réussi allume tout le quartier. */
  .luciole { position: absolute; left: -6%; width: 9px; height: 9px; border-radius: 50%; background: var(--allume); box-shadow: 0 0 14px 5px var(--halo); animation: traverse 4.2s ease-in-out forwards; }
  @keyframes traverse { 0% { transform: translate(0, 0); opacity: 0; } 12% { opacity: .9; } 50% { transform: translate(60vw, -26px); } 88% { opacity: .9; } 100% { transform: translate(112vw, 10px); opacity: 0; } }
  .fete { position: absolute; left: 0; right: 0; bottom: 0; height: 38vh; background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--halo) 45%, transparent), transparent 70%); animation: monte 1.6s ease-out both; }
  @keyframes monte { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .fen { transition: none; } .luciole { animation: none; display: none; } .fete { animation: none; } }
</style>
