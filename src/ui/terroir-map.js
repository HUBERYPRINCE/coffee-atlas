/**
 * 世界咖啡带交互式风土微图 (Coffee Belt Terroir Map)
 * 暗房手冲吧台古铜版画博物风纯内联 SVG（viewBox="0 0 1000 400"，零外部地图依赖，离线单文件 100% 可用）
 */

const LON_MIN = -130;
const LON_MAX = 160;
const LAT_MAX = 45;
const LAT_MIN = -35;
const PAD_X = 46;
const PAD_Y = 22;
const INNER_W = 1000 - PAD_X * 2;
const INNER_H = 400 - PAD_Y * 2;

export function lonLatToXY(lon, lat) {
  const x = PAD_X + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * INNER_W;
  const y = PAD_Y + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * INNER_H;
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

function ringToPath(coords) {
  return (
    coords
      .map(([lon, lat], idx) => {
        const [x, y] = lonLatToXY(lon, lat);
        return `${idx === 0 ? 'M' : 'L'}${x} ${y}`;
      })
      .join(' ') + ' Z'
  );
}

// Accurate stylized copperplate continent outlines in real (lon, lat) degrees within [130°W..160°E, 45°N..35°S]
const LANDMASS_RINGS = [
  // North America southern rim & Central America isthmus
  [
    [-124, 45], [-70, 45], [-75, 36], [-81, 31], [-80, 25], [-82, 26],
    [-83, 29], [-89, 30], [-97, 26], [-96, 19], [-90, 21], [-87, 21],
    [-88, 16], [-83, 15], [-83, 10], [-78, 8.5], [-77.5, 7.6], [-80.5, 7.4],
    [-83, 8.6], [-86, 10.6], [-88, 13.2], [-92, 14.5], [-98, 16], [-105, 20],
    [-109, 25], [-114, 31], [-111, 24], [-112, 24], [-117, 32], [-122, 37], [-124, 42],
  ],
  // Cuba & Hispaniola / Jamaica accents
  [[-84.8, 22.0], [-79.5, 22.8], [-74.3, 20.2], [-77.2, 19.8], [-82.0, 21.6]],
  [[-74.3, 18.4], [-68.4, 18.5], [-69.6, 19.8], [-73.2, 19.7]],
  // South America (cropped cleanly at 35°S)
  [
    [-77.5, 7.6], [-75.5, 10.8], [-71.5, 11.8], [-62.0, 10.5], [-52.0, 4.5],
    [-49.0, 0.0], [-41.0, -2.8], [-35.0, -5.8], [-34.8, -8.5], [-38.8, -13.5],
    [-40.5, -21.5], [-48.5, -26.5], [-53.8, -34.0], [-56.0, -35.0], [-72.5, -35.0],
    [-71.5, -30.0], [-70.5, -18.5], [-76.5, -14.0], [-81.2, -5.0], [-79.8, 1.5], [-77.8, 5.5],
  ],
  // Southern Europe & Mediterranean northern rim
  [
    [-9.5, 43.0], [-9.0, 37.0], [-5.5, 36.0], [3.2, 42.5], [9.5, 44.3],
    [15.5, 38.0], [18.5, 40.5], [13.5, 45.0], [23.5, 37.5], [27.0, 41.5],
    [36.0, 36.8], [36.0, 41.5], [42.0, 45.0], [-9.5, 45.0],
  ],
  // Africa
  [
    [-17.2, 14.7], [-15.8, 21.0], [-9.8, 31.5], [-5.8, 35.8], [10.5, 37.0],
    [11.5, 33.0], [25.0, 31.5], [32.6, 31.2], [35.5, 24.5], [43.2, 12.2],
    [51.2, 11.8], [48.5, 5.0], [41.0, -2.0], [39.6, -10.5], [40.5, -15.5],
    [35.0, -20.5], [32.8, -26.0], [28.0, -33.0], [18.4, -34.4], [15.0, -26.0],
    [12.0, -16.5], [12.5, -6.0], [9.2, 3.8], [4.5, 4.3], [-4.0, 5.2],
    [-8.0, 4.5], [-13.5, 9.2],
  ],
  // Madagascar
  [[49.3, -12.1], [50.4, -15.5], [47.2, -25.1], [43.8, -24.5], [44.2, -19.5], [47.5, -14.8]],
  // Arabian Peninsula, South Asia, East & Southeast Asia
  [
    [34.5, 36.5], [35.5, 29.5], [43.3, 12.8], [53.5, 16.5], [59.8, 22.5],
    [56.2, 26.2], [50.0, 29.5], [57.0, 25.5], [66.8, 24.8], [72.8, 19.0],
    [77.5, 8.1], [80.3, 13.0], [88.5, 22.0], [94.5, 16.0], [98.5, 12.0],
    [100.2, 5.5], [103.8, 1.3], [103.5, 4.5], [100.5, 13.5], [105.0, 9.0],
    [109.2, 12.5], [108.0, 17.5], [106.5, 20.8], [110.5, 20.2], [114.2, 22.3],
    [120.5, 26.5], [122.0, 31.2], [119.5, 35.0], [122.5, 37.5], [121.0, 40.5],
    [126.5, 35.0], [129.5, 35.2], [129.0, 42.0], [136.0, 45.0], [34.5, 45.0],
  ],
  // Sri Lanka
  [[79.8, 9.4], [81.8, 7.2], [80.5, 6.0], [79.8, 7.6]],
  // Taiwan & Hainan
  [[120.9, 25.2], [121.9, 24.5], [120.8, 22.0], [120.1, 23.2]],
  [[108.8, 19.3], [110.8, 19.9], [110.2, 18.3], [108.7, 18.5]],
  // Japan southern islands (Honshu / Kyushu)
  [[130.0, 33.5], [135.5, 34.5], [140.8, 35.8], [141.5, 40.5], [139.0, 39.5], [131.0, 31.2]],
  // Sumatra
  [[95.3, 5.5], [99.6, 3.2], [103.5, 0.2], [105.8, -5.8], [103.8, -5.5], [100.5, -1.2], [96.6, 3.5]],
  // Java
  [[105.4, -6.2], [114.4, -7.8], [114.2, -8.7], [106.2, -7.2]],
  // Borneo
  [[109.0, 1.5], [116.8, 6.8], [119.0, 4.8], [117.5, -1.0], [115.8, -3.9], [110.2, -3.0]],
  // Sulawesi
  [[119.2, 1.0], [125.0, 1.5], [121.8, -1.5], [122.8, -5.2], [119.4, -5.4], [118.8, -2.5]],
  // Philippines (Luzon & Mindanao)
  [[120.2, 18.4], [122.4, 17.8], [123.8, 13.0], [121.0, 13.8], [119.8, 15.8]],
  [[122.2, 7.4], [126.4, 9.2], [126.2, 6.2], [123.5, 6.0]],
  // New Guinea
  [[131.0, -1.5], [136.0, -2.2], [141.0, -2.8], [147.8, -6.6], [150.5, -10.3], [146.5, -9.2], [138.0, -8.2], [133.0, -4.0]],
  // Australia (northern & central down to 35°S)
  [
    [114.0, -22.0], [122.2, -18.0], [129.0, -14.8], [136.8, -12.2], [136.0, -15.5],
    [141.0, -16.8], [142.5, -10.8], [145.5, -15.5], [150.5, -22.5], [153.5, -28.0],
    [150.8, -35.0], [138.5, -35.0], [135.5, -34.2], [129.0, -31.8], [122.0, -33.8],
    [115.0, -34.2], [113.5, -26.5],
  ],
];

export const TERROIR_REGIONS = [
  {
    id: 'panama',
    name: '巴拿马·波奎特',
    shortName: '巴拿马',
    lon: -82.4,
    lat: 8.8,
    coordsLabel: '8.8°N · 82.4°W',
    altitude: '1600–1800m',
    terroirNote: '巴鲁火山云雾微气候，2004 年翡翠庄园瑰夏于此震撼世界，呈现华丽玫瑰与清透柑橘。',
    labelPos: { dx: -14, dy: -12, anchor: 'end' },
    accent: 'copper',
    cardIds: ['ca-01-esmeralda-green', 'rg-03-latin-america', 'rg-06-geisha-migration'],
  },
  {
    id: 'colombia',
    name: '哥伦比亚·安第斯',
    shortName: '哥伦比亚',
    lon: -75.5,
    lat: 4.5,
    coordsLabel: '4.5°N · 75.5°W',
    altitude: '1750–1950m',
    terroirNote: '安第斯火山肥沃高地与先锋发酵实验中心，兼收陈年朗姆酒桶醇韵与冷泉氮气水洗洁净花香。',
    labelPos: { dx: 14, dy: 15, anchor: 'start' },
    accent: 'copper',
    cardIds: ['sa-01-macarena-rum', 'sa-02-baishan-n2', 'rg-03-latin-america'],
  },
  {
    id: 'brazil',
    name: '巴西·喜拉多',
    shortName: '巴西',
    lon: -47.0,
    lat: -18.9,
    coordsLabel: '18.9°S · 47.0°W',
    altitude: '1000–1250m',
    terroirNote: '热带稀树草原干湿季分明，成就经典黄波旁日晒的烤榛果、牛奶巧克力与平衡焦糖甜感。',
    labelPos: { dx: 14, dy: 4, anchor: 'start' },
    accent: 'copper',
    cardIds: ['sa-03-brazil-cerrado-yb', 'rg-03-latin-america'],
  },
  {
    id: 'ethiopia',
    name: '埃塞·卡法/戈里/格拉纳',
    shortName: '埃塞俄比亚',
    lon: 36.8,
    lat: 6.8,
    coordsLabel: '6.8°N · 36.8°E',
    altitude: '1900–2200m',
    terroirNote: '世界阿拉比卡与瑰夏的基因故乡，林荫高地孕育茉莉柑橘素颜水洗、蓝莓无花果日晒与共发酵甜品调。',
    labelPos: { dx: 14, dy: -14, anchor: 'start' },
    accent: 'jade',
    cardIds: [
      'af-04-gori-natural',
      'af-05-kaffa-washed',
      'af-06-kaffa-natural',
      'af-03-gelana-coferm',
      'rg-02-africa',
      'rg-06-geisha-migration',
    ],
  },
  {
    id: 'kenya',
    name: '肯尼亚·涅里',
    shortName: '肯尼亚',
    lon: 36.9,
    lat: -0.4,
    coordsLabel: '0.4°S · 36.9°E',
    altitude: '1700–1900m',
    terroirNote: '赤道火山红土与 72 小时双重水洗，赋予 SL28/SL34 标志性的黑加仑、血橙与乌梅爆裂酸质。',
    labelPos: { dx: 14, dy: 18, anchor: 'start' },
    accent: 'jade',
    cardIds: ['af-01-kenya-nyeri-aa', 'rg-02-africa'],
  },
  {
    id: 'yunnan',
    name: '中国云南·保山/普洱',
    shortName: '中国云南',
    lon: 99.2,
    lat: 24.8,
    coordsLabel: '24.8°N · 99.2°E',
    altitude: '1200–2000m',
    terroirNote: '高黎贡山干热河谷与北回归线茶咖共生带，老铁皮卡展现红糖梅子、烤坚果与清雅滇红回甘。',
    labelPos: { dx: 14, dy: -10, anchor: 'start' },
    accent: 'copper',
    cardIds: ['cn-01-yunnan-baoshan', 'rg-05-china-yunnan'],
  },
  {
    id: 'sumatra',
    name: '印尼·苏门答腊',
    shortName: '苏门答腊',
    lon: 98.9,
    lat: 2.3,
    coordsLabel: '2.3°N · 98.9°E',
    altitude: '1300–1600m',
    terroirNote: '赤道热带雨林与经典湿刨法（Giling Basah），塑造低酸厚重的雪松、黑巧克力与草本香料底色。',
    labelPos: { dx: 15, dy: 18, anchor: 'start' },
    accent: 'jade',
    cardIds: ['ap-01-sumatra-mandheling', 'rg-04-asia-pacific'],
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

function shortCardTitle(card) {
  if (!card?.title) return '';
  if (card.cardType === 'bean_card') {
    return card.title.replace(
      /^(巴拿马|哥伦比亚|埃塞俄比亚|肯尼亚|巴西|印度尼西亚|印尼|中国云南)\s+/,
      '',
    );
  }
  const idx = card.title.indexOf(' · ');
  return idx > 0 ? card.title.slice(0, idx).trim() : card.title;
}

function buildMapSvgMarkup(selectedRegionId) {
  const isLight = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';
  const beltStopColor = isLight ? '#A8742D' : '#D6A25E';
  const beltOpEdge = isLight ? '0.18' : '0.16';
  const beltOpMid = isLight ? '0.07' : '0.06';
  const vigInner = isLight ? '#FBF8F2' : '#291F1A';
  const vigOuter = isLight ? '#E7DEC9' : '#110C0A';
  const vigInnerOp = isLight ? '0.45' : '0.35';
  const vigOuterOp = isLight ? '0.68' : '0.88';
  const plateBg = isLight ? '#F4EFE5' : '#16110E';
  const arrowFill = isLight ? '#8B5C1F' : '#ECC68E';

  const [, yTropicN] = lonLatToXY(0, 23.5);
  const [, yEq] = lonLatToXY(0, 0);
  const [, yTropicS] = lonLatToXY(0, -23.5);
  const beltH = Number((yTropicS - yTropicN).toFixed(1));

  // Subtle longitude & latitude graticule
  const lonLines = [-120, -90, -60, -30, 0, 30, 60, 90, 120, 150]
    .map((lon) => {
      const [x] = lonLatToXY(lon, 0);
      return `<line x1="${x}" y1="${PAD_Y}" x2="${x}" y2="${400 - PAD_Y}" class="tm-grid-line" />`;
    })
    .join('');

  const latLines = [30, 15, -15, -30]
    .map((lat) => {
      const [, y] = lonLatToXY(0, lat);
      return `<line x1="${PAD_X}" y1="${y}" x2="${1000 - PAD_X}" y2="${y}" class="tm-grid-line" />`;
    })
    .join('');

  const landPaths = LANDMASS_RINGS.map(
    (ring) => `<path d="${ringToPath(ring)}" class="tm-land" />`,
  ).join('');

  // Geisha century migration arc: 1931 Ethiopia Gori (36.8, 6.8) -> 2004 Panama Boquete (-82.4, 8.8)
  const [ethX, ethY] = lonLatToXY(36.8, 6.8);
  const [panX, panY] = lonLatToXY(-82.4, 8.8);
  const ctrlX = Number(((ethX + panX) / 2).toFixed(1));
  const ctrlY = 92;

  const pinsMarkup = TERROIR_REGIONS.map((reg) => {
    const [cx, cy] = lonLatToXY(reg.lon, reg.lat);
    const active = reg.id === selectedRegionId;
    const lx = Number((cx + reg.labelPos.dx).toFixed(1));
    const ly = Number((cy + reg.labelPos.dy).toFixed(1));
    return `
      <g
        class="tm-pin ${active ? 'is-active' : ''} is-${reg.accent}"
        data-region-id="${reg.id}"
        role="button"
        tabindex="0"
        aria-pressed="${active}"
        aria-label="${escapeHtml(reg.name)}，包含 ${reg.cardIds.length} 张关联图鉴"
      >
        <circle cx="${cx}" cy="${cy}" r="15" class="tm-pin-hit" />
        <circle cx="${cx}" cy="${cy}" r="${active ? 11.5 : 8.5}" class="tm-pin-pulse" />
        <circle cx="${cx}" cy="${cy}" r="${active ? 5.2 : 4.1}" class="tm-pin-core" />
        <text
          x="${lx}"
          y="${ly}"
          text-anchor="${reg.labelPos.anchor}"
          class="tm-pin-label"
        >${escapeHtml(reg.name)}</text>
      </g>
    `;
  }).join('');

  return `
    <svg
      class="terroir-svg"
      viewBox="0 0 1000 400"
      role="img"
      aria-label="世界咖啡带交互式风土微图，标注南北回归线与 7 大精品咖啡产区"
    >
      <defs>
        <linearGradient id="tm-belt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${beltStopColor}" stop-opacity="${beltOpEdge}" />
          <stop offset="50%" stop-color="${beltStopColor}" stop-opacity="${beltOpMid}" />
          <stop offset="100%" stop-color="${beltStopColor}" stop-opacity="${beltOpEdge}" />
        </linearGradient>
        <radialGradient id="tm-vignette" cx="50%" cy="48%" r="62%">
          <stop offset="0%" stop-color="${vigInner}" stop-opacity="${vigInnerOp}" />
          <stop offset="100%" stop-color="${vigOuter}" stop-opacity="${vigOuterOp}" />
        </radialGradient>
        <marker
          id="tm-arrow"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="5.5"
          markerHeight="5.5"
          orient="auto"
        >
          <path d="M 1 2 L 8 5 L 1 8 z" fill="${arrowFill}" />
        </marker>
      </defs>

      <!-- Ocean plate & antique double copperplate frame -->
      <rect x="0" y="0" width="1000" height="400" fill="${plateBg}" class="tm-bg-plate" />
      <rect x="0" y="0" width="1000" height="400" fill="url(#tm-vignette)" class="tm-bg-plate" />
      <rect x="10" y="10" width="980" height="380" rx="6" class="tm-frame-outer" />
      <rect x="${PAD_X}" y="${PAD_Y}" width="${INNER_W}" height="${INNER_H}" class="tm-frame-inner" />

      <!-- Graticule -->
      <g class="tm-graticule" aria-hidden="true">${lonLines}${latLines}</g>

      <!-- Coffee Belt Golden Band (23.5°N to 23.5°S) -->
      <rect
        x="${PAD_X}"
        y="${yTropicN}"
        width="${INNER_W}"
        height="${beltH}"
        fill="url(#tm-belt-grad)"
        class="tm-band"
      />

      <!-- Continents -->
      <g class="tm-continents" aria-hidden="true">${landPaths}</g>

      <!-- Tropic & Equator Parallel Rules -->
      <g class="tm-graticule" aria-hidden="true">
        <line x1="${PAD_X}" y1="${yTropicN}" x2="${1000 - PAD_X}" y2="${yTropicN}" class="tm-tropic-line" />
        <line x1="${PAD_X}" y1="${yEq}" x2="${1000 - PAD_X}" y2="${yEq}" class="tm-equator-line" />
        <line x1="${PAD_X}" y1="${yTropicS}" x2="${1000 - PAD_X}" y2="${yTropicS}" class="tm-tropic-line" />

        <text x="${PAD_X - 6}" y="${yTropicN + 3}" text-anchor="end" class="tm-lat-tag">23.5°N</text>
        <text x="${1000 - PAD_X + 6}" y="${yTropicN + 3}" text-anchor="start" class="tm-lat-tag">23.5°N</text>

        <text x="${PAD_X - 6}" y="${yEq + 3}" text-anchor="end" class="tm-lat-tag is-eq">0° EQ</text>
        <text x="${1000 - PAD_X + 6}" y="${yEq + 3}" text-anchor="start" class="tm-lat-tag is-eq">0° EQ</text>

        <text x="${PAD_X - 6}" y="${yTropicS + 3}" text-anchor="end" class="tm-lat-tag">23.5°S</text>
        <text x="${1000 - PAD_X + 6}" y="${yTropicS + 3}" text-anchor="start" class="tm-lat-tag">23.5°S</text>
      </g>

      <!-- Geisha Century Migration Arc (1931 Ethiopia -> 2004 Panama) -->
      <g class="tm-migration tm-arc" aria-hidden="true">
        <path
          d="M ${ethX} ${ethY} Q ${ctrlX} ${ctrlY} ${panX + 7} ${panY - 4}"
          class="tm-migration-arc"
          marker-end="url(#tm-arrow)"
        />
        <text x="${ctrlX}" y="128" text-anchor="middle" class="tm-migration-label">
          瑰夏百年迁徙 · 1931 埃塞戈里 → 2004 巴拿马波奎特
        </text>
      </g>

      <!-- 7 Interactive Coffee Origin Pins -->
      <g class="tm-pins">${pinsMarkup}</g>
    </svg>
  `;
}

export function createTerroirMap(mountEl, options = {}) {
  const { cardMap = {}, onSelectRegion, onInspectCard, onCollapse } = options;
  let selectedRegionId = null;

  function renderSpotlight() {
    const spotlightEl = mountEl.querySelector('#terroir-spotlight');
    const resetTopBtn = mountEl.querySelector('#terroir-reset-top');
    if (!spotlightEl) return;

    const region = TERROIR_REGIONS.find((r) => r.id === selectedRegionId) || null;
    if (resetTopBtn) resetTopBtn.hidden = !region;

    if (!region) {
      spotlightEl.innerHTML = `
        <div class="terroir-idle-bar">
          <span class="terroir-idle-hint">点选地图铜金坐标或产区胶囊，查看风土档案并联动筛选下方图鉴：</span>
          <div class="terroir-quick-chips">
            ${TERROIR_REGIONS.map(
              (r) => `
                <button type="button" class="terroir-chip-btn" data-quick-region="${r.id}">
                  <span>${escapeHtml(r.shortName)}</span>
                  <span class="terroir-chip-count">${r.cardIds.length}</span>
                </button>
              `,
            ).join('')}
          </div>
        </div>
      `;

      spotlightEl.querySelectorAll('[data-quick-region]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectRegion(btn.dataset.quickRegion || null, true);
        });
      });
      return;
    }

    const linkedCards = region.cardIds.map((id) => cardMap[id]).filter(Boolean);

    spotlightEl.innerHTML = `
      <div class="terroir-detail-bar">
        <div class="terroir-detail-head">
          <div class="terroir-detail-title-row">
            <span class="terroir-detail-dot is-${region.accent}" aria-hidden="true"></span>
            <h3 class="terroir-detail-name">${escapeHtml(region.name)}</h3>
            <span class="terroir-detail-coords">${escapeHtml(region.coordsLabel)} · 海拔 ${escapeHtml(region.altitude)}</span>
          </div>
        </div>

        <p class="terroir-detail-note">${escapeHtml(region.terroirNote)}</p>

        <div class="terroir-card-pills" aria-label="${escapeHtml(region.name)}关联 3D 闪卡">
          ${linkedCards
            .map(
              (c) => `
                <button type="button" class="terroir-card-pill" data-inspect-card="${escapeHtml(c.id)}">
                  <span class="terroir-card-code">${escapeHtml(c.code)}</span>
                  <span class="terroir-card-title">${escapeHtml(shortCardTitle(c))}</span>
                </button>
              `,
            )
            .join('')}
        </div>
      </div>
    `;

    spotlightEl.querySelectorAll('[data-inspect-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-inspect-card');
        if (id) onInspectCard?.(id);
      });
    });
  }

  function renderSvg() {
    const svgHost = mountEl.querySelector('#terroir-svg-host');
    if (!svgHost) return;
    svgHost.innerHTML = buildMapSvgMarkup(selectedRegionId);

    svgHost.querySelectorAll('.tm-pin').forEach((pin) => {
      const regionId = pin.getAttribute('data-region-id');
      const activate = () => {
        const nextId = selectedRegionId === regionId ? null : regionId;
        selectRegion(nextId, true);
      };
      pin.addEventListener('click', activate);
      pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function selectRegion(regionId, notify = false) {
    const valid = TERROIR_REGIONS.find((r) => r.id === regionId) || null;
    selectedRegionId = valid ? valid.id : null;
    renderSvg();
    renderSpotlight();
    if (notify) {
      onSelectRegion?.(valid);
    }
  }

  mountEl.innerHTML = `
    <div class="terroir-map-card" role="region" aria-label="世界咖啡带交互式风土微图">
      <div class="terroir-map-head">
        <div class="terroir-map-head-left">
          <h2 class="terroir-map-title">世界咖啡带风土微图</h2>
          <span class="terroir-map-legend">南北回归线 23.5°N – 23.5°S · 7 大代表产区坐标</span>
        </div>
        <div class="terroir-map-head-right">
          <button type="button" class="terroir-head-btn" id="terroir-reset-top" hidden>显示全球全部</button>
          <button type="button" class="terroir-head-btn" id="terroir-collapse-btn" title="收起风土地图 (M)">收起</button>
        </div>
      </div>
      <div class="terroir-svg-host" id="terroir-svg-host"></div>
      <div class="terroir-spotlight" id="terroir-spotlight"></div>
    </div>
  `;

  mountEl.querySelector('#terroir-reset-top')?.addEventListener('click', () => {
    selectRegion(null, true);
  });

  mountEl.querySelector('#terroir-collapse-btn')?.addEventListener('click', () => {
    onCollapse?.();
  });

  renderSvg();
  renderSpotlight();

  return {
    selectRegion: (id) => selectRegion(id, false),
    clearSelection: () => selectRegion(null, false),
    getSelectedRegion: () => TERROIR_REGIONS.find((r) => r.id === selectedRegionId) || null,
    refreshTheme: () => renderSvg(),
  };
}
