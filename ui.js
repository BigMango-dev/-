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
  DOM.sprite.classList.add('sprite-pulse');
  clearTimeout(spriteTimeout);
  spriteTimeout = setTimeout(() => DOM.sprite.classList.remove('sprite-pulse'), 140);
}

// 破境 / 飞升全屏特效动画
let btOverlayTimer = null;
function showBreakthroughAnimation({ type = 'minor', kicker, icon, title, subtitle, rewards = [] }) {
  const overlay = document.getElementById('breakthrough-overlay');
  const flash = document.getElementById('bt-flash');
  const particles = document.getElementById('bt-particles');
  const card = document.getElementById('bt-card');

  document.getElementById('bt-kicker').textContent = kicker;
  document.getElementById('bt-icon').textContent = icon;
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
    return `
      <div class="p-3.5 rounded-xl bg-xian-850 border ${eq ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800'} flex flex-col justify-between gap-2.5">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-sm text-white">💊 ${p.name}</span>
            <span class="px-2 py-0.5 rounded bg-xian-950 text-[11px] font-mono text-emerald-300">存量: ${fmt(qty)}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">${p.desc}</p>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <button data-pill-buy="${p.id}:20" ${state.stones < p.cost * 20 ? 'disabled' : ''} class="py-1.5 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-500 disabled:bg-xian-950 disabled:text-slate-500 text-white">+20 (${fmt(p.cost * 20)})</button>
          <button data-pill-buy="${p.id}:100" ${state.stones < p.cost * 100 ? 'disabled' : ''} class="py-1.5 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-500 disabled:bg-xian-950 disabled:text-slate-500 text-white">+100 (${fmt(p.cost * 100)})</button>
          <button data-pill-eq="${p.id}" ${qty <= 0 ? 'disabled' : ''} class="py-1.5 rounded-lg text-[11px] font-bold ${eq ? 'bg-amber-400 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white'} disabled:bg-xian-950 disabled:text-slate-500">${eq ? '服用中' : '服用'}</button>
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
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">💊 辅助灵丹</h4>
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
  container.querySelectorAll('[data-pill-buy]').forEach(btn => {
    btn.onclick = () => {
      const [pid, nStr] = btn.dataset.pillBuy.split(':');
      const n = Number(nStr);
      const p = PILLS.find(x => x.id === pid);
      if (state.stones >= p.cost * n) {
        state.stones -= p.cost * n;
        state.pills[pid] = (state.pills[pid] || 0) + n;
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
  const cards = PHYSIQUES.map(ph => {
    const owned = state.physiques.includes(ph.id);
    const cost = getPhysiqueActualCost(ph);
    const canBuy = !owned && state.karma >= cost.karma && state.jade >= cost.jade;
    return `
      <div class="p-3.5 rounded-xl border ${owned ? 'bg-fuchsia-500/15 border-fuchsia-400/60' : 'bg-xian-850 border-slate-800'} flex flex-col justify-between gap-3">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-black text-sm text-white">${ph.icon} ${ph.name}</span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${owned ? 'bg-emerald-500/25 text-emerald-300' : 'bg-xian-950 text-fuchsia-300'}">${owned ? '已觉醒' : '可洗髓'}</span>
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
        <button data-buy-ph="${ph.id}" ${owned || !canBuy ? 'disabled' : ''} class="w-full py-2 px-3 rounded-xl font-extrabold text-xs transition active:scale-95 ${
          owned ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 cursor-default'
          : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:brightness-110 disabled:bg-xian-950 disabled:from-xian-950 disabled:to-xian-950 disabled:text-slate-500 disabled:border disabled:border-slate-800 text-white'
        }">${owned ? '已觉醒（永久生效）' : `觉醒 — ${fmt(cost.karma)} 🍑 + ${fmt(cost.jade)} 💎`}</button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-4">
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500/15 via-indigo-500/15 to-amber-500/15 border border-fuchsia-400/40 space-y-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-black text-sm text-fuchsia-200">🧬 血脉排斥法则（资源暴增 · 阶梯递增）</span>
          <span class="px-2.5 py-0.5 rounded-full bg-black/40 text-xs font-mono font-bold text-amber-300">当前排斥倍率：${fmt(mult)}x (已觉醒 ${state.physiques.length}/9)</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          每觉醒一种逆天体质，其余所有体质的道果与仙玉消耗将飙升 <strong>4 倍</strong>，请谨慎抉择觉醒顺序！觉醒后将大幅加速灵石、仙玉与道果获取，并在「📖 功法修炼」中开启专属至高神诀。
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${cards}</div>
    </div>
  `;

  container.querySelectorAll('[data-buy-ph]').forEach(btn => {
    btn.onclick = () => {
      const ph = PHYSIQUES.find(x => x.id === btn.dataset.buyPh);
      if (!ph || state.physiques.includes(ph.id)) return;
      const cost = getPhysiqueActualCost(ph);
      if (state.karma >= cost.karma && state.jade >= cost.jade) {
        state.karma -= cost.karma;
        state.jade -= cost.jade;
        state.physiques.push(ph.id);
        playBreakthroughSound('major');
        showBreakthroughAnimation({
          type: 'major',
          kicker: '脱胎换骨 · 圣体觉醒',
          icon: ph.icon,
          title: `觉醒「${ph.name}」`,
          subtitle: ph.desc,
          rewards: [`解锁《${ph.art.name}》`, `+${Math.round(ph.stoneBonus * 100)}% 灵石`, `+${Math.round(ph.jadeBonus * 100)}% 仙玉`]
        });
        addLog(`🧬 <span class="feed-fuchsia">逆天体质觉醒！</span>成功洗髓获得 <span class="feed-strong">${ph.icon} ${ph.name}</span>，解锁专属神诀 <span class="feed-amber">《${ph.art.name}》</span>！`, 'major');
        saveGame(false);
        hudDirty = true;
        flushHUD();
        renderActiveTab();
      }
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
