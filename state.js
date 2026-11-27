/* ============================================================================
   状态管理、NaN 防护清洗 & 平衡数值公式（4x 血脉排斥 + 线性轮回）
   ============================================================================ */
function defaultState() {
  const arts = {};
  REALMS.forEach(r => { arts[r.art.id] = 0; });
  const pArts = {};
  PHYSIQUES.forEach(p => { pArts[p.art.id] = 0; });
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
    karmaPerks: { k_qi: 0, k_stone: 0, k_speed: 0, k_jade: 0 },
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
    karmaPerks: sanitizeMap(p.karmaPerks, def.karmaPerks),
    btPity: safeNum(p.btPity, 0, 0),
    useJadeGuard: Boolean(p.useJadeGuard),
    pills: sanitizeMap(p.pills, { p_qi: 5, p_zhuji: 0, p_jindan: 0, p_yuanying: 0, p_xian: 0, p_hong: 0 }),
    lastActiveAt: safeNum(p.lastActiveAt, Date.now(), 0)
  };
  if (state.realmIdx > state.maxRealmEver) state.maxRealmEver = state.realmIdx;
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
  const units = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载'];
  let val = n;
  let idx = -1;
  while (val >= 10000 && idx < units.length - 1) {
    val /= 10000;
    idx++;
  }
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
  if (state.realmIdx >= 17) {
    subScales = [1.0, 4.0, 12.0, 30.0];  // 至高天堑
  } else if (state.realmIdx >= 9) {
    subScales = [1.0, 3.2, 8.5, 20.0];   // 仙界断崖
  }
  const subScale = subScales[state.subIdx] || subScales[3];
  const prestigeTax = 1 + state.prestige * 0.12;
  return Math.floor(r.baseQi * subScale * prestigeTax);
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
  const hardFloor = Math.max(0.24, 0.60 - state.karmaPerks.k_speed * 0.06);
  return Math.max(hardFloor, base - artCut - daoCut);
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

function getQiMultiplier() {
  const art = getArtifact();
  const pill = getActivePill();
  const pb = getPhysiqueBonuses();
  const linearPerm = 1 + state.prestige * 0.20 + state.karmaPerks.k_qi * 0.15 + pb.qi;
  const ascendMult = state.ascended ? 1.50 : 1.0;
  return art.qiMult * (pill ? pill.qiMult : 1) * linearPerm * ascendMult;
}

function getStoneMultiplier() {
  const art = getArtifact();
  const pill = getActivePill();
  const pb = getPhysiqueBonuses();
  const linearPerm = 1 + state.prestige * 0.25 + state.karmaPerks.k_stone * 0.20 + pb.stone;
  const ascendMult = state.ascended ? 1.60 : 1.0;
  return art.stoneMult * (pill ? pill.stoneMult : 1) * linearPerm * ascendMult;
}

function getJadeMultiplier() {
  const pb = getPhysiqueBonuses();
  return 1 + state.karmaPerks.k_jade * 0.15 + pb.jade;
}

function getKarmaOnReincarnate() {
  if (state.realmIdx < 4) return 0; // 化神期起可轮回
  const pb = getPhysiqueBonuses();
  const base = Math.floor(1 + Math.pow(state.realmIdx - 3, 1.55) + state.subIdx * 0.4 + (state.ascended ? 4 : 0));
  return Math.max(1, Math.floor(base * (1 + pb.karma)));
}

function getNextRealmLabel() {
  if (isAtSupremePeak()) return '无上圆满';
  if (isAtMortalPeak()) return '⚡ 待渡劫飞升仙界';
  if (state.subIdx < 3) return `${getRealm().name} · ${SUB_REALMS[state.subIdx + 1]}`;
  const next = REALMS[state.realmIdx + 1];
  return next ? `${next.name} · 初期` : '无上圆满';
}
