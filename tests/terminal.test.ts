import { describe, it, expect } from 'vitest';
import { newTerm, run, check, tokenize, resolvePath, cloneTerm } from '../src/lib/terminal';

const fresh = () => newTerm({ home: { kintana: { 'notes.txt': 'riz\neau\nriz\nsel\n', docs: { 'a.md': 'un\ndeux\ntrois\n' }, '.cache': 'x' } } });

describe('terminal simulé (D-016)', () => {
  it('chemins : ., .., ~, doubles barres, jamais au-dessus de la racine', () => {
    expect(resolvePath('/home/kintana', '../x//y/./z')).toBe('/home/x/y/z'); expect(resolvePath('/a', '~/d')).toBe('/home/kintana/d'); expect(resolvePath('/a', '../../../..')).toBe('/');
  });
  it('pwd, cd, ls (fichiers cachés avec -a, détail avec -l)', () => {
    const t = fresh(); expect(run(t, 'pwd')).toBe('/home/kintana\n'); expect(run(t, 'ls')).toBe('docs/  notes.txt\n'); expect(run(t, 'ls -a')).toContain('.cache');
    expect(run(t, 'cd docs && pwd')).toBe('/home/kintana/docs\n'); expect(run(t, 'ls -l')).toContain('-rw-r--r--');
    expect(run(t, 'cd /nulle part')).toContain('Aucun fichier'); expect(t.cwd).toBe('/home/kintana/docs');
  });
  it('cat, head, tail, wc, grep, sort, uniq et les tuyaux', () => {
    const t = fresh();
    expect(run(t, 'head -n 2 notes.txt')).toBe('riz\neau\n'); expect(run(t, 'tail -1 notes.txt')).toBe('sel\n');
    expect(run(t, 'wc -l notes.txt')).toBe('4 notes.txt\n'); expect(run(t, 'grep -c riz notes.txt')).toBe('2\n');
    expect(run(t, 'sort notes.txt | uniq')).toBe('eau\nriz\nsel\n'); expect(run(t, 'cat notes.txt | grep -v riz | wc -l')).toBe('2\n');
    expect(run(t, 'grep -i RIZ notes.txt | sort -r')).toBe('riz\nriz\n');
  });
  it('redirections > et >> ; guillemets ; echo', () => {
    const t = fresh(); run(t, 'echo "bonjour Rakoto" > hello.txt'); run(t, "echo 'suite' >> hello.txt");
    expect(run(t, 'cat hello.txt')).toBe('bonjour Rakoto\nsuite\n'); run(t, 'echo neuf > hello.txt'); expect(run(t, 'cat hello.txt')).toBe('neuf\n');
  });
  it('mkdir -p, touch, cp, mv, rm -r', () => {
    const t = fresh(); run(t, 'mkdir -p a/b/c'); run(t, 'touch a/b/f.txt'); run(t, 'cp notes.txt a/'); run(t, 'mv a/notes.txt a/b/n2.txt'); run(t, 'cp -r docs a/b/');
    expect(run(t, 'ls a/b')).toBe('c/  docs/  f.txt  n2.txt\n'); run(t, 'rm -r a'); expect(run(t, 'ls')).not.toContain('a/');
    expect(run(t, 'rm docs')).toContain('est un dossier'); expect(run(t, 'cp docs x')).toContain('-r');
  });
  it('chmod en octal et en symbolique ; permission refusée à la lecture et à l’écriture', () => {
    const t = fresh(); run(t, 'chmod 755 notes.txt'); expect(run(t, 'ls -l notes.txt')).toContain('-rwxr-xr-x'); run(t, 'chmod -x notes.txt'); expect(run(t, 'ls -l notes.txt')).toContain('-rw-r--r--');
    run(t, 'chmod 000 notes.txt'); expect(run(t, 'cat notes.txt')).toContain('Permission'); expect(run(t, 'echo x > notes.txt')).toContain('Permission');
    expect(run(t, 'chmod 999 notes.txt')).toContain('invalide');
  });
  it('erreurs claires, jamais d’exception, commande inconnue', () => {
    const t = fresh();
    for (const l of ['', '   ', 'nimportequoi', 'cat', 'cat nope', 'echo "ouvert', 'ls |', '| ls', '> x', 'echo a >', '&& ls', 'cd a b c d', 'rm', 'mkdir', 'wc -l nope', 'grep', 'head -n x notes.txt', 'echo a & echo b', 'constructor', '__proto__', 'toString'])
      expect(() => run(t, l)).not.toThrow();
    expect(run(t, 'nimportequoi')).toContain('commande introuvable'); expect(run(t, 'constructor')).toContain('commande introuvable');
  });
  it('sûr : pas de fichiers réels, taille bornée, rm de la racine ou du dossier courant refusés', () => {
    const t = fresh(); expect(run(t, 'rm -rf /')).toContain('impossible'); expect(run(t, 'rm -rf .')).toContain('impossible'); expect(t.nodes.size).toBeGreaterThan(3);
    for (let i = 0; i < 700; i++) run(t, `touch f${i}`); expect(t.nodes.size).toBeLessThanOrEqual(500);
    const out = run(t, 'echo ' + 'x'.repeat(9000)); expect(out.length).toBeLessThan(4100);
  });
  it('tokenize', () => { expect(tokenize('a "b c" d>e|f')).toEqual(['a', 'b c', 'd', '>', 'e', '|', 'f']); expect(tokenize("echo 'x")).toBeNull(); expect(tokenize('a && b >> c')).toEqual(['a', '&&', 'b', '>>', 'c']); });
  it('check : dossier courant, contenu, existence, absence, droits, sortie', () => {
    const t = fresh(); run(t, 'mkdir projet'); run(t, 'cd projet'); run(t, 'echo salut > a.txt'); run(t, 'chmod 600 a.txt'); run(t, 'ls');
    expect(check(t, { cwd: '/home/kintana/projet', fichiers: { '/home/kintana/projet/a.txt': 'salut' }, existent: ['/home/kintana/projet'], absents: ['/home/kintana/b.txt'], modes: { '/home/kintana/projet/a.txt': '600' }, sortie: 'a\\.txt' })).toEqual([]);
    expect(check(t, { cwd: '/', fichiers: { '/x': 'y' }, absents: ['/home'], modes: { '/home/kintana/projet/a.txt': '644' }, sortie: 'zzz' }).length).toBe(5);
  });
  it('cloneTerm : recommencer ne touche pas à l’original', () => { const t = fresh(), c = cloneTerm(t); run(c, 'rm notes.txt'); expect(run(t, 'ls')).toContain('notes.txt'); });
});
