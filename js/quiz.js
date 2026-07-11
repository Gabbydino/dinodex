import {
  loadDinos, grupoLabel, tick, beep, buzz, chirp,
  registerServiceWorker, initTheme, updateProgress, updateAchievementsCount, checkAchievements
} from './common.js';

const TOTAL_PERGUNTAS = 10;

/* =========================================================
   BANCO DE PERGUNTAS — gerado dinamicamente a partir do
   dinos.json, em vez de uma lista fixa de 100 perguntas.

   Por quê: com 9 modelos de pergunta diferentes x 102 espécies,
   já existem muito mais que 100 combinações possíveis — e esse
   número cresce sozinho a cada dinossauro novo adicionado ao
   catálogo, sem precisar escrever pergunta por pergunta à mão.
   ========================================================= */

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function amostra(arr, n){
  return shuffle(arr).slice(0, n);
}

function valoresUnicos(dinos, getter, excluir){
  const set = new Set();
  dinos.forEach(d=>{
    const v = getter(d);
    if(v && v !== excluir) set.add(v);
  });
  return [...set];
}

const TEMPLATES = [
  // ===== 1. Era =====
  (d, dinos) => {
    const outras = valoresUnicos(dinos, x=>x.era, d.era);
    if(outras.length < 1) return null;
    const opcoes = shuffle([d.era, ...amostra(outras, Math.min(2, outras.length))]);
    return { pergunta: `Em qual período o ${d.nome} viveu?`, opcoes, correta: d.era };
  },
  // ===== 2. Dieta =====
  (d, dinos) => {
    const outras = valoresUnicos(dinos, x=>x.dieta, d.dieta);
    if(outras.length < 2) return null;
    const opcoes = shuffle([d.dieta, ...amostra(outras, Math.min(3, outras.length))]);
    return { pergunta: `Qual era a dieta do ${d.nome}?`, opcoes, correta: d.dieta };
  },
  // ===== 3. Região/local de descoberta =====
  (d, dinos) => {
    const outras = valoresUnicos(dinos, x=>x.regiao, d.regiao);
    if(outras.length < 3) return null;
    const opcoes = shuffle([d.regiao, ...amostra(outras, 3)]);
    return { pergunta: `Onde foram encontrados fósseis do ${d.nome}?`, opcoes, correta: d.regiao };
  },
  // ===== 4. Grupo taxonômico =====
  (d, dinos) => {
    const grupo = grupoLabel(d);
    const outras = valoresUnicos(dinos, x=>grupoLabel(x), grupo);
    if(outras.length < 3) return null;
    const opcoes = shuffle([grupo, ...amostra(outras, 3)]);
    return { pergunta: `A qual grupo o ${d.nome} pertence?`, opcoes, correta: grupo };
  },
  // ===== 5. Quem descobriu =====
  (d, dinos) => {
    if(!d.descoberta || !d.descoberta.por) return null;
    const outras = valoresUnicos(dinos, x=>x.descoberta && x.descoberta.por, d.descoberta.por);
    if(outras.length < 3) return null;
    const opcoes = shuffle([d.descoberta.por, ...amostra(outras, 3)]);
    return { pergunta: `Quem descobriu o ${d.nome}?`, opcoes, correta: d.descoberta.por };
  },
  // ===== 6. Ano de descoberta =====
  (d, dinos) => {
    if(!d.descoberta || !d.descoberta.ano) return null;
    const anoCerto = d.descoberta.ano;
    const distratores = new Set();
    const offsets = [7, -12, 21, -30, 45, -8, 15];
    for(const off of shuffle(offsets)){
      const candidato = anoCerto + off;
      if(candidato !== anoCerto && candidato > 1700 && candidato <= 2026) distratores.add(candidato);
      if(distratores.size >= 3) break;
    }
    if(distratores.size < 3) return null;
    const opcoes = shuffle([anoCerto, ...distratores].map(String));
    return { pergunta: `Em que ano o ${d.nome} foi descoberto?`, opcoes, correta: String(anoCerto) };
  },
  // ===== 7. Nome científico =====
  (d, dinos) => {
    const outras = valoresUnicos(dinos, x=>x.latim, d.latim);
    if(outras.length < 3) return null;
    const opcoes = shuffle([d.latim, ...amostra(outras, 3)]);
    return { pergunta: `Qual é o nome científico do ${d.nome}?`, opcoes, correta: d.latim, italico: true };
  },
  // ===== 8. Formação geológica =====
  (d, dinos) => {
    if(!d.formacao) return null;
    const outras = valoresUnicos(dinos, x=>x.formacao, d.formacao);
    if(outras.length < 3) return null;
    const opcoes = shuffle([d.formacao, ...amostra(outras, 3)]);
    return { pergunta: `Em qual formação geológica o ${d.nome} foi encontrado?`, opcoes, correta: d.formacao };
  },
  // ===== 9. Qual é maior (comprimento) =====
  (d, dinos) => {
    const grupo = shuffle(dinos.filter(x=>x.id!==d.id && x.comprimento)).slice(0,3);
    if(grupo.length < 3 || !d.comprimento) return null;
    const candidatos = [d, ...grupo];
    const maior = candidatos.reduce((a,b)=> b.comprimento > a.comprimento ? b : a);
    return { pergunta: `Qual desses dinossauros é o mais comprido?`, opcoes: shuffle(candidatos.map(x=>x.nome)), correta: maior.nome };
  },
  // ===== 10. Qual é mais pesado =====
  (d, dinos) => {
    const grupo = shuffle(dinos.filter(x=>x.id!==d.id && x.peso)).slice(0,3);
    if(grupo.length < 3 || !d.peso) return null;
    const candidatos = [d, ...grupo];
    const maisPesado = candidatos.reduce((a,b)=> b.peso > a.peso ? b : a);
    return { pergunta: `Qual desses dinossauros é o mais pesado?`, opcoes: shuffle(candidatos.map(x=>x.nome)), correta: maisPesado.nome };
  },
];

function gerarPerguntas(dinos, quantidade){
  const pool = [];
  const dinosEmbaralhados = shuffle(dinos);
  // tenta gerar várias perguntas por dinossauro, com templates variados,
  // até ter um pool bem maior que o necessário
  for(const d of dinosEmbaralhados){
    for(const template of shuffle(TEMPLATES)){
      const q = template(d, dinos);
      if(q && q.opcoes.length >= 3) pool.push(q);
    }
    if(pool.length >= quantidade * 8) break;
  }
  // remove perguntas repetidas (mesmo texto)
  const vistas = new Set();
  const unicas = pool.filter(q=>{
    if(vistas.has(q.pergunta)) return false;
    vistas.add(q.pergunta);
    return true;
  });
  return shuffle(unicas).slice(0, quantidade);
}

/* ===== estado do quiz ===== */
let perguntas = [];
let indice = 0;
let acertos = 0;
let respondida = false;

const quizArea = document.getElementById('quizArea');

function renderInicio(totalDinos){
  quizArea.innerHTML = `
    <div class="quiz-start">
      <div class="quiz-start-icon" aria-hidden="true">🦖❓</div>
      <h2>Pronto pra testar seu conhecimento?</h2>
      <p>A cada partida, ${TOTAL_PERGUNTAS} perguntas são sorteadas na hora a partir das ${totalDinos} espécies do catálogo — dieta, período, local de descoberta, tamanho e muito mais.</p>
      <button class="quiz-btn-start" id="btnIniciar">Começar quiz</button>
    </div>
  `;
  document.getElementById('btnIniciar').addEventListener('click', iniciarQuiz);
}

async function iniciarQuiz(){
  const dinos = await loadDinos();
  perguntas = gerarPerguntas(dinos, TOTAL_PERGUNTAS);
  indice = 0;
  acertos = 0;
  tick();
  renderPergunta();
}

function renderPergunta(){
  respondida = false;
  const q = perguntas[indice];
  const progresso = ((indice) / perguntas.length) * 100;

  quizArea.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progresso}%"></div></div>
      <span class="quiz-progress-label">Pergunta ${indice+1} de ${perguntas.length} · ${acertos} acerto${acertos===1?'':'s'}</span>
    </div>
    <h2 class="quiz-question ${q.italico ? 'quiz-question-italic':''}">${q.pergunta}</h2>
    <div class="quiz-options" id="quizOptions">
      ${q.opcoes.map((op,i)=>`<button class="quiz-option" data-op="${i}">${op}</button>`).join('')}
    </div>
    <div class="quiz-feedback" id="quizFeedback"></div>
  `;

  document.querySelectorAll('.quiz-option').forEach(btn=>{
    btn.addEventListener('click', ()=> responder(btn, q));
  });
}

function responder(btnClicado, q){
  if(respondida) return;
  respondida = true;
  const escolha = btnClicado.textContent;
  const correta = escolha === q.correta;
  if(correta) acertos++;

  document.querySelectorAll('.quiz-option').forEach(btn=>{
    btn.disabled = true;
    if(btn.textContent === q.correta) btn.classList.add('correct');
    else if(btn === btnClicado) btn.classList.add('wrong');
  });

  const feedbackEl = document.getElementById('quizFeedback');
  if(correta){
    chirp();
    feedbackEl.innerHTML = `<span class="quiz-feedback-ok">✓ Isso aí!</span>`;
  } else {
    buzz();
    feedbackEl.innerHTML = `<span class="quiz-feedback-bad">✗ Era "${q.correta}"</span>`;
  }

  const btnProximo = document.createElement('button');
  btnProximo.className = 'quiz-btn-next';
  btnProximo.textContent = (indice+1 < perguntas.length) ? 'Próxima →' : 'Ver resultado →';
  btnProximo.addEventListener('click', ()=>{
    tick();
    indice++;
    if(indice < perguntas.length) renderPergunta();
    else renderResultado();
  });
  feedbackEl.appendChild(btnProximo);
}

function renderResultado(){
  const pct = Math.round((acertos/perguntas.length)*100);
  let titulo, emoji;
  if(pct === 100){ titulo = 'Perfeito! Você é um paleontólogo de verdade.'; emoji = '🏆'; }
  else if(pct >= 70){ titulo = 'Muito bem! Conhecimento sólido.'; emoji = '🦖'; }
  else if(pct >= 40){ titulo = 'Nada mal — sempre dá pra descobrir mais espécies.'; emoji = '🦴'; }
  else { titulo = 'Bora explorar mais o catálogo e tentar de novo?'; emoji = '🥚'; }

  beep();
  quizArea.innerHTML = `
    <div class="quiz-result">
      <div class="quiz-result-emoji" aria-hidden="true">${emoji}</div>
      <div class="quiz-result-score">${acertos}<span>/${perguntas.length}</span></div>
      <p class="quiz-result-title">${titulo}</p>
      <button class="quiz-btn-start" id="btnJogarDeNovo">Jogar de novo</button>
      <a class="quiz-btn-ghost" href="index.html">Voltar ao catálogo</a>
    </div>
  `;
  document.getElementById('btnJogarDeNovo').addEventListener('click', iniciarQuiz);
}

async function init(){
  try{
    registerServiceWorker();
    initTheme();
    const dinos = await loadDinos();
    updateProgress(dinos.length);
    checkAchievements(dinos);
    updateAchievementsCount();
    renderInicio(dinos.length);
  }catch(err){
    console.error('Erro ao iniciar o quiz:', err);
    quizArea.innerHTML = `
      <div class="quiz-start">
        <p>⚠️ Não consegui carregar o quiz.</p>
        <p style="font-family:var(--font-mono); font-size:12px; color:var(--paper-dim);">${err.message || err}</p>
      </div>
    `;
  }
}
init();
