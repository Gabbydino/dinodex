/* =========================================================
   DinoDex — módulo compartilhado
   Usado tanto pela lista (js/app.js) quanto pela ficha
   individual (js/detail.js), para não duplicar código nem
   dados. Os dados dos dinossauros vivem em data/dinos.json.
   ========================================================= */

let DINO_CACHE = null;

export async function loadDinos(){
  if(DINO_CACHE) return DINO_CACHE;
  // PONTO DE TROCA PARA API REAL: troque a linha abaixo por
  // fetch('https://sua-api.com/dinossauros') — o resto do site
  // continua igual, desde que cada item tenha os mesmos campos.
  const res = await fetch('data/dinos.json');
  DINO_CACHE = await res.json();
  return DINO_CACHE;
}

export function getAllDinosSync(){
  return DINO_CACHE || [];
}

/* ===== comportamento ("se você encontrasse um...") =====
   Estimativas de divulgação científica, não fatos comprovados. */
export const COMPORTAMENTOS = {
  1: "Caçador oportunista, também devora carcaças",
  2: "Ágil e provavelmente caça em grupo",
  3: "Defensivo — carga com os chifres se encurralado",
  4: "Calmo, mas perigoso se atacar com a cauda",
  5: "Pacífico, prefere fugir a enfrentar",
  6: "Caçador semiaquático, pesca em rios",
  7: "Defensivo, confia na própria blindagem",
  8: "Gregário, vive em grandes grupos",
  9: "Caçador de emboscada",
  10: "Pacífico, usa a cauda como chicote defensivo",
  11: "Cauteloso, foge em grupo ao perceber perigo",
  12: "Ágil e curioso, caça em pequenos bandos",
  13: "Territorial, disputa por cabeçadas",
  14: "Perseguidor veloz de presas ágeis",
  15: "Tranquilo, mas as garras intimidam predadores",
  16: "Caçador de grandes presas, possivelmente em bando",
  17: "Caça em grupo, com ataques coordenados",
  18: "Esquivo, prefere planar para escapar",
  19: "Gigante pacífico, movimento lento",
  20: "Mergulhador veloz atrás de peixes",
};

export const CURIOSIDADES = [
  "O Stegosaurus viveu cerca de 80 milhões de anos antes do T. rex — mais perto do Allosaurus do que dele.",
  "Nenhum ser humano jamais viveu ao mesmo tempo que um dinossauro não aviário.",
  "As aves atuais são consideradas dinossauros terópodes que sobreviveram até hoje.",
  "O nome 'dinossauro' significa 'lagarto terrível', criado pelo cientista Richard Owen em 1842.",
  "Alguns dinossauros, como o Velociraptor, provavelmente tinham penas.",
  "O maior ovo de dinossauro conhecido tinha cerca de 60 cm de comprimento.",
  "Nem todo réptil pré-histórico gigante era um dinossauro — pterossauros e répteis marinhos eram parentes, não dinossauros.",
  "O T. rex tinha um dos olfatos mais aguçados entre os dinossauros carnívoros.",
  "Alguns saurópodes engoliam pedras (gastrólitos) para ajudar a triturar plantas no estômago.",
  "Fósseis de dinossauros já foram encontrados em todos os continentes, incluindo a Antártida.",
  "O período Cretáceo terminou há cerca de 66 milhões de anos, com o impacto de um asteroide.",
  "O Spinosaurus é o único dinossauro conhecido adaptado para nadar e mergulhar.",
  "Muitos dinossauros herbívoros trocavam de dentes constantemente ao longo da vida.",
  "O Triceratops podia ter mais de mil dentes ao longo da vida, organizados em baterias dentárias.",
  "A era dos dinossauros durou cerca de 165 milhões de anos — os humanos existem há menos de 1% desse tempo.",
];

export function curiosidadeDoDia(){
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return CURIOSIDADES[dayOfYear % CURIOSIDADES.length];
}

export function dinoDoDia(dinos){
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return dinos[dayOfYear % dinos.length];
}

export const FONTES_PADRAO = [
  "Museus de história natural e enciclopédias de paleontologia",
  "Artigos científicos revisados por pares (ex.: Journal of Vertebrate Paleontology)",
  "Paleobiology Database (PBDB)"
];

/* ===== ícones em silhueta (reaproveitados por "forma") ===== */
export const ICONS = {
  theropod: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M8 58 L14 40 Q10 30 22 26 L34 8 Q40 2 48 6 L58 14 Q66 12 70 18 L64 22 Q72 24 74 30 L66 30 Q70 36 66 40 L58 38 Q54 46 44 46 L40 58 L34 58 L36 46 Q28 46 24 42 L20 58 Z"/>
  </svg>`,
  raptor: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M14 56 L18 42 Q14 34 24 30 L32 14 Q37 8 44 12 L52 18 Q60 16 63 22 L57 25 Q63 28 63 33 L55 32 Q52 40 43 40 L40 56 L35 56 L37 42 Q30 42 27 38 L24 56 Z"/>
  </svg>`,
  small: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M24 54 L27 44 Q23 38 30 34 L36 22 Q40 17 46 20 L52 25 Q58 24 60 29 L55 31 Q59 33 58 37 L52 36 Q50 42 43 42 L41 54 L37 54 L39 44 Q33 44 31 41 L29 54 Z"/>
  </svg>`,
  sauropod: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M6 52 Q10 30 26 16 Q30 8 36 12 Q40 15 36 20 Q48 24 58 34 Q70 30 78 36 Q84 40 80 44 Q88 46 88 52 L80 52 Q78 58 70 58 L68 52 L40 52 L38 58 L30 58 L32 52 Q18 52 14 46 Q8 48 6 52 Z"/>
  </svg>`,
  ceratopsian: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M10 56 L12 42 Q8 36 14 32 L18 20 L24 24 L28 16 L32 24 Q40 20 48 24 Q66 24 74 34 Q82 34 82 40 L74 42 Q76 48 68 50 L66 56 L60 56 L62 48 L26 48 L24 56 L18 56 L20 48 Q12 48 10 56 Z"/>
  </svg>`,
  stego: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M8 56 L10 44 Q6 38 12 34 L20 26 L24 32 L28 24 L34 32 L38 22 L44 32 L50 24 L54 34 Q66 32 70 40 Q78 38 78 44 L70 46 Q72 52 64 52 L62 56 L56 56 L58 50 L24 50 L22 56 L16 56 L18 50 Q10 50 8 56 Z"/>
  </svg>`,
  ankylosaur: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M8 44 Q8 32 20 30 L60 28 Q74 28 78 36 Q88 36 92 42 Q94 48 86 50 Q80 58 70 52 L26 52 Q16 58 10 50 Q4 48 8 44 Z"/>
  </svg>`,
  ornithopod: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M10 56 L14 40 Q10 32 20 28 L26 14 Q30 6 38 10 L34 18 Q44 16 50 22 L58 20 Q64 22 62 28 L54 30 Q52 38 42 38 L40 56 L34 56 L36 40 Q28 40 24 36 L20 56 Z"/>
  </svg>`,
  dome: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M14 56 L17 42 Q13 34 22 30 Q24 16 36 16 Q46 16 46 26 Q54 26 56 32 L50 34 Q48 40 40 40 L38 56 L33 56 L35 42 Q28 42 25 38 L22 56 Z"/>
  </svg>`,
  claws: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M20 56 L22 40 Q16 34 24 28 L30 14 Q34 8 40 12 L46 18 Q52 14 56 18 L50 22 Q56 24 52 28 L58 26 Q62 30 56 32 L46 32 Q44 40 36 40 L34 56 L28 56 L30 40 Q24 40 22 36 L22 56 Z"/>
  </svg>`,
  sail: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M8 58 L14 40 Q10 30 22 26 L30 6 L34 22 L40 4 L44 22 L50 8 L52 22 Q64 18 70 24 L64 28 Q72 28 74 34 L66 34 Q70 40 64 42 L56 40 Q52 48 42 48 L38 58 L32 58 L34 48 Q26 48 22 44 L18 58 Z"/>
  </svg>`,
  pterosaur: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M50 30 L14 10 L20 26 L4 24 L26 36 L2 40 L28 42 Q30 50 38 50 L36 58 L44 58 L44 48 L50 46 L56 48 L56 58 L64 58 L62 50 Q70 50 72 42 L98 40 L74 36 L96 24 L80 26 L86 10 L50 30 Z"/>
  </svg>`,
  marine: `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M4 34 Q10 20 24 22 Q30 12 40 16 Q38 22 34 24 Q46 22 56 30 Q66 24 76 30 Q84 26 92 32 Q86 36 78 36 Q84 42 80 48 Q74 44 72 38 Q62 44 50 40 Q40 46 30 40 Q20 46 12 40 Q16 36 22 36 Q10 38 4 34 Z"/>
  </svg>`
};

/* ===== coleção (descobertos / favoritos) — salvos no navegador ===== */
export function loadSet(key){
  try{ return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch(e){ return new Set(); }
}
export function saveSet(key, set){
  try{ localStorage.setItem(key, JSON.stringify([...set])); }
  catch(e){ /* localStorage indisponível — segue sem salvar */ }
}

export let discovered = loadSet('dinodex_discovered');
export let favorites = loadSet('dinodex_favorites');

export function markDiscovered(id){
  const isNew = !discovered.has(id);
  discovered.add(id);
  if(isNew) saveSet('dinodex_discovered', discovered);
  return isNew;
}

export function toggleFavorite(id){
  if(favorites.has(id)) favorites.delete(id); else favorites.add(id);
  saveSet('dinodex_favorites', favorites);
}

/* ===== conquistas ===== */
export function buildAchievements(dinos){
  return [
    {id:'first', label:'Primeira descoberta', test: () => discovered.size >= 1},
    {id:'ten', label:'10 espécies encontradas', test: () => discovered.size >= 10},
    {id:'carnivores', label:'Todos os carnívoros descobertos', test: () => dinos.filter(d=>d.dieta==='Carnívoro').every(d=>discovered.has(d.id))},
    {id:'jurassic', label:'Todas as espécies do Jurássico', test: () => dinos.filter(d=>d.era==='Jurássico').every(d=>discovered.has(d.id))},
    {id:'all', label:'Dex completa!', test: () => discovered.size >= dinos.length},
  ];
}
export let unlockedAchievements = loadSet('dinodex_achievements');

export function updateAchievementsCount(){
  const el = document.getElementById('achProgress');
  if(el) el.textContent = `🏆 ${unlockedAchievements.size}/${buildAchievements(getAllDinosSync()).length}`;
}

export function showToast(text){
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = text;
  document.body.appendChild(toast);
  beep();
  requestAnimationFrame(()=> toast.classList.add('show'));
  setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=> toast.remove(), 400);
  }, 2800);
}

export function checkAchievements(dinos){
  buildAchievements(dinos).forEach(a=>{
    if(!unlockedAchievements.has(a.id) && a.test()){
      unlockedAchievements.add(a.id);
      saveSet('dinodex_achievements', unlockedAchievements);
      showToast(`🏆 CONQUISTA<br><strong>${a.label}</strong>`);
    }
  });
  updateAchievementsCount();
}

export function updateProgress(totalDinos){
  const el = document.getElementById('dexProgress');
  if(el) el.textContent = `Descobertos: ${discovered.size}/${totalDinos}`;
}

/* ===== sons (Web Audio, opcional/silencioso se bloqueado) ===== */
export function beep(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.value = 0.04;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }catch(e){ /* áudio bloqueado pelo navegador — segue sem som */ }
}
export function tick(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 520;
    gain.gain.value = 0.025;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  }catch(e){ /* áudio bloqueado pelo navegador */ }
}
export function chirp(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.value = 0.04;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }catch(e){ /* áudio bloqueado pelo navegador */ }
}

/* ===== tema: "Noite Jurássica" (padrão, escuro) vs "Dia de Campo" (claro) ===== */
const THEME_KEY = 'dinodex_theme';

export function loadTheme(){
  try{ return localStorage.getItem(THEME_KEY) || 'noite'; }
  catch(e){ return 'noite'; }
}

export function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', theme === 'dia' ? '#f3ecd9' : '#12141c');
  document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
    btn.setAttribute('aria-pressed', theme === 'dia' ? 'true' : 'false');
    const icon = btn.querySelector('.theme-icon');
    const label = btn.querySelector('.theme-label');
    if(icon) icon.textContent = theme === 'dia' ? '☀' : '☾';
    if(label) label.textContent = theme === 'dia' ? 'Dia de campo' : 'Noite Jurássica';
  });
}

export function initTheme(){
  applyTheme(loadTheme());
  document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const next = loadTheme() === 'dia' ? 'noite' : 'dia';
      try{ localStorage.setItem(THEME_KEY, next); }catch(e){ /* segue sem salvar */ }
      applyTheme(next);
      tick();
    });
  });
}

/* ===== registro de leitura (progresso de "quanto você já leu" de cada ficha) ===== */
export const TRACK_KEYS = ['alimentacao','peso','local','curiosidades','formacao','fossil'];
export const TRACK_LABELS = {
  alimentacao:'Alimentação', peso:'Peso', local:'Local',
  curiosidades:'Curiosidades', formacao:'Formação', fossil:'Fóssil',
};
export function loadRegistro(){
  try{ return JSON.parse(localStorage.getItem('dinodex_registro') || "{}"); }
  catch(e){ return {}; }
}
export function saveRegistro(registro){
  try{ localStorage.setItem('dinodex_registro', JSON.stringify(registro)); }
  catch(e){ /* localStorage indisponível — segue sem salvar */ }
}

/* ===== pequenos helpers de renderização usados na ficha ===== */
export function statCells(value /* 0-10 */){
  let html = '<div class="stat-bar">';
  for(let i=1;i<=10;i++){
    html += `<span class="stat-cell${i<=value?' filled':''}"></span>`;
  }
  html += '</div>';
  return html;
}

export function starRating(count, max=5){
  let s = '';
  for(let i=1;i<=max;i++) s += (i<=count ? '★' : '☆');
  return s;
}

export function mapSVG(d){
  return `<svg viewBox="0 0 300 150" class="map-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa de ${d.local}">
    <rect x="0" y="0" width="300" height="150" class="map-ocean"/>
    <ellipse cx="70" cy="45" rx="46" ry="30" class="map-land"/>
    <ellipse cx="95" cy="108" rx="24" ry="36" class="map-land"/>
    <ellipse cx="168" cy="30" rx="20" ry="15" class="map-land"/>
    <ellipse cx="177" cy="82" rx="28" ry="40" class="map-land"/>
    <ellipse cx="240" cy="45" rx="56" ry="36" class="map-land"/>
    <ellipse cx="270" cy="122" rx="20" ry="15" class="map-land"/>
    <circle cx="${d.mapa.x}" cy="${d.mapa.y}" r="4" class="map-pin-pulse"/>
    <circle cx="${d.mapa.x}" cy="${d.mapa.y}" r="3" class="map-pin"/>
  </svg>`;
}

export function timelineHTML(d){
  const total = 252 - 66;
  const segments = [
    {name:'Triássico', start:252, end:201},
    {name:'Jurássico', start:201, end:145},
    {name:'Cretáceo', start:145, end:66},
  ];
  const segHtml = segments.map(s=>{
    const w = (s.start - s.end) / total * 100;
    return `<div class="tl-seg" style="width:${w}%">${s.name.toUpperCase()}</div>`;
  }).join('');
  const left = (252 - d.periodo.inicio) / total * 100;
  const width = Math.max(1.5, (d.periodo.inicio - d.periodo.fim) / total * 100);
  return `
    <div class="timeline">
      <div class="tl-track">${segHtml}<div class="tl-marker" style="left:${left}%;width:${width}%"></div></div>
      <div class="tl-scale"><span>252 Mya</span><span>201 Mya</span><span>145 Mya</span><span>66 Mya</span></div>
      <div class="section-caption">Viveu há ${d.periodo.inicio}–${d.periodo.fim} milhões de anos</div>
    </div>`;
}

export function classificacaoHTML(d){
  const [genero, ...resto] = d.latim.split(' ');
  const especie = resto.join(' ');
  const linhas = [
    ['Reino','Animalia'], ['Filo','Chordata'],
    ['Classe', d.classificacao.classe], ['Ordem', d.classificacao.ordem],
    ['Família', d.classificacao.familia], ['Gênero', genero], ['Espécie', especie],
  ];
  return `<ul class="tax-list">${linhas.map(([k,v])=>`<li><span>${k}</span><span>${v}</span></li>`).join('')}</ul>`;
}

export function curiosidadesHTML(d){
  const lista = d.curiosidades || [];
  if(lista.length === 0) return '';
  return `<ul class="curio-list">${lista.map(c=>`<li>${c}</li>`).join('')}</ul>`;
}

export function comparisonHTML(d, maxAltura){
  const containerH = 100;
  const dinoH = Math.max(4, (d.altura / maxAltura) * containerH);
  const humanH = Math.max(4, (1.7 / maxAltura) * containerH);
  return `
    <div class="compare-wrap">
      <div class="compare-col">
        <div class="compare-bar" style="height:${dinoH}px"></div>
        <div class="compare-label">${d.nome}<br>~${d.altura} m</div>
      </div>
      <div class="compare-col">
        <div class="compare-bar human" style="height:${humanH}px"></div>
        <div class="compare-label">Pessoa adulta<br>1,70 m</div>
      </div>
    </div>`;
}

export function discoveryHTML(d){
  return `
    <div class="discovery-box">
      <div data-track="fossil">📸 Descoberto por <strong>${d.descoberta.por}</strong>, em ${d.descoberta.ano}.</div>
      <div data-track="formacao">🦴 Formação geológica: ${d.formacao}</div>
      <div>📍 Local do achado: ${d.local}</div>
    </div>`;
}

export function sourcesHTML(){
  return `<div class="sources-box"><ul>${FONTES_PADRAO.map(f=>`<li>${f}</li>`).join('')}</ul></div>`;
}

export function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

/* ===== registro de service worker (PWA) — chamado pelas duas páginas ===== */
export function registerServiceWorker(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('sw.js').catch(()=>{ /* segue sem SW */ });
    });
  }
}
