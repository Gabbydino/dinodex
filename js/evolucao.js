import {
  loadDinos, ICONS, discovered, updateProgress, updateAchievementsCount,
  checkAchievements, registerServiceWorker, initTheme
} from './common.js';

const ERA_COLOR = { 'Triássico':'var(--era-triassico)', 'Jurássico':'var(--era-jurassico)', 'Cretáceo':'var(--era-cretaceo)' };

const contentEl = document.getElementById('evoContent');
let DINOS = [];

/* ===== Linhagens curadas =====
   Cada nó "ref" aponta para o id de uma espécie real do dinos.json.
   Nós sem "ref" (como "Aves modernas") são pontos de chegada
   ilustrativos que não existem no catálogo. */
const LINEAGES = [
  {
    icon: '🐦',
    title: 'Terópodes rumo às aves',
    blurb: 'O ramo mais estudado: pequenos terópodes ágeis foram, ao longo de dezenas de milhões de anos, ficando mais leves e emplumados — até que um grupo deles se tornou as aves de hoje.',
    nodes: [
      { ref: 21 },
      { ref: 12 },
      { ref: 18 },
      { end: true, icon: '🐦', label: 'Aves modernas', note: 'Vivas hoje — não fazem parte do catálogo de fósseis.' },
    ],
  },
  {
    icon: '🦖',
    title: 'Grandes predadores terópodes',
    blurb: 'Um ramo separado de terópodes, sem ligação direta com as aves, seguiu na direção oposta: corpos cada vez maiores e mordidas cada vez mais poderosas.',
    nodes: [{ ref: 9 }, { ref: 16 }, { ref: 6 }, { ref: 1 }],
  },
  {
    icon: '🌿',
    title: 'Saurópodes gigantes',
    blurb: 'Começaram pequenos e bípedes no Triássico. Ao longo do Jurássico, cresceram até virar os maiores animais que já pisaram na Terra.',
    nodes: [{ ref: 22 }, { ref: 19 }, { ref: 10 }, { ref: 5 }],
  },
  {
    icon: '🛡️',
    title: 'Blindados (Thyreophora)',
    blurb: 'Um grupo de herbívoros investiu em couraça e defesas passivas em vez de velocidade para escapar de predadores.',
    nodes: [{ ref: 4 }, { ref: 7 }],
  },
  {
    icon: '🦆',
    title: 'Bicos-de-pato (Ornitópodes)',
    blurb: 'Herbívoros de bando, com bicos córneos e fileiras de dentes preparadas para mastigar plantas duras.',
    nodes: [{ ref: 11 }, { ref: 8 }],
  },
];

/* Espécies que não formam uma linha reta no catálogo, mas valem uma nota. */
const SIDENOTES = [
  {
    icon: '🥊',
    title: 'Primos com armas diferentes',
    text: 'Tricerátops e Paquicefalossauro vêm do mesmo grande grupo (Marginocephalia), mas cada um evoluiu uma arma própria para disputas: chifres enormes de um lado, uma cúpula craniana reforçada do outro.',
    refs: [3, 13],
  },
  {
    icon: '☝️',
    title: 'Contemporâneos, mas não dinossauros',
    text: 'Pteranodonte (um pterossauro voador) e Mosassauro (um réptil marinho) viveram ao lado dos dinossauros e são parentes distantes deles — mas tecnicamente não pertencem ao grupo dos dinossauros.',
    refs: [20, 23],
  },
];

function findById(id){ return DINOS.find(d => d.id === id); }

function isDiscovered(id){ return discovered.has(id); }

function refNodeHTML(d){
  const found = isDiscovered(d.id);
  return `
    <a class="evo-node${found ? '' : ' evo-node-locked'}" href="dino.html?id=${d.id}" style="--era-color:${ERA_COLOR[d.era] || 'var(--gold)'}">
      <div class="evo-node-icon">${ICONS[d.forma] || ICONS.theropod}</div>
      <div class="evo-node-text">
        <div class="evo-node-name">${d.nome}${found ? ' <span class="evo-node-check" title="No seu catálogo">✓</span>' : ''}</div>
        <div class="evo-node-meta">${d.era} · ${d.periodo.inicio}–${d.periodo.fim} Mya</div>
      </div>
    </a>`;
}

function endNodeHTML(node){
  return `
    <div class="evo-node evo-node-end">
      <div class="evo-node-icon">${node.icon}</div>
      <div class="evo-node-text">
        <div class="evo-node-name">${node.label}</div>
        <div class="evo-node-meta">${node.note}</div>
      </div>
    </div>`;
}

function lineageHTML(lineage){
  const nodesHTML = lineage.nodes.map((n, i) => {
    const nodeHTML = n.end ? endNodeHTML(n) : (findById(n.ref) ? refNodeHTML(findById(n.ref)) : '');
    const arrow = i < lineage.nodes.length - 1 ? `<div class="evo-arrow" aria-hidden="true">↓</div>` : '';
    return nodeHTML + arrow;
  }).join('');

  return `
    <article class="evo-lineage">
      <div class="evo-lineage-head">
        <span class="evo-lineage-icon">${lineage.icon}</span>
        <h2 class="evo-lineage-title">${lineage.title}</h2>
      </div>
      <p class="evo-lineage-blurb">${lineage.blurb}</p>
      <div class="evo-chain">${nodesHTML}</div>
    </article>`;
}

function sidenoteHTML(note){
  const chips = note.refs.map(id => {
    const d = findById(id);
    return d ? `<a class="tag-pill evo-sidenote-chip" href="dino.html?id=${d.id}">${d.nome}</a>` : '';
  }).join('');
  return `
    <div class="evo-sidenote">
      <span class="evo-sidenote-icon">${note.icon}</span>
      <div>
        <div class="evo-sidenote-title">${note.title}</div>
        <p class="evo-sidenote-text">${note.text}</p>
        <div class="evo-sidenote-chips">${chips}</div>
      </div>
    </div>`;
}

function render(){
  contentEl.innerHTML = `
    <div class="evo-lineages">
      ${LINEAGES.map(lineageHTML).join('')}
    </div>
    <div class="evo-sidenotes-wrap">
      <p class="section-eyebrow">Outros parentescos curiosos</p>
      ${SIDENOTES.map(sidenoteHTML).join('')}
    </div>
  `;
}

async function init(){
  registerServiceWorker();
  initTheme();
  DINOS = await loadDinos();

  updateProgress(DINOS.length);
  updateAchievementsCount();
  checkAchievements(DINOS);

  render();
}
init();
