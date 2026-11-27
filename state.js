/* ============================================================================
   状态管理、NaN 防护清洗 & 平衡数值公式（4x 血脉排斥 + 线性轮回）
   ============================================================================ */
function defaultState() {
  const arts = {};
  REALMS.forEach(r => { arts[r.art.id] = 0; });
  const pArts = {};
  PHYSIQUES.forEach(p => { pArts[p.art.id] = 0; });
  const pets = {};
  const petExp = {};
  SPIRIT_PETS.forEach(p => { pets[p.id] = 0; petExp[p.id] = 0; });
  const relics = {};
  RELICS.forEach(r => { relics[r.id] = 0; });
  return {
    displayName: '青云散修',
    stones: 0,
    jade: 0,
    karma: 0,
    prestige: 0,
    ascended: false,
    realmIdx: 0,        // 0..20
    subIdx: 0,          // 0..3 (初期/中期/后期/大圆满)
    maxRealmEver: 0,    // 历史最高境界索引（用于混沌迷雾解锁记忆）
    qi: 0,
    totalTicks: 0,
    worldId: 'w_cangwu',
    artifactId: 'art_0',
    ownedArtifacts: ['art_0'],
    activePill: null,
    pills: { p_qi: 5 },
    chests: 1,
    arts,
    physiques: [],      // 已觉醒逆天体质 ID 列表
    physiqueArts: pArts,
    pets,               // 上古灵宠等级 (0 = 未结缘, 最高 100 级)
    petExp,             // 上古灵宠当前等级经验
    activePet: null,    // 当前出战灵宠 ID (效果翻倍)
    relics,             // 宝物等级 (重复获得自动升级；先天至宝最高1级)
    luckUpgrades: { lu_compass: 0, lu_eye: 0, lu_array: 0 },
    petLuckUpgrades: { plu_incense: 0, plu_bell: 0, plu_altar: 0 },
    veins: { v_qi: 0, v_pet: 0, v_luck: 0, v_bt: 0 },
    burnStones: false,
    totalRelicsFound: 0,
    totalPetsFound: 0,
    karmaPerks: { k_qi: 0, k_stone: 0, k_speed: 0, k_jade: 0, k_luck: 0 },
    btPity: 0,          // 当前瓶颈破境感悟保底（失败累积，成功后清零）
    useJadeGuard: false,// 是否启用仙玉护道
    autoMeditate: false,
    hideMaxedArts: false,
    sfxEnabled: true,
    lastActiveAt: Date.now()
  };
}

let state = defaultState();
let activeTab = 'arts';
let buyMode = '1'; // '1' | '10' | 'max'
let cooldownRemaining = 0;
let hudDirty = true;
let hudFlushAccum = 0;
let lastCdReady = null;
let spriteTimeout = null;

function safeNum(v, fallback = 0, min = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, n);
}

function sanitizeMap(obj, defaults) {
  const out = {};
  for (const k of Object.keys(defaults)) {
    out[k] = safeNum(obj && obj[k], defaults[k], 0);
  }
  return out;
}

function mergeState(parsed) {
  const def = defaultState();
  const p = parsed && typeof parsed === 'object' ? parsed : {};
  state = {
    ...def,
    ...p,
    stones: safeNum(p.stones, 0, 0),
    jade: safeNum(p.jade, 0, 0),
    karma: safeNum(p.karma, 0, 0),
    prestige: Math.floor(safeNum(p.prestige, 0, 0)),
    ascended: Boolean(p.ascended),
    realmIdx: Math.min(REALMS.length - 1, Math.floor(safeNum(p.realmIdx, 0, 0))),
    subIdx: Math.min(3, Math.floor(safeNum(p.subIdx, 0, 0))),
    maxRealmEver: Math.min(REALMS.length - 1, Math.floor(safeNum(p.maxRealmEver, safeNum(p.realmIdx, 0, 0), 0))),
    qi: safeNum(p.qi, 0, 0),
    totalTicks: Math.floor(safeNum(p.totalTicks, 0, 0)),
    chests: Math.floor(safeNum(p.chests, 0, 0)),
    ownedArtifacts: Array.isArray(p.ownedArtifacts) && p.ownedArtifacts.length ? p.ownedArtifacts : ['art_0'],
    physiques: Array.isArray(p.physiques) ? p.physiques.filter(id => PHYSIQUES.some(x => x.id === id)) : [],
    arts: sanitizeMap(p.arts, def.arts),
    physiqueArts: sanitizeMap(p.physiqueArts, def.physiqueArts),
    pets: sanitizeMap(p.pets, def.pets),
    petExp: sanitizeMap(p.petExp, def.petExp),
    activePet: (p.activePet && SPIRIT_PETS.some(x => x.id === p.activePet)) ? p.activePet : null,
    relics: sanitizeMap(p.relics, def.relics),
    luckUpgrades: sanitizeMap(p.luckUpgrades, def.luckUpgrades),
    petLuckUpgrades: sanitizeMap(p.petLuckUpgrades, def.petLuckUpgrades),
    veins: sanitizeMap(p.veins, def.veins),
    burnStones: Boolean(p.burnStones),
    totalRelicsFound: Math.floor(safeNum(p.totalRelicsFound, 0, 0)),
    totalPetsFound: Math.floor(safeNum(p.totalPetsFound, 0, 0)),
    karmaPerks: sanitizeMap(p.karmaPerks, def.karmaPerks),
    btPity: safeNum(p.btPity, 0, 0),
    useJadeGuard: Boolean(p.useJadeGuard),
    pills: sanitizeMap(p.pills, Object.fromEntries(PILLS.map(x => [x.id, x.id === 'p_qi' ? 5 : 0]))),
    lastActiveAt: safeNum(p.lastActiveAt, Date.now(), 0)
  };
  if (state.realmIdx > state.maxRealmEver) state.maxRealmEver = state.realmIdx;
  SPIRIT_PETS.forEach(pet => {
    state.pets[pet.id] = Math.min(PET_MAX_LEVEL, Math.floor(safeNum(state.pets[pet.id], 0, 0)));
    if (state.pets[pet.id] >= PET_MAX_LEVEL) state.petExp[pet.id] = 0;
  });
}

function saveGame(notify = false) {
  state.lastActiveAt = Date.now();
  try {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(state));
    if (notify) showToast('💾 修行玉简已保存至本地！', 'emerald');
  } catch (_) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    if (raw) mergeState(JSON.parse(raw));
  } catch (_) {}
}

function fmt(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  if (!Number.isFinite(n)) return '∞';
  if (n < 10000) return Math.floor(n).toLocaleString();
  const units = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒沙', '阿僧', '那由', '不可', '无量', '大数'];
  let val = n;
  let idx = -1;
  while (val >= 10000 && idx < units.length - 1) {
    val /= 10000;
    idx++;
  }
  if (val >= 10000) return n.toExponential(2);
  return val.toFixed(val >= 100 ? 1 : 2) + units[idx];
}

function getRealm() { return REALMS[state.realmIdx] || REALMS[0]; }
function getWorld() { return WORLDS.find(w => w.id === state.worldId) || WORLDS[0]; }
function getArtifact() { return ARTIFACTS.find(a => a.id === state.artifactId) || ARTIFACTS[0]; }
function getActivePill() {
  if (!state.activePill || (state.pills[state.activePill] || 0) <= 0) return null;
  return PILLS.find(p => p.id === state.activePill) || null;
}

// 当前小境界所需修为：人界陡峭，仙界与至高呈断崖式跃升
function getQiRequired() {
  const r = getRealm();
  let subScales = [1.0, 2.5, 5.5, 12.0]; // 人界：小境逐步拉长
  if (state.realmIdx >= 21) {
    subScales = [1.0, 5.0, 16.0, 42.0];  // 超脱/终极绝壁
  } else if (state.realmIdx >= 17) {
    subScales = [1.0, 4.0, 12.0, 30.0];  // 至高天堑
  } else if (state.realmIdx >= 9) {
    subScales = [1.0, 3.2, 8.5, 20.0];   // 仙界断崖
  }
  const subScale = subScales[state.subIdx] || subScales[3];
  const prestigeTax = 1 + state.prestige * 0.12;
  return Math.max(1, Math.floor(r.baseQi * subScale * prestigeTax * 0.5));
}

// 仙玉护道消耗（每次尝试破境时扣除）
function getJadeGuardCost() {
  if (state.realmIdx < 9) {
    return Math.floor(8 + state.realmIdx * 10);
  }
  const immTier = state.realmIdx - 8; // 1..12
  return Math.floor(100 + immTier * immTier * 35);
}

// 破境失败修为损耗比例（仙玉护道可减半损耗）
function getBreakthroughFailLossRatio(withGuard = false) {
  let baseLoss = state.realmIdx >= 17 ? 0.55 : (state.realmIdx >= 9 ? 0.45 : 0.30);
  if (withGuard) baseLoss *= 0.5;
  return baseLoss;
}

// 破境失败后获得的道心感悟保底增量
function getBreakthroughPityStep() {
  if (state.realmIdx >= 17) return 0.04; // 至高 +4%
  if (state.realmIdx >= 9) return 0.06;  // 仙界 +6%
  return 0.10;                           // 人界 +10%
}

// 综合破境成功率（考虑境界基础率、大境界瓶颈惩罚、逆天体质、仙玉护道、道心保底）
function getBreakthroughChance() {
  const r = getRealm();
  let chance = r.baseRate ?? 1.0;

  // 大境界突破（大圆满 -> 下一大境）难度骤增！
  if (state.subIdx === 3 && !isAtMortalPeak()) {
    if (state.realmIdx >= 9) {
      chance *= 0.65; // 仙界大境界瓶颈严苛
    } else if (state.realmIdx >= 1) {
      chance = Math.max(0.05, chance - 0.10);
    }
  }

  // 逆天体质护道加成：每种体质 +4%，顶级圣体额外大幅加持
  chance += state.physiques.length * 0.04;
  if (state.physiques.includes('ph_dao')) chance += 0.04;
  if (state.physiques.includes('ph_eternal')) chance += 0.08;
  if (state.physiques.includes('ph_chaos')) chance += 0.12;
  if (state.physiques.includes('ph_hongmeng')) chance += 0.18;

  // 仙玉护道加成
  const guardCost = getJadeGuardCost();
  if (state.useJadeGuard && state.jade >= guardCost) {
    chance += (state.realmIdx >= 9 ? 0.18 : 0.25);
  }

  // 上古灵宠与宝物破境加持
  chance += getPetBonuses().bt + getRelicBonuses().btAdd + getVeinBonuses().bt;

  // 失败感悟保底
  chance += (state.btPity || 0);

  return Math.max(0.01, Math.min(1.0, chance));
}

function isAtMortalPeak() {
  return state.realmIdx === 8 && state.subIdx === 3 && !state.ascended;
}

function isAtSupremePeak() {
  return state.realmIdx === REALMS.length - 1 && state.subIdx === 3;
}

function canBreakthrough() {
  if (isAtSupremePeak()) return false;
  if (isAtMortalPeak()) return false; // 渡劫大圆满需触发飞升仪式
  return state.qi >= getQiRequired();
}

function canAscendNow() {
  return isAtMortalPeak() && state.qi >= getQiRequired();
}

function getCooldownSeconds() {
  const base = 1.80;
  const artCut = getArtifact().cdCut;
  const daoCut = state.physiques.includes('ph_dao') ? 0.20 : 0;
  const extraCut = getPetBonuses().cdCut + getRelicBonuses().cdCut;
  const hardFloor = Math.max(0.20, 0.60 - state.karmaPerks.k_speed * 0.06);
  return Math.max(hardFloor, base - artCut - daoCut - extraCut);
}

// 4x 血脉排斥递增公式：baseCost * 4^(已觉醒体质数)
function getPhysiqueCostMultiplier() {
  return Math.pow(4, state.physiques.length);
}

function getPhysiqueActualCost(ph) {
  const mult = getPhysiqueCostMultiplier();
  return {
    karma: Math.floor(ph.baseKarma * mult),
    jade: Math.floor(ph.baseJade * mult)
  };
}

// 前六大基础逆天体质 ID
const BASE_PHYSIQUE_IDS = ['ph_heart', 'ph_blood', 'ph_bone', 'ph_eye', 'ph_dao', 'ph_ancient'];

function getUnlockedBasePhysiqueCount() {
  return BASE_PHYSIQUE_IDS.filter(id => state.physiques.includes(id)).length;
}

// 检查最后三大至高体质的严格前置顺序：前6体全解锁 -> 永恒仙体 -> 混沌神体 -> 鸿蒙至尊体
function getPhysiqueLockReason(ph) {
  if (!ph) return '未知体质';
  if (state.physiques.includes(ph.id)) return null;
  const baseCnt = getUnlockedBasePhysiqueCount();
  if (ph.id === 'ph_eternal') {
    if (baseCnt < BASE_PHYSIQUE_IDS.length) {
      return `需先解锁全部前六大逆天体质 (${baseCnt}/6)`;
    }
    return null;
  }
  if (ph.id === 'ph_chaos') {
    if (baseCnt < BASE_PHYSIQUE_IDS.length) {
      return `需先集齐前六大体质并觉醒永恒仙体 (${baseCnt}/6)`;
    }
    if (!state.physiques.includes('ph_eternal')) {
      return '需先觉醒「🌟 永恒仙体」方可解锁';
    }
    return null;
  }
  if (ph.id === 'ph_hongmeng') {
    if (baseCnt < BASE_PHYSIQUE_IDS.length) {
      return `需先集齐前六大体质，按序觉醒永恒→混沌 (${baseCnt}/6)`;
    }
    if (!state.physiques.includes('ph_eternal')) {
      return '需按序先觉醒「🌟 永恒仙体」→「🌌 混沌神体」';
    }
    if (!state.physiques.includes('ph_chaos')) {
      return '需先觉醒「🌌 混沌神体」方可解锁';
    }
    return null;
  }
  return null;
}

// 汇总所有已觉醒体质与专属功法的加成（加法池，避免指数爆炸）
function getPhysiqueBonuses() {
  let stone = 0, jade = 0, karma = 0, qi = 0;
  for (const pid of state.physiques) {
    const ph = PHYSIQUES.find(x => x.id === pid);
    if (!ph) continue;
    stone += ph.stoneBonus;
    jade += ph.jadeBonus;
    karma += ph.karmaBonus;
    qi += ph.qiBonus;
    const artLv = state.physiqueArts[ph.art.id] || 0;
    if (artLv > 0) {
      stone += artLv * ph.art.stonePerLv;
      qi += artLv * ph.art.qiPerLv;
    }
  }
  return { stone, jade, karma, qi };
}

function getArtsFlatGains() {
  let qiAdd = 0, stoneAdd = 0;
  for (const r of REALMS) {
    const lv = state.arts[r.art.id] || 0;
    if (lv > 0) {
      qiAdd += lv * r.art.qiAdd;
      stoneAdd += lv * r.art.stoneAdd;
    }
  }
  return { qiAdd, stoneAdd };
}


// 汇总所有上古灵宠加成（出战灵宠效果翻倍！）

// 灵宠升级所需经验（最高 100 级，后期极难升级；越稀有的神兽所需经验越多）
function getPetExpRequired(petId, lv) {
  const curLv = Math.max(1, Math.floor(lv || 1));
  if (curLv >= PET_MAX_LEVEL) return 0;
  const pet = SPIRIT_PETS.find(x => x.id === petId);
  const tier = pet ? PET_TIERS.find(t => t.id === pet.tierId) : null;
  const tierMult = tier ? (tier.expMult || 1.0) : 1.0;
  return Math.max(500, Math.floor(750 * tierMult * Math.pow(1.060, curLv - 1) * (1 + (curLv - 1) * 0.20)));
}

function getPetBonuses() {
  let qi = 0, stone = 0, jade = 0, luck = 0, crit = 0, bt = 0, cdCut = 0;
  for (const pet of SPIRIT_PETS) {
    const lv = state.pets[pet.id] || 0;
    if (lv <= 0) continue;
    const mult = (state.activePet === pet.id) ? 2 : 1;
    qi += lv * pet.qiPerLv * mult;
    stone += lv * pet.stonePerLv * mult;
    jade += lv * pet.jadePerLv * mult;
    luck += lv * pet.luckPerLv * mult;
    crit += (pet.critAdd || 0) * mult;
    bt += (pet.btAdd || 0) * mult;
    cdCut += (pet.cdCut || 0) * mult;
  }
  return { qi, stone, jade, luck, crit, bt, cdCut };
}

// 汇总所有已获得宝物与三大先天至宝加成
function getRelicBonuses() {
  let qiAdd = 0, stoneAdd = 0, jadeAdd = 0, luckAdd = 0, btAdd = 0, critAdd = 0, karmaAdd = 0, critMultAdd = 0, cdCut = 0;
  let qiMult = 1, stoneMult = 1, jadeMult = 1;
  for (const rel of RELICS) {
    const lv = state.relics[rel.id] || 0;
    if (lv <= 0) continue;
    if (rel.unique) {
      qiMult *= (rel.qiMult || 1);
      stoneMult *= (rel.stoneMult || 1);
      jadeMult *= (rel.jadeMult || 1);
      karmaAdd += (rel.karmaAdd || 0);
      luckAdd += (rel.luckAdd || 0);
      btAdd += (rel.btAdd || 0);
      critAdd += (rel.critAdd || 0);
      critMultAdd += (rel.critMultAdd || 0);
      cdCut += (rel.cdCut || 0);
    } else {
      qiAdd += lv * (rel.qiPerLv || 0);
      stoneAdd += lv * (rel.stonePerLv || 0);
      jadeAdd += lv * (rel.jadePerLv || 0);
      luckAdd += lv * (rel.luckPerLv || 0);
      btAdd += Math.min(0.12, lv * (rel.btPerLv || 0));
      critAdd += Math.min(0.15, lv * (rel.critPerLv || 0));
      karmaAdd += lv * (rel.karmaPerLv || 0);
    }
  }
  return { qiAdd, stoneAdd, jadeAdd, luckAdd, btAdd, critAdd, karmaAdd, critMultAdd, cdCut, qiMult, stoneMult, jadeMult };
}

// 综合宝物掉落概率倍率
function getTreasureLuckMultiplier() {
  let upgLuck = 0;
  for (const u of LUCK_UPGRADES) {
    upgLuck += (state.luckUpgrades[u.id] || 0) * u.luckPerLv;
  }
  const pb = getPetBonuses();
  const rb = getRelicBonuses();
  const karmaLuck = (state.karmaPerks.k_luck || 0) * 0.25;
  return 1 + upgLuck + pb.luck + rb.luckAdd + karmaLuck + getVeinBonuses().luck;
}

// 获取某个品阶当前的实时掉率
function getRelicTierLiveRate(tierId) {
  const tier = RELIC_TIERS.find(t => t.id === tierId);
  if (!tier) return 0;
  const luck = getTreasureLuckMultiplier();
  if (tierId === 'supreme') {
    // 先天至宝始终保持极低彩票级概率（受气运平方根温和增益，最高不超过 25x 倍率）
    return tier.baseRate * Math.min(25, Math.sqrt(luck));
  }
  const caps = { faqi: 0.35, lingqi: 0.15, fabao: 0.05, lingbao: 0.015, xianqi: 0.003 };
  return Math.min(caps[tierId] || 0.25, tier.baseRate * luck);
}

// 综合灵宠结缘概率倍率
function getPetLuckMultiplier() {
  let upgLuck = 0;
  for (const u of PET_LUCK_UPGRADES) {
    upgLuck += (state.petLuckUpgrades[u.id] || 0) * u.luckPerLv;
  }
  const pb = getPetBonuses();
  const karmaLuck = (state.karmaPerks.k_luck || 0) * 0.20;
  return 1 + upgLuck + pb.luck * 0.5 + karmaLuck + getVeinBonuses().luck;
}

// 获取某个灵宠品阶的实时结缘概率
function getPetTierLiveRate(tierId) {
  const tier = PET_TIERS.find(t => t.id === tierId);
  if (!tier) return 0;
  const luck = getPetLuckMultiplier();
  const caps = { lingshou: 0.30, sixiang: 0.10, ruishou: 0.025, honghuang: 0.004 };
  return Math.min(caps[tierId] || 0.25, tier.baseRate * luck);
}



// 汇总洞府灵脉建筑加成
function getVeinBonuses() {
  const v = state.veins || {};
  return {
    qi: (v.v_qi || 0) * 0.10,
    petExp: (v.v_pet || 0) * 0.08,
    luck: (v.v_luck || 0) * 0.06,
    bt: Math.min(0.15, (v.v_bt || 0) * 0.002)
  };
}

// 燃石修炼每次吐纳消耗的灵石（约为单次基础灵石产出的 2.4 倍，专治灵石溢出）
function getBurnStoneCost() {
  const world = getWorld();
  const realm = getRealm();
  const flat = getArtsFlatGains();
  const baseTickStone = (6 * world.stoneMult + flat.stoneAdd) * realm.stoneBonus * 0.35 * getStoneMultiplier();
  return Math.max(80, Math.round(baseTickStone * 2.4));
}

function getQiMultiplier() {
  const art = getArtifact();
  const pill = getActivePill();
  const pb = getPhysiqueBonuses();
  const petB = getPetBonuses();
  const relB = getRelicBonuses();
  const linearPerm = 1 + state.prestige * 0.20 + state.karmaPerks.k_qi * 0.15 + pb.qi + petB.qi + relB.qiAdd + getVeinBonuses().qi;
  const ascendMult = state.ascended ? 1.50 : 1.0;
  return art.qiMult * (pill ? pill.qiMult : 1) * linearPerm * ascendMult * relB.qiMult;
}

function getStoneMultiplier() {
  const art = getArtifact();
  const pill = getActivePill();
  const pb = getPhysiqueBonuses();
  const petB = getPetBonuses();
  const relB = getRelicBonuses();
  const linearPerm = 1 + state.prestige * 0.25 + state.karmaPerks.k_stone * 0.20 + pb.stone + petB.stone + relB.stoneAdd;
  const ascendMult = state.ascended ? 1.60 : 1.0;
  return art.stoneMult * (pill ? pill.stoneMult : 1) * linearPerm * ascendMult * relB.stoneMult;
}

function getJadeMultiplier() {
  const pb = getPhysiqueBonuses();
  const petB = getPetBonuses();
  const relB = getRelicBonuses();
  return (1 + state.karmaPerks.k_jade * 0.15 + pb.jade + petB.jade + relB.jadeAdd) * relB.jadeMult;
}

function getKarmaOnReincarnate() {
  if (state.realmIdx < 4) return 0; // 化神期起可轮回
  const pb = getPhysiqueBonuses();
  const relB = getRelicBonuses();
  const base = Math.floor(1 + Math.pow(state.realmIdx - 3, 1.55) + state.subIdx * 0.4 + (state.ascended ? 4 : 0));
  return Math.max(1, Math.floor(base * (1 + pb.karma + relB.karmaAdd)));
}

function getNextRealmLabel() {
  if (isAtSupremePeak()) return '无上圆满';
  if (isAtMortalPeak()) return '⚡ 待渡劫飞升仙界';
  if (state.subIdx < 3) return `${getRealm().name} · ${SUB_REALMS[state.subIdx + 1]}`;
  const next = REALMS[state.realmIdx + 1];
  return next ? `${next.name} · 初期` : '无上圆满';
}
