/**
 * 品鉴官闪卡盲测模式 (Flashcard Quiz) + 掌握度持久化 (localStorage)
 * 暗房实体 3D CSS 翻牌自测：4 大专场 + 待巩固错题重测 + 24 道权威专业题库 + 温润棉纸解析卡背 + 成绩单
 */

import { renderGalleryThumb } from '../art/hybrid-resolver.js';

export const MASTERY_STORAGE_KEY = 'coffee-atlas-mastery-v1';

export function loadMasteryState() {
  const empty = { mastered: new Set(), review: new Set() };
  try {
    const raw = window.localStorage?.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      mastered: new Set(Array.isArray(parsed?.mastered) ? parsed.mastered : []),
      review: new Set(Array.isArray(parsed?.review) ? parsed.review : []),
    };
  } catch {
    return empty;
  }
}

export function saveMasteryState(state) {
  try {
    const payload = {
      mastered: Array.from(state.mastered),
      review: Array.from(state.review),
    };
    window.localStorage?.setItem(MASTERY_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

export const QUIZ_MODES = [
  { id: 'mixed', label: '综合盲测 (10题)', count: 10 },
  { id: 'beans', label: '单品风味与处理法' },
  { id: 'botany', label: '豆种与品种辨识' },
  { id: 'terroir_craft', label: '产区与专业品鉴' },
  { id: 'review', label: '待巩固错题重测' },
];

export const QUIZ_BANK = [
  // ---- 1. 单品风味与处理法 (beans, 9 题) ----
  {
    id: 'q-ca01-physics',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'ca-01-esmeralda-green',
    maskThumb: true,
    clues: ['巴拿马 · 波奎特 1600–1800m', '玫瑰花香 / 黑莓 / 菠萝 / 柑橘'],
    prompt: '这款翡翠庄园绿标瑰夏实测含水率 10.8%、堆积密度高达 880 g/L，这两项物理体检指标说明什么？',
    options: [
      '水分落于 10.5%–12.0% 黄金窗，且为极高海拔慢熟紧实硬豆',
      '含水率偏高容易霉变，属于低海拔蓬松软豆',
      '堆积密度越低代表海拔越高，880 g/L 说明是中低海拔豆',
      '10.8% 为烘焙后熟豆含水率，与生豆品质无关',
    ],
    answerIndex: 0,
    explanation:
      '生豆含水率 10.5%–12.0%（水活度 Aw < 0.60）兼具储运稳定性与烘焙热传导效率；堆积密度 ≥ 800 g/L 即属高海拔紧实硬豆，翡翠绿标实测 880 g/L 蕴含致密前驱糖分与锐利玫瑰花果香。',
  },
  {
    id: 'q-sa01-rum',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'sa-01-macarena-rum',
    maskThumb: true,
    clues: ['哥伦比亚 · 玛卡瑞纳地块', '红樱桃 / 橡木 / 甘草 / 青提 / 可可碎'],
    prompt: '开袋即有醇厚酒香与橡木调、入口红樱桃与青提果酸明亮、烘焙度为 City 的玛卡瑞纳地块，采用了哪种处理工艺？',
    options: [
      '传统高架床全果日晒',
      '陈年朗姆酒橡木桶低温静置发酵',
      '苏门答腊式半干湿刨法',
      '72 小时肯尼亚式双重水洗',
    ],
    answerIndex: 1,
    explanation:
      'SA-01 玛卡瑞纳地块将水洗后的咖啡生豆放入陈年朗姆酒橡木桶中低温静置发酵，每日翻动并定期取样，让豆粒均匀吸附橡木与朗姆酒香，同时保留红樱桃与青提明亮果酸。',
  },
  {
    id: 'q-sa02-n2',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'sa-02-baishan-n2',
    maskThumb: true,
    clues: ['哥伦比亚 · 白山庄园 瑰夏', '冷泉水氮气水洗'],
    prompt: '哥伦比亚白山庄园采用「高海拔冷泉水 + 氮气厌氧水洗」，在杯中锁住了哪组极具清冽感的招牌风味？',
    options: [
      '雪松、丁香、黑巧克力与草本香料',
      '草莓奶糖、香草泡芙与酸奶冰淇淋',
      '洋甘菊、柠檬、佛手柑与黄色花香',
      '烤榛果、焦糖与浓郁坚果巧克力',
    ],
    answerIndex: 2,
    explanation:
      'SA-02 白山庄园瑰夏通过低温冷泉水与氮气隔氧精细控温，既延缓过度发酵又最大化锁住单萜烯芳香分子，带来如高山清泉般的洋甘菊、柠檬、佛手柑与黄色花香。',
  },
  {
    id: 'q-af03-coferm',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'af-03-gelana-coferm',
    maskThumb: true,
    clues: ['埃塞俄比亚 · 格拉纳产区', 'High 烘焙 · 甜品感爆发'],
    prompt: '呈现出「草莓奶糖、香草泡芙、酸奶冰淇淋、金朗姆酒」甜品般绵密风味的格拉纳瑰夏，采用了什么处理法？',
    options: [
      '传统水洗（Washed）',
      '共发酵水洗（Co-fermented Washed）',
      '黑蜜处理（Black Honey）',
      '印尼湿刨法（Wet Hulled）',
    ],
    answerIndex: 1,
    explanation:
      'AF-03 格拉纳瑰夏采用共发酵水洗工艺，在发酵阶段引入特定天然果酵媒介协同代谢，配合 High 烘焙度发展出极具标志性的草莓奶糖、香草泡芙与柔和朗姆酒尾韵。',
  },
  {
    id: 'q-af05-vs-af06-washed',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'af-05-kaffa-washed',
    maskThumb: true,
    clues: ['埃塞俄比亚 · 卡法森林', '柑橘 / 坚果 / 绿茶 / 焦糖'],
    prompt: '将 AF-05 卡法瑰夏水洗与同源的 AF-06 卡法日晒对比冲煮时，水洗批次凸显「柑橘与绿茶清透感」的核心工艺原因是？',
    options: [
      '水洗大幅拉长了果肉与生豆的接触晒干时间',
      '水洗提前彻底洗净果肉与果胶，最大化呈现风土干净度与茶感素颜',
      '水洗批次烘焙度深至法式深烘，压低了花果香',
      '水洗在干燥过程中加入了朗姆酒桶二次浸泡',
    ],
    answerIndex: 1,
    explanation:
      '水洗法在干燥前便通过发酵与清水洗净果胶，避免果肉糖分回渗带来的厚重发酵调，从而还原卡法高地原生瑰夏最澄澈的柑橘、绿茶与优雅焦糖甜感。',
  },
  {
    id: 'q-af06-natural',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'af-06-kaffa-natural',
    maskThumb: true,
    clues: ['埃塞俄比亚 · 卡法 G1', '与 AF-05 同源对比'],
    prompt: '相较于清透茶感的 AF-05 卡法水洗，采用整果高架床传统日晒的 AF-06 卡法瑰夏 G1 展现出哪组更浓郁的调性？',
    options: [
      '蓝莓、无花果、李子与榛子，果酱甜感更饱满',
      '青草、烟熏雪松与重度草药苦感',
      '纯粹柠檬水感，几乎没有莓果与核果香',
      '浓烈黑胡椒与烤芝麻的极低酸口感',
    ],
    answerIndex: 0,
    explanation:
      'AF-06 采用整果高架床慢速传统日晒，果肉糖分与芳香前驱物持续渗入豆芯，相比同源水洗呈现出奔放的蓝莓、无花果、李子果酱感与圆润榛子尾韵。',
  },
  {
    id: 'q-af04-gori',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'af-04-gori-natural',
    maskThumb: true,
    clues: ['埃塞西南部原始林荫', '花香 / 杏桃 / 凤梨 / 莓果'],
    prompt: '被誉为世界瑰夏原始基因库、由当地农户步入原始森林手采全红果并高架床日晒的 G1 批次产自哪里？',
    options: [
      '巴拿马波奎特巴鲁火山',
      '埃塞俄比亚 Banchi Maji 戈里森林',
      '哥伦比亚安蒂奥基亚高原',
      '印度尼西亚苏门答腊林东',
    ],
    answerIndex: 1,
    explanation:
      '戈里森林（Gori Gesha Forest）位于埃塞俄比亚西南部 Banchi Maji，正是 1931 年瑰夏种被发现的原生故乡；林荫日晒批次花香与杏桃、凤梨等热带果调奔放迷人。',
  },
  {
    id: 'q-af01-kenya',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'af-01-kenya-nyeri-aa',
    maskThumb: true,
    clues: ['东非火山红土', '黑加仑 / 血橙 / 乌梅 / 圣女果'],
    prompt: '肯尼亚涅里 AA 令人难忘的「黑加仑、血橙、乌梅」爆裂磷酸调，最核心的基因与工艺组合是？',
    options: [
      '卡蒂姆品种 + 印尼湿刨法',
      'SL28 / SL34 品种 + 肯尼亚式 72h 双重水洗',
      '黄波旁品种 + 巴西平原全果日晒',
      '利比里卡品种 + 密闭厌氧蜜处理',
    ],
    answerIndex: 1,
    explanation:
      '肯尼亚高海拔火山红土上种植的 SL28 与 SL34，经由经典的 72 小时双重发酵与清水浸泡水洗，造就了世界咖啡版图中独树一帜的黑加仑、血橙与圣女果多汁酸质。',
  },
  {
    id: 'q-ap01-mandheling',
    category: 'beans',
    categoryLabel: '单品风味与处理法',
    cardId: 'ap-01-sumatra-mandheling',
    maskThumb: true,
    clues: ['亚太群岛基准豆', '雪松 / 黑巧克力 / 丁香 / 甘草'],
    prompt: '印尼苏门答腊黄金曼特宁极具辨识度的「低酸、糖浆般厚重醇厚度与雪松草本香料」，主要源于哪种地域处理法？',
    options: [
      '高海拔水洗（Washed）',
      '苏门答腊湿刨法（Giling Basah）',
      '低温氮气厌氧洗（N2 Cold Washed）',
      '哥斯达黎加白蜜处理（White Honey）',
    ],
    answerIndex: 1,
    explanation:
      '湿刨法在生豆含水率仍高达 30%–35% 时便剥除羊皮纸直接裸豆暴晒，独特的高湿快干路径大幅降低尖锐酸质并赋予曼特宁标志性的雪松、丁香草本与厚重黑巧体感。',
  },

  // ---- 2. 豆种与品种辨识 (botany, 8 题) ----
  {
    id: 'q-sp01-arabica',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'sp-01-arabica',
    maskThumb: true,
    clues: ['全球产量占比 55%–60%', '中缝微弯呈优雅 S 型'],
    prompt: '阿拉比卡（Coffea arabica）之所以风味优雅、花果层次丰富，却比罗豆更娇贵怕叶锈病，其生物学根源是？',
    options: [
      '二倍体 22 条染色体，咖啡因含量超过 2.5%',
      '异源四倍体 44 条染色体，糖脂含量高、咖啡因低（1.2%–1.5%）且遗传多样性偏窄',
      '原生于热带海平面沙漠，极度耐高温干旱',
      '不含绿原酸与脂质，仅靠人工香精呈现花香',
    ],
    answerIndex: 1,
    explanation:
      '阿拉比卡由卡内弗拉与尤金尼奥伊德斯自然杂交演化而来，是咖啡属中罕见的 44 条染色体异源四倍体；更高的蔗糖（6–9%）与脂质（15–17%）造就馥郁风味，但较低咖啡因也削弱了天然防虫抗病力。',
  },
  {
    id: 'q-sp02-robusta',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'sp-02-robusta',
    maskThumb: true,
    clues: ['22 条染色体二倍体', '中缝笔直 · 高油脂 Crema'],
    prompt: '关于罗布斯塔（Robusta）与当代「精品罗豆（Fine Robusta）」的正确认知是？',
    options: [
      '罗豆天生只能做廉价速溶，永远不可能达到精品标准',
      '罗豆咖啡因比阿豆更低，因此口感更酸更轻盈',
      '过去难喝多因低地粗放与青果混采；高海拔全红果精制后 CQI 80+ 即为 Fine Robusta',
      '罗布斯塔是阿拉比卡在巴西突变产生的新品种',
    ],
    answerIndex: 2,
    explanation:
      '罗豆过往的橡胶苦涩多源于低地粗放种植与青果混采；当移至较高海拔并采用全红果手采与精细水洗/厌氧发酵后，CQI 80 分以上的 Fine Robusta 能展现饱满黑巧、烤榛果与丝滑油脂感。',
  },
  {
    id: 'q-sp03-liberica',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'sp-03-liberica',
    maskThumb: true,
    clues: ['巨型不对称水滴豆粒', '马来西亚 / 菲律宾特色豆种'],
    prompt: '豆粒体型硕大呈不对称水滴状、杯中带有独一无二「热带熟菠萝蜜 + 烟熏雪松木质」奔放香气的是哪个豆种？',
    options: [
      '阿拉比卡（C. arabica）',
      '利比里卡（C. liberica）',
      '尤金尼奥伊德斯（C. eugenioides）',
      '卡杜拉（Caturra）',
    ],
    answerIndex: 1,
    explanation:
      '利比里卡树体高大、豆形如不对称水滴且远大于阿豆，拥有全咖啡界极具辨识度的熟菠萝蜜、热带果干与雪松木质香谱，是马来西亚与菲律宾极具地域文化底蕴的宝藏豆种。',
  },
  {
    id: 'q-sp05-eugenioides',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'sp-05-eugenioides',
    maskThumb: true,
    clues: ['阿拉比卡母本祖先种', '2021 WBC & WBrC 双冠神话'],
    prompt: '2021 年包揽世界咖啡师与世界冲煮双料冠军、咖啡因仅为阿豆约 1/3（0.3%–0.6%）、入口几乎零苦感的是哪个稀有豆种？',
    options: [
      '尤金尼奥伊德斯（C. eugenioides）',
      '埃克塞尔萨（Excelsa）',
      '罗布斯塔（C. canephora）',
      '象豆（Maragogipe）',
    ],
    answerIndex: 0,
    explanation:
      '尤金尼奥伊德斯是阿拉比卡的母本祖先种，极低的咖啡因与绿原酸使其呈现近乎零苦度的纯净麦片奶甜与淡雅果香，2021 年由哥伦比亚 Finca Inmaculada 批次助选手斩获双冠。',
  },
  {
    id: 'q-vr04-pink-bourbon',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'vr-04-pink-bourbon',
    maskThumb: true,
    clues: ['哥伦比亚慧兰 / 考卡明星品种', '血橙 / 粉红西柚 / 白花'],
    prompt: '现代 DNA 基因检测揭开了哥伦比亚「粉红波旁（Pink Bourbon）」的真实身世，下列哪项是科学真相？',
    options: [
      '它是红波旁与黄波旁人工杂交产生的一代种',
      '它是通过添加玫瑰花瓣染色形成的波旁豆',
      '它实际归属于埃塞俄比亚原生地方种聚类，并非红×黄波旁杂交',
      '它属于罗布斯塔与铁皮卡的抗锈杂交系',
    ],
    answerIndex: 2,
    explanation:
      '尽管长期流传“红波旁 × 黄波旁杂交”的浪漫说法，WCR 现代 DNA 指纹检测证实真正的哥伦比亚粉红波旁实为埃塞俄比亚原生地方种聚类，这也是它拥有明亮花香与血橙西柚酸质的基因密码。',
  },
  {
    id: 'q-vr08-laurina',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'vr-08-laurina-sidra',
    maskThumb: true,
    clues: ['尖长如松果的豆形', '无需化学脱因工艺'],
    prompt: '以下哪个精品阿拉比卡品种天生仅含约 0.6% 咖啡因（天然半因），并因精致清甜屡次登上世界冲煮大赛舞台？',
    options: [
      '铁皮卡（Typica）',
      '尖身波旁（Laurina / Bourbon Pointu）',
      'SL34',
      '卡蒂姆（Catimor）',
    ],
    answerIndex: 1,
    explanation:
      '尖身波旁（Laurina）是波旁在留尼汪岛产生的天然突变种，咖啡因含量仅约 0.6%（普通阿豆的一半左右），苦度极低且风味精致柔和，无需经过水洗或二氧化碳脱因。',
  },
  {
    id: 'q-vr01-geisha',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'vr-01-geisha',
    maskThumb: true,
    clues: ['单萜烯：芳樟醇与香叶醇', '对风土海拔极度挑剔'],
    prompt: '瑰夏（Geisha）被称作「芳香放大器」，通常需要什么样的风土条件才能彻底激活其标志性的茉莉与佛手柑香气？',
    options: [
      '500m 以下炎热平原快速成熟',
      '1600m 以上高海拔冷凉微气候慢熟积累芳香前驱物',
      '必须深烘至二爆后表面出油才能激发花香',
      '只要种在任何地区都会自带同等浓度的玫瑰香气',
    ],
    answerIndex: 1,
    explanation:
      '瑰夏极度挑剔海拔与昼夜温差：低海拔种植常流于平淡草本，唯有在 1600m 以上冷凉高地慢熟，才能充分累积芳樟醇、香叶醇等单萜烯，展现华丽茉莉、玫瑰与佛手柑层次。',
  },
  {
    id: 'q-vr06-74110',
    category: 'botany',
    categoryLabel: '豆种与品种辨识',
    cardId: 'vr-06-heirloom-74110',
    maskThumb: true,
    clues: ['埃塞俄比亚 JARC 选育', '豆粒高度均一'],
    prompt: '近年来在埃塞俄比亚 COE 与精品单品豆单上频频刷屏的 74110 与 74158，最初的培育背景与杯中特点是？',
    options: [
      '1974 年为抵抗咖啡浆果病（CBD）筛选的原生母树后代，豆粒均一且极具高干净度白花水蜜桃香',
      '源自巴西商业机械采收的低酸拼配杂交种',
      '由巴拿马翡翠庄园回流至埃塞俄比亚的瑰夏克隆体',
      '2020 年代才诞生的实验室转基因新品种',
    ],
    answerIndex: 0,
    explanation:
      '74110 与 74158 由埃塞吉马农业研究中心（JARC）于 1974 年从抗浆果病（CBD）野生母树中筛选育成；相比传统混收原生种，它们粒径均一、烘焙受热一致，白花与水蜜桃干净度极佳。',
  },

  // ---- 3. 产区与专业品鉴 (terroir_craft, 7 题) ----
  {
    id: 'q-rg05-yunnan',
    category: 'terroir_craft',
    categoryLabel: '产区与专业品鉴',
    cardId: 'rg-05-china-yunnan',
    maskThumb: true,
    clues: ['普洱 / 保山 / 临沧 / 德宏', '海拔 1200–2000m'],
    prompt: '关于中国云南精品咖啡产区的核心事实，以下哪一项准确？',
    options: [
      '云南仅占中国咖啡产量的 20%，且只种低海拔罗布斯塔',
      '云南占全国 98%+ 产量、精品率已突破 30%，保山潞江坝老铁皮卡等展现红糖梅子与滇红茶韵',
      '云南海拔全部低于 800m，不具备种植铁皮卡与瑰夏的条件',
      '云南咖啡只采用印尼湿刨法处理，无法做精细水洗与厌氧',
    ],
    answerIndex: 1,
    explanation:
      '云南贡献了中国 98% 以上咖啡产量，核心产区分布在 1200–2000m 的普洱、保山（潞江坝）、临沧与德宏，全省精品率突破 30%，正从传统卡蒂姆向老铁皮卡、瑰夏与多元精制升级。',
  },
  {
    id: 'q-rg06-migration',
    category: 'terroir_craft',
    categoryLabel: '产区与专业品鉴',
    cardId: 'rg-06-geisha-migration',
    maskThumb: true,
    clues: ['跨越 12,000 公里的植物传奇', '1931 → 1953 → 1963 → 2004'],
    prompt: '瑰夏百年跨洲迁徙路线中，哪条历史脉络准确串联了它的「发现—中转—封神」？',
    options: [
      '1931 巴西圣保罗 → 1953 肯尼亚 → 2004 牙买加蓝山夺冠',
      '1931 埃塞戈里/卡法森林 → 1953 哥斯达黎加 CATIE T2722 → 1963 引入巴拿马 → 2004 翡翠庄园 BOP 夺冠',
      '1931 哥伦比亚 → 1953 印尼苏门答腊 → 2004 埃塞 COE 夺冠',
      '1931 也门摩卡港 → 1953 云南保山 → 2004 危地马拉夺冠',
    ],
    answerIndex: 1,
    explanation:
      '瑰夏 1931 年采集自埃塞西南森林，1953 年落脚哥斯达黎加 CATIE 基因库（编号 T2722），1963 年由 Don Pachi 引入巴拿马，最终在 2004 年经翡翠庄园于 BOP 大赛一举封神全球。',
  },
  {
    id: 'q-pr01-process-law',
    category: 'terroir_craft',
    categoryLabel: '产区与专业品鉴',
    cardId: 'pr-01-classic-process',
    maskThumb: true,
    clues: ['水洗 / 蜜处理 / 日晒 / 湿刨', '理解一切风味走向的底层逻辑'],
    prompt: '掌握传统生豆处理法对风味影响的最核心一条规律是？',
    options: [
      '果肉与果胶伴随干燥越久，甜感与醇厚度越浓；越早洗净果胶，干净度与风土素颜越清透',
      '水洗豆永远比日晒豆更甜、醇厚度更高',
      '白蜜保留的果胶比黑蜜多，因此白蜜发酵感最强',
      '处理法只改变生豆颜色，对香气与酸质几乎无影响',
    ],
    answerIndex: 0,
    explanation:
      '从水洗 → 白蜜/黄蜜/红蜜/黑蜜 → 日晒，随着干燥期间保留的果胶与果肉逐级增加，杯中风味也从清透茶感与锐利酸质，逐步转向蜂蜜核果甜感乃至浓郁热带果酱与厚重醇厚度。',
  },
  {
    id: 'q-pr03-agtron',
    category: 'terroir_craft',
    categoryLabel: '产区与专业品鉴',
    cardId: 'pr-03-roast-agtron',
    maskThumb: true,
    clues: ['近红外焦糖化测色标尺', '一爆 ~196–205℃ / 二爆 ~222–228℃'],
    prompt: '专业烘焙师使用 Agtron 色值来量化咖啡烘焙度，以下对 Agtron 读数的解读哪项正确？',
    options: [
      'Agtron 数值越高代表烘焙越深，意式深烘通常高于 85',
      'Agtron 数值越低代表豆色越深、烘焙越重；精品浅中烘瑰夏通常在 60–75 区间',
      '正常烘焙下豆表色值应当比磨粉后豆粉色值高出 20 分以上',
      'Agtron 仅用于测量咖啡因含量，与烘焙深浅无关',
    ],
    answerIndex: 1,
    explanation:
      'Agtron 基于焦糖化反光率计分：数值越低颜色越深（如极深烘 < 35），数值越高烘焙越浅；精品浅中烘瑰夏多落于 60–75，且正常均匀发展时豆粉值通常比豆表值高 8–15 分。',
  },
  {
    id: 'q-ta01-cva',
    category: 'terroir_craft',
    categoryLabel: '产区与专业品鉴',
    cardId: 'ta-01-sca-cva-wheel',
    maskThumb: true,
    clues: ['SCA 最新咖啡价值评估体系', '物理 / 描述 / 情感 / 外在'],
    prompt: 'SCA 推出的最新 CVA（Coffee Value Assessment）体系相比 2004 传统杯测表，最具变革性的设计理念是什么？',
    options: [
      '取消所有风味描述词，只保留一个总分数字',
      '强制要求所有精品豆必须达到 95 分以上',
      '拆分「描述性评估（客观像什么）」与「情感性评估（主观品质喜好）」，并纳入外在价值',
      '仅在滚烫 95℃ 时品尝一次即完成全部打分',
    ],
    answerIndex: 2,
    explanation:
      'CVA 通过物理、描述（CATA + 15 分强度）、情感（9 分制品质喜好）与外在属性四大支柱，科学解耦了“客观风味特征”与“主观好喝程度”，让多元风土与实验处理都能被公正描述。',
  },
  {
    id: 'q-ta02-grading',
    category: 'terroir_craft',
    categoryLabel: '产区与专业品鉴',
    cardId: 'ta-02-grading-physics',
    maskThumb: true,
    clues: ['G1 / AA / SHB / 翡翠红绿蓝标', '各国分级密码'],
    prompt: '国际主流咖啡产区的生豆分级标准各有侧重，以下哪组对应关系准确无误？',
    options: [
      '埃塞 G1/G2 主看瑕疵数与杯测，肯尼亚 AA 主看筛网目数，中美洲 SHB 主看高海拔硬度',
      '肯尼亚 AA 代表海拔最低的商用豆等级',
      '埃塞 G1 代表瑕疵最多，G5 代表零瑕疵最高等级',
      '中美洲 SHB（Strictly Hard Bean）专指 500m 以下低海拔软豆',
    ],
    answerIndex: 0,
    explanation:
      '各国分级侧重点各异：埃塞俄比亚 G1 为极少瑕疵最高级，肯尼亚 AA/AB 按豆粒大小目数划分，危地马拉/巴拿马等中美洲产区以 SHB/SHG 标识高海拔紧实硬豆，再结合含水率与密度全面判断品质。',
  },
  {
    id: 'q-ta03-golden-cup',
    category: 'terroir_craft',
    categoryLabel: '产区与专业品鉴',
    cardId: 'ta-03-golden-cup-brew',
    maskThumb: true,
    clues: ['SCA 金杯萃取准则', '91–92℃ · 1:15 · 三段注水'],
    prompt: '依据 SCA 金杯萃取准则，手冲精品咖啡兼顾甜感、酸质平衡与干净度的理想萃取率（EY）与浓度（TDS）区间是？',
    options: [
      '萃取率 10%–14%，浓度 3.0%–5.0%',
      '萃取率 18%–22%，手冲浓度 1.15%–1.45%',
      '萃取率 28%–35%，手冲浓度 0.50%–0.80%',
      '萃取率越高越好，超过 26% 最甜最干净',
    ],
    answerIndex: 1,
    explanation:
      'SCA 金杯窗口为萃取率 EY 18%–22%、手冲 TDS 1.15%–1.45%（现代浅烘实操可延展至 1.50%）；低于 18% 易尖酸水感（萃取不足），高于 22% 则易出涩苦木质尾韵（过度萃取），调参铁律是每次仅改一个变量。',
  },
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRankTitle(accuracyPct) {
  if (accuracyPct >= 90) {
    return { title: 'Q-Grader 殿堂品鉴官', note: '感官与风土知识炉火纯青，足以独立掌舵精品手冲吧台。' };
  }
  if (accuracyPct >= 75) {
    return { title: '咖啡风土博物学家', note: '对各大洲风土、品种基因与发酵工艺已有深刻系统的洞察。' };
  }
  if (accuracyPct >= 50) {
    return { title: '精品手冲鉴赏家', note: '已掌握核心品鉴脉络，可将错题卡在 3D 展台翻看精读巩固。' };
  }
  return { title: '初阶风味探索者', note: '风味之旅刚刚启程——多逛全套 36 张图鉴与双豆对比实验室，进步飞速。' };
}

export function createQuizView(mountEl, options = {}) {
  const {
    cards = [],
    cardMap = {},
    onExitToGallery,
    onInspectCard,
    onMasteryChange,
  } = options;

  const totalDeckCount = cards.length || 36;
  const thumbCache = new Map();
  let mastery = loadMasteryState();

  let activeMode = 'mixed';
  let deck = [];
  let currentIndex = 0;
  let flipped = false;
  let selectedOption = null; // number | 'skipped' | null
  let sessionResults = []; // [{ question, correct: boolean, skipped: boolean }]
  let showingSummary = false;

  mountEl.innerHTML = `
    <div class="quiz-inner">
      <header class="quiz-header">
        <div class="quiz-header-copy">
          <div class="quiz-title-row">
            <h1 class="quiz-heading">品鉴官闪卡盲测</h1>
            <span class="quiz-mastery-badge" id="quiz-mastery-badge">已掌握 0 / ${totalDeckCount}</span>
          </div>
          <p class="quiz-lead">依托 36 张典藏咖啡图鉴真实风土与品鉴数据，通过实体 3D 翻牌主动回忆，巩固你的咖啡风味版图。</p>
        </div>
        <button type="button" class="quiz-exit-btn" id="quiz-exit-btn" title="返回全套图鉴 (Esc)">
          返回图鉴
        </button>
      </header>

      <div class="quiz-modes" id="quiz-modes" role="tablist" aria-label="盲测专场选择"></div>

      <div class="quiz-progress-bar-wrap" id="quiz-progress-wrap">
        <div class="quiz-progress-meta">
          <span class="quiz-progress-step" id="quiz-progress-step">第 01 / 10 题</span>
          <span class="quiz-progress-score" id="quiz-progress-score">本轮答对 0</span>
        </div>
        <div class="quiz-progress-track" aria-hidden="true">
          <div class="quiz-progress-fill" id="quiz-progress-fill" style="width:0%"></div>
        </div>
      </div>

      <div class="quiz-stage" id="quiz-stage"></div>
    </div>
  `;

  const elMasteryBadge = mountEl.querySelector('#quiz-mastery-badge');
  const elExitBtn = mountEl.querySelector('#quiz-exit-btn');
  const elModes = mountEl.querySelector('#quiz-modes');
  const elProgressWrap = mountEl.querySelector('#quiz-progress-wrap');
  const elProgressStep = mountEl.querySelector('#quiz-progress-step');
  const elProgressScore = mountEl.querySelector('#quiz-progress-score');
  const elProgressFill = mountEl.querySelector('#quiz-progress-fill');
  const elStage = mountEl.querySelector('#quiz-stage');

  function notifyMastery() {
    saveMasteryState(mastery);
    const stats = {
      masteredCount: mastery.mastered.size,
      reviewCount: mastery.review.size,
      masteredIds: new Set(mastery.mastered),
      reviewIds: new Set(mastery.review),
    };
    if (elMasteryBadge) {
      elMasteryBadge.textContent = `已掌握 ${stats.masteredCount} / ${totalDeckCount}`;
    }
    onMasteryChange?.(stats);
  }

  function setCardMastery(cardId, nextStatus) {
    if (!cardId) return;
    if (nextStatus === 'mastered') {
      if (mastery.mastered.has(cardId)) {
        mastery.mastered.delete(cardId);
      } else {
        mastery.mastered.add(cardId);
        mastery.review.delete(cardId);
      }
    } else if (nextStatus === 'review') {
      if (mastery.review.has(cardId)) {
        mastery.review.delete(cardId);
      } else {
        mastery.review.add(cardId);
        mastery.mastered.delete(cardId);
      }
    }
    notifyMastery();
    renderModes();
  }

  function buildDeckForMode(modeId) {
    if (modeId === 'review') {
      const reviewQs = QUIZ_BANK.filter((q) => mastery.review.has(q.cardId));
      return shuffleArray(reviewQs);
    }
    if (modeId === 'mixed') {
      const beans = shuffleArray(QUIZ_BANK.filter((q) => q.category === 'beans')).slice(0, 4);
      const botany = shuffleArray(QUIZ_BANK.filter((q) => q.category === 'botany')).slice(0, 3);
      const terroir = shuffleArray(QUIZ_BANK.filter((q) => q.category === 'terroir_craft')).slice(0, 3);
      return shuffleArray([...beans, ...botany, ...terroir]);
    }
    return shuffleArray(QUIZ_BANK.filter((q) => q.category === modeId));
  }

  function loadThumbInto(card, imgEl, placeholderEl) {
    if (!card || !imgEl) return;
    const cached = thumbCache.get(card.id);
    if (cached) {
      imgEl.src = cached;
      imgEl.classList.add('is-loaded');
      placeholderEl?.classList.add('is-hidden');
      return;
    }
    Promise.resolve()
      .then(() => renderGalleryThumb(card))
      .then((dataUrl) => {
        if (!dataUrl) return;
        thumbCache.set(card.id, dataUrl);
        if (!imgEl.isConnected || imgEl.dataset.cardId !== card.id) return;
        imgEl.src = dataUrl;
        imgEl.classList.add('is-loaded');
        placeholderEl?.classList.add('is-hidden');
      })
      .catch(() => {});
  }

  function renderModes() {
    const reviewCount = QUIZ_BANK.filter((q) => mastery.review.has(q.cardId)).length;
    elModes.innerHTML = QUIZ_MODES.map((m) => {
      const active = m.id === activeMode;
      const badge =
        m.id === 'review'
          ? `<span class="quiz-mode-count">${reviewCount}</span>`
          : m.id !== 'mixed'
            ? `<span class="quiz-mode-count">${QUIZ_BANK.filter((q) => q.category === m.id).length}</span>`
            : '';
      return `
        <button
          type="button"
          class="group-tab ${active ? 'is-active' : ''}"
          data-quiz-mode="${m.id}"
          role="tab"
          aria-selected="${active}"
        >
          <span>${escapeHtml(m.label)}</span>
          ${badge}
        </button>
      `;
    }).join('');

    elModes.querySelectorAll('[data-quiz-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        startSession(btn.dataset.quizMode || 'mixed');
      });
    });
  }

  function updateProgressBar() {
    if (deck.length === 0 || showingSummary) {
      elProgressWrap.hidden = true;
      return;
    }
    elProgressWrap.hidden = false;
    const cur = Math.min(currentIndex + 1, deck.length);
    const correctCount = sessionResults.filter((r) => r.correct).length;
    const pct = ((currentIndex + (flipped ? 1 : 0)) / deck.length) * 100;

    elProgressStep.textContent = `第 ${String(cur).padStart(2, '0')} / ${String(deck.length).padStart(2, '0')} 题`;
    elProgressScore.textContent = `本轮答对 ${correctCount}`;
    elProgressFill.style.width = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
  }

  function renderEmptyReview() {
    elProgressWrap.hidden = true;
    elStage.innerHTML = `
      <div class="quiz-empty-card">
        <h2 class="quiz-empty-title">当前暂无待巩固错题</h2>
        <p class="quiz-empty-desc">在任意盲测专场中答错或手动点击「加入待巩固」的卡片都会自动收录于此，方便定向强化。</p>
        <div class="quiz-empty-actions">
          <button type="button" class="quiz-btn-primary" id="quiz-start-mixed">开始综合盲测 (10题)</button>
          <button type="button" class="quiz-btn-ghost" id="quiz-empty-back">返回全套图鉴</button>
        </div>
      </div>
    `;
    elStage.querySelector('#quiz-start-mixed')?.addEventListener('click', () => startSession('mixed'));
    elStage.querySelector('#quiz-empty-back')?.addEventListener('click', () => onExitToGallery?.());
  }

  function renderSummary() {
    showingSummary = true;
    updateProgressBar();

    const total = sessionResults.length || 1;
    const correctCount = sessionResults.filter((r) => r.correct).length;
    const accuracyPct = Math.round((correctCount / total) * 100);
    const rank = getRankTitle(accuracyPct);
    const missed = sessionResults.filter((r) => !r.correct);
    const reviewAvailable = QUIZ_BANK.some((q) => mastery.review.has(q.cardId));

    elStage.innerHTML = `
      <div class="quiz-summary-card">
        <div class="quiz-summary-seal">品鉴官成绩单</div>
        <h2 class="quiz-rank-title">${escapeHtml(rank.title)}</h2>
        <p class="quiz-rank-note">${escapeHtml(rank.note)}</p>

        <div class="quiz-summary-stats">
          <div class="quiz-stat-box">
            <div class="quiz-stat-val">${accuracyPct}%</div>
            <div class="quiz-stat-label">本轮正确率</div>
          </div>
          <div class="quiz-stat-box">
            <div class="quiz-stat-val">${correctCount} / ${total}</div>
            <div class="quiz-stat-label">答对题数</div>
          </div>
          <div class="quiz-stat-box">
            <div class="quiz-stat-val">${mastery.mastered.size} / ${totalDeckCount}</div>
            <div class="quiz-stat-label">累计已掌握</div>
          </div>
        </div>

        ${
          missed.length > 0
            ? `
              <div class="quiz-missed-section">
                <h3 class="quiz-missed-heading">本轮薄弱与待巩固卡片（${missed.length}）</h3>
                <div class="quiz-missed-list">
                  ${missed
                    .map(({ question }) => {
                      const card = cardMap[question.cardId];
                      if (!card) return '';
                      return `
                        <button type="button" class="quiz-missed-item" data-inspect-card="${escapeHtml(card.id)}">
                          <span class="quiz-missed-code">${escapeHtml(card.code)}</span>
                          <span class="quiz-missed-title">${escapeHtml(card.title)}</span>
                          <span class="quiz-missed-go">3D 赏析</span>
                        </button>
                      `;
                    })
                    .join('')}
                </div>
              </div>
            `
            : `<p class="quiz-perfect-note">本轮全题通关，零失误通过品鉴盲测！</p>`
        }

        <div class="quiz-summary-actions">
          ${
            reviewAvailable
              ? '<button type="button" class="quiz-btn-primary" id="quiz-retry-weak">重测薄弱卡</button>'
              : ''
          }
          <button type="button" class="${reviewAvailable ? 'quiz-btn-secondary' : 'quiz-btn-primary'}" id="quiz-play-again">再来一轮</button>
          <button type="button" class="quiz-btn-ghost" id="quiz-summary-gallery">返回图鉴</button>
        </div>
      </div>
    `;

    elStage.querySelectorAll('[data-inspect-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-inspect-card');
        if (id) onInspectCard?.(id);
      });
    });
    elStage.querySelector('#quiz-retry-weak')?.addEventListener('click', () => startSession('review'));
    elStage.querySelector('#quiz-play-again')?.addEventListener('click', () => {
      startSession(activeMode === 'review' && !reviewAvailable ? 'mixed' : activeMode);
    });
    elStage.querySelector('#quiz-summary-gallery')?.addEventListener('click', () => onExitToGallery?.());
  }

  function renderBackFaceContent(q, card) {
    const isMastered = card ? mastery.mastered.has(card.id) : false;
    const isReview = card ? mastery.review.has(card.id) : false;
    const answered = selectedOption !== null;
    const isSkipped = selectedOption === 'skipped';
    const isCorrect = typeof selectedOption === 'number' && selectedOption === q.answerIndex;
    const verdictClass = isSkipped ? 'is-reveal' : isCorrect ? 'is-correct' : 'is-wrong';
    const verdictText = isSkipped ? '解析揭示' : isCorrect ? '回答正确' : '再接再厉';
    const isLast = currentIndex === deck.length - 1;
    const letters = ['A', 'B', 'C', 'D'];

    return `
      <div class="quiz-back-paper">
        <div class="quiz-back-head">
          <span class="quiz-verdict-seal ${verdictClass}">${verdictText}</span>
          ${
            card
              ? `<span class="quiz-revealed-card"><span class="quiz-rev-code">${escapeHtml(card.code)}</span> ${escapeHtml(card.title)}</span>`
              : ''
          }
        </div>

        <div class="quiz-answer-box">
          <div class="quiz-answer-kicker">标准答案 · 选项 ${letters[q.answerIndex]}</div>
          <div class="quiz-answer-text">${escapeHtml(q.options[q.answerIndex])}</div>
        </div>

        ${
          answered && !isSkipped && !isCorrect && typeof selectedOption === 'number'
            ? `<p class="quiz-your-choice">你的选择：${letters[selectedOption]} · ${escapeHtml(q.options[selectedOption])}</p>`
            : ''
        }

        <div class="quiz-explain-block">
          <h3 class="quiz-explain-heading">品鉴官解析</h3>
          <p class="quiz-explain-body">${escapeHtml(q.explanation)}</p>
        </div>

        <div class="quiz-back-tools">
          <button
            type="button"
            class="quiz-mastery-btn ${isMastered ? 'is-mastered' : ''}"
            id="quiz-btn-mastered"
            aria-pressed="${isMastered}"
          >
            ${isMastered ? '已标记掌握' : '标记已掌握'}
          </button>
          <button
            type="button"
            class="quiz-review-btn ${isReview ? 'is-review' : ''}"
            id="quiz-btn-review"
            aria-pressed="${isReview}"
          >
            ${isReview ? '已在待巩固' : '加入待巩固'}
          </button>
          ${
            card
              ? `<button type="button" class="quiz-inspect-btn" id="quiz-btn-inspect">在 3D 展台赏析此卡</button>`
              : ''
          }
        </div>

        <div class="quiz-back-foot">
          <span class="quiz-back-kbd">按 Enter 或 Space 继续</span>
          <button type="button" class="quiz-next-btn" id="quiz-next-btn">
            ${isLast ? '查看品鉴成绩单' : '下一题'}
          </button>
        </div>
      </div>
    `;
  }

  function bindBackFaceEvents(card) {
    elStage.querySelector('#quiz-btn-mastered')?.addEventListener('click', () => {
      if (!card) return;
      setCardMastery(card.id, 'mastered');
      syncBackMasteryButtons(card.id);
    });

    elStage.querySelector('#quiz-btn-review')?.addEventListener('click', () => {
      if (!card) return;
      setCardMastery(card.id, 'review');
      syncBackMasteryButtons(card.id);
    });

    elStage.querySelector('#quiz-btn-inspect')?.addEventListener('click', () => {
      if (card) onInspectCard?.(card.id);
    });

    elStage.querySelector('#quiz-next-btn')?.addEventListener('click', () => {
      advanceNext();
    });
  }

  function renderCurrentQuestion() {
    if (deck.length === 0) {
      renderEmptyReview();
      return;
    }
    if (showingSummary || currentIndex >= deck.length) {
      renderSummary();
      return;
    }

    updateProgressBar();

    const q = deck[currentIndex];
    const card = cardMap[q.cardId];
    const palette = card?.visual?.palette || {};
    const cachedSrc = card ? thumbCache.get(card.id) || '' : '';
    const letters = ['A', 'B', 'C', 'D'];

    elStage.innerHTML = `
      <div class="quiz-card-scene">
        <div class="quiz-card-flipper ${flipped ? 'is-flipped' : ''}" id="quiz-card-flipper">
          <!-- 正面：盲测题面 -->
          <article class="quiz-face quiz-face-front" aria-hidden="${flipped}">
            <div class="quiz-front-grid">
              <div class="quiz-specimen-col">
                <div
                  class="quiz-thumb-box ${q.maskThumb ? 'is-masked' : ''}"
                  style="--card-bg-top:${escapeHtml(palette.bgTop || '#241B16')};--card-bg-bottom:${escapeHtml(palette.bgBottom || '#120D0B')}"
                >
                  <div class="specimen-placeholder ${cachedSrc ? 'is-hidden' : ''}" aria-hidden="true">
                    <span class="specimen-placeholder-frame"></span>
                  </div>
                  <img
                    class="specimen-thumb ${cachedSrc ? 'is-loaded' : ''}"
                    data-card-id="${escapeHtml(card?.id || '')}"
                    ${cachedSrc ? `src="${cachedSrc}"` : ''}
                    alt="盲测咖啡图鉴标本图"
                    decoding="async"
                  />
                  ${
                    q.maskThumb
                      ? '<div class="quiz-thumb-veil-top" aria-hidden="true">盲测标本</div><div class="quiz-thumb-veil-bottom" aria-hidden="true">翻牌揭示完整档案</div>'
                      : ''
                  }
                </div>
              </div>

              <div class="quiz-question-col">
                <div class="quiz-kicker-row">
                  <span class="quiz-cat-tag">${escapeHtml(q.categoryLabel)}</span>
                  <span class="quiz-q-num">${String(currentIndex + 1).padStart(2, '0')} / ${String(deck.length).padStart(2, '0')}</span>
                </div>

                ${
                  Array.isArray(q.clues) && q.clues.length > 0
                    ? `<div class="quiz-clues">${q.clues.map((c) => `<span class="quiz-clue-pill">${escapeHtml(c)}</span>`).join('')}</div>`
                    : ''
                }

                <h2 class="quiz-prompt">${escapeHtml(q.prompt)}</h2>

                <div class="quiz-options" role="group" aria-label="答题选项">
                  ${q.options
                    .map(
                      (opt, idx) => `
                        <button type="button" class="quiz-option-btn" data-option-idx="${idx}">
                          <span class="quiz-opt-key">${idx + 1}</span>
                          <span class="quiz-opt-letter">${letters[idx]}</span>
                          <span class="quiz-opt-text">${escapeHtml(opt)}</span>
                        </button>
                      `,
                    )
                    .join('')}
                </div>

                <div class="quiz-front-foot">
                  <span class="quiz-kbd-note">键盘 1–4 快捷作答</span>
                  <button type="button" class="quiz-reveal-btn" id="quiz-reveal-btn">直接翻牌看解析</button>
                </div>
              </div>
            </div>
          </article>

          <!-- 背面：温润棉纸解析卡背 -->
          <article class="quiz-face quiz-face-back" id="quiz-face-back" aria-hidden="${!flipped}">
            ${renderBackFaceContent(q, card)}
          </article>
        </div>
      </div>
    `;

    const imgEl = elStage.querySelector('.specimen-thumb');
    const phEl = elStage.querySelector('.specimen-placeholder');
    if (card) loadThumbInto(card, imgEl, phEl);

    elStage.querySelectorAll('[data-option-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.optionIdx);
        submitAnswer(idx);
      });
    });

    elStage.querySelector('#quiz-reveal-btn')?.addEventListener('click', () => {
      submitAnswer('skipped');
    });

    bindBackFaceEvents(card);
  }

  function syncBackMasteryButtons(cardId) {
    const masteredBtn = elStage.querySelector('#quiz-btn-mastered');
    const reviewBtn = elStage.querySelector('#quiz-btn-review');
    const isMastered = mastery.mastered.has(cardId);
    const isReview = mastery.review.has(cardId);

    if (masteredBtn) {
      masteredBtn.classList.toggle('is-mastered', isMastered);
      masteredBtn.setAttribute('aria-pressed', String(isMastered));
      masteredBtn.textContent = isMastered ? '已标记掌握' : '标记已掌握';
    }
    if (reviewBtn) {
      reviewBtn.classList.toggle('is-review', isReview);
      reviewBtn.setAttribute('aria-pressed', String(isReview));
      reviewBtn.textContent = isReview ? '已在待巩固' : '加入待巩固';
    }
  }

  function submitAnswer(choice) {
    if (flipped || showingSummary || currentIndex >= deck.length) return;
    const q = deck[currentIndex];
    const card = cardMap[q.cardId];
    selectedOption = choice;
    const isSkipped = choice === 'skipped';
    const isCorrect = !isSkipped && choice === q.answerIndex;

    sessionResults.push({ question: q, correct: isCorrect, skipped: isSkipped });

    if (q.cardId) {
      if (isCorrect) {
        mastery.review.delete(q.cardId);
        mastery.mastered.add(q.cardId);
      } else {
        mastery.review.add(q.cardId);
        mastery.mastered.delete(q.cardId);
      }
      notifyMastery();
      renderModes();
    }

    flipped = true;
    updateProgressBar();

    const flipper = elStage.querySelector('#quiz-card-flipper');
    const backFace = elStage.querySelector('#quiz-face-back');
    const frontFace = elStage.querySelector('.quiz-face-front');

    if (flipper && backFace) {
      backFace.innerHTML = renderBackFaceContent(q, card);
      bindBackFaceEvents(card);
      frontFace?.setAttribute('aria-hidden', 'true');
      backFace.setAttribute('aria-hidden', 'false');
      flipper.classList.add('is-flipped');
    } else {
      renderCurrentQuestion();
    }
  }

  function advanceNext() {
    if (showingSummary) return;
    if (currentIndex + 1 >= deck.length) {
      showingSummary = true;
      flipped = false;
      renderSummary();
      return;
    }
    currentIndex++;
    flipped = false;
    selectedOption = null;
    renderCurrentQuestion();
  }

  function startSession(modeId = 'mixed') {
    activeMode = modeId;
    deck = buildDeckForMode(modeId);
    currentIndex = 0;
    flipped = false;
    selectedOption = null;
    sessionResults = [];
    showingSummary = false;
    renderModes();
    renderCurrentQuestion();
  }

  function handleKeyDown(event) {
    if (mountEl.hidden) return false;
    if (showingSummary || deck.length === 0) return false;

    const key = event.key;
    if (!flipped && ['1', '2', '3', '4'].includes(key)) {
      event.preventDefault();
      submitAnswer(Number(key) - 1);
      return true;
    }

    if (key === 'Enter' || key === ' ') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        return false;
      }
      event.preventDefault();
      if (flipped) {
        advanceNext();
      } else {
        submitAnswer('skipped');
      }
      return true;
    }

    return false;
  }

  elExitBtn?.addEventListener('click', () => onExitToGallery?.());

  notifyMastery();
  startSession('mixed');

  return {
    startSession,
    onShow() {
      mastery = loadMasteryState();
      notifyMastery();
      renderModes();
      if (deck.length === 0 && activeMode !== 'review') {
        startSession('mixed');
      } else {
        renderCurrentQuestion();
      }
    },
    getMasteryStats: () => ({
      masteredCount: mastery.mastered.size,
      reviewCount: mastery.review.size,
      masteredIds: new Set(mastery.mastered),
      reviewIds: new Set(mastery.review),
    }),
    handleKeyDown,
    destroy() {},
  };
}
