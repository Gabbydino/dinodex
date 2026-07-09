import {
  loadDinos, ICONS, discovered, updateProgress, updateAchievementsCount,
  checkAchievements, tick, chirp, registerServiceWorker, initTheme
} from './common.js';

const ERA_COLOR = { 'Triássico':'var(--era-triassico)', 'Jurássico':'var(--era-jurassico)', 'Cretáceo':'var(--era-cretaceo)' };

const contentEl = document.getElementById('compareContent');
let DINOS = [];
let discoveredDinos = [];
let idA = null;
let idB = null;

function getParamId(){
  const params = new URLSearchParams(window.location.search);
  const n = Number(params.get('a'));
  return Number.isFinite(n) ? n : null;
}

function findById(id){
  return DINOS.find(d => d.id === id);
}

function renderEmptyState(){
  contentEl.innerHTML = `
    <div class="grid-empty" style="padding:60px 0;">
      Você precisa descobrir pelo menos <strong>2 dinossauros</strong> no catálogo antes de poder compará-los aqui.<br><br>
      <a href="index.html" style="color:var(--gold-soft)">← Ir explorar o catálogo</a>
    </div>`;
}

function pickerOptions(selectedId){
  return discoveredDinos.map(d =>
    `<option value="${d.id}" ${d.id===selectedId ? 'selected' : ''}>${d.nome} (${d.latim})</option>`
  ).join('');
}

function metricBar(label, valA, valB, unit){
  const max = Math.max(valA, valB, 0.0001);
  const wA = Math.max(4, Math.round((valA/max)*100));
  const wB = Math.max(4, Math.round((valB/max)*100));
  return `
    <div class="cmp-metric">
      <div class="cmp-metric-label">${label}</div>
      <div class="cmp-metric-row">
        <span class="cmp-metric-val">${valA}${unit}</span>
        <div class="cmp-metric-track"><div class="cmp-metric-fill a" style="width:${wA}%"></div></div>
      </div>
      <div class="cmp-metric-row">
        <span class="cmp-metric-val">${valB}${unit}</span>
        <div class="cmp-metric-track"><div class="cmp-metric-fill b" style="width:${wB}%"></div></div>
      </div>
    </div>`;
}

function dinoCardHTML(d, side){
  return `
    <div class="cmp-card cmp-card-${side}" style="--era-color:${ERA_COLOR[d.era] || 'var(--gold)'}">
      <div class="cmp-card-icon">${ICONS[d.forma] || ICONS.theropod}</div>
      <div class="cmp-card-name">${d.nome}</div>
      <div class="cmp-card-latin">${d.latim}</div>
      <div class="cmp-card-tags">
        <span class="tag-pill">${d.era}</span>
        <span class="tag-pill">${d.dieta}</span>
        ${d.tipo ? `<span class="tag-pill">${d.tipo}</span>` : ''}
      </div>
    </div>`;
}

function renderComparison(){
  const dA = findById(idA);
  const dB = findById(idB);
  if(!dA || !dB) return;

  contentEl.innerHTML = `
    <div class="cmp-pickers">
      <select id="pickA" class="cmp-select" aria-label="Escolher primeiro dinossauro">${pickerOptions(idA)}</select>
      <button type="button" class="chip special" id="swapBtn" aria-label="Trocar dinossauros">⇄ Trocar</button>
      <select id="pickB" class="cmp-select" aria-label="Escolher segundo dinossauro">${pickerOptions(idB)}</select>
    </div>

    <div class="cmp-cards-row">
      ${dinoCardHTML(dA, 'a')}
      <div class="cmp-vs">VS</div>
      ${dinoCardHTML(dB, 'b')}
    </div>

    <div class="cmp-metrics">
      ${metricBar('Comprimento', dA.comprimento, dB.comprimento, ' m')}
      ${metricBar('Altura', dA.altura, dB.altura, ' m')}
      ${metricBar('Peso', dA.peso, dB.peso, ' kg')}
    </div>

    <div class="cmp-facts">
      <div class="cmp-fact-row"><span>Dieta</span><span>${dA.dieta}</span><span>${dB.dieta}</span></div>
      <div class="cmp-fact-row"><span>Período</span><span>${dA.era} (${dA.periodo.inicio}–${dA.periodo.fim} Mya)</span><span>${dB.era} (${dB.periodo.inicio}–${dB.periodo.fim} Mya)</span></div>
      <div class="cmp-fact-row"><span>Local</span><span>${dA.local}</span><span>${dB.local}</span></div>
    </div>

    <div class="cmp-links">
      <a class="nav-btn" href="dino.html?id=${dA.id}">Ver ficha de ${dA.nome}</a>
      <a class="nav-btn" href="dino.html?id=${dB.id}">Ver ficha de ${dB.nome}</a>
    </div>
  `;

  document.getElementById('pickA').addEventListener('change', (e)=>{
    chirp(); idA = Number(e.target.value); renderComparison();
  });
  document.getElementById('pickB').addEventListener('change', (e)=>{
    chirp(); idB = Number(e.target.value); renderComparison();
  });
  document.getElementById('swapBtn').addEventListener('click', ()=>{
    tick(); [idA, idB] = [idB, idA]; renderComparison();
  });
}

async function init(){
  registerServiceWorker();
  initTheme();
  DINOS = await loadDinos();
  discoveredDinos = DINOS.filter(d => discovered.has(d.id));

  updateProgress(DINOS.length);
  updateAchievementsCount();
  checkAchievements(DINOS);

  if(discoveredDinos.length < 2){
    renderEmptyState();
    return;
  }

  const paramId = getParamId();
  const paramIsDiscovered = paramId !== null && discovered.has(paramId);
  idA = paramIsDiscovered ? paramId : discoveredDinos[0].id;
  idB = discoveredDinos.find(d => d.id !== idA)?.id ?? discoveredDinos[0].id;

  renderComparison();
}
init();
