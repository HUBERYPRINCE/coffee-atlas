/**
 * 我的豆单工坊 (My Bean Studio)
 * 暗房磨砂弹窗：支持中文豆卡文案一键正则识别、结构化录入/编辑、6 维雷达滑块、本地图片压缩上传、localStorage 持久化与 JSON 导出/导入
 */

import { RADAR_AXES } from '../../data/flavor-palette.js';

export const CUSTOM_BEANS_STORAGE_KEY = 'coffee-atlas-custom-beans-v1';

const CONTINENTS = ['非洲', '拉丁美洲', '亚太', '中国云南'];

const PROCESS_OPTIONS = [
  { value: 'washed', label: '水洗 (Washed)' },
  { value: 'natural', label: '日晒 (Natural)' },
  { value: 'honey', label: '蜜处理 (Honey)' },
  { value: 'wet_hulled', label: '湿刨法 (Wet Hulled)' },
  { value: 'barrel_aged', label: '酒桶发酵 (Barrel-Aged)' },
  { value: 'co_fermented', label: '共发酵 (Co-fermented)' },
  { value: 'nitrogen_cold', label: '氮气冷洗 (Nitrogen Cold)' },
  { value: 'anaerobic', label: '厌氧发酵 (Anaerobic)' },
];

const ROAST_PRESETS = {
  浅度: { label: '浅度', scale: 'Light', agtron: '70-78（豆粉 80-88）', colorHex: '#B67B43', position01: 0.2 },
  中浅度: { label: '中浅度', scale: 'Medium-Light', agtron: '65-72（豆粉 75-82）', colorHex: '#9E6434', position01: 0.29 },
  浅中度: { label: '浅中度', scale: 'Moderately Light', agtron: '60-68（豆粉 70-78）', colorHex: '#8C582F', position01: 0.35 },
  High: { label: 'High', scale: 'High Roast', agtron: '55-62（豆粉 65-72）', colorHex: '#7A4725', position01: 0.48 },
  City: { label: 'City', scale: 'City Roast', agtron: '48-55（豆粉 58-65）', colorHex: '#63371B', position01: 0.62 },
  'Full City': { label: 'Full City', scale: 'Full City Roast', agtron: '40-48（豆粉 50-58）', colorHex: '#4A2613', position01: 0.76 },
};

const FINISH_OPTIONS = [
  { id: 'gold', label: '烫金' },
  { id: 'pearl', label: '珠光' },
  { id: 'silver', label: '银箔' },
  { id: 'original', label: '原画' },
];

const PALETTE_BY_CONTINENT = {
  非洲: { primary: '#5A3148', secondary: '#D9A760', accent: '#D9668A', bgTop: '#1D1119', bgBottom: '#361B2A', paperTint: '#F6F1E7' },
  拉丁美洲: { primary: '#13533F', secondary: '#D9B664', accent: '#D4627B', bgTop: '#0C241C', bgBottom: '#183F31', paperTint: '#F6F1E7' },
  亚太: { primary: '#3D3B26', secondary: '#C99B53', accent: '#6CA27B', bgTop: '#16160F', bgBottom: '#2B291B', paperTint: '#F6F1E7' },
  中国云南: { primary: '#2F4A3E', secondary: '#D6A25E', accent: '#C86D52', bgTop: '#131D19', bgBottom: '#22362E', paperTint: '#F6F1E7' },
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inferContinent(text = '') {
  const s = String(text);
  if (/云南|保山|普洱|临沧|德宏|中国/.test(s)) return '中国云南';
  if (/埃塞|肯尼亚|卢旺达|布隆迪|也门|坦桑尼亚|乌干达|非洲|卡法|戈里|耶加|西达摩|古姬/.test(s)) return '非洲';
  if (/印尼|苏门答腊|爪哇|苏拉威西|越南|夏威夷|巴布亚|印度|亚太|曼特宁/.test(s)) return '亚太';
  return '拉丁美洲';
}

function inferProcessCategory(text = '') {
  const s = String(text);
  if (/酒桶|过桶|朗姆|威士忌|白兰地|barrel/i.test(s)) return 'barrel_aged';
  if (/共发酵|果酵|co-?ferm/i.test(s)) return 'co_fermented';
  if (/氮气|冷泉|nitrogen/i.test(s)) return 'nitrogen_cold';
  if (/湿刨|曼特宁|wet.?hull|giling/i.test(s)) return 'wet_hulled';
  if (/蜜处理|黄蜜|红蜜|黑蜜|白蜜|honey/i.test(s)) return 'honey';
  if (/厌氧|二氧化碳|co2|anaerobic/i.test(s)) return 'anaerobic';
  if (/日晒|natural/i.test(s)) return 'natural';
  return 'washed';
}

function inferRoastLabel(text = '') {
  const s = String(text);
  if (/full\s*city|深烘|中深偏深|重焙/i.test(s)) return 'Full City';
  if (/city|中深/i.test(s)) return 'City';
  if (/high|中度|中烘/i.test(s)) return 'High';
  if (/中浅/i.test(s)) return '中浅度';
  if (/浅中/i.test(s)) return '浅中度';
  if (/浅/i.test(s)) return '浅度';
  return '浅中度';
}

function splitFlavors(raw) {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s || '').trim()).filter(Boolean).slice(0, 8);
  }
  return String(raw || '')
    .split(/[、，,\/·；;|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function buildDefaultBrewSteps(totalTimeText = '约 2:00', ratio = '1:15') {
  const ratioMatch = String(ratio).match(/1\s*[:：]\s*(\d+(?:\.\d+)?)/);
  const ratioNum = ratioMatch ? Number(ratioMatch[1]) : 15;
  const totalWater = Math.round(15 * (Number.isFinite(ratioNum) ? ratioNum : 15));
  const midWater = Math.round(totalWater * 0.56);

  const mmss = String(totalTimeText).match(/(\d{1,2})\s*:\s*(\d{2})/);
  const totalSec = mmss ? Number(mmss[1]) * 60 + Number(mmss[2]) : 120;
  const t1 = Math.min(35, Math.max(25, Math.round(totalSec * 0.25)));
  const t2 = Math.min(totalSec - 25, Math.max(t1 + 25, Math.round(totalSec * 0.55)));
  const fmt = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return [
    { stage: '一段 · 闷蒸唤醒', target: `0:00–${fmt(t1)} · 注水至 30g`, note: '中心细水流均匀润湿粉床，充分排气唤醒干香。' },
    { stage: '二段 · 主体萃取', target: `${fmt(t1)}–${fmt(t2)} · 绕圈注水至 ${midWater}g`, note: '稳定小绕圈拉出核心风味与饱满甜感。' },
    { stage: '三段 · 平衡收尾', target: `${fmt(t2)}–${fmt(totalSec)} · 柔水补至 ${totalWater}g`, note: '中心柔水补足目标水量，锁住干净余韵。' },
  ];
}

/**
 * Smart parser for pasted Chinese roastery coffee bean cards.
 */
export function parseBeanText(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return { fields: {}, matchedCount: 0 };

  const fields = {};
  const chunks = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Split pipe-delimited single-line cards like "产区：...｜等级：G1｜豆种：Geisha"
    const subParts = trimmed.split(/[｜|]+/).map((p) => p.trim()).filter(Boolean);
    chunks.push(...subParts);
  }

  const labelPatterns = [
    { key: 'title', re: /^(?:豆名|品名|名称|咖啡名|标题)\s*[：:]\s*(.+)$/ },
    { key: 'regionFull', re: /^(?:产区|产地|原产地)\s*[：:]\s*(.+)$/ },
    { key: 'estate', re: /^(?:庄园|地块|庄园\s*\/\s*地块|处理厂|农场)\s*[：:]\s*(.+)$/ },
    { key: 'altitude', re: /^(?:海拔|种植海拔)\s*[：:]\s*(.+)$/ },
    { key: 'grade', re: /^(?:等级|级别|分级)\s*[：:]\s*(.+)$/ },
    { key: 'harvestSeason', re: /^(?:产季|采收季|年份)\s*[：:]\s*(.+)$/ },
    { key: 'variety', re: /^(?:豆种|品种|豆种与品种|咖啡品种)\s*[：:]\s*(.+)$/ },
    { key: 'process', re: /^(?:处理方式|处理法|生豆处理|发酵方式)\s*[：:]\s*(.+)$/ },
    { key: 'roast', re: /^(?:烘焙度|烘焙程度|焙度)\s*[：:]\s*(.+)$/ },
    { key: 'flavors', re: /^(?:风味|风味标签|风味描述|干湿香)\s*[：:]\s*(.+)$/ },
    { key: 'tastingNotes', re: /^(?:风味笔记|口感|品鉴笔记|杯测笔记|杯中表现)\s*[：:]\s*(.+)$/ },
    { key: 'originStory', re: /^(?:产地故事|背景故事|庄园故事|简介)\s*[：:]\s*(.+)$/ },
    { key: 'cultivationHarvest', re: /^(?:种植与采摘|种植采摘|风土与种植)\s*[：:]\s*(.+)$/ },
    { key: 'recommendedScenarios', re: /^(?:推荐场景|推荐饮用场景|饮用建议|适用场景)\s*[：:]\s*(.+)$/ },
    { key: 'brewingRaw', re: /^(?:萃取参考|冲煮参考|萃取\s*\/\s*冲煮参考|手冲参考|冲煮建议|冲煮参数)\s*[：:]\s*(.+)$/ },
  ];

  let lastKey = null;
  chunks.forEach((chunk, idx) => {
    let matched = false;
    for (const { key, re } of labelPatterns) {
      const m = chunk.match(re);
      if (m) {
        fields[key] = m[1].trim();
        lastKey = key;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (idx === 0 && !fields.title && chunk.length <= 42) {
        fields.title = chunk.replace(/^[【\[]|[】\]]$/g, '').trim();
      } else if (lastKey && ['tastingNotes', 'originStory', 'process', 'brewingRaw', 'cultivationHarvest', 'recommendedScenarios'].includes(lastKey)) {
        fields[lastKey] = `${fields[lastKey]} ${chunk}`.trim();
      }
    }
  });

  const result = {};
  if (fields.title) result.title = fields.title;

  if (fields.regionFull) {
    result.continent = inferContinent(fields.regionFull);
    const parts = fields.regionFull.split(/[\s·,，]+/).filter(Boolean);
    result.country = parts[0] || fields.regionFull;
    result.region = parts.slice(1).join(' ') || fields.regionFull;
  } else if (fields.title) {
    result.continent = inferContinent(fields.title);
  }

  if (fields.estate) result.estate = fields.estate;
  if (fields.altitude) result.altitude = fields.altitude;
  else {
    const altMatch = text.match(/(\d{3,4}(?:\s*[–—\-~]\s*\d{3,4})?\s*m(?:asl)?)/i);
    if (altMatch) result.altitude = altMatch[1].replace(/\s+/g, '');
  }
  if (fields.grade) result.grade = fields.grade;
  if (fields.harvestSeason) result.harvestSeason = fields.harvestSeason;
  if (fields.variety) result.variety = fields.variety;

  if (fields.process) {
    result.processCategory = inferProcessCategory(fields.process);
    const procSplit = fields.process
      .split(/(?:—{2,}|-{2,}|[—:：])/)
      .map((s) => s.trim())
      .filter(Boolean);
    result.processName = procSplit[0] || fields.process;
    if (procSplit.length > 1) {
      result.processDetail = procSplit.slice(1).join(' — ');
    } else if (fields.process.length > 16) {
      result.processName = PROCESS_OPTIONS.find((o) => o.value === result.processCategory)?.label || '特色处理';
      result.processDetail = fields.process;
    }
  }

  if (fields.roast) result.roastLabel = inferRoastLabel(fields.roast);
  if (fields.flavors) result.flavors = splitFlavors(fields.flavors).join('、');
  if (fields.tastingNotes) result.tastingNotes = fields.tastingNotes;
  if (fields.originStory) result.originStory = fields.originStory;
  if (fields.cultivationHarvest) result.cultivationHarvest = fields.cultivationHarvest;
  if (fields.recommendedScenarios) result.recommendedScenarios = fields.recommendedScenarios;

  // Extract brewing specifics
  const brewText = fields.brewingRaw || text;
  const tempM = brewText.match(/(\d{2})\s*(?:℃|°C|度)/i);
  if (tempM) result.waterTempC = Number(tempM[1]);
  const ratioM = brewText.match(/(1\s*[:：]\s*\d{2}(?:\.\d)?)/);
  if (ratioM) result.ratio = ratioM[1].replace(/\s+/g, '').replace('：', ':');
  const brewWithoutRatio = ratioM ? brewText.replace(ratioM[0], ' ') : brewText;
  const grindM = brewWithoutRatio.match(/(极细|中细|中度|中粗|粗研磨|细研磨|中细研磨)/);
  if (grindM) result.grindSize = grindM[1].endsWith('研磨') ? grindM[1] : `${grindM[1]}研磨`;
  const timeM = brewWithoutRatio.match(/(?:约\s*)?(\d{1,2}\s*:\s*\d{2}|\d+(?:\.\d+)?\s*分钟)/);
  if (timeM) {
    const rawT = timeM[1];
    if (rawT.includes('分钟')) {
      const mins = Number(rawT.replace('分钟', '').trim());
      if (Number.isFinite(mins)) {
        const totalS = Math.round(mins * 60);
        result.totalTime = `约 ${Math.floor(totalS / 60)}:${String(totalS % 60).padStart(2, '0')}`;
      }
    } else {
      result.totalTime = `约 ${rawT.replace(/\s+/g, '')}`;
    }
  }
  if (fields.brewingRaw) result.brewSummary = fields.brewingRaw;

  // Optional physics hints (e.g. 10.8% / 880g/L)
  const moistM = text.match(/含水率?[^\d]{0,4}(\d{1,2}(?:\.\d+)?)\s*%/);
  const densM = text.match(/(\d{3,4})\s*g\/L/i);
  if (moistM) result.moisturePct = Number(moistM[1]);
  if (densM) result.densityGl = Number(densM[1]);

  if (!result.title && result.country && result.variety) {
    result.title = `${result.country} ${result.variety}`;
  }

  return { fields: result, matchedCount: Object.keys(result).length };
}

function nextCustomCode(existingBeans) {
  let maxNum = 0;
  for (const b of existingBeans || []) {
    const m = String(b?.code || '').match(/^MY-(\d+)$/i);
    if (m) maxNum = Math.max(maxNum, Number(m[1]));
  }
  return `MY-${String(maxNum + 1).padStart(2, '0')}`;
}

export function normalizeCustomBean(input, existingBeans = []) {
  const safeId =
    typeof input?.id === 'string' && input.id.startsWith('my-')
      ? input.id
      : `my-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const code =
    typeof input?.code === 'string' && /^MY-\d+$/i.test(input.code)
      ? input.code.toUpperCase()
      : nextCustomCode(existingBeans);

  const continent = CONTINENTS.includes(input?.origin?.continent)
    ? input.origin.continent
    : inferContinent(input?.origin?.country || input?.title || '');

  const procCat = PROCESS_OPTIONS.some((o) => o.value === input?.processing?.category)
    ? input.processing.category
    : inferProcessCategory(input?.processing?.name || '');

  const roastKey = ROAST_PRESETS[input?.roast?.label] ? input.roast.label : inferRoastLabel(input?.roast?.label || '');
  const roastPreset = ROAST_PRESETS[roastKey] || ROAST_PRESETS['浅中度'];

  const finish = FINISH_OPTIONS.some((f) => f.id === input?.visual?.defaultFinish)
    ? input.visual.defaultFinish
    : 'gold';

  const flavors = splitFlavors(input?.sensory?.flavors);
  const safeFlavors = flavors.length > 0 ? flavors : ['花香', '柑橘', '焦糖'];

  const rIn = input?.sensory?.radar6D || {};
  const clampScore = (v, fallback) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Number(Math.max(1, Math.min(5, n)).toFixed(1));
  };

  const waterTempC = Math.max(82, Math.min(98, Number(input?.brewing?.waterTempC) || 92));
  const ratio = String(input?.brewing?.ratio || '1:15').trim() || '1:15';
  const grindSize = String(input?.brewing?.grindSize || '中细研磨').trim() || '中细研磨';
  const totalTime = String(input?.brewing?.totalTime || '约 2:00').trim() || '约 2:00';
  const ratioMatch = ratio.match(/1\s*[:：]\s*(\d+(?:\.\d+)?)/);
  const waterGrams = Math.round(15 * (ratioMatch ? Number(ratioMatch[1]) : 15));

  const customImageDataUrl =
    typeof input?.visual?.layers?.customImageDataUrl === 'string' &&
    input.visual.layers.customImageDataUrl.startsWith('data:image/')
      ? input.visual.layers.customImageDataUrl
      : '';

  const bgMotifMap = { 非洲: 'forest', 拉丁美洲: 'volcano', 亚太: 'island', 中国云南: 'yunnan' };
  const subjectMotif =
    procCat === 'barrel_aged'
      ? 'rum_barrel'
      : procCat === 'nitrogen_cold'
        ? 'cold_spring'
        : procCat === 'co_fermented'
          ? 'dessert_cup'
          : procCat === 'wet_hulled'
            ? 'sumatra_spice'
            : continent === '中国云南'
              ? 'yunnan_typica'
              : 'coffee_cherry_branch';

  const basePalette = PALETTE_BY_CONTINENT[continent] || PALETTE_BY_CONTINENT['拉丁美洲'];

  const title = String(input?.title || '').trim() || '自定义单品豆';
  const country = String(input?.origin?.country || '').trim() || continent;
  const region = String(input?.origin?.region || '').trim() || country;
  const variety = String(input?.botany?.variety || '').trim() || 'Arabica';
  const processName =
    String(input?.processing?.name || '').trim() ||
    PROCESS_OPTIONS.find((o) => o.value === procCat)?.label ||
    '水洗';

  const physicsIn = input?.physics;
  const physics =
    physicsIn && (physicsIn.moisturePct != null || physicsIn.densityGl != null)
      ? {
          moisturePct: physicsIn.moisturePct != null ? Number(physicsIn.moisturePct) : undefined,
          densityGl: physicsIn.densityGl != null ? Number(physicsIn.densityGl) : undefined,
          note:
            physicsIn.note ||
            [
              physicsIn.moisturePct != null ? `实测含水率 ${physicsIn.moisturePct}%` : '',
              physicsIn.densityGl != null ? `堆积密度 ${physicsIn.densityGl}g/L` : '',
            ]
              .filter(Boolean)
              .join('，'),
        }
      : null;

  const tastingNotes =
    String(input?.sensory?.tastingNotes || '').trim() ||
    `以${safeFlavors.slice(0, 3).join('、')}为主导风味，层次明快而平衡。`;

  return {
    id: safeId,
    code,
    cardType: 'bean_card',
    group: 'bean_card',
    isHeroBean: false,
    isCustomBean: true,
    title,
    subtitle:
      String(input?.subtitle || '').trim() ||
      `${country} · ${variety} · ${processName}`,
    tagline:
      String(input?.tagline || '').trim() ||
      tastingNotes.slice(0, 44),
    tags: Array.from(
      new Set([country, variety, roastPreset.label, ...safeFlavors.slice(0, 4), '我的豆单']),
    ).filter(Boolean),
    relatedCardIds: Array.isArray(input?.relatedCardIds) && input.relatedCardIds.length > 0
      ? input.relatedCardIds
      : ['ca-01-esmeralda-green', 'pr-01-classic-process', 'ta-03-golden-cup-brew'],
    origin: {
      continent,
      country,
      region,
      estate: String(input?.origin?.estate || '').trim() || '精品微批次',
      altitude: String(input?.origin?.altitude || '').trim() || '1600m+',
      grade: String(input?.origin?.grade || '').trim() || '精品单品',
      harvestSeason: String(input?.origin?.harvestSeason || '').trim() || String(new Date().getFullYear()),
    },
    botany: {
      species: String(input?.botany?.species || '').trim() || 'Arabica 阿拉比卡',
      variety,
    },
    processing: {
      category: procCat,
      name: processName,
      detail:
        String(input?.processing?.detail || '').trim() ||
        `采用${processName}工艺精细处理，呈现清晰风土层次与洁净甜感。`,
    },
    roast: {
      ...roastPreset,
      ...(input?.roast?.agtron ? { agtron: input.roast.agtron } : {}),
    },
    physics,
    sensory: {
      flavors: safeFlavors,
      tastingNotes,
      radar6D: {
        floralFruity: clampScore(rIn.floralFruity, 4.2),
        acidity: clampScore(rIn.acidity, 4.0),
        sweetness: clampScore(rIn.sweetness, 4.2),
        body: clampScore(rIn.body, 3.6),
        cleanliness: clampScore(rIn.cleanliness, 4.3),
        aftertaste: clampScore(rIn.aftertaste, 4.1),
      },
    },
    narrative: {
      originStory:
        String(input?.narrative?.originStory || '').trim() ||
        `收录于个人「我的豆单工坊」，来自${country}${region !== country ? ` ${region}` : ''}产区的精选咖啡豆批次。`,
      cultivationHarvest:
        String(input?.narrative?.cultivationHarvest || '').trim() || '',
      recommendedScenarios:
        String(input?.narrative?.recommendedScenarios || '').trim() ||
        `建议以 ${waterTempC}℃ 手冲热饮细品风味变化，放凉后酸甜层次更佳。`,
    },
    brewing: {
      method: '手冲热饮',
      grindSize,
      waterTempC,
      ratio,
      doseWater: `15g 粉 / ${waterGrams}g 水`,
      totalTime,
      summary:
        String(input?.brewing?.summary || '').trim() ||
        `${grindSize}，${waterTempC}℃ 水温，粉水比 ${ratio}，三段式萃取 ${totalTime}。`,
      steps:
        Array.isArray(input?.brewing?.steps) && input.brewing.steps.length > 0
          ? input.brewing.steps
          : buildDefaultBrewSteps(totalTime, ratio),
    },
    visual: {
      rarity: 'custom',
      defaultFinish: finish,
      foilStrength: finish === 'original' ? 0 : 0.62,
      palette: {
        ...basePalette,
        ...(input?.visual?.palette || {}),
      },
      layers: {
        mode: customImageDataUrl ? 'custom' : 'procedural',
        bgMotif: bgMotifMap[continent] || 'volcano',
        subjectMotif,
        effectParticles: ['citrus_spark', 'gold_dust'],
        lineartPattern: 'contour_botanical',
        ...(customImageDataUrl ? { customImageDataUrl } : {}),
      },
      depths: {
        subjectDepth: 0.34,
        effectsDepth: 0.48,
        backgroundDepth: -0.24,
        subjectScale: 1.0,
      },
    },
  };
}

export function loadCustomBeans() {
  try {
    const raw = window.localStorage?.getItem(CUSTOM_BEANS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const list = [];
    for (const item of parsed) {
      if (item && typeof item === 'object') {
        list.push(normalizeCustomBean(item, list));
      }
    }
    return list;
  } catch {
    return [];
  }
}

export function saveCustomBeans(beans) {
  try {
    window.localStorage?.setItem(CUSTOM_BEANS_STORAGE_KEY, JSON.stringify(beans));
    return true;
  } catch {
    return false;
  }
}

function estimateDataUrlBytes(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return 0;
  return Math.round(((dataUrl.length - comma - 1) * 3) / 4);
}

async function compressImageFile(file) {
  const maxDim = 640;
  const maxBytes = 118 * 1024;

  const img = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('图片解码失败'));
      image.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });

  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const w = Math.max(1, Math.round((img.naturalWidth || 640) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || 640) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  // Prefer WebP when supported, fallback to JPEG; iteratively tune quality to stay < 120KB
  const tryEncode = (mime, q) => canvas.toDataURL(mime, q);
  const probeWebp = tryEncode('image/webp', 0.8);
  const mime = probeWebp.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';

  const qualities = [0.8, 0.7, 0.58, 0.46];
  let best = tryEncode(mime, qualities[0]);
  for (const q of qualities) {
    const candidate = tryEncode(mime, q);
    best = candidate;
    if (estimateDataUrlBytes(candidate) <= maxBytes) break;
  }

  return {
    dataUrl: best,
    bytes: estimateDataUrlBytes(best),
    mime,
  };
}

export function createBeanStudio(options = {}) {
  const { getCustomBeans, onSaveBean, onImportBeans, onNotice } = options;

  let isOpen = false;
  let editingBean = null;
  let currentImageDataUrl = '';

  const modalEl = document.createElement('div');
  modalEl.className = 'studio-modal';
  modalEl.id = 'bean-studio-modal';
  modalEl.setAttribute('role', 'dialog');
  modalEl.setAttribute('aria-modal', 'true');
  modalEl.setAttribute('aria-labelledby', 'studio-modal-title');
  modalEl.hidden = true;

  modalEl.innerHTML = `
    <div class="studio-modal-backdrop" id="studio-backdrop"></div>
    <div class="studio-modal-dialog">
      <header class="studio-head">
        <div class="studio-head-copy">
          <h2 class="studio-title" id="studio-modal-title">我的豆单工坊 · 录入新豆</h2>
          <span class="studio-sub" id="studio-modal-sub">保存后自动生成 3D 全息闪卡与 6 维棉纸品鉴卡背</span>
        </div>
        <button type="button" class="drawer-icon-btn" id="studio-close-btn" aria-label="关闭豆单工坊" title="关闭 (Esc)">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <form class="studio-form" id="studio-form" novalidate>
        <!-- 智能文本粘贴识别折叠区 -->
        <details class="studio-paste-box" id="studio-paste-box">
          <summary class="studio-paste-summary">
            <span>粘贴豆卡文案一键识别</span>
            <span class="studio-paste-hint">支持产区 / 海拔 / 豆种 / 处理方式 / 烘焙度 / 风味 / 冲煮参考</span>
          </summary>
          <div class="studio-paste-body">
            <textarea
              id="studio-paste-input"
              class="studio-textarea"
              rows="4"
              placeholder="示例：&#10;哥伦比亚 粉红波旁 水洗&#10;产区：哥伦比亚 慧兰&#10;海拔：1850m｜处理方式：水洗｜烘焙度：中浅度&#10;风味：血橙、粉红西柚、白花、蜂蜜&#10;萃取参考：92℃ 水温，1:15 粉水比，约 2:00"
            ></textarea>
            <div class="studio-paste-actions">
              <span class="studio-paste-status" id="studio-paste-status"></span>
              <button type="button" class="studio-btn-secondary" id="studio-parse-btn">自动识别填入</button>
            </div>
          </div>
        </details>

        <!-- 1. 基础信息 -->
        <fieldset class="studio-fieldset">
          <legend class="studio-legend">基础风土与烘焙信息</legend>
          <div class="studio-grid-2">
            <label class="studio-field is-wide">
              <span class="studio-label">豆名 <em>*</em></span>
              <input type="text" name="title" id="sf-title" class="studio-input" required placeholder="例如：哥伦比亚 慧兰 粉红波旁 水洗" />
            </label>
            <label class="studio-field is-wide">
              <span class="studio-label">英文副标（可选）</span>
              <input type="text" name="subtitle" id="sf-subtitle" class="studio-input" placeholder="例如：Colombia Huila · Washed Pink Bourbon" />
            </label>
            <label class="studio-field">
              <span class="studio-label">大洲风土带</span>
              <select name="continent" id="sf-continent" class="studio-select">
                ${CONTINENTS.map((c) => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </label>
            <label class="studio-field">
              <span class="studio-label">国家 / 产区</span>
              <input type="text" name="region" id="sf-region" class="studio-input" placeholder="例如：哥伦比亚 慧兰" />
            </label>
            <label class="studio-field">
              <span class="studio-label">庄园 / 地块</span>
              <input type="text" name="estate" id="sf-estate" class="studio-input" placeholder="例如：天堂庄园微批次" />
            </label>
            <label class="studio-field">
              <span class="studio-label">海拔</span>
              <input type="text" name="altitude" id="sf-altitude" class="studio-input" placeholder="例如：1800-1950m" />
            </label>
            <label class="studio-field">
              <span class="studio-label">等级 / 产季</span>
              <input type="text" name="gradeSeason" id="sf-grade-season" class="studio-input" placeholder="例如：G1 / 2026" />
            </label>
            <label class="studio-field">
              <span class="studio-label">豆种与品种</span>
              <input type="text" name="variety" id="sf-variety" class="studio-input" placeholder="例如：Pink Bourbon 粉红波旁" />
            </label>
            <label class="studio-field">
              <span class="studio-label">处理类别</span>
              <select name="processCategory" id="sf-process-cat" class="studio-select">
                ${PROCESS_OPTIONS.map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}
              </select>
            </label>
            <label class="studio-field">
              <span class="studio-label">具体处理工艺名</span>
              <input type="text" name="processName" id="sf-process-name" class="studio-input" placeholder="例如：72h 厌氧水洗" />
            </label>
            <label class="studio-field is-wide">
              <span class="studio-label">烘焙度（自动匹配 Agtron 色标）</span>
              <select name="roastLabel" id="sf-roast" class="studio-select">
                ${Object.values(ROAST_PRESETS)
                  .map((r) => `<option value="${r.label}">${r.label} · ${r.scale} (Agtron ${r.agtron})</option>`)
                  .join('')}
              </select>
            </label>
          </div>
        </fieldset>

        <!-- 2. 风味与六维感官 -->
        <fieldset class="studio-fieldset">
          <legend class="studio-legend">风味谱与六维感官雷达</legend>
          <div class="studio-grid-2">
            <label class="studio-field is-wide">
              <span class="studio-label">风味标签（顿号或逗号分隔）</span>
              <input type="text" name="flavors" id="sf-flavors" class="studio-input" placeholder="例如：白桃、茉莉、蜂蜜、柑橘" />
            </label>
            <label class="studio-field is-wide">
              <span class="studio-label">风味笔记</span>
              <textarea name="tastingNotes" id="sf-notes" class="studio-textarea" rows="2" placeholder="描述开袋干香、入口酸甜层次与尾韵…"></textarea>
            </label>
          </div>
          <div class="studio-radar-grid" id="studio-radar-grid">
            ${RADAR_AXES.map(
              (axis) => `
                <label class="studio-slider-row" for="sf-radar-${axis.key}">
                  <div class="param-head">
                    <span class="param-label">${axis.label}</span>
                    <span class="param-value" id="sf-radar-val-${axis.key}">4.0</span>
                  </div>
                  <input
                    type="range"
                    id="sf-radar-${axis.key}"
                    name="radar_${axis.key}"
                    class="atelier-range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value="4.0"
                  />
                </label>
              `,
            ).join('')}
          </div>
        </fieldset>

        <!-- 3. 故事与手冲参考 -->
        <fieldset class="studio-fieldset">
          <legend class="studio-legend">产地故事与手冲参数</legend>
          <div class="studio-grid-2">
            <label class="studio-field is-wide">
              <span class="studio-label">产地故事</span>
              <textarea name="originStory" id="sf-story" class="studio-textarea" rows="2" placeholder="庄园风土、批次由来或购豆小记…"></textarea>
            </label>
            <label class="studio-field is-wide">
              <span class="studio-label">处理法详解</span>
              <textarea name="processDetail" id="sf-proc-detail" class="studio-textarea" rows="2" placeholder="发酵时间、干燥床或工艺亮点…"></textarea>
            </label>
            <label class="studio-field is-wide">
              <span class="studio-label">推荐饮用场景</span>
              <input type="text" name="recommendedScenarios" id="sf-scenarios" class="studio-input" placeholder="例如：午后手冲热饮或冰手冲，搭配轻盈甜点" />
            </label>
            <label class="studio-field">
              <span class="studio-label">水温 (℃)</span>
              <input type="number" name="waterTempC" id="sf-temp" class="studio-input is-mono" min="82" max="98" value="92" />
            </label>
            <label class="studio-field">
              <span class="studio-label">粉水比</span>
              <input type="text" name="ratio" id="sf-ratio" class="studio-input is-mono" value="1:15" placeholder="1:15" />
            </label>
            <label class="studio-field">
              <span class="studio-label">研磨度</span>
              <input type="text" name="grindSize" id="sf-grind" class="studio-input" value="中细研磨" placeholder="中细研磨" />
            </label>
            <label class="studio-field">
              <span class="studio-label">参考总时长</span>
              <input type="text" name="totalTime" id="sf-time" class="studio-input is-mono" value="约 2:00" placeholder="约 2:00" />
            </label>
          </div>
        </fieldset>

        <!-- 4. 卡面全息质感与自定义图片 -->
        <fieldset class="studio-fieldset">
          <legend class="studio-legend">3D 卡面质感与插画（可选传图）</legend>
          <div class="studio-visual-row">
            <div class="studio-finish-picker" role="radiogroup" aria-label="默认全息质感">
              ${FINISH_OPTIONS.map(
                (f, idx) => `
                  <label class="studio-finish-opt">
                    <input type="radio" name="defaultFinish" value="${f.id}" ${idx === 0 ? 'checked' : ''} />
                    <span class="finish-swatch" data-finish="${f.id}" aria-hidden="true"></span>
                    <span>${f.label}</span>
                  </label>
                `,
              ).join('')}
            </div>

            <div class="studio-upload-block">
              <div class="studio-upload-controls">
                <label class="studio-upload-btn" for="sf-photo-input">
                  <span>上传豆袋 / 手冲照片</span>
                  <input type="file" id="sf-photo-input" accept="image/*" hidden />
                </label>
                <button type="button" class="studio-clear-img-btn" id="sf-photo-clear" hidden>清除图片</button>
                <span class="studio-upload-meta" id="sf-photo-meta">未上传将自动启用程序化植物志 5 层引擎</span>
              </div>
              <div class="studio-photo-preview" id="sf-photo-preview" hidden>
                <img id="sf-photo-img" alt="已上传豆卡封面预览" />
              </div>
            </div>
          </div>
        </fieldset>
      </form>

      <footer class="studio-foot">
        <div class="studio-foot-left">
          <button type="button" class="studio-btn-ghost" id="studio-export-json">导出 JSON</button>
          <label class="studio-btn-ghost studio-import-label" for="studio-import-input">
            <span>导入 JSON</span>
            <input type="file" id="studio-import-input" accept=".json,application/json" hidden />
          </label>
        </div>
        <div class="studio-foot-right">
          <button type="button" class="studio-btn-ghost" id="studio-cancel-btn">取消</button>
          <button type="submit" form="studio-form" class="studio-btn-primary" id="studio-save-btn">保存并生成 3D 闪卡</button>
        </div>
      </footer>
    </div>
  `;

  document.body.appendChild(modalEl);

  const elBackdrop = modalEl.querySelector('#studio-backdrop');
  const elCloseBtn = modalEl.querySelector('#studio-close-btn');
  const elCancelBtn = modalEl.querySelector('#studio-cancel-btn');
  const elTitleHeading = modalEl.querySelector('#studio-modal-title');
  const elSubHeading = modalEl.querySelector('#studio-modal-sub');
  const elSaveBtn = modalEl.querySelector('#studio-save-btn');
  const elForm = modalEl.querySelector('#studio-form');

  const elPasteBox = modalEl.querySelector('#studio-paste-box');
  const elPasteInput = modalEl.querySelector('#studio-paste-input');
  const elPasteStatus = modalEl.querySelector('#studio-paste-status');
  const elParseBtn = modalEl.querySelector('#studio-parse-btn');

  const elPhotoInput = modalEl.querySelector('#sf-photo-input');
  const elPhotoClear = modalEl.querySelector('#sf-photo-clear');
  const elPhotoMeta = modalEl.querySelector('#sf-photo-meta');
  const elPhotoPreview = modalEl.querySelector('#sf-photo-preview');
  const elPhotoImg = modalEl.querySelector('#sf-photo-img');

  const elExportJson = modalEl.querySelector('#studio-export-json');
  const elImportInput = modalEl.querySelector('#studio-import-input');

  function updateRangeFill(inputEl) {
    const min = Number(inputEl.min);
    const max = Number(inputEl.max);
    const val = Number(inputEl.value);
    const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
    inputEl.style.setProperty('--pct', `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`);
  }

  function syncPhotoPreview(dataUrl, metaLabel) {
    currentImageDataUrl = dataUrl || '';
    if (currentImageDataUrl) {
      elPhotoImg.src = currentImageDataUrl;
      elPhotoPreview.hidden = false;
      elPhotoClear.hidden = false;
      const kb = (estimateDataUrlBytes(currentImageDataUrl) / 1024).toFixed(1);
      elPhotoMeta.textContent = metaLabel || `已就绪（约 ${kb} KB，已自动压缩）`;
    } else {
      elPhotoImg.removeAttribute('src');
      elPhotoPreview.hidden = true;
      elPhotoClear.hidden = true;
      elPhotoMeta.textContent = '未上传将自动启用程序化植物志 5 层引擎';
    }
  }

  function setRadarValues(radar6D = {}) {
    RADAR_AXES.forEach((axis) => {
      const input = modalEl.querySelector(`#sf-radar-${axis.key}`);
      const readout = modalEl.querySelector(`#sf-radar-val-${axis.key}`);
      const val = typeof radar6D[axis.key] === 'number' ? radar6D[axis.key] : 4.1;
      if (input) {
        input.value = String(val.toFixed(1));
        updateRangeFill(input);
      }
      if (readout) readout.textContent = val.toFixed(1);
    });
  }

  RADAR_AXES.forEach((axis) => {
    const input = modalEl.querySelector(`#sf-radar-${axis.key}`);
    const readout = modalEl.querySelector(`#sf-radar-val-${axis.key}`);
    input?.addEventListener('input', () => {
      if (readout) readout.textContent = Number(input.value).toFixed(1);
      updateRangeFill(input);
    });
  });

  function populateForm(card) {
    elForm.reset();
    elPasteInput.value = '';
    elPasteStatus.textContent = '';

    if (!card) {
      elTitleHeading.textContent = '我的豆单工坊 · 录入新豆';
      elSubHeading.textContent = '支持一键粘贴豆卡文案或手动填表，立即生成 3D 全息闪卡';
      elSaveBtn.textContent = '保存并生成 3D 闪卡';
      elPasteBox.open = true;
      modalEl.querySelector('#sf-continent').value = '拉丁美洲';
      modalEl.querySelector('#sf-process-cat').value = 'washed';
      modalEl.querySelector('#sf-roast').value = '浅中度';
      modalEl.querySelector('#sf-temp').value = '92';
      modalEl.querySelector('#sf-ratio').value = '1:15';
      modalEl.querySelector('#sf-grind').value = '中细研磨';
      modalEl.querySelector('#sf-time').value = '约 2:00';
      setRadarValues({
        floralFruity: 4.3,
        acidity: 4.1,
        sweetness: 4.3,
        body: 3.6,
        cleanliness: 4.4,
        aftertaste: 4.2,
      });
      syncPhotoPreview('');
      return;
    }

    elTitleHeading.textContent = `编辑我的豆卡 · ${card.code}`;
    elSubHeading.textContent = '修改保存后自动刷新 3D 全息正面、棉纸卡背与画廊缩略图';
    elSaveBtn.textContent = '保存修改并预览 3D 闪卡';
    elPasteBox.open = false;

    modalEl.querySelector('#sf-title').value = card.title || '';
    modalEl.querySelector('#sf-subtitle').value = card.subtitle || '';
    modalEl.querySelector('#sf-continent').value = card.origin?.continent || '拉丁美洲';
    modalEl.querySelector('#sf-region').value =
      card.origin?.country && card.origin?.region && card.origin.region !== card.origin.country
        ? `${card.origin.country} ${card.origin.region}`
        : card.origin?.region || card.origin?.country || '';
    modalEl.querySelector('#sf-estate').value = card.origin?.estate || '';
    modalEl.querySelector('#sf-altitude').value = card.origin?.altitude || '';
    modalEl.querySelector('#sf-grade-season').value = [card.origin?.grade, card.origin?.harvestSeason]
      .filter(Boolean)
      .join(' / ');
    modalEl.querySelector('#sf-variety').value = card.botany?.variety || '';
    modalEl.querySelector('#sf-process-cat').value = card.processing?.category || 'washed';
    modalEl.querySelector('#sf-process-name').value = card.processing?.name || '';
    modalEl.querySelector('#sf-roast').value = ROAST_PRESETS[card.roast?.label]
      ? card.roast.label
      : '浅中度';
    modalEl.querySelector('#sf-flavors').value = (card.sensory?.flavors || []).join('、');
    modalEl.querySelector('#sf-notes').value = card.sensory?.tastingNotes || '';
    modalEl.querySelector('#sf-story').value = card.narrative?.originStory || '';
    modalEl.querySelector('#sf-proc-detail').value = card.processing?.detail || '';
    modalEl.querySelector('#sf-scenarios').value = card.narrative?.recommendedScenarios || '';
    modalEl.querySelector('#sf-temp').value = String(card.brewing?.waterTempC || 92);
    modalEl.querySelector('#sf-ratio').value = card.brewing?.ratio || '1:15';
    modalEl.querySelector('#sf-grind').value = card.brewing?.grindSize || '中细研磨';
    modalEl.querySelector('#sf-time').value = card.brewing?.totalTime || '约 2:00';

    const finishVal = card.visual?.defaultFinish || 'gold';
    const radio = modalEl.querySelector(`input[name="defaultFinish"][value="${finishVal}"]`);
    if (radio) radio.checked = true;

    setRadarValues(card.sensory?.radar6D);
    syncPhotoPreview(card.visual?.layers?.customImageDataUrl || '');
  }

  let parsedPhysicsTemp = null;

  elParseBtn.addEventListener('click', () => {
    const { fields, matchedCount } = parseBeanText(elPasteInput.value);
    if (matchedCount === 0) {
      elPasteStatus.textContent = '未识别到标准豆卡字段，请检查是否包含「产区：」「风味：」等格式';
      return;
    }

    if (fields.title) modalEl.querySelector('#sf-title').value = fields.title;
    if (fields.continent) modalEl.querySelector('#sf-continent').value = fields.continent;
    if (fields.country || fields.region) {
      modalEl.querySelector('#sf-region').value =
        fields.region && fields.region !== fields.country
          ? `${fields.country} ${fields.region}`
          : fields.country || fields.region;
    }
    if (fields.estate) modalEl.querySelector('#sf-estate').value = fields.estate;
    if (fields.altitude) modalEl.querySelector('#sf-altitude').value = fields.altitude;
    if (fields.grade || fields.harvestSeason) {
      modalEl.querySelector('#sf-grade-season').value = [fields.grade, fields.harvestSeason]
        .filter(Boolean)
        .join(' / ');
    }
    if (fields.variety) modalEl.querySelector('#sf-variety').value = fields.variety;
    if (fields.processCategory) modalEl.querySelector('#sf-process-cat').value = fields.processCategory;
    if (fields.processName) modalEl.querySelector('#sf-process-name').value = fields.processName;
    if (fields.processDetail) modalEl.querySelector('#sf-proc-detail').value = fields.processDetail;
    if (fields.roastLabel) modalEl.querySelector('#sf-roast').value = fields.roastLabel;
    if (fields.flavors) modalEl.querySelector('#sf-flavors').value = fields.flavors;
    if (fields.tastingNotes) modalEl.querySelector('#sf-notes').value = fields.tastingNotes;
    if (fields.originStory) modalEl.querySelector('#sf-story').value = fields.originStory;
    if (fields.recommendedScenarios) modalEl.querySelector('#sf-scenarios').value = fields.recommendedScenarios;
    if (fields.waterTempC) modalEl.querySelector('#sf-temp').value = String(fields.waterTempC);
    if (fields.ratio) modalEl.querySelector('#sf-ratio').value = fields.ratio;
    if (fields.grindSize) modalEl.querySelector('#sf-grind').value = fields.grindSize;
    if (fields.totalTime) modalEl.querySelector('#sf-time').value = fields.totalTime;

    if (fields.moisturePct != null || fields.densityGl != null) {
      parsedPhysicsTemp = {
        moisturePct: fields.moisturePct,
        densityGl: fields.densityGl,
      };
    }

    elPasteStatus.textContent = `已智能识别并填入 ${matchedCount} 项字段，可继续微调后保存`;
  });

  elPhotoInput.addEventListener('change', async () => {
    const file = elPhotoInput.files?.[0];
    if (!file) return;
    elPhotoMeta.textContent = '正在压缩优化图片…';
    try {
      const { dataUrl, bytes, mime } = await compressImageFile(file);
      const extLabel = mime === 'image/webp' ? 'WebP' : 'JPEG';
      syncPhotoPreview(dataUrl, `已压缩为 ${(bytes / 1024).toFixed(1)} KB ${extLabel}`);
    } catch (err) {
      console.error('[bean-studio] Image compress failed:', err);
      onNotice?.('图片读取或压缩失败，请更换 JPG / PNG / WebP 图片');
      syncPhotoPreview(currentImageDataUrl);
    } finally {
      elPhotoInput.value = '';
    }
  });

  elPhotoClear.addEventListener('click', () => {
    syncPhotoPreview('');
  });

  elForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const titleVal = modalEl.querySelector('#sf-title').value.trim();
    if (!titleVal) {
      modalEl.querySelector('#sf-title').focus();
      onNotice?.('请填写咖啡豆名称后再保存');
      return;
    }

    const regionRaw = modalEl.querySelector('#sf-region').value.trim();
    const regionTokens = regionRaw.split(/[\s·,，]+/).filter(Boolean);
    const country = regionTokens[0] || modalEl.querySelector('#sf-continent').value;
    const region = regionTokens.slice(1).join(' ') || country;

    const gradeSeasonRaw = modalEl.querySelector('#sf-grade-season').value.trim();
    const gsParts = gradeSeasonRaw.split(/[\/｜|,，]+/).map((s) => s.trim()).filter(Boolean);
    let grade = gsParts[0] || '';
    let harvestSeason = gsParts[1] || '';
    if (!harvestSeason && /^\d{4}/.test(grade)) {
      harvestSeason = grade;
      grade = '';
    }

    const radar6D = {};
    RADAR_AXES.forEach((axis) => {
      const inp = modalEl.querySelector(`#sf-radar-${axis.key}`);
      radar6D[axis.key] = Number(inp?.value || 4.0);
    });

    const finishChecked =
      modalEl.querySelector('input[name="defaultFinish"]:checked')?.value || 'gold';

    const existingList = getCustomBeans?.() || [];
    const candidate = normalizeCustomBean(
      {
        id: editingBean?.id,
        code: editingBean?.code,
        title: titleVal,
        subtitle: modalEl.querySelector('#sf-subtitle').value.trim(),
        origin: {
          continent: modalEl.querySelector('#sf-continent').value,
          country,
          region,
          estate: modalEl.querySelector('#sf-estate').value.trim(),
          altitude: modalEl.querySelector('#sf-altitude').value.trim(),
          grade,
          harvestSeason,
        },
        botany: {
          species: 'Arabica 阿拉比卡',
          variety: modalEl.querySelector('#sf-variety').value.trim() || 'Arabica',
        },
        processing: {
          category: modalEl.querySelector('#sf-process-cat').value,
          name: modalEl.querySelector('#sf-process-name').value.trim(),
          detail: modalEl.querySelector('#sf-proc-detail').value.trim(),
        },
        roast: {
          label: modalEl.querySelector('#sf-roast').value,
        },
        physics: parsedPhysicsTemp || editingBean?.physics || null,
        sensory: {
          flavors: modalEl.querySelector('#sf-flavors').value.trim(),
          tastingNotes: modalEl.querySelector('#sf-notes').value.trim(),
          radar6D,
        },
        narrative: {
          originStory: modalEl.querySelector('#sf-story').value.trim(),
          cultivationHarvest: editingBean?.narrative?.cultivationHarvest || '',
          recommendedScenarios: modalEl.querySelector('#sf-scenarios').value.trim(),
        },
        brewing: {
          waterTempC: Number(modalEl.querySelector('#sf-temp').value) || 92,
          ratio: modalEl.querySelector('#sf-ratio').value.trim() || '1:15',
          grindSize: modalEl.querySelector('#sf-grind').value.trim() || '中细研磨',
          totalTime: modalEl.querySelector('#sf-time').value.trim() || '约 2:00',
        },
        visual: {
          defaultFinish: finishChecked,
          layers: {
            customImageDataUrl: currentImageDataUrl || undefined,
          },
        },
      },
      existingList,
    );

    const wasEditing = Boolean(editingBean);
    close();
    onSaveBean?.(candidate, { isEdit: wasEditing });
  });

  elExportJson.addEventListener('click', () => {
    const list = getCustomBeans?.() || [];
    if (list.length === 0) {
      onNotice?.('当前还没有自定义豆卡，请先录入至少一款咖啡豆');
      return;
    }
    const payload = {
      schema: 'coffee-atlas-custom-beans-v1',
      exportedAt: new Date().toISOString(),
      count: list.length,
      beans: list,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'coffee-atlas-my-beans.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onNotice?.(`已导出 ${list.length} 款自定义豆单 JSON`);
  });

  elImportInput.addEventListener('change', async () => {
    const file = elImportInput.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const rawBeans = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.beans)
          ? parsed.beans
          : null;
      if (!rawBeans || rawBeans.length === 0) {
        onNotice?.('JSON 文件中未发现有效豆单数组');
        return;
      }

      const existing = [...(getCustomBeans?.() || [])];
      const byId = new Map(existing.map((b) => [b.id, b]));
      let addedCount = 0;
      let updatedCount = 0;

      for (const item of rawBeans) {
        if (!item || typeof item !== 'object') continue;
        const currentList = Array.from(byId.values());
        const normalized = normalizeCustomBean(item, currentList);
        if (byId.has(normalized.id)) {
          updatedCount++;
        } else {
          addedCount++;
        }
        byId.set(normalized.id, normalized);
      }

      const merged = Array.from(byId.values());
      onImportBeans?.(merged, { addedCount, updatedCount });
      close();
    } catch (err) {
      console.error('[bean-studio] Import JSON failed:', err);
      onNotice?.('JSON 解析失败，请检查文件格式是否正确');
    } finally {
      elImportInput.value = '';
    }
  });

  function open(cardToEdit = null) {
    editingBean = cardToEdit && cardToEdit.isCustomBean ? cardToEdit : null;
    parsedPhysicsTemp = null;
    populateForm(editingBean);
    isOpen = true;
    modalEl.hidden = false;
    elForm.scrollTop = 0;
    requestAnimationFrame(() => {
      modalEl.querySelector('#sf-title')?.focus();
    });
  }

  function close() {
    isOpen = false;
    editingBean = null;
    parsedPhysicsTemp = null;
    modalEl.hidden = true;
  }

  elBackdrop.addEventListener('click', close);
  elCloseBtn.addEventListener('click', close);
  elCancelBtn.addEventListener('click', close);

  return {
    open,
    close,
    isOpen: () => isOpen,
    destroy() {
      modalEl.remove();
    },
  };
}
