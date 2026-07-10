import {
  loadDinos, buildAchievements, unlockedAchievements,
  updateProgress, updateAchievementsCount, checkAchievements,
  registerServiceWorker, initTheme
} from './common.js';

const listEl = document.getElementById('achList');
const summaryEl = document.getElementById('achSummary');

function render(dinos){
  const achievements = buildAchievements(dinos);
  const total = achievements.length;
  const unlocked = achievements.filter(a => unlockedAchievements.has(a.id)).length;

  summaryEl.innerHTML = `
    <div class="ach-summary-num">${unlocked}<span class="ach-summary-total">/${total}</span></div>
    <div class="ach-summary-label">conquistas desbloqueadas</div>
    <div class="ach-summary-bar"><div class="ach-summary-fill" style="width:${total ? (unlocked/total*100) : 0}%"></div></div>
  `;

  const categorias = [];
  achievements.forEach(a => { if(!categorias.includes(a.cat)) categorias.push(a.cat); });

  listEl.innerHTML = categorias.map(cat => {
    const itens = achievements.filter(a => a.cat === cat);
    return `
      <section class="ach-group">
        <h2 class="ach-group-title">${cat}</h2>
        <div class="ach-grid">
          ${itens.map(a => {
            const isUnlocked = unlockedAchievements.has(a.id);
            return `
              <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <span class="ach-icon" aria-hidden="true">${isUnlocked ? '🏆' : '🔒'}</span>
                <div class="ach-text">
                  <div class="ach-label">${a.label}</div>
                  <div class="ach-desc">${a.desc}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }).join('');
}

async function init(){
  registerServiceWorker();
  initTheme();
  const dinos = await loadDinos();
  updateProgress(dinos.length);
  checkAchievements(dinos);
  updateAchievementsCount();
  render(dinos);
}
init();
