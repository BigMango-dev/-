/* ============================================================================
   修仙数据层 — 21大境界(84小境)、21境界专属功法、9大逆天体质、12界域、法宝丹药
   ============================================================================ */
const LOCAL_SAVE_KEY = 'xiuxian_jiuxiao_v1';

const SUB_REALMS = ['初期', '中期', '后期', '大圆满'];

// 21 大境界：人界9境 (0~8) + 仙界及至高12境 (9~20)
// 深度慢节奏修真曲线：每破一大境界难度巨幅攀升，必须投入灵石炼制法宝、参悟新功法与丹药方能破关！
const REALMS = [
  // 人界 / 下界
  { idx: 0,  tier: '人界', name: '炼气期',   lifespan: '100载',   baseQi: 850,    baseRate: 1.00,  stoneBonus: 1,       desc: '引气入体，开启气海，寿元接近凡人，尚未脱离凡俗。', art: { id: 'a_0',  name: '基础聚灵诀',   baseCost: 80,     scale: 1.58, maxLv: 15, qiAdd: 4,      stoneAdd: 3 } },
  { idx: 1,  tier: '人界', name: '筑基期',   lifespan: '300载',   baseQi: 18000,  baseRate: 0.95,  stoneBonus: 2.5,     desc: '凝气成液，铸就道台，可辟谷、御剑飞行、催生神识。', art: { id: 'a_1',  name: '青元筑基诀',   baseCost: 750,    scale: 1.56, maxLv: 15, qiAdd: 16,     stoneAdd: 11 } },
  { idx: 2,  tier: '人界', name: '金丹期',   lifespan: '550载',   baseQi: 2.6e5,  baseRate: 0.85,  stoneBonus: 6.0,     desc: '气液化固凝成金丹，法力大增，拥有本命法宝与威压。', art: { id: 'a_2',  name: '九转金丹录',   baseCost: 6500,   scale: 1.55, maxLv: 15, qiAdd: 65,     stoneAdd: 42 } },
  { idx: 3,  tier: '人界', name: '元婴期',   lifespan: '1000载',  baseQi: 3.2e6,  baseRate: 0.75,  stoneBonus: 15,      desc: '破丹成婴，元神与肉身联系更深，可重塑躯体、神识外放。', art: { id: 'a_3',  name: '紫府元婴经',   baseCost: 52000,  scale: 1.54, maxLv: 16, qiAdd: 260,    stoneAdd: 165 } },
  { idx: 4,  tier: '人界', name: '化神期',   lifespan: '2500载',  baseQi: 3.6e7,  baseRate: 0.62,  stoneBonus: 38,      desc: '元神蜕变，感悟天地法则初成，寿元大幅跃升。（开启重生轮回）', art: { id: 'a_4',  name: '太虚化神典',   baseCost: 4.2e5,  scale: 1.54, maxLv: 16, qiAdd: 1000,   stoneAdd: 650 } },
  { idx: 5,  tier: '人界', name: '炼虚期',   lifespan: '5000载',  baseQi: 4.2e8,  baseRate: 0.50,  stoneBonus: 95,      desc: '体悟虚空与天地法则，精气神向更高层次融合，破境凶险倍增。', art: { id: 'a_5',  name: '虚空炼道诀',   baseCost: 3.5e6,  scale: 1.54, maxLv: 16, qiAdd: 4000,   stoneAdd: 2500 } },
  { idx: 6,  tier: '人界', name: '合体期',   lifespan: '1万载',   baseQi: 5.2e9,  baseRate: 0.40,  stoneBonus: 240,     desc: '神识、元神与天地之力合一，心魔劫频现，逼近飞升门槛。', art: { id: 'a_6',  name: '天人合体真经', baseCost: 2.8e7,  scale: 1.54, maxLv: 18, qiAdd: 16000,  stoneAdd: 9800 } },
  { idx: 7,  tier: '人界', name: '大乘期',   lifespan: '3万载',   baseQi: 6.8e10, baseRate: 0.30,  stoneBonus: 620,     desc: '修为圆满、万法归一，站在飞升边缘，每破一小境皆如逆天改命。', art: { id: 'a_7',  name: '大乘万法归宗', baseCost: 2.4e8,  scale: 1.54, maxLv: 18, qiAdd: 65000,  stoneAdd: 40000 } },
  { idx: 8,  tier: '人界', name: '渡劫期',   lifespan: '10万载',  baseQi: 9.5e11, baseRate: 0.22,  stoneBonus: 1600,    desc: '引动九重天劫洗礼，渡劫大圆满即可白日飞升仙界！', art: { id: 'a_8',  name: '九霄渡劫雷经', baseCost: 2.0e9,  scale: 1.54, maxLv: 20, qiAdd: 260000, stoneAdd: 160000 } },
  // 仙界（断崖式难度跃升：人仙直接飙升近 80 倍，小境跨度高达 20 倍！）
  { idx: 9,  tier: '仙界', name: '人仙',     lifespan: '50万载',  baseQi: 7.5e13, baseRate: 0.16,  stoneBonus: 4500,    desc: '褪去凡胎，初凝仙元。仙界法则压制极强，每一步皆是天堑！', art: { id: 'a_9',  name: '长生人仙诀',   baseCost: 2.2e10, scale: 1.56, maxLv: 20, qiAdd: 1.1e6,  stoneAdd: 680000 } },
  { idx: 10, tier: '仙界', name: '地仙',     lifespan: '200万载', baseQi: 1.2e15, baseRate: 0.13,  stoneBonus: 13000,   desc: '与山川地脉相合，仙元浑厚绵长，非积年苦修与轮回底蕴难成。', art: { id: 'a_10', name: '厚土载物仙经', baseCost: 2.2e11, scale: 1.56, maxLv: 20, qiAdd: 4.8e6,  stoneAdd: 3.0e6 } },
  { idx: 11, tier: '仙界', name: '天仙',     lifespan: '1000万载',baseQi: 2.0e16, baseRate: 0.10,  stoneBonus: 38000,   desc: '御风凌霄，执掌一方天穹灵韵，破境需抵御九霄仙雷。', art: { id: 'a_11', name: '九天清微仙典', baseCost: 2.2e12, scale: 1.56, maxLv: 20, qiAdd: 2.1e7,  stoneAdd: 1.3e7 } },
  { idx: 12, tier: '仙界', name: '真仙',     lifespan: '1纪元',   baseQi: 3.6e17, baseRate: 0.08,  stoneBonus: 110000,  desc: '真灵不昧，跳出五行束缚，无逆天圣体护道极难寸进。', art: { id: 'a_12', name: '太上真仙录',   baseCost: 2.4e13, scale: 1.56, maxLv: 20, qiAdd: 9.5e7,  stoneAdd: 6.0e7 } },
  { idx: 13, tier: '仙界', name: '玄仙',     lifespan: '10纪元',  baseQi: 6.8e18, baseRate: 0.065, stoneBonus: 340000,  desc: '参悟玄妙大道，神通自生异象，一境之隔宛若天壤。', art: { id: 'a_13', name: '玄元洞天经',   baseCost: 2.6e14, scale: 1.56, maxLv: 20, qiAdd: 4.4e8,  stoneAdd: 2.8e8 } },
  { idx: 14, tier: '仙界', name: '金仙',     lifespan: '百纪元',  baseQi: 1.4e20, baseRate: 0.05,  stoneBonus: 1.0e6,   desc: '凝练不朽金性，万劫不磨，仙界中坚巨头。', art: { id: 'a_14', name: '不朽金仙宝典', baseCost: 3.0e15, scale: 1.56, maxLv: 20, qiAdd: 2.1e9,  stoneAdd: 1.3e9 } },
  { idx: 15, tier: '仙界', name: '太乙金仙', lifespan: '千纪元',  baseQi: 3.0e21, baseRate: 0.04,  stoneBonus: 3.2e6,   desc: '执掌一丝时光长河，因果难缠，破境成功率百不存四。', art: { id: 'a_15', name: '太乙衍道真诀', baseCost: 3.6e16, scale: 1.56, maxLv: 20, qiAdd: 1.0e10, stoneAdd: 6.4e9 } },
  { idx: 16, tier: '仙界', name: '大罗金仙', lifespan: '永恒初成',baseQi: 7.0e22, baseRate: 0.03,  stoneBonus: 1.0e7,   desc: '超脱时间线，过去未来唯一真身，仙界绝巅！', art: { id: 'a_16', name: '大罗无极仙经', baseCost: 4.5e17, scale: 1.56, maxLv: 20, qiAdd: 5.0e10, stoneAdd: 3.2e10 } },
  // 至高（鸿蒙天堑：小境跨度 30 倍，基础成功率不足 2.5%）
  { idx: 17, tier: '至高', name: '准圣',     lifespan: '与界同寿',baseQi: 2.0e24, baseRate: 0.022, stoneBonus: 3.5e7,   desc: '斩去三尸执念，半步踏入圣人果位，万古难出一位。', art: { id: 'a_17', name: '斩三尸证道诀', baseCost: 6.0e18, scale: 1.58, maxLv: 20, qiAdd: 2.6e11, stoneAdd: 1.6e11 } },
  { idx: 18, tier: '至高', name: '圣人',     lifespan: '万劫不灭',baseQi: 6.5e25, baseRate: 0.016, stoneBonus: 1.2e8,   desc: '元神寄托天道，言出法随，镇压诸天万界。', art: { id: 'a_18', name: '混元圣道真经', baseCost: 8.5e19, scale: 1.58, maxLv: 20, qiAdd: 1.4e12, stoneAdd: 8.8e11 } },
  { idx: 19, tier: '至高', name: '道祖',     lifespan: '超脱纪元',baseQi: 2.4e27, baseRate: 0.012, stoneBonus: 4.2e8,   desc: '以身合道，传法万界，为诸圣之师。', art: { id: 'a_19', name: '造化玉碟总纲', baseCost: 1.2e21, scale: 1.58, maxLv: 20, qiAdd: 7.5e12, stoneAdd: 4.8e12 } },
  { idx: 20, tier: '至高', name: '界尊',     lifespan: '无量永恒',baseQi: 9.5e28, baseRate: 0.008, stoneBonus: 1.6e9,   desc: '执掌诸天万界生灭，俯瞰混沌海的无上至尊。', art: { id: 'a_20', name: '诸天界尊创世录', baseCost: 1.8e22, scale: 1.58, maxLv: 25, qiAdd: 4.2e13, stoneAdd: 2.6e13 } }
];

// 9 大逆天体质（首次重生后开放，每觉醒一种，其余体质消耗 x4 血脉排斥递增！）
// 逆天级资源与破境加成，完全配得上天价消耗；每种体质皆有专属异象觉醒动画！
const PHYSIQUES = [
  {
    id: 'ph_heart', name: '七窍玲珑心', icon: '💠', tierTag: '绝世灵体',
    baseKarma: 4, baseJade: 80,
    stoneBonus: 1.20, jadeBonus: 1.50, karmaBonus: 0.45, qiBonus: 0.55,
    desc: '天生七窍通明，洞察天机。巨幅提升仙玉获取与机缘秘宝掉率，破境更易顿悟。',
    art: { id: 'pa_heart', name: '玲珑天心诀', baseCost: 15, scale: 1.55, maxLv: 20, currency: 'jade', stonePerLv: 0.18, qiPerLv: 0.14, desc: '每级 +18% 灵石产出、+14% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_blood', name: '血域魔体', icon: '🩸', tierTag: '太古魔体',
    baseKarma: 6, baseJade: 120,
    stoneBonus: 2.20, jadeBonus: 0.80, karmaBonus: 0.50, qiBonus: 0.75,
    desc: '以战养道，掠夺八荒灵脉。海量提升灵石产出，吐纳顿悟暴击率跃升至 22%（2.1倍收益）。',
    art: { id: 'pa_blood', name: '修罗血神经', baseCost: 20, scale: 1.55, maxLv: 20, currency: 'jade', stonePerLv: 0.26, qiPerLv: 0.16, desc: '每级 +26% 灵石产出、+16% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_bone', name: '至尊骨', icon: '🦴', tierTag: '天生至尊',
    baseKarma: 9, baseJade: 180,
    stoneBonus: 2.00, jadeBonus: 1.40, karmaBonus: 0.75, qiBonus: 0.90,
    desc: '胸生至尊宝骨，铭刻上古劫光宝术。全资源大幅暴涨，轮回道果收益剧增。',
    art: { id: 'pa_bone', name: '至尊劫光经', baseCost: 25, scale: 1.58, maxLv: 20, currency: 'jade', stonePerLv: 0.24, qiPerLv: 0.18, desc: '每级 +24% 灵石产出、+18% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_eye', name: '重瞳', icon: '👁️', tierTag: '无敌重瞳',
    baseKarma: 12, baseJade: 240,
    stoneBonus: 2.10, jadeBonus: 2.40, karmaBonus: 0.85, qiBonus: 1.05,
    desc: '重瞳本是无敌路，一眼勘破虚妄洞府，仙玉产出与秘宝寻获率呈倍暴增。',
    art: { id: 'pa_eye', name: '重瞳开天诀', baseCost: 32, scale: 1.58, maxLv: 20, currency: 'jade', stonePerLv: 0.26, qiPerLv: 0.20, desc: '每级 +26% 灵石产出、+20% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_dao', name: '先天道胎', icon: '☯️', tierTag: '近道圣躯',
    baseKarma: 16, baseJade: 320,
    stoneBonus: 2.60, jadeBonus: 1.80, karmaBonus: 1.00, qiBonus: 1.40,
    desc: '先天近道之躯，天然契合天地法则，永久缩减调息 -0.20s，并额外提升破境成功率。',
    art: { id: 'pa_dao', name: '先天大道经', baseCost: 40, scale: 1.60, maxLv: 20, currency: 'jade', stonePerLv: 0.30, qiPerLv: 0.24, desc: '每级 +30% 灵石产出、+24% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_ancient', name: '荒古圣体', icon: '⚜️', tierTag: '万古圣体',
    baseKarma: 22, baseJade: 450,
    stoneBonus: 4.20, jadeBonus: 1.80, karmaBonus: 1.20, qiBonus: 1.50,
    desc: '黄金气血冲霄，大成圣体可叫板古之大帝！提供极其恐怖的灵石与秘境资源暴击增幅。',
    art: { id: 'pa_ancient', name: '荒古镇世诀', baseCost: 50, scale: 1.60, maxLv: 20, currency: 'jade', stonePerLv: 0.42, qiPerLv: 0.25, desc: '每级 +42% 灵石产出、+25% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_eternal', name: '永恒仙体', icon: '🌟', tierTag: '至高仙体 · 阶一',
    isSupreme: true,
    baseKarma: 30, baseJade: 650,
    stoneBonus: 12.00, jadeBonus: 9.00, karmaBonus: 3.50, qiBonus: 5.50,
    desc: '【需集齐前六圣体解锁】仙辉永驻，万劫不灭！灵石仙玉十倍狂飙，额外强化仙界破境成功率 +8%！',
    art: { id: 'pa_eternal', name: '永恒不朽经', baseCost: 65, scale: 1.62, maxLv: 25, currency: 'jade', stonePerLv: 1.20, qiPerLv: 0.80, desc: '每级 +120% 灵石产出、+80% 修为感悟（消耗仙玉）。' }
  },
  {
    id: 'ph_chaos', name: '混沌神体', icon: '🌌', tierTag: '太初神体 · 阶二',
    isSupreme: true,
    baseKarma: 45, baseJade: 950,
    stoneBonus: 25.00, jadeBonus: 16.00, karmaBonus: 6.50, qiBonus: 12.00,
    desc: '【需先觉醒永恒仙体】身融混沌海，吞吐诸天星河！全资源数十倍暴增，额外提供 +12% 破境护道成功率！',
    art: { id: 'pa_chaos', name: '混沌神诀', baseCost: 85, scale: 1.62, maxLv: 25, currency: 'jade', stonePerLv: 2.20, qiPerLv: 1.50, desc: '混沌神体专属至高神诀，每级 +220% 灵石、+150% 修为。' }
  },
  {
    id: 'ph_hongmeng', name: '鸿蒙至尊体', icon: '👑', tierTag: '万界第一 · 终极',
    isSupreme: true,
    baseKarma: 70, baseJade: 1500,
    stoneBonus: 50.00, jadeBonus: 30.00, karmaBonus: 12.00, qiBonus: 25.00,
    desc: '【需先觉醒混沌神体】开天辟地第一无上圣体！执掌鸿蒙紫气，全资源暴涨数十倍，额外提供 +18% 破境成功率！',
    art: { id: 'pa_hongmeng', name: '鸿蒙造化经', baseCost: 110, scale: 1.65, maxLv: 30, currency: 'jade', stonePerLv: 4.00, qiPerLv: 2.80, desc: '鸿蒙至尊体专属无上圣法，每级 +400% 灵石、+280% 修为。' }
  }
];

// 12 大游历界域（人界6域 + 仙界6域）
// 界域主要提供更高灵石倍率与秘宝掉率，纯粹靠地图白嫖修为极慢，必须消费灵石升级法宝与功法！
const WORLDS = [
  { id: 'w_cangwu',   tier: '人界', name: '苍梧大陆', icon: '⛰️', reqRealm: 0,  reqAscend: false, stoneMult: 1,     qiBase: 8,      chestRate: 0.04,  gradient: 'linear-gradient(135deg, #0f766e, #0f172a)', desc: '灵脉初显的人界古陆，山川秀丽，最宜初入仙途者引气入体。' },
  { id: 'w_yunmeng',  tier: '人界', name: '云梦泽',   icon: '🌫️', reqRealm: 1,  reqAscend: false, stoneMult: 3.5,   qiBase: 18,     chestRate: 0.045, gradient: 'linear-gradient(135deg, #0284c7, #1e1b4b)', desc: '烟波浩渺的灵雾大泽，灵石矿脉丰饶，筑基修士趋之若鹜。' },
  { id: 'w_qingqiu',  tier: '人界', name: '青丘仙境', icon: '🌸', reqRealm: 2,  reqAscend: false, stoneMult: 13,    qiBase: 42,     chestRate: 0.05,  gradient: 'linear-gradient(135deg, #be185d, #1e1b4b)', desc: '桃花漫天的上古妖灵福地，藏有无数金丹灵果与秘宝。' },
  { id: 'w_qixia',    tier: '人界', name: '栖霞大陆', icon: '🌅', reqRealm: 4,  reqAscend: false, stoneMult: 55,    qiBase: 240,    chestRate: 0.055, gradient: 'linear-gradient(135deg, #c2410c, #1c1917)', desc: '晚霞长明、紫气东来，化神大能在此感悟法则、开宗立派。' },
  { id: 'w_kunlun',   tier: '人界', name: '昆仑神州', icon: '🏔️', reqRealm: 6,  reqAscend: false, stoneMult: 260,   qiBase: 1400,   chestRate: 0.06,  gradient: 'linear-gradient(135deg, #1d4ed8, #090d16)', desc: '人界万山之祖，龙脉汇聚之地，乃合体大乘修士闭关圣地。' },
  { id: 'w_guixu',    tier: '人界', name: '归墟大陆', icon: '🌊', reqRealm: 8,  reqAscend: false, stoneMult: 1400,  qiBase: 8500,   chestRate: 0.065, gradient: 'linear-gradient(135deg, #4338ca, #09090b)', desc: '四海尽头、天劫汇聚之地，渡劫强者于此静候天门大开。' },
  // 仙界六域
  { id: 'w_penglai',  tier: '仙界', name: '蓬莱仙域', icon: '🏝️', reqRealm: 9,  reqAscend: true,  stoneMult: 8000,  qiBase: 45000,  chestRate: 0.07,  gradient: 'linear-gradient(135deg, #0d9488, #312e81)', desc: '仙界初入之境，仙鹤齐鸣，仙灵之气浓稠如雾。' },
  { id: 'w_qionghua', tier: '仙界', name: '琼华仙域', icon: '🏯', reqRealm: 11, reqAscend: true,  stoneMult: 48000, qiBase: 280000, chestRate: 0.075, gradient: 'linear-gradient(135deg, #7c3aed, #1e1b4b)', desc: '琼楼玉宇悬浮九霄，天仙真仙云集论道之所。' },
  { id: 'w_ziwei',    tier: '仙界', name: '紫微星域', icon: '✨', reqRealm: 13, reqAscend: true,  stoneMult: 3.0e5, qiBase: 1.8e6,  chestRate: 0.08,  gradient: 'linear-gradient(135deg, #6d28d9, #09090b)', desc: '群星拱卫帝星，玄仙金仙汲取星辰本源之地。' },
  { id: 'w_honghuang',tier: '仙界', name: '洪荒古陆', icon: '🐉', reqRealm: 15, reqAscend: true,  stoneMult: 2.0e6, qiBase: 1.2e7,  chestRate: 0.085, gradient: 'linear-gradient(135deg, #b45309, #1c1917)', desc: '上古神兽遗迹遍布，太乙与大罗金仙争锋之古陆。' },
  { id: 'w_xiuluo',   tier: '仙界', name: '修罗血域', icon: '🔥', reqRealm: 17, reqAscend: true,  stoneMult: 1.5e7, qiBase: 8.5e7,  chestRate: 0.09,  gradient: 'linear-gradient(135deg, #991b1b, #09090b)', desc: '杀伐法则弥漫的凶险古域，唯准圣圣人可在此掠夺无尽资源。' },
  { id: 'w_taichu',   tier: '至高', name: '太初界域', icon: '🌀', reqRealm: 19, reqAscend: true,  stoneMult: 1.2e8, qiBase: 6.5e8,  chestRate: 0.10,  gradient: 'linear-gradient(135deg, #9333ea, #0284c7, #09090b)', desc: '混沌初开之地，鸿蒙紫气升腾，道祖与界尊俯瞰诸天之巅。' }
];

// 本命法宝（12阶 — 核心战力与修炼加速来源，不换法宝几乎无法跨越后续大境界）
const ARTIFACTS = [
  { id: 'art_0',  name: '木灵剑',     reqRealm: 0,  cost: 0,      qiMult: 1.0,  stoneMult: 1.0,  cdCut: 0 },
  { id: 'art_1',  name: '青锋灵剑',   reqRealm: 0,  cost: 550,    qiMult: 1.45, stoneMult: 1.4,  cdCut: 0.05 },
  { id: 'art_2',  name: '玄铁飞剑',   reqRealm: 1,  cost: 5500,   qiMult: 2.3,  stoneMult: 2.2,  cdCut: 0.12 },
  { id: 'art_3',  name: '赤炎金丹炉', reqRealm: 2,  cost: 48000,  qiMult: 3.8,  stoneMult: 3.5,  cdCut: 0.18 },
  { id: 'art_4',  name: '紫金葫芦',   reqRealm: 3,  cost: 4.5e5,  qiMult: 6.2,  stoneMult: 5.8,  cdCut: 0.24 },
  { id: 'art_5',  name: '乾坤阴阳镜', reqRealm: 4,  cost: 4.2e6,  qiMult: 10.0, stoneMult: 9.5,  cdCut: 0.30 },
  { id: 'art_6',  name: '九霄雷神戟', reqRealm: 6,  cost: 1.4e8,  qiMult: 18.0, stoneMult: 17.0, cdCut: 0.38 },
  { id: 'art_7',  name: '诛仙古剑',   reqRealm: 8,  cost: 5.5e9,  qiMult: 34.0, stoneMult: 32.0, cdCut: 0.46 },
  { id: 'art_8',  name: '太极仙图',   reqRealm: 10, cost: 2.8e11, qiMult: 68.0, stoneMult: 64.0, cdCut: 0.54 },
  { id: 'art_9',  name: '东皇混沌钟', reqRealm: 13, cost: 2.5e13, qiMult: 145.0,stoneMult: 135.0,cdCut: 0.62 },
  { id: 'art_10', name: '开天盘古斧', reqRealm: 16, cost: 3.5e15, qiMult: 320.0,stoneMult: 300.0,cdCut: 0.70 },
  { id: 'art_11', name: '鸿蒙造化玉', reqRealm: 19, cost: 8.0e17, qiMult: 750.0,stoneMult: 700.0,cdCut: 0.80 }
];

// 辅助丹药（消耗品，轮回时重置）
const PILLS = [
  { id: 'p_qi',      name: '聚气丹',   reqRealm: 0,  cost: 30,       qiMult: 1.40, stoneMult: 1.15, desc: '1.40x 吐纳修为，+15% 灵石（每颗消耗 1 次吐纳）。' },
  { id: 'p_zhuji',   name: '筑基灵液', reqRealm: 1,  cost: 180,      qiMult: 1.75, stoneMult: 1.30, desc: '1.75x 吐纳修为，1.30x 灵石。' },
  { id: 'p_jindan',  name: '凝金丹',   reqRealm: 2,  cost: 1100,     qiMult: 2.15, stoneMult: 1.55, desc: '2.15x 吐纳修为，1.55x 灵石。' },
  { id: 'p_yuanying',name: '蕴婴仙丹', reqRealm: 4,  cost: 15000,    qiMult: 2.70, stoneMult: 1.95, desc: '2.70x 吐纳修为，1.95x 灵石。' },
  { id: 'p_xian',    name: '九转金丹', reqRealm: 9,  cost: 650000,   qiMult: 3.60, stoneMult: 2.60, desc: '3.60x 仙灵修为，2.60x 灵石。' },
  { id: 'p_hong',    name: '鸿蒙道丹', reqRealm: 15, cost: 4.5e7,    qiMult: 5.20, stoneMult: 3.80, desc: '5.20x 至高修为，3.80x 灵石。' }
];

// 轮回神通（消耗轮回道果，永久保留，线性成长防爆炸）
const KARMA_PERKS = [
  { id: 'k_qi',    name: '宿慧觉醒', baseCost: 1, scale: 1.75, maxLv: 25, desc: '永久 +15% 吐纳修为（线性叠加）。' },
  { id: 'k_stone', name: '聚宝仙瞳', baseCost: 1, scale: 1.75, maxLv: 25, desc: '永久 +20% 灵石与秘宝产出。' },
  { id: 'k_speed', name: '缩地成寸', baseCost: 2, scale: 2.1,  maxLv: 6,  desc: '永久降低调息下限 -0.06s（最低可至 0.24s）。' },
  { id: 'k_jade',  name: '仙缘庇佑', baseCost: 2, scale: 1.9,  maxLv: 15, desc: '永久 +15% 仙玉获取与机缘秘宝掉率。' },
  { id: 'k_luck',  name: '天道气运', baseCost: 2, scale: 1.95, maxLv: 15, desc: '永久 +25% 宝物与先天至宝掉落概率。' }
];

// ==================== 12 大上古灵宠（与至宝相同：吐纳与开秘宝随机结缘，重复结缘自动升级，不可购买！） ====================
const PET_MAX_LEVEL = 100;

const PET_TIERS = [
  { id: 'lingshou',  name: '灵兽',           baseRate: 0.011,    expMult: 1.0, maxJadeReward: 5,  badgeCls: 'bg-slate-500/25 text-slate-200 border-slate-400/40',     cardCls: 'border-slate-700 bg-xian-850', desc: '山林灵脉孕育的通灵异兽，初入仙途便有缘遇见。' },
  { id: 'sixiang',   name: '四象圣兽',       baseRate: 0.0024,   expMult: 1.6, maxJadeReward: 15, badgeCls: 'bg-teal-500/25 text-teal-200 border-teal-400/50',        cardCls: 'border-teal-500/45 bg-teal-950/25', desc: '镇守四极的青龙、白虎、朱雀、玄龟圣兽，机缘难得。' },
  { id: 'ruishou',   name: '上古瑞兽 / 凶兽', baseRate: 0.00045,  expMult: 2.4, maxJadeReward: 35, badgeCls: 'bg-amber-500/25 text-amber-200 border-amber-400/50',     cardCls: 'border-amber-500/50 bg-amber-950/25', desc: '太古传说的祥瑞与凶兽，结缘后带来惊人气运与资源掠夺！' },
  { id: 'honghuang', name: '洪荒 / 太初神兽', baseRate: 0.000045, expMult: 3.5, maxJadeReward: 80, badgeCls: 'bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/60', cardCls: 'border-fuchsia-400/60 bg-gradient-to-br from-fuchsia-950/55 via-amber-950/35 to-indigo-950/55', desc: '开天时代的无上神兽，全境全图极低概率结缘认主！' }
];

const SPIRIT_PETS = [
  // 灵兽
  { id: 'pet_fox',      tierId: 'lingshou',  tier: '灵兽',     name: '青丘灵狐', icon: '🦊', qiPerLv: 0.04, stonePerLv: 0.08, jadePerLv: 0.04, luckPerLv: 0.06, critAdd: 0,     btAdd: 0,     cdCut: 0,    desc: '通灵白狐，嗅觉敏锐，最擅寻觅遗落法器与灵石矿脉。' },
  { id: 'pet_lion',     tierId: 'lingshou',  tier: '灵兽',     name: '烈焰金狮', icon: '🦁', qiPerLv: 0.08, stonePerLv: 0.07, jadePerLv: 0.02, luckPerLv: 0.03, critAdd: 0.01,  btAdd: 0,     cdCut: 0,    desc: '身披阳火的威猛妖兽，咆哮间可震散灵气杂质，加速修为吐纳。' },
  { id: 'pet_jiaolong', tierId: 'lingshou',  tier: '灵兽',     name: '碧水蛟龙', icon: '🐍', qiPerLv: 0.10, stonePerLv: 0.09, jadePerLv: 0.07, luckPerLv: 0.05, critAdd: 0,     btAdd: 0.005, cdCut: 0,    desc: '潜渊化蛟，身怀一丝真龙血脉，聚水行灵气滋养丹田。' },
  // 四象圣兽
  { id: 'pet_xuangui',  tierId: 'sixiang',   tier: '四象圣兽', name: '北方玄龟', icon: '🐢', qiPerLv: 0.09, stonePerLv: 0.14, jadePerLv: 0.08, luckPerLv: 0.07, critAdd: 0,     btAdd: 0.015, cdCut: 0,    desc: '玄武圣兽，负碑镇海，护佑道心稳固，额外提升破境成功率。' },
  { id: 'pet_baihu',    tierId: 'sixiang',   tier: '四象圣兽', name: '西方白虎', icon: '🐯', qiPerLv: 0.14, stonePerLv: 0.12, jadePerLv: 0.06, luckPerLv: 0.06, critAdd: 0.03,  btAdd: 0.01,  cdCut: 0,    desc: '主掌庚金杀伐，助修士斩破心魔，显著提升顿悟暴击率。' },
  { id: 'pet_zhuque',   tierId: 'sixiang',   tier: '四象圣兽', name: '南方朱雀', icon: '🐦‍🔥', qiPerLv: 0.16, stonePerLv: 0.14, jadePerLv: 0.15, luckPerLv: 0.08, critAdd: 0.015, btAdd: 0.015, cdCut: 0,    desc: '浴火重生的离火圣禽，仙焰淬炼神魂，大幅提升修为与仙玉。' },
  { id: 'pet_qinglong', tierId: 'sixiang',   tier: '四象圣兽', name: '东方青龙', icon: '🐉', qiPerLv: 0.20, stonePerLv: 0.18, jadePerLv: 0.16, luckPerLv: 0.12, critAdd: 0.01,  btAdd: 0.02,  cdCut: 0.03, desc: '青龙行云布雨，生机盎然，全面强化修为、灵石、仙玉与寻宝气运！' },
  // 上古瑞兽 / 凶兽
  { id: 'pet_ninefox',  tierId: 'ruishou',   tier: '上古瑞兽', name: '九尾天狐', icon: '🦊', qiPerLv: 0.15, stonePerLv: 0.16, jadePerLv: 0.24, luckPerLv: 0.22, critAdd: 0.015, btAdd: 0.015, cdCut: 0,    desc: '九尾通天，天生大气运傍身，大幅提高各类古宝与仙器掉率！' },
  { id: 'pet_qilin',    tierId: 'ruishou',   tier: '上古瑞兽', name: '祥瑞麒麟', icon: '🦌', qiPerLv: 0.22, stonePerLv: 0.22, jadePerLv: 0.22, luckPerLv: 0.26, critAdd: 0,     btAdd: 0.03,  cdCut: 0,    desc: '万兽祥瑞之主，踏云而来，极大幅度增幅寻宝气运与破境机缘。' },
  { id: 'pet_taotie',   tierId: 'ruishou',   tier: '上古凶兽', name: '上古饕餮', icon: '👹', qiPerLv: 0.25, stonePerLv: 0.42, jadePerLv: 0.26, luckPerLv: 0.18, critAdd: 0.025, btAdd: 0.015, cdCut: 0,    desc: '吞噬天地灵脉的太古凶兽，为主人疯狂掠夺海量灵石与秘宝！' },
  // 洪荒 / 太初神兽
  { id: 'pet_kunpeng',  tierId: 'honghuang', tier: '洪荒神兽', name: '扶摇鲲鹏', icon: '🦅', qiPerLv: 0.36, stonePerLv: 0.32, jadePerLv: 0.28, luckPerLv: 0.24, critAdd: 0.02,  btAdd: 0.025, cdCut: 0.08, desc: '扶摇直上九万里，缩减调息时间并带来惊人的修为与气运加成。' },
  { id: 'pet_zulong',   tierId: 'honghuang', tier: '太初祖兽', name: '太初祖龙', icon: '🐲', qiPerLv: 0.55, stonePerLv: 0.55, jadePerLv: 0.45, luckPerLv: 0.35, critAdd: 0.03,  btAdd: 0.05,  cdCut: 0.10, desc: '万龙之祖，洪荒霸主！全维度逆天加持，寻宝与破境皆如天助！' }
];

// 提升灵宠结缘概率的奇物（不直接买灵宠，只提高遇见上古神兽的机缘）
const PET_LUCK_UPGRADES = [
  { id: 'plu_incense', name: '聚灵引兽香', currency: 'stones', baseCost: 1200,   scale: 1.88, maxLv: 30, luckPerLv: 0.12, resetOnPrestige: true,  desc: '燃起灵兽喜爱的奇香，每级 +12% 灵宠结缘概率（消耗灵石，轮回重置）。' },
  { id: 'plu_bell',    name: '上古驭兽铃', currency: 'jade',   baseCost: 14,     scale: 1.72, maxLv: 25, luckPerLv: 0.22, resetOnPrestige: false, desc: '摇动仙铃呼唤异兽，每级永久 +22% 灵宠结缘概率（消耗仙玉，轮回永久保留）。' },
  { id: 'plu_altar',   name: '万兽招灵坛', currency: 'stones', baseCost: 280000, scale: 2.05, maxLv: 20, luckPerLv: 0.25, resetOnPrestige: true,  desc: '筑起招灵古坛，每级 +25% 灵宠结缘概率（消耗灵石，轮回重置）。' }
];

// ==================== 宝物品阶划分（含三大先天至宝） ====================
// 重复获得自动升级（三大先天至宝唯一获取无需升级，全境界全界域极低概率掉落）
const RELIC_TIERS = [
  { id: 'faqi',    name: '法器',           baseRate: 0.014,    badgeCls: 'bg-slate-500/25 text-slate-200 border-slate-400/40',     cardCls: 'border-slate-700 bg-xian-850', desc: '最低阶修炼辅助工具，蕴含微弱灵气，多为炼气期修士使用。' },
  { id: 'lingqi',  name: '灵器 / 宝器',    baseRate: 0.0042,   badgeCls: 'bg-sky-500/25 text-sky-200 border-sky-400/45',           cardCls: 'border-sky-500/40 bg-sky-950/25', desc: '具备一定灵性，刻有阵法禁制，筑基至金丹期主力灵物。' },
  { id: 'fabao',   name: '法宝',           baseRate: 0.0011,   badgeCls: 'bg-violet-500/25 text-violet-200 border-violet-400/45',  cardCls: 'border-violet-500/45 bg-violet-950/25', desc: '可收入体内温养，威力巨大，元婴及以上方能发挥威能。' },
  { id: 'lingbao', name: '通天灵宝 / 古宝', baseRate: 0.00022,  badgeCls: 'bg-amber-500/25 text-amber-200 border-amber-400/50',     cardCls: 'border-amber-500/50 bg-amber-950/25', desc: '蕴含法则之力与器灵，足以成为宗门镇派之宝。' },
  { id: 'xianqi',  name: '仙器 / 神器',    baseRate: 0.000035, badgeCls: 'bg-rose-500/25 text-rose-200 border-rose-400/60',        cardCls: 'border-rose-500/55 bg-rose-950/30', desc: '超越凡俗界限，具备毁天灭地之能，掉率极其稀少！' },
  { id: 'supreme', name: '先天至宝',       baseRate: 0.0000008,badgeCls: 'bg-gradient-to-r from-amber-400/35 to-fuchsia-500/35 text-amber-100 border-amber-300', cardCls: 'border-amber-300/80 bg-gradient-to-br from-fuchsia-950/60 via-amber-950/40 to-indigo-950/60', desc: '开天辟地孕育的无上至宝，全境界全界域皆可掉落，唯一获取无需升级！' }
];

const RELICS = [
  // 法器（低阶）
  { id: 'r_fq_1', tier: 'faqi',    name: '聚灵玉佩',     icon: '📿', qiPerLv: 0.03, stonePerLv: 0,    jadePerLv: 0,    luckPerLv: 0,    btPerLv: 0,     critPerLv: 0,     desc: '温润灵玉佩，每级 +3% 吐纳修为。' },
  { id: 'r_fq_2', tier: 'faqi',    name: '纳石乾坤袋',   icon: '👝', qiPerLv: 0,    stonePerLv: 0.05, jadePerLv: 0,    luckPerLv: 0,    btPerLv: 0,     critPerLv: 0,     desc: '简易储物袋，每级 +5% 灵石产出。' },
  { id: 'r_fq_3', tier: 'faqi',    name: '寻灵罗盘残片', icon: '🧭', qiPerLv: 0,    stonePerLv: 0,    jadePerLv: 0,    luckPerLv: 0.04, btPerLv: 0,     critPerLv: 0,     desc: '指引微弱灵机，每级 +4% 宝物掉率。' },
  // 灵器 / 宝器
  { id: 'r_lq_1', tier: 'lingqi',  name: '碧玉净瓶',     icon: '🏺', qiPerLv: 0.07, stonePerLv: 0,    jadePerLv: 0.06, luckPerLv: 0,    btPerLv: 0,     critPerLv: 0,     desc: '蕴藏甘露灵液，每级 +7% 修为、+6% 仙玉。' },
  { id: 'r_lq_2', tier: 'lingqi',  name: '离火灵幡',     icon: '🚩', qiPerLv: 0,    stonePerLv: 0.10, jadePerLv: 0,    luckPerLv: 0,    btPerLv: 0,     critPerLv: 0.004, desc: '铭刻离火禁制，每级 +10% 灵石、+0.4% 顿悟暴击率。' },
  { id: 'r_lq_3', tier: 'lingqi',  name: '玄冰明镜',     icon: '🪞', qiPerLv: 0.05, stonePerLv: 0,    jadePerLv: 0,    luckPerLv: 0.09, btPerLv: 0,     critPerLv: 0,     desc: '照见隐秘灵物，每级 +9% 宝物掉率、+5% 修为。' },
  // 法宝
  { id: 'r_fb_1', tier: 'fabao',   name: '混元金斗',     icon: '⚱️', qiPerLv: 0,    stonePerLv: 0.18, jadePerLv: 0.14, luckPerLv: 0,    btPerLv: 0,     critPerLv: 0,     desc: '收纳天地灵财，每级 +18% 灵石、+14% 仙玉。' },
  { id: 'r_fb_2', tier: 'fabao',   name: '番天宝印',     icon: '🗿', qiPerLv: 0.16, stonePerLv: 0,    jadePerLv: 0,    luckPerLv: 0,    btPerLv: 0.004, critPerLv: 0,     desc: '重若不周山，每级 +16% 修为、+0.4% 破境成功率。' },
  { id: 'r_fb_3', tier: 'fabao',   name: '山河社稷残卷', icon: '📜', qiPerLv: 0.08, stonePerLv: 0.10, jadePerLv: 0,    luckPerLv: 0.16, btPerLv: 0,     critPerLv: 0,     desc: '内蕴山河气运，每级 +16% 宝物掉率、+8% 修为、+10% 灵石。' },
  // 通天灵宝 / 古宝
  { id: 'r_lb_1', tier: 'lingbao', name: '乾坤造化鼎',   icon: '🫕', qiPerLv: 0.30, stonePerLv: 0.32, jadePerLv: 0.25, luckPerLv: 0,    btPerLv: 0,     critPerLv: 0,     desc: '器灵自生，炼化万物，每级 +30% 修为、+32% 灵石、+25% 仙玉。' },
  { id: 'r_lb_2', tier: 'lingbao', name: '诛仙剑阵图',   icon: '⚔️', qiPerLv: 0.38, stonePerLv: 0.20, jadePerLv: 0,    luckPerLv: 0,    btPerLv: 0,     critPerLv: 0.01,  desc: '非四圣不可破，每级 +38% 修为、+20% 灵石、+1% 暴击率。' },
  { id: 'r_lb_3', tier: 'lingbao', name: '太极两仪图',   icon: '☯️', qiPerLv: 0.22, stonePerLv: 0,    jadePerLv: 0.18, luckPerLv: 0.30, btPerLv: 0.008, critPerLv: 0,     desc: '定地水火风，每级 +30% 宝物掉率、+22% 修为、+0.8% 破境率。' },
  // 仙器 / 神器
  { id: 'r_xq_1', tier: 'xianqi',  name: '炼妖仙壶',     icon: '🫖', qiPerLv: 0.45, stonePerLv: 0.70, jadePerLv: 0.55, luckPerLv: 0.40, btPerLv: 0,     critPerLv: 0,     desc: '仙界神器，吞纳妖灵化为无尽资粮，每级 +70% 灵石、+55% 仙玉、+40% 宝物掉率！' },
  { id: 'r_xq_2', tier: 'xianqi',  name: '昊天仙塔',     icon: '🗼', qiPerLv: 0.85, stonePerLv: 0.45, jadePerLv: 0.35, luckPerLv: 0,    btPerLv: 0.015, critPerLv: 0,     desc: '镇压九霄仙气，每级 +85% 修为、+45% 灵石、+1.5% 破境成功率！' },
  { id: 'r_xq_3', tier: 'xianqi',  name: '东皇太一铃',   icon: '🎐', qiPerLv: 0.65, stonePerLv: 0.65, jadePerLv: 0.65, luckPerLv: 0.45, btPerLv: 0.01,  critPerLv: 0.015, desc: '铃音震碎诸天因果，全属性暴增并额外增幅轮回道果！', karmaPerLv: 0.18 },
  // 最高境界 · 三大先天至宝（唯一获取，不升级，全境全图极低概率掉落）
  { id: 'rel_yudie',   tier: 'supreme', unique: true, name: '造化玉碟', icon: '💠', qiMult: 3.5, stoneMult: 1.0, jadeMult: 1.5, karmaAdd: 0.5,  luckAdd: 0.80, btAdd: 0.15, critAdd: 0,    critMultAdd: 0,   cdCut: 0,    desc: '【唯一先天至宝】铭刻三千大道法则！永久 3.5x 吐纳修为、1.5x 仙玉、+15% 破境成功率、+80% 宝物掉率！' },
  { id: 'rel_hundun',  tier: 'supreme', unique: true, name: '混沌钟',   icon: '🔔', qiMult: 1.5, stoneMult: 4.0, jadeMult: 3.0, karmaAdd: 1.0,  luckAdd: 0.60, btAdd: 0.08, critAdd: 0,    critMultAdd: 0,   cdCut: 0.12, desc: '【唯一先天至宝】镇压鸿蒙气运！永久 4.0x 灵石、3.0x 仙玉、+100% 轮回道果、调息 -0.12s！' },
  { id: 'rel_kaitian', tier: 'supreme', unique: true, name: '开天斧',   icon: '🪓', qiMult: 3.0, stoneMult: 3.0, jadeMult: 1.0, karmaAdd: 0.5,  luckAdd: 0.50, btAdd: 0.10, critAdd: 0.15, critMultAdd: 0.8, cdCut: 0,    desc: '【唯一先天至宝】盘古开天无上杀伐至宝！永久 3.0x 修为与灵石、顿悟暴击率 +15%、暴击倍率额外 +0.8x！' }
];

// 提升获取宝物概率的专属升级
const LUCK_UPGRADES = [
  { id: 'lu_compass', name: '天机寻宝盘', currency: 'stones', baseCost: 1500,   scale: 1.88, maxLv: 30, luckPerLv: 0.12, resetOnPrestige: true,  desc: '每级 +12% 宝物掉落概率（消耗灵石，轮回重置）。' },
  { id: 'lu_eye',     name: '破妄寻宝瞳', currency: 'jade',   baseCost: 16,     scale: 1.72, maxLv: 25, luckPerLv: 0.22, resetOnPrestige: false, desc: '每级永久 +22% 宝物掉落概率（消耗仙玉，轮回永久保留）。' },
  { id: 'lu_array',   name: '聚运招宝阵', currency: 'stones', baseCost: 350000, scale: 2.05, maxLv: 20, luckPerLv: 0.25, resetOnPrestige: true,  desc: '布下聚运大阵，每级 +25% 宝物掉落概率（消耗灵石，轮回重置）。' }
];
