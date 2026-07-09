import {
  loadDinos, ICONS, discovered, favorites, toggleFavorite,
  updateProgress, updateAchievementsCount, checkAchievements,
  curiosidadeDoDia, dinoDoDia, tick, chirp, registerServiceWorker
} from './common.js';

const ERA_COLOR = { 'Triássico':'var(--era-triassico)', 'Jurássico':'var(--era-jurassico)', 'Cretáceo':'var(--era-cretaceo)' };
const ERAS = ["Todas","Triássico","Jurássico","Cretáceo"];
const DIETS = ["Todas","Carnívoro","Herbívoro","Onívoro","Piscívoro"];

let DINOS = [];
let searchTerm = "";
let activeEra = "Todas";
let activeDiet = "Todas";
let favOnly = false;

const gridEl = document.getElementById('dinoGrid');
const filtersEl = document.getElementById('filters');
const searchEl = document.getElementById('search');
const dailyFactEl = document.getElementById('dailyFact');

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
    searchTerm=""; activeEra="Todas"; activeDiet="Todas"; favOnly=false;
    searchEl.value="";
    buildFilters(); renderGrid();
  });
  specialGroup.appendChild(resetBtn);

  filtersEl.appendChild(specialGroup);
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
    const matchesFav = !favOnly || favorites.has(d.id);
    return matchesSearch && matchesEra && matchesDiet && matchesFav;
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
      </div>
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

async function init(){
  registerServiceWorker();
  dailyFactEl.innerHTML = `<strong>🦴 Você sabia?</strong> ${curiosidadeDoDia()}`;
  DINOS = await loadDinos();
  buildFilters();
  updateProgress(DINOS.length);
  updateAchievementsCount();
  checkAchievements(DINOS);
  renderGrid();

  searchEl.addEventListener('input', (e)=>{ searchTerm = e.target.value; renderGrid(); });
}
init();
