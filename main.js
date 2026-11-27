/* ============================================================================
   主入口 — 游戏循环、后台 Web Worker、离线闭关结算（最长12h）与交互绑定
   ============================================================================ */
window.getGameState = () => state;
window.applyCloudState = (parsed) => {
  mergeState(parsed);
  try { localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(state)); } catch (_) {}
  hudDirty = true;
  flushHUD();
  renderActiveTab();
};

const _localOnlySave = window.saveGame;
window.saveGame = function(notify = false) {
  _localOnlySave(false);
  if (window.CloudSync && window.CloudSync.isReady()) {
    window.CloudSync.save(notify);
  } else if (notify) {
    showToast('💾 修行玉简已保存至本地！', 'emerald');
  }
};

let lastRealTime = Date.now();
let hiddenSince = null;
let hiddenSnap = null;
let bgWorker = null;

function captureSnap() {
  return { stones: state.stones, qi: state.qi, chests: state.chests, ticks: state.totalTicks };
}

function fmtDur(sec) {
  const s = Math.floor(sec);
  if (s < 60) return `${s}秒`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}分${s % 60}秒`;
  return `${Math.floor(m / 60)}时${m % 60}分`;
}

function advanceSimulation(dtSec, silent = false) {
  if (dtSec <= 0) return;
  const clamped = Math.min(43200, dtSec);
  const totalCd = getCooldownSeconds();

  if (state.autoMeditate) {
    let timeLeft = clamped;
    if (cooldownRemaining > 0) {
      if (timeLeft >= cooldownRemaining) { timeLeft -= cooldownRemaining; cooldownRemaining = 0; }
      else { cooldownRemaining -= timeLeft; timeLeft = 0; }
    }
    if (cooldownRemaining <= 0) {
      const ticks = 1 + Math.floor(timeLeft / totalCd);
      const rem = timeLeft - Math.floor(timeLeft / totalCd) * totalCd;
      cooldownRemaining = Math.max(0, totalCd - rem);
      const useSilent = silent || ticks > 3;
      const MAX_LOOPS = 250;
      if (ticks <= MAX_LOOPS) {
        for (let i = 0; i < ticks; i++) performMeditate(useSilent, 1);
      } else {
        const scale = ticks / MAX_LOOPS;
        for (let i = 0; i < MAX_LOOPS; i++) performMeditate(true, scale);
      }
    }
  } else if (cooldownRemaining > 0) {
    cooldownRemaining = Math.max(0, cooldownRemaining - clamped);
  }
  state.lastActiveAt = Date.now();
}

function postAwaySummary(elapsedSec, before, label = '后台闭关') {
  if (elapsedSec < 5 || !before) return;
  const dTicks = state.totalTicks - before.ticks;
  const dStones = state.stones - before.stones;
  const dChests = state.chests - before.chests;
  if (dTicks <= 0 && dStones <= 0) return;
  const parts = [];
  if (dTicks > 0) parts.push(`<span class="feed-strong">+${fmt(dTicks)} 次吐纳</span>`);
  if (dStones > 0) parts.push(`<span class="feed-amber">+${fmt(dStones)} 灵石</span>`);
  if (dChests > 0) parts.push(`<span class="feed-emerald">+${dChests} 机缘秘宝</span>`);
  addLog(`🌙 <span class="feed-strong">${label} (${fmtDur(elapsedSec)})：</span>${parts.join(' • ')}`, 'break');
  showToast(`🌙 ${label} ${fmtDur(elapsedSec)} 结算完成！`, 'cyan');
}

function initBgWorker() {
  if (typeof Worker === 'undefined') return;
  try {
    const code = `let t = setInterval(() => postMessage('tick'), 500); onmessage = e => { if (e.data === 'stop') clearInterval(t); };`;
    bgWorker = new Worker(URL.createObjectURL(new Blob([code], { type: 'application/javascript' })));
    bgWorker.onmessage = () => {
      if (document.hidden) {
        const now = Date.now();
        const dt = (now - lastRealTime) / 1000;
        lastRealTime = now;
        if (dt > 0) advanceSimulation(dt, true);
      }
    };
  } catch (_) {}
}

window.addEventListener('pagehide', () => {
  state.lastActiveAt = Date.now();
  try { localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(state)); } catch (_) {}
});

document.addEventListener('visibilitychange', () => {
  const now = Date.now();
  if (document.hidden) {
    hiddenSince = now;
    hiddenSnap = captureSnap();
    saveGame(false);
  } else {
    const dt = (now - lastRealTime) / 1000;
    lastRealTime = now;
    if (dt > 0.2) advanceSimulation(dt, true);
    if (hiddenSince && hiddenSnap) postAwaySummary((now - hiddenSince) / 1000, hiddenSnap, '后台闭关');
    hiddenSince = null;
    hiddenSnap = null;
    hudDirty = true;
    flushHUD();
    refreshAffordability();
  }
});

function attemptManualMeditate() {
  if (cooldownRemaining <= 0) {
    performMeditate(false, 1);
    flushHUD();
  }
}

function cyclePill() {
  const owned = [null, ...PILLS.filter(p => (state.pills[p.id] || 0) > 0).map(p => p.id)];
  const idx = owned.indexOf(state.activePill);
  state.activePill = owned[(idx + 1) % owned.length];
  hudDirty = true;
  flushHUD();
  if (activeTab === 'treasures') renderActiveTab();
}

function gameLoop() {
  const realNow = Date.now();
  const realDt = Math.max(0, (realNow - lastRealTime) / 1000);
  lastRealTime = realNow;

  advanceSimulation(realDt, false);

  const totalCd = getCooldownSeconds();
  if (cooldownRemaining <= 0) {
    if (lastCdReady !== true) {
      lastCdReady = true;
      DOM.medBtn.disabled = false;
      DOM.dockMedBtn.disabled = false;
      DOM.cdFill.style.transform = 'scaleX(1)';
      DOM.dockCdBar.style.transform = 'scaleX(1)';
      setText('cdTimer', DOM.cdTimer, `就绪 (${totalCd.toFixed(2)}s)`);
      setText('dockCd', DOM.dockCdText, '就绪');
      setText('stageStatus', DOM.stageStatus, '灵气充盈，按空格或点击打坐吐纳');
    }
  } else {
    if (lastCdReady !== false) {
      lastCdReady = false;
      DOM.medBtn.disabled = true;
      DOM.dockMedBtn.disabled = true;
      setText('stageStatus', DOM.stageStatus, '周天运转，吐纳天地灵气中...');
    }
    const ratio = Math.max(0, Math.min(1, (totalCd - cooldownRemaining) / totalCd));
    DOM.cdFill.style.transform = `scaleX(${ratio})`;
    DOM.dockCdBar.style.transform = `scaleX(${ratio})`;
    const s = `${cooldownRemaining.toFixed(1)}s`;
    setText('cdTimer', DOM.cdTimer, s);
    setText('dockCd', DOM.dockCdText, s);
  }

  hudFlushAccum += Math.min(0.25, realDt);
  if (hudDirty && hudFlushAccum >= 0.1) {
    hudFlushAccum = 0;
    flushHUD();
  }
  requestAnimationFrame(gameLoop);
}

// 导出/导入玉简
function exportSaveJson() {
  const payload = JSON.stringify({ ...state, exportedAt: Date.now() }, null, 2);
  try {
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `xiuxian_save_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (_) {}
  try { navigator.clipboard?.writeText(payload); } catch (_) {}
  showToast('📤 已导出玉简 .json 并复制到剪贴板！', 'emerald');
}

function applyImportedJson(raw) {
  try {
    const parsed = JSON.parse(raw.trim());
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid');
    mergeState(parsed);
    saveGame(true);
    hudDirty = true;
    flushHUD();
    renderActiveTab();
    document.getElementById('import-json-panel').classList.add('hidden');
    document.getElementById('input-import-json').value = '';
    showToast('📥 玉简存档载入成功！', 'emerald');
  } catch (_) {
    showToast('玉简 JSON 格式有误。', 'rose');
  }
}

// 绑定事件
document.querySelectorAll('#main-tabs .tab-btn').forEach(btn => {
  btn.onclick = () => { activeTab = btn.dataset.tab; renderActiveTab(); };
});

DOM.medBtn.onclick = attemptManualMeditate;
DOM.dockMedBtn.onclick = attemptManualMeditate;
DOM.btTopBtn.onclick = attemptBreakthrough;
DOM.btCardBtn.onclick = attemptBreakthrough;
DOM.dockBreakBtn.onclick = attemptBreakthrough;

document.getElementById('btn-cycle-pill').onclick = cyclePill;
document.getElementById('dock-cycle-pill').onclick = cyclePill;
document.getElementById('btn-quick-chests').onclick = () => { activeTab = 'treasures'; renderActiveTab(); };

DOM.autoMedBtn.onclick = () => {
  state.autoMeditate = !state.autoMeditate;
  hudDirty = true;
  flushHUD();
};
if (DOM.jadeGuardBtn) {
  DOM.jadeGuardBtn.onclick = () => {
    state.useJadeGuard = !state.useJadeGuard;
    hudDirty = true;
    flushHUD();
    showToast(state.useJadeGuard
      ? `🛡️ 已开启仙玉护道：破境消耗 ${fmt(getJadeGuardCost())} 💎，提升成功率并减半反噬损耗`
      : '已关闭仙玉护道', state.useJadeGuard ? 'amber' : 'cyan');
  };
}
DOM.sfxBtn.onclick = () => {
  state.sfxEnabled = !state.sfxEnabled;
  hudDirty = true;
  flushHUD();
};

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    attemptManualMeditate();
  }
});

// 账号弹窗
document.getElementById('btn-open-account').onclick = () => {
  document.getElementById('input-display-name').value = state.displayName || '青云散修';
  if (window.CloudSync) window.CloudSync.updateUI();
  document.getElementById('account-modal').classList.remove('hidden');
};
document.getElementById('btn-close-account').onclick = () => {
  document.getElementById('account-modal').classList.add('hidden');
};
document.getElementById('btn-save-name').onclick = () => {
  const v = document.getElementById('input-display-name').value.trim();
  if (v) state.displayName = v.slice(0, 18);
  if (window.CloudSync) window.CloudSync.updateUI();
  saveGame(true);
};
document.getElementById('btn-save-now').onclick = () => saveGame(true);
document.getElementById('btn-export-save').onclick = exportSaveJson;
document.getElementById('btn-import-save-toggle').onclick = () => {
  document.getElementById('import-json-panel').classList.toggle('hidden');
};
document.getElementById('btn-import-file-pick').onclick = () => {
  document.getElementById('input-import-file').click();
};
document.getElementById('input-import-file').onchange = e => {
  const f = e.target.files?.[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => applyImportedJson(String(r.result || ''));
  r.readAsText(f);
  e.target.value = '';
};
document.getElementById('btn-import-json-apply').onclick = () => {
  applyImportedJson(document.getElementById('input-import-json').value);
};
document.getElementById('btn-hard-reset').onclick = () => {
  if (confirm('确定兵解重修，彻底清空所有修仙记录（含体质与轮回）？')) {
    localStorage.removeItem(LOCAL_SAVE_KEY);
    state = defaultState();
    saveGame(false);
    hudDirty = true;
    flushHUD();
    renderActiveTab();
    document.getElementById('account-modal').classList.add('hidden');
    showToast('🔄 已兵解重修，重归炼气初期。', 'rose');
  }
};

// 定时任务与启动
setInterval(() => saveGame(false), 15000);
setInterval(refreshAffordability, 750);

loadGame();
if (state.lastActiveAt && state.autoMeditate) {
  const offSec = (Date.now() - state.lastActiveAt) / 1000;
  if (offSec >= 10) {
    const snap = captureSnap();
    advanceSimulation(offSec, true);
    postAwaySummary(Math.min(43200, offSec), snap, '离线闭关');
  }
}
lastRealTime = Date.now();
initBgWorker();
flushHUD();
renderActiveTab();
addLog('☯️ 欢迎踏入 <span class="feed-strong">《九霄问道 · 诸天修仙录》</span>！修为圆满后请亲手点击「突破境界」破关晋阶！', 'break');
requestAnimationFrame(gameLoop);
