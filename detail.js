import {
  loadDinos, ICONS, discovered, favorites, toggleFavorite, markDiscovered,
  updateProgress, updateAchievementsCount, checkAchievements, showToast,
  statCells, starRating, mapSVG, timelineHTML, classificacaoHTML,
  comparisonHTML, discoveryHTML, sourcesHTML, curiosidadesHTML, COMPORTAMENTOS,
  TRACK_KEYS, TRACK_LABELS, loadRegistro, saveRegistro,
  chirp, registerServiceWorker, initTheme
} from './common.js';

const ERA_COLOR = { 'Triássico':'var(--era-triassico)', 'Jurássico':'var(--era-jurassico)', 'Cretáceo':'var(--era-cretaceo)' };

const detailEl = document.getElementById('detailContent');
let registro = loadRegistro();
let trackObserver = null;
let DINOS = [];

function getIdFromURL(){
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id'));
}

function regPanelInner(d){
  const done = new Set(registro[d.id] || []);
  const percent = Math.round((done.size / TRACK_KEYS.length) * 100);
  const checklist = TRACK_KEYS.map(k =>
    `<span class="reg-item${done.has(k) ? ' done' : ''}">${done.has(k) ? '✓' : '○'} ${TRACK_LABELS[k]}</span>`
  ).join('');
  return `
    <div class="reg-row"><span>Registro da ficha</span><span>${percent===100 ? 'COMPLETO' : percent+'%'}</span></div>
    <div class="reg-track"><div class="reg-fill" style="width:${percent}%"></div></div>
    <div class="reg-checklist">${checklist}</div>
  `;
}

function updateRegPanel(d){
  const el = document.getElementById('regPanel');
  if(el) el.innerHTML = regPanelInner(d);
}

function setupTracking(d){
  if(trackObserver) trackObserver.disconnect();
  const root = detailEl;
  trackObserver = new IntersectionObserver((entries)=>{
    const list = registro[d.id] || (registro[d.id] = []);
    const before = list.length;
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const key = entry.target.getAttribute('data-track');
        if(key && !list.includes(key)) list.push(key);
      }
    });
    if(list.length !== before){
      saveRegistro(registro);
      updateRegPanel(d);
      if(before < TRACK_KEYS.length && list.length === TRACK_KEYS.length){
        showToast('📋 Registro completo desta ficha!');
      }
    }
  }, {threshold:0.6});
  root.querySelectorAll('[data-track]').forEach(el => trackObserver.observe(el));
}

function setSEO(d){
  const title = `${d.nome} (${d.latim}) — DinoDex`;
  const desc = d.desc.length > 155 ? d.desc.slice(0,152) + '…' : d.desc;
  document.title = title;
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageDescription').setAttribute('content', desc);
  document.getElementById('ogTitle').setAttribute('content', title);
  document.getElementById('ogDescription').setAttribute('content', desc);
  document.getElementById('pageCanonical').setAttribute('href', `https://gabbydino.github.io/dinodex/dino.html?id=${d.id}`);
}

function renderDetail(d){
  setSEO(d);
  const maxComp = Math.max(...DINOS.map(x=>x.comprimento));
  const maxPeso = Math.max(...DINOS.map(x=>x.peso));
  const maxAltura = Math.max(...DINOS.map(x=>x.altura));
  const compScore = Math.max(1, Math.round((d.comprimento/maxComp)*10));
  const pesoScore = Math.max(1, Math.round((d.peso/maxPeso)*10));
  const distanciaSegura = Math.max(1, Math.min(5, Math.round(d.perigo/2)));
  const chanceEscapar = Math.max(1, Math.min(5, Math.round((10 - d.velocidade)/2)));
  const velocidadeCorrida = Math.max(1, Math.min(5, Math.round(d.velocidade/2)));
  const comportamento = COMPORTAMENTOS[d.id] || "Comportamento pouco conhecido";
  const isFav = favorites.has(d.id);
  const eraColor = ERA_COLOR[d.era] || 'var(--gold)';

  detailEl.innerHTML = `
    <article class="detail-card" style="--era-color:${eraColor}">
      <div class="detail-hero">
        <div class="d-header">
          <span class="d-num">Nº${String(d.id).padStart(3,'0')}</span>
          <button class="fav-btn" id="favBtn" aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
            <span>${isFav ? '❤' : '♡'}</span><span class="label">FAVORITAR</span>
          </button>
        </div>
        <div class="d-title-row">
          <div class="d-illustration">
            <div class="d-icon">${ICONS[d.forma] || ICONS.theropod}</div>
            <span class="d-illustration-tag">ESPÉCIME Nº${String(d.id).padStart(3,'0')}</span>
          </div>
          <div>
            <h1 class="d-name">${d.nome}</h1>
            <div class="d-latin">${d.latim}</div>
          </div>
        </div>
        <div class="tag-row">
          <span class="tag" data-track="alimentacao">${d.dieta}</span>
          <span class="tag">${d.era}</span>
          <span class="tag">${d.regiao}</span>
        </div>
      </div>

      <div class="reg-panel" id="regPanel">${regPanelInner(d)}</div>

      <div class="d-body">
        <div class="stats-block">
          <div class="stat"><span class="stat-label">Tamanho</span>${statCells(compScore)}<span>${d.comprimento} m</span></div>
          <div class="stat" data-track="peso"><span class="stat-label">Peso</span>${statCells(pesoScore)}<span>${d.peso} kg</span></div>
        </div>
        <div>
          <div class="desc">${d.desc}</div>
          <div class="fact" data-track="curiosidades">✦ ${d.fato}</div>
        </div>

        <div class="section" data-track="local">
          <div class="section-title">📍 Onde foi encontrado</div>
          ${mapSVG(d)}
          <div class="section-caption">${d.local} (${d.regiao})</div>
        </div>

        <div class="section">
          <div class="section-title">📅 Linha do tempo</div>
          ${timelineHTML(d)}
        </div>

        <div class="section">
          <div class="section-title">🦴 Formação &amp; descoberta</div>
          ${discoveryHTML(d)}
        </div>

        <div class="section">
          <div class="section-title">🧬 Classificação completa</div>
          ${classificacaoHTML(d)}
        </div>

        <div class="section">
          <div class="section-title">📏 Comparado a uma pessoa</div>
          ${comparisonHTML(d, maxAltura)}
        </div>

        <div class="section">
          <div class="section-title">⚠️ Se você encontrasse um...</div>
          <div class="encounter-box">
            <div class="encounter-row"><span>Distância segura</span><span class="stars">${starRating(distanciaSegura)}</span></div>
            <div class="encounter-row"><span>Chance de escapar</span><span class="stars">${starRating(chanceEscapar)}</span></div>
            <div class="encounter-row"><span>Velocidade de corrida</span><span class="stars">${starRating(velocidadeCorrida)}</span></div>
            <div class="encounter-row"><span>Comportamento</span><span>${comportamento}</span></div>
            <div class="encounter-disclaimer">* estimativas pra diversão, inspiradas em reconstruções científicas — não são fatos comprovados.</div>
          </div>
        </div>

        ${(d.curiosidades && d.curiosidades.length) ? `
        <div class="section">
          <div class="section-title">🔍 Mais curiosidades</div>
          ${curiosidadesHTML(d)}
        </div>` : ''}

        <div class="section">
          <div class="section-title">📚 Fontes</div>
          ${sourcesHTML()}
        </div>
      </div>
    </article>

    <nav class="detail-nav" aria-label="Navegar entre dinossauros">
      <button class="nav-btn" id="prevBtn">◀ Anterior</button>
      <a class="nav-btn nav-btn-accent" href="compare.html?a=${d.id}">⚖ Comparar</a>
      <button class="nav-btn" id="nextBtn">Próximo ▶</button>
    </nav>
  `;

  document.getElementById('favBtn').addEventListener('click', ()=>{
    chirp();
    toggleFavorite(d.id);
    renderDetail(d);
  });

  const idx = DINOS.findIndex(x=>x.id===d.id);
  document.getElementById('prevBtn').addEventListener('click', ()=>{
    const prev = DINOS[(idx - 1 + DINOS.length) % DINOS.length];
    window.location.href = `dino.html?id=${prev.id}`;
  });
  document.getElementById('nextBtn').addEventListener('click', ()=>{
    const next = DINOS[(idx + 1) % DINOS.length];
    window.location.href = `dino.html?id=${next.id}`;
  });

  setupTracking(d);
}

async function init(){
  registerServiceWorker();
  initTheme();
  DINOS = await loadDinos();
  const id = getIdFromURL();
  const d = DINOS.find(x=>x.id===id);

  updateProgress(DINOS.length);
  updateAchievementsCount();

  if(!d){
    detailEl.innerHTML = `
      <div class="grid-empty" style="padding:60px 0;">
        Dinossauro não encontrado. <a href="index.html" style="color:var(--gold-soft)">Voltar ao catálogo</a>.
      </div>`;
    return;
  }

  markDiscovered(d.id);
  updateProgress(DINOS.length);
  checkAchievements(DINOS);
  renderDetail(d);
}
init();
