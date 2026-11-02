import fs from 'node:fs'; import { parse } from 'yaml'; import katex from 'katex';
const dir='content/niveaux', bad={katex:[],qcm:[],retenir:[],en:[],dup:[]};
const walk=(v,f,p='')=>{ if(typeof v==='string') f(v,p); else if(Array.isArray(v)) v.forEach((x,i)=>walk(x,f,p+'/'+i)); else if(v&&typeof v==='object') for(const k in v) walk(v[k],f,p+'/'+k); };
for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.yaml'))){
  const L=parse(fs.readFileSync(`${dir}/${file}`,'utf8'));
  if(!L.cartes.some(c=>c.type==='retenir')) bad.retenir.push(L.id);
  for(const c of L.cartes){
    walk(c,(s,p)=>{ if(/\/(code|verif|depart|tests|solutionCode|sortie)$/.test(p)) return;
      for(const m of s.replace(/`[^`]*`/g,'').matchAll(/\$([^$]+)\$/g)){ try{ katex.renderToString(m[1],{throwOnError:true}); }catch(e){ bad.katex.push(`${L.id} ${c.id}${p}: ${m[1].slice(0,40)} → ${String(e.message).slice(0,60)}`);} } });
    if(c.choix){ const j=c.choix.filter(x=>x.juste).length; if(j!==1) bad.qcm.push(`${L.id} ${c.id}: ${j} bonnes réponses`);
      const fr=c.choix.map(x=>x.fr); if(new Set(fr).size!==fr.length) bad.dup.push(`${L.id} ${c.id}`); }
    for(const k of ['fr']) if(c[k] && !c.en) bad.en.push(`${L.id} ${c.id}`);
    if(c.fr && c.en && c.fr===c.en && c.fr.length>40) bad.en.push(`${L.id} ${c.id} (identique)`);
  }
}
for(const k in bad) console.log(k, bad[k].length, bad[k].slice(0,15));
