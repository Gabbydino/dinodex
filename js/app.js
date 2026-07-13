import {
  loadDinos, ICONS, discovered, favorites, toggleFavorite,
  updateProgress, updateAchievementsCount, checkAchievements,
  curiosidadeDoDia, dinoDoDia, tick, chirp, registerServiceWorker,
  initTheme, grupoLabel, paisesDoLocal, continenteDoDino
} from './common.js';

const ERA_COLOR = { 'Triássico':'var(--era-triassico)', 'Jurássico':'var(--era-jurassico)', 'Cretáceo':'var(--era-cretaceo)' };
const ERAS = ["Todas","Triássico","Jurássico","Cretáceo"];
const DIETS = ["Todas","Carnívoro","Herbívoro","Onívoro","Piscívoro"];
const TIPOS = ["Todos","Terópode","Saurópode","Voador","Marinho"];
const CONTINENTES = ["Todos","América do Norte","América do Sul","Europa","África","Ásia","Oceania","Antártida"];
const ERA_ORDER = [
  {name:'Triássico', start:252, end:201},
  {name:'Jurássico', start:201, end:145},
  {name:'Cretáceo', start:145, end:66},
];

let DINOS = [];
let searchTerm = "";
let activeEra = "Todas";
let activeDiet = "Todas";
let activeTipo = "Todos";
let activeContinente = "Todos";
let favOnly = false;

const gridEl = document.getElementById('dinoGrid');
const filtersEl = document.getElementById('filters');
const searchEl = document.getElementById('search');
const dailyFactEl = document.getElementById('dailyFact');
const eraTimelineEl = document.getElementById('eraTimeline');

function buildFilters(){
  filtersEl.innerHTML = "";

  const eraGroup = document.createElement('div');
  eraGroup.className = 'filter-group';
  eraGroup.innerHTML = `<span class="filter-group-label">Período</span>`;
  ERAS.forEach(era=>{
    const b = document.createElement('button');
    b.className = 'chip' + (era===activeEra ? ' active' : '');
    b.textContent = era;
    b.addEventListener('click', ()=>{ tick(); activeEra = era; buildFilters(); renderGrid(); });
    eraGroup.appendChild(b);
  });
  filtersEl.appendChild(eraGroup);

  const dietGroup = document.createElement('div');
  dietGroup.className = 'filter-group';
  dietGroup.innerHTML = `<span class="filter-group-label">Grupo</span>`;
  DIETS.forEach(diet=>{
    const b = document.createElement('button');
    b.className = 'chip' + (diet===activeDiet ? ' active' : '');
    b.textContent = diet;
    b.addEventListener('click', ()=>{ tick(); activeDiet = diet; buildFilters(); renderGrid(); });
    dietGroup.appendChild(b);
  });
  filtersEl.appendChild(dietGroup);

  const tipoGroup = document.createElement('div');
  tipoGroup.className = 'filter-group';
  tipoGroup.innerHTML = `<span class="filter-group-label">Tipo</span>`;
  TIPOS.forEach(tipo=>{
    const b = document.createElement('button');
    b.className = 'chip' + (tipo===activeTipo ? ' active' : '');
    b.textContent = tipo;
    b.addEventListener('click', ()=>{ tick(); activeTipo = tipo; buildFilters(); renderGrid(); });
    tipoGroup.appendChild(b);
  });
  filtersEl.appendChild(tipoGroup);

  const continenteGroup = document.createElement('div');
  continenteGroup.className = 'filter-group';
  continenteGroup.innerHTML = `<span class="filter-group-label">Continente</span>`;
  CONTINENTES.forEach(continente=>{
    const b = document.createElement('button');
    b.className = 'chip' + (continente===activeContinente ? ' active' : '');
    b.textContent = continente;
    b.addEventListener('click', ()=>{ tick(); activeContinente = continente; buildFilters(); renderGrid(); });
    continenteGroup.appendChild(b);
  });
  filtersEl.appendChild(continenteGroup);

  const specialGroup = document.createElement('div');
  specialGroup.className = 'filter-group';

  const favBtn = document.createElement('button');
  favBtn.className = 'chip special' + (favOnly ? ' active' : '');
  favBtn.textContent = '❤ Favoritos';
  favBtn.addEventListener('click', ()=>{ tick(); favOnly = !favOnly; buildFilters(); renderGrid(); });
  specialGroup.appendChild(favBtn);

  const dayBtn = document.createElement('button');
  dayBtn.className = 'chip special';
  dayBtn.textContent = '★ Dino do dia';
  dayBtn.addEventListener('click', ()=>{ tick(); goTo(dinoDoDia(DINOS).id); });
  specialGroup.appendChild(dayBtn);

  const randomBtn = document.createElement('button');
  randomBtn.className = 'chip special';
  randomBtn.textContent = '🎲 Sortear';
  randomBtn.addEventListener('click', ()=>{
    const dinos = filteredDinos();
    if(dinos.length===0) return;
    tick();
    goTo(dinos[Math.floor(Math.random()*dinos.length)].id);
  });
  specialGroup.appendChild(randomBtn);

  const resetBtn = document.createElement('button');
  resetBtn.className = 'chip special';
  resetBtn.textContent = '✕ Limpar filtros';
  resetBtn.addEventListener('click', ()=>{
    tick();
    searchTerm=""; activeEra="Todas"; activeDiet="Todas"; activeTipo="Todos"; activeContinente="Todos"; favOnly=false;
    searchEl.value="";
    buildFilters(); renderGrid();
  });
  specialGroup.appendChild(resetBtn);

  filtersEl.appendChild(specialGroup);
}

function buildEraTimeline(){
  if(!eraTimelineEl) return;
  const total = 252 - 66;
  eraTimelineEl.innerHTML = ERA_ORDER.map(seg=>{
    const w = (seg.start - seg.end) / total * 100;
    const count = DINOS.filter(d=>d.era===seg.name).length;
    const isActive = activeEra === seg.name;
    return `
      <button type="button" class="era-block${isActive ? ' active' : ''}" style="width:${w}%; --era-color:var(--era-${seg.name==='Triássico'?'triassico':seg.name==='Jurássico'?'jurassico':'cretaceo'})" data-era="${seg.name}">
        <span class="era-block-name">${seg.name}</span>
        <span class="era-block-range">${seg.start}–${seg.end} Mya</span>
        <span class="era-block-count">${count} espécie${count===1?'':'s'}</span>
      </button>`;
  }).join('');
  eraTimelineEl.querySelectorAll('.era-block').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tick();
      const era = btn.getAttribute('data-era');
      activeEra = (activeEra === era) ? "Todas" : era;
      buildFilters();
      buildEraTimeline();
      renderGrid();
      document.getElementById('dinoGrid').scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}

function goTo(id){
  window.location.href = `dino.html?id=${id}`;
}

function filteredDinos(){
  return DINOS.filter(d=>{
    const matchesSearch = d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           d.latim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEra = activeEra==="Todas" || d.era===activeEra;
    const matchesDiet = activeDiet==="Todas" || d.dieta===activeDiet;
    const matchesTipo = activeTipo==="Todos" || d.tipo===activeTipo;
    const matchesContinente = activeContinente==="Todos" || continenteDoDino(d)===activeContinente;
    const matchesFav = !favOnly || favorites.has(d.id);
    return matchesSearch && matchesEra && matchesDiet && matchesTipo && matchesContinente && matchesFav;
  });
}

function renderGrid(){
  const dinos = filteredDinos();
  gridEl.innerHTML = "";
  if(dinos.length===0){
    gridEl.innerHTML = `<div class="grid-empty">Nenhum dinossauro encontrado com esses filtros.</div>`;
    return;
  }
  dinos.forEach((d, i)=>{
    const isDiscovered = discovered.has(d.id);
    const isFav = favorites.has(d.id);
    const card = document.createElement('div');
    card.className = 'card' + (isDiscovered ? '' : ' undiscovered');
    card.style.setProperty('--era-color', ERA_COLOR[d.era] || 'var(--gold)');
    card.style.animationDelay = `${Math.min(i*25, 300)}ms`;
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', isDiscovered ? `Ver ficha de ${d.nome}` : 'Dinossauro ainda não descoberto');
    card.innerHTML = `
      <div class="card-top">
        <span class="card-num">Nº${String(d.id).padStart(3,'0')}</span>
        <button class="card-fav" type="button" aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${isFav ? '❤' : '♡'}</button>
      </div>
      <div class="card-icon">${ICONS[d.forma] || ICONS.theropod}</div>
      <div class="card-name">${isDiscovered ? d.nome : '???'}</div>
      <div class="card-latin">${isDiscovered ? d.latim : ''}</div>
      <div class="card-tags">
        <span class="tag-pill">${isDiscovered ? d.era : '—'}</span>
        <span class="tag-pill">${isDiscovered ? d.dieta : '—'}</span>
        <span class="tag-pill">${isDiscovered ? grupoLabel(d) : '—'}</span>
      </div>
      <div class="card-view-btn">${isDiscovered ? 'Ver ficha →' : 'Descubra pra ver a ficha'}</div>
    `;
    card.querySelector('.card-fav').addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      chirp();
      toggleFavorite(d.id);
      renderGrid();
    });
    card.addEventListener('click', ()=> goTo(d.id));
    card.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); goTo(d.id); }
    });
    gridEl.appendChild(card);
  });
}

function renderStats(){
  const statsEl = document.getElementById('statsGrid');
  if(!statsEl) return;
  const paises = new Set();
  let totalCuriosidades = 0;
  DINOS.forEach(d=>{
    paisesDoLocal(d.local).forEach(p => paises.add(p));
    totalCuriosidades += 1 + (d.curiosidades ? d.curiosidades.length : 0); // "fato" + curiosidades extras
  });
  const periodos = new Set(DINOS.map(d=>d.era));

  const cards = [
    {icon:'🦖', num:DINOS.length, label:'Espécies cadastradas'},
    {icon:'🌍', num:paises.size, label:'Países com fósseis'},
    {icon:'🦴', num:periodos.size, label:'Períodos representados'},
    {icon:'📚', num:totalCuriosidades, label:'Curiosidades catalogadas'},
  ];
  statsEl.innerHTML = cards.map(c => `
    <div class="stat-card">
      <span class="stat-card-icon" aria-hidden="true">${c.icon}</span>
      <div>
        <div class="stat-card-num">${c.num}</div>
        <div class="stat-card-label">${c.label}</div>
      </div>
    </div>
  `).join('');
}

async function init(){
  registerServiceWorker();
  initTheme();
  dailyFactEl.innerHTML = `<strong>🦴 Você sabia?</strong> ${curiosidadeDoDia()}`;
  DINOS = await loadDinos();
  const eyebrowEl = document.getElementById('heroEyebrow');
  if(eyebrowEl) eyebrowEl.textContent = `Catálogo de campo · ${DINOS.length} espécies`;
  buildFilters();
  buildEraTimeline();
  renderStats();
  updateProgress(DINOS.length);
  updateAchievementsCount();
  checkAchievements(DINOS);
  renderGrid();

  searchEl.addEventListener('input', (e)=>{ searchTerm = e.target.value; renderGrid(); });
}
init();
