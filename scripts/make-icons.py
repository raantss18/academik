#!/usr/bin/env python3
"""Génère toutes les icônes d'academik à partir du seul « e » rouge (le même que dans le mot academik).
Usage : python3 scripts/make-icons.py  (nécessite rsvg-convert et Pillow). Puis : npx tauri icon public/icons/icon-512.png"""
import glob, os, subprocess, tempfile
from PIL import Image, ImageDraw

RED, BG = '#d6362b', '#f7f8f6'
E = f'<path d="M126 256H386A130 130 0 1 0 356 340" fill="none" stroke="{RED}" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/>'
def svg(body, bg=True, rx=112): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' + (f'<rect width="512" height="512" rx="{rx}" fill="{BG}"/>' if bg else '') + body + '</svg>'
def scaled(k): return f'<g transform="translate(256 256) scale({k}) translate(-256 -256)">{E}</g>'
def png(s, size, path):
    with tempfile.NamedTemporaryFile('w', suffix='.svg', delete=False) as f: f.write(s)
    subprocess.run(['rsvg-convert', '-w', str(size), '-h', str(size), f.name, '-o', path], check=True); os.unlink(f.name)

os.makedirs('public/icons', exist_ok=True)
open('public/icon.svg', 'w').write(svg(scaled(1.0)))
png(svg(scaled(1.0)), 192, 'public/icons/icon-192.png'); png(svg(scaled(1.0)), 512, 'public/icons/icon-512.png')
png(svg(scaled(.82), rx=0), 512, 'public/icons/maskable-512.png')

res = 'android/app/src/main/res'
for d, s in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    p = f'{res}/mipmap-{d}'; os.makedirs(p, exist_ok=True)
    png(svg(scaled(1.0)), s, f'{p}/ic_launcher.png')
    full = Image.open(f'{p}/ic_launcher.png').convert('RGBA'); m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).ellipse((0, 0, s - 1, s - 1), fill=255)
    o = Image.new('RGBA', (s, s), (0, 0, 0, 0)); o.paste(full, (0, 0), m); o.save(f'{p}/ic_launcher_round.png')
    png(svg(scaled(.72), bg=False), int(s * 108 / 48), f'{p}/ic_launcher_foreground.png')
open(f'{res}/values/ic_launcher_background.xml', 'w').write(f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">{BG.upper()}</color>\n</resources>\n')

# Écran de démarrage : fond uni + le « e » (remplace le logo par défaut de Capacitor)
for f in glob.glob(f'{res}/drawable*/splash.png'):
    w, h = Image.open(f).size; g = int(min(w, h) * .22)
    png(svg(scaled(1.0), bg=False), g, '/tmp/_e.png') if False else None
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as t: png(svg(scaled(1.0), bg=False), g, t.name); e = Image.open(t.name).convert('RGBA'); os.unlink(t.name)
    img = Image.new('RGBA', (w, h), BG); img.paste(e, ((w - g) // 2, (h - g) // 2), e); img.convert('RGB').save(f)
print('icônes générées')
