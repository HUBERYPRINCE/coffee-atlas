/**
 * 世界咖啡豆图鉴 · 百科科普闪卡库（共 25 张）
 * - 组一 species（5 张）：SP-01 ~ SP-05 核心豆种基因卡
 * - 组二 variety（8 张）：VR-01 ~ VR-08 精品细分品种卡
 * - 组三 origin（6 张）：RG-01 ~ RG-06 世界风土产区卡（含中国云南专题与瑰夏百年迁徙图）
 * - 组四 craft_tasting（6 张）：PR-01 ~ PR-03 / TA-01 ~ TA-03 工艺与专业品鉴百科卡
 */

export const KNOWLEDGE_CARDS = [
  // =========================================================================
  // 组一：核心豆种基因卡（species · 5 张）
  // =========================================================================
  {
    id: 'sp-01-arabica',
    code: 'SP-01',
    cardType: 'knowledge_card',
    group: 'species',
    topic: '核心豆种',
    title: '阿拉比卡 · Coffea arabica',
    subtitle: '44 条染色体的异源四倍体 · 精品咖啡绝对霸主',
    tagline: '高糖分、高脂质、低咖啡因——史前东非一次偶然的自然杂交，成就了人类杯中千变万化的花果香气。',
    tags: ['豆种', '阿拉比卡', '阿豆', '四倍体', '高海拔', '精品基石'],
    relatedCardIds: [
      'sp-02-robusta',
      'sp-05-eugenioides',
      'vr-01-geisha',
      'ca-01-esmeralda-green',
      'af-05-kaffa-washed',
    ],
    summary:
      '阿拉比卡（Coffea arabica）贡献了全球约 55%–60% 的咖啡产量，更是精品单品手冲世界的绝对主角。它是商业咖啡物种中唯一的异源四倍体（2n=4x=44）且可自花授粉，天然拥有高达 6%–9% 的蔗糖与 15%–17% 的脂质，经烘焙可演化出逾 800–1000 种芳香化合物。',
    keyTakeaway:
      '阿拉比卡的优雅风味源于“高糖高脂 + 温和低咖啡因”的化学黄金配比，但也因遗传狭窄与抗病偏弱，极为依赖高海拔凉爽风土与精细栽培。',
    mythBuster:
      '包装印着「100% 阿拉比卡」绝不等于一定是好咖啡！低海拔粗放种植、虫蛀霉变或过度焦烘的大宗商业阿豆同样寡淡苦涩；决定上限的是基因品种 × 高海拔风土 × 全红果采收 × 精致处理 × 恰当烘焙的五重叠加。',
    metrics: [
      { label: '染色体数', value: '44 条（四倍体）' },
      { label: '咖啡因含量', value: '1.2% – 1.5%' },
      { label: '蔗糖 / 脂质', value: '6–9% / 15–17%' },
      { label: '全球产量占比', value: '约 55% – 60%' },
    ],
    highlights: [
      '演化身世：由母本尤金尼奥伊德斯（C. eugenioides）与父本罗布斯塔（C. canephora）在史前东非自然杂交加倍诞生。',
      '生豆外观：呈修长椭圆扁平状，中央裂纹（中缝）多带优雅的微弯 S 型曲线。',
      '风土挑剔：最适 800–2200m（精品多 >1200m）、年均温 18–22℃，极易感咖啡叶锈病（CLR）与浆果病（CBD）。',
      '风味光谱：涵盖茉莉白花、明亮柑橘、浆果、核果、蜂蜜焦糖与丝滑茶感，香气层次冠绝咖啡属。',
    ],
    tableHeaders: ['核心维度', '阿拉比卡 (Arabica)', '罗布斯塔 (Robusta)'],
    comparisonTable: [
      { metric: '染色体倍性', colA: '44 条（异源四倍体，自花授粉）', colB: '22 条（二倍体，异花授粉）' },
      { metric: '适宜海拔', colA: '800–2200m（精品 >1200m）', colB: '0–900m（精品可达 1200m）' },
      { metric: '咖啡因干重', colA: '1.2% – 1.5%', colB: '2.2% – 2.7%（约 2 倍）' },
      { metric: '蔗糖 / 脂质', colA: '糖 6–9% · 脂 15–17%', colB: '糖 3–7% · 脂 10–11.5%' },
      { metric: '生豆形态', colA: '椭圆扁平，中缝呈微弯 S 型', colB: '偏圆鼓厚实，中缝笔直' },
    ],
    sections: [
      {
        heading: '史前自然杂交的演化奇迹',
        body: '植物基因组学研究证实，现代阿拉比卡诞生于距今数十万年前的东非高地：二倍体野生种尤金尼奥伊德斯（赋予优雅低苦与高甜）与中果咖啡罗布斯塔（赋予体量与适应性）发生种间杂交并染色体加倍，形成了能自花授粉的 44 条染色体新物种，并从埃塞俄比亚西南高地与南苏丹博马高原走向世界。',
      },
      {
        heading: '为何高海拔是阿豆的风味放大器',
        body: '阿拉比卡对热量极为敏感。在 1500m 以上冷凉山坡与大昼夜温差中，咖啡樱桃成熟周期被拉长 1–2 个月，更多光合作用产物转化为蔗糖、柠檬酸、苹果酸与萜烯花香前体，生豆结构也更加紧实高密，成为精品手冲与世界赛事的核心舞台。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.48,
      palette: {
        primary: '#234236',
        secondary: '#D6A25E',
        accent: '#6E9A74',
        bgTop: '#12221B',
        bgBottom: '#254236',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'botanical_grid',
        subjectMotif: 'species_arabica',
        effectParticles: ['botanical_pollen', 'gold_dust'],
        lineartPattern: 'taxonomy_engraving',
        heroDir: 'sp-01-arabica',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'sp-02-robusta',
    code: 'SP-02',
    cardType: 'knowledge_card',
    group: 'species',
    topic: '核心豆种',
    title: '罗布斯塔 · Fine Robusta 正名',
    subtitle: 'Coffea canephora · 双倍咖啡因的强韧守护者',
    tagline: '高咖啡因与厚重油脂不只是提神利器——在 CQI 80+ 精品浪潮下，精细处理的罗豆正彻底改写风味偏见。',
    tags: ['豆种', '罗布斯塔', '罗豆', 'Fine Robusta', '意式油脂', '高咖啡因'],
    relatedCardIds: [
      'sp-01-arabica',
      'sp-05-eugenioides',
      'rg-04-asia-pacific',
      'pr-01-classic-process',
      'ta-01-sca-cva-wheel',
    ],
    summary:
      '中果咖啡罗布斯塔（Coffea canephora）原产撒哈拉以南低地雨林，占全球总产量约 40%–45% 且受气候变暖推动占比持续攀升。其约 2.2%–2.7% 的高咖啡因与 7%–10% 高绿原酸构成天然防虫防病化学盾牌，是意式浓缩丰厚 Crema 与越南滴漏咖啡的灵魂力量。',
    keyTakeaway:
      '罗豆过去难喝多因“低地粗放 + 青果混采 + 粗糙烘干”；当进入高海拔、全红果手采与精细水洗/厌氧后，CQI 80 分以上的 Fine Robusta 可呈现黑巧、太妃糖与烤榛果奶油甜。',
    mythBuster:
      '「罗布斯塔 = 廉价橡胶苦水，精品咖啡绝不碰罗豆」是过时的刻板印象！CQI 已设立独立的 Q Robusta 认证体系（80+ 认定为精品罗豆），越南大叻、印度马拉巴尔（Kaapi Royale）与巴西朗多尼亚的精品罗豆已频频登上精品手冲与高端意式拼配吧台。',
    metrics: [
      { label: '染色体数', value: '22 条（二倍体）' },
      { label: '咖啡因含量', value: '2.2% – 2.7%+' },
      { label: '适宜海拔', value: '0–900m（精品可达 1200m）' },
      { label: '全球产量占比', value: '约 40% – 45%' },
    ],
    highlights: [
      '天然化学盾牌：高咖啡因与高绿原酸强力抵御咖啡叶锈病与虫害，耐 24–30℃ 高温高湿。',
      '意式黄金拍档：较低脂质搭配丰富蛋白与多糖，高压萃取能激发出极其浓密持久的虎斑 Crema。',
      '生豆辨识：豆粒较阿豆更圆润鼓胀，中缝笔直清晰，烘焙后膨大率与耐热性表现独特。',
      'Fine Robusta 标杆：严格零一级瑕疵 + 全红果采收，带来焦糖、烤榛果、黑李与奶油般浓醇体感。',
    ],
    tableHeaders: ['比较维度', '传统商业罗豆', '精品罗豆 (Fine Robusta)'],
    comparisonTable: [
      { metric: '采收与瑕疵', colA: '青红混采、高瑕疵混杂', colB: '全红果手采、CQI 零一级瑕疵' },
      { metric: '处理工艺', colA: '粗糙平地晒干易发霉', colB: '精致水洗 / 蜜处理 / 厌氧发酵' },
      { metric: '杯测标准', colA: '大宗商品期货无感官门槛', colB: 'CQI Q Robusta 协议 ≥ 80 分' },
      { metric: '典型风味', colA: '橡胶、木屑、尖锐焦苦', colB: '黑巧、太妃糖、烤榛果、黑李奶油' },
      { metric: '核心产地', colA: '低地规模化农场', colB: '越南大叻、印度、乌干达、巴西' },
    ],
    sections: [
      {
        heading: '传统意式拼配的秘密武器',
        body: '正统意大利南部浓缩配方中常拼配 10%–30% 优质水洗罗布斯塔：它不仅显著拉升咖啡液的醇厚重量感与油脂泡沫厚度，在注入大量热牛奶制成卡布奇诺或拿铁时，更能让黑巧克力与烤坚果的咖啡骨架穿透乳香而不被稀释。',
      },
      {
        heading: '气候变化时代的育种基石',
        body: '面对全球变暖与咖啡叶锈病肆虐，罗布斯塔还通过 1920 年代东帝汶自然形成的「帝汶杂交种（Híbrido de Timor）」将宝贵的抗锈基因传递给卡蒂姆、萨奇姆等现代高抗性阿拉比卡品系，持续守护世界咖啡供应链的韧性。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.50,
      palette: {
        primary: '#4E311E',
        secondary: '#C98A42',
        accent: '#8B5A3C',
        bgTop: '#21140C',
        bgBottom: '#472B1A',
        paperTint: '#F5EFE5',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'botanical_grid',
        subjectMotif: 'species_robusta',
        effectParticles: ['cocoa_flake', 'gold_dust'],
        lineartPattern: 'taxonomy_engraving',
        heroDir: 'sp-02-robusta',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'sp-03-liberica',
    code: 'SP-03',
    cardType: 'knowledge_card',
    group: 'species',
    topic: '核心豆种',
    title: '利比里卡 · Coffea liberica',
    subtitle: '20 米热带巨木与不对称水滴巨豆 · 南洋咖啡灵魂',
    tagline: '长得像一滴不对称的琥珀泪珠——带着菠萝蜜、烟熏木质与野性花香，撑起东南亚百年传统风味。',
    tags: ['豆种', '利比里卡', '南洋咖啡', 'Barako', '菠萝蜜风味', '稀缺物种'],
    relatedCardIds: [
      'sp-04-excelsa',
      'sp-01-arabica',
      'rg-04-asia-pacific',
      'ap-01-sumatra-mandheling',
    ],
    summary:
      '大果咖啡利比里卡（Coffea liberica）原产西非利比里亚及大西洋沿岸低地，19 世纪末曾因抗叶锈病临危受命远渡东南亚。它可长成高达 15–20 米的雄伟乔木，结出咖啡属中体型最为硕大且呈特征性不对称水滴状的种子，如今全球占比虽不足 1%–2%，却是菲律宾与马来西亚传统咖啡文化不可替代的图腾。',
    keyTakeaway:
      '利比里卡绝非“平庸替代品”，它拥有全咖啡界独一无二的「热带熟菠萝蜜 + 烟熏雪松木质 + 淡雅花香」奔放香谱，极具风味辨识度。',
    mythBuster:
      '很多人以为利比里卡是高咖啡因的猛烈苦豆，其实它的干重咖啡因含量仅约 1.2%–1.5%，与阿拉比卡几乎处于同一温和水平；它厚重的野性风味来自极特殊的挥发性酯类与木质芳香化合物，而非高咖啡因。',
    metrics: [
      { label: '染色体数', value: '22 条（二倍体）' },
      { label: '树高与豆形', value: '15–20m · 硕大水滴形' },
      { label: '咖啡因含量', value: '1.2% – 1.5%' },
      { label: '全球产量占比', value: '< 1% – 2%（含埃克塞尔萨）' },
    ],
    highlights: [
      '形态奇观：叶片厚大革质，咖啡果皮坚韧厚实，生豆不仅硕大而且一端微微弯钩，极易肉眼辨识。',
      '极强适应力：深扎低地黏土（0–600m），耐湿热与强光，抗病虫害与抗逆能力远超阿拉比卡。',
      '历史救火队长：1870s–1890s 东南亚叶锈病大爆发摧毁爪哇阿豆后，利比里卡一度成为紧急替代支柱。',
      '文化名片：菲律宾国民咖啡 Kapeng Barako 与马来西亚传统南洋 Kopi / 海南白咖啡拼配的标志香气源。',
    ],
    tableHeaders: ['特征维度', '利比里卡 (Liberica)', '阿拉比卡 (Arabica)'],
    comparisonTable: [
      { metric: '植株高度', colA: '15–20 米高大乔木（采摘难）', colB: '约 2–5 米修剪灌木/小乔木' },
      { metric: '生豆尺寸', colA: '硕大不对称水滴形，两端微钩', colB: '中等椭圆扁平，中缝呈 S 型' },
      { metric: '适宜气候', colA: '0–600m 湿热低地黏土', colB: '800–2200m 凉爽山地' },
      { metric: '标志风味', colA: '菠萝蜜、熟热带果、烟熏木质', colB: '茉莉白花、柑橘、莓果、茶感' },
      { metric: '代表饮法', colA: '菲律宾 Barako、马来西亚 Kopi', colB: '精品手冲、SOE 意式' },
    ],
    sections: [
      {
        heading: '烘焙与采摘的双重挑战',
        body: '利比里卡果皮坚厚、果肉紧实，成熟樱桃处理脱壳的得豆率偏低，且高耸树体大幅提高了人工采摘全红果的成本；同时大尺寸不对称豆体在烘焙时热传导更慢，极易外焦内生。然而近年来马来西亚砂拉越（Sarawak）与沙巴的精品微批次通过精致日晒与蜜处理，已成功将其菠萝蜜与热带果酒甜香推向国际手冲展台。',
      },
      {
        heading: '南洋 Kopi 迷人焦香的幕后功臣',
        body: '在传统马来西亚与新加坡咖啡店（Kopitiam）中，烘焙师常将利比里卡与白糖、黄油一同深度翻炒（焦糖化传统工艺），利用其浓郁的木质与热带果干骨架，冲泡后加入炼乳或淡奶，造就了风靡百年的丝滑南洋咖啡传奇。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'gold',
      foilStrength: 0.52,
      palette: {
        primary: '#3B4A2D',
        secondary: '#D99B38',
        accent: '#7D5236',
        bgTop: '#1A2114',
        bgBottom: '#354527',
        paperTint: '#F5EFE3',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'island',
        subjectMotif: 'species_liberica',
        effectParticles: ['tropical_spark', 'cedar_leaf', 'gold_dust'],
        lineartPattern: 'taxonomy_engraving',
        heroDir: 'sp-03-liberica',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'sp-04-excelsa',
    code: 'SP-04',
    cardType: 'knowledge_card',
    group: 'species',
    topic: '核心豆种',
    title: '埃克塞尔萨 · Excelsa',
    subtitle: 'Coffea liberica var. dewevrei · 酸甜与深沉兼具的双面行者',
    tagline: '一口喝下两种截然相反的咖啡灵魂——前段是李子与覆盆子明亮果酸，中后段骤转为深沉可可与烤木厚韵。',
    tags: ['豆种', '埃克塞尔萨', 'Excelsa', '双面风味', '抗旱物种', '分类学'],
    relatedCardIds: [
      'sp-03-liberica',
      'sp-02-robusta',
      'sp-01-arabica',
      'rg-04-asia-pacific',
    ],
    summary:
      '埃克塞尔萨（Excelsa）原产中非乍得湖周边与喀麦隆，植株高大且抗旱耐贫瘠能力极强。在商业贸易中它常被并列为“世界第四大咖啡豆种”，最令品鉴师着迷的是其极为罕见的双极风味结构：既兼具浅烘般的明亮酸果，又自带深烘般的醇厚木质尾韵。',
    keyTakeaway:
      '埃克塞尔萨是拼配师心中的“立体景深调味剂”——少量加入就能同时拉高前段果酸亮度与中后段深沉厚度，赋予整杯咖啡戏剧化的层次转折。',
    mythBuster:
      '「埃克塞尔萨是完全独立于利比里卡的第四大植物学物种」——其实自 2006 年起，英国邱园植物学家 Aaron Davis 等基于形态与分子系统发育学，已正式将其重新归类为利比里卡的变种（Coffea liberica var. dewevrei）；但在贸易与风味品鉴上，因口感明显更轻盈果酸，行业仍习惯将其单列讨论。',
    metrics: [
      { label: '植物学归属', value: 'C. liberica var. dewevrei' },
      { label: '染色体数', value: '22 条（二倍体）' },
      { label: '咖啡因含量', value: '约 1.0% – 1.5%' },
      { label: '适宜海拔', value: '0–1000m（极抗旱）' },
    ],
    highlights: [
      '独特双面风味：前段呈现酒石酸般的覆盆子、酸李子与酒香果酸，中后段过渡至黑巧、烤坚果与木质厚重感。',
      '气候韧性王者：主根深厚、极其耐旱耐贫瘠、树龄长，在干旱低海拔环境中依然稳产。',
      '外形分辨：虽与利比里卡同源，但豆粒通常更小巧圆润，水滴弯钩不如标准利比里卡夸张。',
      '新兴潜力股：在越南、乌干达与南苏丹正涌现出面向精品手冲与气候适应研究的单品微批次。',
    ],
    tableHeaders: ['对比维度', '埃克塞尔萨 (Excelsa)', '标准利比里卡 (Liberica)'],
    comparisonTable: [
      { metric: '分类学地位', colA: '利比里卡变种 var. dewevrei', colB: '利比里卡原变种 C. liberica' },
      { metric: '生豆外形', colA: '较小而圆润，略呈椭圆水滴', colB: '体形硕大厚重，不对称明显' },
      { metric: '风味重心', colA: '前段李子/覆盆子明酸 + 后段可可', colB: '热带菠萝蜜熟果 + 烟熏木质' },
      { metric: '生态专长', colA: '极强耐旱、耐贫瘠红土', colB: '耐湿热雨林低地黏土' },
      { metric: '主要用途', colA: '提亮拼配层次、小众单品手冲', colB: '东南亚传统咖啡、特色风味' },
    ],
    sections: [
      {
        heading: '为什么品鉴界称它“同时住着浅烘与深烘”',
        body: '普通咖啡豆往往呈单向风味倾斜（要么清新酸甜、要么沉稳苦甜），而埃克塞尔萨天然富含活泼果酸前体与厚重木质酚类：入口瞬间舌侧生津，紧接着中后段口腔迅速被烘烤可可与淡淡烟熏厚重感包裹，极具结构反差魅力。',
      },
      {
        heading: '面向 2050 气候变暖的备份基因库',
        body: '随着全球升温导致传统阿拉比卡高海拔适生区不断萎缩，植物学家正重新评估包括埃克塞尔萨与狭叶咖啡（C. stenophylla）在内的野生抗旱二倍体物种——它们既是极具潜力的独立风味农作物，也为未来抗旱育种提供了珍贵遗传宝库。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'pearl',
      foilStrength: 0.48,
      palette: {
        primary: '#632B45',
        secondary: '#D69A4B',
        accent: '#B75368',
        bgTop: '#24111B',
        bgBottom: '#4E2237',
        paperTint: '#F6EFEA',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'botanical_grid',
        subjectMotif: 'species_excelsa',
        effectParticles: ['berry_glow', 'cocoa_flake', 'pearl_dust'],
        lineartPattern: 'taxonomy_engraving',
        heroDir: 'sp-04-excelsa',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'sp-05-eugenioides',
    code: 'SP-05',
    cardType: 'knowledge_card',
    group: 'species',
    topic: '核心豆种',
    title: '尤金尼奥伊德斯 · 冠军祖先种',
    subtitle: 'Coffea eugenioides · 阿拉比卡的天然低因母本',
    tagline: '几乎零苦味的“液体棉花糖”——这颗极小粒的东非野生二倍体，在 2021 年双杀世界咖啡师与冲煮冠军。',
    tags: ['豆种', '尤金尼奥伊德斯', 'Eugenioides', '天然低因', 'WBC冠军', '狭叶咖啡'],
    relatedCardIds: [
      'sp-01-arabica',
      'sp-02-robusta',
      'vr-08-laurina-sidra',
      'rg-02-africa',
    ],
    summary:
      '尤金尼奥伊德斯（Coffea eugenioides）原产东非大裂谷高地森林（肯尼亚、乌干达、卢旺达、刚果东部），是阿拉比卡的“亲生母亲”物种。其生豆极其细小修长、产量稀少，却天生仅有 0.3%–0.6% 极低咖啡因与极低绿原酸苦度，冲煮出震撼世界的棉花糖、冰糖与丝绒奶甜感。',
    keyTakeaway:
      '2021 年米兰 WBC 与 WBrC 双冠均选用哥伦比亚 Finca Inmaculada 培育的 Eugenioides，彻底打破了“世界顶级竞赛只能用瑰夏等阿拉比卡”的传统铁律。',
    mythBuster:
      '「尤金尼奥伊德斯是人工基因编辑出来的脱因咖啡」——完全错误！它是如假包换的东非野生原生二倍体物种（2n=22），其极低咖啡因与近乎零苦味的清甜体感完全源于天然基因表达，无需任何化学或水处理脱因工艺。',
    metrics: [
      { label: '染色体数', value: '22 条（阿拉比卡母本）' },
      { label: '咖啡因含量', value: '0.3% – 0.6%（仅阿豆 1/3）' },
      { label: '适宜海拔', value: '1000–2200m 高地林荫' },
      { label: '全球产量占比', value: '< 0.01%（极稀缺微批次）' },
    ],
    highlights: [
      '甜度天花板：极低苦味生物碱搭配高游离糖，入口仿佛甜麦片、棉花糖、冰糖与熟热带甜果。',
      '2021 封神双冠：Diego Campos（WBC）与 Matt Winton（WBrC）双双凭该物种夺得世界冠军。',
      '极度娇贵稀缺：单株挂果率极低且豆粒极小，商业化微批次克价甚至超越顶级竞赛瑰夏。',
      '未来气候前沿：英国邱园近年发掘的西非野生种狭叶咖啡（C. stenophylla）可耐高温 +6℃ 且具水蜜桃接骨木花香，被视为“2050 未来之豆”。',
    ],
    tableHeaders: ['物种维度', '尤金尼奥伊德斯', '阿拉比卡 (子代)', '狭叶咖啡 (前沿种)'],
    comparisonTable: [
      { metric: '染色体倍性', colA: '22 条（二倍体母本）', colB: '44 条（四倍体）', colC: '22 条（西非野生种）' },
      { metric: '咖啡因含量', colA: '0.3% – 0.6% 极低', colB: '1.2% – 1.5%', colC: '约 1.8%–2.2%' },
      { metric: '苦度与酸感', colA: '几乎无苦，酸极柔和', colB: '酸质明亮，微苦平衡', colC: '明亮桃子与优雅花酸' },
      { metric: '核心风味', colA: '棉花糖、冰糖、奶甜', colB: '茉莉、柑橘、莓果茶感', colC: '水蜜桃、接骨木花' },
      { metric: '行业意义', colA: '2021 双冠/极甜奇观', colB: '当下精品商业主力', colC: '耐高温 +6℃ 气候希望' },
    ],
    sections: [
      {
        heading: '为什么喝起来像融化的棉花糖与甜麦片',
        body: '咖啡中的苦涩感很大一部分来自咖啡因与绿原酸降解产物。尤金尼奥伊德斯将咖啡因压低至普通阿拉比卡的三分之一左右，几乎移除了阻碍甜味感知的苦味背景噪音，令天然游离糖与芳香酯类在口腔中呈现出令人难以置信的纯净甜度与柔和丝绒感。',
      },
      {
        heading: '从单一物种走向多物种精品咖啡时代',
        body: '尤金尼奥伊德斯在世界赛场的胜利与狭叶咖啡（Coffea stenophylla）的重新发现，标志着人类对咖啡的探索正从“在阿拉比卡内部精挑品种”迈向“重新发掘整个咖啡属 130 多个野生近缘种基因宝藏”的全新纪元。',
      },
    ],
    visual: {
      rarity: 'legendary',
      defaultFinish: 'pearl',
      foilStrength: 0.64,
      palette: {
        primary: '#6D4B7A',
        secondary: '#E8C58E',
        accent: '#E99DB3',
        bgTop: '#24172B',
        bgBottom: '#4E335A',
        paperTint: '#FAF3F7',
      },
      layers: {
        mode: 'hybrid',
        bgMotif: 'botanical_grid',
        subjectMotif: 'species_eugenioides',
        effectParticles: ['vanilla_pearl', 'strawberry_mist', 'gold_dust'],
        lineartPattern: 'taxonomy_engraving',
        heroDir: 'sp-05-eugenioides',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.48, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  // =========================================================================
  // 组二：精品细分品种卡（variety · 8 张）
  // =========================================================================
  {
    id: 'vr-01-geisha',
    code: 'VR-01',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '瑰夏 · Geisha / Gesha',
    subtitle: '埃塞原生基因 × 巴拿马火山演化的世纪花香传奇',
    tagline: '用一缕茉莉、玫瑰与佛手柑，彻底重写了人类对咖啡香气上限的想象。',
    tags: ['品种', '瑰夏', '艺伎', 'Gesha', 'T2722', '巴拿马', '埃塞原生'],
    relatedCardIds: [
      'ca-01-esmeralda-green',
      'af-04-gori-natural',
      'af-05-kaffa-washed',
      'af-06-kaffa-natural',
      'rg-06-geisha-migration',
    ],
    summary:
      '瑰夏（Geisha / Gesha）源自埃塞俄比亚西南部戈里瑰夏森林（Gori Gesha / 广义卡法地区），经 1953 年哥斯达黎加 CATIE 编目（T2722）与 1963 年引入巴拿马后，于 2004 年由波奎特翡翠庄园在最佳巴拿马（BOP）大赛一战封神，开启全球“瑰夏时代”。',
    keyTakeaway:
      '瑰夏是一枚极为挑剔海拔的“芳香放大器”——唯有在 1600m 以上冷凉微气候慢熟，才能彻底激活标志性的单萜烯（芳樟醇、香叶醇）香水花香与丝绸茶韵。',
    mythBuster:
      '中文译名「艺伎」纯属英文拼写 Geisha 的音译巧合，与日本艺伎文化毫无关联！它原本得名于埃塞俄比亚西南部的地名「Gesha」（1931 年英国领事馆档案流转中拼写演变为 Geisha），如今精品界越来越多地写作 Gesha 以致敬原乡。',
    metrics: [
      { label: 'WCR 系谱归属', value: '埃塞原生地方种' },
      { label: '黄金海拔门槛', value: '≥ 1600–2100m' },
      { label: '关键编号', value: 'CATIE T2722' },
      { label: '封神里程碑', value: '2004 BOP 翡翠庄园' },
    ],
    highlights: [
      '植株特征：树形高大纤细、侧枝呈 45° 上扬、叶片狭长；根系浅且挂果稀疏，单株产量极低。',
      '生豆外观：细长饱满、两头微尖，与巴拿马/哥伦比亚/埃塞不同风土结合均展现极高香气穿透力。',
      '双脉风味对照：埃塞原生瑰夏偏内敛绿茶柑橘或野性热带果茶；巴拿马纯系瑰夏则绽放高扬玫瑰茉莉与佛手柑香水感。',
      '本图鉴实测：本套图鉴收录 6 支跨越埃塞戈里、卡法、格拉纳、哥伦比亚白山与巴拿马翡翠的瑰夏全谱对比！',
    ],
    tableHeaders: ['对照维度', '埃塞原生瑰夏（卡法/戈里）', '巴拿马高地瑰夏（T2722 系）'],
    comparisonTable: [
      { metric: '基因构成', colA: '原始森林多态野生基因库', colB: '经 CATIE 选育的纯系化品系' },
      { metric: '风土环境', colA: '1800–2100m 原始林荫红壤', colB: '1600–2000m 火山黑土云雾' },
      { metric: '水洗典型调', colA: '柑橘、绿茶、白花、坚果焦糖', colB: '高扬玫瑰/茉莉、佛手柑、白桃' },
      { metric: '日晒典型调', colA: '蓝莓、无花果、杏桃、热带果茶', colB: '熟芒果、菠萝蜜汁、华丽花香' },
      { metric: '本库代表卡', colA: 'AF-04 / AF-05 / AF-06', colB: 'CA-01 翡翠绿标瑰夏' },
    ],
    sections: [
      {
        heading: '为何被冷落四十余年才惊艳世界',
        body: '1963 年 Don Pachi 将瑰夏从哥斯达黎加引入巴拿马波奎特时，农夫们最初只看重它的抗锈潜力；然而瑰夏树高枝稀、产量只有卡杜拉的一小半，经济效益极低，常被混种于边角地块当作防风树或冷门备选。直到 2004 年翡翠庄园彼得森家族注意到高海拔哈拉米约地块中这批“味道异乎寻常的咖啡”，将其独立分采送赛 BOP，才一举轰动世界。',
      },
      {
        heading: '同一基因在不同工艺下的万花筒表达',
        body: '通过本套图鉴中的 6 款瑰夏即可直观见证品种与工艺的乘数效应：水洗卡法（AF-05）呈现素颜绿茶柑橘，传统日晒卡法（AF-06）转为蓝莓无花果，冷泉氮气水洗白山（SA-02）拉满 5.0 干净度，而共发酵格拉纳（AF-03）更化作草莓奶糖甜品。',
      },
    ],
    visual: {
      rarity: 'legendary',
      defaultFinish: 'gold',
      foilStrength: 0.64,
      palette: {
        primary: '#164C3A',
        secondary: '#E2B864',
        accent: '#E06C9F',
        bgTop: '#0B281E',
        bgBottom: '#1F5642',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'volcano',
        subjectMotif: 'variety_geisha',
        effectParticles: ['rose_petal', 'citrus_spark', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.34, effectsDepth: 0.50, backgroundDepth: -0.24, subjectScale: 1.08 },
    },
  },

  {
    id: 'vr-02-typica',
    code: 'VR-02',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '铁皮卡 · Typica',
    subtitle: '阿拉比卡古典贵族母系 · 蓝山、科纳与云南老树之源',
    tagline: '产量吝啬却风骨清雅——以极致干净的柑橘清甜与优雅茶韵，写就世界精品咖啡的最初标准。',
    tags: ['品种', '铁皮卡', 'Typica', '古铜嫩叶', '牙买加蓝山', '夏威夷科纳', '云南老树'],
    relatedCardIds: [
      'vr-03-bourbon',
      'cn-01-yunnan-baoshan',
      'ap-01-sumatra-mandheling',
      'rg-05-china-yunnan',
      'sp-01-arabica',
    ],
    summary:
      '铁皮卡（Typica）是阿拉比卡最古老的两大核心商业母系之一（另一为波旁）。17 世纪末经也门传至印度与印尼爪哇岛，18 世纪又经荷兰阿姆斯特丹植物园远渡拉丁美洲与加勒比海，奠定了牙买加蓝山、夏威夷科纳、巴布亚新几内亚与中国云南保山老庄园的经典基因底座。',
    keyTakeaway:
      '铁皮卡代表着“清澈、优雅、克制”的古典精品审美——哪怕在高产抗病杂交种席卷全球的今天，它依然是顶级产区最受敬重的风味标尺。',
    mythBuster:
      '牙买加「蓝山」与夏威夷「科纳」并非独立于铁皮卡之外的神秘新物种，它们的植物学本质正是铁皮卡在特定海岛火山微气候下驯化演化的风土名片（Blue Mountain Typica / Kona Typica）。',
    metrics: [
      { label: 'WCR 系谱归属', value: '铁皮卡系（原生母系）' },
      { label: '形态标识', value: '古铜色嫩叶 + 修长豆粒' },
      { label: '抗病与产量', value: '单产低 · 极易感锈病' },
      { label: '经典衍生名种', value: '蓝山 / 科纳 / 象豆' },
    ],
    highlights: [
      '植物学辨识：植株高大呈圆锥形、枝条舒展，新抽嫩叶多呈迷人的古铜色（Bronze Tip），生豆细长匀称。',
      '风味画像：通透干净的高级质地，明亮细腻的柠檬/柑橘酸质、优雅白花、清甜蔗糖与绵长红茶/乌龙尾韵。',
      '高成本珍稀：因单产低且极易受叶锈病侵袭，全球种植面积曾大幅缩水，如今多被精品庄园高海拔复育。',
      '东方共鸣：中国云南保山潞江坝老树铁皮卡（CN-01）正是百年传入中国的古典血脉延续。',
    ],
    tableHeaders: ['比较维度', '铁皮卡 (Typica)', '波旁 (Bourbon)'],
    comparisonTable: [
      { metric: '嫩叶颜色', colA: '特征性古铜色（Bronze Tip）', colB: '多为清脆嫩绿色' },
      { metric: '植株与产量', colA: '树高枝疏，单产偏低', colB: '分枝更密，产量高约 20–30%' },
      { metric: '生豆形态', colA: '相对修长优雅', colB: '偏小巧饱满圆润' },
      { metric: '核心风味调', colA: '清澈茶感、柠檬白花、高干净度', colB: '圆润饱满、焦糖蜂蜜、熟果甜' },
      { metric: '标志产区', colA: '蓝山、科纳、秘鲁、云南保山', colB: '卢旺达、萨尔瓦多、巴西' },
    ],
    sections: [
      {
        heading: '一棵植物园幼苗改变美洲咖啡史',
        body: '1706 年荷兰人将一株爪哇铁皮卡运回阿姆斯特丹植物园，其后代先赠予法国国王路易十四并种于巴黎植物园，1723 年由法国海军军官德·克利厄冒死护送一株幼苗横渡大西洋抵达马提尼克岛——几乎整个拉丁美洲早期数百年的铁皮卡咖啡林，都源自这极少数几株传奇母树。',
      },
      {
        heading: '为何现代老饕依然迷恋铁皮卡',
        body: '在实验重发酵风味盛行的当下，一杯高海拔精细水洗铁皮卡就像一盏素净清澈的武夷岩茶或大吉岭：它不靠浓烈香气轰炸味蕾，而是以极高的干净度、细腻如丝的柑橘白花与悠长蔗糖回甘，展现最纯粹的山川风土。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'original',
      foilStrength: 0.34,
      palette: {
        primary: '#2E4F41',
        secondary: '#C78E4E',
        accent: '#7CA382',
        bgTop: '#162720',
        bgBottom: '#2B493C',
        paperTint: '#F5F0E6',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'yunnan',
        subjectMotif: 'variety_typica',
        effectParticles: ['tea_mist', 'botanical_pollen'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'vr-03-bourbon',
    code: 'VR-03',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '波旁家族 · Bourbon 谱系',
    subtitle: '红/黄/橙波旁 × 卡杜拉 × 卡杜艾 · 拉美与东非的甜感脊梁',
    tagline: '把高原阳光酿成焦糖与熟果——波旁不仅自身甜润圆润，更衍生出撑起现代精品咖啡半壁江山的庞大家族。',
    tags: ['品种', '波旁', '黄波旁', '卡杜拉', '卡杜艾', '焦糖甜感'],
    relatedCardIds: [
      'sa-03-brazil-cerrado-yb',
      'vr-02-typica',
      'vr-04-pink-bourbon',
      'vr-08-laurina-sidra',
      'rg-03-latin-america',
    ],
    summary:
      '1715 年前后法国人将也门摩卡咖啡引种至印度洋波旁岛（今法属留尼汪岛），在海岛孤立环境中自然演化定型为波旁（Bourbon）。19 世纪传入巴西与东非后，它不仅按隐性突变分化出红、黄、橙波旁，更孕育出矮化高产的卡杜拉（Caturra）、抗风耐雨的卡杜艾（Catuai）与帕卡斯（Pacas）等核心主力品种。',
    keyTakeaway:
      '如果铁皮卡是“清雅骨感”，波旁就是“丰腴甜润”——突出的焦糖、蜂蜜、熟核果与牛奶巧克力醇厚度，令它成为拉美与东非经典产区的品质基石。',
    mythBuster:
      '并非所有叫“某某波旁”的品种都是正统波旁血脉！虽然红/黄/橙波旁、卡杜拉与尖身波旁确属波旁系，但大名鼎鼎的「粉红波旁」与「波旁西德拉」经现代 DNA 检测实则更接近埃塞俄比亚原生地方种。',
    metrics: [
      { label: '起源地与年份', value: '留尼汪岛（1715）' },
      { label: '果色突变', value: '红 / 黄 / 橙波旁' },
      { label: '核心矮化子代', value: '卡杜拉 / 卡杜艾' },
      { label: '典型风味锚点', value: '焦糖、蜂蜜、熟核果' },
    ],
    highlights: [
      '红/黄/橙波旁：黄波旁常见于巴西喜拉多高地（SA-03），往往比红波旁多一分明亮轻快的柑橘与柔和花香。',
      '卡杜拉（Caturra）：1915–1918 年巴西发现的波旁单基因自然矮化突变，适合梯田密植，在哥伦比亚与中美洲呈现活泼柠檬与焦糖坚果。',
      '卡杜艾（Catuai）：1949 年巴西 IAC 以新世界×卡杜拉育成、1972 年发布，果蒂极紧无惧山风暴雨，高海拔蜜处理可绽放黄桃蜂蜜。',
      '栽培短板：纯正波旁系同样不抗叶锈病，近年来面临气候升温压力，正与抗锈品系协同守护风土。',
    ],
    tableHeaders: ['家族成员', '育种起源', '植株与农艺特点', '典型风味侧重'],
    comparisonTable: [
      { metric: '经典红/黄波旁', colA: '1715 留尼汪岛自然定型', colB: '高大、豆粒圆润饱满', colC: '焦糖蜂蜜、黄桃、烤榛果' },
      { metric: '卡杜拉 Caturra', colA: '1915 巴西自然矮化突变', colB: '矮化节间短、适合密植', colC: '明亮柠檬苹果酸、干净平衡' },
      { metric: '卡杜艾 Catuai', colA: '1949 新世界×卡杜拉杂交', colB: '矮化强抗风、极不易落果', colC: '牛奶巧、烤杏仁、高海拔黄桃' },
      { metric: '尖身波旁 Laurina', colA: '1810 留尼汪隐性矮化突变', colB: '圣诞树锥株、天然低因', colC: '白茶荔枝、极低苦清甜' },
    ],
    sections: [
      {
        heading: '从印度洋孤岛走向拉美高地',
        body: '波旁在留尼汪岛演化出比铁皮卡更宽大的叶片与高出约 20%–30% 的单产。19 世纪中叶传入巴西后，很快成为圣保罗与米纳斯吉拉斯高原的当家主力；在卢旺达、布隆迪与萨尔瓦多火山高地，精细水洗的红波旁更以红茶、红苹果与黑糖甜感屡摘 COE 高分。',
      },
      {
        heading: '卡杜拉与卡杜艾：撑起中南美精品效率革命',
        body: '传统波旁树高难以密植采收，而自然矮化的卡杜拉与强抗风的卡杜艾让拉美农夫在陡峭安第斯与中美洲山坡上实现了“既高产又能手摘高分微批次”的平衡，成为哥伦比亚、哥斯达黎加、危地马拉与巴拿马日常精品单品的坚实底盘。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.52,
      palette: {
        primary: '#7A3E1D',
        secondary: '#E3A948',
        accent: '#D46348',
        bgTop: '#29140A',
        bgBottom: '#592C14',
        paperTint: '#F6F0E4',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'highland',
        subjectMotif: 'variety_bourbon',
        effectParticles: ['caramel_spark', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'vr-04-pink-bourbon',
    code: 'VR-04',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '粉红波旁 · Pink Bourbon',
    subtitle: '哥伦比亚慧兰走红的粉霞果 · 基因纠偏的埃塞血脉遗珠',
    tagline: '身披波旁之名的埃塞基因遗珠——成熟如粉红晚霞，一口喝下血橙、粉红西柚与玫瑰交织的清冽华彩。',
    tags: ['品种', '粉红波旁', 'Pink Bourbon', '哥伦比亚', 'DNA纠偏', '血橙玫瑰'],
    relatedCardIds: [
      'vr-03-bourbon',
      'vr-06-heirloom-74110',
      'rg-03-latin-america',
      'sa-02-baishan-n2',
      'vr-08-laurina-sidra',
    ],
    summary:
      '粉红波旁（Pink Bourbon）发现并走红于哥伦比亚慧兰（Huila）小农高地，因成熟咖啡樱桃呈现如晚霞般迷人的鲑鱼粉红色而闻名全球。它兼具埃塞俄比亚豆的奔放花香与拉美火山豆的饱满果汁感，是近年国际手冲赛与国内精品馆点单率飙升的明星宠儿。',
    keyTakeaway:
      '现代 DNA 指纹检测颠覆了行业多年传说：真正的粉红波旁并非“红波旁 × 黄波旁杂交”，而是源自埃塞俄比亚原生地方种聚类且能稳定实播繁衍的独特品种。',
    mythBuster:
      '「粉红波旁是红波旁和黄波旁自然杂交调出来的粉色」——这是咖啡圈流传最广的美丽误会！若是红×黄杂交，后代实播极易发生性状分离；而 WCR 与商业基因测序证实，正统粉红波旁与传统波旁遗传距离很远，直接聚类于埃塞原生地方种群。',
    metrics: [
      { label: '真实基因聚类', value: '埃塞原生地方种' },
      { label: '成熟果色', value: '柔和鲑鱼粉红色' },
      { label: '核心产区', value: '哥伦比亚慧兰/考卡/托利马' },
      { label: '招牌风味', value: '血橙、粉红西柚、白花' },
    ],
    highlights: [
      '极考采摘功力：成熟粉红樱桃与半熟泛红果色泽相近，极其依赖熟练采摘工凭糖度与色泽精准挑采。',
      '风味双璧合体：既有埃塞系高扬玫瑰、茉莉白花与清冽茶感，又有哥伦比亚安第斯高地的红糖厚甜与血橙果汁张力。',
      '农艺韧性更优：相比传统红/黄波旁，粉红波旁在哥伦比亚高地的抗叶锈病与树势表现普遍更为稳健。',
      '工艺百搭之王：经典水洗呈晶莹西柚白花，蜜处理与厌氧则爆发惊艳草莓水蜜桃香气。',
    ],
    tableHeaders: ['对比维度', '早期行业传说', '现代基因检测真相'],
    comparisonTable: [
      { metric: '血缘来源', colA: '误传为红波旁 × 黄波旁杂交', colB: '聚类归属埃塞俄比亚原生地方种' },
      { metric: '种子繁衍', colA: '若为 F1 杂交后代应不稳定', colB: '实播高度稳定保持粉色与花香' },
      { metric: '抗病表现', colA: '推测与波旁一样易感锈病', colB: '田间抗病与活力优于传统波旁' },
      { metric: '风味基因', colA: '仅预期偏焦糖坚果甜', colB: '天生自带埃塞式高扬花香与血橙' },
    ],
    sections: [
      {
        heading: '为什么慧兰小农的粉红樱桃火遍全球',
        body: '当瑰夏因极低产量与高昂价格让人望而却步时，哥伦比亚慧兰产区的粉红波旁以近乎瑰夏级别的花香明亮感、更亲民的产量与更饱满多汁的血橙西柚酸甜迅速俘获全球烘焙师，成为“高性价比花香天花板”的代名词。',
      },
      {
        heading: '从外观命名到 DNA 溯源的时代进步',
        body: '过去咖啡农多按果色与株型直觉命名，导致粉红波旁、西德拉（Sidra）、爪哇（Java）等埃塞血脉后裔长期被误贴标签。随着 World Coffee Research（WCR）基因指纹普及，品种谱系正变得前所未有地透明科学。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'pearl',
      foilStrength: 0.58,
      palette: {
        primary: '#A84260',
        secondary: '#F09A84',
        accent: '#E06C9F',
        bgTop: '#331420',
        bgBottom: '#69273D',
        paperTint: '#FAF0F3',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'highland',
        subjectMotif: 'variety_pink_bourbon',
        effectParticles: ['rose_petal', 'citrus_spark', 'pearl_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.48, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'vr-05-sl28-sl34',
    code: 'VR-05',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '肯尼亚双雄 · SL28 & SL34',
    subtitle: '1930s 斯科特农业实验室选育 · 黑加仑磷酸风味核弹',
    tagline: '生于抗旱实验的东非双星——以奔放的黑加仑、血橙与红酒般丰腴果汁感，征服所有酸质爱好者。',
    tags: ['品种', 'SL28', 'SL34', '肯尼亚', '黑加仑', '磷酸', 'SAL实验室'],
    relatedCardIds: [
      'af-01-kenya-nyeri-aa',
      'rg-02-africa',
      'ta-01-sca-cva-wheel',
      'ta-02-grading-physics',
      'pr-01-classic-process',
    ],
    summary:
      'SL28 与 SL34 是 20 世纪 30 年代由肯尼亚斯科特农业实验室（Scott Agricultural Laboratories，简称 SAL）从数十份候选中编号选育的传世名种。它们在肯尼亚中部高原含磷火山红土上混种共生，配合 72 小时双重水洗，缔造出全世界最具辨识度的黑加仑与圣女果酸甜风暴。',
    keyTakeaway:
      'SL28（波旁系，强耐旱，炸裂黑加仑）与 SL34（铁皮卡系，喜高海拔多雨，丰腴糖浆感）在肯尼亚庄园常成对互补，共同成就“肯尼亚 AA”的金字招牌。',
    mythBuster:
      '历史资料常将 SL28 与 SL34 一概归为波旁系；但 WCR 现代基因检测揭示，SL28 确属波旁相关系谱（源自坦噶尼喀耐旱族群），而 SL34（源自法国传教士单株）实际上归属铁皮卡相关遗传背景！',
    metrics: [
      { label: '选育机构与年代', value: '肯尼亚 SAL（1930s）' },
      { label: '基因系谱', value: 'SL28 波旁系 / SL34 铁皮卡系' },
      { label: '核心酸质类型', value: '标志性磷酸 + 苹果酸' },
      { label: '招牌风味锚点', value: '黑加仑、乌梅、血橙、圣女果' },
    ],
    highlights: [
      'SL28 绝技：深扎根系带来惊人抗旱能力，即便在无灌溉旱季仍能结出大粒高密风味果。',
      'SL34 绝技：深古铜色嫩叶，更擅长适应高海拔多雨冷凉气候，单产略高、酸质更圆润丰腴。',
      '风土加成：肯尼亚火山（Mt. Kenya）南麓富含磷元素的火山红土，赋予两品种独特的磷酸跳跃气泡感。',
      '跨洲扩散：如今哥斯达黎加、萨尔瓦多乃至中国云南高海拔庄园也正引种 SL28 打造竞赛微批次。',
    ],
    tableHeaders: ['对比维度', 'SL28', 'SL34'],
    comparisonTable: [
      { metric: '选育母株来源', colA: '坦噶尼喀耐旱族群单株', colB: '内罗毕 Loresho 法国传教士株' },
      { metric: 'WCR 基因系谱', colA: '波旁相关系谱', colB: '铁皮卡相关系谱' },
      { metric: '气候专长', colA: '抗旱力极佳，深根系', colB: '适应高海拔多雨气候' },
      { metric: '嫩叶与产量', colA: '铜色嫩叶，产果中等大粒', colB: '深古铜嫩叶，产量略高' },
      { metric: '风味轮廓', colA: '爆炸力黑加仑、圣女果、酒体', colB: '明亮柑橘、熟莓果、黑糖浆感' },
    ],
    sections: [
      {
        heading: '抗旱选育意外诞生的风味图腾',
        body: '1930 年代殖民政府设立斯科特农业实验室的初衷，并非追求极致手冲风味，而是寻找能在东非旱季存活并高产商业大粒豆的品种。实验室在 42 个筛选系中定格了第 28 号与第 34 号——它们虽依然易感叶锈病与浆果病，却无心插柳地造就了精品咖啡史上最令人难忘的酸甜图腾。',
      },
      {
        heading: '磷酸与 72 小时双重水洗的化学协奏',
        body: '搭配肯尼亚招牌的「干式发酵 + 清水洗净 + 山泉水二次冷浸泡」双重水洗法，SL28/SL34 不仅去除杂味，更将含磷红土孕育出的磷酸与高蔗糖甜度完美平衡，冷后宛如一杯冰镇乌梅黑加仑鲜榨果汁。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'pearl',
      foilStrength: 0.54,
      palette: {
        primary: '#5E203C',
        secondary: '#E35D3B',
        accent: '#B5385A',
        bgTop: '#240C18',
        bgBottom: '#4F1B33',
        paperTint: '#F6F0E8',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'volcano',
        subjectMotif: 'variety_sl28_sl34',
        effectParticles: ['berry_glow', 'citrus_spark', 'ruby_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.46, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'vr-06-heirloom-74110',
    code: 'VR-06',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '埃塞原生种 & JARC 74110/74158',
    subtitle: '阿拉比卡活体基因库 · 从笼统 Heirloom 到精准纯系溯源',
    tagline: '每颗小巧均一的 74110 豆粒里，都锁着 1974 年东非原始森林抗病选育的花园密码。',
    tags: ['品种', '埃塞原生种', 'Heirloom', '74110', '74158', '花魁', 'JARC'],
    relatedCardIds: [
      'rg-02-africa',
      'af-04-gori-natural',
      'af-05-kaffa-washed',
      'af-03-gelana-coferm',
      'vr-01-geisha',
    ],
    summary:
      '埃塞俄比亚是阿拉比卡的发源与遗传多样性中心，境内分布着数千种野生与农家地方种，过去贸易上常笼统统称为「Heirloom（原生种）」。自 1974 年吉马农业研究中心（JARC）在西南部森林选育出抗浆果病的纯系 74110、74158、74112 后，精准编号纯系已取代模糊标签，成为现代耶加雪菲与古姬高分批次（如“花魁”系列）的明星主角。',
    keyTakeaway:
      '74110 与 74158 既是拯救埃塞免遭浆果病重创的抗病英雄，更因豆粒极度均一、风味极高干净度与水蜜桃白花香，引领埃塞咖啡迈入精准基因溯源时代。',
    mythBuster:
      '「Heirloom 是一种特定咖啡品种的名字」——并不准确！Heirloom 本质上是贸易商用来泛指“埃塞俄比亚千百种未细分野生/地方种混合体”的统称；当你在豆卡上看到 74110、74158 或 Kurume、Wolisho 时，才代表真正追踪到了清晰纯系。',
    metrics: [
      { label: '选育年份与机构', value: '1974 · 吉马中心 (JARC)' },
      { label: '采集原乡', value: '伊鲁巴博尔梅图森林' },
      { label: '核心抗病力', value: '强抗咖啡浆果病 (CBD)' },
      { label: '经典代表风味', value: '水蜜桃、茉莉、红茶花蜜' },
    ],
    highlights: [
      '编号含义：74110 中“74”代表 1974 年采集选育，“110”代表该批野生单株的田间编目序号。',
      '烘焙友好度：相比颗粒大小悬殊的混采原生种，74110/74158 豆粒偏小但极为均一，极大提升烘焙受热均匀度与杯中干净度。',
      '古姬花魁主力：红遍中国精品圈的古姬罕贝拉（Hambela）“花魁”系列日晒，核心主力正是 74110 与 74112。',
      '株型优势：紧凑小巧、挂果密实，在 1900–2300m 耶加雪菲与古姬高海拔产区表现极为稳健。',
    ],
    tableHeaders: ['对比维度', '传统混采 Heirloom', 'JARC 纯系 (74110 / 74158)'],
    comparisonTable: [
      { metric: '遗传构成', colA: '多品种野生/地方种混合', colB: '单一森林母树选育纯系' },
      { metric: '颗粒均一性', colA: '长短大小不一，烘焙挑技巧', colB: '偏小但高度均一，受热极匀' },
      { metric: '抗病表现', colA: '参差不齐，易受 CBD 威胁', colB: '强抗咖啡浆果病 (CBD)' },
      { metric: '杯中表现', colA: '野性层次繁复多变', colB: '极高干净度、水蜜桃与白花甜润' },
    ],
    sections: [
      {
        heading: '1974 年森林寻种：一场与浆果病的赛跑',
        body: '1970 年代初，致命的咖啡浆果病（CBD）席卷埃塞俄比亚产区。吉马农业研究中心（JARC）科学家深入西南部伊鲁巴博尔（Illubabor）梅图-比沙里原始森林，从幸存的健康野生母树中系统编号筛选并繁育，最终诞生的 74110、74112、74140、74158 等纯系既保住了国家支柱产业，又意外锁住了惊人的花果潜力。',
      },
      {
        heading: '从耶加雪菲到古姬的透明溯源浪潮',
        body: '过去买埃塞豆只能看“耶加雪菲 G1 水洗”，如今顶级处理厂会精确标出单一微地块与 74110/74158 编号，让烘焙师可以针对小粒高密纯系量身定制升温曲线，进一步放大东非高地清澈如蜜桃乌龙茶般的迷人甜感。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'pearl',
      foilStrength: 0.46,
      palette: {
        primary: '#2A4E3F',
        secondary: '#F09A84',
        accent: '#E89AB8',
        bgTop: '#14261E',
        bgBottom: '#2B5141',
        paperTint: '#F6F1EA',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'forest',
        subjectMotif: 'variety_heirloom',
        effectParticles: ['flower_petal', 'citrus_spark', 'tea_mist'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.46, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'vr-07-pacamara-maragogipe',
    code: 'VR-07',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '巨豆双杰 · 帕卡马拉 & 象豆',
    subtitle: 'Pacamara & Maragogipe · 蚕豆级身材里的风味爆发力',
    tagline: '一个是轻盈柔美的铁皮卡巨粒先祖，一个是奶油热带果伴迷迭香草本的 COE 冠军收割机。',
    tags: ['品种', '帕卡马拉', '象豆', 'Pacamara', 'Maragogipe', '大颗粒豆'],
    relatedCardIds: [
      'vr-02-typica',
      'vr-03-bourbon',
      'rg-03-latin-america',
      'pr-03-roast-agtron',
    ],
    summary:
      '约 1870 年在巴西巴伊亚州诞生的「象豆（Maragogipe）」是铁皮卡的巨大化自然突变，生豆可达普通阿拉比卡的 1.5–2 倍；1958 年萨尔瓦多咖啡研究所（ISIC）将象豆与矮化波旁突变种帕卡斯（Pacas）人工杂交，历经约 30 年选育诞生了极具个性张力的巨粒名种「帕卡马拉（Pacamara）」。',
    keyTakeaway:
      '大块头并不等于粗糙笨重：象豆呈现如丝绸般轻盈淡雅的花香坚果，而高海拔帕卡马拉则是奶油醇厚、热带熟果与迷迭香/罗勒草本香料的传奇结合体。',
    mythBuster:
      '「生豆颗粒越大就越醇厚浓烈」并非绝对！原版象豆（Maragogipe）尽管体型堪称咖啡界巨人，但细胞质地相对疏松，风味反而非常柔和轻盈；真正带来磅礴风味张力与饱满奶油质感的是其杂交子代帕卡马拉。',
    metrics: [
      { label: '象豆诞生', value: '约 1870 · 巴西巴伊亚' },
      { label: '帕卡马拉杂交', value: '1958 · 萨尔瓦多 ISIC' },
      { label: '典型筛网目数', value: '19–20 目以上巨粒' },
      { label: '招牌辨识风味', value: '奶油热带果 + 草本香料' },
    ],
    highlights: [
      '命名密码：Paca-mara 取自双亲帕卡斯（Pacas）与象豆（Maragogipe）各自前四个字母。',
      'COE 冠军常客：萨尔瓦多圣安娜火山、危地马拉与洪都拉斯的高海拔帕卡马拉连年霸榜卓越杯前列。',
      '烘焙与冲煮诀窍：超大颗粒豆体要求烘焙师在脱水期稳健传热防夹生；手冲可略调细半格以充分穿透粗大纤维。',
      '独门香料特征：优秀帕卡马拉常在奶油杏桃甜感中透出一缕类似迷迭香、罗勒或甜玉米的迷人草本香。',
    ],
    tableHeaders: ['比较维度', '象豆 (Maragogipe)', '帕卡马拉 (Pacamara)'],
    comparisonTable: [
      { metric: '系谱由来', colA: '铁皮卡巨大化自然突变', colB: '帕卡斯(波旁矮化) × 象豆杂交' },
      { metric: '株型与产量', colA: '植株极高、挂果稀疏极低产', colB: '株型较紧凑，产量明显提升' },
      { metric: '豆粒特征', colA: '普通豆 1.5–2 倍，质地疏松', colB: '19–20+ 目硕大饱满厚实' },
      { metric: '典型风味', colA: '清雅白花、奶油坚果、柔和轻盈', colB: '奶油厚实、热带熟果、草本香料' },
      { metric: '主产代表', colA: '墨西哥恰帕斯、危地马拉', colB: '萨尔瓦多、危地马拉、尼加拉瓜' },
    ],
    sections: [
      {
        heading: '象豆：濒临稀缺的温柔巨人',
        body: '发现于巴西玛拉戈日佩镇的象豆曾因“如蚕豆般震撼的视觉尺寸”风靡欧洲皇室与收藏界，但由于单株结果稀少且抗锈力极差，商业种植如今已非常稀少。它继承了铁皮卡清雅柔顺的血统，喝起来轻盈甘甜、毫无压迫感。',
      },
      {
        heading: '帕卡马拉：中美洲火山孕育的个性派王者',
        body: '萨尔瓦多农学家历时三十年稳定帕卡马拉，既保住了象豆令人过目难忘的超大粒形，又融入波旁系的浓甜与丰厚油脂。尽管其遗传仍有轻微多态性，对风土与烘焙曲线要求极高，但一旦在高海拔火山土中达到巅峰，其复杂爆发力丝毫不输瑰夏。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'gold',
      foilStrength: 0.50,
      palette: {
        primary: '#3C5438',
        secondary: '#E59F24',
        accent: '#EE7B4D',
        bgTop: '#182416',
        bgBottom: '#344B30',
        paperTint: '#F6F0E5',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'volcano',
        subjectMotif: 'variety_giant_bean',
        effectParticles: ['tropical_spark', 'cedar_leaf', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.46, backgroundDepth: -0.22, subjectScale: 1.08 },
    },
  },

  {
    id: 'vr-08-laurina-sidra',
    code: 'VR-08',
    cardType: 'knowledge_card',
    group: 'variety',
    topic: '精品品种',
    title: '尖身波旁 & 西德拉 · 竞赛双星',
    subtitle: 'Laurina（天然半因）× Sidra（WBC 红莓风暴）+ 新世代抗锈系',
    tagline: '一端是天然低因 0.6% 如白茶荔枝般无苦的留尼汪瑰宝，另一端是安第斯走出的红莓玫瑰赛场杀手。',
    tags: ['品种', '尖身波旁', 'Laurina', '西德拉', 'Sidra', '爪哇', '萨奇姆', '天然低因'],
    relatedCardIds: [
      'sp-05-eugenioides',
      'vr-03-bourbon',
      'vr-04-pink-bourbon',
      'vr-01-geisha',
      'rg-05-china-yunnan',
    ],
    summary:
      '本卡聚合精品咖啡竞赛前沿与未来育种的标志性品种：原产留尼汪岛、天然仅含约 0.6% 咖啡因的「尖身波旁（Laurina）」；崛起于厄瓜多尔、凭红莓玫瑰香气席卷 WBC 的埃塞血脉「西德拉（Sidra）」；以及同属埃塞地方种的「爪哇（Java）」与代表抗锈未来的「卡蒂姆 / 萨奇姆（Parainema）」。',
    keyTakeaway:
      '当代精品品种版图正在打破“瑰夏独尊”——天然低因的尖身波旁、极具穿透力的西德拉，以及兼顾抗锈与花果高分的萨奇姆子代（如 Parainema），共同勾勒出下一代精品风味。',
    mythBuster:
      '「抗病杂交种（卡蒂姆/萨奇姆）天生只能做难喝的商业豆」已成过去！虽然早期低海拔粗放卡蒂姆偏草本苦涩，但新一代萨奇姆系衍生种（如洪都拉斯 Parainema、巴西 Obatã）已屡夺 COE 高分，甚至能绽放清雅花香与明亮青柠调。',
    metrics: [
      { label: '尖身波旁咖啡因', value: '约 0.6%（天然半因）' },
      { label: '西德拉真实基因', value: '埃塞原生地方种为主' },
      { label: '爪哇（Java）别称', value: '埃塞阿比西尼亚小瑰夏' },
      { label: '萨奇姆明星子嗣', value: 'Parainema / Obatã' },
    ],
    highlights: [
      '尖身波旁（Bourbon Pointu）：约 1810 年发现于留尼汪岛，豆粒两头尖、树形如圣诞树，文豪巴尔扎克挚爱，2018 年助 Emi Fukahori 夺得世界冲煮冠军。',
      '西德拉（Sidra）：坊间曾误传为波旁×铁皮卡，基因检测实为埃塞地方种，红莓、洛神花、玫瑰与葡萄酒感极具冲击力。',
      '爪哇（Java）：19 世纪从埃塞引入印尼、后在喀麦隆选育优化的埃塞地方种，耐浆果病且具丁香花香甜橙韵。',
      '卡蒂姆与萨奇姆：源自东帝汶自然种间杂交（帝汶杂交种），以强抗叶锈病守护云南与中南美产区未来。',
    ],
    tableHeaders: ['前沿品种', '基因与出身', '核心特点', '招牌风味'],
    comparisonTable: [
      { metric: '尖身波旁 Laurina', colA: '留尼汪岛波旁自然突变', colB: '天然低因 ~0.6%、极低产', colC: '荔枝、白桃、白茶零苦感' },
      { metric: '西德拉 Sidra', colA: '厄瓜多尔选育（埃塞聚类）', colB: '圆润豆粒、WBC 竞赛宠儿', colC: '红莓、洛神花、玫瑰酒韵' },
      { metric: '爪哇 Java', colA: '埃塞→印尼→喀麦隆选育', colB: '细长豆粒、较耐 CBD', colC: '白花、甜橙、丁香草本甜' },
      { metric: '萨奇姆 Sarchimor', colA: '帝汶杂交种 × 维拉萨奇', colB: '强抗叶锈病、下代主力', colC: '柑橘、热带水果、红糖香草' },
    ],
    sections: [
      {
        heading: '尖身波旁：濒临灭绝后的华丽复育',
        body: '19 世纪留尼汪岛的尖身波旁曾风靡巴黎沙龙，却因极度娇贵易病险些绝迹。21 世纪初经日本与法国农学家合作抢救复育并拓展至巴西 Daterra 等先锋庄园后，它以无需人工脱因即享“半因零苦白茶甜”的奇迹，成为怕心悸爱好者心中的白月光。',
      },
      {
        heading: '西德拉与萨奇姆：竞赛极限与生态韧性的双翼',
        body: '厄瓜多尔与哥伦比亚高地培育的西德拉代表了竞赛风味浓度的巅峰爆发，而洪都拉斯帕拉伊内玛（Parainema）等萨奇姆新贵则证明“强抗叶锈病”与“90+ 高分清雅花果”完全可以兼得，为应对气候危机的精品咖啡指明方向。',
      },
    ],
    visual: {
      rarity: 'legendary',
      defaultFinish: 'silver',
      foilStrength: 0.60,
      palette: {
        primary: '#4A2B52',
        secondary: '#E2A652',
        accent: '#CC3562',
        bgTop: '#1D1121',
        bgBottom: '#43254B',
        paperTint: '#F6F1F5',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'botanical_grid',
        subjectMotif: 'variety_laurina_sidra',
        effectParticles: ['rose_petal', 'silver_frost', 'gold_dust'],
        lineartPattern: 'crystal_contour',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.48, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  // =========================================================================
  // 组三：世界风土产区卡（origin · 6 张）
  // =========================================================================
  {
    id: 'rg-01-coffee-belt',
    code: 'RG-01',
    cardType: 'knowledge_card',
    group: 'origin',
    topic: '世界风土',
    title: '世界咖啡带与海拔定律',
    subtitle: '南北纬 23.5°–25° 环赤道风土带 · 咖啡风味的地理底层密码',
    tagline: '海拔每攀升 300 米，温度微降 2℃——正是高地冷凉夜风的“慢放键”，酿出了紧实硬豆里的蔗糖与花酸。',
    tags: ['产区', '世界咖啡带', '海拔定律', '火山灰土壤', '干湿季', '风土'],
    relatedCardIds: [
      'rg-02-africa',
      'rg-03-latin-america',
      'rg-04-asia-pacific',
      'rg-05-china-yunnan',
      'ta-02-grading-physics',
    ],
    summary:
      '全球咖啡主产区高度聚集在南北纬 23.5°（回归线）至 25° 之间环绕赤道的狭长带状区域，称为「世界咖啡带（Coffee Belt / Bean Belt）」。四大地理法则共同雕刻出一杯咖啡的地域风味签名：纬度与海拔温度梯度、火山与红壤矿物质、干湿季雨热律动，以及大洲传承数百年的品种与处理生态。',
    keyTakeaway:
      '同样是赤道咖啡，海拔决定成熟速度与生豆密度，火山矿质土决定酸甜与芳香张力，而干湿季决定是走向洁净水洗、阳光日晒还是热带湿刨。',
    mythBuster:
      '「海拔数字绝对越高就越好喝」需结合纬度辩证看待！靠近赤道（如埃塞、哥伦比亚、肯尼亚）需 1700–2200m 才够凉爽；而靠近北回归线边缘的中国云南（1400–1800m）或受太平洋午后云雾代偿的夏威夷科纳（400–800m），等效积温与冷凉慢熟效果同样出众。',
    metrics: [
      { label: '核心纬度带', value: '南北纬 23.5° – 25°' },
      { label: '海拔温差律', value: '每升 300m 降 1.8–2℃' },
      { label: '精品黄金土', value: '火山灰黑土 / 红棕森林土' },
      { label: '四大风味板块', value: '非洲 / 拉美 / 亚太 / 云南' },
    ],
    highlights: [
      '慢熟蓄能法则：高海拔低温将咖啡果成熟期延长 1–2 个月，蔗糖、苹果酸、柠檬酸与芳香前体高度浓缩，形成高密度极硬豆（SHB）。',
      '火山土壤密码：巴拿马、危地马拉、哥伦比亚、肯尼亚与夏威夷均坐拥富含钾、磷、镁且排水极佳的火山灰肥土。',
      '干湿季精准节拍：湿季催花膨果，干季集中采收并利于高架晒床自然脱水，避免霉变瑕疵。',
      '大洲风味象限：非洲花果茶感 × 拉美甜衡创新 × 亚太草本厚实 × 中国云南梅子滇红新势力。',
    ],
    tableHeaders: ['世界风味板块', '核心代表产区', '标志性风味象限'],
    comparisonTable: [
      { metric: '非洲板块', colA: '埃塞、肯尼亚、卢旺达、也门', colB: '高扬白花、柑橘、黑加仑莓果、灵动茶感' },
      { metric: '拉丁美洲', colA: '巴拿马、哥伦比亚、巴西、危地马拉', colB: '高干净度、焦糖坚果平衡、前沿发酵与顶级瑰夏' },
      { metric: '亚洲太平洋', colA: '苏门答腊、爪哇、越南、科纳', colB: '极高醇厚度、雪松草本、丁香香料、沉稳低酸' },
      { metric: '中国云南', colA: '普洱、保山潞江坝、临沧、德宏', colB: '浓而不苦、梅子柑橘、烤坚果与滇红茶韵' },
    ],
    sections: [
      {
        heading: '海拔如何直接写入生豆物理结构',
        body: '低海拔高温产区咖啡果短短数月便催熟落地，细胞壁较疏松、密度偏低（常见 680–720 g/L），酸质温和但花果香气相对平淡；而高海拔冷凉夜风大幅减缓夜间呼吸损耗，让养分日复一日沉淀进种子胚乳，成就如翡翠绿标般高达 880 g/L 的紧实高密度硬豆。',
      },
      {
        heading: '阅读一张豆卡时的风土解码顺序',
        body: '拿到任何一支陌生咖啡豆，只需依次看「大洲/国家（定风味大象限）→ 海拔（判酸甜与密度潜力）→ 品种（锁香气基因）→ 处理法（知干净度与发酵张力）→ 烘焙度（定苦甜平衡）」，30 秒内就能在脑海中精准预演杯中风貌。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.54,
      palette: {
        primary: '#1E3C4C',
        secondary: '#D6A25E',
        accent: '#4E9A6F',
        bgTop: '#0E1E28',
        bgBottom: '#1F3F52',
        paperTint: '#F5F1E8',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'ocean_belt',
        subjectMotif: 'origin_coffee_belt',
        effectParticles: ['gold_dust', 'botanical_pollen'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'rg-02-africa',
    code: 'RG-02',
    cardType: 'knowledge_card',
    group: 'origin',
    topic: '世界风土',
    title: '非洲 · 花果与茶感之源',
    subtitle: '埃塞俄比亚 × 肯尼亚 × 卢旺达 × 也门摩卡风土志',
    tagline: '阿拉比卡的诞生地与基因宝库——高扬白花、明亮柑橘、爆裂黑加仑与灵动红茶感，在这里写就起点。',
    tags: ['产区', '非洲', '埃塞俄比亚', '肯尼亚', '也门摩卡', '耶加雪菲', '卡法森林'],
    relatedCardIds: [
      'af-04-gori-natural',
      'af-05-kaffa-washed',
      'af-06-kaffa-natural',
      'af-03-gelana-coferm',
      'af-01-kenya-nyeri-aa',
    ],
    summary:
      '非洲东部高地是阿拉比卡咖啡的生命起源。从埃塞俄比亚 1800–2300m 的耶加雪菲、古姬、西达摩、卡法与戈里原始森林，到赤道火山麓肯尼亚涅里含磷红土、千丘之国卢旺达与古老悬崖石梯田也门摩卡，非洲以无可匹敌的明亮花果香与轻盈果汁茶感领跑全球浅烘手冲版图。',
    keyTakeaway:
      '埃塞俄比亚胜在「万千原生基因 × 茉莉白桃与蓝莓茶韵」，肯尼亚胜在「SL28/SL34 × 72h 双重水洗的黑加仑爆发力」，也门摩卡则保存着「干旱高山屋顶日晒的红酒黑巧古韵」。',
    mythBuster:
      '「摩卡（Mocha）」原本既不是加巧克力酱的甜饮，也不是单一品种名，而是历史上阿拉伯半岛红海古城「也门摩卡港」出口的古老日晒咖啡——因其天生自带红酒发酵、无花果干、香料与黑巧克力余韵，后世咖啡馆才把“加巧克力的拿铁”借称为摩卡！',
    metrics: [
      { label: '核心海拔带', value: '1600 – 2400m 超高地' },
      { label: '标志品种', value: '原生瑰夏 / 74110 / SL28' },
      { label: '核心工艺', value: '高架床日晒 / 72h 双洗' },
      { label: '大洲风味底色', value: '白花、柑橘、莓果茶感' },
    ],
    highlights: [
      '埃塞四大名片：耶加雪菲（茉莉佛手柑水洗标杆）、古姬（花魁草莓百香果日晒）、卡法 & 戈里森林（瑰夏原生基因库）。',
      '肯尼亚涅里/麒麟雅加：肯尼亚火山南麓含磷红土 + 一年双采季 + AA 级大粒豆，酸甜酒体冠绝全球。',
      '卢旺达 & 布隆迪：东非高地红波旁精致水洗代表，呈现清新红茶、蜜橘、红苹果与温柔香料甜。',
      '也门摩卡：1500–2400m 干旱悬崖石梯田与屋顶风干日晒，孕育深邃红酒、无花果干与肉桂黑巧野性醇韵。',
    ],
    tableHeaders: ['非洲明星产区', '海拔与风土', '代表豆种与工艺', '标志风味'],
    comparisonTable: [
      { metric: '埃塞·耶加/古姬', colA: '1750–2300m 红火山壤', colB: '74110/74158/瑰夏 · 精洗/日晒', colC: '茉莉、佛手柑、草莓蜜桃' },
      { metric: '埃塞·卡法/戈里', colA: '1600–2100m 原始林荫', colB: '原生瑰夏 · 水洗/日晒', colC: '绿茶柑橘、蓝莓杏桃果茶' },
      { metric: '肯尼亚·涅里', colA: '1600–2100m 含磷红土', colB: 'SL28/SL34 · 72h 双重水洗', colC: '黑加仑、圣女果、血橙酒体' },
      { metric: '卢旺达/布隆迪', colA: '1500–2100m 千丘火山', colB: '红波旁 · 精细水洗', colC: '红茶、蜜橘、红糖香料' },
      { metric: '也门·摩卡', colA: '1500–2400m 干旱石梯田', colB: '也门古老种 · 屋顶日晒', colC: '红酒、黑巧、无花果肉桂' },
    ],
    sections: [
      {
        heading: '埃塞俄比亚的“花园、森林与半森林”三级生态',
        body: '区别于拉美大片规整庄园，埃塞俄比亚大量顶级咖啡仍来自原始森林野生林荫（如卡法与戈里森林）或农户房前屋后的林农混作小园。收获季小农背着鲜红咖啡果步行送往社区水洗站（如格拉纳的 Amba Marian），聚沙成塔汇聚出层次万千的高原风味。',
      },
      {
        heading: '肯尼亚独步天下的拍卖与双重水洗制度',
        body: '肯尼亚通过高度透明的中央竞拍体系与按目数严格筛选的 AA/AB 分级激励小农合作社精益求精，再辅以长达 72 小时的发酵加冷泉二次浸泡工艺，使涅里与麒麟雅加常年稳居世界高酸果汁感巅峰。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'gold',
      foilStrength: 0.56,
      palette: {
        primary: '#234F3A',
        secondary: '#EB9B4E',
        accent: '#C83E6B',
        bgTop: '#122A1E',
        bgBottom: '#2B5941',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'forest',
        subjectMotif: 'origin_africa',
        effectParticles: ['flower_petal', 'berry_glow', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.46, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'rg-03-latin-america',
    code: 'RG-03',
    cardType: 'knowledge_card',
    group: 'origin',
    topic: '世界风土',
    title: '拉丁美洲 · 火山与创新处理高地',
    subtitle: '巴拿马 × 哥伦比亚 × 巴西 × 危地马拉 × 哥斯达黎加风土志',
    tagline: '从巴拿马彩虹细雾下的殿堂瑰夏，到哥伦比亚重构风味边界的发酵实验室与巴西温暖焦糖台地。',
    tags: ['产区', '拉丁美洲', '巴拿马', '哥伦比亚', '巴西', '危地马拉', '哥斯达黎加', '牙买加蓝山'],
    relatedCardIds: [
      'ca-01-esmeralda-green',
      'sa-01-macarena-rum',
      'sa-02-baishan-n2',
      'sa-03-brazil-cerrado-yb',
      'pr-02-experimental-ferm',
    ],
    summary:
      '拉丁美洲是全球最大的咖啡生产与创新核心板块：既有巴西喜拉多广袤高原孕育的经典坚果牛奶巧日常基石，也有巴拿马波奎特巴鲁火山滋养的拍卖天价瑰夏，更有哥伦比亚安第斯三条山脉引领全球的朗姆酒桶、氮气冷洗、热冲击与厌氧发酵革命。',
    keyTakeaway:
      '拉美咖啡的灵魂在于“极高干净度 + 甜感平衡 + 前沿农艺创新”——无论是古典水洗、塔拉珠四阶蜜处理，还是先锋实验发酵，拉美始终定义着世界精品工艺的浪潮方向。',
    mythBuster:
      '并非所有哥伦比亚咖啡都是千篇一律的“柔和坚果商业平衡豆”！安第斯山脉的三条平行山系把哥伦比亚切割出无数高海拔微气候，从南部娜玲珑冷风高地的清冽花香，到玛卡瑞纳朗姆酒桶与白山冷泉氮气瑰夏，它已是全世界风味跨度最惊人的精品创新中心。',
    metrics: [
      { label: '核心山系', value: '安第斯山脉 / 中美火山带' },
      { label: '创新工艺中心', value: '哥伦比亚 / 哥斯达黎加' },
      { label: '巅峰竞赛高地', value: '巴拿马波奎特 (BOP)' },
      { label: '产量巨头', value: '巴西（世界第一生产国）' },
    ],
    highlights: [
      '巴拿马波奎特：加勒比海与太平洋冷暖气流在巴鲁火山交汇，形成标志性 Bajareque 彩虹细雾微气候，孕育翡翠庄园传奇。',
      '哥伦比亚五大高地：慧兰、考卡、娜玲珑、安蒂奥基亚、托利马全年双产季，集粉红波旁、瑰夏、西德拉与实验发酵之大成。',
      '巴西喜拉多/摩吉安娜：800–1350m 旱季清晰台地，以黄波旁日晒的烤榛果、花生糖与牛奶巧克力撑起全球意式拼配。',
      '中美洲明珠：危地马拉安提瓜（火山黑巧微烟）/薇薇特南果（石灰岩青苹果）、哥斯达黎加塔拉珠（微处理厂蜜处理）、牙买加蓝山（70kg 原木桶装运）。',
    ],
    tableHeaders: ['拉美核心产区', '风土亮点', '代表豆种与工艺', '典型风味签名'],
    comparisonTable: [
      { metric: '巴拿马·波奎特', colA: '1400–2000m+ 火山细雾', colB: '瑰夏/卡杜艾 · 精洗/慢晒', colC: '玫瑰茉莉、佛手柑、菠萝丝滑' },
      { metric: '哥伦比亚高地', colA: '1500–2200m 安第斯三山脉', colB: '粉波旁/瑰夏 · 实验发酵中心', colC: '洋甘菊柑橘、朗姆酒桶、核果甜' },
      { metric: '巴西·喜拉多', colA: '800–1350m 干湿季高原', colB: '黄波旁/卡杜艾 · 高原日晒', colC: '烤榛果、牛奶巧、焦糖低酸' },
      { metric: '危地马拉', colA: '1500–2000m 火山/石灰岩', colB: '波旁/卡杜拉/帕卡马拉 · 水洗', colC: '安提瓜黑巧微烟 / 薇薇青苹果' },
      { metric: '哥斯达黎加·塔拉珠', colA: '1400–1900m 火山干季', colB: '卡杜艾/维拉萨奇 · 四阶蜜处理', colC: '蜂蜜黄桃、甘蔗汁、饱满橘酸' },
    ],
    sections: [
      {
        heading: '巴鲁火山的 Bajareque 彩虹细雾奇迹',
        body: '巴拿马地峡狭窄，温暖湿润的加勒比海风翻越中央山脉与太平洋冷空气碰撞，在海拔 1600–2000m 的波奎特坡地化作肉眼可见的微细薄雾（当地称 Bajareque），在阳光下常年挂起彩虹。这层天然云幕为瑰夏遮去烈日暴晒，让花香前体在冷凉湿润中极致蓄积。',
      },
      {
        heading: '哥斯达黎加微型处理厂与哥伦比亚发酵浪潮',
        body: '21 世纪初哥斯达黎加塔拉珠掀起「微型处理厂（Micro-mill）」革命，小农不再把鲜果卖给大型合作社混处理，而是自主把控黄/红/黑蜜工艺；紧接着哥伦比亚新一代庄园主将酒桶陈化、惰性氮气、二氧化碳浸渍与热冲击引入生产，彻底改写了拉美咖啡的全球竞争力。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'gold',
      foilStrength: 0.56,
      palette: {
        primary: '#5C2228',
        secondary: '#D6A25E',
        accent: '#E08A3C',
        bgTop: '#220D10',
        bgBottom: '#4A1C21',
        paperTint: '#F6F0E7',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'volcano',
        subjectMotif: 'origin_latin_america',
        effectParticles: ['amber_drop', 'citrus_spark', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.46, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'rg-04-asia-pacific',
    code: 'RG-04',
    cardType: 'knowledge_card',
    group: 'origin',
    topic: '世界风土',
    title: '亚洲与太平洋 · 醇厚香料群岛',
    subtitle: '印尼苏门答腊 × 爪哇 × 越南大叻 × 巴布亚新几内亚 × 夏威夷科纳',
    tagline: '赤道火山岛屿的湿热季风，雕琢出糖浆般沉稳厚实的奶油体感、雪松草本与丁香肉桂余韵。',
    tags: ['产区', '亚太', '苏门答腊', '曼特宁', '越南大叻', '夏威夷科纳', '巴布亚新几内亚'],
    relatedCardIds: [
      'ap-01-sumatra-mandheling',
      'sp-02-robusta',
      'sp-03-liberica',
      'pr-01-classic-process',
      'rg-05-china-yunnan',
    ],
    summary:
      '亚洲与太平洋板块横跨赤道群岛与太平洋活火山坡，海洋湿润气候、火山沃土与独特的「湿刨法（Giling Basah）」共同塑造出与非洲高酸截然相反的审美极点：低酸圆润、糖浆般极高醇厚度，夹带雪松、草本、丁香与黑巧克力深沉回甘；与此同时，越南大叻精品罗豆与夏威夷科纳海岛水洗亦独树一帜。',
    keyTakeaway:
      '亚太并不只有重口湿刨曼特宁：从清雅丝滑的夏威夷科纳水洗、热带水果亮丽的巴布亚新几内亚，到正在崛起的越南大叻 1600m Fine Robusta，亚太风土远比想象中丰富立体。',
    mythBuster:
      '「曼特宁（Mandheling）」既不是苏门答腊的地名，也不是咖啡豆品种名！它源自印尼苏门答腊北部的原住民部族「曼特宁族（Mandailing）」，二战期间一名日本士兵误把当地人回答的族名当作咖啡产区名记下并带回日本推广，由此成就百年传奇名号。',
    metrics: [
      { label: '代表工艺', value: '湿刨法 Giling Basah / 水洗' },
      { label: '罗豆世界第一', value: '越南（全球第二产国）' },
      { label: '风味底色', value: '极高醇厚、草本香料、低酸' },
      { label: '微气候奇观', value: '夏威夷科纳午后云雾遮荫' },
    ],
    highlights: [
      '印尼苏门答腊（亚齐 Gayo / 林东 Lintong）：多巴火山湖高地湿刨工艺，生豆呈标志蓝绿色，雪松黑巧甘草回甘冠绝全球。',
      '印尼爪哇 & 苏拉威西托拉雅：爪哇偏干净水洗烤坚果微辛，托拉雅高地火山呈现顺滑厚重焦糖黑巧与柔和莓果。',
      '越南邦美蜀 & 大叻：低地邦美蜀稳居全球罗豆产能第一，而 1400–1650m 凉爽大叻高原正产出惊艳世界的 Fine Robusta 与精品阿豆。',
      '巴布亚新几内亚 & 夏威夷科纳：前者 1930s 引入蓝山铁皮卡兼具热带果亮酸，后者凭午后云雾与火山黑岩酿出烤夏威夷果丝滑奶巧。',
    ],
    tableHeaders: ['亚太核心产区', '海拔与气候', '主导品种与工艺', '标志风味关键词'],
    comparisonTable: [
      { metric: '印尼·苏门答腊', colA: '1100–1600m 多巴湖雨林', colB: '古系铁皮卡/Ateng · 湿刨法', colC: '极厚糖浆、雪松草本、黑巧甘草' },
      { metric: '印尼·爪哇/托拉雅', colA: '1100–1800m 火山群峰', colB: '铁皮卡/S795 · 水洗/半水洗', colC: '烤坚果微辛、顺滑焦糖黑巧' },
      { metric: '越南·大叻高原', colA: '1400–1650m 松林红玄武岩', colB: 'Fine Robusta / 波旁 · 精制', colC: '太妃糖、焦糖杏仁、成熟柑橘' },
      { metric: '巴布亚新几内亚', colA: '1300–1900m 瓦吉火山谷', colB: '蓝山铁皮卡 · 经典水洗', colC: '芒果木瓜、清亮橘酸、柔滑奶油' },
      { metric: '夏威夷·科纳', colA: '250–800m 午后云雾火山坡', colB: '科纳铁皮卡 · 精致水洗', colC: '烤夏威夷果、奶巧红糖、丝滑干净' },
    ],
    sections: [
      {
        heading: '湿刨法：热带暴雨催生的生存智慧',
        body: '苏门答腊终年高温高湿、午后骤雨频发，按常规水洗在 11% 含水率时才脱壳需晒床两周以上，极易发霉腐败。当地小农因地制宜发明了湿刨法：生豆含水率还在 30%–35% 半干膨胀状态便强力剥去羊皮纸加速风干——这一被迫之举意外改变了豆体细胞结构，造就了低酸极厚、独步全球的曼特宁标志风格。',
      },
      {
        heading: '夏威夷科纳的“气象海拔代偿”',
        body: '夏威夷科纳种植带海拔仅 250–800m，按常规似乎难以产出顶级阿豆，但冒纳罗亚火山西坡每日精准上演「上午晴朗光合、午后海风凝云自动遮荫降温、傍晚阵雨滋润」的自然时钟，等效模拟了高海拔慢熟微气候，成就了世界最柔滑昂贵的海岛水洗铁皮卡之一。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.50,
      palette: {
        primary: '#1E3C33',
        secondary: '#C7964E',
        accent: '#5A7B56',
        bgTop: '#0F1F1A',
        bgBottom: '#23463C',
        paperTint: '#F4EFE5',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'island',
        subjectMotif: 'origin_asia_pacific',
        effectParticles: ['cedar_leaf', 'spice_ember', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.46, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'rg-05-china-yunnan',
    code: 'RG-05',
    cardType: 'knowledge_card',
    group: 'origin',
    topic: '世界风土',
    title: '中国云南 · 东方精品咖啡崛起',
    subtitle: '普洱 × 保山潞江坝 × 临沧 × 德宏 · 从原料基地到 30%+ 精品跃迁',
    tagline: '北纬 21°–25° 的低纬高海拔奇迹——“浓而不苦、香而不烈、略带果味”，正以 90+ 瑰夏与老树铁皮卡惊艳世界。',
    tags: ['产区', '中国云南', '普洱', '保山潞江坝', '临沧', '德宏', '精品率30%'],
    relatedCardIds: [
      'cn-01-yunnan-baoshan',
      'vr-02-typica',
      'vr-08-laurina-sidra',
      'pr-02-experimental-ferm',
      'rg-01-coffee-belt',
    ],
    summary:
      '云南地处北纬 21°–25° 世界咖啡带北缘高地，贡献了中国 98% 以上的咖啡种植面积与总产量。凭借 1200–2000m 低纬高海拔、显著昼夜温差与冬春旱季充沛日照，云南正完成从「1.0 卡蒂姆商业原料基地」向「2.0 高海拔精品与多元品种工艺产区」的历史性跃迁，整体精品率已突破 30%。',
    keyTakeaway:
      '云南精品咖啡绝非“廉价拼配底豆”——保山老铁皮卡的梅子茶韵、临沧高海拔 90+ 瑰夏、普洱的林荫茶咖生态与德宏的亚洲级种质科研库，共同撑起东方精品新势力。',
    mythBuster:
      '「云南只种廉价卡蒂姆，喝起来都是草腥坚果味」早已落后于现实！如今云南划定 1100–1200m+ 高海拔精品带，瑰夏、铁皮卡、波旁、SL28、萨奇姆等特色良种占比已攀升至 10%–12%+；即便是高海拔全红果精采精制的新世代卡蒂姆，也能呈现出极度干净的黑巧梅果甜感。',
    metrics: [
      { label: '全国产量占比', value: '98% 以上' },
      { label: '核心精品海拔', value: '1200 – 2000m' },
      { label: '全省精品率', value: '已突破 30%（持续跃升）' },
      { label: '四大核心子产区', value: '普洱 / 保山 / 临沧 / 德宏' },
    ],
    highlights: [
      '普洱（1000–1700m）：中国咖啡之都、占全省近半产量，森林覆盖率极高，呈现烤坚果、黑巧、红糖梅子与淡淡普洱茶韵。',
      '保山·潞江坝（1000–1800m+）：中国咖啡产业化发源地，高黎贡山东麓怒江干热河谷复兴老铁皮卡、波旁与瑰夏，精品率全省领跑。',
      '临沧（1200–2000m）：近年赛事冠军黑马，澜沧江高海拔山坡产出的临沧瑰夏屡次在生豆大赛斩获 90+ 冠军高分。',
      '德宏（900–1600m）：中国咖啡之乡，德宏热作所坐拥亚洲领先的咖啡种质资源库，持续培育中国自主抗病精品新品种。',
    ],
    tableHeaders: ['云南四大子产区', '海拔与产业定位', '核心品种与工艺', '标志风味'],
    comparisonTable: [
      { metric: '普洱 Pu’er', colA: '1000–1700m · 产量约占半壁', colB: '卡蒂姆升级 + 瑰夏/波旁 · 厌氧/水洗', colC: '烤坚果、黑巧、红糖梅子、普洱茶韵' },
      { metric: '保山·潞江坝', colA: '1000–1800m+ · 产业化发源地', colB: '老铁皮卡/波旁/瑰夏 · 精细水洗/蜜', colC: '高雅柑橘梅子、黑巧焦糖、滇红茶感' },
      { metric: '临沧 Lincang', colA: '1200–2000m · 90+ 赛事黑马', colB: '高地瑰夏/萨奇姆 · 厌氧日晒/酒香', colC: '高扬花香、明亮柑橘与热带水果甜' },
      { metric: '德宏 Dehong', colA: '900–1600m · 育种科研心脏', colB: '亚洲级数百份种质库 · 酵母精制', colC: '柔和坚果、焦糖清甜、清爽果酸' },
    ],
    sections: [
      {
        heading: '从 1.0 时代到 2.0 时代的三大破局引擎',
        body: '1990s–2010s 云南曾大面积推广抗锈高产的卡蒂姆（CIFC 7963 曾占全省 90%+）供给国际速溶巨头，精品率一度不足 8%。2020s 以来，云南庄园主通过“① 品种迭代（扩种瑰夏/铁皮卡/波旁/SL28/萨奇姆）、② 采收革命（淘汰青红一撸光，坚持全红果手采浮选）、③ 工艺升级（引入厌氧日晒、蜜处理与定向酵母）”三箭齐发，彻底改写了国际买手对东方产区的认知。',
      },
      {
        heading: '天赐的冬春旱季日晒窗口',
        body: '相较于许多赤道海岛产区采收季阴雨连绵的困扰，云南咖啡的成熟采收期（每年 11 月至次年 3 月）恰逢云贵高原晴朗少雨、紫外线充足的冬春干季，空气干爽极利于高架床精品日晒与红蜜慢干，赋予云南高海拔微批次格外通透干净的蜜甜尾韵。',
      },
    ],
    visual: {
      rarity: 'legendary',
      defaultFinish: 'gold',
      foilStrength: 0.56,
      palette: {
        primary: '#264A3D',
        secondary: '#D49449',
        accent: '#A84852',
        bgTop: '#11241D',
        bgBottom: '#2A4E41',
        paperTint: '#F6F0E6',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'yunnan',
        subjectMotif: 'origin_yunnan',
        effectParticles: ['tea_mist', 'citrus_spark', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.34, effectsDepth: 0.48, backgroundDepth: -0.24, subjectScale: 1.08 },
    },
  },

  {
    id: 'rg-06-geisha-migration',
    code: 'RG-06',
    cardType: 'knowledge_card',
    group: 'origin',
    topic: '风土史诗',
    title: '瑰夏百年跨洲迁徙路线图',
    subtitle: '1931 埃塞戈里森林 → 1953 CATIE → 2004 巴拿马翡翠一战封神',
    tagline: '一粒最初只为寻找抗锈种质的森林野豆，漂泊七十三年横跨三大洲，最终在巴鲁火山成就咖啡史诗。',
    tags: ['产区', '瑰夏迁徙', '1931戈里森林', 'CATIE T2722', 'Don Pachi', '2004 BOP'],
    relatedCardIds: [
      'af-04-gori-natural',
      'af-05-kaffa-washed',
      'af-06-kaffa-natural',
      'ca-01-esmeralda-green',
      'vr-01-geisha',
    ],
    summary:
      '瑰夏的传奇跨越近一个世纪、横渡大西洋与东非高原：1931 年采集自埃塞俄比亚西南部戈里森林（卡法地区），历经肯尼亚、坦桑尼亚科研站中转，1953 年入藏哥斯达黎加 CATIE（编号 T2722），1963 年由 Don Pachi 引入巴拿马波奎特，蛰伏四十一年后终在 2004 年由翡翠庄园于 BOP 赛场震惊全球。',
    keyTakeaway:
      '喝懂本图鉴里的 6 款瑰夏，就是在杯中重走这段跨越 12000 公里的百年植物迁徙史——从卡法森林的原生素颜，走到巴鲁火山的璀璨香水。',
    mythBuster:
      '「瑰夏是从巴拿马原产再引种回非洲的」——恰恰相反！埃塞俄比亚西南部卡法与戈里森林才是瑰夏的原生故乡；巴拿马是将 T2722 纯系在高海拔火山风土下彻底发扬光大的“成名舞台”，近年埃塞原生瑰夏的复兴则让世人重新听见源头的回响。',
    metrics: [
      { label: '1931 起点', value: '埃塞 · 戈里/卡法森林' },
      { label: '1953 关键中转', value: '哥斯达黎加 CATIE T2722' },
      { label: '1963 引入巴拿马', value: '农学家 Don Pachi' },
      { label: '2004 封神时刻', value: '翡翠庄园 BOP 夺冠' },
    ],
    highlights: [
      '第一站（1931，埃塞俄比亚）：英国领事官员在西南部班奇马吉戈里森林采集野生抗锈种子，地名 Gesha 阴差阳错拼写为 Geisha。',
      '第二站（1930s–1953，东非→中美）：种子经肯尼亚与坦桑尼亚莱亚蒙古研究站（编目 VC-496）送抵哥斯达黎加 CATIE 热带农业中心，编目 T2722。',
      '第三站（1963，巴拿马波奎特）：Don Pachi（Francisco Serracín）带回波奎特试种；因高瘦低产被冷落数十年，仅散落高海拔角落。',
      '第四站（2004 至今，全球盛放）：翡翠庄园彼得森家族独立分采高海拔哈拉米约地块夺得 2004 BOP 冠军，随后哥伦比亚、中国云南与埃塞本土全面引种复兴。',
    ],
    tableHeaders: ['时间节点', '迁徙坐标', '历史事件与意义'],
    comparisonTable: [
      { metric: '1931', colA: '埃塞 · 戈里/卡法森林', colB: '采集野生抗锈种质，命名源于地名 Gesha（对应 AF-04/05/06）' },
      { metric: '1936–1953', colA: '肯尼亚 → 坦桑尼亚 → 哥斯达黎加', colB: '经莱亚蒙古研究站送入 CATIE 基因库，核心编号 T2722' },
      { metric: '1963', colA: '巴拿马 · 波奎特', colB: 'Don Pachi 引入试种，因产量稀少被雪藏四十余年' },
      { metric: '2004', colA: '巴拿马 · 翡翠庄园', colB: '彼得森家族分批送赛 BOP 夺冠创天价，开启瑰夏时代（对应 CA-01）' },
      { metric: '2010s–2026', colA: '哥伦比亚 / 埃塞 / 云南', colB: '与冷泉氮气、共发酵等新工艺融合百花齐放（对应 SA-02/AF-03）' },
    ],
    sections: [
      {
        heading: '为什么同一棵树在低地平庸、在高地封神',
        body: '瑰夏在哥斯达黎加与巴拿马早期之所以被冷落，除产量极低外，更因为它在 1200–1400m 常规海拔下并无惊人表现；唯有当翡翠庄园将其种在 1600–1800m+ 终年云雾缭绕的哈拉米约高坡时，极度缓慢的成熟节拍才奇迹般解锁了玫瑰、茉莉与佛手柑的爆炸式香气。',
      },
      {
        heading: '用本套图鉴开启你的“瑰夏迁徙盲测之旅”',
        body: '强烈建议将「AF-05 卡法水洗（源头素颜）→ AF-04 戈里森林日晒（原生野性）→ CA-01 巴拿马翡翠绿标（火山经典）→ SA-02 哥伦比亚白山氮气洗（现代洁净）」四卡依次对比品鉴，亲口见证风土与时间如何雕刻同一基因。',
      },
    ],
    visual: {
      rarity: 'legendary',
      defaultFinish: 'gold',
      foilStrength: 0.66,
      palette: {
        primary: '#19453B',
        secondary: '#E0B55E',
        accent: '#D96281',
        bgTop: '#0C211D',
        bgBottom: '#1F5246',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'terroir_map',
        subjectMotif: 'origin_geisha_route',
        effectParticles: ['rose_petal', 'gold_dust', 'citrus_spark'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.34, effectsDepth: 0.50, backgroundDepth: -0.24, subjectScale: 1.08 },
    },
  },

  // =========================================================================
  // 组四：工艺与专业品鉴百科卡（craft_tasting · 6 张）
  // =========================================================================
  {
    id: 'pr-01-classic-process',
    code: 'PR-01',
    cardType: 'knowledge_card',
    group: 'craft_tasting',
    topic: '生豆处理',
    title: '传统四大生豆处理法全解',
    subtitle: '水洗 × 日晒 × 四阶蜜处理 × 苏门答腊湿刨法',
    tagline: '处理法的本质，是用不同的“果胶去留”与“发酵干燥路径”，将 65% 含水鲜果安全转化至 11% 风味生豆。',
    tags: ['处理法', '水洗', '日晒', '蜜处理', '湿刨法', '果胶层'],
    relatedCardIds: [
      'af-05-kaffa-washed',
      'af-06-kaffa-natural',
      'ap-01-sumatra-mandheling',
      'pr-02-experimental-ferm',
      'ca-01-esmeralda-green',
    ],
    summary:
      '刚采摘的咖啡樱桃由外到内依次为外果皮、果肉、果胶层（富含果糖与有机酸）、羊皮纸、银皮与种子。传统四大处理法——水洗（Washed）、日晒（Natural）、蜜处理（Honey）与湿刨法（Wet-Hulled）——通过控制果肉果胶接触时长与脱壳节点，决定了咖啡是走向清澈花酸、浓郁莓果，还是醇厚草本。',
    keyTakeaway:
      '果肉与果胶伴随干燥的时间越长，甜感、醇厚度与熟果香越浓；越早彻底洗净果胶，杯中干净度、酸质通透度与品种风土“素颜”越清晰。',
    mythBuster:
      '「蜜处理就是在咖啡豆里加了蜂蜜晒干」——大错特错！蜜处理全程不加一滴蜂蜜，而是去除外果皮后保留黏稠晶莹的天然果胶层直接日晒，因颜色与甜感酷似蜂蜜而得名，按果胶保留比例分为白蜜、黄蜜、红蜜、黑蜜四阶。',
    metrics: [
      { label: '脱水目标', value: '含水率 65% → 10.5–12%' },
      { label: '水洗干净度', value: '5.0 / 5.0（品种素颜）' },
      { label: '四阶蜜处理', value: '白 / 黄 / 红 / 黑蜜' },
      { label: '湿刨脱壳含水', value: '30%–35% 半干强力脱壳' },
    ],
    highlights: [
      '水洗（Washed）：去皮→发酵槽分解果胶 12–48h→清水洗净→干燥；极高干净度、明亮柑橘白花与绿茶感（如 AF-05、CA-01）。',
      '日晒（Natural）：整果不剥皮高架床慢晒 2–4 周，糖分充分回渗豆芯；饱满蓝莓、无花果、杏桃凤梨果汁感（如 AF-04、AF-06）。',
      '四阶蜜处理（Honey）：白蜜（10–25% 果胶）近水洗，黄蜜（25–50%）清甜平衡，红蜜（50–75%）焦糖熟果，黑蜜（80–100% 遮荫慢干 20–30 天）似精致日晒果酱。',
      '湿刨法（Giling Basah）：印尼雨林专属，30–35% 高湿脱去羊皮纸呈深蓝绿裸豆再晒干，极低酸、极高糖浆醇厚与雪松草本（如 AP-01）。',
    ],
    tableHeaders: ['经典处理法', '果胶与干燥核心', '酸/甜/厚/净倾向', '代表风味'],
    comparisonTable: [
      { metric: '水洗 Washed', colA: '去皮发酵后彻底洗净果胶', colB: '酸4.5 · 甜3.5 · 厚2.5 · 净5.0', colC: '柑橘、白花、绿茶、清澈' },
      { metric: '日晒 Natural', colA: '整果高架床慢晒 2–4 周', colB: '酸3.5 · 甜4.5 · 厚4.0 · 净3.5', colC: '蓝莓、无花果、杏桃、凤梨' },
      { metric: '白/黄蜜处理', colA: '留 15–50% 果胶、勤翻快干', colB: '酸4.0 · 甜4.0 · 厚3.2 · 净4.3', colC: '蜂蜜、黄桃、橙花、焦糖' },
      { metric: '红/黑蜜处理', colA: '留 60–100% 果胶、遮荫缓干', colB: '酸3.2 · 甜4.8 · 厚4.2 · 净3.4', colC: '黑糖、红莓果酱、微酒韵' },
      { metric: '湿刨 Wet-Hulled', colA: '含水 30–35% 即剥除羊皮纸', colB: '酸1.8 · 甜3.2 · 厚5.0 · 净2.5', colC: '雪松、草本药草、黑巧克力' },
    ],
    sections: [
      {
        heading: '同源对比教科书：AF-05 卡法水洗 vs AF-06 卡法日晒',
        body: '想在舌尖一秒悟透传统处理法的魔力，只需将本图鉴的 AF-05（卡法水洗）与 AF-06（卡法传统日晒）并排对照：同样源自埃塞卡法原始森林的原生瑰夏，水洗呈现出清润绿茶、明亮柑橘与 4.7 超高干净度；日晒则瞬间拉升花果甜润与醇厚度，化作饱满的蓝莓、无花果与熟李子果汁。',
      },
      {
        heading: '蜜处理的风险与工艺美学',
        body: '红蜜与黑蜜保留的厚重黏稠果胶富含游离糖，在阳光下极易粘连结块甚至滋生杂菌发霉；哥斯达黎加塔拉珠的微处理厂通过遮荫网控温与精准翻动时间表，在“发酵发酸”与“极致蜜甜”的钢丝上走出惊艳平衡。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'original',
      foilStrength: 0.36,
      palette: {
        primary: '#2B5147',
        secondary: '#E29E38',
        accent: '#C83E6B',
        bgTop: '#142621',
        bgBottom: '#2B5247',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'fermentation_lab',
        subjectMotif: 'craft_classic_process',
        effectParticles: ['dew_drop', 'caramel_spark', 'berry_glow'],
        lineartPattern: 'taxonomy_engraving',
      },
      depths: { subjectDepth: 0.30, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'pr-02-experimental-ferm',
    code: 'PR-02',
    cardType: 'knowledge_card',
    group: 'craft_tasting',
    topic: '生豆处理',
    title: '现代前沿实验发酵图谱',
    subtitle: '朗姆酒桶 × 共发酵水洗 × 冷泉氮气 × 厌氧 × CO₂ 浸渍 × 热冲击',
    tagline: '将酿酒微生物学与热力学精密控制引入咖啡处理——把发酵从靠天吃饭的玄学，变成可设计的风味炼金术。',
    tags: ['处理法', '实验发酵', '朗姆酒桶', '共发酵', '氮气冷洗', '厌氧', '二氧化碳浸渍', '热冲击'],
    relatedCardIds: [
      'sa-01-macarena-rum',
      'af-03-gelana-coferm',
      'sa-02-baishan-n2',
      'pr-01-classic-process',
      'rg-03-latin-america',
    ],
    summary:
      '近年哥伦比亚、巴拿马与埃塞俄比亚先锋处理厂彻底刷新了咖啡工艺的边界：通过单向排气阀隔绝氧气、注入 CO₂ 或惰性氮气、引入陈年酒桶、与天然水果基质共发酵、投加专属酵母或实施冷热水热冲击，让一杯纯咖啡能够合法且迷人地绽放出微醺酒韵、草莓奶糖甜品感或极致山泉花香。',
    keyTakeaway:
      '实验处理并非只有“浓烈重口味”——它同样能走向两个截然相反的巅峰：既能如酒桶（SA-01）与共发酵（AF-03）酿出甜品酒香，也能如冷泉氮气水洗（SA-02）将干净度推至 5.0 满分！',
    mythBuster:
      '「实验发酵就是加香精的“科技狠活”」——必须严格区分！正规共发酵（Co-fermentation）是将鲜果与真实天然水果、果泥或果汁醪共同微生物代谢转化，并遵循国际精品圈“完全透明标注”的道德准则，与烘焙后喷洒人工合成香精有着本质区别。',
    metrics: [
      { label: '酒桶吸附介质', value: '陈年朗姆/威士忌橡木桶' },
      { label: '氮气冷洗优势', value: '惰性 N₂ 不酸化、锁单萜烯' },
      { label: '热冲击温差', value: '40–50℃ 开孔 → 12–15℃ 骤闭' },
      { label: '本图鉴实测款', value: 'SA-01 / AF-03 / SA-02' },
    ],
    highlights: [
      '陈年酒桶（Barrel-Aged，如 SA-01）：水洗生豆置入陈年朗姆橡木桶低温每日翻动，多孔豆体均匀吸附酒酯与橡木内酯。',
      '共发酵水洗（Co-ferm，如 AF-03）：咖啡鲜果与天然果泥/发酵醪共酵生成浓郁草莓奶糖、香草泡芙酯类，再水洗收紧干净边界。',
      '冷泉水氮气水洗（N₂ Cold，如 SA-02）：冷泉降温 + 高纯惰性氮气置换氧气（不像 CO₂ 溶于水生成碳酸），温和缓酵锁住洋甘菊与佛手柑。',
      '厌氧 / CO₂ 浸渍 / 热冲击 / 定向酵母：分别贡献酸奶肉桂乳酸、红酒胞内发酵、冰火锁香白桃荔枝与高度稳定的专属菌株果香。',
    ],
    tableHeaders: ['前沿实验工艺', '核心物理/微生物机制', '标志风味与本库代表'],
    comparisonTable: [
      { metric: '陈年酒桶过桶', colA: '水洗生豆入陈年朗姆橡木桶每日翻动', colB: '朗姆酒、橡木、红樱桃（SA-01）' },
      { metric: '共发酵水洗', colA: '鲜果+天然风味基质共酵后再水洗收尾', colB: '草莓奶糖、香草泡芙（AF-03）' },
      { metric: '冷泉氮气水洗', colA: '高山冷泉清洗 + 惰性 N₂ 低温抑氧化', colB: '洋甘菊、佛手柑、净度 5.0（SA-02）' },
      { metric: '厌氧 / CO₂ 浸渍', colA: '密闭排气阀无氧 / 整果加压充 CO₂ 胞内酵', colB: '肉桂乳酸、红酒、覆盆子、玫瑰' },
      { metric: '热冲击 / 专研酵母', colA: '热洗开孔骤冷锁香 / 投加筛选明星菌株', colB: '高饱和白桃荔枝、纯净柑橘花香' },
    ],
    sections: [
      {
        heading: '为什么惰性氮气（N₂）与二氧化碳（CO₂）风味截然不同',
        body: '二氧化碳浸渍中，CO₂ 溶于果胶水分会形成温和碳酸、压低 pH 值并启动红酒式的果皮胞内发酵，倾向于产出浓郁红酒与覆盆子调性；而白山庄园采用的惰性氮气几乎不与水反应、不改变酸碱度，只负责温和排空氧气防止氧化杂味，再叠加冷泉低温，将瑰夏原生花香洗得纤尘不染。',
      },
      {
        heading: '客观拥抱风味多样性与信息透明原则',
        body: '全球精品行业正形成清晰共识：传统风土处理法负责忠实传达产区与品种本味，现代共发酵与酒桶工艺则负责拓宽甜品化与微醺特调的赏味乐趣。只要完整、诚实地在豆卡上标明工艺细节，每一位咖啡爱好者都能按心境自由挑选心仪之杯。',
      },
    ],
    visual: {
      rarity: 'legendary',
      defaultFinish: 'silver',
      foilStrength: 0.66,
      palette: {
        primary: '#3B2342',
        secondary: '#7AB3C4',
        accent: '#E06C9F',
        bgTop: '#160D1A',
        bgBottom: '#352242',
        paperTint: '#F2F4F7',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'fermentation_lab',
        subjectMotif: 'craft_experimental_ferm',
        effectParticles: ['nitrogen_bubble', 'amber_drop', 'strawberry_mist'],
        lineartPattern: 'crystal_contour',
      },
      depths: { subjectDepth: 0.34, effectsDepth: 0.50, backgroundDepth: -0.24, subjectScale: 1.08 },
    },
  },

  {
    id: 'pr-03-roast-agtron',
    code: 'PR-03',
    cardType: 'knowledge_card',
    group: 'craft_tasting',
    topic: '烘焙科学',
    title: '烘焙度演化与 Agtron 精品标尺',
    subtitle: '从 L1 极浅到 L8 意式深烘 · 美拉德、焦糖化与一二爆化学密码',
    tagline: '同一颗高海拔生豆，浅烘是花果茶汤，High 是奶油甜品，City 是朗姆平衡，深烘则是黑巧炭韵。',
    tags: ['烘焙度', 'Agtron', 'High', 'City', '美拉德反应', '焦糖化', '一爆二爆'],
    relatedCardIds: [
      'af-06-kaffa-natural',
      'af-03-gelana-coferm',
      'sa-01-macarena-rum',
      'ap-01-sumatra-mandheling',
      'ta-03-golden-cup-brew',
    ],
    summary:
      '烘焙是将毫无香气、坚硬青涩的咖啡生豆通过精确热能曲线转化为上千种挥发芳香物的艺术与科学。行业采用 Agtron Gourmet 精品焦糖化色值标尺（0–100，数值越高代表越浅）衡量烘焙深浅，并划分出从极浅（Cinnamon）到极深（Italian）的 L1–L8 八大阶梯。',
    keyTakeaway:
      '烘焙是一场「产地花果酸」与「烘焙焦糖苦甜」的跷跷板：浅中烘最大化保留柠檬酸与单萜烯花香；一爆后迈向 High 与 City 时焦糖甜感与奶油体量崛起；越过二爆后产地个性便逐步让位于焦苦炭焙。',
    mythBuster:
      '测 Agtron 色值绝不能混淆「豆表（Whole Bean）」与「豆粉（Ground）」！烘焙由外而内传热，磨粉后暴露的豆芯必然更浅，正常豆粉值比豆表高 8–15 分；若差值超过 20 分，往往意味着火候失控导致的“外焦内生（烘焙不均）”。',
    metrics: [
      { label: '一爆温度窗', value: '约 196–205℃（体积膨 50%+）' },
      { label: '二爆温度窗', value: '约 222–228℃（表面渗油）' },
      { label: '正常表芯差值', value: '豆粉比豆表高 8–15 分' },
      { label: '精品瑰夏黄金窗', value: 'L2–L3（Agtron 60–75）' },
    ],
    highlights: [
      '美拉德反应（~140–170℃+）：还原糖与氨基酸非酶褐变，生成烤坚果、面包皮芳香物与赋予醇厚感的类黑精。',
      '焦糖化反应（~170–205℃+）：蔗糖热裂解带来蜂蜜、红糖与太妃糖甜感；但进入二爆过度焦糖化会迅速转为焦苦。',
      '有机酸演变：浅中烘保留明亮柠檬酸与苹果酸；深烘时果酸热降解，绿原酸裂解为奎宁酸带来厚重苦韵。',
      '精确呼应本库豆单：L2 浅度（卡法日晒）→ L3 浅中度（翡翠/戈里/白山）→ L4 High（格拉纳）→ L5 City（玛卡瑞纳/巴西）→ L6 Full City（黄金曼特宁）。',
    ],
    tableHeaders: ['梯队与术语', 'Agtron 豆表 / 豆粉', '爆裂定位', '核心风味与适配豆'],
    comparisonTable: [
      { metric: 'L2 浅度 Light', colA: '68–75 / 78–86', colB: '一爆中段至刚结束', colC: '极度放大果香蓝莓（卡法日晒）' },
      { metric: 'L3 浅中度 Mod. Light', colA: '60–68 / 70–78', colB: '一爆密集结束适度发展', colC: '瑰夏黄金甜区（翡翠/戈里/白山）' },
      { metric: 'L4 微中 High', colA: '54–62 / 64–72', colB: '一爆后 30–60s，焦糖加速', colC: '柔和尖酸、奶甜奶油（格拉纳）' },
      { metric: 'L5 中度 City', colA: '48–55 / 58–65', colB: '一爆与二爆之间无出油', colC: '酸甜苦均衡酒韵可可（玛卡瑞纳）' },
      { metric: 'L6 中深 Full City', colA: '40–48 / 48–56', colB: '二爆初期微现星点油光', colC: '黑巧草本厚醇（黄金曼特宁）' },
      { metric: 'L7–8 法式/意式深烘', colA: '20–38 / 25–45', colB: '二爆密集至炭化油亮', colC: '强烈焦苦烟熏，适合重口加奶' },
    ],
    sections: [
      {
        heading: '听懂烘焙室里的“两次爆裂”声学密码',
        body: '当豆温升至约 196–205℃，内部水蒸气与 CO₂ 气压冲破细胞壁发出如爆米花般的清脆声响，称为「一爆」，此时生豆骤然膨胀超过 50%、正式进入可饮用发展期；若继续加热至 222–228℃，纤维素骨架碳化崩裂发出更细密高频的“噼啪”「二爆」，内部油脂顺裂隙渗出豆表形成油亮光泽。',
      },
      {
        heading: '烘焙度如何指导你的手冲水温',
        body: '浅烘豆细胞致密、可溶物较难析出，需要较高水温（91–93℃）与中细研磨拉出花香甜感；而越深烘的豆子细胞多孔疏松、极易过萃苦味，像 City 玛卡瑞纳宜降至 88–90℃，Full City 黄金曼特宁更建议调低至 86–88℃ 并放粗研磨。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.56,
      palette: {
        primary: '#5C3419',
        secondary: '#D99152',
        accent: '#A87342',
        bgTop: '#1C0F08',
        bgBottom: '#4E2B15',
        paperTint: '#F5EFE5',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'roast_curve',
        subjectMotif: 'craft_roast_ring',
        effectParticles: ['caramel_spark', 'cocoa_flake', 'gold_dust'],
        lineartPattern: 'oak_rings_geometry',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'ta-01-sca-cva-wheel',
    code: 'TA-01',
    cardType: 'knowledge_card',
    group: 'craft_tasting',
    topic: '品鉴科学',
    title: 'SCA / CVA 品鉴体系与风味轮',
    subtitle: '从经典 100 分制到最新 CVA 四大支柱 × 酸质五家族与温区三幕剧',
    tagline: '好酸质不是醋酸，而是咬开成熟水果的生津活力——掌握 CVA 四大支柱，你也能像国际评委一样拆解一杯咖啡。',
    tags: ['品鉴', 'SCA', 'CVA', '风味轮', '酸质五家族', '触感光谱', '温区变化'],
    relatedCardIds: [
      'ta-02-grading-physics',
      'ta-03-golden-cup-brew',
      'ca-01-esmeralda-green',
      'af-01-kenya-nyeri-aa',
      'af-03-gelana-coferm',
    ],
    summary:
      '传统 SCA 2004 版杯测以 100 分制（≥80 分为精品、85+ 为卓越微批次、90+ 为殿堂竞赛级）定义了行业二十年；而最新确立的 SCA CVA（咖啡价值评估体系，SCA-102~105）更进一步，将品鉴科学拆解为「物理、描述性、情感质量、外在属性」四大独立支柱，这也是本套 3D 闪卡卡背与精读档案的底层设计哲学。',
    keyTakeaway:
      'CVA 最大的革新在于把“它客观像什么（描述性 CATA + 15 分强度）”与“我有多喜欢它的品质（情感 9 分制）”彻底解耦，并把产地故事与物理科学正式纳入咖啡价值版图。',
    mythBuster:
      '「咖啡发酸就是坏了或没烘熟」是新手最常见的品鉴误区！劣质尖酸来自欠萃或变质发酵，而精品咖啡迷人的果酸由柠檬酸、苹果酸、磷酸、酒石酸与乳酸构成，如同咬开新鲜水蜜桃、青提或黑加仑时的清新明亮与口腔生津。',
    metrics: [
      { label: '精品门槛分', value: '80+ 精品 / 85+ 卓越 / 90+ 殿堂' },
      { label: 'CVA 四大支柱', value: '物理 / 描述 / 情感 / 外在' },
      { label: '品鉴黄金温区', value: '中温 50–60℃ 味蕾全开' },
      { label: '风味轮大类', value: '11 大主色谱（本库全映射）' },
    ],
    highlights: [
      '酸质五家族：柠檬酸（清爽柠檬/佛手柑）、苹果酸（清脆青提/杏桃）、磷酸（肯尼亚黑加仑气泡感）、酒石酸（日晒/酒桶红酒骨架）、乳酸（共发酵酸奶奶油柔滑）。',
      '触感五阶光谱：茶感（卡法水洗）→ 果汁感（翡翠绿标）→ 丝滑 → 奶油感（格拉纳）→ 糖浆/酒体厚重感（玛卡瑞纳/曼特宁）。',
      '温区三幕剧：高温 65–75℃ 闻花香酒香 → 中温 50–60℃ 酸甜触感巅峰 → 低温 35–45℃ 终极试金石（好豆放凉越喝越清甜！）。',
      '风味轮使用法：从内圈大类（花香/果香/坚果）逐层向外缩小至具体锚点（如 果香→莓果→蓝莓）。',
    ],
    tableHeaders: ['CVA 四大支柱', '核心问题与量表', '映射到本 3D 闪卡'],
    comparisonTable: [
      { metric: '1. 物理评估 Physical', colA: '含水率、密度、Aw、瑕疵数、Agtron 色值', colB: '卡背物理规格徽章（如 10.8% / 880g/L）' },
      { metric: '2. 描述评估 SCA-103', colA: '完全去评判：CATA 风味勾选 + 15 分强度', colB: '彩色风味胶囊 + 6 维感官轮廓雷达图' },
      { metric: '3. 情感评估 SCA-104', colA: '9 分制品质印象量表（香/味/酸/甜/触感）', colB: '品鉴笔记 Tasting Notes + 推荐场景' },
      { metric: '4. 外在属性 SCA-105', colA: '微地块溯源、稀有品种、赛事履历与人文故事', colB: '精读抽屉完整产地故事与处理法详解' },
    ],
    sections: [
      {
        heading: '为什么同一杯精品咖啡，放凉之后必须再喝一口',
        body: '人体舌头在 65℃ 以上高温时味觉灵敏度偏低，此时主要靠鼻腔捕捉易挥发的玫瑰、洋甘菊与朗姆橡木香；待咖啡自然降至 50–60℃ 中温段，甜味与果酸才立体浮现；而降至 35–45℃ 低温段则是“照妖镜”——瑕疵豆会暴露出涩口焦苦，真正的高海拔精品瑰夏却能显出茶汤般的澄澈甘甜。',
      },
      {
        heading: '看懂卡背 6 维感官雷达的几何指纹',
        body: '本套图鉴采用 0.0–5.0 连续 0.1 步进 6 维雷达（花果香气、酸质明亮、甜感表现、醇厚度、干净度、余韵复杂性），让你一眼看穿不同豆子的性格差异：例如白山庄园拉满干净度 5.0、格拉纳拉满甜感 5.0、曼特宁拉满醇厚度 5.0、而翡翠绿标则是花果 5.0 的六边形殿堂标杆。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'pearl',
      foilStrength: 0.60,
      palette: {
        primary: '#6A2E52',
        secondary: '#F2B705',
        accent: '#E06C9F',
        bgTop: '#24101C',
        bgBottom: '#4E223D',
        paperTint: '#FAF4F0',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'flavor_wheel',
        subjectMotif: 'craft_sca_wheel',
        effectParticles: ['rose_petal', 'citrus_spark', 'berry_glow'],
        lineartPattern: 'flavor_wave_contour',
      },
      depths: { subjectDepth: 0.34, effectsDepth: 0.48, backgroundDepth: -0.22, subjectScale: 1.08 },
    },
  },

  {
    id: 'ta-02-grading-physics',
    code: 'TA-02',
    cardType: 'knowledge_card',
    group: 'craft_tasting',
    topic: '生豆物理',
    title: '国际生豆分级与物理指标密码',
    subtitle: 'G1 / AA / SHB / 翡翠三标 × 解码 10.8% 含水率、880g/L 密度与 Aw',
    tagline: '含水率看水量，水活度看保鲜，密度看海拔功力——10.8% 与 880g/L，正是顶级名庄生豆的体检满分单。',
    tags: ['分级', '物理指标', 'G1', 'AA', 'SHB', '翡翠绿标', '10.8%', '880g/L', 'Aw', 'COE', 'BOP'],
    relatedCardIds: [
      'ca-01-esmeralda-green',
      'af-01-kenya-nyeri-aa',
      'af-04-gori-natural',
      'af-06-kaffa-natural',
      'ta-01-sca-cva-wheel',
    ],
    summary:
      '面对豆袋上眼花缭乱的「G1、AA、SHB、Supremo、绿标、COE/BOP」与生豆体检数据「10.8% 水份 / 880g/L 密度 / Aw < 0.60」，本卡一次性打通全球主流产区命名规则与生豆物理科学，帮你秒懂高海拔硬豆为何经得起跨洋运输与精细浅烘。',
    keyTakeaway:
      '各国分级侧重各不相同（埃塞看瑕疵、肯尼亚/哥伦比亚看豆粒目数、中美洲看海拔硬度）；唯有结合含水率（10.5–12.0%）、水活度（<0.60）与高密度，才能真正看穿生豆的内在健康度。',
    mythBuster:
      '两大高频避坑：① 哥伦比亚的 Supremo（≥17–18 目）只代表豆粒尺寸大而非风味必然好于颗粒偏小的 Excelso 或高海拔微批次粉波旁；② 巴拿马翡翠庄园的「红标/绿标/蓝标」全系皆为 100% 瑰夏，但庄园另一款「Diamond Mountain（钻石山）」并非瑰夏，而是 100% 卡杜艾！',
    metrics: [
      { label: '黄金含水率窗', value: '10.5% – 12.0%（翡翠 10.8%）' },
      { label: '水活度保鲜线', value: 'Aw < 0.60（理想 0.50–0.58）' },
      { label: '极硬豆密度例', value: '880 g/L（高海拔紧实）' },
      { label: '顶级国际赛事', value: 'COE ≥87/90+ · BOP 瑰夏殿堂' },
    ],
    highlights: [
      '埃塞 G1–G4：按每 300g 生豆物理瑕疵点数分级，G1（0–3 瑕疵）为最高等级，水洗与精品日晒皆可获评（如 AF-04、AF-06）。',
      '肯尼亚 AA/AB/PB：按筛网孔径大小分级，AA 为 17–18 目大粒标杆，PB（Peaberry 圆豆/公豆）为单籽饱满圆豆约占 5–10%。',
      '中美洲 SHB / SHG：Strictly Hard Bean（极硬豆）与 Strictly High Grown（极高海拔），通常对应 ≥1350–1500m 冷凉产区。',
      '巴拿马翡翠三标：红标（线上竞拍顶尖独立微批次）> 绿标 Private Collection（1600–1800m 三大名地块精选，对应 CA-01）> 蓝标 Geisha 1500。',
    ],
    tableHeaders: ['分级 / 物理指标', '评判标准与健康区间', '对风味与烘焙的真实影响'],
    comparisonTable: [
      { metric: '含水率 Moisture', colA: '黄金窗 10.5% – 12.0%（翡翠 10.8%）', colB: '过湿易发霉夹生；过干易老化焦苦；适中助美拉德传热' },
      { metric: '生豆密度 Density', colA: '高海拔极硬豆可达 760–880 g/L*', colB: '细胞壁致密浓缩糖酸，需更高入炉初始热能穿透豆芯' },
      { metric: '水活度 Aw', colA: '< 0.60 安全保鲜（≥0.65 易生霉）', colB: '锁住自由水活性，大幅延缓生豆跨洋衰减成木质稻草味' },
      { metric: '产区等级代号', colA: '埃塞 G1 / 肯尼亚 AA / 中美 SHB', colB: '分别代表低瑕疵、大筛网目数、高海拔硬豆三大维度' },
      { metric: 'COE 与 BOP 赛事', colA: 'COE ≥87 获奖/90+总统奖 · BOP三赛道', colB: '全球盲测最高背书，BOP 冠军瑰夏屡创 95–98 高分' },
    ],
    sections: [
      {
        heading: '深度解码翡翠绿标：10.8% 含水率与 880 g/L 密度',
        body: '10.8% 含水率正处在 10.5%–12.0% 黄金窗口的精干甜蜜点，既确保跨洋运输绝无霉变隐忧，又保有充足水分子在烘焙炉内充当导热介质；而按电容/振实品控口径测得的 880 g/L 极高密度（常规自由堆积硬豆约 740–780+ g/L），如同紧实实木，昭示着巴鲁火山 1600–1800m 漫长冷凉成熟期所浓缩的丰沛蔗糖与玫瑰芳香前体。',
      },
      {
        heading: '含水率 vs 水活度（Aw）：为什么两个都要测',
        body: '含水率回答“豆子里总共有多少水”，而水活度（0.00–1.00）回答“这些水有多活跃、能不能养活霉菌或催化脂质氧化”。两批含水率同为 11.2% 的生豆，若干燥过快导致水分分布失衡，其中一批 Aw 可能飙升至 0.65 并在三个月内迅速失去花香；唯有双达标（10.5–12.0% 且 Aw < 0.60）才能让新产季生豆历久弥新。',
      },
    ],
    visual: {
      rarity: 'rare',
      defaultFinish: 'silver',
      foilStrength: 0.54,
      palette: {
        primary: '#1E463B',
        secondary: '#D6A25E',
        accent: '#7AB3C4',
        bgTop: '#0E211C',
        bgBottom: '#1F463B',
        paperTint: '#F4F2EC',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'botanical_grid',
        subjectMotif: 'craft_grading_physics',
        effectParticles: ['silver_frost', 'gold_dust'],
        lineartPattern: 'crystal_contour',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.44, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },

  {
    id: 'ta-03-golden-cup-brew',
    code: 'TA-03',
    cardType: 'knowledge_card',
    group: 'craft_tasting',
    topic: '冲煮科学',
    title: 'SCA 金杯准则与手冲调参速查',
    subtitle: 'EY 18–22% × TDS 1.15–1.45% · 五大冲煮矩阵与欠/过萃诊断',
    tagline: '觉得尖酸寡淡就调细升温，觉得焦苦涩喉就调粗降温——每次只改一个变量，两杯之内必出好喝金杯。',
    tags: ['冲煮', '金杯准则', '萃取率', 'TDS', '手冲三段式', '急冷冰手冲', '冷萃', '奶咖'],
    relatedCardIds: [
      'ca-01-esmeralda-green',
      'sa-01-macarena-rum',
      'sa-02-baishan-n2',
      'af-03-gelana-coferm',
      'pr-03-roast-agtron',
    ],
    summary:
      '好豆需要好萃取来兑现潜力。SCA 金杯准则（Golden Cup Standard）用两个科学坐标锚定了人类味蕾最愉悦的平衡区：萃取率（EY，咖啡粉中被溶解的可溶物占比）18%–22%，以及手冲浓度（TDS）1.15%–1.45%。配合经典的 91–92℃ / 1:15 / 三段式 2 分钟手冲模型，你就能稳定复刻咖啡馆水准。',
    keyTakeaway:
      '精品浅烘瑰夏万能起步公式：15g 中细研磨粉 + 91–92℃ 水温 + 1:15（225g 水）+ 三段注水（30g 闷蒸 30s → 125g → 225g 约 2:00 滴完），随后按口感微调单变量即可。',
    mythBuster:
      '「把萃取率冲得越高、咖啡泡得越久就越香醇不浪费」——大错特错！咖啡粉总可溶物虽有约 30%，但排在 22% 之后溶出的多是木质纤维与大分子收敛苦涩物，一旦过萃，原本精致的茉莉与柑橘瞬间会被浑浊涩口吞噬。',
    metrics: [
      { label: '金杯萃取率 EY', value: '18% – 22%' },
      { label: '手冲浓度 TDS', value: '1.15% – 1.45%（实操至 1.50%）' },
      { label: '万能手冲基准', value: '91–92℃ · 1:15 · ~2:00' },
      { label: '黄金调参铁律', value: '每次仅调整 1 个变量' },
    ],
    highlights: [
      '手冲热饮（Pour-Over）：浅烘 92–93℃、浅中烘 91–92℃、City 中烘 88–90℃、中深烘 86–88℃，三段式 ~2:00 完整还原温区层次。',
      '急冷冰手冲（Flash Brew）：总比仍为 1:15（15g 粉 + 下壶 90g 冰 + 135g 92–93℃ 热水），研磨细半格，瞬间锁香激发柑橘与热带果。',
      '冷萃（Cold Brew）：中粗研磨、1:10（浓缩）或 1:14（即饮）冷藏浸泡 12–16h 精滤，极大放大朗姆酒桶与白山瑰夏的清冽圆润感。',
      '意式与奶咖：18g 极细粉 9 bar 约 25–32s 萃 36–40g 浓缩，注入 55–65℃ 绸缎微奶泡——用格拉纳瑰夏（AF-03）秒变草莓奶糖拿铁！',
    ],
    tableHeaders: ['口感失衡信号', '核心成因诊断', '优先调节动作（单变量）'],
    comparisonTable: [
      { metric: '欠萃（EY < 18%）', colA: '尖锐发酸、咸感、空洞水感、草腥短尾', colB: '① 调细研磨度 → ② 提温 +1~2℃ → ③ 增加注水扰动' },
      { metric: '过萃（EY > 22%）', colA: '焦苦、舌根发麻干涩、木质浑浊发闷', colB: '① 调粗研磨度 → ② 降温 -2~3℃ → ③ 柔水提前截流' },
      { metric: '偏淡（TDS < 1.15%）', colA: '酸甜平衡但体感稀薄如水', colB: '缩小粉水比（如 1:16 → 1:15 或 1:14），不动研磨' },
      { metric: '偏浓（TDS > 1.50%）', colA: '风味挤作一团、沉重压舌', colB: '加大粉水比（如 1:13 → 1:15），或萃后旁路补少量热水' },
    ],
    sections: [
      {
        heading: '理解萃取的“先后溶解顺序”',
        body: '热水接触咖啡粉的瞬间，不同化学物质按分子大小依次溶出：最先释放的是活泼果酸与清扬花香（前段），紧接着是丰盈的蔗糖与焦糖甜感（中段），最后才析出厚重苦味与涩感大分子（尾段）。好的三段式手冲正是在“甜感充分展开、苦涩尚未抬头”的 2 分钟黄金窗口优雅收尾。',
      },
      {
        heading: '五大主流冲煮方式速配指南',
        body: '若想品鉴 6 款瑰夏的热/温/冷三幕花香变化，首选 91–92℃ 手冲热饮；夏日追求明亮柑橘与菠萝凤梨爆发，首推 40% 冰块急冷冰手冲（适配戈里森林、卡法日晒、白山庄园）；偏爱丝滑微醺与低酸厚韵，冷萃玛卡瑞纳朗姆酒桶或把格拉纳瑰夏做成拿铁将带来惊喜体验。',
      },
    ],
    visual: {
      rarity: 'classic',
      defaultFinish: 'gold',
      foilStrength: 0.52,
      palette: {
        primary: '#3B281E',
        secondary: '#D6A25E',
        accent: '#E09248',
        bgTop: '#160E0A',
        bgBottom: '#3A261B',
        paperTint: '#F6F1E7',
      },
      layers: {
        mode: 'procedural',
        bgMotif: 'brewing_atelier',
        subjectMotif: 'craft_pour_over',
        effectParticles: ['tea_mist', 'dew_drop', 'gold_dust'],
        lineartPattern: 'contour_botanical',
      },
      depths: { subjectDepth: 0.32, effectsDepth: 0.46, backgroundDepth: -0.22, subjectScale: 1.06 },
    },
  },
];
