/* ============================================================================
   UI 表现层 — 破境全屏特效、缓存 DOM、混沌迷雾、批量升级与诸天金榜
   ============================================================================ */
const DOM = {
  prestigeBadge: document.getElementById('ui-prestige-badge'),
  ascendBadge: document.getElementById('ui-ascend-badge'),
  stones: document.getElementById('ui-stones'),
  jade: document.getElementById('ui-jade'),
  karma: document.getElementById('ui-karma'),
  cdStat: document.getElementById('ui-cd-stat'),
  lifespan: document.getElementById('ui-lifespan'),
  tierTag: document.getElementById('ui-realm-tier-tag'),
  realmMain: document.getElementById('stat-realm-main'),
  qiTextMain: document.getElementById('stat-qi-text-main'),
  qiPctMain: document.getElementById('stat-qi-pct-main'),
  qiBarMain: document.getElementById('stat-qi-bar-main'),
  btTopBtn: document.getElementById('btn-breakthrough-top'),
  btCardBtn: document.getElementById('btn-breakthrough-card'),
  btCardText: document.getElementById('btn-breakthrough-card-text'),
  worldStage: document.getElementById('world-stage'),
  sceneryLayer: document.getElementById('stage-scenery-layer'),
  fxLayer: document.getElementById('stage-fx-layer'),
  ambientSky: document.getElementById('ambient-sky-layer'),
  worldIcon: document.getElementById('ui-world-icon'),
  worldName: document.getElementById('ui-world-name'),
  worldDesc: document.getElementById('ui-world-desc'),
  worldMult: document.getElementById('ui-world-mult'),
  stageStatus: document.getElementById('stage-status-text'),
  sprite: document.getElementById('meditate-sprite'),
  medBtn: document.getElementById('btn-meditate'),
  cdFill: document.getElementById('cooldown-bar-fill'),
  cdTimer: document.getElementById('cooldown-timer-text'),
  pillShort: document.getElementById('ui-active-pill-short'),
  autoMedBtn: document.getElementById('btn-automeditate'),
  jadeGuardBtn: document.getElementById('btn-jade-guard'),
  chestCnt: document.getElementById('quick-chest-count'),
  chestDot: document.getElementById('chest-ready-dot'),
  prestigeDot: document.getElementById('prestige-ready-dot'),
  physiqueCnt: document.getElementById('ui-physique-count'),
  stoneMult: document.getElementById('ui-stone-mult'),
  qiMult: document.getElementById('ui-qi-mult'),
  eqArtifact: document.getElementById('ui-equipped-artifact'),
  activePet: document.getElementById('ui-active-pet'),
  nextRealmHint: document.getElementById('ui-next-realm-hint'),
  totalTicks: document.getElementById('ui-total-ticks'),
  logList: document.getElementById('log-feed-list'),
  tabArea: document.getElementById('tab-content-area'),
  toastWrap: document.getElementById('toast-container'),
  dockWorld: document.getElementById('dock-world-label'),
  dockPill: document.getElementById('dock-pill-label'),
  dockCdText: document.getElementById('dock-cooldown-text'),
  dockCdBar: document.getElementById('dock-cooldown-bar'),
  dockMedBtn: document.getElementById('dock-meditate-btn'),
  dockBreakBtn: document.getElementById('dock-break-btn'),
  sfxBtn: document.getElementById('btn-toggle-sfx')
};

const textCache = {};
function setText(key, el, val) {
  if (el && textCache[key] !== val) {
    textCache[key] = val;
    el.textContent = val;
  }
}

function showToast(msg, tone = 'cyan') {
  const colors = { cyan: '#2dd4bf', emerald: '#34d399', amber: '#fbbf24', fuchsia: '#e879f9', rose: '#fb7185' };
  const el = document.createElement('div');
  el.style.cssText = `pointer-events:auto;padding:10px 14px;border-radius:12px;background:#101524;border:1px solid ${colors[tone] || '#2dd4bf'};color:#f1f5f9;font-size:12px;font-weight:700;box-shadow:0 10px 24px rgba(0,0,0,0.45);transition:opacity 0.2s ease;`;
  el.textContent = msg;
  DOM.toastWrap.appendChild(el);
  while (DOM.toastWrap.children.length > 3) DOM.toastWrap.firstChild.remove();
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 220); }, 2400);
}

function addLog(html, tone = 'default') {
  const div = document.createElement('div');
  div.className = tone === 'default' ? 'feed-row' : `feed-row feed-${tone}`;
  div.innerHTML = html;
  DOM.logList.prepend(div);
  while (DOM.logList.children.length > 20) DOM.logList.lastChild.remove();
}

function triggerMeditateAnim() {
  DOM.sprite.classList.remove('sprite-pulse', 'sprite-slash');
  void DOM.sprite.offsetWidth;
  DOM.sprite.classList.add('sprite-pulse', 'sprite-slash');
  clearTimeout(spriteTimeout);
  spriteTimeout = setTimeout(() => DOM.sprite.classList.remove('sprite-pulse', 'sprite-slash'), 280);
}

// 每次吐纳在人物上方飘出灵气与灵石光字
function spawnCultivatePopup(qiGain, stoneGain, isCrit = false) {
  if (!DOM.fxLayer) return;
  const el = document.createElement('div');
  el.className = 'cultivate-popup';
  const offsetX = 72 + (Math.random() - 0.5) * 18;
  el.style.left = `${offsetX}%`;
  el.style.bottom = '46px';
  el.style.color = isCrit ? '#fde047' : '#5eead4';
  el.innerHTML = isCrit
    ? `✨ 顿悟 +${fmt(qiGain)}修为 • +${fmt(stoneGain)}灵石`
    : `+${fmt(qiGain)} 修为 <span style="color:#fcd34d">+${fmt(stoneGain)}🪙</span>`;
  DOM.fxLayer.appendChild(el);
  while (DOM.fxLayer.children.length > 8) DOM.fxLayer.firstChild.remove();
  setTimeout(() => el.remove(), 1100);
}

// 切换人界 / 仙界 / 至高全屏画风与飘浮仙灵微粒
let currentThemeTier = '';
function updateRealmTheme() {
  const tier = state.realmIdx >= 17 ? 'supreme' : (state.ascended || state.realmIdx >= 9 ? 'immortal' : 'mortal');
  if (currentThemeTier === tier) return;
  currentThemeTier = tier;

  document.body.classList.toggle('theme-immortal', tier === 'immortal' || tier === 'supreme');
  document.body.classList.toggle('theme-supreme', tier === 'supreme');

  if (!DOM.ambientSky) return;
  DOM.ambientSky.innerHTML = '';

  const moteCount = tier === 'supreme' ? 28 : tier === 'immortal' ? 22 : 10;
  const colors = tier === 'supreme'
    ? ['#fde047', '#f0abfc', '#38bdf8', '#ffffff']
    : tier === 'immortal'
      ? ['#fde047', '#5eead4', '#fef08a', '#ffffff']
      : ['#2dd4bf', '#38bdf8', '#94a3b8'];

  for (let i = 0; i < moteCount; i++) {
    const m = document.createElement('span');
    m.className = 'ambient-mote';
    const sz = tier === 'mortal' ? (2 + Math.random() * 2.5) : (3 + Math.random() * 4.5);
    const col = colors[i % colors.length];
    m.style.width = `${sz}px`;
    m.style.height = `${sz}px`;
    m.style.left = `${Math.random() * 100}%`;
    m.style.background = col;
    m.style.boxShadow = `0 0 ${sz * 2.8}px ${col}`;
    m.style.setProperty('--dur', `${8 + Math.random() * 10}s`);
    m.style.setProperty('--delay', `${-Math.random() * 12}s`);
    DOM.ambientSky.appendChild(m);
  }
}

// 随境界演变的洞府/宗门/豪华凌霄仙宫/鸿蒙天宫 SVG 场景画卷
function getStageScenerySVG(realmIdx, ascended) {
  // 1. 至高界域：鸿蒙太初天宫（星海神殿、旋转大道符环、紫金神光柱）
  if (realmIdx >= 17) {
    return `
      <svg viewBox="0 0 420 190" preserveAspectRatio="xMidYMid slice" class="w-full h-full opacity-95">
        <defs>
          <linearGradient id="supBeam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fde047" stop-opacity="0.48"/>
            <stop offset="100%" stop-color="#c084fc" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="supRoof" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="50%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#e879f9"/>
          </linearGradient>
        </defs>
        <!-- 天光神柱 -->
        <polygon points="150,0 270,0 320,190 100,190" fill="url(#supBeam)" class="scenery-sunbeam"/>
        <!-- 旋转鸿蒙道环 -->
        <g style="transform-origin:210px 85px;" class="avatar-spin-slow" opacity="0.45">
          <circle cx="210" cy="85" r="76" fill="none" stroke="#fde047" stroke-width="1.5" stroke-dasharray="10 6"/>
          <circle cx="210" cy="85" r="60" fill="none" stroke="#f0abfc" stroke-width="1.2" stroke-dasharray="5 5"/>
        </g>
        <!-- 星辰 -->
        <circle cx="48" cy="28" r="2" fill="#fde047" class="scenery-star"/>
        <circle cx="356" cy="34" r="2.2" fill="#f0abfc" class="scenery-star" style="animation-delay:0.8s"/>
        <circle cx="110" cy="42" r="1.8" fill="#38bdf8" class="scenery-star" style="animation-delay:1.5s"/>
        <!-- 悬浮白玉仙岛底座 -->
        <path d="M85,154 Q210,136 335,154 L300,185 Q210,194 120,185 Z" fill="#1e1b4b" stroke="#fde047" stroke-width="1.4" opacity="0.9"/>
        <path d="M105,152 Q210,138 315,152 L298,162 Q210,152 122,162 Z" fill="#f8fafc" opacity="0.88"/>
        <!-- 鸿蒙主殿（三层重檐金顶） -->
        <rect x="148" y="108" width="124" height="44" fill="#3b0764" stroke="#fde047" stroke-width="1.2"/>
        <rect x="164" y="80" width="92" height="30" fill="#4c1d95" stroke="#fde047" stroke-width="1.1"/>
        <rect x="182" y="58" width="56" height="22" fill="#581c87" stroke="#fde047" stroke-width="1"/>
        <!-- 三层飞檐金顶 -->
        <path d="M126,112 Q210,94 294,112 L278,103 Q210,88 142,103 Z" fill="url(#supRoof)"/>
        <path d="M148,84 Q210,68 272,84 L258,76 Q210,63 162,76 Z" fill="url(#supRoof)"/>
        <path d="M168,61 Q210,44 252,61 L210,36 Z" fill="url(#supRoof)"/>
        <circle cx="210" cy="32" r="4.5" fill="#ffffff" class="palace-glow"/>
        <!-- 发光仙门与廊柱 -->
        <rect x="197" y="122" width="26" height="30" rx="12" fill="#fde047" opacity="0.88" class="palace-glow"/>
        <line x1="162" y1="110" x2="162" y2="152" stroke="#fde047" stroke-width="2.5"/>
        <line x1="258" y1="110" x2="258" y2="152" stroke="#fde047" stroke-width="2.5"/>
        <!-- 左右配殿 -->
        <rect x="96" y="126" width="44" height="26" fill="#2e1065" stroke="#f0abfc" stroke-width="1"/>
        <path d="M86,128 Q118,114 150,128 L118,110 Z" fill="url(#supRoof)"/>
        <rect x="280" y="126" width="44" height="26" fill="#2e1065" stroke="#f0abfc" stroke-width="1"/>
        <path d="M270,128 Q302,114 334,128 L302,110 Z" fill="url(#supRoof)"/>
        <!-- 紫金流云 -->
        <g class="scenery-cloud" opacity="0.72">
          <ellipse cx="90" cy="170" rx="58" ry="14" fill="#f5d0fe" opacity="0.35"/>
          <ellipse cx="325" cy="168" rx="64" ry="15" fill="#fef08a" opacity="0.32"/>
        </g>
      </svg>
    `;
  }

  // 2. 仙界（人仙 ~ 大罗金仙）：豪华凌霄玉宇仙宫（金顶飞檐、白玉阶梯、仙灯、仙鹤、流云天光）
  if (ascended || realmIdx >= 9) {
    return `
      <svg viewBox="0 0 420 190" preserveAspectRatio="xMidYMid slice" class="w-full h-full opacity-95">
        <defs>
          <linearGradient id="immSun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#5eead4" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="goldRoof" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#d97706"/>
            <stop offset="50%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
          <linearGradient id="jadeWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
        </defs>
        <!-- 仙界天光倾泻 -->
        <polygon points="120,0 265,0 330,190 70,190" fill="url(#immSun)" class="scenery-sunbeam"/>
        <!-- 仙辉灵日 -->
        <circle cx="195" cy="52" r="34" fill="#fef08a" opacity="0.22" class="palace-glow"/>
        <!-- 远景浮空仙山 -->
        <path d="M18,128 L52,72 L86,128 Q52,142 18,128 Z" fill="#0f766e" opacity="0.45"/>
        <path d="M332,122 L366,64 L402,122 Q366,138 332,122 Z" fill="#1e3a8a" opacity="0.45"/>
        <!-- 凌空飞翔仙鹤 -->
        <g class="scenery-crane" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round">
          <path d="M62,48 Q68,42 74,47 Q80,42 86,48"/>
          <path d="M90,34 Q95,29 100,33 Q105,29 110,34" opacity="0.75"/>
        </g>
        <!-- 豪华凌霄仙宫 · 白玉底座与汉白玉阶梯 -->
        <path d="M74,154 Q195,138 316,154 L294,178 Q195,188 96,178 Z" fill="url(#jadeWall)" stroke="#fde047" stroke-width="1.2" opacity="0.92"/>
        <polygon points="178,154 212,154 224,186 166,186" fill="#ffffff" opacity="0.9"/>
        <line x1="174" y1="163" x2="216" y2="163" stroke="#cbd5e1" stroke-width="1.2"/>
        <line x1="171" y1="171" x2="219" y2="171" stroke="#cbd5e1" stroke-width="1.2"/>
        <line x1="168" y1="179" x2="222" y2="179" stroke="#cbd5e1" stroke-width="1.2"/>
        <!-- 左右回廊与配殿 -->
        <rect x="88" y="128" width="48" height="26" fill="#7f1d1d" stroke="#fde047" stroke-width="1"/>
        <path d="M76,130 Q112,115 148,130 L112,111 Z" fill="url(#goldRoof)"/>
        <rect x="254" y="128" width="48" height="26" fill="#7f1d1d" stroke="#fde047" stroke-width="1"/>
        <path d="M242,130 Q278,115 314,130 L278,111 Z" fill="url(#goldRoof)"/>
        <!-- 主仙宫（朱柱金顶重檐大殿） -->
        <rect x="136" y="108" width="118" height="46" fill="#991b1b" stroke="#fde047" stroke-width="1.3"/>
        <rect x="154" y="82" width="82" height="28" fill="#b91c1c" stroke="#fde047" stroke-width="1.1"/>
        <!-- 朱红雕龙廊柱 -->
        <line x1="148" y1="110" x2="148" y2="154" stroke="#fde047" stroke-width="2.4"/>
        <line x1="172" y1="110" x2="172" y2="154" stroke="#fde047" stroke-width="2.4"/>
        <line x1="218" y1="110" x2="218" y2="154" stroke="#fde047" stroke-width="2.4"/>
        <line x1="242" y1="110" x2="242" y2="154" stroke="#fde047" stroke-width="2.4"/>
        <!-- 金光仙殿大门 -->
        <rect x="184" y="122" width="22" height="32" rx="10" fill="#fef08a" class="palace-glow"/>
        <!-- 重檐翘角金瓦顶 -->
        <path d="M116,112 Q195,94 274,112 L260,102 Q195,88 130,102 Z" fill="url(#goldRoof)"/>
        <path d="M136,86 Q195,66 254,86 L195,52 Z" fill="url(#goldRoof)"/>
        <circle cx="195" cy="49" r="3.8" fill="#ffffff" class="palace-glow"/>
        <!-- 殿前发光仙灯 -->
        <circle cx="136" cy="116" r="3.2" fill="#fde047" class="palace-glow"/>
        <circle cx="254" cy="116" r="3.2" fill="#fde047" class="palace-glow"/>
        <circle cx="88" cy="134" r="2.6" fill="#5eead4" class="palace-glow"/>
        <circle cx="302" cy="134" r="2.6" fill="#5eead4" class="palace-glow"/>
        <!-- 缭绕白玉仙云海 -->
        <g class="scenery-cloud">
          <ellipse cx="72" cy="172" rx="64" ry="16" fill="#ffffff" opacity="0.34"/>
          <ellipse cx="145" cy="182" rx="52" ry="13" fill="#e0f2fe" opacity="0.28"/>
        </g>
        <g class="scenery-cloud-slow">
          <ellipse cx="315" cy="172" rx="68" ry="16" fill="#fef08a" opacity="0.26"/>
          <ellipse cx="385" cy="162" rx="45" ry="12" fill="#ffffff" opacity="0.3"/>
        </g>
      </svg>
    `;
  }

  // 3. 人界后期（化神 ~ 渡劫）：云巅古宗大殿
  if (realmIdx >= 4) {
    return `
      <svg viewBox="0 0 420 190" preserveAspectRatio="xMidYMid slice" class="w-full h-full opacity-80">
        <path d="M0,190 L65,98 L145,155 L220,76 L310,148 L380,92 L420,190 Z" fill="#0f172a" opacity="0.55"/>
        <!-- 云巅宗门大殿 -->
        <rect x="176" y="96" width="66" height="32" fill="#1e293b" stroke="#94a3b8" stroke-width="1"/>
        <path d="M162,99 Q209,84 256,99 L209,72 Z" fill="#334155" stroke="#fbbf24" stroke-width="1"/>
        <rect x="202" y="109" width="14" height="19" rx="6" fill="#fbbf24" opacity="0.7" class="palace-glow"/>
        <g class="scenery-cloud">
          <ellipse cx="105" cy="166" rx="70" ry="14" fill="#cbd5e1" opacity="0.16"/>
          <ellipse cx="310" cy="160" rx="68" ry="14" fill="#cbd5e1" opacity="0.16"/>
        </g>
      </svg>
    `;
  }

  // 4. 人界初期（炼气 ~ 元婴）：青山灵雾与竹林小筑
  return `
    <svg viewBox="0 0 420 190" preserveAspectRatio="xMidYMid slice" class="w-full h-full opacity-75">
      <path d="M0,190 L75,112 L155,160 L248,96 L335,155 L420,118 L420,190 Z" fill="#090c15" opacity="0.48"/>
      <!-- 山腰简朴小亭 -->
      <rect x="195" y="118" width="32" height="22" fill="#1e293b" opacity="0.85"/>
      <path d="M186,120 Q211,106 236,120 L211,102 Z" fill="#334155" stroke="#5eead4" stroke-width="0.9"/>
      <circle cx="211" cy="131" r="3" fill="#fde047" opacity="0.75" class="palace-glow"/>
      <g class="scenery-cloud-slow">
        <ellipse cx="110" cy="172" rx="65" ry="12" fill="#5eead4" opacity="0.12"/>
        <ellipse cx="315" cy="170" rx="72" ry="13" fill="#94a3b8" opacity="0.12"/>
      </g>
    </svg>
  `;
}



// 21 大境界专属修士站姿法相 SVG（持剑挥舞 / 御风剑舞 / 剑指御剑 / 以指斩空 / 万剑仙阵）
const AVATAR_STYLES = [
  // 0~1: 持剑起势 (sword_stance)
  { robe: '#64748b', trim: '#cbd5e1', aura: '#2dd4bf', blade: '#e2e8f0', skin: '#fde68a', hair: '#1e293b', crown: 'none',     pose: 'sword_stance',  fx: 'wisps' },      // 0 炼气期
  { robe: '#0f766e', trim: '#5eead4', aura: '#2dd4bf', blade: '#5eead4', skin: '#fde68a', hair: '#1e293b', crown: 'pin',      pose: 'sword_stance',  fx: 'platform' },   // 1 筑基期
  // 2~4: 御风剑舞 (sword_dance)
  { robe: '#0369a1', trim: '#fcd34d', aura: '#fbbf24', blade: '#fde047', skin: '#fef08a', hair: '#0f172a', crown: 'pin',      pose: 'sword_dance',   fx: 'core' },       // 2 金丹期
  { robe: '#4338ca', trim: '#e879f9', aura: '#c084fc', blade: '#f0abfc', skin: '#fef3c7', hair: '#0f172a', crown: 'circlet',  pose: 'sword_dance',   fx: 'soul' },       // 3 元婴期
  { robe: '#312e81', trim: '#38bdf8', aura: '#38bdf8', blade: '#7dd3fc', skin: '#fef3c7', hair: '#0f172a', crown: 'circlet',  pose: 'sword_dance',   fx: 'dualring' },   // 4 化神期
  // 5~7: 剑指御剑 (sword_finger)
  { robe: '#581c87', trim: '#c084fc', aura: '#a855f7', blade: '#d8b4fe', skin: '#fef3c7', hair: '#1e1b4b', crown: 'crown',    pose: 'sword_finger',  fx: 'void' },       // 5 炼虚期
  { robe: '#1e3a8a', trim: '#fbbf24', aura: '#60a5fa', blade: '#93c5fd', skin: '#fef9c3', hair: '#0f172a', crown: 'crown',    pose: 'sword_finger',  fx: 'swords' },     // 6 合体期
  { robe: '#b45309', trim: '#fef08a', aura: '#fbbf24', blade: '#fef08a', skin: '#fef9c3', hair: '#1c1917', crown: 'crown',    pose: 'sword_finger',  fx: 'lotus' },      // 7 大乘期
  // 8: 剑指引雷 (thunder_finger)
  { robe: '#4c1d95', trim: '#fde047', aura: '#a855f7', blade: '#fde047', skin: '#fef9c3', hair: '#f8fafc', crown: 'crown',    pose: 'thunder_finger',fx: 'lightning' },  // 8 渡劫期
  // 9~12: 仙界万剑大阵 (immortal_array)
  { robe: '#f1f5f9', trim: '#2dd4bf', aura: '#5eead4', blade: '#99f6e4', skin: '#fffbeb', hair: '#e2e8f0', crown: 'immortal', pose: 'immortal_array',fx: 'ribbon' },     // 9 人仙
  { robe: '#d97706', trim: '#fef08a', aura: '#f59e0b', blade: '#fde68a', skin: '#fffbeb', hair: '#f1f5f9', crown: 'immortal', pose: 'immortal_array',fx: 'earthring' },  // 10 地仙
  { robe: '#0284c7', trim: '#e0f2fe', aura: '#38bdf8', blade: '#bae6fd', skin: '#fffbeb', hair: '#f8fafc', crown: 'immortal', pose: 'immortal_array',fx: 'skyhalo' },    // 11 天仙
  { robe: '#f8fafc', trim: '#fbbf24', aura: '#fde047', blade: '#fef08a', skin: '#fffbeb', hair: '#fef08a', crown: 'immortal', pose: 'immortal_array',fx: 'sunwheel' },   // 12 真仙
  // 13~16: 以指代剑 · 斩裂星穹 (cosmic_finger)
  { robe: '#6d28d9', trim: '#fcd34d', aura: '#c084fc', blade: '#e9d5ff', skin: '#fffbeb', hair: '#f8fafc', crown: 'immortal', pose: 'cosmic_finger', fx: 'taiji' },      // 13 玄仙
  { robe: '#f59e0b', trim: '#ffffff', aura: '#fde047', blade: '#ffffff', skin: '#fffbeb', hair: '#fef08a', crown: 'supreme',  pose: 'cosmic_finger', fx: 'mandala' },    // 14 金仙
  { robe: '#0e7490', trim: '#fde047', aura: '#22d3ee', blade: '#a5f3fc', skin: '#fffbeb', hair: '#f8fafc', crown: 'supreme',  pose: 'cosmic_finger', fx: 'chrono' },     // 15 太乙金仙
  { robe: '#3730a3', trim: '#f0abfc', aura: '#e879f9', blade: '#f5d0fe', skin: '#fffbeb', hair: '#ffffff', crown: 'supreme',  pose: 'cosmic_finger', fx: 'daluo' },      // 16 大罗金仙
  // 17~20: 诸天剑尊 · 鸿蒙剑意 (supreme_dao)
  { robe: '#991b1b', trim: '#fde047', aura: '#fb7185', blade: '#fecdd3', skin: '#fffbeb', hair: '#ffffff', crown: 'supreme',  pose: 'supreme_dao',   fx: 'threeorbs' },  // 17 准圣
  { robe: '#ffffff', trim: '#fbbf24', aura: '#fde047', blade: '#fef08a', skin: '#fffbeb', hair: '#ffffff', crown: 'supreme',  pose: 'supreme_dao',   fx: 'sage' },       // 18 圣人
  { robe: '#3b0764', trim: '#fde047', aura: '#c084fc', blade: '#fde047', skin: '#fffbeb', hair: '#ffffff', crown: 'supreme',  pose: 'supreme_dao',   fx: 'daodisc' },    // 19 道祖
  { robe: '#09090b', trim: '#f0abfc', aura: '#38bdf8', blade: '#f0abfc', skin: '#fffbeb', hair: '#fde047', crown: 'supreme',  pose: 'supreme_dao',   fx: 'multiverse' }  // 20 界尊
];

function getCultivatorAvatarSVG(realmIdx, size = 94, subIdx = 0) {
  const s = AVATAR_STYLES[Math.min(AVATAR_STYLES.length - 1, Math.max(0, realmIdx || 0))];
  const uid = `av_${realmIdx}_${subIdx}_${size}`;
  const sub = Math.min(3, Math.max(0, subIdx || 0));

  // 每个小境界（初期/中期/后期/大圆满）都有肉眼可见的外观进阶！
  let subStageFx = '';
  if (sub >= 1) {
    // 绕身灵珠（中期1颗、后期2颗、大圆满3颗）
    const orbCoords = [
      [48, 8],
      [82, 66],
      [14, 66]
    ].slice(0, sub);
    const orbs = orbCoords.map(([ox, oy], idx) =>
      `<circle cx="${ox}" cy="${oy}" r="${sub === 3 ? 3.2 : 2.6}" fill="${idx === 0 ? '#fde047' : s.aura}" stroke="#ffffff" stroke-width="0.7"/>`
    ).join('');
    subStageFx += `<g class="av-sub-orbs">${orbs}</g>`;
  }
  if (sub >= 2) {
    // 后期：眉心开启灵印道纹
    subStageFx += `<polygon points="48,19.2 49.4,21.5 48,23.2 46.6,21.5" fill="${s.aura}" stroke="#ffffff" stroke-width="0.35"/>`;
  }
  if (sub === 3) {
    // 大圆满：脑后浮现璀璨金色圆满光轮 + 身周灵辉
    subStageFx += `<circle cx="48" cy="24" r="14.5" fill="none" stroke="#fde047" stroke-width="1.8" stroke-dasharray="4 2.5" class="av-perfection-halo"/>`;
  }

  // 仙界以上自带飘逸仙气长绫
  const immortalScarf = realmIdx >= 9
    ? `<path d="M36 37 Q22 50 18 72 Q26 62 34 54" fill="none" stroke="${s.trim}" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>
       <path d="M60 37 Q74 52 78 74 Q70 63 62 55" fill="none" stroke="${s.aura}" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>`
    : '';
  const isFloating = realmIdx >= 8;

  // 背景光环 / 阵法特效
  let backFx = '';
  if (s.fx === 'wisps') {
    backFx = `<circle cx="18" cy="46" r="2.5" fill="${s.aura}" opacity="0.65"/><circle cx="82" cy="34" r="2" fill="${s.aura}" opacity="0.55"/>`;
  } else if (s.fx === 'platform') {
    backFx = `<ellipse cx="48" cy="91" rx="28" ry="5" fill="none" stroke="${s.aura}" stroke-width="1.8" opacity="0.8"/>`;
  } else if (s.fx === 'core') {
    backFx = `<circle cx="48" cy="42" r="22" fill="none" stroke="#fde047" stroke-width="1.4" stroke-dasharray="5 4" class="avatar-spin-slow" opacity="0.75"/>`;
  } else if (s.fx === 'soul') {
    backFx = `<circle cx="48" cy="28" r="18" fill="none" stroke="${s.aura}" stroke-width="1.8" stroke-dasharray="4 3" class="avatar-spin-slow"/><circle cx="48" cy="10" r="3" fill="#f0abfc"/>`;
  } else if (s.fx === 'dualring') {
    backFx = `<circle cx="48" cy="48" r="34" fill="none" stroke="${s.aura}" stroke-width="1.6" stroke-dasharray="8 4" class="avatar-spin-slow"/><circle cx="48" cy="48" r="25" fill="none" stroke="#fde047" stroke-width="1.2" stroke-dasharray="5 5" class="avatar-spin-rev"/>`;
  } else if (s.fx === 'void') {
    backFx = `<polygon points="48,8 84,48 48,88 12,48" fill="none" stroke="${s.aura}" stroke-width="1.6" opacity="0.7" class="avatar-spin-slow"/>`;
  } else if (s.fx === 'swords') {
    backFx = `<circle cx="48" cy="46" r="33" fill="none" stroke="${s.trim}" stroke-width="1.5" stroke-dasharray="6 4" class="avatar-spin-slow"/>`;
  } else if (s.fx === 'lotus') {
    backFx = `<circle cx="48" cy="34" r="21" fill="none" stroke="#fde047" stroke-width="1.8" opacity="0.8"/><path d="M22 90 Q35 81 48 92 Q61 81 74 90 Q61 97 48 95 Q35 97 22 90 Z" fill="#f59e0b" opacity="0.8"/>`;
  } else if (s.fx === 'lightning') {
    backFx = `<circle cx="48" cy="48" r="36" fill="none" stroke="#c084fc" stroke-width="1.8" class="avatar-spin-slow"/><polyline points="12,24 22,35 16,42 26,53" fill="none" stroke="#fde047" stroke-width="2.2"/><polyline points="86,18 76,30 82,36 72,48" fill="none" stroke="#fde047" stroke-width="2.2"/>`;
  } else if (s.fx === 'ribbon') {
    backFx = `<circle cx="48" cy="28" r="19" fill="none" stroke="#5eead4" stroke-width="2" opacity="0.8"/><path d="M12 52 Q28 28 48 44 Q68 60 86 32" fill="none" stroke="#5eead4" stroke-width="2.8" stroke-linecap="round" opacity="0.7"/>`;
  } else if (s.fx === 'earthring' || s.fx === 'skyhalo' || s.fx === 'sunwheel') {
    backFx = `<circle cx="48" cy="46" r="36" fill="none" stroke="${s.aura}" stroke-width="2" stroke-dasharray="10 4" class="avatar-spin-slow"/><circle cx="48" cy="26" r="16" fill="none" stroke="${s.trim}" stroke-width="1.8" opacity="0.85"/>`;
  } else if (s.fx === 'taiji' || s.fx === 'mandala' || s.fx === 'chrono') {
    backFx = `<circle cx="48" cy="48" r="38" fill="none" stroke="${s.aura}" stroke-width="2" stroke-dasharray="6 3" class="avatar-spin-slow"/><circle cx="48" cy="48" r="28" fill="none" stroke="${s.trim}" stroke-width="1.6" stroke-dasharray="12 4" class="avatar-spin-rev"/>`;
  } else if (s.fx === 'daluo' || s.fx === 'threeorbs' || s.fx === 'sage') {
    backFx = `<circle cx="48" cy="48" r="40" fill="none" stroke="#fde047" stroke-width="2.2" stroke-dasharray="8 4" class="avatar-spin-slow"/><circle cx="48" cy="48" r="30" fill="none" stroke="${s.aura}" stroke-width="1.8" class="avatar-spin-rev"/><circle cx="48" cy="8" r="3.5" fill="#fde047"/><circle cx="14" cy="64" r="3" fill="${s.aura}"/><circle cx="84" cy="64" r="3" fill="${s.aura}"/>`;
  } else if (s.fx === 'daodisc' || s.fx === 'multiverse') {
    backFx = `<g class="avatar-spin-slow"><circle cx="48" cy="48" r="42" fill="none" stroke="#fde047" stroke-width="2.4" stroke-dasharray="10 3 3 3"/><circle cx="48" cy="48" r="33" fill="none" stroke="#f0abfc" stroke-width="1.8" stroke-dasharray="6 4"/><circle cx="48" cy="6" r="3.5" fill="#38bdf8"/><circle cx="90" cy="48" r="3.5" fill="#fde047"/><circle cx="48" cy="90" r="3.5" fill="#f0abfc"/><circle cx="6" cy="48" r="3.5" fill="#34d399"/></g>`;
  }

  // 头冠 / 发簪
  let crownSvg = '';
  if (s.crown === 'pin') {
    crownSvg = `<line x1="39" y1="13" x2="57" y2="13" stroke="${s.trim}" stroke-width="1.8" stroke-linecap="round"/>`;
  } else if (s.crown === 'circlet') {
    crownSvg = `<path d="M40 19 Q48 15 56 19" fill="none" stroke="${s.trim}" stroke-width="2"/><circle cx="48" cy="16" r="2" fill="#fde047"/>`;
  } else if (s.crown === 'crown') {
    crownSvg = `<polygon points="41,16 43,9 48,13 53,9 55,16" fill="${s.trim}" stroke="#92400e" stroke-width="0.7"/>`;
  } else if (s.crown === 'immortal') {
    crownSvg = `<polygon points="39,16 43,7 48,12 53,7 57,16" fill="#fde047"/><circle cx="48" cy="7" r="2.2" fill="#ffffff"/>`;
  } else if (s.crown === 'supreme') {
    crownSvg = `<polygon points="38,16 42,6 48,11 54,6 58,16" fill="#fde047" stroke="#f59e0b" stroke-width="0.9"/><circle cx="48" cy="5" r="2.8" fill="#ffffff"/>`;
  }

  // 站姿剑招与武器/剑气图层
  let armsAndWeapon = '';
  if (s.pose === 'sword_stance') {
    // 持剑起势：左手背负/平展，右手执灵剑斜指苍穹，伴随剑气微光
    armsAndWeapon = `
      <path d="M39 38 Q29 44 25 51" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <path d="M39 38 Q29 44 25 51" fill="none" stroke="${s.trim}" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="24" cy="52" r="2.6" fill="${s.skin}"/>
      <g class="av-sword-sway">
        <path d="M57 38 Q65 44 70 48" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="71" cy="49" r="2.6" fill="${s.skin}"/>
        <!-- 灵剑 -->
        <line x1="68" y1="53" x2="73" y2="45" stroke="#92400e" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="68" y1="45" x2="76" y2="49" stroke="${s.trim}" stroke-width="2.2" stroke-linecap="round"/>
        <polygon points="73,45 91,14 76,47" fill="${s.blade}" stroke="#ffffff" stroke-width="0.7"/>
      </g>
      <path d="M74 12 Q94 34 78 62" fill="none" stroke="${s.aura}" stroke-width="2.4" stroke-linecap="round" class="av-slash-arc"/>
    `;
  } else if (s.pose === 'sword_dance') {
    // 御风剑舞：宽袖飞扬，高举长剑划出大弧度剑舞斩芒
    armsAndWeapon = `
      <path d="M39 38 Q26 32 19 37" fill="none" stroke="${s.robe}" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M22 39 Q16 50 20 56" fill="none" stroke="${s.trim}" stroke-width="1.6" opacity="0.85"/>
      <circle cx="18" cy="38" r="2.6" fill="${s.skin}"/>
      <g class="av-sword-dance">
        <path d="M57 37 Q67 30 74 24" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="75" cy="23" r="2.6" fill="${s.skin}"/>
        <!-- 剑舞长剑 -->
        <line x1="71" y1="26" x2="78" y2="20" stroke="#b45309" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="74" y1="19" x2="79" y2="25" stroke="#fde047" stroke-width="2" stroke-linecap="round"/>
        <polygon points="77,21 95,40 75,24" fill="${s.blade}" stroke="#ffffff" stroke-width="0.8"/>
      </g>
      <!-- 挥舞剑弧 -->
      <path d="M68 12 Q96 36 74 72" fill="none" stroke="${s.blade}" stroke-width="3" stroke-linecap="round" class="av-slash-arc"/>
      <path d="M62 18 Q86 38 68 66" fill="none" stroke="${s.aura}" stroke-width="1.6" stroke-linecap="round" class="av-slash-arc" opacity="0.7"/>
    `;
  } else if (s.pose === 'sword_finger') {
    // 剑指御剑：右手并指如剑向前点出，指尖绽放剑芒，身侧悬浮飞剑呼啸！
    armsAndWeapon = `
      <path d="M39 38 Q32 48 36 55" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <!-- 右手剑指 -->
      <path d="M57 38 Q67 36 75 33" fill="none" stroke="${s.robe}" stroke-width="5.8" stroke-linecap="round"/>
      <line x1="75" y1="33" x2="82" y2="30" stroke="${s.skin}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="82" cy="30" r="3" fill="${s.blade}" opacity="0.9"/>
      <!-- 悬浮御使飞剑 -->
      <g class="av-sword-float">
        <polygon points="10,28 34,24 12,31" fill="${s.blade}" stroke="#ffffff" stroke-width="0.6"/>
        <line x1="12" y1="26" x2="13" y2="32" stroke="#fde047" stroke-width="1.6"/>
        <polygon points="62,64 92,52 64,67" fill="${s.blade}" stroke="#ffffff" stroke-width="0.7"/>
        <line x1="63" y1="62" x2="66" y2="68" stroke="#fde047" stroke-width="1.8"/>
      </g>
      <!-- 剑指斩击剑气 -->
      <path d="M78 16 Q96 32 82 54" fill="none" stroke="${s.blade}" stroke-width="3" stroke-linecap="round" class="av-slash-arc"/>
    `;
  } else if (s.pose === 'thunder_finger') {
    // 渡劫剑指：单指擎天引雷，雷剑环绕
    armsAndWeapon = `
      <path d="M39 38 Q29 44 26 52" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <path d="M57 38 Q66 28 70 18" fill="none" stroke="${s.robe}" stroke-width="5.8" stroke-linecap="round"/>
      <line x1="70" y1="18" x2="73" y2="11" stroke="${s.skin}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="73" cy="11" r="3.5" fill="#fde047"/>
      <g class="av-sword-float">
        <polygon points="76,58 94,30 80,60" fill="#fde047" stroke="#ffffff" stroke-width="0.8"/>
      </g>
      <path d="M62 8 Q92 26 84 62" fill="none" stroke="#fde047" stroke-width="3" stroke-linecap="round" class="av-slash-arc"/>
    `;
  } else if (s.pose === 'immortal_array') {
    // 仙界万剑大阵：仙人凌空，剑指平推，四柄仙剑成阵环绕斩击
    armsAndWeapon = `
      <path d="M39 38 Q28 36 22 39" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="21" cy="39" r="2.4" fill="${s.skin}"/>
      <path d="M57 38 Q68 35 76 32" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <line x1="76" y1="32" x2="83" y2="29" stroke="${s.skin}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="83" cy="29" r="3" fill="${s.blade}"/>
      <!-- 凌空四柄仙剑 -->
      <g class="av-sword-float">
        <polygon points="10,20 26,16 12,23" fill="${s.blade}" stroke="#fff" stroke-width="0.5"/>
        <polygon points="8,54 24,50 10,57" fill="${s.blade}" stroke="#fff" stroke-width="0.5"/>
        <polygon points="70,18 90,12 72,21" fill="${s.blade}" stroke="#fff" stroke-width="0.6"/>
        <polygon points="68,62 90,54 70,65" fill="${s.blade}" stroke="#fff" stroke-width="0.6"/>
      </g>
      <path d="M74 12 Q98 34 78 64" fill="none" stroke="${s.blade}" stroke-width="3.2" stroke-linecap="round" class="av-slash-arc"/>
    `;
  } else if (s.pose === 'cosmic_finger') {
    // 以指斩空：双指化作数丈星穹剑气，一指劈开虚空
    armsAndWeapon = `
      <path d="M39 38 Q30 46 33 54" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <path d="M57 38 Q68 34 75 29" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <line x1="75" y1="29" x2="82" y2="25" stroke="${s.skin}" stroke-width="2.4" stroke-linecap="round"/>
      <!-- 指尖爆发巨大星穹剑芒 -->
      <g class="av-slash-arc">
        <path d="M62 8 Q98 30 72 74" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M66 12 Q94 32 74 68" fill="none" stroke="${s.aura}" stroke-width="6" stroke-linecap="round" opacity="0.45"/>
        <polygon points="81,25 97,14 85,29" fill="#ffffff"/>
      </g>
    `;
  } else {
    // supreme_dao: 诸天剑尊 — 凌空负手，双神剑护体 + 双重鸿蒙剑气斩裂万界
    armsAndWeapon = `
      <path d="M39 38 Q26 32 20 26" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="19" cy="25" r="2.6" fill="#fde047"/>
      <path d="M57 38 Q70 33 78 27" fill="none" stroke="${s.robe}" stroke-width="6" stroke-linecap="round"/>
      <line x1="78" y1="27" x2="85" y2="23" stroke="${s.skin}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="85" cy="23" r="3.4" fill="#ffffff"/>
      <g class="av-sword-float">
        <polygon points="6,40 28,28 9,44" fill="#fde047" stroke="#ffffff" stroke-width="0.7"/>
        <polygon points="66,68 94,50 69,72" fill="${s.blade}" stroke="#ffffff" stroke-width="0.7"/>
      </g>
      <g class="av-slash-arc">
        <path d="M58 6 Q98 32 70 80" fill="none" stroke="#fde047" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M66 12 Q94 36 76 74" fill="none" stroke="${s.aura}" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    `;
  }

  // 飘逸仙靴 / 凌空脚部
  const feetSvg = isFloating
    ? `<ellipse cx="48" cy="92" rx="18" ry="3.5" fill="${s.aura}" opacity="0.45"/>`
    : `<ellipse cx="42" cy="89" rx="4.5" ry="2.5" fill="#0f172a"/><ellipse cx="54" cy="89" rx="4.5" ry="2.5" fill="#0f172a"/>`;

  return `
    <svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_0_12px_rgba(0,0,0,0.65)] overflow-visible">
      <defs>
        <radialGradient id="${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${s.aura}" stop-opacity="0.48"/>
          <stop offset="100%" stop-color="${s.aura}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="48" cy="50" r="45" fill="url(#${uid})"/>
      ${backFx}
      ${feetSvg}
      <!-- 站姿飘逸道袍下摆 -->
      <path d="M39 54 L31 86 Q48 91 65 86 L57 54 Z" fill="${s.robe}" stroke="${s.trim}" stroke-width="1.5"/>
      <!-- 飘带衣袂 -->
      <path d="M48 56 Q44 72 41 87" fill="none" stroke="${s.trim}" stroke-width="1.6" opacity="0.85"/>
      <!-- 上身交领道袍 -->
      <path d="M38 35 Q48 32 58 35 L57 55 L39 55 Z" fill="${s.robe}" stroke="${s.trim}" stroke-width="1.5"/>
      <path d="M43 35 L48 45 L53 35" fill="none" stroke="${s.trim}" stroke-width="1.8" stroke-linecap="round"/>
      <!-- 玉带束腰 -->
      <rect x="38.5" y="52" width="19" height="3.5" rx="1.5" fill="${s.trim}"/>
      <!-- 剑招双臂、灵剑与剑气 -->
      ${armsAndWeapon}
      <!-- 发髻、披发与俊朗面容 -->
      <path d="M38 25 Q35 35 37 42" fill="none" stroke="${s.hair}" stroke-width="3" stroke-linecap="round"/>
      <path d="M58 25 Q61 35 59 42" fill="none" stroke="${s.hair}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="48" cy="13" r="4.5" fill="${s.hair}"/>
      <circle cx="48" cy="24" r="8.8" fill="${s.skin}"/>
      <path d="M39.5 23 Q42 15 48 15 Q54 15 56.5 23 Q52 19 48 19 Q44 19 39.5 23 Z" fill="${s.hair}"/>
      <!-- 凌厉剑眉星目 -->
      <line x1="43" y1="23" x2="46.5" y2="23.5" stroke="#1e293b" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="53" y1="23" x2="49.5" y2="23.5" stroke="#1e293b" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="44.8" cy="25.5" r="1.1" fill="#0f172a"/>
      <circle cx="51.2" cy="25.5" r="1.1" fill="#0f172a"/>
      ${immortalScarf}
      ${crownSvg}
      ${subStageFx}
    </svg>
  `;
}

// 破境 / 飞升全屏特效动画
let btOverlayTimer = null;
function showBreakthroughAnimation({ type = 'minor', kicker, icon, customSvg = null, title, subtitle, rewards = [] }) {
  const overlay = document.getElementById('breakthrough-overlay');
  const flash = document.getElementById('bt-flash');
  const particles = document.getElementById('bt-particles');
  const card = document.getElementById('bt-card');

  document.getElementById('bt-kicker').textContent = kicker;
  const iconEl = document.getElementById('bt-icon');
  if (customSvg) {
    iconEl.innerHTML = `<div class="flex justify-center">${customSvg}</div>`;
  } else {
    iconEl.textContent = icon;
  }
  document.getElementById('bt-title').textContent = title;
  document.getElementById('bt-subtitle').textContent = subtitle;
  document.getElementById('bt-rewards').innerHTML = rewards.map(r =>
    `<span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-black/45 border border-amber-400/45 text-amber-200">${r}</span>`
  ).join('');

  if (type === 'fail') {
    card.className = 'relative z-10 max-w-md w-full text-center space-y-3 px-6 py-7 rounded-3xl border border-rose-500/75 bg-gradient-to-b from-rose-950/95 via-xian-900/95 to-xian-950/95 shadow-[0_0_55px_rgba(244,63,94,0.5)]';
    flash.style.background = 'radial-gradient(circle, rgba(244,63,94,0.75), rgba(159,18,57,0.4), transparent 70%)';
  } else if (type === 'ascend') {
    card.className = 'relative z-10 max-w-md w-full text-center space-y-3 px-6 py-7 rounded-3xl border border-fuchsia-400/70 bg-gradient-to-b from-indigo-950/95 via-fuchsia-950/95 to-xian-950/95 shadow-[0_0_60px_rgba(232,121,249,0.55)]';
    flash.style.background = 'radial-gradient(circle, rgba(253,224,71,0.95), rgba(217,70,239,0.55), transparent 72%)';
  } else if (type === 'major') {
    card.className = 'relative z-10 max-w-md w-full text-center space-y-3 px-6 py-7 rounded-3xl border border-amber-400/70 bg-gradient-to-b from-amber-950/95 via-xian-900/95 to-xian-950/95 shadow-[0_0_55px_rgba(251,191,36,0.5)]';
    flash.style.background = 'radial-gradient(circle, rgba(254,240,138,0.9), rgba(245,158,11,0.45), transparent 70%)';
  } else {
    card.className = 'relative z-10 max-w-md w-full text-center space-y-3 px-6 py-7 rounded-3xl border border-teal-400/65 bg-gradient-to-b from-teal-950/95 via-xian-900/95 to-xian-950/95 shadow-[0_0_45px_rgba(45,212,191,0.45)]';
    flash.style.background = 'radial-gradient(circle, rgba(153,246,228,0.75), rgba(45,212,191,0.35), transparent 68%)';
  }

  // 生成粒子爆发
  particles.innerHTML = '';
  const pCount = type === 'minor' ? 24 : 44;
  const palette = type === 'fail' ? ['#fb7185', '#f43f5e', '#9f1239', '#fbbf24']
    : type === 'ascend' ? ['#fde047', '#f0abfc', '#38bdf8', '#ffffff']
    : type === 'major' ? ['#fde047', '#fbbf24', '#2dd4bf', '#ffffff']
    : ['#2dd4bf', '#67e8f9', '#fde047'];

  for (let i = 0; i < pCount; i++) {
    const p = document.createElement('span');
    p.className = 'bt-particle';
    const angle = (Math.PI * 2 * i) / pCount + (Math.random() - 0.5) * 0.25;
    const dist = 110 + Math.random() * 230;
    const size = 4 + Math.random() * 6;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = palette[i % palette.length];
    p.style.boxShadow = `0 0 10px ${palette[i % palette.length]}`;
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
    p.style.setProperty('--dur', `${0.8 + Math.random() * 0.7}s`);
    particles.appendChild(p);
  }

  // 重置并激活动画
  overlay.classList.remove('hidden', 'bt-anim-active', 'bt-anim-fail');
  flash.classList.remove('bt-anim-flash');
  void overlay.offsetWidth;
  overlay.classList.add(type === 'fail' ? 'bt-anim-fail' : 'bt-anim-active');
  flash.classList.add('bt-anim-flash');

  clearTimeout(btOverlayTimer);
  btOverlayTimer = setTimeout(() => {
    overlay.classList.add('hidden');
  }, type === 'minor' ? 2400 : 3400);
}

document.getElementById('breakthrough-overlay')?.addEventListener('click', () => {
  clearTimeout(btOverlayTimer);
  document.getElementById('breakthrough-overlay').classList.add('hidden');
});


// ==================== 9 大逆天体质专属异象 SVG 与炫酷全屏觉醒动画 ====================
function getPhysiqueAwakeningSVG(phId) {
  if (phId === 'ph_heart') {
    // 1. 七窍玲珑心：七彩晶钻之心 + 七道折射仙光
    return `
      <svg viewBox="0 0 200 200" width="175" height="175" class="overflow-visible">
        <g class="pa-spin-med" opacity="0.75">
          <circle cx="100" cy="100" r="82" fill="none" stroke="#67e8f9" stroke-width="2" stroke-dasharray="6 6"/>
          <polygon points="100,12 115,44 100,36 85,44" fill="#67e8f9"/>
          <polygon points="100,188 115,156 100,164 85,156" fill="#38bdf8"/>
          <polygon points="12,100 44,85 36,100 44,115" fill="#a5f3fc"/>
          <polygon points="188,100 156,85 164,100 156,115" fill="#f0abfc"/>
        </g>
        <g class="pa-spin-rev" opacity="0.85">
          <circle cx="100" cy="24" r="5" fill="#fde047"/><circle cx="164" cy="56" r="4.5" fill="#67e8f9"/>
          <circle cx="174" cy="126" r="4.5" fill="#f0abfc"/><circle cx="132" cy="176" r="4.5" fill="#34d399"/>
          <circle cx="68" cy="176" r="4.5" fill="#38bdf8"/><circle cx="26" cy="126" r="4.5" fill="#fde047"/>
          <circle cx="36" cy="56" r="4.5" fill="#a5f3fc"/>
        </g>
        <path d="M100,152 C55,120 42,84 62,62 C76,47 94,54 100,68 C106,54 124,47 138,62 C158,84 145,120 100,152 Z"
              fill="url(#heartGrad)" stroke="#ffffff" stroke-width="2.5" class="palace-glow"/>
        <polygon points="100,68 122,90 100,136 78,90" fill="#ffffff" opacity="0.45"/>
        <defs>
          <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#67e8f9"/><stop offset="50%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#e879f9"/>
          </linearGradient>
        </defs>
      </svg>`;
  }
  if (phId === 'ph_blood') {
    // 2. 血域魔体：猩红血月蚀 + 魔纹法阵 + 血煞剑斩
    return `
      <svg viewBox="0 0 200 200" width="175" height="175" class="overflow-visible">
        <g class="pa-spin-fast" opacity="0.85">
          <circle cx="100" cy="100" r="86" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="14 6"/>
          <polygon points="100,16 172,142 28,142" fill="none" stroke="#fb7185" stroke-width="2"/>
          <polygon points="100,184 172,58 28,58" fill="none" stroke="#e11d48" stroke-width="2"/>
        </g>
        <circle cx="100" cy="100" r="48" fill="#9f1239" stroke="#fb7185" stroke-width="3" class="palace-glow"/>
        <circle cx="116" cy="92" r="38" fill="#090c15"/>
        <path d="M24,154 Q100,90 178,42" fill="none" stroke="#fda4af" stroke-width="5" stroke-linecap="round"/>
        <path d="M36,44 Q100,104 166,162" fill="none" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
      </svg>`;
  }
  if (phId === 'ph_bone') {
    // 3. 至尊骨：璀璨黄金神骨 + 太古符文雷霆
    return `
      <svg viewBox="0 0 200 200" width="175" height="175" class="overflow-visible">
        <g class="pa-spin-med" opacity="0.85">
          <circle cx="100" cy="100" r="82" fill="none" stroke="#fde047" stroke-width="2.5" stroke-dasharray="10 5"/>
          <circle cx="100" cy="100" r="64" fill="none" stroke="#f59e0b" stroke-width="2"/>
        </g>
        <polyline points="26,42 58,72 46,84 82,110" fill="none" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round"/>
        <polyline points="174,40 142,70 154,82 118,110" fill="none" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round"/>
        <!-- 至尊神骨核心 -->
        <path d="M78,46 C64,46 58,64 72,74 L76,126 C62,136 68,154 82,154 C92,154 96,144 100,140 C104,144 108,154 118,154 C132,154 138,136 124,126 L128,74 C142,64 136,46 122,46 C112,46 106,56 100,60 C94,56 88,46 78,46 Z"
              fill="url(#boneGrad)" stroke="#ffffff" stroke-width="2.5" class="palace-glow"/>
        <path d="M100,72 L108,100 L100,128 L92,100 Z" fill="#ffffff"/>
        <defs>
          <linearGradient id="boneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#fde047"/><stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
      </svg>`;
  }
  if (phId === 'ph_eye') {
    // 4. 重瞳：巨型无敌重瞳开眼 + 紫金瞳环
    return `
      <svg viewBox="0 0 200 200" width="180" height="180" class="overflow-visible">
        <g class="pa-spin-med" opacity="0.75">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#c084fc" stroke-width="2" stroke-dasharray="12 6"/>
          <circle cx="100" cy="100" r="74" fill="none" stroke="#fde047" stroke-width="1.5" stroke-dasharray="4 6"/>
        </g>
        <g class="pa-eye-open">
          <path d="M16,100 Q100,26 184,100 Q100,174 16,100 Z" fill="#1e1b4b" stroke="#fde047" stroke-width="3.5"/>
          <circle cx="100" cy="100" r="38" fill="url(#eyeIris)" stroke="#ffffff" stroke-width="2"/>
          <!-- 重瞳双核 -->
          <circle cx="88" cy="100" r="14" fill="#090c15" stroke="#fde047" stroke-width="2.5"/>
          <circle cx="112" cy="100" r="14" fill="#090c15" stroke="#c084fc" stroke-width="2.5"/>
          <circle cx="84" cy="95" r="3.5" fill="#ffffff"/>
          <circle cx="116" cy="95" r="3.5" fill="#ffffff"/>
        </g>
        <defs>
          <radialGradient id="eyeIris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fde047"/><stop offset="65%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#312e81"/>
          </radialGradient>
        </defs>
      </svg>`;
  }
  if (phId === 'ph_dao') {
    // 5. 先天道胎：太极阴阳旋转 + 八卦仙环
    return `
      <svg viewBox="0 0 200 200" width="180" height="180" class="overflow-visible">
        <g class="pa-spin-rev" opacity="0.85">
          <circle cx="100" cy="100" r="86" fill="none" stroke="#5eead4" stroke-width="2.5" stroke-dasharray="16 8"/>
          <circle cx="100" cy="100" r="72" fill="none" stroke="#fde047" stroke-width="2" stroke-dasharray="8 8"/>
        </g>
        <g class="pa-spin-med">
          <circle cx="100" cy="100" r="54" fill="#0f172a" stroke="#5eead4" stroke-width="3"/>
          <path d="M100,46 A54,54 0 0,1 100,154 A27,27 0 0,1 100,100 A27,27 0 0,0 100,46 Z" fill="#f8fafc"/>
          <circle cx="100" cy="73" r="8" fill="#0f172a"/>
          <circle cx="100" cy="127" r="8" fill="#fde047"/>
        </g>
      </svg>`;
  }
  if (phId === 'ph_ancient') {
    // 6. 荒古圣体：黄金气血冲天 + 崩断太古锁链
    return `
      <svg viewBox="0 0 200 200" width="185" height="185" class="overflow-visible">
        <g class="pa-spin-med" opacity="0.9">
          <circle cx="100" cy="100" r="84" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="14 6"/>
          <circle cx="100" cy="100" r="66" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 6"/>
        </g>
        <!-- 崩碎锁链 -->
        <line x1="22" y1="36" x2="72" y2="82" stroke="#94a3b8" stroke-width="5" stroke-dasharray="8 4" stroke-linecap="round"/>
        <line x1="178" y1="36" x2="128" y2="82" stroke="#94a3b8" stroke-width="5" stroke-dasharray="8 4" stroke-linecap="round"/>
        <line x1="26" y1="168" x2="74" y2="120" stroke="#94a3b8" stroke-width="5" stroke-dasharray="8 4" stroke-linecap="round"/>
        <line x1="174" y1="168" x2="126" y2="120" stroke="#94a3b8" stroke-width="5" stroke-dasharray="8 4" stroke-linecap="round"/>
        <!-- 黄金气血圣徽 -->
        <polygon points="100,24 128,82 178,100 128,118 100,176 72,118 22,100 72,82" fill="url(#ancGrad)" stroke="#ffffff" stroke-width="2.5" class="palace-glow"/>
        <circle cx="100" cy="100" r="22" fill="#ffffff"/>
        <defs>
          <radialGradient id="ancGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#fde047"/><stop offset="100%" stop-color="#dc2626"/>
          </radialGradient>
        </defs>
      </svg>`;
  }
  if (phId === 'ph_eternal') {
    // 7. 【重磅】永恒仙体：十二瓣盛放金玉仙莲 + 永恒∞星环 + 璀璨仙辉
    return `
      <svg viewBox="0 0 200 200" width="205" height="205" class="overflow-visible">
        <defs>
          <radialGradient id="etGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#fde047"/><stop offset="75%" stop-color="#2dd4bf" stop-opacity="0.5"/><stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="95" fill="url(#etGlow)"/>
        <g class="pa-spin-med">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#fde047" stroke-width="2.6" stroke-dasharray="14 6 4 6"/>
          <circle cx="100" cy="100" r="76" fill="none" stroke="#5eead4" stroke-width="2" stroke-dasharray="8 5"/>
        </g>
        <!-- 十二瓣盛放永恒仙莲 -->
        <g class="pa-lotus-bloom">
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => `
            <path d="M100,100 Q114,52 100,24 Q86,52 100,100 Z"
                  transform="rotate(${deg} 100 100)"
                  fill="${deg % 60 === 0 ? '#fde047' : '#5eead4'}" fill-opacity="0.82" stroke="#ffffff" stroke-width="1.2"/>
          `).join('')}
        </g>
        <!-- 永恒无穷大符文 ∞ -->
        <path d="M68,100 C68,84 88,84 100,100 C112,116 132,116 132,100 C132,84 112,84 100,100 C88,116 68,116 68,100 Z"
              fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" class="palace-glow"/>
      </svg>`;
  }
  if (phId === 'ph_chaos') {
    // 8. 【重磅】混沌神体：吞噬星河的混沌漩涡黑洞 + 紫青虚空神雷 + 混沌双环
    return `
      <svg viewBox="0 0 200 200" width="210" height="210" class="overflow-visible">
        <defs>
          <radialGradient id="chaosCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#09090b"/><stop offset="45%" stop-color="#3b0764"/><stop offset="72%" stop-color="#c084fc"/><stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#chaosCore)"/>
        <!-- 混沌星云螺旋臂 -->
        <g class="pa-spin-fast">
          <path d="M100,100 C135,55 178,75 182,118" fill="none" stroke="#e879f9" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M100,100 C65,145 22,125 18,82" fill="none" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M100,100 C55,65 75,22 118,18" fill="none" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
          <path d="M100,100 C145,135 125,178 82,182" fill="none" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>
          <circle cx="100" cy="100" r="84" fill="none" stroke="#f0abfc" stroke-width="2.4" stroke-dasharray="18 8 4 8"/>
        </g>
        <g class="pa-spin-rev">
          <circle cx="100" cy="100" r="64" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="10 6"/>
          <polygon points="100,26 164,136 36,136" fill="none" stroke="#fde047" stroke-width="1.8" opacity="0.85"/>
        </g>
        <!-- 虚空混沌闪电 -->
        <polyline points="12,56 46,74 36,88 74,98" fill="none" stroke="#ffffff" stroke-width="3"/>
        <polyline points="188,144 154,126 164,112 126,102" fill="none" stroke="#ffffff" stroke-width="3"/>
        <!-- 混沌奇点 -->
        <circle cx="100" cy="100" r="28" fill="#09090b" stroke="#ffffff" stroke-width="3.5" class="palace-glow"/>
        <circle cx="100" cy="100" r="14" fill="none" stroke="#fde047" stroke-width="2.5" stroke-dasharray="4 3"/>
      </svg>`;
  }
  // 9. 【终极史诗】鸿蒙至尊体：鸿蒙紫气贯日 + 三重造化神轮 + 无上至尊帝冠 + 星海奇点
  return `
    <svg viewBox="0 0 200 200" width="220" height="220" class="overflow-visible">
      <defs>
        <radialGradient id="hmGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#fde047"/><stop offset="62%" stop-color="#d946ef" stop-opacity="0.85"/><stop offset="100%" stop-color="#3b0764" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="hmCrown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#fde047"/><stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#hmGlow)"/>
      <!-- 三重旋转鸿蒙造化天轮 -->
      <g class="pa-spin-med">
        <circle cx="100" cy="100" r="92" fill="none" stroke="#fde047" stroke-width="3" stroke-dasharray="16 6 4 6"/>
        <circle cx="100" cy="8" r="6" fill="#fde047"/><circle cx="192" cy="100" r="6" fill="#f0abfc"/>
        <circle cx="100" cy="192" r="6" fill="#38bdf8"/><circle cx="8" cy="100" r="6" fill="#fde047"/>
      </g>
      <g class="pa-spin-rev">
        <circle cx="100" cy="100" r="76" fill="none" stroke="#f0abfc" stroke-width="2.8" stroke-dasharray="10 5"/>
        <polygon points="100,18 122,78 182,100 122,122 100,182 78,122 18,100 78,78" fill="none" stroke="#fef08a" stroke-width="2.2"/>
      </g>
      <g class="pa-spin-fast">
        <circle cx="100" cy="100" r="56" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="6 6"/>
      </g>
      <!-- 无上鸿蒙帝冠 -->
      <g class="palace-glow">
        <polygon points="56,124 66,68 86,96 100,52 114,96 134,68 144,124" fill="url(#hmCrown)" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="54" y="124" width="92" height="14" rx="5" fill="#7e22ce" stroke="#fde047" stroke-width="2.5"/>
        <circle cx="100" cy="46" r="7" fill="#ffffff"/>
        <circle cx="66" cy="63" r="4.5" fill="#f0abfc"/>
        <circle cx="134" cy="63" r="4.5" fill="#38bdf8"/>
        <circle cx="100" cy="131" r="4" fill="#fde047"/>
      </g>
    </svg>`;
}

let paOverlayTimer = null;
function showPhysiqueAwakeningAnimation(ph, isReplay = false) {
  const overlay = document.getElementById('physique-awakening-overlay');
  if (!overlay) return;

  const isTop3 = ['ph_eternal', 'ph_chaos', 'ph_hongmeng'].includes(ph.id);
  const isHongmeng = ph.id === 'ph_hongmeng';

  const themes = {
    ph_heart:    { bg: 'radial-gradient(circle, rgba(34,211,238,0.45), rgba(14,116,144,0.2), #050a14 75%)', card: 'border-cyan-400/75 from-cyan-950/95 via-xian-900/95 to-xian-950/95 shadow-[0_0_65px_rgba(34,211,238,0.55)]', tierCls: 'bg-cyan-500/20 border-cyan-300/60 text-cyan-200', palette: ['#67e8f9','#38bdf8','#f0abfc','#ffffff'], beams: 6, shocks: 2, pCount: 48 },
    ph_blood:    { bg: 'radial-gradient(circle, rgba(244,63,94,0.5), rgba(136,19,55,0.28), #0a0408 75%)',  card: 'border-rose-500/80 from-rose-950/95 via-xian-900/95 to-black/95 shadow-[0_0_70px_rgba(244,63,94,0.6)]',   tierCls: 'bg-rose-500/20 border-rose-400/60 text-rose-200', palette: ['#fb7185','#f43f5e','#fda4af','#fde047'], beams: 8, shocks: 2, pCount: 54 },
    ph_bone:     { bg: 'radial-gradient(circle, rgba(251,191,36,0.5), rgba(180,83,9,0.25), #0c0905 75%)',  card: 'border-amber-400/80 from-amber-950/95 via-xian-900/95 to-xian-950/95 shadow-[0_0_70px_rgba(251,191,36,0.6)]', tierCls: 'bg-amber-500/20 border-amber-300/60 text-amber-200', palette: ['#fde047','#f59e0b','#ffffff','#fef08a'], beams: 8, shocks: 2, pCount: 54 },
    ph_eye:      { bg: 'radial-gradient(circle, rgba(168,85,247,0.52), rgba(76,29,149,0.28), #090614 75%)',card: 'border-purple-400/80 from-purple-950/95 via-xian-900/95 to-xian-950/95 shadow-[0_0_75px_rgba(168,85,247,0.6)]', tierCls: 'bg-purple-500/20 border-purple-300/60 text-purple-200', palette: ['#c084fc','#fde047','#e879f9','#ffffff'], beams: 8, shocks: 2, pCount: 58 },
    ph_dao:      { bg: 'radial-gradient(circle, rgba(45,212,191,0.48), rgba(15,118,110,0.25), #060e14 75%)',card: 'border-teal-300/80 from-teal-950/95 via-xian-900/95 to-xian-950/95 shadow-[0_0_75px_rgba(45,212,191,0.6)]', tierCls: 'bg-teal-500/20 border-teal-300/60 text-teal-200', palette: ['#5eead4','#fde047','#ffffff','#38bdf8'], beams: 10, shocks: 2, pCount: 60 },
    ph_ancient:  { bg: 'radial-gradient(circle, rgba(245,158,11,0.55), rgba(185,28,28,0.3), #0e0604 75%)', card: 'border-amber-400/85 from-amber-950/95 via-red-950/90 to-black/95 shadow-[0_0_80px_rgba(245,158,11,0.65)]', tierCls: 'bg-amber-500/25 border-amber-300/70 text-amber-200', palette: ['#fde047','#f59e0b','#ef4444','#ffffff'], beams: 10, shocks: 3, pCount: 66 },
    // 最后三大至高体质：满屏华丽光柱、三重震荡波、海量星辉粒子、震屏效果
    ph_eternal:  { bg: 'radial-gradient(circle, rgba(254,240,138,0.62), rgba(45,212,191,0.38), #071422 76%)', card: 'border-amber-300/90 from-teal-950/95 via-amber-950/85 to-xian-950/95 shadow-[0_0_95px_rgba(253,224,71,0.75)]', tierCls: 'bg-amber-400/25 border-amber-200 text-amber-100', palette: ['#fde047','#5eead4','#ffffff','#fef08a','#34d399'], beams: 14, shocks: 3, pCount: 82 },
    ph_chaos:    { bg: 'radial-gradient(circle, rgba(192,132,252,0.65), rgba(56,189,248,0.35), #060312 76%)', card: 'border-fuchsia-400/90 from-purple-950/95 via-indigo-950/90 to-black/95 shadow-[0_0_105px_rgba(217,70,239,0.8)]', tierCls: 'bg-fuchsia-500/25 border-fuchsia-300 text-fuchsia-100', palette: ['#e879f9','#38bdf8','#fde047','#a855f7','#ffffff'], beams: 16, shocks: 3, pCount: 92 },
    ph_hongmeng: { bg: 'radial-gradient(circle, rgba(253,224,71,0.72), rgba(217,70,239,0.52), rgba(59,7,100,0.45) 55%, #070210 82%)', card: 'border-amber-200 from-fuchsia-950/95 via-amber-950/90 to-indigo-950/95 shadow-[0_0_130px_rgba(253,224,71,0.9)]', tierCls: 'bg-gradient-to-r from-amber-400/35 to-fuchsia-500/35 border-amber-200 text-amber-100', palette: ['#fde047','#f0abfc','#ffffff','#38bdf8','#f59e0b','#e879f9'], beams: 20, shocks: 4, pCount: 115 }
  };
  const cfg = themes[ph.id] || themes.ph_eternal;

  document.getElementById('pa-aurora').style.background = cfg.bg;
  const flash = document.getElementById('pa-flash');
  flash.style.background = isHongmeng
    ? 'radial-gradient(circle, #ffffff, rgba(253,224,71,0.95), rgba(217,70,239,0.65), transparent 76%)'
    : `radial-gradient(circle, #ffffff, ${cfg.palette[0]}, transparent 72%)`;

  const card = document.getElementById('pa-card');
  card.className = `relative z-10 max-w-lg w-full text-center space-y-3 px-6 py-7 rounded-3xl border bg-gradient-to-b ${cfg.card}`;

  const tierEl = document.getElementById('pa-tier');
  tierEl.className = `inline-block px-3.5 py-1 rounded-full text-[11px] font-black tracking-[0.26em] uppercase border ${cfg.tierCls}`;
  tierEl.textContent = `${ph.tierTag || '逆天圣体'} · ${isReplay ? '异象重现' : '脱胎换骨'}`;

  document.getElementById('pa-emblem').innerHTML = getPhysiqueAwakeningSVG(ph.id);
  document.getElementById('pa-title').textContent = `${ph.icon} ${ph.name}`;
  document.getElementById('pa-subtitle').textContent = ph.desc;

  const rewards = [
    `解锁至高神诀《${ph.art.name}》`,
    `+${Math.round(ph.stoneBonus * 100)}% 灵石`,
    `+${Math.round(ph.jadeBonus * 100)}% 仙玉`,
    `+${Math.round(ph.karmaBonus * 100)}% 道果`,
    `+${Math.round(ph.qiBonus * 100)}% 修为`
  ];
  document.getElementById('pa-rewards').innerHTML = rewards.map(r =>
    `<span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-black/50 border border-amber-300/50 text-amber-100">${r}</span>`
  ).join('');

  // 生成满屏放射光柱
  const beamsWrap = document.getElementById('pa-beams');
  beamsWrap.innerHTML = '';
  for (let i = 0; i < cfg.beams; i++) {
    const b = document.createElement('div');
    b.className = 'pa-beam';
    const ang = (180 / cfg.beams) * i;
    const col = cfg.palette[i % cfg.palette.length];
    b.style.setProperty('--ang', `${ang}deg`);
    b.style.setProperty('--bw', `${isTop3 ? 28 : 18}px`);
    b.style.background = `linear-gradient(180deg, transparent 0%, ${col}33 30%, ${col}88 50%, ${col}33 70%, transparent 100%)`;
    b.style.animationDelay = `${(i % 4) * 0.25}s`;
    beamsWrap.appendChild(b);
  }

  // 生成多层扩散冲击波
  const shocksWrap = document.getElementById('pa-shockwaves');
  shocksWrap.innerHTML = '';
  for (let i = 0; i < cfg.shocks; i++) {
    const sh = document.createElement('div');
    sh.className = 'pa-shock-ring';
    sh.style.borderColor = cfg.palette[i % cfg.palette.length];
    sh.style.boxShadow = `0 0 32px ${cfg.palette[i % cfg.palette.length]}`;
    sh.style.setProperty('--dur', `${1.15 + i * 0.35}s`);
    sh.style.setProperty('--delay', `${i * 0.22}s`);
    shocksWrap.appendChild(sh);
  }

  // 生成星辉粒子喷发
  const pWrap = document.getElementById('pa-particles');
  pWrap.innerHTML = '';
  for (let i = 0; i < cfg.pCount; i++) {
    const p = document.createElement('span');
    p.className = 'pa-particle';
    const angle = (Math.PI * 2 * i) / cfg.pCount + (Math.random() - 0.5) * 0.35;
    const dist = 140 + Math.random() * (isTop3 ? 420 : 280);
    const size = (isTop3 ? 5 : 4) + Math.random() * (isHongmeng ? 8 : 6);
    const col = cfg.palette[i % cfg.palette.length];
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = col;
    p.style.boxShadow = `0 0 ${size * 2.2}px ${col}`;
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
    p.style.setProperty('--dur', `${1.0 + Math.random() * 1.1}s`);
    p.style.setProperty('--delay', `${Math.random() * 0.35}s`);
    pWrap.appendChild(p);
  }

  overlay.classList.remove('hidden', 'pa-active', 'pa-shake');
  flash.classList.remove('bt-anim-flash');
  void overlay.offsetWidth;
  overlay.classList.add('pa-active');
  if (isTop3 || ph.id === 'ph_ancient' || ph.id === 'ph_blood') {
    overlay.classList.add('pa-shake');
  }
  flash.classList.add('bt-anim-flash');

  if (typeof playPhysiqueSound === 'function') playPhysiqueSound(ph.id);

  clearTimeout(paOverlayTimer);
  paOverlayTimer = setTimeout(() => {
    overlay.classList.add('hidden');
  }, isHongmeng ? 5200 : isTop3 ? 4500 : 3600);
}

document.getElementById('physique-awakening-overlay')?.addEventListener('click', () => {
  clearTimeout(paOverlayTimer);
  document.getElementById('physique-awakening-overlay').classList.add('hidden');
});

function flushHUD() {
  hudDirty = false;
  const r = getRealm();
  const w = getWorld();
  const req = getQiRequired();
  const ratio = Math.max(0, Math.min(1, state.qi / req));

  setText('pBadge', DOM.prestigeBadge, `轮回 ${state.prestige}世`);
  DOM.ascendBadge.classList.toggle('hidden', !state.ascended);
  setText('stones', DOM.stones, fmt(state.stones));
  setText('jade', DOM.jade, fmt(state.jade));
  setText('karma', DOM.karma, fmt(state.karma));
  setText('cdStat', DOM.cdStat, getCooldownSeconds().toFixed(2) + 's');
  setText('lifespan', DOM.lifespan, r.lifespan);
  setText('sfx', DOM.sfxBtn, state.sfxEnabled ? '🔊' : '🔇');

  setText('tierTag', DOM.tierTag, r.tier);
  setText('realmMain', DOM.realmMain, `${r.name} · ${SUB_REALMS[state.subIdx]}`);
  setText('qiText', DOM.qiTextMain, `${fmt(state.qi)} / ${fmt(req)} 修为`);
  setText('qiPct', DOM.qiPctMain, `${(ratio * 100).toFixed(1)}%`);
  DOM.qiBarMain.style.transform = `scaleX(${ratio})`;

  const readyBreak = canBreakthrough();
  const readyAscend = canAscendNow();
  const anyReady = readyBreak || readyAscend;

  DOM.btTopBtn.disabled = !anyReady;
  DOM.dockBreakBtn.disabled = !anyReady;
  DOM.btCardBtn.classList.toggle('hidden', !anyReady);

  if (readyAscend) {
    DOM.btTopBtn.textContent = '⛩️ 渡劫飞升仙界';
    DOM.btTopBtn.className = 'px-3.5 sm:px-5 py-2 rounded-xl font-black text-xs sm:text-sm tracking-wide transition shrink-0 bg-gradient-to-r from-fuchsia-500 via-amber-400 to-fuchsia-500 text-slate-950 border border-amber-200 breakthrough-ready-pulse';
    DOM.btCardText.textContent = '天劫圆满 · 立即白日飞升仙界！';
    DOM.dockBreakBtn.className = 'col-span-5 min-h-[48px] py-2 px-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 breakthrough-ready-pulse';
  } else if (readyBreak) {
    const isNextMajor = state.subIdx === 3;
    const pctStr = `${(getBreakthroughChance() * 100).toFixed(state.realmIdx >= 9 ? 1 : 0)}%`;
    DOM.btTopBtn.textContent = isNextMajor ? `🌟 突破大境 (${pctStr})` : `⚡ 突破 (${pctStr})`;
    DOM.btTopBtn.className = 'px-3.5 sm:px-5 py-2 rounded-xl font-black text-xs sm:text-sm tracking-wide transition shrink-0 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-slate-950 border border-amber-200 breakthrough-ready-pulse';
    DOM.btCardText.textContent = isNextMajor
      ? `冲击「${REALMS[state.realmIdx + 1]?.name}」· 成功率 ${pctStr}`
      : `突破至「${getNextRealmLabel()}」· 成功率 ${pctStr}`;
    DOM.dockBreakBtn.className = 'col-span-5 min-h-[48px] py-2 px-2 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 breakthrough-ready-pulse';
  } else {
    DOM.btTopBtn.textContent = isAtSupremePeak() ? '👑 万界之巅' : '⚡ 突破境界';
    DOM.btTopBtn.className = 'px-3.5 sm:px-5 py-2 rounded-xl font-black text-xs sm:text-sm tracking-wide transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed bg-xian-850 border border-slate-700 text-slate-400';
    DOM.dockBreakBtn.className = 'col-span-5 min-h-[48px] py-2 px-2 rounded-2xl bg-xian-850 border border-slate-700 text-slate-400 font-extrabold text-xs flex items-center justify-center gap-1 disabled:opacity-45';
  }

  const avatarKey = `${state.realmIdx}:${state.subIdx}`;
  if (textCache.avatarKey !== avatarKey && DOM.sprite) {
    textCache.avatarKey = avatarKey;
    DOM.sprite.innerHTML = getCultivatorAvatarSVG(state.realmIdx, 94, state.subIdx);
  }

  const sceneryKey = state.realmIdx >= 17 ? 'supreme' : (state.ascended || state.realmIdx >= 9 ? 'immortal' : state.realmIdx >= 4 ? 'mortal_high' : 'mortal_low');
  if (textCache.sceneryKey !== sceneryKey && DOM.sceneryLayer) {
    textCache.sceneryKey = sceneryKey;
    DOM.sceneryLayer.innerHTML = getStageScenerySVG(state.realmIdx, state.ascended);
  }
  updateRealmTheme();

  if (textCache.worldId !== w.id) {
    textCache.worldId = w.id;
    DOM.worldStage.style.background = w.gradient;
    DOM.worldIcon.textContent = w.icon;
    DOM.worldName.textContent = w.name;
    DOM.worldDesc.textContent = w.desc;
    DOM.worldMult.textContent = `${fmt(w.stoneMult)}x 灵石 | ${fmt(w.qiBase)} 修为`;
    DOM.dockWorld.textContent = `${w.icon} ${w.name}`;
  }

  const pill = getActivePill();
  const pillText = pill ? `${pill.name} (${fmt(state.pills[pill.id])})` : '无丹药';
  setText('pillShort', DOM.pillShort, pillText);
  setText('dockPill', DOM.dockPill, pill ? pill.name : '无');

  if (textCache.autoMed !== state.autoMeditate) {
    textCache.autoMed = state.autoMeditate;
    DOM.autoMedBtn.textContent = `🌀 自动: ${state.autoMeditate ? '开' : '关'}`;
    DOM.autoMedBtn.className = state.autoMeditate
      ? 'py-2 px-2 rounded-xl bg-teal-500/20 border border-teal-400/50 text-teal-300 text-[11px] font-bold transition active:scale-95'
      : 'py-2 px-2 rounded-xl bg-xian-850 hover:bg-xian-800 border border-slate-700 text-slate-300 text-[11px] font-bold transition active:scale-95';
  }

  const guardCost = getJadeGuardCost();
  const guardKey = `${state.useJadeGuard}:${guardCost}`;
  if (textCache.jadeGuard !== guardKey && DOM.jadeGuardBtn) {
    textCache.jadeGuard = guardKey;
    DOM.jadeGuardBtn.textContent = state.useJadeGuard ? `🛡️ 护道(${fmt(guardCost)}💎)` : '🛡️ 护道: 关';
    DOM.jadeGuardBtn.className = state.useJadeGuard
      ? 'py-2 px-2 rounded-xl bg-amber-500/20 border border-amber-400/55 text-amber-200 text-[11px] font-bold truncate transition active:scale-95'
      : 'py-2 px-2 rounded-xl bg-xian-850 hover:bg-xian-800 border border-slate-700 text-slate-300 text-[11px] font-bold truncate transition active:scale-95';
  }

  setText('chestCnt', DOM.chestCnt, fmt(state.chests));
  DOM.chestDot.classList.toggle('hidden', state.chests <= 0);
  DOM.prestigeDot.classList.toggle('hidden', state.realmIdx < 4);
  setText('physCnt', DOM.physiqueCnt, `体质 ${state.physiques.length}/${PHYSIQUES.length}`);
  setText('stoneM', DOM.stoneMult, `${fmt(getStoneMultiplier())}x 灵石`);
  setText('qiM', DOM.qiMult, `${fmt(getQiMultiplier())}x 修为`);
  setText('eqArt', DOM.eqArtifact, getArtifact().name);
  const apObj = state.activePet ? SPIRIT_PETS.find(x => x.id === state.activePet) : null;
  let apLabel = '未出战';
  if (apObj && (state.pets[apObj.id] || 0) > 0) {
    const pLv = state.pets[apObj.id];
    if (pLv >= PET_MAX_LEVEL) {
      apLabel = `${apObj.icon} ${apObj.name} Lv.100(满)`;
    } else {
      const pReq = getPetExpRequired(apObj.id, pLv);
      const pPct = Math.min(99.9, ((state.petExp[apObj.id] || 0) / Math.max(1, pReq)) * 100).toFixed(0);
      apLabel = `${apObj.icon} ${apObj.name} Lv.${pLv} (${pPct}%)`;
    }
  }
  setText('actPet', DOM.activePet, apLabel);
  setText('nextHint', DOM.nextRealmHint, getNextRealmLabel());
  setText('ticks', DOM.totalTicks, fmt(state.totalTicks));
}

// 批量升级计算器 (x1 / x10 / xMax)
function calcBulk(baseCost, scale, lv, maxLv, currency) {
  const rem = Math.max(0, maxLv - lv);
  if (rem <= 0) return { count: 0, cost: 0, canBuy: false, maxed: true };
  if (buyMode === 'max') {
    let count = 0, total = 0, cur = lv;
    while (cur < maxLv) {
      const step = Math.floor(baseCost * Math.pow(scale, cur));
      if (total + step <= currency) { total += step; count++; cur++; }
      else break;
    }
    if (count === 0) return { count: 1, cost: Math.floor(baseCost * Math.pow(scale, lv)), canBuy: false, maxed: false };
    return { count, cost: total, canBuy: true, maxed: false };
  }
  const want = buyMode === '10' ? Math.min(10, rem) : 1;
  let total = 0;
  for (let i = 0; i < want; i++) total += Math.floor(baseCost * Math.pow(scale, lv + i));
  return { count: want, cost: total, canBuy: currency >= total, maxed: false };
}

function renderBuyModeBar(extraHtml = '') {
  const modes = [{ id: '1', label: 'x1' }, { id: '10', label: 'x10' }, { id: 'max', label: 'xMax' }];
  return `
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">${extraHtml || '<span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">批量修炼</span>'}</div>
      <div class="inline-flex items-center gap-1 bg-xian-950 p-1 rounded-xl border border-slate-800">
        ${modes.map(m => `
          <button data-buy-mode="${m.id}" class="px-3 py-1 rounded-lg text-xs font-extrabold transition ${
            buyMode === m.id ? 'bg-teal-500/25 text-teal-200 border border-teal-400/50' : 'text-slate-400 hover:text-white border border-transparent'
          }">${m.label}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function fmtBulkBtn(calc, prefix, unit) {
  if (calc.maxed) return '已大圆满';
  const qty = calc.count > 1 ? ` (+${calc.count})` : '';
  return `${prefix}${qty} — ${fmt(calc.cost)} ${unit}`;
}


let pillBuyMode = '20'; // '20' | '100' | '1000' | '10000' | '100000' | 'max'

function calcPillBuy(pill, stones, mode = pillBuyMode) {
  if (mode === 'max') {
    const count = Math.floor(stones / pill.cost);
    if (count <= 0) return { count: 1, cost: pill.cost, canBuy: false };
    return { count, cost: count * pill.cost, canBuy: true };
  }
  const count = Number(mode) || 20;
  const cost = count * pill.cost;
  return { count, cost, canBuy: stones >= cost };
}

function fmtPillBuyBtn(calc, mode = pillBuyMode) {
  if (mode === 'max') {
    return calc.canBuy ? `买最大 (+${fmt(calc.count)})` : `最大 — ${fmt(calc.cost)}`;
  }
  return `购买 +${fmt(calc.count)} (${fmt(calc.cost)})`;
}

function renderPillBuyModeBar() {
  const modes = [
    { id: '20', label: '+20' },
    { id: '100', label: '+100' },
    { id: '1000', label: '+1千' },
    { id: '10000', label: '+1万' },
    { id: '100000', label: '+10万' },
    { id: 'max', label: '最大' }
  ];
  return `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">💊 辅助灵丹</h4>
      <div class="inline-flex flex-wrap items-center gap-1 bg-xian-950 p-1 rounded-xl border border-slate-800">
        ${modes.map(m => `
          <button data-pill-mode="${m.id}" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition ${
            pillBuyMode === m.id ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50' : 'text-slate-400 hover:text-white border border-transparent'
          }">${m.label}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function refreshAffordability() {
  if (activeTab === 'arts') {
    DOM.tabArea.querySelectorAll('[data-buy-art]').forEach(btn => {
      const r = REALMS.find(x => x.art.id === btn.dataset.buyArt);
      if (!r) return;
      const calc = calcBulk(r.art.baseCost, r.art.scale, state.arts[r.art.id] || 0, r.art.maxLv, state.stones);
      btn.disabled = !calc.canBuy;
      btn.textContent = fmtBulkBtn(calc, '参悟', '灵石');
    });
    DOM.tabArea.querySelectorAll('[data-buy-part]').forEach(btn => {
      const ph = PHYSIQUES.find(x => x.art.id === btn.dataset.buyPart);
      if (!ph) return;
      const calc = calcBulk(ph.art.baseCost, ph.art.scale, state.physiqueArts[ph.art.id] || 0, ph.art.maxLv, state.jade);
      btn.disabled = !calc.canBuy;
      btn.textContent = fmtBulkBtn(calc, '淬炼神诀', '💎');
    });
  } else if (activeTab === 'treasures') {
    DOM.tabArea.querySelectorAll('[data-pill-buy]').forEach(btn => {
      const p = PILLS.find(x => x.id === btn.dataset.pillBuy);
      if (!p) return;
      const calc = calcPillBuy(p, state.stones, pillBuyMode);
      btn.disabled = !calc.canBuy;
      btn.textContent = fmtPillBuyBtn(calc, pillBuyMode);
    });
    DOM.tabArea.querySelectorAll('[data-artifact]').forEach(btn => {
      const a = ARTIFACTS.find(x => x.id === btn.dataset.artifact);
      if (!a) return;
      const owned = state.ownedArtifacts.includes(a.id);
      const eq = state.artifactId === a.id;
      if (!owned && !eq) {
        btn.disabled = state.stones < a.cost || state.realmIdx < a.reqRealm;
      }
    });
  } else if (activeTab === 'pets') {
    DOM.tabArea.querySelectorAll('[data-pet-luck-buy]').forEach(btn => {
      const u = PET_LUCK_UPGRADES.find(x => x.id === btn.dataset.petLuckBuy);
      if (!u) return;
      const cur = u.currency === 'jade' ? state.jade : state.stones;
      const unit = u.currency === 'jade' ? '💎' : '灵石';
      const calc = calcBulk(u.baseCost, u.scale, state.petLuckUpgrades[u.id] || 0, u.maxLv, cur);
      btn.disabled = !calc.canBuy;
      btn.textContent = fmtBulkBtn(calc, '提升结缘率', unit);
    });
    DOM.tabArea.querySelectorAll('[data-pet-exp-bar]').forEach(bar => {
      const pid = bar.dataset.petExpBar;
      const lv = state.pets[pid] || 0;
      if (lv <= 0) return;
      const txtEl = DOM.tabArea.querySelector(`[data-pet-exp-text="${pid}"]`);
      if (lv >= PET_MAX_LEVEL) {
        bar.style.transform = 'scaleX(1)';
        if (txtEl) txtEl.textContent = 'Lv.100 满级大圆满';
      } else {
        const req = getPetExpRequired(pid, lv);
        const cur = state.petExp[pid] || 0;
        const r = Math.max(0, Math.min(1, cur / Math.max(1, req)));
        bar.style.transform = `scaleX(${r})`;
        if (txtEl) txtEl.textContent = `${fmt(cur)} / ${fmt(req)} (${(r * 100).toFixed(1)}%)`;
      }
    });
  } else if (activeTab === 'relics') {
    DOM.tabArea.querySelectorAll('[data-luck-buy]').forEach(btn => {
      const u = LUCK_UPGRADES.find(x => x.id === btn.dataset.luckBuy);
      if (!u) return;
      const cur = u.currency === 'jade' ? state.jade : state.stones;
      const unit = u.currency === 'jade' ? '💎' : '灵石';
      const calc = calcBulk(u.baseCost, u.scale, state.luckUpgrades[u.id] || 0, u.maxLv, cur);
      btn.disabled = !calc.canBuy;
      btn.textContent = fmtBulkBtn(calc, '提升气运', unit);
    });
  } else if (activeTab === 'reincarnate') {
    DOM.tabArea.querySelectorAll('[data-buy-kperk]').forEach(btn => {
      const k = KARMA_PERKS.find(x => x.id === btn.dataset.buyKperk);
      if (!k) return;
      const calc = calcBulk(k.baseCost, k.scale, state.karmaPerks[k.id] || 0, k.maxLv, state.karma);
      btn.disabled = !calc.canBuy;
      btn.textContent = fmtBulkBtn(calc, '觉醒神通', '🍑');
    });
  }
}

let lbSort = 'score';

function setActiveTabStyles() {
  document.querySelectorAll('#main-tabs .tab-btn').forEach(btn => {
    const isOn = btn.dataset.tab === activeTab;
    btn.className = `tab-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition relative ${
      isOn
        ? 'bg-gradient-to-r from-teal-500/30 to-amber-500/20 text-amber-200 border border-teal-400/50 shadow'
        : 'text-slate-400 hover:text-white hover:bg-xian-800/70 border border-transparent'
    }`;
  });
}

function renderActiveTab() {
  setActiveTabStyles();
  const area = DOM.tabArea;
  if (activeTab === 'arts') renderArtsTab(area);
  else if (activeTab === 'treasures') renderTreasuresTab(area);
  else if (activeTab === 'pets') renderPetsTab(area);
  else if (activeTab === 'relics') renderRelicsTab(area);
  else if (activeTab === 'worlds') renderWorldsTab(area);
  else if (activeTab === 'realms') renderRealmsTab(area);
  else if (activeTab === 'physiques') renderPhysiquesTab(area);
  else if (activeTab === 'reincarnate') renderReincarnateTab(area);
  else if (activeTab === 'leaderboard') renderLeaderboardTab(area);
}

function renderArtsTab(container) {
  // 体质专属至高功法区
  let physiqueArtsHtml = '';
  if (state.physiques.length > 0) {
    const cards = state.physiques.map(pid => {
      const ph = PHYSIQUES.find(x => x.id === pid);
      if (!ph) return '';
      const a = ph.art;
      const lv = state.physiqueArts[a.id] || 0;
      const calc = calcBulk(a.baseCost, a.scale, lv, a.maxLv, state.jade);
      return `
        <div class="p-3.5 rounded-xl bg-gradient-to-br from-fuchsia-950/60 to-xian-850 border border-fuchsia-400/50 flex flex-col justify-between gap-2.5">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-black text-sm text-fuchsia-200">${ph.icon} 《${a.name}》</span>
              <span class="px-2 py-0.5 rounded-md bg-black/40 text-[11px] font-mono font-bold text-amber-300">Lv ${lv}/${a.maxLv}</span>
            </div>
            <div class="text-[11px] text-fuchsia-300/80 mt-0.5">${ph.name}专属至高神诀</div>
            <p class="text-xs text-slate-300 mt-1">${a.desc}</p>
          </div>
          <button data-buy-part="${a.id}" ${calc.canBuy ? '' : 'disabled'} class="w-full py-2 px-3 rounded-xl font-extrabold text-xs transition active:scale-95 ${
            calc.maxed ? 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30 cursor-default'
            : 'bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
          }">${fmtBulkBtn(calc, '淬炼神诀', '💎')}</button>
        </div>
      `;
    }).join('');
    physiqueArtsHtml = `
      <div class="space-y-2.5 pb-3 border-b border-slate-800">
        <div class="text-xs font-extrabold uppercase tracking-wider text-fuchsia-300">✨ 逆天体质专属神诀（永久保留）</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${cards}</div>
      </div>
    `;
  }

  // 境界专属功法（只显示已解锁境界，满级旧功法可一键隐藏）
  const unlockedRealms = REALMS.slice(0, state.realmIdx + 1).reverse();
  const visibleRealms = state.hideMaxedArts
    ? unlockedRealms.filter(r => (state.arts[r.art.id] || 0) < r.art.maxLv)
    : unlockedRealms;

  const realmArtCards = visibleRealms.map(r => {
    const a = r.art;
    const lv = state.arts[a.id] || 0;
    const calc = calcBulk(a.baseCost, a.scale, lv, a.maxLv, state.stones);
    const isCurrent = r.idx === state.realmIdx;
    return `
      <div class="p-3.5 rounded-xl bg-xian-850 border ${isCurrent ? 'border-teal-400/55 shadow' : 'border-slate-800'} flex flex-col justify-between gap-2.5">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-sm text-white">📖 《${a.name}》</span>
            <span class="px-2 py-0.5 rounded-md bg-xian-950 text-[11px] font-mono font-bold text-teal-300">Lv ${lv}/${a.maxLv}</span>
          </div>
          <div class="text-[11px] text-amber-300/90 mt-0.5">${r.name}专属功法</div>
          <p class="text-xs text-slate-400 mt-1">每级基础 +${fmt(a.qiAdd)} 修为，+${fmt(a.stoneAdd)} 灵石。</p>
        </div>
        <button data-buy-art="${a.id}" ${calc.canBuy ? '' : 'disabled'} class="w-full py-2 px-3 rounded-xl font-extrabold text-xs transition active:scale-95 ${
          calc.maxed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
          : 'bg-teal-600 hover:bg-teal-500 disabled:bg-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
        }">${fmtBulkBtn(calc, '参悟', '灵石')}</button>
      </div>
    `;
  }).join('');

  const nextLocked = REALMS[state.realmIdx + 1];
  const mysteryCard = nextLocked ? `
    <div class="p-3.5 rounded-xl bg-xian-950/80 border border-dashed border-slate-700 flex flex-col justify-center items-center text-center gap-1 min-h-[120px] opacity-75">
      <span class="text-xl">🌫️</span>
      <span class="text-xs font-extrabold text-slate-300">《？？？》· 未知高阶功法</span>
      <span class="text-[11px] text-slate-500">突破至下一个大境界后自动领悟</span>
    </div>
  ` : '';

  const hideToggle = `
    <button id="btn-toggle-hide-max" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
      state.hideMaxedArts ? 'bg-amber-500/20 border-amber-400/40 text-amber-200' : 'bg-xian-950 border-slate-700 text-slate-400'
    }">${state.hideMaxedArts ? '已隐藏满级旧法' : '隐藏满级旧功法'}</button>
  `;

  container.innerHTML = `
    <div class="space-y-4">
      ${renderBuyModeBar(hideToggle)}
      ${physiqueArtsHtml}
      <div class="space-y-2.5">
        <div class="text-xs font-extrabold uppercase tracking-wider text-slate-400">📜 当前与过往境界功法</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${realmArtCards}${mysteryCard}</div>
      </div>
    </div>
  `;

  container.querySelector('#btn-toggle-hide-max').onclick = () => {
    state.hideMaxedArts = !state.hideMaxedArts;
    renderActiveTab();
  };
  container.querySelectorAll('[data-buy-mode]').forEach(btn => {
    btn.onclick = () => { buyMode = btn.dataset.buyMode; renderActiveTab(); };
  });
  container.querySelectorAll('[data-buy-art]').forEach(btn => {
    btn.onclick = () => {
      const r = REALMS.find(x => x.art.id === btn.dataset.buyArt);
      const lv = state.arts[r.art.id] || 0;
      const calc = calcBulk(r.art.baseCost, r.art.scale, lv, r.art.maxLv, state.stones);
      if (calc.canBuy && calc.count > 0) {
        state.stones -= calc.cost;
        state.arts[r.art.id] = lv + calc.count;
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
    };
  });
  container.querySelectorAll('[data-buy-part]').forEach(btn => {
    btn.onclick = () => {
      const ph = PHYSIQUES.find(x => x.art.id === btn.dataset.buyPart);
      const lv = state.physiqueArts[ph.art.id] || 0;
      const calc = calcBulk(ph.art.baseCost, ph.art.scale, lv, ph.art.maxLv, state.jade);
      if (calc.canBuy && calc.count > 0) {
        state.jade -= calc.cost;
        state.physiqueArts[ph.art.id] = lv + calc.count;
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
    };
  });
  container.querySelectorAll('[data-replay-ph]').forEach(btn => {
    btn.onclick = () => {
      const ph = PHYSIQUES.find(x => x.id === btn.dataset.replayPh);
      if (ph) showPhysiqueAwakeningAnimation(ph, true);
    };
  });
}

function renderTreasuresTab(container) {
  // 只展示已解锁 + 下1件神秘剪影
  let shownMysteryArt = false;
  const artCards = ARTIFACTS.map(a => {
    const owned = state.ownedArtifacts.includes(a.id);
    const eq = state.artifactId === a.id;
    const unlocked = state.realmIdx >= a.reqRealm || owned;
    if (!unlocked) {
      if (shownMysteryArt) return '';
      shownMysteryArt = true;
      return `
        <div class="p-3.5 rounded-xl bg-xian-950/80 border border-dashed border-slate-700 flex flex-col justify-center items-center text-center gap-1 opacity-75">
          <span class="text-xl">🌫️</span>
          <span class="text-xs font-extrabold text-slate-300">？？？ · 未知高阶法宝</span>
          <span class="text-[11px] text-slate-500">提升境界后于藏宝阁显现</span>
        </div>
      `;
    }
    const disabled = eq || (!owned && state.stones < a.cost);
    return `
      <div class="p-3.5 rounded-xl bg-xian-850 border ${eq ? 'border-amber-400 bg-amber-500/10' : owned ? 'border-emerald-500/35' : 'border-slate-800'} flex flex-col justify-between gap-2.5">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-sm text-white">⚔️ ${a.name}</span>
            <span class="px-2 py-0.5 rounded bg-xian-950 text-[11px] font-mono text-amber-300">${a.qiMult}x 修为</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">${a.stoneMult}x 灵石 • 调息 -${a.cdCut.toFixed(2)}s</p>
        </div>
        <button data-artifact="${a.id}" ${disabled ? 'disabled' : ''} class="w-full py-2 rounded-xl font-extrabold text-xs transition active:scale-95 ${
          eq ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
          : owned ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
          : 'bg-teal-600 hover:bg-teal-500 disabled:bg-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
        }">${eq ? '祭炼装备中' : owned ? '装备法宝' : `炼制 — ${fmt(a.cost)} 灵石`}</button>
      </div>
    `;
  }).join('');

  let shownMysteryPill = false;
  const pillCards = PILLS.map(p => {
    const qty = state.pills[p.id] || 0;
    const eq = state.activePill === p.id;
    const unlocked = state.realmIdx >= p.reqRealm || qty > 0;
    if (!unlocked) {
      if (shownMysteryPill) return '';
      shownMysteryPill = true;
      return `
        <div class="p-3.5 rounded-xl bg-xian-950/80 border border-dashed border-slate-700 flex flex-col justify-center items-center text-center gap-1 opacity-75">
          <span class="text-xl">🌫️</span>
          <span class="text-xs font-extrabold text-slate-300">？？？ · 未知灵丹</span>
          <span class="text-[11px] text-slate-500">境界精进后解锁丹方</span>
        </div>
      `;
    }
    const calc = calcPillBuy(p, state.stones, pillBuyMode);
    return `
      <div class="p-3.5 rounded-xl bg-xian-850 border ${eq ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800'} flex flex-col justify-between gap-2.5">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-sm text-white">💊 ${p.name}</span>
            <span class="px-2 py-0.5 rounded bg-xian-950 text-[11px] font-mono text-emerald-300">存量: ${fmt(qty)}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">${p.desc}</p>
        </div>
        <div class="grid grid-cols-12 gap-1.5">
          <button data-pill-buy="${p.id}" ${calc.canBuy ? '' : 'disabled'} class="col-span-8 py-2 px-2 rounded-xl text-[11px] font-extrabold bg-teal-600 hover:bg-teal-500 disabled:bg-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white transition active:scale-95 truncate">${fmtPillBuyBtn(calc, pillBuyMode)}</button>
          <button data-pill-eq="${p.id}" ${qty <= 0 ? 'disabled' : ''} class="col-span-4 py-2 px-2 rounded-xl text-[11px] font-extrabold ${eq ? 'bg-amber-400 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white'} disabled:bg-xian-950 disabled:text-slate-500 transition active:scale-95">${eq ? '服用中' : '服用'}</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-5">
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-teal-500/15 border border-amber-400/35 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div class="font-extrabold text-sm text-white">🎁 机缘秘宝库（可开出海量灵石与仙玉）</div>
          <div class="text-xs text-slate-300">当前藏有 <strong class="text-amber-300 font-mono">${fmt(state.chests)}</strong> 个秘宝</div>
        </div>
        <div class="flex gap-2">
          <button id="btn-open-1-chest" ${state.chests < 1 ? 'disabled' : ''} class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-xian-950 disabled:text-slate-500 text-white font-bold text-xs">开启 1 个</button>
          <button id="btn-open-all-chest" ${state.chests < 1 ? 'disabled' : ''} class="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-xian-950 disabled:text-slate-500 text-slate-950 font-black text-xs">全部开启 (${fmt(state.chests)})</button>
        </div>
      </div>

      <div class="space-y-2.5">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">⚔️ 本命法宝</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${artCards}</div>
      </div>

      <div class="space-y-2.5 pt-2 border-t border-slate-800">
        ${renderPillBuyModeBar()}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${pillCards}</div>
      </div>
    </div>
  `;

  container.querySelector('#btn-open-1-chest').onclick = () => openChests(1);
  container.querySelector('#btn-open-all-chest').onclick = () => openChests(state.chests);
  container.querySelectorAll('[data-artifact]').forEach(btn => {
    btn.onclick = () => {
      const a = ARTIFACTS.find(x => x.id === btn.dataset.artifact);
      if (state.ownedArtifacts.includes(a.id)) {
        state.artifactId = a.id;
      } else if (state.stones >= a.cost && state.realmIdx >= a.reqRealm) {
        state.stones -= a.cost;
        state.ownedArtifacts.push(a.id);
        state.artifactId = a.id;
        showToast(`⚔️ 炼成并祭炼本命法宝「${a.name}」！`, 'amber');
      }
      hudDirty = true;
      flushHUD();
      renderActiveTab();
    };
  });
  container.querySelectorAll('[data-pill-mode]').forEach(btn => {
    btn.onclick = () => { pillBuyMode = btn.dataset.pillMode; renderActiveTab(); };
  });
  container.querySelectorAll('[data-pill-buy]').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.pillBuy;
      const p = PILLS.find(x => x.id === pid);
      if (!p) return;
      const calc = calcPillBuy(p, state.stones, pillBuyMode);
      if (calc.canBuy && calc.count > 0) {
        state.stones -= calc.cost;
        state.pills[pid] = (state.pills[pid] || 0) + calc.count;
        if (!state.activePill) state.activePill = pid;
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
    };
  });
  container.querySelectorAll('[data-pill-eq]').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.pillEq;
      state.activePill = state.activePill === pid ? null : pid;
      hudDirty = true;
      flushHUD();
      renderActiveTab();
    };
  });
}


function renderPetsTab(container) {
  const petLuckMult = getPetLuckMultiplier();
  const ownedCnt = SPIRIT_PETS.filter(p => (state.pets[p.id] || 0) > 0).length;

  // 1. 提升灵宠结缘概率升级卡片
  const luckCards = PET_LUCK_UPGRADES.map(u => {
    const lv = state.petLuckUpgrades[u.id] || 0;
    const cur = u.currency === 'jade' ? state.jade : state.stones;
    const unit = u.currency === 'jade' ? '💎' : '灵石';
    const calc = calcBulk(u.baseCost, u.scale, lv, u.maxLv, cur);
    return `
      <div class="p-3 rounded-xl bg-xian-850 border ${u.currency === 'jade' ? 'border-emerald-500/35' : 'border-slate-800'} flex flex-col justify-between gap-2">
        <div>
          <div class="flex items-center justify-between gap-1">
            <span class="font-extrabold text-xs sm:text-sm text-white">🪈 ${u.name}</span>
            <span class="px-1.5 py-0.5 rounded bg-xian-950 text-[10px] font-mono text-teal-300">Lv.${lv}/${u.maxLv}</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${u.desc}</p>
        </div>
        <button data-pet-luck-buy="${u.id}" ${calc.canBuy ? '' : 'disabled'} class="w-full py-1.5 px-2 rounded-lg font-extrabold text-[11px] transition active:scale-95 ${
          calc.maxed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
          : 'bg-teal-600 hover:bg-teal-500 disabled:bg-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
        }">${fmtBulkBtn(calc, '提升结缘率', unit)}</button>
      </div>
    `;
  }).join('');

  // 实时结缘概率一览条
  const rateChips = PET_TIERS.map(t => {
    const r = getPetTierLiveRate(t.id) * 100;
    const txt = r >= 0.1 ? `${r.toFixed(2)}%` : `${r.toFixed(4)}%`;
    return `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border ${t.badgeCls}">${t.name}: ${txt}</span>`;
  }).join('');

  // 2. 四大品阶上古灵宠图鉴（从洪荒神兽到灵兽）
  const tierOrder = ['honghuang', 'ruishou', 'sixiang', 'lingshou'];
  const tierSections = tierOrder.map(tid => {
    const tObj = PET_TIERS.find(t => t.id === tid);
    const items = SPIRIT_PETS.filter(p => p.tierId === tid);
    const cards = items.map(pet => {
      const lv = state.pets[pet.id] || 0;
      const owned = lv > 0;
      const isAct = owned && state.activePet === pet.id;
      const mult = isAct ? 2 : 1;

      const statPills = [];
      if (owned) {
        if (pet.qiPerLv > 0)    statPills.push(`<span class="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300">+${Math.round(pet.qiPerLv * lv * mult * 100)}% 修为</span>`);
        if (pet.stonePerLv > 0) statPills.push(`<span class="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">+${Math.round(pet.stonePerLv * lv * mult * 100)}% 灵石</span>`);
        if (pet.jadePerLv > 0)  statPills.push(`<span class="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">+${Math.round(pet.jadePerLv * lv * mult * 100)}% 仙玉</span>`);
        if (pet.luckPerLv > 0)  statPills.push(`<span class="px-1.5 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-300">+${Math.round(pet.luckPerLv * lv * mult * 100)}% 寻宝</span>`);
        if (pet.btAdd > 0)      statPills.push(`<span class="px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-200">+${(pet.btAdd * mult * 100).toFixed(1)}% 破境</span>`);
        if (pet.critAdd > 0)    statPills.push(`<span class="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300">+${(pet.critAdd * mult * 100).toFixed(1)}% 暴击</span>`);
        if (pet.cdCut > 0)      statPills.push(`<span class="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">-${(pet.cdCut * mult).toFixed(2)}s 调息</span>`);
      }

      let expBarHtml = '';
      if (owned) {
        const isMax = lv >= PET_MAX_LEVEL;
        const req = isMax ? 1 : getPetExpRequired(pet.id, lv);
        const curExp = isMax ? 1 : (state.petExp[pet.id] || 0);
        const ratio = isMax ? 1 : Math.max(0, Math.min(1, curExp / Math.max(1, req)));
        const expLabel = isMax ? 'Lv.100 满级大圆满' : `${fmt(curExp)} / ${fmt(req)} (${(ratio * 100).toFixed(1)}%)`;
        expBarHtml = `
          <div class="mt-2.5 space-y-1">
            <div class="flex items-center justify-between text-[10px] font-mono">
              <span class="${isAct ? 'text-amber-300 font-bold' : 'text-slate-400'}">${isMax ? '✨ 修为圆满' : isAct ? '🔥 出战修炼中' : '休养中（出战可获经验）'}</span>
              <span data-pet-exp-text="${pet.id}" class="text-teal-300">${expLabel}</span>
            </div>
            <div class="w-full h-1.5 bg-xian-950 rounded-full overflow-hidden border border-slate-800">
              <div data-pet-exp-bar="${pet.id}" class="cd-gpu-bar h-full w-full ${isMax ? 'bg-gradient-to-r from-amber-300 to-fuchsia-400' : 'bg-gradient-to-r from-emerald-400 to-amber-300'}" style="transform: scaleX(${ratio});"></div>
            </div>
          </div>
        `;
      }

      return `
        <div class="p-3.5 rounded-xl border ${isAct ? 'border-amber-400 bg-amber-500/10 shadow-lg' : owned ? tObj.cardCls : 'border-dashed border-slate-800 bg-xian-950/75 opacity-65'} flex flex-col justify-between gap-2.5">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-black text-sm ${owned ? 'text-white' : 'text-slate-400'}">${pet.icon} ${owned ? pet.name : '？？？'}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${owned ? 'bg-black/45 text-amber-300' : 'bg-slate-900 text-slate-500'}">${owned ? `Lv.${lv}/${PET_MAX_LEVEL}` : '未结缘'}</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${owned ? pet.desc : '打坐吐纳或开启机缘秘宝有几率结缘认主（不可购买，出战后随吐纳获取经验升级）。'}</p>
            ${owned ? `<div class="flex flex-wrap gap-1 mt-2 text-[10px] font-mono">${statPills.join('')}</div>` : ''}
            ${expBarHtml}
          </div>
          ${owned ? `
            <button data-pet-deploy="${pet.id}" class="w-full py-2 px-3 rounded-xl font-extrabold text-xs transition active:scale-95 ${
              isAct ? 'bg-amber-400 text-slate-950 shadow' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }">${isAct ? '⭐ 出战中（2x 加成 + 获取经验）' : '派遣出战（2x 加成 + 获取经验）'}</button>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="px-2 py-0.5 rounded-md text-xs font-black border ${tObj.badgeCls}">${tObj.name}</span>
          <span class="text-[11px] text-slate-400">${tObj.desc}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${cards}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-5">
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-amber-500/15 border border-teal-400/40 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="font-black text-sm text-teal-200">🐉 上古灵宠园（随机结缘 · 仅出战灵宠随吐纳升级 · 最高 100 级）</div>
            <div class="text-xs text-slate-300 mt-0.5">当前灵宠结缘倍率：<strong class="text-emerald-300 font-mono">${petLuckMult.toFixed(2)}x</strong> • 已结缘 <strong class="text-amber-300 font-mono">${ownedCnt}/${SPIRIT_PETS.length}</strong> • 出战灵宠享 <strong>2x 翻倍效果</strong></div>
          </div>
          <span class="text-[11px] font-mono text-slate-300">累计结缘: ${fmt(state.totalPetsFound || 0)} 次</span>
        </div>
        <div class="flex flex-wrap gap-1.5">${rateChips}</div>
      </div>

      <div class="space-y-2.5">
        ${renderBuyModeBar('<span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🪈 提升灵宠结缘概率（开启机缘秘宝更享 3x 结缘率！）</span>')}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">${luckCards}</div>
      </div>

      <div class="space-y-4 pt-2 border-t border-slate-800">
        ${tierSections}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-buy-mode]').forEach(btn => {
    btn.onclick = () => { buyMode = btn.dataset.buyMode; renderActiveTab(); };
  });
  container.querySelectorAll('[data-pet-luck-buy]').forEach(btn => {
    btn.onclick = () => {
      const u = PET_LUCK_UPGRADES.find(x => x.id === btn.dataset.petLuckBuy);
      if (!u) return;
      const lv = state.petLuckUpgrades[u.id] || 0;
      const cur = u.currency === 'jade' ? state.jade : state.stones;
      const calc = calcBulk(u.baseCost, u.scale, lv, u.maxLv, cur);
      if (calc.canBuy && calc.count > 0) {
        if (u.currency === 'jade') state.jade -= calc.cost;
        else state.stones -= calc.cost;
        state.petLuckUpgrades[u.id] = lv + calc.count;
        saveGame(false);
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
    };
  });
  container.querySelectorAll('[data-pet-deploy]').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.petDeploy;
      state.activePet = (state.activePet === pid) ? null : pid;
      const pet = SPIRIT_PETS.find(x => x.id === pid);
      if (state.activePet && pet) showToast(`🐉「${pet.name}」已出战，灵宠加成翻倍！`, 'amber');
      hudDirty = true;
      flushHUD();
      renderActiveTab();
    };
  });
}

function renderRelicsTab(container) {
  const luckMult = getTreasureLuckMultiplier();
  const ownedNormal = RELICS.filter(r => !r.unique && (state.relics[r.id] || 0) > 0).length;
  const totalNormal = RELICS.filter(r => !r.unique).length;
  const ownedSup = RELICS.filter(r => r.unique && (state.relics[r.id] || 0) > 0).length;

  // 1. 寻宝气运提升升级卡片
  const luckCards = LUCK_UPGRADES.map(u => {
    const lv = state.luckUpgrades[u.id] || 0;
    const cur = u.currency === 'jade' ? state.jade : state.stones;
    const unit = u.currency === 'jade' ? '💎' : '灵石';
    const calc = calcBulk(u.baseCost, u.scale, lv, u.maxLv, cur);
    return `
      <div class="p-3 rounded-xl bg-xian-850 border ${u.currency === 'jade' ? 'border-emerald-500/35' : 'border-slate-800'} flex flex-col justify-between gap-2">
        <div>
          <div class="flex items-center justify-between gap-1">
            <span class="font-extrabold text-xs sm:text-sm text-white">🍀 ${u.name}</span>
            <span class="px-1.5 py-0.5 rounded bg-xian-950 text-[10px] font-mono text-teal-300">Lv.${lv}/${u.maxLv}</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${u.desc}</p>
        </div>
        <button data-luck-buy="${u.id}" ${calc.canBuy ? '' : 'disabled'} class="w-full py-1.5 px-2 rounded-lg font-extrabold text-[11px] transition active:scale-95 ${
          calc.maxed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
          : 'bg-teal-600 hover:bg-teal-500 disabled:bg-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
        }">${fmtBulkBtn(calc, '提升气运', unit)}</button>
      </div>
    `;
  }).join('');

  // 实时掉率一览条
  const rateChips = RELIC_TIERS.map(t => {
    const r = getRelicTierLiveRate(t.id) * 100;
    const txt = r >= 0.1 ? `${r.toFixed(2)}%` : r >= 0.001 ? `${r.toFixed(4)}%` : `${r.toFixed(6)}%`;
    return `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border ${t.badgeCls}">${t.name}: ${txt}</span>`;
  }).join('');

  // 2. 最高境界 · 三大先天至宝展示殿
  const supremeCards = RELICS.filter(r => r.unique).map(rel => {
    const owned = (state.relics[rel.id] || 0) > 0;
    return `
      <div class="p-3.5 rounded-xl border ${owned ? 'border-amber-300 bg-gradient-to-br from-fuchsia-950/75 via-amber-950/50 to-indigo-950/75 shadow-[0_0_24px_rgba(253,224,71,0.3)]' : 'border-dashed border-amber-500/35 bg-xian-950/90 opacity-85'} flex flex-col justify-between gap-2">
        <div>
          <div class="flex items-center justify-between gap-1">
            <span class="font-black text-sm ${owned ? 'text-amber-200' : 'text-slate-300'}">${rel.icon} ${rel.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${owned ? 'bg-amber-400/30 text-amber-100' : 'bg-slate-800 text-slate-400'}">${owned ? '已镇压气运' : '未寻得'}</span>
          </div>
          <p class="text-[11px] ${owned ? 'text-amber-100/90' : 'text-slate-400'} mt-1.5 leading-relaxed">${rel.desc}</p>
        </div>
        <div class="text-[10px] font-mono ${owned ? 'text-emerald-300 font-bold' : 'text-fuchsia-300/80'}">
          ${owned ? '✨ 唯一至宝 · 永久生效中' : '🌌 全境界全界域极低概率掉落（无需升级）'}
        </div>
      </div>
    `;
  }).join('');

  // 3. 五品宝物图鉴（从高品阶到低品阶）
  const tierOrder = ['xianqi', 'lingbao', 'fabao', 'lingqi', 'faqi'];
  const tierSections = tierOrder.map(tid => {
    const tObj = RELIC_TIERS.find(t => t.id === tid);
    const items = RELICS.filter(r => r.tier === tid);
    const cards = items.map(rel => {
      const lv = state.relics[rel.id] || 0;
      const owned = lv > 0;
      const curBonuses = [];
      if (owned) {
        if (rel.qiPerLv)    curBonuses.push(`+${Math.round(lv * rel.qiPerLv * 100)}% 修为`);
        if (rel.stonePerLv) curBonuses.push(`+${Math.round(lv * rel.stonePerLv * 100)}% 灵石`);
        if (rel.jadePerLv)  curBonuses.push(`+${Math.round(lv * rel.jadePerLv * 100)}% 仙玉`);
        if (rel.luckPerLv)  curBonuses.push(`+${Math.round(lv * rel.luckPerLv * 100)}% 寻宝`);
        if (rel.btPerLv)    curBonuses.push(`+${(Math.min(0.12, lv * rel.btPerLv) * 100).toFixed(1)}% 破境`);
        if (rel.critPerLv)  curBonuses.push(`+${(Math.min(0.15, lv * rel.critPerLv) * 100).toFixed(1)}% 暴击`);
        if (rel.karmaPerLv) curBonuses.push(`+${Math.round(lv * rel.karmaPerLv * 100)}% 道果`);
      }
      return `
        <div class="p-3 rounded-xl border ${owned ? tObj.cardCls : 'border-dashed border-slate-800 bg-xian-950/75 opacity-65'} space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-xs sm:text-sm ${owned ? 'text-white' : 'text-slate-400'}">${rel.icon} ${owned ? rel.name : '？？？'}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${owned ? 'bg-black/45 text-amber-300' : 'bg-slate-900 text-slate-500'}">${owned ? `Lv.${lv}` : '未获得'}</span>
          </div>
          <p class="text-[11px] text-slate-400">${owned ? rel.desc : '打坐吐纳或开启机缘秘宝有几率寻获（重复获得自动升级）。'}</p>
          ${owned ? `<div class="text-[10px] font-mono text-emerald-300 font-bold">当前总加成：${curBonuses.join(' • ')}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="px-2 py-0.5 rounded-md text-xs font-black border ${tObj.badgeCls}">${tObj.name}</span>
          <span class="text-[11px] text-slate-400">${tObj.desc}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">${cards}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-5">
      <!-- 气运总览 -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-fuchsia-500/15 to-teal-500/15 border border-amber-400/40 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="font-black text-sm text-amber-200">🏺 诸天至宝阁（吐纳与开秘宝自动寻宝 · 重复获取自动升级）</div>
            <div class="text-xs text-slate-300 mt-0.5">当前寻宝气运倍率：<strong class="text-emerald-300 font-mono">${luckMult.toFixed(2)}x</strong> • 已收录常规宝物 <strong class="text-amber-300 font-mono">${ownedNormal}/${totalNormal}</strong> • 先天至宝 <strong class="text-fuchsia-300 font-mono">${ownedSup}/3</strong></div>
          </div>
          <span class="text-[11px] font-mono text-slate-300">累计寻获: ${fmt(state.totalRelicsFound || 0)} 件</span>
        </div>
        <div class="flex flex-wrap gap-1.5">${rateChips}</div>
      </div>

      <!-- 提升宝物掉率升级 -->
      <div class="space-y-2.5">
        ${renderBuyModeBar('<span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🍀 提升宝物获取概率（开启机缘秘宝更享 3x 寻宝率！）</span>')}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">${luckCards}</div>
      </div>

      <!-- 三大先天至宝 -->
      <div class="space-y-2.5 pt-2 border-t border-amber-500/25">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-amber-300">🌌 最高境界 · 三大先天至宝（全境全图极低概率掉落 · 唯一获取）</h4>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${supremeCards}</div>
      </div>

      <!-- 五品宝物图鉴 -->
      <div class="space-y-4 pt-2 border-t border-slate-800">
        ${tierSections}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-buy-mode]').forEach(btn => {
    btn.onclick = () => { buyMode = btn.dataset.buyMode; renderActiveTab(); };
  });
  container.querySelectorAll('[data-luck-buy]').forEach(btn => {
    btn.onclick = () => {
      const u = LUCK_UPGRADES.find(x => x.id === btn.dataset.luckBuy);
      if (!u) return;
      const lv = state.luckUpgrades[u.id] || 0;
      const cur = u.currency === 'jade' ? state.jade : state.stones;
      const calc = calcBulk(u.baseCost, u.scale, lv, u.maxLv, cur);
      if (calc.canBuy && calc.count > 0) {
        if (u.currency === 'jade') state.jade -= calc.cost;
        else state.stones -= calc.cost;
        state.luckUpgrades[u.id] = lv + calc.count;
        saveGame(false);
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
    };
  });
}

function renderWorldsTab(container) {
  let shownMystery = false;
  const cards = WORLDS.map(w => {
    const unlocked = state.realmIdx >= w.reqRealm && (!w.reqAscend || state.ascended);
    const active = state.worldId === w.id;
    if (!unlocked) {
      if (shownMystery) return '';
      shownMystery = true;
      const hint = w.reqAscend && !state.ascended ? '需渡劫飞升仙界后显现' : '需突破至更高大境界后显现';
      return `
        <div class="rounded-2xl border border-dashed border-slate-700 bg-xian-950/85 p-5 flex flex-col items-center justify-center text-center gap-1.5 min-h-[145px] opacity-80">
          <span class="text-3xl">🌫️</span>
          <div class="font-black text-sm text-slate-300">？？？ · 混沌迷雾界域</div>
          <div class="text-xs text-slate-500">${hint}</div>
        </div>
      `;
    }
    return `
      <div class="rounded-2xl overflow-hidden border ${active ? 'border-amber-400 shadow-lg' : 'border-slate-700'} bg-xian-850 flex flex-col justify-between">
        <div class="p-3.5" style="background: ${w.gradient};">
          <div class="flex items-center justify-between gap-2">
            <span class="font-black text-base text-white">${w.icon} ${w.name}</span>
            <span class="px-2 py-0.5 rounded bg-black/45 text-[11px] font-mono font-bold text-amber-300">${fmt(w.stoneMult)}x 灵石 | ${fmt(w.qiBase)} 修为</span>
          </div>
          <p class="text-[11px] text-slate-200/90 mt-1">${w.desc}</p>
        </div>
        <div class="p-3 flex items-center justify-between gap-2 bg-xian-850">
          <span class="text-[11px] text-slate-400">${w.tier}秘境 • 机缘率 ${(w.chestRate * 100).toFixed(1)}%</span>
          <button data-travel="${w.id}" ${active ? 'disabled' : ''} class="px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition active:scale-95 ${
            active ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40' : 'bg-teal-600 hover:bg-teal-500 text-white'
          }">${active ? '当前游历中' : '御剑前往'}</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-3">
      <div class="text-xs text-slate-400">未踏足的诸天界域隐于混沌迷雾之中，境界精进与飞升仙界后将逐一显现。</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${cards}</div>
    </div>
  `;

  container.querySelectorAll('[data-travel]').forEach(btn => {
    btn.onclick = () => {
      state.worldId = btn.dataset.travel;
      const w = getWorld();
      showToast(`🗺️ 已御剑降临「${w.name}」！`, 'cyan');
      hudDirty = true;
      flushHUD();
      renderActiveTab();
    };
  });
}

function renderRealmsTab(container) {
  const maxSeen = Math.max(state.realmIdx, state.maxRealmEver);
  const rows = [];
  for (let i = 0; i <= Math.min(REALMS.length - 1, maxSeen + 1); i++) {
    const r = REALMS[i];
    if (i > maxSeen) {
      rows.push(`
        <div class="p-3.5 rounded-xl bg-xian-950/85 border border-dashed border-slate-700 flex items-center justify-between gap-3 opacity-80">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🌫️</span>
            <div>
              <div class="font-black text-sm text-slate-300">？？？ · 未知境界</div>
              <div class="text-xs text-slate-500">天机未显，唯有亲自破关方可窥见真容。</div>
            </div>
          </div>
          <span class="text-[11px] font-mono text-slate-500 shrink-0">待探索</span>
        </div>
      `);
      break;
    }
    const isCur = i === state.realmIdx;
    rows.push(`
      <div class="p-3.5 rounded-xl border ${isCur ? 'bg-teal-500/15 border-teal-400/60' : 'bg-xian-850 border-slate-800'} flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${r.tier === '人界' ? 'bg-sky-500/20 text-sky-300' : r.tier === '仙界' ? 'bg-amber-500/20 text-amber-300' : 'bg-fuchsia-500/20 text-fuchsia-300'}">${r.tier}</span>
            <span class="font-black text-sm text-white">${r.name}</span>
            ${isCur ? `<span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold">当前：${SUB_REALMS[state.subIdx]}</span>` : ''}
          </div>
          <p class="text-xs text-slate-400 mt-1">${r.desc}</p>
        </div>
        <div class="text-right text-xs font-mono shrink-0">
          <div class="text-teal-300">寿元：${r.lifespan}</div>
          <div class="text-[10px] ${r.idx >= 9 ? 'text-rose-300 font-bold' : 'text-slate-400'}">基础破境率：${(r.baseRate * 100).toFixed(r.idx >= 13 ? 1 : 0)}%</div>
        </div>
      </div>
    `);
  }

  container.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">📜 修真境界图谱（未达境界隐于迷雾）</h4>
        <span class="text-xs font-mono text-amber-300">已探明 ${maxSeen + 1} / ${REALMS.length} 大境</span>
      </div>
      <div class="space-y-2.5">${rows.join('')}</div>
    </div>
  `;
}

function renderPhysiquesTab(container) {
  if (state.prestige < 1) {
    container.innerHTML = `
      <div class="p-6 rounded-2xl bg-xian-950 border border-dashed border-fuchsia-500/40 text-center space-y-2.5">
        <div class="text-4xl">🧬</div>
        <h3 class="text-base font-black text-fuchsia-200">轮回洗髓池 · 尚未开启</h3>
        <p class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          凡胎肉身难以承载诸天至强圣体。请先修炼至 <strong class="text-amber-300">化神期</strong> 并完成 <strong class="text-fuchsia-300">首次重生轮回</strong>，即可解锁九大逆天体质与专属至高神诀！
        </p>
      </div>
    `;
    return;
  }

  const mult = getPhysiqueCostMultiplier();
  const baseCount = getUnlockedBasePhysiqueCount();

  const buildCard = (ph) => {
    const owned = state.physiques.includes(ph.id);
    const lockReason = getPhysiqueLockReason(ph);
    const isLocked = Boolean(lockReason);
    const cost = getPhysiqueActualCost(ph);
    const canBuy = !owned && !isLocked && state.karma >= cost.karma && state.jade >= cost.jade;
    const isSup = Boolean(ph.isSupreme);

    const cardBorder = owned
      ? 'bg-fuchsia-500/15 border-fuchsia-400/60'
      : isLocked
        ? 'bg-xian-950/90 border-dashed border-slate-700/90 opacity-80'
        : isSup
          ? 'bg-gradient-to-br from-amber-950/40 via-fuchsia-950/40 to-xian-850 border-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.18)]'
          : 'bg-xian-850 border-slate-800';

    const statusBadge = owned
      ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/25 text-emerald-300">已觉醒</span>'
      : isLocked
        ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400">🔒 未解封</span>'
        : isSup
          ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/25 text-amber-200">✨ 已解封</span>'
          : '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-xian-950 text-fuchsia-300">可洗髓</span>';

    return `
      <div class="p-3.5 rounded-xl border ${cardBorder} flex flex-col justify-between gap-3">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-black text-sm ${isSup ? 'text-amber-200' : 'text-white'}">${ph.icon} ${ph.name}</span>
            ${statusBadge}
          </div>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">${ph.desc}</p>
          <div class="flex flex-wrap gap-1.5 mt-2 text-[10px] font-mono">
            <span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">+${Math.round(ph.stoneBonus * 100)}% 灵石</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">+${Math.round(ph.jadeBonus * 100)}% 仙玉</span>
            <span class="px-2 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-300">+${Math.round(ph.karmaBonus * 100)}% 道果</span>
            <span class="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300">+${Math.round(ph.qiBonus * 100)}% 修为</span>
          </div>
          <div class="text-[11px] text-amber-200/90 mt-2">✨ 解锁专属神诀：<strong>《${ph.art.name}》</strong></div>
        </div>
        ${owned ? `
          <div class="grid grid-cols-12 gap-1.5">
            <div class="col-span-7 py-2 px-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-center font-extrabold text-xs">已觉醒生效</div>
            <button data-replay-ph="${ph.id}" class="col-span-5 py-2 px-2 rounded-xl bg-fuchsia-500/25 hover:bg-fuchsia-500/40 border border-fuchsia-400/50 text-fuchsia-200 font-extrabold text-xs transition active:scale-95">✨ 重温异象</button>
          </div>
        ` : isLocked ? `
          <button disabled class="w-full py-2 px-3 rounded-xl font-bold text-[11px] bg-xian-950 text-slate-400 border border-slate-800 cursor-not-allowed">
            🔒 ${lockReason}
          </button>
        ` : `
          <button data-buy-ph="${ph.id}" ${!canBuy ? 'disabled' : ''} class="w-full py-2 px-3 rounded-xl font-extrabold text-xs transition active:scale-95 ${
            isSup
              ? 'bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 text-slate-950 hover:brightness-110 disabled:bg-xian-950 disabled:from-xian-950 disabled:via-xian-950 disabled:to-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800'
              : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:brightness-110 disabled:bg-xian-950 disabled:from-xian-950 disabled:to-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
          }">
            觉醒 — ${fmt(cost.karma)} 🍑 + ${fmt(cost.jade)} 💎
          </button>
        `}
      </div>
    `;
  };

  const basePhysiques = PHYSIQUES.filter(p => !p.isSupreme);
  const supremePhysiques = PHYSIQUES.filter(p => p.isSupreme);

  container.innerHTML = `
    <div class="space-y-5">
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500/15 via-indigo-500/15 to-amber-500/15 border border-fuchsia-400/40 space-y-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-black text-sm text-fuchsia-200">🧬 血脉排斥法则（资源暴增 · 阶梯递增）</span>
          <span class="px-2.5 py-0.5 rounded-full bg-black/40 text-xs font-mono font-bold text-amber-300">当前排斥倍率：${fmt(mult)}x (已觉醒 ${state.physiques.length}/9)</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          每觉醒一种逆天体质，其余所有体质的道果与仙玉消耗将飙升 <strong>4 倍</strong>！必须先集齐<strong>前六大基础圣体</strong>，方可按顺序逐一解封终极三大圣体：<strong>永恒仙体 → 混沌神体 → 鸿蒙至尊体</strong>。
        </p>
      </div>

      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🧬 六大逆天圣体（可自由选择觉醒顺序）</h4>
          <span class="text-xs font-mono font-bold ${baseCount >= 6 ? 'text-emerald-300' : 'text-amber-300'}">已集齐 ${baseCount} / 6</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${basePhysiques.map(buildCard).join('')}</div>
      </div>

      <div class="space-y-2.5 pt-3 border-t border-amber-500/25">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-amber-300">👑 三大至高终极圣体（严格按序解锁：永恒仙体 → 混沌神体 → 鸿蒙至尊体）</h4>
          <span class="text-[11px] font-bold ${baseCount >= 6 ? 'text-emerald-300' : 'text-slate-400'}">${baseCount >= 6 ? '✅ 已满足前置六体条件' : `🔒 尚缺 ${6 - baseCount} 种基础圣体`}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${supremePhysiques.map(buildCard).join('')}</div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-buy-ph]').forEach(btn => {
    btn.onclick = () => {
      const ph = PHYSIQUES.find(x => x.id === btn.dataset.buyPh);
      if (!ph || state.physiques.includes(ph.id)) return;
      const lockReason = getPhysiqueLockReason(ph);
      if (lockReason) {
        showToast(`🔒 ${lockReason}`, 'amber');
        return;
      }
      const cost = getPhysiqueActualCost(ph);
      if (state.karma >= cost.karma && state.jade >= cost.jade) {
        state.karma -= cost.karma;
        state.jade -= cost.jade;
        state.physiques.push(ph.id);
        showPhysiqueAwakeningAnimation(ph, false);
        addLog(`🧬 <span class="feed-fuchsia">逆天体质觉醒！</span>成功洗髓获得 <span class="feed-strong">${ph.icon} ${ph.name}</span>，解锁专属神诀 <span class="feed-amber">《${ph.art.name}》</span>！`, 'major');
        saveGame(false);
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
    };
  });
  container.querySelectorAll('[data-replay-ph]').forEach(btn => {
    btn.onclick = () => {
      const ph = PHYSIQUES.find(x => x.id === btn.dataset.replayPh);
      if (ph) showPhysiqueAwakeningAnimation(ph, true);
    };
  });
}

function renderReincarnateTab(container) {
  const canReinc = state.realmIdx >= 4;
  const gain = getKarmaOnReincarnate();
  const ascendReady = canAscendNow();

  const perksHtml = KARMA_PERKS.map(k => {
    const lv = state.karmaPerks[k.id] || 0;
    const calc = calcBulk(k.baseCost, k.scale, lv, k.maxLv, state.karma);
    return `
      <div class="p-3.5 rounded-xl bg-xian-850 border ${lv > 0 ? 'border-fuchsia-400/40' : 'border-slate-800'} flex flex-col justify-between gap-2.5">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-sm text-white">🍑 ${k.name}</span>
            <span class="px-2 py-0.5 rounded bg-xian-950 text-[11px] font-mono text-fuchsia-300">Lv ${lv}/${k.maxLv}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">${k.desc}</p>
        </div>
        <button data-buy-kperk="${k.id}" ${calc.canBuy ? '' : 'disabled'} class="w-full py-2 rounded-xl font-extrabold text-xs transition ${
          calc.maxed ? 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30 cursor-default'
          : 'bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
        }">${fmtBulkBtn(calc, '觉醒神通', '🍑')}</button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-4">
      <!-- 渡劫飞升卡片 -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-teal-500/15 to-xian-900 border border-amber-400/50 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-base sm:text-lg font-black text-amber-200">⛩️ 渡劫飞升仙界</h3>
            <p class="text-xs text-slate-300 mt-0.5">
              ${state.ascended ? '✅ 此世已飞升仙界，永久享有仙灵气转化加成！' : '需达到「渡劫期 · 大圆满」且修为蓄满，渡过天劫即可白日飞升。'}
            </p>
          </div>
          <button id="btn-tab-ascend" ${ascendReady ? '' : 'disabled'} class="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 disabled:bg-xian-950 disabled:from-xian-950 disabled:to-xian-950 disabled:text-slate-500 transition active:scale-95">
            ${state.ascended ? '已飞升仙界' : '⛩️ 引动天劫飞升'}
          </button>
        </div>
      </div>

      <!-- 重生轮回卡片 -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-indigo-500/20 to-xian-900 border border-fuchsia-400/50 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-base sm:text-lg font-black text-fuchsia-200">🔄 重生轮回（开启第 ${state.prestige + 1} 世）</h3>
            <p class="text-xs text-slate-300 mt-0.5">需达到「化神期」以上。当前已享永久 <strong class="text-teal-300">+${state.prestige * 20}% 修为</strong> 与 <strong class="text-amber-300">+${state.prestige * 25}% 灵石</strong>。</p>
          </div>
          <button id="btn-tab-reincarnate" ${canReinc ? '' : 'disabled'} class="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white disabled:bg-xian-950 disabled:from-xian-950 disabled:to-xian-950 disabled:text-slate-500 transition active:scale-95">
            🔄 轮回转世 (+${fmt(gain)} 道果)
          </button>
        </div>
      </div>

      ${renderBuyModeBar('<span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">轮回神通（永久保留）</span>')}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${perksHtml}</div>
    </div>
  `;

  container.querySelector('#btn-tab-ascend').onclick = attemptAscension;
  container.querySelector('#btn-tab-reincarnate').onclick = doReincarnate;
  container.querySelectorAll('[data-buy-mode]').forEach(btn => {
    btn.onclick = () => { buyMode = btn.dataset.buyMode; renderActiveTab(); };
  });
  container.querySelectorAll('[data-buy-kperk]').forEach(btn => {
    btn.onclick = () => {
      const k = KARMA_PERKS.find(x => x.id === btn.dataset.buyKperk);
      const lv = state.karmaPerks[k.id] || 0;
      const calc = calcBulk(k.baseCost, k.scale, lv, k.maxLv, state.karma);
      if (calc.canBuy && calc.count > 0) {
        state.karma -= calc.cost;
        state.karmaPerks[k.id] = lv + calc.count;
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
    };
  });
}

function escHtml(s) {
  return String(s || '散修').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderLeaderboardTab(container) {
  const cloud = window.CloudSync;
  const myUid = cloud && cloud.getUid ? cloud.getUid() : 'local-me';
  const raw = cloud && cloud.getLeaderboard ? cloud.getLeaderboard() : [];
  const lbStatus = cloud && cloud.getLeaderboardStatus ? cloud.getLeaderboardStatus() : 'local';

  const list = raw.length > 0 ? raw.map(x => ({ ...x })) : [{
    uid: myUid,
    displayName: state.displayName || '青云散修',
    prestige: state.prestige,
    realmIdx: state.realmIdx,
    subIdx: state.subIdx,
    stones: state.stones,
    physiqueCount: state.physiques.length,
    totalTicks: state.totalTicks,
    isGoogle: false
  }];

  list.sort((a, b) => {
    if (lbSort === 'stones') return (b.stones || 0) - (a.stones || 0);
    if (lbSort === 'physiques') return (b.physiqueCount || 0) - (a.physiqueCount || 0) || (b.realmIdx || 0) - (a.realmIdx || 0);
    if ((b.prestige || 0) !== (a.prestige || 0)) return (b.prestige || 0) - (a.prestige || 0);
    if ((b.realmIdx || 0) !== (a.realmIdx || 0)) return (b.realmIdx || 0) - (a.realmIdx || 0);
    return (b.subIdx || 0) - (a.subIdx || 0);
  });

  const myIdx = list.findIndex(x => x.uid === myUid);
  const myRank = myIdx >= 0 ? `第 ${myIdx + 1} 名` : '同步中...';

  const rows = list.slice(0, 50).map((p, idx) => {
    const rank = idx + 1;
    const isMe = p.uid === myUid;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
    const rObj = REALMS[Math.min(REALMS.length - 1, p.realmIdx || 0)] || REALMS[0];
    const subName = SUB_REALMS[Math.min(3, p.subIdx || 0)] || '初期';
    return `
      <div class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border ${
        isMe ? 'bg-teal-500/20 border-teal-400/60' : rank <= 3 ? 'bg-amber-500/10 border-amber-400/30' : 'bg-xian-850 border-slate-800'
      }">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 text-center font-black text-sm ${rank <= 3 ? 'text-amber-300' : 'text-slate-400'} shrink-0">${medal}</div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-xs sm:text-sm text-white truncate">${escHtml(p.displayName)}</span>
              <span class="text-[11px]">${p.isGoogle ? '⭐' : '👤'}</span>
              ${isMe ? '<span class="px-1.5 py-0.5 rounded bg-teal-500/25 text-teal-200 text-[10px] font-extrabold">本尊</span>' : ''}
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2">
              <span class="text-fuchsia-300 font-bold">${p.prestige || 0}世</span>
              <span>•</span>
              <span class="text-amber-300 font-bold">${rObj.name}·${subName}</span>
              <span class="hidden sm:inline">•</span>
              <span class="hidden sm:inline text-teal-300">圣体 ${p.physiqueCount || 0}</span>
            </div>
          </div>
        </div>
        <div class="text-right shrink-0 font-mono">
          <div class="text-xs sm:text-sm font-black text-amber-300">${fmt(p.stones || 0)} 灵石</div>
          <div class="text-[10px] text-slate-400">${fmt(p.totalTicks || 0)} 吐纳</div>
        </div>
      </div>
    `;
  }).join('');

  const banner = lbStatus === 'error'
    ? `<div class="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs">⚠️ 请在 Firebase Firestore Rules 中添加 <code class="font-mono">xiuxian_users</code> 与 <code class="font-mono">xiuxian_leaderboard</code> 权限以启用全服金榜。</div>`
    : lbStatus === 'local'
      ? `<div class="p-3 rounded-xl bg-xian-850 border border-slate-700 text-slate-300 text-xs">🔌 正在连接诸天金榜...</div>`
      : '';

  const sorts = [
    { id: 'score', label: '🏅 轮回与境界' },
    { id: 'stones', label: '🪙 灵石富豪榜' },
    { id: 'physiques', label: '🧬 逆天圣体榜' }
  ];

  container.innerHTML = `
    <div class="space-y-4">
      <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-teal-500/15 to-fuchsia-500/15 border border-amber-400/35 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-xs font-extrabold uppercase tracking-wider text-amber-200">🏆 诸天万界金榜</div>
          <div class="text-sm sm:text-base font-black text-white mt-0.5">当前道位：<span class="text-teal-300 font-mono">${myRank}</span></div>
        </div>
        <button id="btn-lb-sync" class="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs transition active:scale-95">🔄 刷新同步金榜</button>
      </div>
      ${banner}
      <div class="flex flex-wrap items-center gap-1.5 bg-xian-950 p-1.5 rounded-xl border border-slate-800">
        ${sorts.map(s => `
          <button data-lb-sort="${s.id}" class="flex-1 min-w-[100px] py-2 px-3 rounded-lg text-[11px] sm:text-xs font-extrabold transition ${
            lbSort === s.id ? 'bg-teal-500/25 text-teal-200 border border-teal-400/40' : 'text-slate-400 hover:text-white'
          }">${s.label}</button>
        `).join('')}
      </div>
      <div class="space-y-2">${rows}</div>
    </div>
  `;

  container.querySelector('#btn-lb-sync').onclick = () => saveGame(true);
  container.querySelectorAll('[data-lb-sort]').forEach(btn => {
    btn.onclick = () => { lbSort = btn.dataset.lbSort; renderActiveTab(); };
  });
}

window.onLeaderboardUpdate = () => {
  if (activeTab === 'leaderboard') renderActiveTab();
};
