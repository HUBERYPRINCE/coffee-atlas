/**
 * SCA / WCR 风味轮数字色板与 6 维感官雷达轴定义
 * 依据 2016 版 SCA / WCR Coffee Taster's Flavor Wheel 色谱分区构建
 */

export const FLAVOR_FAMILIES = {
  floral: {
    label: '花香',
    primary: '#E06C9F',
    tint: '#FCE8F1',
    deep: '#8F2D59',
  },
  citrus: {
    label: '柑橘',
    primary: '#F2B705',
    tint: '#FEF6D8',
    deep: '#8C6400',
  },
  berry: {
    label: '莓果',
    primary: '#C83E6B',
    tint: '#FBE4EC',
    deep: '#7A193B',
  },
  stoneFruit: {
    label: '核果',
    primary: '#EE7B4D',
    tint: '#FDECE4',
    deep: '#913A17',
  },
  tropical: {
    label: '热带与果干',
    primary: '#E59F24',
    tint: '#FCF1DB',
    deep: '#7F5206',
  },
  sweet: {
    label: '甜感与奶甜',
    primary: '#D99152',
    tint: '#FAF0E6',
    deep: '#7A461B',
  },
  nuttyCocoa: {
    label: '坚果与可可',
    primary: '#8B5A3C',
    tint: '#F2EAE4',
    deep: '#4D2E1B',
  },
  spices: {
    label: '香料',
    primary: '#B84A39',
    tint: '#F8E6E3',
    deep: '#692116',
  },
  roastedWoody: {
    label: '烘烤与木质',
    primary: '#5E4335',
    tint: '#ECE6E3',
    deep: '#2F1F17',
  },
  herbalTea: {
    label: '草本与茶感',
    primary: '#4E9A6F',
    tint: '#E4F4EB',
    deep: '#23593B',
  },
  wineyBoozy: {
    label: '酒香与发酵',
    primary: '#7A2E4D',
    tint: '#F3E4EA',
    deep: '#421226',
  },
};

export const FLAVOR_COLOR_MAP = {
  // 花香 Floral
  '花香': '#E06C9F',
  '玫瑰花香': '#D94F88',
  '玫瑰': '#D94F88',
  '茉莉': '#E89AB8',
  '茉莉花': '#E89AB8',
  '白花': '#E4A8C7',
  '洋甘菊': '#F0C95C',
  '黄色花香': '#F2C94C',
  '橙花': '#EEA2B8',
  '洛神花': '#C9426A',
  '接骨木花': '#E7B6C8',
  '花蜜': '#E5A866',

  // 柑橘 Citrus
  '柑橘': '#F2994A',
  '柠檬': '#F2C94C',
  '青柠': '#9BC53D',
  '佛手柑': '#A4C639',
  '血橙': '#E35D3B',
  '甜橙': '#F28F3B',
  '西柚': '#EC7263',
  '粉红西柚': '#EB6F7D',
  '蜜橘': '#F29F3D',
  '金橘': '#F0AA36',
  '柠檬草': '#8FBD54',

  // 莓果 Berry
  '莓果': '#C83E6B',
  '蓝莓': '#5B4B9E',
  '黑莓': '#4E2A5E',
  '红樱桃': '#C0394D',
  '黑加仑': '#5C2C6D',
  '乌梅': '#6E324C',
  '草莓': '#E2506A',
  '草莓酱': '#D13F5C',
  '覆盆子': '#CC3562',
  '红莓': '#C83E6B',
  '桑葚': '#622D5C',
  '蔓越莓': '#B83350',
  '梅子': '#8D4365',
  '红糖梅子': '#9A4858',
  '圣女果': '#D95140',
  '红苹果': '#CC4B4B',
  '青苹果': '#88B94E',

  // 核果 Stone Fruit
  '杏桃': '#F28D52',
  '杏子': '#F2965A',
  '李子': '#8E446E',
  '水蜜桃': '#F09A84',
  '白桃': '#F2AEA0',
  '黄桃': '#F0A44B',
  '核果': '#EE7B4D',
  '熟果': '#DF724A',

  // 热带与果干 Tropical & Dried Fruit
  '凤梨': '#E8B923',
  '菠萝': '#E8B923',
  '菠萝蜜': '#DFAC2B',
  '无花果': '#91536F',
  '无花果干': '#7E455F',
  '青提': '#8CC63F',
  '百香果': '#E29E26',
  '芒果': '#F2A922',
  '木瓜': '#EB8844',
  '荔枝': '#EFA4AA',
  '热带水果': '#E59F24',
  '热带干果': '#C97F34',
  '葡萄': '#7A4684',

  // 甜感与奶甜 Sweet & Creamy
  '草莓奶糖': '#F27999',
  '香草泡芙': '#EBC88B',
  '酸奶冰淇淋': '#F0C7B2',
  '焦糖': '#C97A3D',
  '蜂蜜': '#DDA144',
  '蔗糖': '#D89B54',
  '红糖': '#A96132',
  '黑糖': '#7E4424',
  '太妃糖': '#C47B3E',
  '棉花糖': '#F2C6D0',
  '冰糖': '#E3C291',
  '香草': '#E3BE7E',
  '奶油': '#E5C392',
  '酸奶': '#E9C5B4',
  '甘蔗汁': '#B8B86A',
  '花生糖': '#C58C4E',
  '甜麦片': '#D4A56A',

  // 坚果与可可 Nutty & Cocoa
  '坚果': '#9E6B47',
  '烤坚果': '#915F3D',
  '榛子': '#A8744B',
  '烤榛果': '#9D683F',
  '杏仁': '#B68559',
  '烤杏仁': '#A87549',
  '夏威夷果': '#C49A6C',
  '烤花生': '#A87646',
  '可可碎': '#5E3A29',
  '可可': '#6E4431',
  '黑巧克力': '#4E2F23',
  '牛奶巧克力': '#87573E',
  '苦巧克力': '#44281D',

  // 香料 Spices
  '甘草': '#6E4B3A',
  '肉桂': '#B45238',
  '丁香': '#8C3B2B',
  '肉豆蔻': '#A55B41',
  '胡椒': '#7E483C',
  '八角': '#8F4635',
  '香料': '#B84A39',
  '草本香料': '#637A4B',
  '甜香料': '#BC5C3F',

  // 烘烤与木质 Roasted & Woody
  '橡木': '#7D5236',
  '雪松': '#54684B',
  '松木': '#5C6E4D',
  '烘烤': '#6A4937',
  '烟熏': '#594740',
  '木质': '#6E4F3A',
  '谷物': '#B89660',
  '麦芽': '#9E7442',
  '烤面包': '#9A6D43',
  '炭焙': '#3E2B23',
  '泥土': '#68503E',

  // 草本与茶感 Herbal & Tea
  '绿茶': '#59A172',
  '红茶': '#A8523A',
  '白茶': '#A5B89E',
  '乌龙茶': '#769868',
  '伯爵茶': '#729A6D',
  '普洱茶韵': '#7A4F38',
  '茶感': '#5D9B70',
  '草本': '#4E9A6F',
  '药草': '#46825F',
  '罗勒': '#4D945C',
  '迷迭香': '#5A8F6B',
  '高山清泉': '#6EB2C6',

  // 酒香与发酵 Winey & Boozy
  '朗姆酒': '#8C3346',
  '金朗姆酒': '#B86E2E',
  '红酒': '#7A2E4D',
  '白兰地': '#9A4834',
  '威士忌': '#9E5B2D',
  '酒香': '#7E304F',
  '微醺果酒': '#963A5C',
  '发酵感': '#843854',
};

export const RADAR_AXES = [
  { key: 'floralFruity', label: '花果香气', en: 'Floral & Fruity', color: '#E06C9F' },
  { key: 'acidity', label: '酸质明亮', en: 'Acidity', color: '#F2B705' },
  { key: 'sweetness', label: '甜感表现', en: 'Sweetness', color: '#D99152' },
  { key: 'body', label: '醇厚度', en: 'Body', color: '#8B5A3C' },
  { key: 'cleanliness', label: '干净度', en: 'Cleanliness', color: '#4E9A6F' },
  { key: 'aftertaste', label: '余韵复杂性', en: 'Aftertaste', color: '#9E4B6E' },
];

const KEYWORD_FALLBACKS = [
  { keywords: ['花', '玫瑰', '茉莉', '洋甘菊', '洛神', '橙花'], family: 'floral' },
  { keywords: ['柑', '橘', '柠', '柚', '佛手', '橙'], family: 'citrus' },
  { keywords: ['莓', '樱桃', '加仑', '梅', '桑葚', '苹果', '番茄', '圣女果'], family: 'berry' },
  { keywords: ['桃', '杏', '李', '核果'], family: 'stoneFruit' },
  { keywords: ['凤梨', '菠萝', '芒果', '百香', '荔枝', '木瓜', '无花果', '提', '葡萄', '热带', '果干'], family: 'tropical' },
  { keywords: ['糖', '蜜', '奶油', '香草', '酸奶', '冰淇淋', '泡芙', '焦糖', '甜', '太妃', '甘蔗'], family: 'sweet' },
  { keywords: ['坚果', '榛', '杏仁', '花生', '可可', '巧克', '夏威夷果'], family: 'nuttyCocoa' },
  { keywords: ['甘草', '肉桂', '丁香', '豆蔻', '胡椒', '八角', '香料', '辛'], family: 'spices' },
  { keywords: ['橡木', '雪松', '木', '烟熏', '烘烤', '炭', '谷物', '麦', '泥土'], family: 'roastedWoody' },
  { keywords: ['茶', '草本', '药草', '罗勒', '迷迭香', '清泉'], family: 'herbalTea' },
  { keywords: ['酒', '朗姆', '威士忌', '白兰地', '发酵', '微醺'], family: 'wineyBoozy' },
];

/**
 * 根据中文风味词精准返回对应 Hex 色值；
 * 未直接命中时按关键词回退至 SCA 风味大类主色，最终兜底暖铜金 #D6A25E。
 */
export function getFlavorColor(name) {
  const key = typeof name === 'string' ? name.trim() : (name?.name ? String(name.name).trim() : '');
  if (!key) return '#D6A25E';

  if (FLAVOR_COLOR_MAP[key]) {
    return FLAVOR_COLOR_MAP[key];
  }

  for (const rule of KEYWORD_FALLBACKS) {
    if (rule.keywords.some((kw) => key.includes(kw))) {
      return FLAVOR_FAMILIES[rule.family].primary;
    }
  }

  return '#D6A25E';
}

export const ROAST_SCALE_GUIDE = [
  { tier: 'L1', label: '极浅度', scale: 'Cinnamon', agtron: '75-85', colorHex: '#C6925B', position01: 0.08 },
  { tier: 'L2', label: '浅度', scale: 'Light', agtron: '68-75', colorHex: '#A87342', position01: 0.20 },
  { tier: 'L3', label: '浅中度', scale: 'Moderately Light', agtron: '60-68', colorHex: '#8C582F', position01: 0.34 },
  { tier: 'L4', label: 'High', scale: 'High Roast', agtron: '54-62', colorHex: '#734422', position01: 0.48 },
  { tier: 'L5', label: 'City', scale: 'City Roast', agtron: '48-55', colorHex: '#5C3419', position01: 0.62 },
  { tier: 'L6', label: 'Full City', scale: 'Full City', agtron: '40-48', colorHex: '#452512', position01: 0.76 },
  { tier: 'L7', label: '深度', scale: 'French', agtron: '30-38', colorHex: '#2E180B', position01: 0.88 },
  { tier: 'L8', label: '极深度', scale: 'Italian', agtron: '20-28', colorHex: '#1C0F08', position01: 0.96 },
];
