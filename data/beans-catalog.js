/**
 * 世界咖啡豆图鉴 · 珍藏单品豆数据目录（共 11 张）
 * 前 7 张：用户精选样板豆（100% 忠实保留原文产地故事、处理法、风味、物理指标与冲煮参数，支持 AI 高定分层覆写）
 * 后 4 张：跨洲风土基准豆（补齐非洲黑加仑、拉美黄波旁、亚太湿刨曼特宁与中国云南保山老铁皮卡）
 */

export const BEAN_CARDS = [
  // =========================================================================
  // 1. CA-01 巴拿马 翡翠庄园 绿标瑰夏（用户样板 · 旗舰首卡）
  // =========================================================================
  {
    id: 'ca-01-esmeralda-green',
    code: 'CA-01',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: true,
    title: '巴拿马 翡翠庄园 绿标瑰夏',
    subtitle: 'Hacienda La Esmeralda · Private Collection Washed Geisha',
    tagline: '瑰夏传奇的正统名庄出品，每一口都是 BOP 冠军庄园的功力。',
    tags: ['巴拿马', '翡翠庄园', '绿标', '瑰夏', '水洗', '880g/L', '10.8%含水率', 'BOP名庄'],
    relatedCardIds: [
      'af-04-gori-natural',
      'af-05-kaffa-washed',
      'vr-01-geisha',
      'rg-06-geisha-migration',
      'ta-02-grading-physics',
    ],
    origin: {
      continent: '拉丁美洲',
      country: '巴拿马',
      region: '波奎特 · 巴鲁火山 (Boquete, Volcán Barú)',
      estate: '翡翠庄园（哈拉米约 / 坎纳斯维迪斯 / 面纱三大地块）',
      altitude: '1600-1800m',
      grade: '绿标 Private Collection',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Geisha',
    },
    processing: {
      category: 'washed',
      name: '经典水洗 (Washed)',
      detail:
        '严谨控制发酵与山泉水洗净，最大限度凸显巴拿马高地瑰夏明亮华丽的玫瑰花香与清透柑橘调，是翡翠庄园最具代表性的经典珍藏批次。',
    },
    roast: {
      label: '浅中度',
      scale: 'Moderately Light',
      agtron: '60-68（豆粉 70-78）',
      colorHex: '#8C582F',
      position01: 0.34,
    },
    physics: {
      moisturePct: 10.8,
      densityGl: 880,
      waterActivity: 0.56,
      note: '实测含水率 10.8%（黄金窗 10.5-12.0%），堆积密度 880g/L（极高海拔紧实硬豆）',
    },
    sensory: {
      flavors: ['玫瑰花香', '黑莓', '菠萝', '柑橘'],
      tastingNotes:
        '瑰夏传奇的正统名庄出品——玫瑰花香开瓶即见，黑莓与菠萝的热带果汁感饱满明亮，柑橘酸质优雅收束，每一口都是 BOP 冠军庄园的功力。',
      radar6D: {
        floralFruity: 5.0,
        acidity: 4.7,
        sweetness: 4.4,
        body: 3.4,
        cleanliness: 4.8,
        aftertaste: 4.8,
      },
    },
    narrative: {
      originStory:
        '翡翠庄园坐落于巴拿马波奎特巴鲁火山山坡，1964 年由彼得森（Peterson）家族购入；2004 年庄园以瑰夏一举夺得最佳巴拿马（BOP）大赛冠军并震撼全球，瑰夏从此名扬世界。',
      cultivationHarvest:
        '绿标（Private Collection）甄选采收自哈拉米约（Jaramillo）、坎纳斯维迪斯（Cañas Verdes）、面纱（El Velo）三大名优地块 1600–1800m 的瑰夏，常年云雾遮荫、全手工精细采收。',
      recommendedScenarios:
        '手冲细品，92℃ 水温最能还原花香层次；送礼或犒赏自己，名庄绿标是硬通货。',
    },
    brewing: {
      method: '手冲热饮',
      grindSize: '中细研磨',
      waterTempC: 92,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '手冲中细研磨，92℃ 水温，粉水比 1:15，三段式萃取约 2 分钟。',
      steps: [
        { stage: '一段 · 闷蒸唤醒', target: '0:00–0:30 · 注水至 30g', note: '中心细水流均匀润湿粉床，唤醒玫瑰花香与柑橘挥发物。' },
        { stage: '二段 · 花果萃取', target: '0:30–1:05 · 绕圈注水至 125g', note: '稳定小绕圈拉出黑莓与菠萝饱满果汁甜感，保持液面均衡。' },
        { stage: '三段 · 清透收尾', target: '1:05–2:00 · 柔水补至 225g', note: '1:45 左右收水、2:00 滴滤完成，锁住优雅丝滑的茶感尾韵。' },
      ],
    },
    visual: {
      rarity: 'legendary',
      defaultFinish: 'gold',
      foilStrength: 0.68,
      palette: {
        primary: '#0F5C42',
        secondary: '#D9B664',
        accent: '#D4627B',
        bgTop: '#0A2A20',
        bgBottom: '#164A37',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'volcano',
        subjectMotif: 'esmeralda_crest',
        effectParticles: ['rose_petal', 'citrus_spark', 'gold_dust'],
        lineartPattern: 'contour_botanical',
        heroDir: 'ca-01-esmeralda-green',
      },
      depths: {
        subjectDepth: 0.36,
        effectsDepth: 0.52,
        backgroundDepth: -0.25,
        subjectScale: 1.1,
      },
    },
  },

  // =========================================================================
  // 2. SA-01 哥伦比亚 玛卡瑞纳地块 朗姆酒桶发酵（用户样板）
  // =========================================================================
  {
    id: 'sa-01-macarena-rum',
    code: 'SA-01',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: true,
    title: '哥伦比亚 玛卡瑞纳地块 朗姆酒桶发酵',
    subtitle: 'Colombia Macarena Lot · Aged Rum Barrel Fermentation',
    tagline: '橡木桶里的慢时光——开袋即是朗姆酒与橡木的微醺灵魂香气。',
    tags: ['哥伦比亚', '玛卡瑞纳', '朗姆酒桶', '过桶发酵', 'City烘焙', '酒香', '红樱桃'],
    relatedCardIds: [
      'sa-02-baishan-n2',
      'af-03-gelana-coferm',
      'pr-02-experimental-ferm',
      'pr-03-roast-agtron',
      'rg-03-latin-america',
    ],
    origin: {
      continent: '拉丁美洲',
      country: '哥伦比亚',
      region: '安第斯高地火山产区',
      estate: '玛卡瑞纳地块 (Macarena Lot)',
      altitude: '1950m',
      grade: '国际高分创新微批次',
      harvestSeason: '当季微批次',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Arabica 精选微批次',
    },
    processing: {
      category: 'barrel_aged',
      name: '朗姆酒桶发酵 (Barrel-Aged)',
      detail:
        '朗姆酒桶发酵——水洗后的咖啡生豆放入陈年朗姆酒橡木桶中低温静置发酵，每日翻动、定期取样，使豆粒均匀吸附橡木与陈年朗姆酒香。',
    },
    roast: {
      label: 'City',
      scale: 'City · 中度烘焙',
      agtron: '48-55（豆粉 58-65）',
      colorHex: '#5C3419',
      position01: 0.62,
    },
    physics: null,
    sensory: {
      flavors: ['红樱桃', '朗姆酒', '橡木', '甘草', '青提', '可可碎'],
      tastingNotes:
        '朗姆酒桶赋予的灵魂香气——开袋即是朗姆酒与橡木的醇厚酒香，入口红樱桃与青提的果酸明亮，甘草与可可碎余韵收尾。',
      radar6D: {
        floralFruity: 4.0,
        acidity: 3.4,
        sweetness: 4.4,
        body: 4.6,
        cleanliness: 3.6,
        aftertaste: 4.9,
      },
    },
    narrative: {
      originStory:
        '哥伦比亚高海拔精品微批次代表，以创新处理法屡获国际高分，展现出拉美精品咖啡突破传统风味边界的先锋创造力。',
      cultivationHarvest:
        '玛卡瑞纳地块 1950m 火山土壤，高海拔肥沃矿质土孕育扎实豆体，全产季人工采收全红成熟果。',
      recommendedScenarios:
        '手冲热饮酒香与橡木调最为深邃醇厚；急冷冰冲或搭配大冰球宛如一杯无酒精冷萃朗姆特调，亦适合做创意 Dirty 或微醺酒心拿铁基底。',
    },
    brewing: {
      method: '手冲热饮 / 冷萃',
      grindSize: '中研磨',
      waterTempC: 90,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '建议中研磨、88–90℃ 水温（柔化酒桶浓郁度并凸显红樱桃与青提明亮感），粉水比 1:15，三段式萃取约 2 分钟。',
      steps: [
        { stage: '一段 · 闷蒸醒酒', target: '0:00–0:30 · 注水至 30g', note: '89–90℃ 温润浸润，释放陈年朗姆与橡木内酯香气。' },
        { stage: '二段 · 果酸平衡', target: '0:30–1:05 · 绕圈注水至 125g', note: '中速绕圈提炼红樱桃与青提果酸，平衡酒体厚重感。' },
        { stage: '三段 · 可可收尾', target: '1:05–2:00 · 中心补水至 225g', note: '轻柔中心收水避免末段苦涩，保留甘草与可可碎绵长回甘。' },
      ],
    },
    visual: {
      rarity: 'legendary',
      defaultFinish: 'gold',
      foilStrength: 0.72,
      palette: {
        primary: '#5B1B24',
        secondary: '#D6A25E',
        accent: '#C0394D',
        bgTop: '#1E1310',
        bgBottom: '#4A1820',
        paperTint: '#F6EFE6',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'volcano',
        subjectMotif: 'rum_oak_barrel',
        effectParticles: ['amber_drop', 'cherry_spark', 'gold_dust'],
        lineartPattern: 'oak_rings_geometry',
        heroDir: 'sa-01-macarena-rum',
      },
      depths: {
        subjectDepth: 0.36,
        effectsDepth: 0.50,
        backgroundDepth: -0.25,
        subjectScale: 1.1,
      },
    },
  },

  // =========================================================================
  // 3. AF-04 埃塞俄比亚 戈里森林瑰夏 日晒 G1（用户样板）
  // =========================================================================
  {
    id: 'af-04-gori-natural',
    code: 'AF-04',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: true,
    title: '埃塞俄比亚 戈里森林瑰夏 日晒',
    subtitle: 'Ethiopia Bench Maji · Gori Gesha Forest G1 Natural',
    tagline: '森林瑰夏的野性表达——花香高扬、杏桃凤梨果汁感奔放如热带果茶。',
    tags: ['埃塞俄比亚', '戈里森林', '班奇马吉', '瑰夏', 'G1', '日晒', '热带果茶'],
    relatedCardIds: [
      'ca-01-esmeralda-green',
      'af-06-kaffa-natural',
      'vr-01-geisha',
      'rg-06-geisha-migration',
      'pr-01-classic-process',
    ],
    origin: {
      continent: '非洲',
      country: '埃塞俄比亚',
      region: 'Banchi Maji（班奇马吉 · 戈里森林）',
      estate: '戈里原始森林林荫产区',
      altitude: '1900-2100m（森林高地参考）',
      grade: 'G1',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Geisha',
    },
    processing: {
      category: 'natural',
      name: '日晒 (Natural)',
      detail:
        '日晒——整果置高架床缓慢晒干，果肉糖分充分回渗入豆芯，花香与热带水果调性更奔放浓郁。',
    },
    roast: {
      label: '浅中度',
      scale: 'Moderately Light',
      agtron: '60-68（豆粉 70-78）',
      colorHex: '#8C582F',
      position01: 0.34,
    },
    physics: null,
    sensory: {
      flavors: ['花香', '杏桃', '凤梨', '莓果'],
      tastingNotes:
        '森林瑰夏的野性表达——浅中度烘焙下花香高扬，杏桃与凤梨的甜润果汁感接踵而来，莓果尾韵活泼，整体如一杯带花香的热带果茶。',
      radar6D: {
        floralFruity: 4.8,
        acidity: 4.3,
        sweetness: 4.5,
        body: 3.6,
        cleanliness: 4.1,
        aftertaste: 4.5,
      },
    },
    narrative: {
      originStory:
        '戈里森林位于埃塞俄比亚西南部，是瑰夏种基因库般的原始森林地带，咖啡树在天然林荫下自然生长。',
      cultivationHarvest:
        '高地森林咖啡，当地农户于产季深入原始林地人工采收全红果，林荫散生生长，产量稀少。',
      recommendedScenarios:
        '手冲热饮花香最完整；做冰冲热带水果感更跳跃。',
    },
    brewing: {
      method: '手冲热饮 / 急冷冰冲',
      grindSize: '中细研磨',
      waterTempC: 91,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '手冲 91℃ 水温，粉水比例 1:15（粉量 15 克注水 225 克），三段式萃取时间约 2 分钟。',
      steps: [
        { stage: '一段 · 闷蒸释香', target: '0:00–0:30 · 注水至 30g', note: '91℃ 轻柔闷蒸，让森林野花香与日晒熟果甜韵充分舒展。' },
        { stage: '二段 · 热带果调', target: '0:30–1:05 · 绕圈注水至 125g', note: '均匀绕圈拉高甜度与杏桃凤梨果汁饱满度。' },
        { stage: '三段 · 莓果尾韵', target: '1:05–2:00 · 中心补水至 225g', note: '约 2:00 滴滤完成，中低温段莓果果茶感尤为跳跃。' },
      ],
    },
    visual: {
      rarity: 'rare',
      defaultFinish: 'gold',
      foilStrength: 0.62,
      palette: {
        primary: '#1F4A38',
        secondary: '#EB9B4E',
        accent: '#F3C853',
        bgTop: '#122C21',
        bgBottom: '#2B5B44',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'forest',
        subjectMotif: 'gori_cherry_branch',
        effectParticles: ['tropical_spark', 'flower_petal', 'gold_dust'],
        lineartPattern: 'contour_botanical',
        heroDir: 'af-04-gori-natural',
      },
      depths: {
        subjectDepth: 0.35,
        effectsDepth: 0.50,
        backgroundDepth: -0.25,
        subjectScale: 1.1,
      },
    },
  },

  // =========================================================================
  // 4. AF-05 卡法瑰夏 水洗（用户样板 · 与 AF-06 对偶对比卡 A）
  // =========================================================================
  {
    id: 'af-05-kaffa-washed',
    code: 'AF-05',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: true,
    title: '卡法瑰夏 水洗',
    subtitle: 'Ethiopia Kaffa Forest · Native Gesha Washed',
    tagline: '原生瑰夏的「素颜之美」——柑橘明亮、绿茶清润，与 AF-06 日晒一清一浓。',
    tags: ['埃塞俄比亚', '卡法森林', '原生瑰夏', '水洗', '绿茶', '柑橘', '双豆对比'],
    relatedCardIds: [
      'af-06-kaffa-natural',
      'ca-01-esmeralda-green',
      'vr-01-geisha',
      'pr-01-classic-process',
      'rg-02-africa',
    ],
    origin: {
      continent: '非洲',
      country: '埃塞俄比亚',
      region: 'Kaffa Forest（卡法森林）',
      estate: '卡法原始森林边缘微批次',
      altitude: '1900-1950m',
      grade: '原生微批次',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Geisha',
    },
    processing: {
      category: 'washed',
      name: '水洗 (Washed)',
      detail:
        '水洗——采用经典水洗工艺去除果肉与果胶，凸显原生瑰夏清澈的柑橘与绿茶调性，杯中干净度极佳。',
    },
    roast: {
      label: '中浅度',
      scale: 'Light-Medium',
      agtron: '62-70（豆粉 72-80）',
      colorHex: '#966337',
      position01: 0.28,
    },
    physics: null,
    sensory: {
      flavors: ['柑橘', '坚果', '绿茶', '焦糖'],
      tastingNotes:
        '原生瑰夏的「素颜之美」——不似巴拿马瑰夏的浓烈花香，卡法水洗更内敛：柑橘明亮、绿茶清润，坚果与焦糖温柔托底，耐喝不腻。',
      radar6D: {
        floralFruity: 3.9,
        acidity: 4.1,
        sweetness: 3.8,
        body: 2.8,
        cleanliness: 4.7,
        aftertaste: 3.9,
      },
    },
    narrative: {
      originStory:
        '卡法森林是瑰夏种的原生故乡，1930 年代瑰夏正是从这里远赴巴拿马并最终名震世界；这里的 Gesha 至今保持着最原始的基因表达。',
      cultivationHarvest:
        '1900–1950m 原始森林边缘地块，当地农户精挑细选人工采收全红果。',
      recommendedScenarios:
        '手冲热饮细品原产地风土；与 AF-06 卡法日晒对比冲煮，一清一浓更有趣。',
    },
    brewing: {
      method: '手冲热饮',
      grindSize: '中细研磨',
      waterTempC: 92,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '手冲中细研磨，92℃ 水温，粉水比 1:15，三段式萃取约 2 分钟。',
      steps: [
        { stage: '一段 · 闷蒸舒展', target: '0:00–0:30 · 注水至 30g', note: '92℃ 均匀润湿粉层，引出清新柑橘与嫩绿茶香。' },
        { stage: '二段 · 澄澈甜感', target: '0:30–1:05 · 绕圈注水至 125g', note: '轻柔水流保持粉床平稳，避免过度搅动确保极高干净度。' },
        { stage: '三段 · 焦糖茶韵', target: '1:05–2:00 · 中心补水至 225g', note: '2:00 滴完，温凉之后绿茶回甘与坚果焦糖感更显细腻。' },
      ],
    },
    visual: {
      rarity: 'classic',
      defaultFinish: 'original',
      foilStrength: 0.28,
      palette: {
        primary: '#4E7A5B',
        secondary: '#D9AE54',
        accent: '#6E9A74',
        bgTop: '#1D3326',
        bgBottom: '#355742',
        paperTint: '#F4F0E6',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'forest',
        subjectMotif: 'kaffa_tea_leaf',
        effectParticles: ['tea_mist', 'citrus_spark', 'dew_drop'],
        lineartPattern: 'contour_botanical',
        heroDir: 'af-05-kaffa-washed',
      },
      depths: {
        subjectDepth: 0.34,
        effectsDepth: 0.48,
        backgroundDepth: -0.24,
        subjectScale: 1.08,
      },
    },
  },

  // =========================================================================
  // 5. AF-06 埃塞俄比亚 卡法 瑰夏 G1 传统日晒（用户样板 · 与 AF-05 对偶对比卡 B）
  // =========================================================================
  {
    id: 'af-06-kaffa-natural',
    code: 'AF-06',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: true,
    title: '埃塞俄比亚 卡法 瑰夏 G1 传统日晒',
    subtitle: 'Ethiopia Kaffa · Native Geisha G1 Traditional Natural',
    tagline: '喝卡法瑰夏，就是喝瑰夏的「原产地风味」——蓝莓与无花果果汁感饱满不杂。',
    tags: ['埃塞俄比亚', '卡法', '瑰夏', 'G1', '传统日晒', '蓝莓', '无花果', '双豆对比'],
    relatedCardIds: [
      'af-05-kaffa-washed',
      'af-04-gori-natural',
      'pr-01-classic-process',
      'rg-06-geisha-migration',
      'ta-02-grading-physics',
    ],
    origin: {
      continent: '非洲',
      country: '埃塞俄比亚',
      region: '卡法 (Kaffa)',
      estate: '卡法原始高地林区',
      altitude: '1800-2100m',
      grade: 'G1',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Geisha',
    },
    processing: {
      category: 'natural',
      name: '传统日晒 (Natural)',
      detail:
        '传统日晒——将整颗成熟咖啡樱桃置于晒床缓慢干燥，果肉糖分充分渗入豆体，赋予咖啡饱满多汁的莓果与无花果调性。',
    },
    roast: {
      label: '浅度',
      scale: 'Light Roast',
      agtron: '68-75（豆粉 78-86）',
      colorHex: '#A87342',
      position01: 0.20,
    },
    physics: null,
    sensory: {
      flavors: ['蓝莓', '无花果', '李子', '榛子'],
      tastingNotes:
        '浅度烘焙放大了日晒的果香表现——开杯是蓝莓与无花果的果汁感，中段李子般的圆润酸甜，尾段榛子与焦糖收束，干净不杂。',
      radar6D: {
        floralFruity: 4.6,
        acidity: 4.4,
        sweetness: 4.4,
        body: 3.7,
        cleanliness: 4.2,
        aftertaste: 4.3,
      },
    },
    narrative: {
      originStory:
        '卡法是瑰夏种的发源地——1930 年代瑰夏正是从卡法森林被带往巴拿马，最终名震世界；喝卡法瑰夏，就是喝瑰夏的「原产地风味」。',
      cultivationHarvest:
        '产自 1800–2100m 卡法高地原生林区，成熟全红咖啡樱桃整果采收后直接进入高架晒床精细翻晒。',
      recommendedScenarios:
        '手冲热饮层次最完整；冰冲果汁感更活泼。强烈推荐与 AF-05 卡法瑰夏水洗同台对比冲煮，一清一浓感受处理法差异。',
    },
    brewing: {
      method: '手冲热饮 / 冰冲',
      grindSize: '中细研磨',
      waterTempC: 92,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '手冲 92℃ 水温，粉水比 1:15，三段式萃取约 2 分钟。',
      steps: [
        { stage: '一段 · 闷蒸开果', target: '0:00–0:30 · 注水至 30g', note: '92℃ 充分浸透浅烘豆粉，释放饱满蓝莓与熟无花果干香。' },
        { stage: '二段 · 果汁酸甜', target: '0:30–1:05 · 绕圈注水至 125g', note: '稳定小圈注水，突出中段熟李子圆润多汁的甜润度。' },
        { stage: '三段 · 榛果收束', target: '1:05–2:00 · 中心补水至 225g', note: '约 2:00 萃取结束，留下干净不杂的榛子与焦糖甜韵。' },
      ],
    },
    visual: {
      rarity: 'rare',
      defaultFinish: 'pearl',
      foilStrength: 0.60,
      palette: {
        primary: '#3C3066',
        secondary: '#C89B6E',
        accent: '#B75368',
        bgTop: '#1F1838',
        bgBottom: '#4E2A4A',
        paperTint: '#F6F1EA',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'highland',
        subjectMotif: 'kaffa_berry_fig',
        effectParticles: ['berry_glow', 'fig_spark', 'pearl_dust'],
        lineartPattern: 'flavor_wave_contour',
        heroDir: 'af-06-kaffa-natural',
      },
      depths: {
        subjectDepth: 0.35,
        effectsDepth: 0.50,
        backgroundDepth: -0.25,
        subjectScale: 1.1,
      },
    },
  },

  // =========================================================================
  // 6. AF-03 埃塞俄比亚 格拉纳瑰夏 共发酵水洗（用户样板）
  // =========================================================================
  {
    id: 'af-03-gelana-coferm',
    code: 'AF-03',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: true,
    title: '埃塞俄比亚 格拉纳瑰夏',
    subtitle: 'Ethiopia Yirgacheffe Gelana · Amba Marian Co-fermented Washed',
    tagline: '一杯「可以喝的甜品」——草莓奶糖与香草泡芙层层展开，做奶咖宛如草莓拿铁。',
    tags: ['埃塞俄比亚', '耶加雪菲', '格拉纳', '瑰夏', '共发酵水洗', 'High烘焙', '甜品奶甜'],
    relatedCardIds: [
      'sa-01-macarena-rum',
      'sa-02-baishan-n2',
      'pr-02-experimental-ferm',
      'pr-03-roast-agtron',
      'rg-02-africa',
    ],
    origin: {
      continent: '非洲',
      country: '埃塞俄比亚',
      region: '耶加雪菲 · 格拉纳 (Gelana)',
      estate: 'Amba Marian 处理厂',
      altitude: '1950-2300m',
      grade: '处理厂精选微批次',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Geisha',
    },
    processing: {
      category: 'co_fermented',
      name: '共发酵水洗 (Co-fermented Washed)',
      detail:
        '共发酵水洗——将咖啡鲜果与天然风味原料共同置于密闭环境发酵，定向酝酿出草莓奶糖与香草泡芙般的甜品调性，随后以水洗收尾去除杂味、保持极佳干净度。',
    },
    roast: {
      label: 'High',
      scale: 'High · 微中烘焙',
      agtron: '54-62（豆粉 64-72）',
      colorHex: '#734422',
      position01: 0.48,
    },
    physics: null,
    sensory: {
      flavors: ['草莓奶糖', '香草泡芙', '酸奶冰淇淋', '金朗姆酒'],
      tastingNotes:
        '一杯「可以喝的甜品」——草莓奶糖开场即甜，香草泡芙与酸奶冰淇淋的奶香层层展开，尾段金朗姆酒的微醺感点睛，是埃塞豆里极为少见的醇厚奶甜表现。',
      radar6D: {
        floralFruity: 4.7,
        acidity: 3.3,
        sweetness: 5.0,
        body: 4.3,
        cleanliness: 3.9,
        aftertaste: 4.6,
      },
    },
    narrative: {
      originStory:
        '格拉纳地处耶加雪菲与古姬交界，1950–2300m 的超高海拔让咖啡果得以极其缓慢地成熟，使糖分与风味前体物质高度浓缩。',
      cultivationHarvest:
        '由 Amba Marian 处理厂统一收购周边超高海拔小农的全红成熟果，严格分批进行精细化处理。',
      recommendedScenarios:
        '手冲热饮奶甜调最完整；做奶咖有惊喜，宛如一杯草莓拿铁。',
    },
    brewing: {
      method: '手冲热饮 / 奶咖',
      grindSize: '中细研磨',
      waterTempC: 92,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '手冲中细研磨，92℃ 水温，粉水比 1:15，三段式萃取约 2 分钟；做奶咖秒变草莓奶糖拿铁。',
      steps: [
        { stage: '一段 · 闷蒸奶香', target: '0:00–0:30 · 注水至 30g', note: '92℃ 均匀润湿，草莓奶糖与香草甜香即刻绽放。' },
        { stage: '二段 · 醇厚甜区', target: '0:30–1:05 · 绕圈注水至 125g', note: '稳健注水放大香草泡芙与酸奶冰淇淋的柔和乳酸触感。' },
        { stage: '三段 · 朗姆点睛', target: '1:05–2:00 · 中心补水至 225g', note: '2:00 收尾，保留干净边界与金朗姆酒微醺余韵。' },
      ],
    },
    visual: {
      rarity: 'rare',
      defaultFinish: 'pearl',
      foilStrength: 0.66,
      palette: {
        primary: '#B94A65',
        secondary: '#DFAA55',
        accent: '#E88B9C',
        bgTop: '#381724',
        bgBottom: '#6E2B41',
        paperTint: '#FAF1E2',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'highland',
        subjectMotif: 'gelana_dessert_cup',
        effectParticles: ['strawberry_mist', 'vanilla_pearl', 'gold_dust'],
        lineartPattern: 'patisserie_contour',
        heroDir: 'af-03-gelana-coferm',
      },
      depths: {
        subjectDepth: 0.36,
        effectsDepth: 0.52,
        backgroundDepth: -0.25,
        subjectScale: 1.1,
      },
    },
  },

  // =========================================================================
  // 7. SA-02 哥伦比亚 白山庄园 瑰夏 冷泉水氮气水洗（用户样板）
  // =========================================================================
  {
    id: 'sa-02-baishan-n2',
    code: 'SA-02',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: true,
    title: '哥伦比亚 白山庄园 瑰夏',
    subtitle: 'Colombia White Mountain · Cold Spring & Nitrogen Washed Geisha',
    tagline: '冷泉与氮气双重护航——洗出洋甘菊、佛手柑与高山清泉般的极致洁净。',
    tags: ['哥伦比亚', '白山庄园', '瑰夏', '冷泉水氮气水洗', '洋甘菊', '佛手柑', '极致干净'],
    relatedCardIds: [
      'ca-01-esmeralda-green',
      'sa-01-macarena-rum',
      'pr-02-experimental-ferm',
      'rg-03-latin-america',
      'vr-01-geisha',
    ],
    origin: {
      continent: '拉丁美洲',
      country: '哥伦比亚',
      region: '安第斯山脉高海拔产区',
      estate: '白山庄园',
      altitude: '1800-2100m',
      grade: '精品庄园批次',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Geisha',
    },
    processing: {
      category: 'nitrogen_cold',
      name: '冷泉水氮气水洗 (Nitrogen Cold Washed)',
      detail:
        '冷泉水氮气水洗——先以纯净的高山冷泉水清洗鲜果降温，再以惰性氮气置换发酵罐中氧气、低温精准控制发酵速率，最大程度锁住瑰夏精致的洋甘菊与佛手柑清雅花香，将干净度拉满。',
    },
    roast: {
      label: '浅中度',
      scale: 'Moderately Light · 推荐烘焙',
      agtron: '60-68（豆粉 70-78）',
      colorHex: '#8C582F',
      position01: 0.34,
    },
    physics: null,
    sensory: {
      flavors: ['洋甘菊', '柠檬', '佛手柑', '黄色花香', '柑橘'],
      tastingNotes:
        '冷泉水与氮气双重护航的「冷处理」工艺，把白山庄园瑰夏的花香洗得清澈透亮——入口是洋甘菊与黄色花香的优雅开场，中段柠檬、柑橘酸质明亮不刺，佛手柑香气贯穿始终，尾韵如高山清泉般干净。',
      radar6D: {
        floralFruity: 4.7,
        acidity: 4.6,
        sweetness: 4.0,
        body: 2.9,
        cleanliness: 5.0,
        aftertaste: 4.4,
      },
    },
    narrative: {
      originStory:
        '源自哥伦比亚安第斯山脉高海拔精品庄园，肥沃的火山灰土壤配合显著昼夜温差，让咖啡果在凉爽山风中缓慢成熟、积累充沛甜感。',
      cultivationHarvest:
        '种植于 1800–2100m 安第斯高山坡地，产季由熟练采摘工人工分批采收全红成熟果。',
      recommendedScenarios:
        '手冲热饮花香最扬；做冰手冲或冷萃，柑橘与佛手柑的清爽感更立体。',
    },
    brewing: {
      method: '手冲热饮 / 冰手冲 / 冷萃',
      grindSize: '中细研磨',
      waterTempC: 92,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '手冲中细研磨，92℃ 水温，粉水比 1:15，三段式萃取约 2 分钟；冰手冲或冷萃更显佛手柑清爽。',
      steps: [
        { stage: '一段 · 闷蒸锁花', target: '0:00–0:30 · 注水至 30g', note: '92℃ 轻柔浸润，释放洋甘菊与黄色花香前调。' },
        { stage: '二段 · 佛手柑段', target: '0:30–1:05 · 绕圈注水至 125g', note: '保持小水流均匀萃取柠檬与柑橘明亮清冽酸质。' },
        { stage: '三段 · 清泉尾韵', target: '1:05–2:00 · 中心补水至 225g', note: '约 2:00 滴滤完毕，感受 5.0 满分干净度的山泉甘甜。' },
      ],
    },
    visual: {
      rarity: 'rare',
      defaultFinish: 'silver',
      foilStrength: 0.70,
      palette: {
        primary: '#2A5366',
        secondary: '#F2CA50',
        accent: '#7AB3C4',
        bgTop: '#10222C',
        bgBottom: '#234557',
        paperTint: '#EDF4F7',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'highland',
        subjectMotif: 'baishan_cold_spring',
        effectParticles: ['nitrogen_bubble', 'chamomile_petal', 'silver_frost'],
        lineartPattern: 'crystal_contour',
        heroDir: 'sa-02-baishan-n2',
      },
      depths: {
        subjectDepth: 0.36,
        effectsDepth: 0.52,
        backgroundDepth: -0.25,
        subjectScale: 1.1,
      },
    },
  },

  // =========================================================================
  // 8. AF-01 肯尼亚 涅里 AA 双重水洗（跨洲风土基准豆 · 非洲黑加仑酸质标杆）
  // =========================================================================
  {
    id: 'af-01-kenya-nyeri-aa',
    code: 'AF-01',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: false,
    title: '肯尼亚 涅里 AA 双重水洗',
    subtitle: 'Kenya Nyeri AA · SL28 & SL34 Double Washed',
    tagline: '赤道火山红土与 SL28/SL34 碰撞出的风味核弹——黑加仑、血橙与鲜活果汁酸。',
    tags: ['肯尼亚', '涅里', 'AA', 'SL28', 'SL34', '双重水洗', '黑加仑', '高酸标杆'],
    relatedCardIds: [
      'vr-05-sl28-sl34',
      'rg-02-africa',
      'pr-01-classic-process',
      'ta-02-grading-physics',
      'sa-03-brazil-cerrado-yb',
    ],
    origin: {
      continent: '非洲',
      country: '肯尼亚',
      region: '涅里 (Nyeri · 肯尼亚火山南麓)',
      estate: '涅里高地小农合作社水洗处理站',
      altitude: '1700-2000m',
      grade: 'AA (17-18 目大粒硬豆)',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'SL28 / SL34',
    },
    processing: {
      category: 'washed',
      name: '肯尼亚式 72h 双重水洗',
      detail:
        '鲜果去皮后干式发酵 24–48 小时分解果胶，清水洗净后再置入纯净山泉水中二次冷浸泡 12–24 小时，极大稳定磷酸活力与黑加仑风味并提升干净度，随后铺于高架床缓慢日晒。',
    },
    roast: {
      label: '浅中度',
      scale: 'Moderately Light',
      agtron: '60-67（豆粉 70-77）',
      colorHex: '#8C582F',
      position01: 0.34,
    },
    physics: {
      moisturePct: 11.2,
      densityGl: 775,
      waterActivity: 0.55,
      note: '17–18 目饱满 AA 级颗粒，含磷火山红土赋予标志性磷酸跳跃张力',
    },
    sensory: {
      flavors: ['黑加仑', '血橙', '乌梅', '圣女果', '蔗糖'],
      tastingNotes:
        '肯尼亚高地最具辨识度的酸甜风暴——入口是奔放多汁的黑加仑与圣女果、乌梅酸质，血橙气息如气泡般在口腔跳跃，醇厚度如红酒般扎实，尾段转化出绵长清甜的蔗糖余韵。',
      radar6D: {
        floralFruity: 4.5,
        acidity: 5.0,
        sweetness: 4.3,
        body: 4.0,
        cleanliness: 4.6,
        aftertaste: 4.5,
      },
    },
    narrative: {
      originStory:
        '涅里坐落于赤道雪山肯尼亚火山（Mt. Kenya）南麓，深厚肥沃的含磷火山红土与冷凉夜温造就了世界顶级的酸性风土，与 1930 年代选育的 SL28/SL34 成就东非传奇。',
      cultivationHarvest:
        '周边小农于 1700–2000m 高海拔坡地精耕细作，主产季人工分批采摘全红成熟果送往合作社水洗站，并严格按筛网孔径精选出颗粒最饱满的 AA 级。',
      recommendedScenarios:
        '手冲热饮体验酸甜交织的饱满酒体；做成急冷冰手冲更像一杯冰镇黑加仑血橙汁，是夏日提神利器。',
    },
    brewing: {
      method: '手冲热饮 / 急冷冰手冲',
      grindSize: '中细研磨',
      waterTempC: 92,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:05',
      summary: '92℃ 水温充分激发甜感以平衡高酸，粉水比 1:15，三段式萃取约 2 分 05 秒。',
      steps: [
        { stage: '一段 · 充分闷蒸', target: '0:00–0:35 · 注水至 35g', note: '略微延长闷蒸排气，令高密 AA 豆芯充分吸水释放黑加仑香。' },
        { stage: '二段 · 提甜平衡', target: '0:35–1:15 · 绕圈注水至 135g', note: '稳健注水拉高蔗糖甜感与饱满果汁感，柔化尖锐感。' },
        { stage: '三段 · 乌梅余韵', target: '1:15–2:05 · 中心补水至 225g', note: '2:05 滴完，中温段血橙与乌梅酸甜立体爆发。' },
      ],
    },
    visual: {
      rarity: 'rare',
      defaultFinish: 'pearl',
      foilStrength: 0.56,
      palette: {
        primary: '#5C223B',
        secondary: '#E35D3B',
        accent: '#B5385A',
        bgTop: '#240E1A',
        bgBottom: '#4E1D33',
        paperTint: '#F6F0E8',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'volcano',
        subjectMotif: 'kenya_blackcurrant',
        effectParticles: ['berry_glow', 'citrus_spark', 'ruby_dust'],
        lineartPattern: 'contour_botanical',
        heroDir: 'af-01-kenya-nyeri-aa',
      },
      depths: {
        subjectDepth: 0.34,
        effectsDepth: 0.48,
        backgroundDepth: -0.25,
        subjectScale: 1.08,
      },
    },
  },

  // =========================================================================
  // 9. SA-03 巴西 喜拉多 黄波旁 日晒（跨洲风土基准豆 · 拉美坚果巧克力甜感标杆）
  // =========================================================================
  {
    id: 'sa-03-brazil-cerrado-yb',
    code: 'SA-03',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: false,
    title: '巴西 喜拉多 黄波旁 日晒',
    subtitle: 'Brazil Cerrado Mineiro · Yellow Bourbon Natural',
    tagline: '阳光酿出的经典坚果与牛奶巧克力——低酸圆润高甜，日常口粮与拼配基石。',
    tags: ['巴西', '喜拉多', '黄波旁', '日晒', '坚果', '牛奶巧克力', '低酸高甜'],
    relatedCardIds: [
      'vr-03-bourbon',
      'rg-03-latin-america',
      'pr-01-classic-process',
      'pr-03-roast-agtron',
      'af-01-kenya-nyeri-aa',
    ],
    origin: {
      continent: '拉丁美洲',
      country: '巴西',
      region: '米纳斯吉拉斯 · 喜拉多 (Cerrado Mineiro)',
      estate: '喜拉多高原精品庄园',
      altitude: '1050-1250m',
      grade: 'NY2 / Screen 17-18',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Yellow Bourbon',
    },
    processing: {
      category: 'natural',
      name: '高原日晒 (Natural)',
      detail:
        '依托喜拉多产区极度分明的旱季晴空与干燥微风，成熟呈金黄色的黄波旁整果铺展于阳光露台均匀慢晒 14–21 天，将波旁家族充沛的天然蔗糖与柔滑油脂圆润锁进豆芯。',
    },
    roast: {
      label: 'City',
      scale: 'City · 中度烘焙',
      agtron: '48-55（豆粉 58-65）',
      colorHex: '#5C3419',
      position01: 0.62,
    },
    physics: null,
    sensory: {
      flavors: ['烤榛果', '牛奶巧克力', '焦糖', '烤杏仁', '甜橙'],
      tastingNotes:
        '拉美高甜平衡美学的经典写照——酸质柔和含蓄，开杯即现浓郁烤榛果与烤杏仁香气，入口宛如顺滑牛奶巧克力与焦糖布丁，中温段闪现一抹清雅甜橙果韵，余韵温暖持久。',
      radar6D: {
        floralFruity: 2.6,
        acidity: 2.5,
        sweetness: 4.6,
        body: 4.3,
        cleanliness: 4.2,
        aftertaste: 3.8,
      },
    },
    narrative: {
      originStory:
        '喜拉多是巴西首个获得法定原产地名称保护（DO）的高原精品产区，广袤红壤台地与稳定的干湿季律动使其成为全球坚果巧克力风味与黄波旁日晒的黄金标杆。',
      cultivationHarvest:
        '在 1050–1250m 阳光充沛的高原台地集约精细栽培，采收期气候干爽少雨，令成熟黄波旁得以在枝头与晒场充分累积糖分、几乎无霉变瑕疵。',
      recommendedScenarios:
        '日常手冲百喝不腻的温暖口粮；同时也是制作意式浓缩、拿铁与澳白（Flat White）的完美高甜基底，配奶犹如融化的榛果巧克力。',
    },
    brewing: {
      method: '手冲热饮 / 意式奶咖',
      grindSize: '中研磨',
      waterTempC: 89,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '88–90℃ 温润手冲避免深烘焦苦，突出烤榛果与牛奶巧克力甜滑感；意式 1:2 萃取做奶咖同样惊艳。',
      steps: [
        { stage: '一段 · 闷蒸焦香', target: '0:00–0:30 · 注水至 30g', note: '89℃ 柔水闷蒸，烤榛果与烤杏仁坚果香气瞬间扑面。' },
        { stage: '二段 · 醇厚奶巧', target: '0:30–1:10 · 绕圈注水至 135g', note: '平稳大水流增强丝滑醇厚度与焦糖甜感。' },
        { stage: '三段 · 圆润收尾', target: '1:10–2:00 · 中心补水至 225g', note: '2:00 完成，甜橙与牛奶巧克力平衡收束。' },
      ],
    },
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.54,
      palette: {
        primary: '#7D4B24',
        secondary: '#E0A442',
        accent: '#C97A3D',
        bgTop: '#26170C',
        bgBottom: '#573317',
        paperTint: '#F6F0E4',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'highland',
        subjectMotif: 'brazil_yellow_bourbon',
        effectParticles: ['caramel_spark', 'gold_dust', 'cocoa_flake'],
        lineartPattern: 'contour_botanical',
        heroDir: 'sa-03-brazil-cerrado-yb',
      },
      depths: {
        subjectDepth: 0.34,
        effectsDepth: 0.46,
        backgroundDepth: -0.24,
        subjectScale: 1.08,
      },
    },
  },

  // =========================================================================
  // 10. AP-01 印尼 苏门答腊林东 黄金曼特宁 湿刨法（跨洲风土基准豆 · 亚太草本醇厚标杆）
  // =========================================================================
  {
    id: 'ap-01-sumatra-mandheling',
    code: 'AP-01',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: false,
    title: '印尼 苏门答腊林东 黄金曼特宁',
    subtitle: 'Indonesia Sumatra Lintong · Golden Mandheling Wet-Hulled',
    tagline: '赤道雨林逼出的半干湿刨工艺——糖浆般极高醇厚度、雪松草本与黑巧甘草回甘。',
    tags: ['印度尼西亚', '苏门答腊', '林东', '黄金曼特宁', '湿刨法', '高醇厚度', '雪松草本'],
    relatedCardIds: [
      'rg-04-asia-pacific',
      'pr-01-classic-process',
      'pr-03-roast-agtron',
      'vr-02-typica',
      'cn-01-yunnan-baoshan',
    ],
    origin: {
      continent: '亚太',
      country: '印度尼西亚',
      region: '苏门答腊 · 林东高地 (Lintong, 多巴湖畔)',
      estate: '林东高地三手选微批次',
      altitude: '1300-1550m',
      grade: 'G1 TP 三次手选 (黄金曼特宁)',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Typica / Ateng',
    },
    processing: {
      category: 'wet_hulled',
      name: '苏门答腊湿刨法 (Giling Basah)',
      detail:
        '应对热带雨林高湿暴雨气候而生：去皮短发酵冲洗后仅预干燥至 30%–35% 高含水率，即强力刨除湿润羊皮纸（生豆呈特征深蓝绿色），再晒干并经三次严格人工手选剔除瑕疵，塑造极低酸与糖浆般厚重体感。',
    },
    roast: {
      label: 'Full City',
      scale: 'Full City · 中深烘焙',
      agtron: '42-48（豆粉 50-56）',
      colorHex: '#452512',
      position01: 0.76,
    },
    physics: null,
    sensory: {
      flavors: ['雪松', '黑巧克力', '草本香料', '丁香', '甘草'],
      tastingNotes:
        '亚太海岛风土的沉稳厚重美学——几乎无刺激性果酸，入口宛如融化的 75% 黑巧克力糖浆，雪松木质、丁香与清新草本药草感徐徐展开，吞咽后喉底涌起悠长甘草清甜。',
      radar6D: {
        floralFruity: 2.3,
        acidity: 2.0,
        sweetness: 4.0,
        body: 5.0,
        cleanliness: 3.7,
        aftertaste: 4.5,
      },
    },
    narrative: {
      originStory:
        '苏门答腊多巴火山湖畔的林东高地终年云雾充沛、火山灰土肥沃，“黄金曼特宁”通过三次人工手选大粒无瑕生豆，彻底洗去普通湿刨豆的杂味，只留深邃迷人的东方草本与奶油厚韵。',
      cultivationHarvest:
        '由多巴湖周边 1300–1550m 林荫小农分散种植，保留古系铁皮卡（Bergendal）与适应性优异的 Ateng 品种，采收后采用传统湿刨并高标准分级筛选。',
      recommendedScenarios:
        '偏好低酸厚重口感与手冲法兰绒（点滴慢萃）的绝佳之选；搭配浓郁牛奶制作热拿铁或复古冰滴，黑巧与草本香气极具记忆点。',
    },
    brewing: {
      method: '手冲 / 法兰绒',
      grindSize: '中粗研磨',
      waterTempC: 87,
      ratio: '1:14',
      doseWater: '15g 粉 / 210g 水',
      totalTime: '约 2:05',
      summary: '中深烘采用 86–88℃ 低温搭配稍粗研磨与 1:14 粉水比，避开焦苦、尽显绸缎黑巧与甘草回甘。',
      steps: [
        { stage: '一段 · 温润闷蒸', target: '0:00–0:30 · 注水至 30g', note: '87℃ 轻柔浸润膨胀粉床，雪松与丁香木质香沉稳升腾。' },
        { stage: '二段 · 糖浆醇厚', target: '0:30–1:15 · 慢速绕圈至 130g', note: '低水位柔和绕圈，萃取饱满顺滑的黑巧克力奶油质感。' },
        { stage: '三段 · 甘草截流', target: '1:15–2:05 · 中心缓注至 210g', note: '略早截流避开尾段木质苦涩，放大清甜甘草尾韵。' },
      ],
    },
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.50,
      palette: {
        primary: '#1A352C',
        secondary: '#B3884D',
        accent: '#54684B',
        bgTop: '#0E1C17',
        bgBottom: '#234237',
        paperTint: '#F4EFE6',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'island',
        subjectMotif: 'sumatra_cedar_bean',
        effectParticles: ['cedar_leaf', 'spice_ember', 'gold_dust'],
        lineartPattern: 'contour_botanical',
        heroDir: 'ap-01-sumatra-mandheling',
      },
      depths: {
        subjectDepth: 0.34,
        effectsDepth: 0.46,
        backgroundDepth: -0.25,
        subjectScale: 1.08,
      },
    },
  },

  // =========================================================================
  // 11. CN-01 中国云南 保山潞江坝 老铁皮卡 水洗（跨洲风土基准豆 · 东方精品名片）
  // =========================================================================
  {
    id: 'cn-01-yunnan-baoshan',
    code: 'CN-01',
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: false,
    title: '中国云南 保山潞江坝 老铁皮卡',
    subtitle: 'China Yunnan Baoshan Lujiangba · Heritage Typica Washed',
    tagline: '高黎贡山与怒江峡谷的东方精品名片——浓而不苦、香而不烈、梅子柑橘伴滇红茶韵。',
    tags: ['中国云南', '保山', '潞江坝', '老铁皮卡', '水洗', '高黎贡山', '东方精品'],
    relatedCardIds: [
      'rg-05-china-yunnan',
      'vr-02-typica',
      'pr-01-classic-process',
      'af-05-kaffa-washed',
      'ap-01-sumatra-mandheling',
    ],
    origin: {
      continent: '中国云南',
      country: '中国',
      region: '云南 · 保山潞江坝（高黎贡山东麓）',
      estate: '高黎贡山精品老树庄园',
      altitude: '1500-1750m',
      grade: '高海拔全红果精品微批次',
      harvestSeason: '2026',
    },
    botany: {
      species: 'Arabica 阿拉比卡',
      variety: 'Typica',
    },
    processing: {
      category: 'washed',
      name: '高海拔精细水洗 (Washed)',
      detail:
        '严格淘汰青红混采，全红果人工手采与浮选分级后，经高黎贡山清泉控温湿式发酵并彻底洗净，于怒江干热河谷晴朗冬春阳光下高架床慢晒，精准锁住老铁皮卡的清雅茶韵与梅子甜感。',
    },
    roast: {
      label: '中浅度',
      scale: 'Light-Medium',
      agtron: '60-68（豆粉 70-78）',
      colorHex: '#8C582F',
      position01: 0.30,
    },
    physics: null,
    sensory: {
      flavors: ['红糖梅子', '柑橘', '烤坚果', '红茶', '黑巧克力'],
      tastingNotes:
        '打破商业卡蒂姆刻板印象的云南高海拔风土杰作——入口干净柔和，明亮柑橘与红糖梅子酸甜清雅舒展，中后段衔接烤坚果、黑巧克力与温润滇红茶尾韵，“浓而不苦、香而不烈、略带果味”。',
      radar6D: {
        floralFruity: 3.8,
        acidity: 3.9,
        sweetness: 4.3,
        body: 3.5,
        cleanliness: 4.5,
        aftertaste: 4.2,
      },
    },
    narrative: {
      originStory:
        '保山潞江坝是中国咖啡产业化的发源地之一，地处北纬 25° 咖啡带北缘高地，坐拥高黎贡山东麓与怒江干热河谷得天独厚的昼夜温差与火山沙质壤土，“保山小粒咖啡”历来以老铁皮卡闻名海内外。',
      cultivationHarvest:
        '新寨村及周边 1500–1750m 高海拔坡地持续复兴低产珍贵的古铜嫩叶老铁皮卡，冬春旱季强日照配合全红果分批采收，让风味纯净度直追国际一线产区。',
      recommendedScenarios:
        '日常手冲细品东方高原茶韵与红糖梅子甘甜；也非常适合作为向亲友科普“中国本土精品咖啡崛起”的入门惊艳豆单。',
    },
    brewing: {
      method: '手冲热饮',
      grindSize: '中细研磨',
      waterTempC: 91,
      ratio: '1:15',
      doseWater: '15g 粉 / 225g 水',
      totalTime: '约 2:00',
      summary: '91℃ 温润手冲、粉水比 1:15，三段式萃取约 2 分钟，完美平衡柑橘果酸与温润滇红茶甘甜。',
      steps: [
        { stage: '一段 · 闷蒸茶韵', target: '0:00–0:30 · 注水至 30g', note: '91℃ 柔和润湿粉床，烤坚果与淡雅柑橘花香缓缓逸出。' },
        { stage: '二段 · 梅子红糖', target: '0:30–1:05 · 绕圈注水至 125g', note: '稳定绕圈拉出红糖梅子饱满酸甜与柔和茶体。' },
        { stage: '三段 · 滇红回甘', target: '1:05–2:00 · 中心补水至 225g', note: '2:00 滴完，温凉段黑巧克力与红茶回甘清澈悠长。' },
      ],
    },
    visual: {
      rarity: 'rare',
      defaultFinish: 'original',
      foilStrength: 0.42,
      palette: {
        primary: '#2D4A3E',
        secondary: '#C78A4A',
        accent: '#9A4858',
        bgTop: '#162620',
        bgBottom: '#335447',
        paperTint: '#F5F0E6',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'yunnan',
        subjectMotif: 'yunnan_typica_branch',
        effectParticles: ['tea_mist', 'citrus_spark', 'gold_dust'],
        lineartPattern: 'contour_botanical',
        heroDir: 'cn-01-yunnan-baoshan',
      },
      depths: {
        subjectDepth: 0.34,
        effectsDepth: 0.48,
        backgroundDepth: -0.25,
        subjectScale: 1.08,
      },
    },
  },
];
