/* ============================================================================
   核心修仙引擎 — 吐纳、手动破境特效、渡劫飞升、重生轮回、秘宝与音效
   ============================================================================ */
let audioCtx = null;

function playBreakthroughSound(type = 'minor') {
  if (!state.sfxEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const notes = type === 'fail'
      ? [220.0, 185.0, 146.83]
      : type === 'ascend'
        ? [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]
        : type === 'major'
          ? [293.66, 440.0, 587.33, 880.0]
          : [392.0, 523.25, 659.25];

    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type === 'minor' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.11, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + (type === 'minor' ? 0.55 : 0.95));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.0);
    });
  } catch (_) {}
}

function performMeditate(silent = false, batchScale = 1) {
  const scale = Math.max(1, batchScale);
  const world = getWorld();
  const realm = getRealm();
  const flat = getArtsFlatGains();
  const pill = getActivePill();

  // 丹药消耗
  if (pill) {
    const used = Math.min(state.pills[pill.id], Math.round(scale));
    state.pills[pill.id] = Math.max(0, state.pills[pill.id] - used);
    if (state.pills[pill.id] <= 0 && !silent) {
      addLog(`💊 <span class="feed-strong">${pill.name}</span> 已耗尽。`, 'treasure');
      showToast(`💊 ${pill.name} 已用完`, 'amber');
    }
  }

  // 血域魔体暴击加成
  const critChance = state.physiques.includes('ph_blood') ? 0.18 : 0.05;
  const isCrit = Math.random() < critChance;
  const critMult = isCrit ? 1.8 : 1.0;

  const qiGain = Math.max(1, Math.round(
    (world.qiBase + flat.qiAdd) * getQiMultiplier() * critMult * (0.92 + Math.random() * 0.16) * scale
  ));
  const stoneGain = Math.max(1, Math.round(
    (6 * world.stoneMult + flat.stoneAdd) * realm.stoneBonus * 0.35 * getStoneMultiplier() * critMult * (0.9 + Math.random() * 0.2) * scale
  ));

  const reqQi = getQiRequired();
  const wasReady = state.qi >= reqQi;
  // 允许最多溢出至 125% 上限，避免挂机溢出浪费但必须手动破境
  state.qi = Math.min(Math.floor(reqQi * 1.25), state.qi + qiGain);
  state.stones += stoneGain;
  state.totalTicks += Math.round(scale);

  if (!silent) {
    triggerMeditateAnim();
    cooldownRemaining = getCooldownSeconds();
    const critTag = isCrit ? ' <span class="feed-amber">[顿悟暴击!]</span>' : '';
    addLog(`${world.icon} 在<span class="feed-strong">${world.name}</span>吐纳周天${critTag}：<span class="feed-strong">+${fmt(qiGain)} 修为</span>，<span class="feed-amber">+${fmt(stoneGain)} 灵石</span>。`);
    if (!wasReady && state.qi >= reqQi) {
      showToast('⚡ 灵气已圆满！点击「突破境界」破关晋阶！', 'amber');
    }
  }

  // 机缘秘宝掉落
  const chestOdds = Math.min(0.45, world.chestRate * getJadeMultiplier());
  const chestsFound = scale === 1
    ? (Math.random() < chestOdds ? 1 : 0)
    : Math.floor(scale * chestOdds + (Math.random() < ((scale * chestOdds) % 1) ? 1 : 0));

  if (chestsFound > 0) {
    state.chests += chestsFound;
    if (!silent) {
      addLog(`🎁 游历奇遇！发现 <span class="feed-emerald">${chestsFound} 个机缘秘宝</span>！`, 'treasure');
    }
  }

  hudDirty = true;
}

// 手动突破境界（含真实成功率判定、仙玉护道、心魔反噬与保底感悟）
function attemptBreakthrough() {
  if (canAscendNow()) {
    attemptAscension();
    return;
  }
  if (!canBreakthrough()) {
    showToast('修为尚未圆满，请继续打坐吐纳。', 'amber');
    return;
  }

  const req = getQiRequired();
  const guardCost = getJadeGuardCost();
  let usedGuard = false;
  if (state.useJadeGuard) {
    if (state.jade >= guardCost) {
      state.jade -= guardCost;
      usedGuard = true;
    } else {
      showToast(`仙玉不足 ${fmt(guardCost)}，本次破境未触发护道！`, 'amber');
    }
  }

  // 先用含本次护道状态的成功率判定（由于刚扣除了仙玉，若 usedGuard 为 true 需补回护道加成）
  const rCur = getRealm();
  let chance = rCur.baseRate ?? 1.0;
  if (state.subIdx === 3 && !isAtMortalPeak()) {
    chance = state.realmIdx >= 9 ? chance * 0.65 : (state.realmIdx >= 1 ? Math.max(0.05, chance - 0.10) : chance);
  }
  chance += state.physiques.length * 0.03;
  if (state.physiques.includes('ph_dao')) chance += 0.04;
  if (state.physiques.includes('ph_chaos')) chance += 0.04;
  if (state.physiques.includes('ph_hongmeng')) chance += 0.05;
  if (usedGuard) chance += (state.realmIdx >= 9 ? 0.18 : 0.25);
  chance += (state.btPity || 0);
  chance = Math.max(0.01, Math.min(1.0, chance));

  // 破境失败判定（心魔反噬 / 仙劫重创）
  if (Math.random() >= chance) {
    const lossRatio = getBreakthroughFailLossRatio(usedGuard);
    const lostQi = Math.floor(req * lossRatio);
    const pityGain = getBreakthroughPityStep();
    state.qi = Math.max(0, state.qi - lostQi);
    state.btPity = Math.min(1.0, (state.btPity || 0) + pityGain);

    playBreakthroughSound('fail');
    showBreakthroughAnimation({
      type: 'fail',
      kicker: state.realmIdx >= 9 ? '九霄仙劫反噬 · 破境受阻' : '心魔扰动 · 冲击瓶颈失败',
      icon: '🌩️',
      title: '破境失败 · 灵气溃散',
      subtitle: usedGuard
        ? '幸得仙玉护道抵消半数反噬！虽未破关，但道心愈发凝练。'
        : '境界壁垒坚如磐石，强行冲关遭致反噬，建议积攒仙玉开启「护道」或觉醒圣体！',
      rewards: [
        `修为损耗 -${Math.round(lossRatio * 100)}% (-${fmt(lostQi)})`,
        `道心感悟 +${Math.round(pityGain * 100)}% 成功率`,
        `当前保底：+${Math.round(state.btPity * 100)}%`
      ]
    });

    addLog(
      `🌩️ <span class="feed-strong">冲击「${getNextRealmLabel()}」失败</span>（成功率 ${(chance * 100).toFixed(1)}%）：灵气溃散 <span class="feed-amber">-${fmt(lostQi)}</span>，道心愈坚，下次破境成功率 <span class="feed-emerald">+${Math.round(pityGain * 100)}%</span>！`,
      'break'
    );

    saveGame(false);
    hudDirty = true;
    flushHUD();
    renderActiveTab();
    return;
  }

  // 破境成功！清空当前瓶颈保底
  state.qi = Math.max(0, state.qi - req);
  state.btPity = 0;

  let isMajor = false;
  let unlockedArtName = null;

  if (state.subIdx < 3) {
    state.subIdx++;
  } else {
    state.realmIdx++;
    state.subIdx = 0;
    isMajor = true;
    if (state.realmIdx > state.maxRealmEver) {
      state.maxRealmEver = state.realmIdx;
    }
    unlockedArtName = REALMS[state.realmIdx].art.name;
  }

  const r = getRealm();
  const fullRealmName = `${r.name} · ${SUB_REALMS[state.subIdx]}`;
  const jadeReward = Math.max(1, Math.round((isMajor ? (4 + state.realmIdx * 2) : (1 + Math.floor(state.realmIdx * 0.6))) * getJadeMultiplier()));
  const stoneBonus = Math.round(req * 0.45 * getStoneMultiplier());

  state.jade += jadeReward;
  state.stones += stoneBonus;

  const rewards = [
    `+${fmt(jadeReward)} 💎 仙玉`,
    `+${fmt(stoneBonus)} 🪙 灵石`,
    `寿元：${r.lifespan}`
  ];
  if (unlockedArtName) rewards.push(`领悟新功法：《${unlockedArtName}》`);

  playBreakthroughSound(isMajor ? 'major' : 'minor');
  showBreakthroughAnimation({
    type: isMajor ? 'major' : 'minor',
    kicker: isMajor ? '紫气东来 · 大道破境' : '气海圆满 · 境界精进',
    icon: isMajor ? '🌟' : '⚡',
    title: fullRealmName,
    subtitle: r.desc,
    rewards
  });

  addLog(
    `${isMajor ? '🌟 <span class="feed-fuchsia">大境界突破！</span>' : '⚡ <span class="feed-amber">破境成功！</span>'}踏入 <span class="feed-strong">${fullRealmName}</span>，获 <span class="feed-emerald">+${fmt(jadeReward)} 仙玉</span>${unlockedArtName ? `，领悟 <span class="feed-amber">《${unlockedArtName}》</span>` : ''}！`,
    isMajor ? 'major' : 'break'
  );

  saveGame(false);
  hudDirty = true;
  flushHUD();
  renderActiveTab();
}

// 渡劫飞升仙界
function attemptAscension() {
  if (!canAscendNow()) {
    showToast('需达到「渡劫期 · 大圆满」且修为圆满方可渡劫飞升！', 'amber');
    return;
  }
  const req = getQiRequired();
  state.qi = Math.max(0, state.qi - req);
  state.ascended = true;
  state.btPity = 0;
  state.realmIdx = 9; // 人仙
  state.subIdx = 0;
  if (state.realmIdx > state.maxRealmEver) state.maxRealmEver = state.realmIdx;
  state.worldId = 'w_penglai';

  const jadeReward = Math.round(35 * getJadeMultiplier());
  state.jade += jadeReward;

  playBreakthroughSound('ascend');
  showBreakthroughAnimation({
    type: 'ascend',
    kicker: '九重天劫已过 · 天门大开',
    icon: '⛩️',
    title: '白日飞升 · 步入人仙',
    subtitle: '褪去凡胎，初凝仙元！解锁仙界六大圣域，永久获得 +50% 仙灵修为与 +60% 灵石转化！',
    rewards: [`+${fmt(jadeReward)} 💎 仙玉`, '解锁仙界十二重天', '解锁蓬莱仙域', '领悟《长生人仙诀》']
  });

  addLog(`⛩️ <span class="feed-fuchsia">白日飞升仙界！</span>渡过九重天劫，踏入 <span class="feed-strong">人仙 · 初期</span>，降临蓬莱仙域！`, 'major');
  saveGame(false);
  hudDirty = true;
  flushHUD();
  renderActiveTab();
}

// 重生轮回（Prestige）
function doReincarnate() {
  if (state.realmIdx < 4) {
    showToast('需达到「化神期」方可开启轮回转世！', 'amber');
    return;
  }
  const gain = getKarmaOnReincarnate();
  if (!confirm(`确定兵解转世，开启第 ${state.prestige + 1} 世轮回，获取 +${fmt(gain)} 轮回道果？\n\n【重置】：境界、修为、灵石、丹药、秘宝、法宝、21门境界功法、当前界域。\n【永久保留】：轮回世数、轮回道果、仙玉、轮回神通、逆天体质与体质专属神诀。\n【轮回加成】：每世永久 +20% 修为与 +25% 灵石（线性平衡），首次轮回解锁「逆天体质」！`)) {
    return;
  }

  state.prestige++;
  state.karma += gain;
  state.ascended = false;
  state.btPity = 0;
  state.realmIdx = 0;
  state.subIdx = 0;
  state.qi = 0;
  state.stones = 0;
  state.worldId = 'w_cangwu';
  state.artifactId = 'art_0';
  state.ownedArtifacts = ['art_0'];
  state.activePill = null;
  state.pills = { p_qi: 5, p_zhuji: 0, p_jindan: 0, p_yuanying: 0, p_xian: 0, p_hong: 0 };
  state.chests = 0;
  REALMS.forEach(r => { state.arts[r.art.id] = 0; });

  playBreakthroughSound('ascend');
  showBreakthroughAnimation({
    type: 'ascend',
    kicker: '轮回转世 · 再入仙途',
    icon: '🔄',
    title: `第 ${state.prestige} 世轮回开启`,
    subtitle: state.prestige === 1 ? '已开启「🧬 逆天体质」洗髓池！消耗轮回道果与仙玉即可觉醒至高圣体！' : '携宿慧重修大道，此世必将更进一步！',
    rewards: [`+${fmt(gain)} 🍑 轮回道果`, `永久 +${state.prestige * 20}% 修为`, `永久 +${state.prestige * 25}% 灵石`]
  });

  addLog(`🔄 <span class="feed-fuchsia">开启第 ${state.prestige} 世轮回！</span>获得 <span class="feed-amber">+${fmt(gain)} 轮回道果</span>！`, 'major');
  saveGame(false);
  hudDirty = true;
  flushHUD();
  renderActiveTab();
}

// 开启机缘秘宝
function openChests(count = 1) {
  const toOpen = Math.min(state.chests, count);
  if (toOpen <= 0) {
    showToast('当前没有待开启的机缘秘宝。', 'amber');
    return;
  }
  state.chests -= toOpen;
  const world = getWorld();
  const realm = getRealm();
  let totalStones = 0;
  let totalJade = 0;
  for (let i = 0; i < toOpen; i++) {
    totalStones += Math.round(90 * world.stoneMult * realm.stoneBonus * 0.5 * getStoneMultiplier() * (0.8 + Math.random() * 0.5));
    totalJade += Math.max(1, Math.round((1 + Math.floor(state.realmIdx * 0.45) + Math.random() * 2) * getJadeMultiplier()));
  }
  state.stones += totalStones;
  state.jade += totalJade;
  addLog(`🎁 开启 <span class="feed-strong">${toOpen} 个机缘秘宝</span> → <span class="feed-amber">+${fmt(totalStones)} 灵石</span>，<span class="feed-emerald">+${fmt(totalJade)} 仙玉</span>！`, 'treasure');
  showToast(`🎁 +${fmt(totalStones)} 灵石，+${fmt(totalJade)} 仙玉`, 'emerald');
  hudDirty = true;
  flushHUD();
  renderActiveTab();
}
