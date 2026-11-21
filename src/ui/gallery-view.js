/**
 * 36 张暗房典藏画廊卡墙与多维筛选 (Gallery View)
 * 支持 6 组分类页签、单品豆多维筛选胶囊（大洲/处理法/烘焙度）、全局即时关键词搜索与懒加载 2:3 缩略图
 */

import { getFlavorColor } from '../../data/flavor-palette.js';
import { renderGalleryThumb } from '../art/hybrid-resolver.js';
import { createTerroirMap } from './terroir-map.js';
import { createBendingGallery } from './bending-gallery.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSearchCorpus(card) {
  const parts = [
    card.id,
    card.code,
    card.title,
    card.subtitle,
    card.tagline,
    card.topic,
    ...(Array.isArray(card.tags) ? card.tags : []),
  ];

  if (card.cardType === 'bean_card') {
    const o = card.origin || {};
    const b = card.botany || {};
    const p = card.processing || {};
    const r = card.roast || {};
    const s = card.sensory || {};
    const ph = card.physics || {};
    const n = card.narrative || {};
    parts.push(
      o.continent,
      o.country,
      o.region,
      o.estate,
      o.altitude,
      o.grade,
      o.harvestSeason,
      b.species,
      b.variety,
      p.category,
      p.name,
      p.detail,
      r.label,
      r.scale,
      r.agtron,
      ...(Array.isArray(s.flavors) ? s.flavors : []),
      s.tastingNotes,
      ph.moisturePct != null ? `${ph.moisturePct}%` : '',
      ph.densityGl != null ? `${ph.densityGl}g/L ${ph.densityGl}` : '',
      ph.note,
      n.originStory,
      n.cultivationHarvest,
    );
  } else {
    parts.push(
      card.summary,
      card.keyTakeaway,
      card.mythBuster,
      ...(Array.isArray(card.highlights) ? card.highlights : []),
      ...(Array.isArray(card.metrics) ? card.metrics.flatMap((m) => [m.label, m.value]) : []),
      ...(Array.isArray(card.sections) ? card.sections.flatMap((s) => [s.heading, s.body]) : []),
    );
  }

  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function createGalleryView(mountEl, options = {}) {
  const {
    cards: initialCards = [],
    deckGroups: initialDeckGroups = [],
    filterFacets: initialFilterFacets = {},
    masteredIds = new Set(),
    onSelectCard,
    onOpenQuiz,
    onAddBean,
  } = options;

  let cards = [...initialCards];
  let searchIndex = new Map(cards.map((c) => [c.id, buildSearchCorpus(c)]));
  let cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));
  const thumbCache = new Map();
  const thumbInFlight = new Map();
  let masteredSet = new Set(masteredIds);

  let activeGroup = 'all';
  let activeContinent = '';
  let activeProcess = '';
  let activeRoast = '';
  let activeRegion = null;
  let mapOpen = false;
  let galleryMode = 'bending';
  let searchQuery = '';
  let currentCardId = cards[0]?.id || null;
  let thumbObserver = null;

  function buildGroupList(sourceCards, providedGroups) {
    if (Array.isArray(providedGroups) && providedGroups.length > 0) {
      return providedGroups;
    }
    return [
      { id: 'all', label: '全部', count: sourceCards.length },
      { id: 'bean_card', label: '珍藏单品豆', count: sourceCards.filter((c) => c.group === 'bean_card').length },
      { id: 'species', label: '核心豆种', count: sourceCards.filter((c) => c.group === 'species').length },
      { id: 'variety', label: '细分品种', count: sourceCards.filter((c) => c.group === 'variety').length },
      { id: 'origin', label: '世界产区', count: sourceCards.filter((c) => c.group === 'origin').length },
      { id: 'craft_tasting', label: '工艺与品鉴', count: sourceCards.filter((c) => c.group === 'craft_tasting').length },
    ];
  }

  let groups = buildGroupList(cards, initialDeckGroups);
  let facets = {
    continents: initialFilterFacets.continents || [],
    processes: initialFilterFacets.processes || [],
    roasts: initialFilterFacets.roasts || [],
  };

  mountEl.innerHTML = `
    <div class="gallery-inner">
      <div class="gallery-header">
        <div>
          <h1 class="gallery-heading">世界咖啡豆典藏图鉴</h1>
          <p class="gallery-lead">涵盖五大基因豆种、精品品种、四大产区风土、发酵与品鉴工艺及十一款珍藏单品豆，点击任意标本进入 3D 全息展台。</p>
        </div>

        <div class="gallery-header-actions">
          <button
            type="button"
            class="gallery-add-btn"
            id="gallery-add-bean-btn"
            title="录入我的新咖啡豆并生成 3D 闪卡 (N)"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>录入新豆</span>
          </button>

          <button
            type="button"
            class="gallery-map-btn"
            id="gallery-map-toggle"
            aria-expanded="false"
            aria-controls="gallery-map-slot"
            title="展开或收起世界咖啡带风土地图 (M)"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M3 12h18"></path>
              <path d="M12 3a13 13 0 0 1 0 18"></path>
              <path d="M12 3a13 13 0 0 0 0 18"></path>
            </svg>
            <span>风土地图</span>
          </button>

          <button
            type="button"
            class="gallery-quiz-btn"
            id="gallery-quiz-btn"
            title="进入品鉴官闪卡盲测模式 (Q)"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2.2-2.4 3.7"></path>
              <line x1="12" y1="17.2" x2="12.01" y2="17.2"></line>
              <rect x="3" y="4" width="18" height="16" rx="3"></rect>
            </svg>
            <span class="gallery-quiz-label">闪卡盲测</span>
            <span class="gallery-quiz-mastery" id="gallery-quiz-mastery">已掌握 ${masteredSet.size} / ${cards.length}</span>
          </button>

          <div class="gallery-search-box">
            <svg class="gallery-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="20" y1="20" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="search"
              id="gallery-search-input"
              class="gallery-search-input"
              placeholder="搜索瑰夏、朗姆酒、罗豆、云南、880g/L…"
              aria-label="搜索全部咖啡图鉴卡片"
              autocomplete="off"
            />
            <button
              type="button"
              id="gallery-search-clear"
              class="gallery-search-clear"
              aria-label="清空搜索"
              hidden
            >×</button>
          </div>
        </div>
      </div>

      <div class="gallery-tabs-row">
        <div class="gallery-group-tabs" id="gallery-group-tabs" role="tablist" aria-label="图鉴分类"></div>
        <div class="gallery-summary-bar">
          <div class="gallery-mode-switch" role="group" aria-label="画廊展示模式">
            <button type="button" class="gallery-mode-btn is-active" id="gallery-mode-bending" data-gallery-mode="bending" aria-pressed="true">弯曲画廊</button>
            <button type="button" class="gallery-mode-btn" id="gallery-mode-grid" data-gallery-mode="grid" aria-pressed="false">网格卡墙</button>
          </div>
          <span id="gallery-result-count">共 ${cards.length} 张</span>
          <button type="button" class="gallery-reset-btn" id="gallery-reset-btn" hidden>重置筛选</button>
        </div>
      </div>

      <div class="gallery-map-slot" id="gallery-map-slot" hidden></div>

      <div class="gallery-facets" id="gallery-facets" hidden aria-label="单品豆多维筛选"></div>

      <div class="gallery-bending-slot" id="gallery-bending-slot"></div>
      <div class="gallery-grid" id="gallery-grid" role="list" hidden></div>
      <div class="gallery-empty" id="gallery-empty" hidden>
        <h2 class="gallery-empty-title" id="gallery-empty-title">未找到匹配的图鉴卡片</h2>
        <p class="gallery-empty-desc">可以尝试更换关键词，或重置当前分类与筛选条件查看完整 36 张图鉴。</p>
        <button type="button" class="gallery-empty-btn" id="gallery-empty-reset">清除全部筛选</button>
      </div>
    </div>
  `;

  const elAddBeanBtn = mountEl.querySelector('#gallery-add-bean-btn');
  const elMapToggle = mountEl.querySelector('#gallery-map-toggle');
  const elMapSlot = mountEl.querySelector('#gallery-map-slot');
  const elQuizBtn = mountEl.querySelector('#gallery-quiz-btn');
  const elQuizMastery = mountEl.querySelector('#gallery-quiz-mastery');
  const elSearchInput = mountEl.querySelector('#gallery-search-input');
  const elSearchClear = mountEl.querySelector('#gallery-search-clear');
  const elGroupTabs = mountEl.querySelector('#gallery-group-tabs');
  const elModeBending = mountEl.querySelector('#gallery-mode-bending');
  const elModeGrid = mountEl.querySelector('#gallery-mode-grid');
  const elBendingSlot = mountEl.querySelector('#gallery-bending-slot');
  const elFacets = mountEl.querySelector('#gallery-facets');
  const elGrid = mountEl.querySelector('#gallery-grid');
  const elEmpty = mountEl.querySelector('#gallery-empty');
  const elEmptyTitle = mountEl.querySelector('#gallery-empty-title');
  const elEmptyReset = mountEl.querySelector('#gallery-empty-reset');
  const elResultCount = mountEl.querySelector('#gallery-result-count');
  const elResetBtn = mountEl.querySelector('#gallery-reset-btn');

  function setMapOpen(nextOpen) {
    mapOpen = Boolean(nextOpen);
    if (elMapSlot) elMapSlot.hidden = !mapOpen;
    if (elMapToggle) {
      elMapToggle.classList.toggle('is-active', mapOpen);
      elMapToggle.setAttribute('aria-expanded', String(mapOpen));
    }
  }

  const bendingGallery = createBendingGallery(elBendingSlot, {
    onOpenInStage(cardId) {
      onSelectCard?.(cardId);
    },
  });

  function syncModeVisibility(hasResults = true) {
    const isBending = galleryMode === 'bending';
    elModeBending?.classList.toggle('is-active', isBending);
    elModeBending?.setAttribute('aria-pressed', String(isBending));
    elModeGrid?.classList.toggle('is-active', !isBending);
    elModeGrid?.setAttribute('aria-pressed', String(!isBending));

    if (elBendingSlot) elBendingSlot.hidden = !hasResults || !isBending;
    if (elGrid) elGrid.hidden = !hasResults || isBending;

    const shouldRunWebGL = !mountEl.hidden && hasResults && isBending;
    bendingGallery.setVisible(shouldRunWebGL);
    if (!mountEl.hidden && hasResults && !isBending) {
      setupThumbObserver();
    }
  }

  function setGalleryMode(nextMode) {
    const normalized = nextMode === 'grid' ? 'grid' : 'bending';
    if (galleryMode === normalized) return;
    galleryMode = normalized;
    syncModeVisibility(getFilteredCards().length > 0);
  }

  const terroirMap = createTerroirMap(elMapSlot, {
    cardMap,
    onSelectRegion(region) {
      activeRegion = region;
      if (region && activeGroup !== 'all') {
        activeGroup = 'all';
        activeContinent = '';
        activeProcess = '';
        activeRoast = '';
      }
      renderAll();
    },
    onInspectCard(cardId) {
      onSelectCard?.(cardId);
    },
    onCollapse() {
      setMapOpen(false);
    },
  });

  function hasActiveFilters() {
    return Boolean(
      activeGroup !== 'all' ||
        activeContinent ||
        activeProcess ||
        activeRoast ||
        activeRegion ||
        searchQuery.trim(),
    );
  }

  function resetFilters() {
    activeGroup = 'all';
    activeContinent = '';
    activeProcess = '';
    activeRoast = '';
    activeRegion = null;
    terroirMap.clearSelection();
    searchQuery = '';
    elSearchInput.value = '';
    elSearchClear.hidden = true;
    renderAll();
  }

  function getFilteredCards() {
    const terms = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const regionIdSet = activeRegion ? new Set(activeRegion.cardIds) : null;

    return cards.filter((card) => {
      if (regionIdSet && !regionIdSet.has(card.id)) {
        return false;
      }

      if (activeGroup !== 'all' && card.group !== activeGroup) {
        return false;
      }

      if (activeGroup === 'bean_card') {
        if (activeContinent && card.origin?.continent !== activeContinent) {
          return false;
        }
        if (activeProcess && card.processing?.category !== activeProcess) {
          return false;
        }
        if (activeRoast && card.roast?.label !== activeRoast) {
          return false;
        }
      }

      if (terms.length > 0) {
        const corpus = searchIndex.get(card.id) || '';
        for (const term of terms) {
          if (!corpus.includes(term)) return false;
        }
      }

      return true;
    });
  }

  function renderGroupTabs() {
    elGroupTabs.innerHTML = groups
      .map((g) => {
        const active = g.id === activeGroup;
        return `
          <button
            type="button"
            class="group-tab ${active ? 'is-active' : ''}"
            data-group-id="${escapeHtml(g.id)}"
            role="tab"
            aria-selected="${active}"
          >
            <span>${escapeHtml(g.label)}</span>
            <span class="group-tab-count">${g.count}</span>
          </button>
        `;
      })
      .join('');

    elGroupTabs.querySelectorAll('.group-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextGroup = btn.dataset.groupId || 'all';
        activeGroup = nextGroup;
        if (activeRegion) {
          activeRegion = null;
          terroirMap.clearSelection();
        }
        if (activeGroup !== 'bean_card') {
          activeContinent = '';
          activeProcess = '';
          activeRoast = '';
        }
        if (activeGroup === 'origin') {
          setMapOpen(true);
        }
        renderAll();
      });
    });
  }

  function renderFacetBar() {
    const showFacets = activeGroup === 'bean_card';
    elFacets.hidden = !showFacets;
    if (!showFacets) return;

    const rows = [
      { key: 'continent', label: '大洲', items: facets.continents, current: activeContinent },
      { key: 'process', label: '处理法', items: facets.processes, current: activeProcess },
      { key: 'roast', label: '烘焙度', items: facets.roasts, current: activeRoast },
    ].filter((r) => Array.isArray(r.items) && r.items.length > 0);

    elFacets.innerHTML = rows
      .map(
        (row) => `
          <div class="facet-row">
            <span class="facet-label">${escapeHtml(row.label)}</span>
            <div class="facet-pills">
              <button
                type="button"
                class="facet-pill ${!row.current ? 'is-active' : ''}"
                data-facet-key="${row.key}"
                data-facet-val=""
              >全部</button>
              ${row.items
                .map(
                  (item) => `
                    <button
                      type="button"
                      class="facet-pill ${row.current === item.value ? 'is-active' : ''}"
                      data-facet-key="${row.key}"
                      data-facet-val="${escapeHtml(item.value)}"
                    >${escapeHtml(item.label)}</button>
                  `,
                )
                .join('')}
            </div>
          </div>
        `,
      )
      .join('');

    elFacets.querySelectorAll('.facet-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const key = pill.dataset.facetKey;
        const val = pill.dataset.facetVal || '';
        if (key === 'continent') {
          activeContinent = activeContinent === val ? '' : val;
        } else if (key === 'process') {
          activeProcess = activeProcess === val ? '' : val;
        } else if (key === 'roast') {
          activeRoast = activeRoast === val ? '' : val;
        }
        renderFacetBar();
        renderGrid();
      });
    });
  }

  function loadThumbnailForCard(card, imgEl, placeholderEl) {
    const cached = thumbCache.get(card.id);
    if (cached) {
      imgEl.src = cached;
      imgEl.classList.add('is-loaded');
      placeholderEl?.classList.add('is-hidden');
      return;
    }

    let pending = thumbInFlight.get(card.id);
    if (!pending) {
      pending = Promise.resolve()
        .then(() => renderGalleryThumb(card))
        .then((dataUrl) => {
          if (typeof dataUrl === 'string' && dataUrl.length > 0) {
            thumbCache.set(card.id, dataUrl);
          }
          thumbInFlight.delete(card.id);
          return dataUrl;
        })
        .catch(() => {
          thumbInFlight.delete(card.id);
          return '';
        });
      thumbInFlight.set(card.id, pending);
    }

    pending.then((dataUrl) => {
      if (!dataUrl || !imgEl.isConnected) return;
      imgEl.src = dataUrl;
      imgEl.classList.add('is-loaded');
      placeholderEl?.classList.add('is-hidden');
    });
  }

  function setupThumbObserver() {
    if (thumbObserver) {
      thumbObserver.disconnect();
      thumbObserver = null;
    }

    const targets = Array.from(elGrid.querySelectorAll('.specimen-card'));
    if (targets.length === 0) return;

    // Immediately render first-screen cards (first 10) so tab/filter switches light up instantaneously
    const eagerCount = Math.min(10, targets.length);
    for (let i = 0; i < eagerCount; i++) {
      const btn = targets[i];
      const card = cards.find((c) => c.id === btn.dataset.cardId);
      if (card) {
        loadThumbnailForCard(
          card,
          btn.querySelector('.specimen-thumb'),
          btn.querySelector('.specimen-placeholder'),
        );
      }
    }

    const lazyTargets = targets.slice(eagerCount);
    if (lazyTargets.length === 0) return;

    if (typeof IntersectionObserver !== 'function') {
      lazyTargets.forEach((btn) => {
        const card = cards.find((c) => c.id === btn.dataset.cardId);
        if (card) {
          loadThumbnailForCard(
            card,
            btn.querySelector('.specimen-thumb'),
            btn.querySelector('.specimen-placeholder'),
          );
        }
      });
      return;
    }

    thumbObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const btn = entry.target;
          thumbObserver.unobserve(btn);
          const card = cards.find((c) => c.id === btn.dataset.cardId);
          if (card) {
            loadThumbnailForCard(
              card,
              btn.querySelector('.specimen-thumb'),
              btn.querySelector('.specimen-placeholder'),
            );
          }
        }
      },
      {
        root: mountEl,
        rootMargin: '320px 0px',
        threshold: 0.01,
      },
    );

    lazyTargets.forEach((btn) => thumbObserver.observe(btn));
  }

  function renderGrid() {
    const filtered = getFilteredCards();
    if (activeRegion) {
      elResultCount.textContent = `${activeRegion.name} · 显示 ${filtered.length} / ${cards.length} 张`;
    } else {
      elResultCount.textContent =
        filtered.length === cards.length
          ? `共 ${cards.length} 张`
          : `显示 ${filtered.length} / ${cards.length} 张`;
    }
    elResetBtn.hidden = !hasActiveFilters();
    bendingGallery.setCards(filtered);

    if (filtered.length === 0) {
      elGrid.innerHTML = '';
      elEmpty.hidden = false;
      syncModeVisibility(false);
      const q = searchQuery.trim();
      elEmptyTitle.textContent = q
        ? `未找到匹配「${q}」的咖啡图鉴卡片`
        : '当前筛选条件下暂无卡片';
      return;
    }

    elEmpty.hidden = true;

    elGrid.innerHTML = filtered
      .map((card) => {
        const palette = card.visual?.palette || {};
        const finish = card.visual?.defaultFinish || 'gold';
        const isCustom = Boolean(card.isCustomBean);
        const isHybrid = Boolean(card.isHeroBean || card.visual?.layers?.mode === 'hybrid');
        const artBadgeLabel = isCustom
          ? '我的豆单'
          : !isHybrid
            ? ''
            : card.cardType === 'bean_card'
              ? '高定插画'
              : '标本精绘';
        const isCurrent = card.id === currentCardId;

        const sub =
          card.cardType === 'bean_card'
            ? [card.origin?.country, card.processing?.name, card.roast?.label]
                .filter(Boolean)
                .join(' / ')
            : card.subtitle || card.topic || '';

        const chips =
          card.cardType === 'bean_card'
            ? (card.sensory?.flavors || []).slice(0, 3).map((fl) => ({
                label: fl,
                color: getFlavorColor(fl),
              }))
            : (card.tags || []).slice(0, 3).map((tag) => ({
                label: tag,
                color: palette.secondary || '#D6A25E',
              }));

        const cachedSrc = thumbCache.get(card.id) || '';

        const finishLabels = {
          gold: '烫金',
          pearl: '珠光',
          silver: '银箔',
          original: '原画',
        };
        const finishLabel = finishLabels[finish] || '烫金';

        return `
          <button
            type="button"
            class="specimen-card ${isCurrent ? 'is-current' : ''}"
            data-card-id="${escapeHtml(card.id)}"
            role="listitem"
            aria-label="${escapeHtml(card.code)} ${escapeHtml(card.title)}"
          >
            <div
              class="specimen-art-wrap"
              style="--card-bg-top:${escapeHtml(palette.bgTop || '#241B16')};--card-bg-bottom:${escapeHtml(palette.bgBottom || '#120D0B')}"
            >
              <div class="specimen-placeholder ${cachedSrc ? 'is-hidden' : ''}" aria-hidden="true">
                <span class="specimen-placeholder-frame"></span>
              </div>
              <img
                class="specimen-thumb ${cachedSrc ? 'is-loaded' : ''}"
                ${cachedSrc ? `src="${cachedSrc}"` : ''}
                alt="${escapeHtml(card.title)}"
                decoding="async"
              />
            </div>
            <div class="specimen-info">
              <div class="specimen-meta-row">
                <span class="specimen-meta-left">
                  <span class="specimen-meta-code">${escapeHtml(card.code)}</span>
                  ${masteredSet.has(card.id) ? '<span class="specimen-mastered-pill"><span class="specimen-mastered-dot" aria-hidden="true"></span>已掌握</span>' : ''}
                </span>
                <span class="specimen-meta-right">
                  ${
                    artBadgeLabel
                      ? `<span class="specimen-ai-pill ${card.cardType === 'knowledge_card' ? 'is-specimen' : ''}">${artBadgeLabel}</span>`
                      : ''
                  }
                  <span class="specimen-finish-dot" data-finish="${escapeHtml(finish)}" title="默认质感：${finishLabel}"></span>
                </span>
              </div>
              <h2 class="specimen-title">${escapeHtml(card.title)}</h2>
              <p class="specimen-sub">${escapeHtml(sub)}</p>
              ${
                chips.length > 0
                  ? `
                    <div class="specimen-tags">
                      ${chips
                        .map(
                          (chip) => `
                            <span class="specimen-chip" style="--chip-color:${escapeHtml(chip.color)}">
                              <span class="specimen-chip-dot" aria-hidden="true"></span>
                              <span>${escapeHtml(chip.label)}</span>
                            </span>
                          `,
                        )
                        .join('')}
                    </div>
                  `
                  : ''
              }
            </div>
          </button>
        `;
      })
      .join('');

    elGrid.querySelectorAll('.specimen-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.cardId;
        if (id) onSelectCard?.(id);
      });
    });

    syncModeVisibility(true);
  }

  function renderAll() {
    renderGroupTabs();
    renderFacetBar();
    renderGrid();
  }

  elModeBending?.addEventListener('click', () => setGalleryMode('bending'));
  elModeGrid?.addEventListener('click', () => setGalleryMode('grid'));

  elSearchInput.addEventListener('input', () => {
    searchQuery = elSearchInput.value;
    elSearchClear.hidden = searchQuery.length === 0;
    renderGrid();
  });

  elSearchClear.addEventListener('click', () => {
    searchQuery = '';
    elSearchInput.value = '';
    elSearchClear.hidden = true;
    renderGrid();
    elSearchInput.focus();
  });

  elAddBeanBtn?.addEventListener('click', () => onAddBean?.());
  elMapToggle?.addEventListener('click', () => setMapOpen(!mapOpen));
  elQuizBtn?.addEventListener('click', () => onOpenQuiz?.());
  elResetBtn.addEventListener('click', resetFilters);
  elEmptyReset.addEventListener('click', resetFilters);

  renderAll();

  return {
    setDeck({ cards: nextCards, deckGroups: nextGroups, filterFacets: nextFacets, invalidateIds = [] } = {}) {
      if (Array.isArray(nextCards)) {
        cards = [...nextCards];
        searchIndex = new Map(cards.map((c) => [c.id, buildSearchCorpus(c)]));
        cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));
        groups = buildGroupList(cards, nextGroups);
      }
      if (nextFacets) {
        facets = {
          continents: nextFacets.continents || [],
          processes: nextFacets.processes || [],
          roasts: nextFacets.roasts || [],
        };
      }
      for (const id of invalidateIds) {
        thumbCache.delete(id);
        thumbInFlight.delete(id);
      }
      if (invalidateIds.length > 0) {
        bendingGallery.setCards(getFilteredCards(), { invalidateIds });
      }
      if (elQuizMastery) {
        elQuizMastery.textContent = `已掌握 ${masteredSet.size} / ${cards.length}`;
      }
      renderAll();
    },
    setActiveCard(cardId) {
      currentCardId = cardId;
      elGrid.querySelectorAll('.specimen-card').forEach((btn) => {
        btn.classList.toggle('is-current', btn.dataset.cardId === cardId);
      });
    },
    setMasteredIds(nextSet) {
      masteredSet = new Set(nextSet || []);
      if (elQuizMastery) {
        elQuizMastery.textContent = `已掌握 ${masteredSet.size} / ${cards.length}`;
      }
      renderGrid();
    },
    setMapOpen,
    toggleMap() {
      setMapOpen(!mapOpen);
    },
    isMapOpen: () => mapOpen,
    selectMapRegion(regionId) {
      setMapOpen(true);
      terroirMap.selectRegion(regionId);
      activeRegion = terroirMap.getSelectedRegion();
      if (activeRegion && activeGroup !== 'all') activeGroup = 'all';
      renderAll();
    },
    setGalleryMode,
    getGalleryMode: () => galleryMode,
    isMaximized: () => bendingGallery.isMaximized(),
    closeMaximize: () => bendingGallery.closeMaximize(),
    handleKeyDown: (event) => bendingGallery.handleKeyDown(event),
    onShow() {
      syncModeVisibility(getFilteredCards().length > 0);
    },
    onHide() {
      bendingGallery.setVisible(false);
    },
    refreshTheme() {
      terroirMap.refreshTheme?.();
    },
    focusSearch() {
      elSearchInput.focus();
    },
    resetFilters,
    destroy() {
      if (thumbObserver) thumbObserver.disconnect();
      bendingGallery.destroy();
    },
  };
}
