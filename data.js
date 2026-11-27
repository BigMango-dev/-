/* ============================================================================
   修仙数据层 — 21大境界(84小境)、21境界专属功法、9大逆天体质、12界域、法宝丹药
   ============================================================================ */
const LOCAL_SAVE_KEY = 'xiuxian_jiuxiao_v1';

const SUB_REALMS = ['初期', '中期', '后期', '大圆满'];

// 21 大境界：人界9境 (0~8) + 仙界及至高12境 (9~20)
// 境界越高修为跨度越大、基础破境率越低；踏入仙界后迎来断崖式难度跃升！
const REALMS = [
  // 人界 / 下界（前期顺畅，化神后逐步陡峭）
  { idx: 0,  tier: '人界', name: '炼气期',   lifespan: '100载',   baseQi: 160,    baseRate: 1.00,  stoneBonus: 1,       desc: '引气入体，开启气海，寿元接近凡人，尚未脱离凡俗。', art: { id: 'a_0',  name: '基础聚灵诀',   baseCost: 60,     scale: 1.55, maxLv: 15, qiAdd: 3,      stoneAdd: 2 } },
  { idx: 1,  tier: '人界', name: '筑基期',   lifespan: '300载',   baseQi: 1250,   baseRate: 0.95,  stoneBonus: 2.2,     desc: '凝气成液，铸就道台，可辟谷、御剑飞行、催生神识。', art: { id: 'a_1',  name: '青元筑基诀',   baseCost: 550,    scale: 1.52, maxLv: 15, qiAdd: 12,     stoneAdd: 8 } },
  { idx: 2,  tier: '人界', name: '金丹期',   lifespan: '550载',   baseQi: 7500,   baseRate: 0.85,  stoneBonus: 5.0,     desc: '气液化固凝成金丹，法力大增，拥有本命法宝与威压。', art: { id: 'a_2',  name: '九转金丹录',   baseCost: 4200,   scale: 1.50, maxLv: 15, qiAdd: 45,     stoneAdd: 30 } },
  { idx: 3,  tier: '人界', name: '元婴期',   lifespan: '1000载',  baseQi: 45000,  baseRate: 0.75,  stoneBonus: 12,      desc: '破丹成婴，元神与肉身联系更深，可重塑躯体、神识外放。', art: { id: 'a_3',  name: '紫府元婴经',   baseCost: 28000,  scale: 1.50, maxLv: 16, qiAdd: 160,    stoneAdd: 110 } },
  { idx: 4,  tier: '人界', name: '化神期',   lifespan: '2500载',  baseQi: 2.8e5,  baseRate: 0.62,  stoneBonus: 28,      desc: '元神蜕变，感悟天地法则初成，寿元大幅跃升。（开启重生轮回）', art: { id: 'a_4',  name: '太虚化神典',   baseCost: 180000, scale: 1.48, maxLv: 16, qiAdd: 580,    stoneAdd: 400 } },
  { idx: 5,  tier: '人界', name: '炼虚期',   lifespan: '5000载',  baseQi: 1.8e6,  baseRate: 0.50,  stoneBonus: 65,      desc: '体悟虚空与天地法则，精气神向更高层次融合，破境凶险倍增。', art: { id: 'a_5',  name: '虚空炼道诀',   baseCost: 1.1e6,  scale: 1.48, maxLv: 16, qiAdd: 2100,   stoneAdd: 1450 } },
  { idx: 6,  tier: '人界', name: '合体期',   lifespan: '1万载',   baseQi: 1.2e7,  baseRate: 0.40,  stoneBonus: 150,     desc: '神识、元神与天地之力合一，心魔劫频现，逼近飞升门槛。', art: { id: 'a_6',  name: '天人合体真经', baseCost: 6.5e6,  scale: 1.48, maxLv: 18, qiAdd: 7500,   stoneAdd: 5200 } },
  { idx: 7,  tier: '人界', name: '大乘期',   lifespan: '3万载',   baseQi: 8.5e7,  baseRate: 0.30,  stoneBonus: 360,     desc: '修为圆满、万法归一，站在飞升边缘，每破一小境皆如逆天改命。', art: { id: 'a_7',  name: '大乘万法归宗', baseCost: 4.0e7,  scale: 1.48, maxLv: 18, qiAdd: 28000,  stoneAdd: 19000 } },
  { idx: 8,  tier: '人界', name: '渡劫期',   lifespan: '10万载',  baseQi: 6.5e8,  baseRate: 0.22,  stoneBonus: 900,     desc: '引动九重天劫洗礼，渡劫大圆满即可白日飞升仙界！', art: { id: 'a_8',  name: '九霄渡劫雷经', baseCost: 2.4e8,  scale: 1.48, maxLv: 20, qiAdd: 110000, stoneAdd: 72000 } },
  // 仙界（断崖式难度跃升：修为需求飙升近 70 倍，小境跨度高达 14 倍，破境率骤降！）
  { idx: 9,  tier: '仙界', name: '人仙',     lifespan: '50万载',  baseQi: 4.5e10, baseRate: 0.16,  stoneBonus: 2400,    desc: '褪去凡胎，初凝仙元。仙界法则压制极强，每一步皆是天堑！', art: { id: 'a_9',  name: '长生人仙诀',   baseCost: 2.0e9,  scale: 1.52, maxLv: 20, qiAdd: 450000, stoneAdd: 290000 } },
  { idx: 10, tier: '仙界', name: '地仙',     lifespan: '200万载', baseQi: 5.5e11, baseRate: 0.13,  stoneBonus: 6500,    desc: '与山川地脉相合，仙元浑厚绵长，非积年苦修与轮回底蕴难成。', art: { id: 'a_10', name: '厚土载物仙经', baseCost: 1.5e10, scale: 1.52, maxLv: 20, qiAdd: 1.8e6,  stoneAdd: 1.2e6 } },
  { idx: 11, tier: '仙界', name: '天仙',     lifespan: '1000万载',baseQi: 7.0e12, baseRate: 0.10,  stoneBonus: 18000,   desc: '御风凌霄，执掌一方天穹灵韵，破境需抵御九霄仙雷。', art: { id: 'a_11', name: '九天清微仙典', baseCost: 1.1e11, scale: 1.52, maxLv: 20, qiAdd: 7.5e6,  stoneAdd: 5.0e6 } },
  { idx: 12, tier: '仙界', name: '真仙',     lifespan: '1纪元',   baseQi: 9.5e13, baseRate: 0.08,  stoneBonus: 50000,   desc: '真灵不昧，跳出五行束缚，无逆天圣体护道极难寸进。', art: { id: 'a_12', name: '太上真仙录',   baseCost: 8.5e11, scale: 1.52, maxLv: 20, qiAdd: 3.2e7,  stoneAdd: 2.1e7 } },
  { idx: 13, tier: '仙界', name: '玄仙',     lifespan: '10纪元',  baseQi: 1.4e15, baseRate: 0.065, stoneBonus: 140000,  desc: '参悟玄妙大道，神通自生异象，一境之隔宛若天壤。', art: { id: 'a_13', name: '玄元洞天经',   baseCost: 6.5e12, scale: 1.52, maxLv: 20, qiAdd: 1.4e8,  stoneAdd: 9.0e7 } },
  { idx: 14, tier: '仙界', name: '金仙',     lifespan: '百纪元',  baseQi: 2.2e16, baseRate: 0.05,  stoneBonus: 400000,  desc: '凝练不朽金性，万劫不磨，仙界中坚巨头。', art: { id: 'a_14', name: '不朽金仙宝典', baseCost: 5.0e13, scale: 1.52, maxLv: 20, qiAdd: 6.0e8,  stoneAdd: 3.8e8 } },
  { idx: 15, tier: '仙界', name: '太乙金仙', lifespan: '千纪元',  baseQi: 3.8e17, baseRate: 0.04,  stoneBonus: 1.2e6,   desc: '执掌一丝时光长河，因果难缠，破境成功率百不存四。', art: { id: 'a_15', name: '太乙衍道真诀', baseCost: 4.0e14, scale: 1.52, maxLv: 20, qiAdd: 2.6e9,  stoneAdd: 1.7e9 } },
  { idx: 16, tier: '仙界', name: '大罗金仙', lifespan: '永恒初成',baseQi: 7.0e18, baseRate: 0.03,  stoneBonus: 3.6e6,   desc: '超脱时间线，过去未来唯一真身，仙界绝巅！', art: { id: 'a_16', name: '大罗无极仙经', baseCost: 3.2e15, scale: 1.52, maxLv: 20, qiAdd: 1.2e10, stoneAdd: 7.5e9 } },
  // 至高（鸿蒙天堑：小境跨度 22 倍，基础成功率不足 2.5%）
  { idx: 17, tier: '至高', name: '准圣',     lifespan: '与界同寿',baseQi: 1.5e20, baseRate: 0.022, stoneBonus: 1.1e7,   desc: '斩去三尸执念，半步踏入圣人果位，万古难出一位。', art: { id: 'a_17', name: '斩三尸证道诀', baseCost: 2.8e16, scale: 1.55, maxLv: 20, qiAdd: 5.5e10, stoneAdd: 3.5e10 } },
  { idx: 18, tier: '至高', name: '圣人',     lifespan: '万劫不灭',baseQi: 3.6e21, baseRate: 0.016, stoneBonus: 3.5e7,   desc: '元神寄托天道，言出法随，镇压诸天万界。', art: { id: 'a_18', name: '混元圣道真经', baseCost: 2.5e17, scale: 1.55, maxLv: 20, qiAdd: 2.6e11, stoneAdd: 1.6e11 } },
  { idx: 19, tier: '至高', name: '道祖',     lifespan: '超脱纪元',baseQi: 9.5e22, baseRate: 0.012, stoneBonus: 1.1e8,   desc: '以身合道，传法万界，为诸圣之师。', art: { id: 'a_19', name: '造化玉碟总纲', baseCost: 2.2e18, scale: 1.55, maxLv: 20, qiAdd: 1.3e12, stoneAdd: 8.0e11 } },
  { idx: 20, tier: '至高', name: '界尊',     lifespan: '无量永恒',baseQi: 2.8e24, baseRate: 0.008, stoneBonus: 4.0e8,   desc: '执掌诸天万界生灭，俯瞰混沌海的无上至尊。', art: { id: 'a_20', name: '诸天界尊创世录', baseCost: 2.0e19, scale: 1.55, maxLv: 25, qiAdd: 6.8e12, stoneAdd: 4.2e12 } }
];

// 9 大逆天体质（首次重生后开放，每觉醒一种，其余体质消耗 x4 血脉排斥递增！）
// 重点强化资源产出（灵石、仙玉、机缘、轮回道果），修为增幅为加法池避免数值爆炸
const PHYSIQUES = [
  {
    id: 'ph_heart', name: '七窍玲珑心', icon: '💠',
    baseKarma: 4, baseJade: 80,
    stoneBonus: 0.45, jadeBonus: 0.55, karmaBonus: 0.15, qiBonus: 0.18,
    desc: '天生道心通明，洞察天机。大幅提升仙玉获取与机缘秘宝掉率。',
    art: { id: 'pa_heart', name: '玲珑天心诀', baseCost: 15, scale: 1.55, maxLv: 20, currency: 'jade', stonePerLv: 0.08, qiPerLv: 0.06, desc: '每级 +8% 灵石产出、+6% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_blood', name: '血域魔体', icon: '🩸',
    baseKarma: 6, baseJade: 120,
    stoneBonus: 0.85, jadeBonus: 0.25, karmaBonus: 0.15, qiBonus: 0.22,
    desc: '以战养道，掠夺八荒灵脉。极大提升灵石产出与暴击吐纳几率。',
    art: { id: 'pa_blood', name: '修罗血神经', baseCost: 20, scale: 1.55, maxLv: 20, currency: 'jade', stonePerLv: 0.12, qiPerLv: 0.07, desc: '每级 +12% 灵石产出、+7% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_bone', name: '至尊骨', icon: '🦴',
    baseKarma: 9, baseJade: 180,
    stoneBonus: 0.70, jadeBonus: 0.45, karmaBonus: 0.25, qiBonus: 0.25,
    desc: '天生铭刻至尊宝术，破境与秘宝收获暴涨，轮回道果额外增加。',
    art: { id: 'pa_bone', name: '至尊劫光经', baseCost: 25, scale: 1.58, maxLv: 20, currency: 'jade', stonePerLv: 0.10, qiPerLv: 0.08, desc: '每级 +10% 灵石产出、+8% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_eye', name: '重瞳', icon: '👁️',
    baseKarma: 12, baseJade: 240,
    stoneBonus: 0.65, jadeBonus: 0.75, karmaBonus: 0.25, qiBonus: 0.28,
    desc: '重瞳本是无敌路，一眼勘破虚妄与隐秘洞府，仙玉与秘宝掉率巨幅提升。',
    art: { id: 'pa_eye', name: '重瞳开天诀', baseCost: 32, scale: 1.58, maxLv: 20, currency: 'jade', stonePerLv: 0.10, qiPerLv: 0.09, desc: '每级 +10% 灵石产出、+9% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_dao', name: '先天道胎', icon: '☯️',
    baseKarma: 16, baseJade: 320,
    stoneBonus: 0.75, jadeBonus: 0.50, karmaBonus: 0.30, qiBonus: 0.35,
    desc: '近道之躯，天然契合天地灵气，永久缩减调息时间并稳步提升修为与灵石。',
    art: { id: 'pa_dao', name: '先天大道经', baseCost: 40, scale: 1.60, maxLv: 20, currency: 'jade', stonePerLv: 0.11, qiPerLv: 0.10, desc: '每级 +11% 灵石产出、+10% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_ancient', name: '荒古圣体', icon: '⚜️',
    baseKarma: 22, baseJade: 450,
    stoneBonus: 1.25, jadeBonus: 0.45, karmaBonus: 0.30, qiBonus: 0.32,
    desc: '金血滔天，大成圣体可叫板大帝。提供极其恐怖的灵石与秘境资源增幅。',
    art: { id: 'pa_ancient', name: '荒古镇世诀', baseCost: 50, scale: 1.60, maxLv: 20, currency: 'jade', stonePerLv: 0.16, qiPerLv: 0.09, desc: '每级 +16% 灵石产出、+9% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_eternal', name: '永恒仙体', icon: '🌟',
    baseKarma: 30, baseJade: 650,
    stoneBonus: 1.00, jadeBonus: 0.90, karmaBonus: 0.35, qiBonus: 0.38,
    desc: '仙辉永驻，万法不侵。极大强化仙玉产出、秘宝品质与离线闭关效率。',
    art: { id: 'pa_eternal', name: '永恒不朽经', baseCost: 65, scale: 1.62, maxLv: 20, currency: 'jade', stonePerLv: 0.14, qiPerLv: 0.11, desc: '每级 +14% 灵石产出、+11% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_chaos', name: '混沌神体', icon: '🌌',
    baseKarma: 45, baseJade: 950,
    stoneBonus: 1.35, jadeBonus: 0.85, karmaBonus: 0.50, qiBonus: 0.45,
    desc: '身融混沌气，吞吐星海灵机。大幅增加轮回道果收益与全资源获取。',
    art: { id: 'pa_chaos', name: '混沌神诀', baseCost: 85, scale: 1.62, maxLv: 25, currency: 'jade', stonePerLv: 0.16, qiPerLv: 0.12, desc: '混沌神体专属至高神诀，每级 +16% 灵石、+12% 修为。' }
  },
  {
    id: 'ph_hongmeng', name: '鸿蒙至尊体', icon: '👑',
    baseKarma: 70, baseJade: 1500,
    stoneBonus: 1.80, jadeBonus: 1.20, karmaBonus: 0.70, qiBonus: 0.55,
    desc: '开天辟地第一圣体，执掌鸿蒙紫气，全资源产出与轮回道果收益登峰造极。',
    art: { id: 'pa_hongmeng', name: '鸿蒙造化经', baseCost: 110, scale: 1.65, maxLv: 25, currency: 'jade', stonePerLv: 0.20, qiPerLv: 0.14, desc: '鸿蒙至尊体专属无上圣法，每级 +20% 灵石、+14% 修为。' }
  }
];

// 12 大游历界域（人界6域 + 仙界6域）
const WORLDS = [
  { id: 'w_cangwu',   tier: '人界', name: '苍梧大陆', icon: '⛰️', reqRealm: 0,  reqAscend: false, stoneMult: 1,     qiBase: 12,     chestRate: 0.04, gradient: 'linear-gradient(135deg, #0f766e, #0f172a)', desc: '灵脉初显的人界古陆，山川秀丽，最宜初入仙途者引气入体。' },
  { id: 'w_yunmeng',  tier: '人界', name: '云梦泽',   icon: '🌫️', reqRealm: 1,  reqAscend: false, stoneMult: 3.2,   qiBase: 36,     chestRate: 0.045,gradient: 'linear-gradient(135deg, #0284c7, #1e1b4b)', desc: '烟波浩渺的灵雾大泽，水木灵气氤氲，筑基修士趋之若鹜。' },
  { id: 'w_qingqiu',  tier: '人界', name: '青丘仙境', icon: '🌸', reqRealm: 2,  reqAscend: false, stoneMult: 11,    qiBase: 115,    chestRate: 0.05, gradient: 'linear-gradient(135deg, #be185d, #1e1b4b)', desc: '桃花漫天的上古妖灵福地，藏有无数金丹灵果与秘宝。' },
  { id: 'w_qixia',    tier: '人界', name: '栖霞大陆', icon: '🌅', reqRealm: 4,  reqAscend: false, stoneMult: 45,    qiBase: 420,    chestRate: 0.055,gradient: 'linear-gradient(135deg, #c2410c, #1c1917)', desc: '晚霞长明、紫气东来，化神大能在此感悟法则、开宗立派。' },
  { id: 'w_kunlun',   tier: '人界', name: '昆仑神州', icon: '🏔️', reqRealm: 6,  reqAscend: false, stoneMult: 200,   qiBase: 1650,   chestRate: 0.06, gradient: 'linear-gradient(135deg, #1d4ed8, #090d16)', desc: '人界万山之祖，龙脉汇聚之地，乃合体大乘修士闭关圣地。' },
  { id: 'w_guixu',    tier: '人界', name: '归墟大陆', icon: '🌊', reqRealm: 8,  reqAscend: false, stoneMult: 950,   qiBase: 7200,   chestRate: 0.065,gradient: 'linear-gradient(135deg, #4338ca, #09090b)', desc: '四海尽头、天劫汇聚之地，渡劫强者于此静候天门大开。' },
  // 仙界六域
  { id: 'w_penglai',  tier: '仙界', name: '蓬莱仙域', icon: '🏝️', reqRealm: 9,  reqAscend: true,  stoneMult: 4800,  qiBase: 32000,  chestRate: 0.07, gradient: 'linear-gradient(135deg, #0d9488, #312e81)', desc: '仙界初入之境，仙鹤齐鸣，仙灵之气浓稠如雾。' },
  { id: 'w_qionghua', tier: '仙界', name: '琼华仙域', icon: '🏯', reqRealm: 11, reqAscend: true,  stoneMult: 26000, qiBase: 150000, chestRate: 0.075,gradient: 'linear-gradient(135deg, #7c3aed, #1e1b4b)', desc: '琼楼玉宇悬浮九霄，天仙真仙云集论道之所。' },
  { id: 'w_ziwei',    tier: '仙界', name: '紫微星域', icon: '✨', reqRealm: 13, reqAscend: true,  stoneMult: 150000,qiBase: 750000, chestRate: 0.08, gradient: 'linear-gradient(135deg, #6d28d9, #09090b)', desc: '群星拱卫帝星，玄仙金仙汲取星辰本源之地。' },
  { id: 'w_honghuang',tier: '仙界', name: '洪荒古陆', icon: '🐉', reqRealm: 15, reqAscend: true,  stoneMult: 900000,qiBase: 4.0e6,  chestRate: 0.085,gradient: 'linear-gradient(135deg, #b45309, #1c1917)', desc: '上古神兽遗迹遍布，太乙与大罗金仙争锋之古陆。' },
  { id: 'w_xiuluo',   tier: '仙界', name: '修罗血域', icon: '🔥', reqRealm: 17, reqAscend: true,  stoneMult: 6.0e6, qiBase: 2.2e7,  chestRate: 0.09, gradient: 'linear-gradient(135deg, #991b1b, #09090b)', desc: '杀伐法则弥漫的凶险古域，唯准圣圣人可在此掠夺无尽资源。' },
  { id: 'w_taichu',   tier: '至高', name: '太初界域', icon: '🌀', reqRealm: 19, reqAscend: true,  stoneMult: 4.5e7, qiBase: 1.4e8,  chestRate: 0.10, gradient: 'linear-gradient(135deg, #9333ea, #0284c7, #09090b)', desc: '混沌初开之地，鸿蒙紫气升腾，道祖与界尊俯瞰诸天之巅。' }
];

// 本命法宝（12阶）
const ARTIFACTS = [
  { id: 'art_0',  name: '木灵剑',     reqRealm: 0,  cost: 0,      qiMult: 1.0,  stoneMult: 1.0,  cdCut: 0 },
  { id: 'art_1',  name: '青锋灵剑',   reqRealm: 0,  cost: 400,    qiMult: 1.35, stoneMult: 1.3,  cdCut: 0.05 },
  { id: 'art_2',  name: '玄铁飞剑',   reqRealm: 1,  cost: 3500,   qiMult: 1.9,  stoneMult: 1.8,  cdCut: 0.10 },
  { id: 'art_3',  name: '赤炎金丹炉', reqRealm: 2,  cost: 28000,  qiMult: 2.8,  stoneMult: 2.6,  cdCut: 0.15 },
  { id: 'art_4',  name: '紫金葫芦',   reqRealm: 3,  cost: 220000, qiMult: 4.2,  stoneMult: 4.0,  cdCut: 0.20 },
  { id: 'art_5',  name: '乾坤阴阳镜', reqRealm: 4,  cost: 1.8e6,  qiMult: 6.5,  stoneMult: 6.2,  cdCut: 0.25 },
  { id: 'art_6',  name: '九霄雷神戟', reqRealm: 6,  cost: 4.5e7,  qiMult: 10.5, stoneMult: 10.0, cdCut: 0.32 },
  { id: 'art_7',  name: '诛仙古剑',   reqRealm: 8,  cost: 1.2e9,  qiMult: 18.0, stoneMult: 17.0, cdCut: 0.40 },
  { id: 'art_8',  name: '太极仙图',   reqRealm: 10, cost: 3.5e10, qiMult: 32.0, stoneMult: 30.0, cdCut: 0.48 },
  { id: 'art_9',  name: '东皇混沌钟', reqRealm: 13, cost: 2.0e12, qiMult: 62.0, stoneMult: 58.0, cdCut: 0.56 },
  { id: 'art_10', name: '开天盘古斧', reqRealm: 16, cost: 1.8e14, qiMult: 125.0,stoneMult: 115.0,cdCut: 0.65 },
  { id: 'art_11', name: '鸿蒙造化玉', reqRealm: 19, cost: 2.5e16, qiMult: 280.0,stoneMult: 260.0,cdCut: 0.75 }
];

// 辅助丹药（消耗品，轮回时重置）
const PILLS = [
  { id: 'p_qi',    name: '聚气丹',   reqRealm: 0,  cost: 30,     qiMult: 1.35, stoneMult: 1.1,  desc: '1.35x 吐纳修为，+10% 灵石。' },
  { id: 'p_zhuji', name: '筑基灵液', reqRealm: 1,  cost: 180,    qiMult: 1.65, stoneMult: 1.25, desc: '1.65x 吐纳修为，1.25x 灵石。' },
  { id: 'p_jindan',name: '凝金丹',   reqRealm: 2,  cost: 1100,   qiMult: 2.0,  stoneMult: 1.5,  desc: '2.0x 吐纳修为，1.5x 灵石。' },
  { id: 'p_yuanying',name:'蕴婴仙丹',reqRealm: 4,  cost: 15000,  qiMult: 2.5,  stoneMult: 1.85, desc: '2.5x 吐纳修为，1.85x 灵石。' },
  { id: 'p_xian',  name: '九转金丹', reqRealm: 9,  cost: 650000, qiMult: 3.4,  stoneMult: 2.4,  desc: '3.4x 仙灵修为，2.4x 灵石。' },
  { id: 'p_hong',  name: '鸿蒙道丹', reqRealm: 15, cost: 4.5e7,  qiMult: 4.8,  stoneMult: 3.5,  desc: '4.8x 至高修为，3.5x 灵石。' }
];

// 轮回神通（消耗轮回道果，永久保留，线性成长防爆炸）
const KARMA_PERKS = [
  { id: 'k_qi',    name: '宿慧觉醒', baseCost: 1, scale: 1.75, maxLv: 25, desc: '永久 +15% 吐纳修为（线性叠加）。' },
  { id: 'k_stone', name: '聚宝仙瞳', baseCost: 1, scale: 1.75, maxLv: 25, desc: '永久 +20% 灵石与秘宝产出。' },
  { id: 'k_speed', name: '缩地成寸', baseCost: 2, scale: 2.1,  maxLv: 6,  desc: '永久降低调息下限 -0.06s（最低可至 0.24s）。' },
  { id: 'k_jade',  name: '仙缘庇佑', baseCost: 2, scale: 1.9,  maxLv: 15, desc: '永久 +15% 仙玉获取与机缘秘宝掉率。' }
];
