/**
 * 世界咖啡豆图鉴 · 36 张典藏全息闪卡总索引与筛选维度聚合
 */

import { BEAN_CARDS } from './beans-catalog.js';
import { KNOWLEDGE_CARDS } from './knowledge-deck.js';

export { BEAN_CARDS, KNOWLEDGE_CARDS };

export const ALL_CARDS = [...BEAN_CARDS, ...KNOWLEDGE_CARDS];

export const CARD_MAP = Object.freeze(
  ALL_CARDS.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {})
);

function countByGroup(groupId) {
  return ALL_CARDS.filter((card) => card.group === groupId).length;
}

export const DECK_GROUPS = [
  { id: 'all', label: '全部', en: 'All', count: ALL_CARDS.length },
  { id: 'bean_card', label: '珍藏单品豆', en: 'Single Origins', count: countByGroup('bean_card') },
  { id: 'species', label: '核心豆种', en: 'Species', count: countByGroup('species') },
  { id: 'variety', label: '细分品种', en: 'Varieties', count: countByGroup('variety') },
  { id: 'origin', label: '世界产区', en: 'Origins', count: countByGroup('origin') },
  { id: 'craft_tasting', label: '工艺与品鉴', en: 'Craft & Tasting', count: countByGroup('craft_tasting') },
];

const CONTINENT_ORDER = [
  { value: '非洲', label: '非洲' },
  { value: '拉丁美洲', label: '拉丁美洲' },
  { value: '亚太', label: '亚太' },
  { value: '中国云南', label: '中国云南' },
];

const PROCESS_ORDER = [
  { value: 'washed', label: '水洗' },
  { value: 'natural', label: '日晒' },
  { value: 'honey', label: '蜜处理' },
  { value: 'wet_hulled', label: '湿刨' },
  { value: 'barrel_aged', label: '朗姆酒桶' },
  { value: 'co_fermented', label: '共发酵' },
  { value: 'nitrogen_cold', label: '氮气冷洗' },
  { value: 'anaerobic', label: '厌氧' },
];

const ROAST_ORDER = [
  { value: '浅度', label: '浅度' },
  { value: '中浅度', label: '中浅度' },
  { value: '浅中度', label: '浅中度' },
  { value: 'High', label: 'High' },
  { value: 'City', label: 'City' },
  { value: 'Full City', label: 'Full City' },
  { value: '深度', label: '深度' },
];

function buildOrderedFacet(items, orderList, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const ordered = [];
  const seen = new Set();
  for (const entry of orderList) {
    const count = counts.get(entry.value) || 0;
    if (count > 0) {
      ordered.push({ value: entry.value, label: entry.label, count });
      seen.add(entry.value);
    }
  }

  for (const [value, count] of counts.entries()) {
    if (!seen.has(value)) {
      ordered.push({ value, label: value, count });
    }
  }

  return ordered;
}

function buildDynamicFacet(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'));
}

export const FILTER_FACETS = {
  continents: buildOrderedFacet(BEAN_CARDS, CONTINENT_ORDER, (c) => c.origin?.continent),
  processes: buildOrderedFacet(BEAN_CARDS, PROCESS_ORDER, (c) => c.processing?.category),
  roasts: buildOrderedFacet(BEAN_CARDS, ROAST_ORDER, (c) => c.roast?.label),
  varieties: buildDynamicFacet(BEAN_CARDS, (c) => c.botany?.variety),
};
