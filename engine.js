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


// 9 大逆天体质专属觉醒音效（最后三大圣体自带史诗级交响和弦）
function playPhysiqueSound(phId) {
  if (!state.sfxEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const presets = {
      ph_heart:    { wave: 'sine',     step: 0.07, dur: 0.8,  notes: [523.25, 659.25, 783.99, 1046.5, 1318.5] },
      ph_blood:    { wave: 'sawtooth', step: 0.08, dur: 0.9,  notes: [146.83, 174.61, 220.0, 293.66, 220.0, 349.23] },
      ph_bone:     { wave: 'triangle', step: 0.08, dur: 1.0,  notes: [261.63, 392.0, 523.25, 659.25, 783.99] },
      ph_eye:      { wave: 'sine',     step: 0.07, dur: 1.0,  notes: [329.63, 493.88, 659.25, 987.77, 1318.5] },
      ph_dao:      { wave: 'triangle', step: 0.09, dur: 1.1,  notes: [220.0, 329.63, 440.0, 554.37, 659.25, 880.0] },
      ph_ancient:  { wave: 'sawtooth', step: 0.08, dur: 1.1,  notes: [130.81, 196.0, 261.63, 329.63, 392.0, 523.25] },
      ph_eternal:  { wave: 'triangle', step: 0.07, dur: 1.5,  notes: [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.5] },
      ph_chaos:    { wave: 'sawtooth', step: 0.08, dur: 1.6,  notes: [110.0, 164.81, 220.0, 261.63, 329.63, 440.0, 659.25, 880.0] },
      ph_hongmeng: { wave: 'triangle', step: 0.07, dur: 1.9,  notes: [130.81, 196.0, 261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1567.98] }
    };
    const cfg = presets[phId] || presets.ph_eternal;

    cfg.notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = cfg.wave;
      osc.frequency.setValueAtTime(freq, now + i * cfg.step);
      gain.gain.setValueAtTime(0.001, now + i * cfg.step);
      const peak = cfg.wave === 'sawtooth' ? 0.065 : 0.11;
      gain.gain.exponentialRampToValueAtTime(peak, now + i * cfg.step + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * cfg.step + cfg.dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * cfg.step);
      osc.stop(now + i * cfg.step + cfg.dur + 0.05);
    });
  } catch (_) {}
}


// 宝物与先天至宝掉落判定（支持单次吐纳、离线批量与开秘宝加成）
function rollRelicDrops(trials = 1, silent = false, rateBoost = 1) {
  const n = Math.max(1, trials);
  const droppedSupreme = [];

  // 1. 最高境界 · 三大先天至宝（全境界全界域皆有极低概率掉落，仅需获取一次）
  const unownedSupreme = RELICS.filter(r => r.unique && !(state.relics[r.id] > 0));
  if (unownedSupreme.length > 0) {
    const pSup = Math.min(0.05, getRelicTierLiveRate('supreme') * rateBoost);
    for (const sup of unownedSupreme) {
      const chance = n === 1 ? pSup : (1 - Math.pow(1 - pSup, n));
      if (Math.random() < chance) {
        state.relics[sup.id] = 1;
        state.totalRelicsFound = (state.totalRelicsFound || 0) + 1;
        droppedSupreme.push(sup);
      }
    }
  }

  for (const sup of droppedSupreme) {
    addLog(`🌌 <span class="feed-fuchsia">【鸿蒙异象 · 逆天机缘！】</span>竟寻得唯一先天至宝 <span class="feed-amber">${sup.icon}「${sup.name}」</span>！`, 'major');
    playPhysiqueSound('ph_hongmeng');
    showBreakthroughAnimation({
      type: 'ascend',
      kicker: '鸿蒙降世 · 万古难遇 · 先天至宝',
      icon: sup.icon,
      title: `寻得先天至宝「${sup.name}」`,
      subtitle: sup.desc,
      rewards: ['唯一至宝 · 随大境界自动变强', '轮回永久保留', '诸天顶级气运']
    });
  }

  // 2. 五品常规宝物（法器 -> 仙器/神器），重复获得自动升级
  const normalTiers = ['xianqi', 'lingbao', 'fabao', 'lingqi', 'faqi'];
  let foundAny = droppedSupreme.length > 0;

  for (const tid of normalTiers) {
    const p = Math.min(0.45, getRelicTierLiveRate(tid) * rateBoost);
    if (p <= 0) continue;
    let hits = 0;
    if (n === 1) {
      if (Math.random() < p) hits = 1;
    } else {
      const expected = n * p;
      hits = Math.floor(expected) + (Math.random() < (expected % 1) ? 1 : 0);
    }
    if (hits <= 0) continue;

    const pool = RELICS.filter(r => r.tier === tid);
    const tierObj = RELIC_TIERS.find(t => t.id === tid);
    for (let i = 0; i < hits; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      state.relics[pick.id] = (state.relics[pick.id] || 0) + 1;
      state.totalRelicsFound = (state.totalRelicsFound || 0) + 1;
      foundAny = true;
      if (!silent) {
        const lv = state.relics[pick.id];
        const isHigh = tid === 'xianqi' || tid === 'lingbao';
        const tag = lv === 1 ? '新获得' : `重复强化 → Lv.${lv}`;
        addLog(`🏺 寻宝奇遇！获得【<span class="${isHigh ? 'feed-fuchsia' : 'feed-amber'}">${tierObj.name}</span>】<span class="feed-strong">${pick.icon} ${pick.name}</span>（${tag}）！`, isHigh ? 'major' : 'treasure');
        if (isHigh) {
          showToast(`🏺 鸿运当头！获得${tierObj.name}「${pick.name}」(${tag})`, 'fuchsia');
        } else if (lv === 1) {
          showToast(`🏺 获得${tierObj.name}「${pick.name}」`, 'amber');
        }
      }
    }
    // 单次吐纳最多掉落 1 件常规宝物（优先高品阶）
    if (n === 1 && hits > 0) break;
  }

  if (foundAny && activeTab === 'relics' && !silent) {
    renderActiveTab();
  }
}


// 上古灵宠随机结缘判定（与至宝相同：吐纳与开秘宝触发，重复结缘自动升级！）

// 仅出战灵宠随吐纳获得经验并自动升级（最高 100 级）
function grantPetExp(petId, amount, silent = false) {
  if (!petId || amount <= 0) return;
  const lv = state.pets[petId] || 0;
  if (lv <= 0 || lv >= PET_MAX_LEVEL) return;

  const pet = SPIRIT_PETS.find(x => x.id === petId);
  if (!pet) return;

  state.petExp[petId] = (state.petExp[petId] || 0) + amount;
  let leveledUp = 0;
  while (state.pets[petId] < PET_MAX_LEVEL) {
    const req = getPetExpRequired(petId, state.pets[petId]);
    if (req <= 0 || state.petExp[petId] < req) break;
    state.petExp[petId] -= req;
    state.pets[petId]++;
    leveledUp++;
  }
  if (state.pets[petId] >= PET_MAX_LEVEL) {
    state.pets[petId] = PET_MAX_LEVEL;
    state.petExp[petId] = 0;
  }

  if (leveledUp > 0 && !silent) {
    const newLv = state.pets[petId];
    const isMax = newLv >= PET_MAX_LEVEL;
    addLog(
      `🐉 <span class="${isMax ? 'feed-fuchsia' : 'feed-emerald'}">灵宠进阶！</span>出战神兽 <span class="feed-strong">${pet.icon} ${pet.name}</span> 升至 <span class="feed-amber">Lv.${newLv}${isMax ? '（满级大圆满！）' : ''}</span>！`,
      isMax ? 'major' : 'treasure'
    );
    if (isMax) {
      showToast(`🐉「${pet.name}」已臻至 Lv.100 满级大圆满！`, 'fuchsia');
    } else {
      showToast(`🐉「${pet.name}」升级至 Lv.${newLv}！`, 'emerald');
    }
    if (activeTab === 'pets') renderActiveTab();
  }
}

function rollPetDrops(trials = 1, silent = false, rateBoost = 1) {
  const n = Math.max(1, trials);
  const tierOrder = ['honghuang', 'ruishou', 'sixiang', 'lingshou'];
  let foundAny = false;

  for (const tid of tierOrder) {
    const p = Math.min(0.45, getPetTierLiveRate(tid) * rateBoost);
    if (p <= 0) continue;
    let hits = 0;
    if (n === 1) {
      if (Math.random() < p) hits = 1;
    } else {
      const expected = n * p;
      hits = Math.floor(expected) + (Math.random() < (expected % 1) ? 1 : 0);
    }
    if (hits <= 0) continue;

    const pool = SPIRIT_PETS.filter(pet => pet.tierId === tid);
    const tierObj = PET_TIERS.find(t => t.id === tid);
    for (let i = 0; i < hits; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const prevLv = state.pets[pick.id] || 0;
      state.totalPetsFound = (state.totalPetsFound || 0) + 1;
      foundAny = true;

      if (prevLv === 0) {
        state.pets[pick.id] = 1;
        state.petExp[pick.id] = 0;
        if (!state.activePet) state.activePet = pick.id;
        if (!silent) {
          const isRare = tid === 'honghuang' || tid === 'ruishou';
          addLog(`🐉 灵兽奇遇！初次结缘【<span class="${isRare ? 'feed-fuchsia' : 'feed-emerald'}">${tierObj.name}</span>】<span class="feed-strong">${pick.icon} ${pick.name}</span>（Lv.1 认主，派遣出战即可随吐纳升级）！`, isRare ? 'major' : 'treasure');
          if (tid === 'honghuang') {
            playPhysiqueSound('ph_chaos');
            showBreakthroughAnimation({
              type: 'ascend',
              kicker: '太古异象 · 万兽朝拜 · 神兽认主',
              icon: pick.icon,
              title: `结缘「${pick.name}」`,
              subtitle: pick.desc,
              rewards: [tierObj.name, '出战随吐纳升级(上限100级)', '出战享双倍(2x)加持']
            });
          } else {
            showToast(`🐉 初次结缘${tierObj.name}「${pick.name}」！`, isRare ? 'fuchsia' : 'emerald');
          }
        }
      } else if (prevLv < PET_MAX_LEVEL) {
        // 重复结缘：转化为该灵宠当前等级 5% 经验（需出战吐纳为主力升级方式）
        const bonusExp = Math.max(25, Math.floor(getPetExpRequired(pick.id, prevLv) * 0.05));
        grantPetExp(pick.id, bonusExp, silent);
        if (!silent) {
          addLog(`🐉 灵兽重逢！再次遇见 <span class="feed-strong">${pick.icon} ${pick.name}</span>，转化为 <span class="feed-emerald">+${fmt(bonusExp)} 灵宠经验</span>！`, 'treasure');
        }
      } else {
        // 已满级 100 级：重复结缘化为仙玉馈赠
        const jadeGift = Math.max(1, Math.round((tierObj.maxJadeReward || 10) * getJadeMultiplier()));
        state.jade += jadeGift;
        if (!silent) {
          addLog(`🐉 满级灵兽馈赠！<span class="feed-strong">${pick.icon} ${pick.name}</span> 献上 <span class="feed-emerald">+${fmt(jadeGift)} 仙玉</span>！`, 'treasure');
        }
      }
    }
    if (n === 1 && hits > 0) break;
  }

  if (foundAny && activeTab === 'pets' && !silent) {
    renderActiveTab();
  }
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

  // 逆天体质（血域魔体/混沌神体/鸿蒙至尊体）、灵宠与宝物暴击加成
  const hasBlood = state.physiques.includes('ph_blood');
  const phB = getPhysiqueBonuses();
  const petB = getPetBonuses();
  const relB = getRelicBonuses();
  const critChance = Math.min(0.92, (hasBlood ? 0.22 : 0.05) + phB.critAdd + petB.crit + relB.critAdd);
  const isCrit = Math.random() < critChance;
  const critMult = isCrit ? ((hasBlood ? 2.1 : 1.8) + phB.critMultAdd + relB.critMultAdd) : 1.0;

  // 🔥 燃石修炼超载判定：燃烧海量灵石换取 2.5x 修为与 1.6x 出战灵宠经验
  let burnedThisTick = false;
  let burnSpent = 0;
  if (state.burnStones) {
    const burnCost = Math.round(getBurnStoneCost() * scale);
    if (state.stones >= burnCost) {
      state.stones -= burnCost;
      burnedThisTick = true;
      burnSpent = burnCost;
    } else if (!silent) {
      state.burnStones = false;
      showToast('🔥 灵石不足，已自动关闭「燃石修炼」', 'amber');
    }
  }
  const burnQiMult = burnedThisTick ? 2.5 : 1.0;

  const qiGain = Math.max(1, Math.round(
    (world.qiBase + flat.qiAdd) * getQiMultiplier() * critMult * burnQiMult * (0.92 + Math.random() * 0.16) * scale
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
    if (typeof spawnCultivatePopup === 'function') spawnCultivatePopup(qiGain, stoneGain, isCrit);
    cooldownRemaining = getCooldownSeconds();
    const critTag = isCrit ? ' <span class="feed-amber">[顿悟暴击!]</span>' : '';
    const burnTag = burnedThisTick ? ` <span class="feed-fuchsia">[燃石 -${fmt(burnSpent)}]</span>` : '';
    addLog(`${world.icon} 在<span class="feed-strong">${world.name}</span>吐纳周天${critTag}${burnTag}：<span class="feed-strong">+${fmt(qiGain)} 修为</span>，<span class="feed-amber">+${fmt(stoneGain)} 灵石</span>。`);
    if (!wasReady && state.qi >= reqQi && !state.autoBreakthrough) {
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

  // 出战灵宠随吐纳获取经验（仅当前出战灵宠可获得经验，最高 100 级）
  if (state.activePet && (state.pets[state.activePet] || 0) > 0 && state.pets[state.activePet] < PET_MAX_LEVEL) {
    const veinPetMult = 1 + getVeinBonuses().petExp;
    const burnPetMult = burnedThisTick ? 1.6 : 1.0;
    const petExpGain = Math.max(1, Math.round(
      (5 + state.realmIdx * 1.5) * (isCrit ? 1.35 : 1.0) * (pill ? 1.15 : 1.0) * (state.ascended ? 1.2 : 1.0) * veinPetMult * burnPetMult * (relB.petExpMult || 1) * (phB.petExpMult || 1) * scale
    ));
    grantPetExp(state.activePet, petExpGain, silent);
  }

  // 宝物与三大先天至宝寻宝判定 + 上古灵宠结缘判定
  rollRelicDrops(scale, silent, 1);
  rollPetDrops(scale, silent, 1);

  // ⚡ 自动突破（涵盖小境界、大境界与渡劫飞升，支持前台与后台/离线闭关）
  if (state.autoBreakthrough && (canBreakthrough() || canAscendNow())) {
    let safety = 0;
    while (state.autoBreakthrough && safety < 24 && (canBreakthrough() || canAscendNow())) {
      safety++;
      if (canAscendNow()) {
        attemptAscension(true, silent);
      } else {
        const ok = attemptBreakthrough(true, silent);
        if (!ok) break;
      }
    }
  }

  hudDirty = true;
}

// 突破境界（支持手动点击与自动突破大/小境界；含真实成功率判定、仙玉护道、心魔反噬与保底感悟）
function attemptBreakthrough(isAuto = false, silent = false) {
  if (canAscendNow()) {
    return attemptAscension(isAuto, silent);
  }
  if (!canBreakthrough()) {
    if (!isAuto && !silent) showToast('修为尚未圆满，请继续打坐吐纳。', 'amber');
    return false;
  }

  const req = getQiRequired();
  // 破境成功率（仅由境界基础率 + 逆天体质决定）
  const chance = getBreakthroughChance();

  // 破境失败判定（心魔反噬 / 仙劫重创，无保底叠加）
  if (Math.random() >= chance) {
    const lossRatio = getBreakthroughFailLossRatio(false);
    const lostQi = Math.floor(req * lossRatio);
    state.qi = Math.max(0, state.qi - lostQi);

    if (!silent) {
      if (!isAuto) {
        playBreakthroughSound('fail');
        showBreakthroughAnimation({
          type: 'fail',
          kicker: state.realmIdx >= 9 ? '九霄仙劫反噬 · 破境受阻' : '心魔扰动 · 冲击瓶颈失败',
          icon: '🌩️',
          title: '破境失败 · 灵气溃散',
          subtitle: '大道无情，境界壁垒坚如磐石！唯有觉醒「🧬 逆天体质」（尤其是终极三圣体）方可提升破境成功率！',
          rewards: [
            `修为损耗 -${Math.round(lossRatio * 100)}% (-${fmt(lostQi)})`,
            `当前破境成功率：${(chance * 100).toFixed(1)}%`
          ]
        });
      } else {
        showToast(`🌩️ 自动冲关失败（成功率 ${(chance * 100).toFixed(1)}%），灵气溃散 -${fmt(lostQi)}`, 'rose');
      }

      addLog(
        `🌩️ <span class="feed-strong">${isAuto ? '[自动] ' : ''}冲击「${getNextRealmLabel()}」失败</span>（成功率 ${(chance * 100).toFixed(1)}%）：灵气溃散 <span class="feed-amber">-${fmt(lostQi)}</span>！`,
        'break'
      );

      saveGame(false);
      hudDirty = true;
      flushHUD();
      renderActiveTab();
    } else {
      hudDirty = true;
    }
    return false;
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
    const _newR = getRealmByIdx(state.realmIdx);
    unlockedArtName = _newR.art ? _newR.art.name : null;
  }

  const r = getRealm();
  const fullRealmName = `${r.name} · ${SUB_REALMS[state.subIdx]}`;
  const jadeReward = Math.max(1, Math.round((isMajor ? (4 + state.realmIdx * 2) : (1 + Math.floor(state.realmIdx * 0.6))) * getJadeMultiplier()));
  const stoneBonus = Math.round(req * 0.12 * Math.sqrt(getStoneMultiplier()));

  state.jade += jadeReward;
  state.stones += stoneBonus;

  if (!silent) {
    const rewards = [
      `+${fmt(jadeReward)} 💎 仙玉`,
      `+${fmt(stoneBonus)} 🪙 灵石`,
      `寿元：${r.lifespan}`
    ];
    if (unlockedArtName) rewards.push(`领悟新功法：《${unlockedArtName}》`);
    if (isMajor && r.isEndless) {
      rewards.push(`♾️ 无尽升阶 · 第 ${r.ascStep} 阶`);
      rewards.push('先天至宝 & 逆天圣体自动共鸣暴涨！');
    }

    // 手动破境全部播动画；自动破境仅在【突破大境界】时播放震撼全屏动画，小境界用提示避免频繁遮挡
    if (!isAuto || isMajor) {
      playBreakthroughSound(isMajor ? 'major' : 'minor');
      showBreakthroughAnimation({
        type: isMajor ? 'major' : 'minor',
        kicker: (isMajor && r.isEndless) ? `♾️ 打破极限 · 无尽升阶第 ${r.ascStep} 阶` : (isMajor ? '紫气东来 · 法相蜕变 · 大道破境' : '气海圆满 · 境界精进'),
        icon: isMajor ? '🌟' : '⚡',
        customSvg: typeof getCultivatorAvatarSVG === 'function' ? getCultivatorAvatarSVG(state.realmIdx, 102, state.subIdx) : null,
        title: fullRealmName,
        subtitle: r.desc,
        rewards
      });
    } else {
      showToast(`⚡ 自动破境成功：${fullRealmName} (+${fmt(jadeReward)}💎)`, 'amber');
    }

    addLog(
      `${isMajor ? '🌟 <span class="feed-fuchsia">' + (isAuto ? '[自动] ' : '') + '大境界突破！</span>' : '⚡ <span class="feed-amber">' + (isAuto ? '[自动] ' : '') + '破境成功！</span>'}踏入 <span class="feed-strong">${fullRealmName}</span>，获 <span class="feed-emerald">+${fmt(jadeReward)} 仙玉</span>${unlockedArtName ? `，领悟 <span class="feed-amber">《${unlockedArtName}》</span>` : ''}！`,
      isMajor ? 'major' : 'break'
    );

    saveGame(false);
    hudDirty = true;
    flushHUD();
    renderActiveTab();
  } else {
    hudDirty = true;
  }
  return true;
}

// 渡劫飞升仙界（同样支持自动突破触发）
function attemptAscension(isAuto = false, silent = false) {
  if (!canAscendNow()) {
    if (!isAuto && !silent) showToast('需达到「渡劫期 · 大圆满」且修为圆满方可渡劫飞升！', 'amber');
    return false;
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

  if (!silent) {
    playBreakthroughSound('ascend');
    showBreakthroughAnimation({
      type: 'ascend',
      kicker: '九重天劫已过 · 褪凡成仙',
      icon: '⛩️',
      customSvg: typeof getCultivatorAvatarSVG === 'function' ? getCultivatorAvatarSVG(9, 108, 0) : null,
      title: '白日飞升 · 步入人仙',
      subtitle: '褪去凡胎，初凝仙元！解锁仙界六大圣域，永久获得 +50% 仙灵修为与 +60% 灵石转化！',
      rewards: [`+${fmt(jadeReward)} 💎 仙玉`, '解锁仙界十二重天', '解锁蓬莱仙域', '领悟《长生人仙诀》']
    });

    addLog(`⛩️ <span class="feed-fuchsia">${isAuto ? '[自动] ' : ''}白日飞升仙界！</span>渡过九重天劫，踏入 <span class="feed-strong">人仙 · 初期</span>，降临蓬莱仙域！`, 'major');
    saveGame(false);
    hudDirty = true;
    flushHUD();
    renderActiveTab();
  } else {
    hudDirty = true;
  }
  return true;
}

// 重生轮回（Prestige）
function doReincarnate() {
  if (state.realmIdx < 4) {
    showToast('需达到「化神期」方可开启轮回转世！', 'amber');
    return;
  }
  const gain = getKarmaOnReincarnate();
  if (!confirm(`确定兵解转世，开启第 ${state.prestige + 1} 世轮回，获取 +${fmt(gain)} 轮回道果？\n\n【重置】：境界、修为、灵石、丹药、秘宝、法宝、21门境界功法、当前界域。\n【永久保留】：轮回世数、轮回道果、仙玉、轮回神通、逆天体质、上古灵宠、全部宝物与三大先天至宝。\n【轮回加成】：每世永久 +20% 修为与 +25% 灵石（线性平衡），首次轮回解锁「逆天体质」！`)) {
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
  state.pills = Object.fromEntries(PILLS.map(x => [x.id, x.id === 'p_qi' ? 5 : 0]));
  state.veins = { v_qi: 0, v_pet: 0, v_luck: 0, v_stone: 0 };
  state.burnStones = false;
  state.chests = 0;
  REALMS.forEach(r => { state.arts[r.art.id] = 0; });
  LUCK_UPGRADES.forEach(u => { if (u.resetOnPrestige) state.luckUpgrades[u.id] = 0; });
  PET_LUCK_UPGRADES.forEach(u => { if (u.resetOnPrestige) state.petLuckUpgrades[u.id] = 0; });

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
  rollRelicDrops(toOpen, false, 3);
  rollPetDrops(toOpen, false, 3);
  hudDirty = true;
  flushHUD();
  renderActiveTab();
}
