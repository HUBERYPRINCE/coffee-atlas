/**
 * 焙境图鉴 · 应用主入口与状态协调器 (Main Controller)
 * 串联 36 张咖啡图鉴数据、Three.js 3D 全息展台、底栏 HUD、右侧精读抽屉、36 卡暗房画廊与全局快捷键
 */

import { ALL_CARDS, CARD_MAP, DECK_GROUPS, FILTER_FACETS } from '../data/deck-index.js';
import { createHoloStage } from './engine/holo-stage.js';
import { invalidateCardThumb } from './art/hybrid-resolver.js';
import { createStageHud } from './ui/stage-hud.js';
import { createBendingGallery } from './ui/bending-gallery.js';
import { createReadingDrawer } from './ui/reading-drawer.js';
import { createGalleryView } from './ui/gallery-view.js';
import { createCompareView } from './ui/compare-view.js';
import { createQuizView, loadMasteryState } from './ui/quiz-view.js';
import { createBeanStudio, loadCustomBeans, saveCustomBeans } from './ui/bean-studio.js';

const PROCESS_LABELS = {
  washed: '水洗',
  natural: '日晒',
  honey: '蜜处理',
  wet_hulled: '湿刨',
  barrel_aged: '朗姆酒桶',
  co_fermented: '共发酵',
  nitrogen_cold: '氮气冷洗',
  anaerobic: '厌氧发酵',
};

const CONTINENT_ORDER = ['非洲', '拉丁美洲', '亚太', '中国云南'];
const PROCESS_ORDER = [
  'washed',
  'natural',
  'honey',
  'wet_hulled',
  'barrel_aged',
  'co_fermented',
  'nitrogen_cold',
  'anaerobic',
];
const ROAST_ORDER = ['浅度', '中浅度', '浅中度', 'High', 'City', 'Full City'];

function buildDeckMeta(cards) {
  const groups = DECK_GROUPS.map((g) => ({
    ...g,
    count: g.id === 'all' ? cards.length : cards.filter((c) => c.group === g.id).length,
  }));

  const beans = cards.filter((c) => c.cardType === 'bean_card');
  const countBy = (list, getter) => {
    const map = new Map();
    for (const item of list) {
      const val = getter(item);
      if (!val) continue;
      map.set(val, (map.get(val) || 0) + 1);
    }
    return map;
  };

  const cMap = countBy(beans, (b) => b.origin?.continent);
  const pMap = countBy(beans, (b) => b.processing?.category);
  const rMap = countBy(beans, (b) => b.roast?.label);

  const continents = CONTINENT_ORDER.filter((v) => cMap.has(v)).map((v) => ({
    value: v,
    label: v,
    count: cMap.get(v),
  }));

  const processes = PROCESS_ORDER.filter((v) => pMap.has(v)).map((v) => ({
    value: v,
    label: PROCESS_LABELS[v] || v,
    count: pMap.get(v),
  }));

  const roasts = ROAST_ORDER.filter((v) => rMap.has(v)).map((v) => ({
    value: v,
    label: v,
    count: rMap.get(v),
  }));

  return {
    deckGroups: groups,
    filterFacets: {
      ...FILTER_FACETS,
      continents,
      processes,
      roasts,
    },
  };
}

const THEME_STORAGE_KEY = 'coffee-atlas-theme-v2';

function loadSavedTheme() {
  try {
    return window.localStorage?.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function saveTheme(theme) {
  try {
    window.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

function parseHexColor(hex) {
  if (typeof hex !== 'string') return null;
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function computeStageGlowRgb(card) {
  const palette = card?.visual?.palette || {};
  const primary = parseHexColor(palette.primary) || parseHexColor(palette.accent) || [168, 122, 74];
  let [r, g, b] = primary;
  const peak = Math.max(r, g, b);
  const low = Math.min(r, g, b);

  // Lift very dark primaries proportionally so the ambient radial aura reads clearly without shifting hue
  if (peak > 0 && peak < 168) {
    const boost = Math.min(2.35, 174 / peak);
    r = Math.min(235, Math.round(r * boost));
    g = Math.min(235, Math.round(g * boost));
    b = Math.min(235, Math.round(b * boost));
  }

  // If primary is near-neutral grey/brown, gently blend a hint of accent for distinct card character
  if (peak - low < 24) {
    const accent = parseHexColor(palette.accent);
    if (accent) {
      r = Math.round(r * 0.72 + accent[0] * 0.28);
      g = Math.round(g * 0.72 + accent[1] * 0.28);
      b = Math.round(b * 0.72 + accent[2] * 0.28);
    }
  }

  return `${r}, ${g}, ${b}`;
}

function computeStageAccentRgb(card) {
  const palette = card?.visual?.palette || {};
  const raw = parseHexColor(palette.accent) || parseHexColor(palette.foil) || [214, 162, 94];
  let [r, g, b] = raw;
  const peak = Math.max(r, g, b);
  if (peak > 0 && peak < 185) {
    const boost = Math.min(2.1, 192 / peak);
    r = Math.min(242, Math.round(r * boost));
    g = Math.min(242, Math.round(g * boost));
    b = Math.min(242, Math.round(b * boost));
  }
  return `${r}, ${g}, ${b}`;
}

function formatShortCardName(card) {
  const title = (card?.title || '').trim();
  if (!title) return '';
  if (card.cardType === 'bean_card') {
    return title.replace(
      /^(巴拿马|哥伦比亚|埃塞俄比亚|肯尼亚|巴西|印度尼西亚|印尼|中国云南)\s+/,
      '',
    );
  }
  const dotIdx = title.indexOf(' · ');
  if (dotIdx > 0) {
    return title.slice(0, dotIdx).trim();
  }
  return title;
}

function isEditableElement(target) {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function parseHashRoute(cardMap = CARD_MAP) {
  const raw = (window.location.hash || '').replace(/^#/, '').trim();
  if (!raw) return { cardId: null, view: null, comparePair: null };

  if (raw === 'quiz' || raw === 'view=quiz') {
    return { cardId: null, view: 'quiz', comparePair: null };
  }

  const params = new URLSearchParams(raw);
  const paramCompare = params.get('compare');
  if (paramCompare) {
    const [a, b] = paramCompare.split(',').map((s) => s.trim());
    const validA = a && cardMap[a]?.cardType === 'bean_card' ? a : null;
    const validB = b && cardMap[b]?.cardType === 'bean_card' ? b : null;
    return {
      cardId: null,
      view: 'compare',
      comparePair: validA || validB ? [validA, validB] : null,
    };
  }

  const paramCard = params.get('card');
  const paramView = params.get('view');
  if (paramCard || paramView) {
    const view =
      paramView === 'gallery'
        ? 'gallery'
        : paramView === 'compare'
          ? 'compare'
          : paramView === 'quiz'
            ? 'quiz'
            : paramView === 'stage'
              ? 'stage'
              : null;
    return {
      cardId: paramCard && cardMap[paramCard] ? paramCard : null,
      view,
      comparePair: null,
    };
  }

  if (cardMap[raw]) {
    return { cardId: raw, view: null, comparePair: null };
  }
  return { cardId: null, view: null, comparePair: null };
}

function writeHash(nextHash) {
  if (!nextHash || window.location.hash === nextHash) return;
  try {
    window.history.replaceState(null, '', nextHash);
  } catch {
    // Ignore restricted history mutations in sandboxed/file origins
  }
}

function writeHashCard(cardId) {
  if (!cardId) return;
  writeHash(`#card=${encodeURIComponent(cardId)}`);
}

function writeHashCompare(idA, idB) {
  if (!idA || !idB) return;
  writeHash(`#compare=${encodeURIComponent(idA)},${encodeURIComponent(idB)}`);
}

function createToastManager(regionEl) {
  let timer = null;
  return function showToast(message, durationMs = 2400) {
    if (!regionEl || !message) return;
    clearTimeout(timer);
    regionEl.innerHTML = '';
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.textContent = message;
    regionEl.appendChild(item);
    timer = setTimeout(() => {
      item.remove();
    }, durationMs);
  };
}

function initApp() {
  const appEl = document.getElementById('app');
  const deckCountEl = document.getElementById('deck-total-count');
  const brandHomeBtn = document.getElementById('brand-home');
  const tabStageBtn = document.getElementById('tab-stage');
  const tabGalleryBtn = document.getElementById('tab-gallery');
  const tabCompareBtn = document.getElementById('tab-compare');
  const btnDrawerToggle = document.getElementById('btn-drawer-toggle');
  const btnResetView = document.getElementById('btn-reset-view');
  const btnExportPoster = document.getElementById('btn-export-poster');
  const btnGalleryQuick = document.getElementById('btn-gallery-quick');
  const btnGalleryLabel = document.getElementById('btn-gallery-label');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnThemeLabel = document.getElementById('btn-theme-label');
  const metaThemeColorEl = document.getElementById('meta-theme-color');

  const stageViewEl = document.getElementById('stage-view');
  const stageBendingHostEl = document.getElementById('stage-bending-host');
  const stageHostEl = document.getElementById('stage-canvas-host');
  const stageCursorEl = document.getElementById('stage-cursor');
  const btnStagePrev = document.getElementById('btn-stage-prev');
  const btnStageNext = document.getElementById('btn-stage-next');
  const stagePrevTipEl = document.getElementById('stage-prev-tip');
  const stageNextTipEl = document.getElementById('stage-next-tip');
  const stageLoadingEl = document.getElementById('stage-loading');
  const gestureHintEl = document.getElementById('stage-gesture-hint');
  const stageHudMountEl = document.getElementById('stage-hud-mount');

  const galleryViewEl = document.getElementById('gallery-view');
  const compareViewEl = document.getElementById('compare-view');
  const quizViewEl = document.getElementById('quiz-view');
  const drawerEl = document.getElementById('reading-drawer');
  const drawerScrimEl = document.getElementById('drawer-scrim');
  const toastRegionEl = document.getElementById('toast-region');

  const posterModalEl = document.getElementById('poster-modal');
  const posterBackdropEl = document.getElementById('poster-modal-backdrop');
  const posterCloseBtn = document.getElementById('poster-modal-close');
  const posterDismissBtn = document.getElementById('poster-dismiss-btn');
  const posterMetaEl = document.getElementById('poster-modal-meta');
  const posterImgEl = document.getElementById('poster-preview-img');
  const posterRedrawMaskEl = document.getElementById('poster-redraw-mask');
  const posterDownloadBtn = document.getElementById('poster-download-btn');
  const posterFlipBtn = document.getElementById('poster-flip-btn');
  const posterFlipLabelEl = document.getElementById('poster-flip-label');

  const helpModalEl = document.getElementById('help-modal');
  const helpBackdropEl = document.getElementById('help-modal-backdrop');
  const helpCloseBtn = document.getElementById('help-modal-close');
  const helpDismissBtn = document.getElementById('help-dismiss-btn');

  if (!ALL_CARDS || ALL_CARDS.length === 0) {
    console.error('[Coffee-Atlas-3D] No cards available in deck-index.js');
    return;
  }

  let customBeans = loadCustomBeans();
  let activeCards = [...ALL_CARDS, ...customBeans];
  let activeCardMap = Object.fromEntries(activeCards.map((c) => [c.id, c]));
  let activeDeckMeta = buildDeckMeta(activeCards);

  if (deckCountEl) {
    deckCountEl.textContent = String(activeCards.length);
  }

  const showToast = createToastManager(toastRegionEl);
  const mobileMq = window.matchMedia('(max-width: 960px)');
  const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerMq = window.matchMedia('(hover: hover) and (pointer: fine)');

  const initialRoute = parseHashRoute(activeCardMap);
  const defaultCard =
    (initialRoute.cardId && activeCardMap[initialRoute.cardId]) ||
    activeCardMap['ca-01-esmeralda-green'] ||
    activeCardMap['sa-01-macarena-rum'] ||
    activeCards[0];

  let currentTheme = loadSavedTheme();
  let currentView = initialRoute.view || 'stage';
  let stageMode = initialRoute.cardId ? 'focus' : 'bending';
  let currentCard = defaultCard;
  let lastStageLoadedCardId = null;
  let drawerOpen = false;
  let posterModalOpen = false;
  let helpModalOpen = false;
  let currentPosterData = null;
  let posterRedrawToken = 0;
  let gestureHintDismissed = false;
  let loadRequestToken = 0;

  function dismissGestureHint() {
    if (gestureHintDismissed || !gestureHintEl) return;
    gestureHintDismissed = true;
    gestureHintEl.classList.add('is-dismissed');
  }

  // 1. Mount 3D Holographic Stage (Maximized Single Card Mode)
  const stage = createHoloStage(stageHostEl, {
    onStateChange(state) {
      stageHud.syncState(state);
    },
    onFlipChange() {
      dismissGestureHint();
    },
    onSingleClick() {
      if (
        currentView === 'stage' &&
        stageMode === 'focus' &&
        !posterModalOpen &&
        !helpModalOpen &&
        !beanStudio.isOpen() &&
        !stageHud.isPopoverOpen()
      ) {
        dismissGestureHint();
        setStageMode('bending');
      }
    },
    onLoadStart() {
      if (stageLoadingEl && stageMode === 'focus') stageLoadingEl.hidden = false;
    },
    onLoadComplete(card) {
      if (stageLoadingEl) stageLoadingEl.hidden = true;
      if (card?.id) lastStageLoadedCardId = card.id;
      stageHud.syncState(stage.getState());
    },
    onFallback() {
      showToast('当前环境未启用 WebGL，已自动切换为 CSS 3D 视差模式', 3200);
    },
    onNotice(msg) {
      showToast(msg);
    },
    onError(err) {
      if (stageLoadingEl) stageLoadingEl.hidden = true;
      console.error('[Coffee-Atlas-3D] Stage error:', err);
      showToast('卡面纹理加载遇到异常，已尝试自动恢复');
    },
  });

  // 1.5 Mount Bright Luminous WebGL Bending Gallery directly on 3D Stage
  const bendingGallery = createBendingGallery(stageBendingHostEl, {
    onCenterChange(card) {
      if (!card || stageMode !== 'bending') return;
      currentCard = card;
      applyStageGlow(card);
      updateStageEdgeNav();
      stageHud.setCard(card);
      readingDrawer.setCard(card);
      galleryView.setActiveCard(card.id);
      if (currentView === 'stage') {
        document.title = `${card.code} ${card.title} · 焙境图鉴`;
      }
    },
    onSelectCard(card) {
      if (!card) return;
      dismissGestureHint();
      selectCard(card.id, {
        switchToStage: true,
        targetStageMode: 'focus',
        keepDrawer: drawerOpen,
      });
    },
  });
  bendingGallery.setCards(activeCards);

  // 2. Mount Bottom Floating Glass Stage HUD
  const stageHud = createStageHud(stageHudMountEl, {
    cards: activeCards,
    onPrev() {
      if (stageMode === 'bending') bendingGallery.stepBy(-1);
      else stepCard(-1);
    },
    onNext() {
      if (stageMode === 'bending') bendingGallery.stepBy(1);
      else stepCard(1);
    },
    onToggleStageMode() {
      dismissGestureHint();
      if (stageMode === 'bending') {
        const centered = bendingGallery.getCenteredCard() || currentCard;
        selectCard(centered.id, { switchToStage: true, targetStageMode: 'focus', keepDrawer: drawerOpen });
      } else {
        setStageMode('bending');
      }
    },
    onSelectCard(cardId) {
      selectCard(cardId, { switchToStage: true, targetStageMode: 'focus', keepDrawer: drawerOpen });
    },
    onOpenDrawer() {
      setDrawerOpen(true);
    },
    onSetFlipped(flipped) {
      dismissGestureHint();
      stage.setFlipped(flipped);
      stageHud.syncState(stage.getState());
    },
    onSetFinish(finish) {
      stage.setFinish(finish);
      stageHud.syncState(stage.getState());
    },
    onSetFoil(val) {
      stage.setFoil(val);
    },
    onSetParam(key, val) {
      stage.setParam(key, val);
    },
    onSetRelief(enabled) {
      stage.setRelief(enabled);
      stageHud.syncState(stage.getState());
    },
    onSetAutoPlay(enabled) {
      stage.setAutoPlay(enabled);
      stageHud.syncState(stage.getState());
    },
    onResetView() {
      stage.resetView();
      stageHud.syncState(stage.getState());
      showToast('已复位 3D 展台视角');
    },
    onResetParams(card) {
      const target = card || currentCard;
      const d = target?.visual?.depths || {};
      const defaults = {
        subjectScale: d.subjectScale ?? 1.0,
        subjectDepth: d.subjectDepth ?? 0.35,
        effectsDepth: d.effectsDepth ?? 0.5,
        backgroundDepth: d.backgroundDepth ?? -0.25,
      };
      Object.entries(defaults).forEach(([k, v]) => stage.setParam(k, v));
      stage.setRelief(false);
      stageHud.syncState(stage.getState());
      showToast('已恢复本卡默认景深参数');
    },
    onExportPoster() {
      triggerExportPoster();
    },
    onOpenHelp() {
      openHelpModal();
    },
  });

  // 3. Mount Right Reading Drawer
  const readingDrawer = createReadingDrawer(drawerEl, drawerScrimEl, {
    cardMap: activeCardMap,
    onClose() {
      setDrawerOpen(false);
    },
    onSelectCard(cardId) {
      selectCard(cardId, { switchToStage: true, keepDrawer: true });
    },
    onComparePair(idA, idB) {
      openCompare(idA, idB);
    },
    onEditCustomBean(card) {
      stageCursorCtrl.hide();
      beanStudio.open(card);
    },
    onDeleteCustomBean(cardId) {
      deleteCustomBean(cardId);
    },
    onCopySuccess(msg) {
      showToast(msg);
    },
  });

  const initialMastery = loadMasteryState();

  // 4. Mount 36+ Card Gallery Wall
  const galleryView = createGalleryView(galleryViewEl, {
    cards: activeCards,
    deckGroups: activeDeckMeta.deckGroups,
    filterFacets: activeDeckMeta.filterFacets,
    masteredIds: initialMastery.mastered,
    onSelectCard(cardId) {
      selectCard(cardId, { switchToStage: true, keepDrawer: false });
    },
    onOpenQuiz() {
      setView('quiz');
    },
    onAddBean() {
      beanStudio.open();
    },
  });

  // 4.5 Mount Dual-Bean Compare Lab
  const compareView = createCompareView(compareViewEl, {
    cards: activeCards,
    onInspectCard(cardId) {
      selectCard(cardId, { switchToStage: true, keepDrawer: false });
    },
    onPairChange(idA, idB) {
      if (currentView === 'compare') {
        writeHashCompare(idA, idB);
      }
    },
  });

  if (initialRoute.comparePair) {
    const [initA, initB] = initialRoute.comparePair;
    compareView.setPair(initA, initB, false);
  }

  // 4.6 Mount Flashcard Quiz View
  const quizView = createQuizView(quizViewEl, {
    cards: activeCards,
    cardMap: activeCardMap,
    onExitToGallery() {
      setView('gallery');
    },
    onInspectCard(cardId) {
      selectCard(cardId, { switchToStage: true, keepDrawer: false });
    },
    onMasteryChange(stats) {
      galleryView.setMasteredIds(stats.masteredIds);
    },
  });

  // 4.7 Mount My Bean Studio (Custom Bean Creator / Editor / JSON Backup)
  function syncActiveDeck(invalidateIds = []) {
    activeCards = [...ALL_CARDS, ...customBeans];
    activeCardMap = Object.fromEntries(activeCards.map((c) => [c.id, c]));
    activeDeckMeta = buildDeckMeta(activeCards);

    for (const id of invalidateIds) {
      invalidateCardThumb?.(id);
      stage.invalidateCard?.(id);
    }

    if (deckCountEl) {
      deckCountEl.textContent = String(activeCards.length);
    }

    galleryView.setDeck({
      cards: activeCards,
      deckGroups: activeDeckMeta.deckGroups,
      filterFacets: activeDeckMeta.filterFacets,
      invalidateIds,
    });
    bendingGallery.setCards(activeCards, { invalidateIds });
    stageHud.setDeck(activeCards);
    compareView.setCards(activeCards, invalidateIds);
    readingDrawer.setCardMap(activeCardMap);
    updateStageEdgeNav();
  }

  function deleteCustomBean(cardId) {
    const target = customBeans.find((b) => b.id === cardId);
    if (!target) return;
    customBeans = customBeans.filter((b) => b.id !== cardId);
    saveCustomBeans(customBeans);
    syncActiveDeck([cardId]);
    showToast(`已删除自定义豆卡「${target.code} ${target.title}」`);

    if (currentCard?.id === cardId) {
      setDrawerOpen(false);
      const fallback = activeCardMap['ca-01-esmeralda-green'] || activeCards[0];
      if (fallback) {
        selectCard(fallback.id, { switchToStage: currentView === 'stage', keepDrawer: false });
      }
    }
  }

  const beanStudio = createBeanStudio({
    getCustomBeans: () => customBeans,
    onSaveBean(savedCard, { isEdit }) {
      const idx = customBeans.findIndex((b) => b.id === savedCard.id);
      if (idx >= 0) {
        customBeans[idx] = savedCard;
      } else {
        customBeans = [...customBeans, savedCard];
      }
      const persisted = saveCustomBeans(customBeans);
      syncActiveDeck([savedCard.id]);
      if (!persisted) {
        showToast('本地存储空间不足，本次会话仍可预览 3D 闪卡');
      } else {
        showToast(`已${isEdit ? '更新' : '生成'}「${savedCard.code} ${savedCard.title}」3D 全息闪卡`);
      }
      selectCard(savedCard.id, { switchToStage: true, keepDrawer: false });
    },
    onImportBeans(mergedBeans, { addedCount, updatedCount }) {
      const changedIds = mergedBeans.map((b) => b.id);
      customBeans = mergedBeans;
      const persisted = saveCustomBeans(customBeans);
      syncActiveDeck(changedIds);
      if (!persisted) {
        showToast('导入数据过大，部分未能写入本地缓存');
      } else {
        showToast(`已导入自定义豆单（新增 ${addedCount}，更新 ${updatedCount}）`);
      }
    },
    onNotice(msg) {
      showToast(msg);
    },
  });

  // 5. Dual iOS Liquid Glass Theme System (Bright Porcelain Glass default / Smoked Darkroom Glass)
  function applyStageGlow(card) {
    const rgb = computeStageGlowRgb(card);
    const accentRgb = computeStageAccentRgb(card);
    document.documentElement.style.setProperty('--stage-glow-rgb', rgb);
    document.documentElement.style.setProperty('--stage-glow-accent-rgb', accentRgb);
  }

  function applyTheme(nextTheme, { persist = true, notify = false } = {}) {
    const normalized = nextTheme === 'dark' ? 'dark' : 'light';
    currentTheme = normalized;
    document.documentElement.dataset.theme = normalized;

    if (metaThemeColorEl) {
      metaThemeColorEl.setAttribute('content', normalized === 'light' ? '#EFF2F7' : '#161210');
    }

    if (btnThemeToggle) {
      const isLight = normalized === 'light';
      btnThemeToggle.setAttribute('aria-pressed', String(!isLight));
      btnThemeToggle.setAttribute(
        'aria-label',
        isLight ? '切换暗房玻璃深色模式' : '切换亮境玻璃浅色模式',
      );
      btnThemeToggle.title = isLight
        ? '切换暗房玻璃深色展台 (T)'
        : '切换亮境玻璃浅色展台 (T)';
    }
    if (btnThemeLabel) {
      btnThemeLabel.textContent = normalized === 'light' ? '暗房' : '亮境';
    }

    if (persist) {
      saveTheme(normalized);
    }

    stage.setTheme?.(normalized);
    compareView.redraw?.();
    galleryView.refreshTheme?.();

    if (posterModalOpen && typeof stage.exportPoster === 'function') {
      const redrawToken = ++posterRedrawToken;
      Promise.resolve()
        .then(() => stage.exportPoster({ download: false, theme: normalized }))
        .then((raw) => {
          if (redrawToken !== posterRedrawToken || !posterModalOpen) return;
          const data = normalizePosterResult(raw);
          if (data) updatePosterModalContent(data);
        })
        .catch(() => {});
    }

    if (notify) {
      showToast(
        normalized === 'light'
          ? '已切换至「亮境玻璃」浅色展台'
          : '已切换至「暗房玻璃」深色展台',
      );
    }
  }

  function toggleTheme() {
    applyTheme(currentTheme === 'light' ? 'dark' : 'light', { persist: true, notify: true });
  }

  // 5.5 Floating Stage Edge Prev/Next Arrows
  function updateStageEdgeNav() {
    if (!activeCards.length) return;
    const idx = activeCards.findIndex((c) => c.id === currentCard?.id);
    const base = idx >= 0 ? idx : 0;
    const prevCard = activeCards[(base - 1 + activeCards.length) % activeCards.length];
    const nextCard = activeCards[(base + 1) % activeCards.length];

    if (prevCard && stagePrevTipEl && btnStagePrev) {
      const label = `上一张 · ${prevCard.code} ${formatShortCardName(prevCard)}`;
      stagePrevTipEl.textContent = label;
      btnStagePrev.setAttribute('aria-label', label);
    }
    if (nextCard && stageNextTipEl && btnStageNext) {
      const label = `下一张 · ${nextCard.code} ${formatShortCardName(nextCard)}`;
      stageNextTipEl.textContent = label;
      btnStageNext.setAttribute('aria-label', label);
    }
  }

  // 5.8 Desktop Custom Minimalist Ring Cursor over #stage-canvas-host
  const stageCursorCtrl = (() => {
    if (!stageCursorEl || !stageHostEl) {
      return { hide() {} };
    }
    let active = false;
    let pressed = false;
    let pointerX = -999;
    let pointerY = -999;
    let rafId = 0;

    function canShow() {
      return (
        finePointerMq.matches &&
        currentView === 'stage' &&
        stageMode === 'focus' &&
        !posterModalOpen &&
        !helpModalOpen &&
        !beanStudio.isOpen()
      );
    }

    function paint() {
      rafId = 0;
      stageCursorEl.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
    }

    function schedulePaint() {
      if (!rafId) {
        rafId = requestAnimationFrame(paint);
      }
    }

    function hide() {
      if (!active && !pressed) return;
      active = false;
      pressed = false;
      stageCursorEl.classList.remove('is-visible', 'is-pressed');
      stageHostEl.classList.remove('has-custom-cursor');
    }

    stageHostEl.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !canShow()) {
        hide();
        return;
      }
      pointerX = e.clientX;
      pointerY = e.clientY;
      active = true;
      stageHostEl.classList.add('has-custom-cursor');
      stageCursorEl.classList.add('is-visible');
      schedulePaint();
    });

    stageHostEl.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'mouse' || !canShow()) {
          hide();
          return;
        }
        pointerX = e.clientX;
        pointerY = e.clientY;
        if (!active) {
          active = true;
          stageHostEl.classList.add('has-custom-cursor');
          stageCursorEl.classList.add('is-visible');
        }
        schedulePaint();
      },
      { passive: true },
    );

    stageHostEl.addEventListener('pointerleave', () => {
      if (!pressed) {
        hide();
      }
    });

    stageHostEl.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || !canShow()) {
        hide();
        return;
      }
      pointerX = e.clientX;
      pointerY = e.clientY;
      pressed = true;
      active = true;
      stageHostEl.classList.add('has-custom-cursor');
      stageCursorEl.classList.add('is-visible', 'is-pressed');
      schedulePaint();
    });

    window.addEventListener(
      'pointermove',
      (e) => {
        if (!pressed || e.pointerType !== 'mouse') return;
        pointerX = e.clientX;
        pointerY = e.clientY;
        schedulePaint();
      },
      { passive: true },
    );

    const releasePress = (e) => {
      if (!pressed) return;
      pressed = false;
      stageCursorEl.classList.remove('is-pressed');
      if (e && e.target && !stageHostEl.contains(e.target)) {
        hide();
      }
    };

    window.addEventListener('pointerup', releasePress);
    window.addEventListener('pointercancel', releasePress);
    window.addEventListener('blur', hide);
    finePointerMq.addEventListener('change', (ev) => {
      if (!ev.matches) hide();
    });

    return { hide };
  })();

  // 6. Core View, Stage Mode (Bending Gallery <-> Maximized 3D Focus), Drawer & Card State Orchestration
  function syncDrawerShift() {
    const shiftDesktop = drawerOpen && currentView === 'stage' && !mobileMq.matches;
    appEl.classList.toggle('is-drawer-open', shiftDesktop);
    stage.setDrawerShift(shiftDesktop);
    bendingGallery.setDrawerShift(shiftDesktop);
  }

  function setStageMode(nextMode, { immediateCenter = true, skipLoad = false } = {}) {
    const normalized = nextMode === 'focus' ? 'focus' : 'bending';
    stageMode = normalized;
    if (stageViewEl) {
      stageViewEl.dataset.stageMode = stageMode;
    }
    stageHud.setStageMode(stageMode);

    const inStage = currentView === 'stage';
    if (!inStage) {
      bendingGallery.setVisible(false);
      stage.setPaused?.(true);
      return;
    }

    if (stageMode === 'bending') {
      stageCursorCtrl.hide();
      stageHud.closePopover();
      stage.setPaused?.(true);
      if (stageLoadingEl) stageLoadingEl.hidden = true;
      if (currentCard?.id) {
        bendingGallery.centerOnCardId(currentCard.id, { immediate: immediateCenter });
      }
      bendingGallery.setVisible(true);
    } else {
      bendingGallery.setVisible(false);
      stage.setPaused?.(false);
      if (!skipLoad && currentCard && lastStageLoadedCardId !== currentCard.id) {
        const token = ++loadRequestToken;
        stage
          .loadCard(currentCard)
          .then(() => {
            if (token === loadRequestToken) {
              lastStageLoadedCardId = currentCard.id;
              stageHud.syncState(stage.getState());
            }
          })
          .catch(() => {});
      }
      requestAnimationFrame(() => {
        stage.resize?.();
        syncDrawerShift();
      });
    }
  }

  function setDrawerOpen(nextOpen) {
    drawerOpen = Boolean(nextOpen);
    readingDrawer.setOpen(drawerOpen);
    btnDrawerToggle?.classList.toggle('is-active', drawerOpen);
    btnDrawerToggle?.setAttribute('aria-expanded', String(drawerOpen));
    syncDrawerShift();
  }

  function setView(nextView, { updateHash = true } = {}) {
    if (
      nextView !== 'stage' &&
      nextView !== 'gallery' &&
      nextView !== 'compare' &&
      nextView !== 'quiz'
    ) {
      return;
    }
    currentView = nextView;
    appEl.dataset.view = currentView;

    const inStage = currentView === 'stage';
    const inGallery = currentView === 'gallery';
    const inCompare = currentView === 'compare';
    const inQuiz = currentView === 'quiz';

    stageViewEl.hidden = !inStage;
    galleryViewEl.hidden = !inGallery;
    compareViewEl.hidden = !inCompare;
    if (quizViewEl) quizViewEl.hidden = !inQuiz;

    tabStageBtn?.classList.toggle('is-active', inStage);
    tabStageBtn?.setAttribute('aria-selected', String(inStage));
    tabGalleryBtn?.classList.toggle('is-active', inGallery);
    tabGalleryBtn?.setAttribute('aria-selected', String(inGallery));
    tabCompareBtn?.classList.toggle('is-active', inCompare);
    tabCompareBtn?.setAttribute('aria-selected', String(inCompare));

    if (btnGalleryQuick) {
      btnGalleryQuick.classList.toggle('is-active', inGallery);
    }
    if (btnGalleryLabel) {
      btnGalleryLabel.textContent = inGallery ? '展台' : '图鉴';
    }

    if (inStage) {
      document.title = `${currentCard.code} ${currentCard.title} · 焙境图鉴`;
      if (updateHash && stageMode === 'focus') writeHashCard(currentCard.id);
      setStageMode(stageMode, { immediateCenter: true });
    } else if (inGallery) {
      stageCursorCtrl.hide();
      stageHud.closePopover();
      closePosterModal();
      bendingGallery.setVisible(false);
      stage.setPaused?.(true);
      if (drawerOpen) setDrawerOpen(false);
      document.title = '全套图鉴 · 焙境图鉴';
      if (updateHash) writeHash('#view=gallery');
      galleryView.onShow();
    } else if (inCompare) {
      stageCursorCtrl.hide();
      stageHud.closePopover();
      closePosterModal();
      bendingGallery.setVisible(false);
      stage.setPaused?.(true);
      if (drawerOpen) setDrawerOpen(false);
      document.title = '双豆对比实验室 · 焙境图鉴';
      const { beanAId, beanBId } = compareView.getPair();
      if (updateHash) writeHashCompare(beanAId, beanBId);
      compareView.onShow();
    } else if (inQuiz) {
      stageCursorCtrl.hide();
      stageHud.closePopover();
      closePosterModal();
      bendingGallery.setVisible(false);
      stage.setPaused?.(true);
      if (drawerOpen) setDrawerOpen(false);
      document.title = '品鉴官闪卡盲测 · 焙境图鉴';
      if (updateHash) writeHash('#quiz');
      quizView.onShow();
    }
  }

  function openCompare(idA, idB, { updateHash = true } = {}) {
    if (idA || idB) {
      compareView.setPair(idA, idB, false);
    }
    setView('compare', { updateHash });
  }

  async function selectCard(cardId, opts = {}) {
    const {
      switchToStage = false,
      targetStageMode = null,
      keepDrawer = drawerOpen,
      updateHash = true,
    } = opts;

    const card = activeCardMap[cardId];
    if (!card) return;

    currentCard = card;
    applyStageGlow(card);
    updateStageEdgeNav();

    if (currentView === 'stage' || switchToStage) {
      document.title = `${card.code} ${card.title} · 焙境图鉴`;
    }

    stageHud.setCard(card);
    readingDrawer.setCard(card);
    galleryView.setActiveCard(card.id);
    bendingGallery.centerOnCardId(card.id, { immediate: stageMode !== 'bending' });

    const nextMode = targetStageMode || (switchToStage ? 'focus' : stageMode);
    if (nextMode !== stageMode) {
      stageMode = nextMode;
    }

    if (updateHash && stageMode === 'focus') {
      writeHashCard(card.id);
    }

    if (switchToStage && currentView !== 'stage') {
      setView('stage');
    } else if (currentView === 'stage') {
      setStageMode(stageMode, { immediateCenter: true, skipLoad: stageMode === 'focus' });
    }

    if (keepDrawer !== drawerOpen) {
      setDrawerOpen(keepDrawer);
    }

    if (stageMode !== 'focus') {
      return;
    }

    const token = ++loadRequestToken;
    try {
      await stage.loadCard(card);
      if (token === loadRequestToken) {
        lastStageLoadedCardId = card.id;
        stageHud.syncState(stage.getState());
      }
    } catch (err) {
      if (token === loadRequestToken) {
        console.error('[Coffee-Atlas-3D] Failed to load card:', card.id, err);
        showToast(`加载「${card.title}」时遇到问题`);
      }
    }
  }

  function stepCard(delta) {
    const idx = activeCards.findIndex((c) => c.id === currentCard.id);
    const base = idx >= 0 ? idx : 0;
    const nextIdx = (base + delta + activeCards.length) % activeCards.length;
    selectCard(activeCards[nextIdx].id, {
      switchToStage: false,
      keepDrawer: drawerOpen,
    });
  }

  // 7. Wire Masthead & Viewport Listeners
  brandHomeBtn?.addEventListener('click', () => {
    setView('stage');
    stage.resetView();
  });

  tabStageBtn?.addEventListener('click', () => setView('stage'));
  tabGalleryBtn?.addEventListener('click', () => setView('gallery'));
  tabCompareBtn?.addEventListener('click', () => setView('compare'));

  btnDrawerToggle?.addEventListener('click', () => {
    if (currentView !== 'stage') {
      setView('stage');
      setDrawerOpen(true);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  });

  function closePosterModal() {
    posterRedrawToken++;
    posterModalOpen = false;
    if (posterModalEl) posterModalEl.hidden = true;
    if (posterRedrawMaskEl) posterRedrawMaskEl.hidden = true;
    if (posterFlipBtn) posterFlipBtn.disabled = false;
  }

  function openHelpModal() {
    stageCursorCtrl.hide();
    helpModalOpen = true;
    if (helpModalEl) helpModalEl.hidden = false;
    helpDismissBtn?.focus();
  }

  function closeHelpModal() {
    helpModalOpen = false;
    if (helpModalEl) helpModalEl.hidden = true;
  }

  function normalizePosterResult(result) {
    if (!result) return null;
    if (typeof result === 'string') {
      const flipped = Boolean(stage.getState().flipped);
      return {
        dataUrl: result,
        filename: `${currentCard?.code || 'coffee-card'}-${flipped ? 'back' : 'front'}.png`,
        width: 1400,
        height: 1800,
      };
    }
    if (typeof result === 'object' && result.dataUrl) {
      return {
        dataUrl: result.dataUrl,
        filename: result.filename || `${currentCard?.code || 'coffee-card'}-poster.png`,
        width: result.width || 1400,
        height: result.height || 1800,
      };
    }
    return null;
  }

  function updatePosterModalContent(posterData) {
    currentPosterData = posterData;
    const flipped = Boolean(stage.getState().flipped);
    if (posterImgEl && posterData?.dataUrl) {
      posterImgEl.src = posterData.dataUrl;
      posterImgEl.alt = `${currentCard?.title || '咖啡图鉴'} ${flipped ? '背面' : '正面'} 典藏海报预览`;
    }
    if (posterMetaEl && posterData) {
      posterMetaEl.textContent = `${posterData.filename} · ${posterData.width} × ${posterData.height}`;
    }
    if (posterFlipLabelEl) {
      posterFlipLabelEl.textContent = flipped ? '切换正面重绘' : '切换背面重绘';
    }
  }

  function waitForFlipSettle(targetFlipped) {
    return new Promise((resolve) => {
      const root = window.__holo?.root;
      if (!root?.rotation || reducedMotionMq.matches) {
        setTimeout(resolve, 45);
        return;
      }
      const targetY = targetFlipped ? Math.PI : 0;
      const start = performance.now();
      const maxWaitMs = 640;

      function check() {
        const diff = Math.abs(root.rotation.y - targetY);
        if (diff < 0.022 || performance.now() - start >= maxWaitMs) {
          requestAnimationFrame(resolve);
          return;
        }
        requestAnimationFrame(check);
      }
      requestAnimationFrame(check);
    });
  }

  async function openPosterModal() {
    stageCursorCtrl.hide();
    if (typeof stage.exportPoster !== 'function') {
      showToast('当前渲染模式暂不支持海报导出');
      return null;
    }
    try {
      const raw = await stage.exportPoster({ download: false });
      const data = normalizePosterResult(raw);
      if (!data) {
        showToast('海报渲染失败，请重试');
        return null;
      }
      updatePosterModalContent(data);
      posterModalOpen = true;
      if (posterModalEl) posterModalEl.hidden = false;
      if (posterRedrawMaskEl) posterRedrawMaskEl.hidden = true;
      posterDownloadBtn?.focus();
      return data;
    } catch (err) {
      console.error('[Coffee-Atlas-3D] Open poster preview failed:', err);
      showToast('海报渲染失败，请重试');
      return null;
    }
  }

  async function flipAndRedrawPoster() {
    if (!posterModalOpen || typeof stage.exportPoster !== 'function') return;
    const token = ++posterRedrawToken;
    const targetFlipped = !Boolean(stage.getState().flipped);

    if (posterRedrawMaskEl) posterRedrawMaskEl.hidden = false;
    if (posterFlipBtn) posterFlipBtn.disabled = true;

    dismissGestureHint();
    stage.setFlipped(targetFlipped);
    stageHud.syncState(stage.getState());

    await waitForFlipSettle(targetFlipped);
    if (token !== posterRedrawToken || !posterModalOpen) return;

    try {
      const raw = await stage.exportPoster({ download: false });
      if (token !== posterRedrawToken || !posterModalOpen) return;
      const data = normalizePosterResult(raw);
      if (data) {
        updatePosterModalContent(data);
      } else {
        showToast('海报重绘失败，请重试');
      }
    } catch (err) {
      console.error('[Coffee-Atlas-3D] Poster flip redraw failed:', err);
      showToast('海报重绘失败，请重试');
    } finally {
      if (token === posterRedrawToken) {
        if (posterRedrawMaskEl) posterRedrawMaskEl.hidden = true;
        if (posterFlipBtn) posterFlipBtn.disabled = false;
      }
    }
  }

  function downloadCurrentPoster() {
    if (!currentPosterData?.dataUrl) return;
    const link = document.createElement('a');
    link.download = currentPosterData.filename;
    link.href = currentPosterData.dataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`已导出 1400×1800 典藏海报 PNG（${currentPosterData.filename}）`);
  }

  async function triggerExportPoster({ preview = true } = {}) {
    if (preview) {
      return openPosterModal();
    }
    if (typeof stage.exportPoster !== 'function') {
      showToast('当前渲染模式暂不支持海报导出');
      return null;
    }
    try {
      const raw = await stage.exportPoster({ download: true });
      const data = normalizePosterResult(raw);
      if (data) {
        showToast('已导出 1400×1800 典藏海报 PNG');
      }
      return data;
    } catch (err) {
      console.error('[Coffee-Atlas-3D] Export poster failed:', err);
      showToast('海报导出失败，请重试');
      return null;
    }
  }

  posterBackdropEl?.addEventListener('click', closePosterModal);
  posterCloseBtn?.addEventListener('click', closePosterModal);
  posterDismissBtn?.addEventListener('click', closePosterModal);
  posterDownloadBtn?.addEventListener('click', downloadCurrentPoster);
  posterFlipBtn?.addEventListener('click', flipAndRedrawPoster);

  helpBackdropEl?.addEventListener('click', closeHelpModal);
  helpCloseBtn?.addEventListener('click', closeHelpModal);
  helpDismissBtn?.addEventListener('click', closeHelpModal);

  btnResetView?.addEventListener('click', () => {
    stage.resetView();
    stageHud.syncState(stage.getState());
    showToast('已复位 3D 展台视角');
  });

  btnExportPoster?.addEventListener('click', async () => {
    if (stageMode === 'bending') {
      await selectCard(currentCard.id, { switchToStage: true, targetStageMode: 'focus', keepDrawer: drawerOpen });
    }
    openPosterModal();
  });

  btnGalleryQuick?.addEventListener('click', () => {
    setView(currentView === 'gallery' ? 'stage' : 'gallery');
  });

  btnThemeToggle?.addEventListener('click', () => {
    toggleTheme();
  });

  btnStagePrev?.addEventListener('click', () => {
    if (stageMode === 'bending') bendingGallery.stepBy(-1);
    else stepCard(-1);
  });

  btnStageNext?.addEventListener('click', () => {
    if (stageMode === 'bending') bendingGallery.stepBy(1);
    else stepCard(1);
  });

  stageHostEl?.addEventListener('pointerdown', dismissGestureHint, { passive: true });
  stageBendingHostEl?.addEventListener('pointerdown', dismissGestureHint, { passive: true });

  mobileMq.addEventListener('change', () => {
    readingDrawer.setOpen(drawerOpen);
    syncDrawerShift();
  });

  window.addEventListener('hashchange', () => {
    const route = parseHashRoute(activeCardMap);
    if (route.view === 'compare') {
      if (route.comparePair) {
        compareView.setPair(route.comparePair[0], route.comparePair[1], false);
      }
      if (currentView !== 'compare') setView('compare', { updateHash: false });
      return;
    }
    if (route.cardId && route.cardId !== currentCard.id) {
      selectCard(route.cardId, {
        switchToStage: route.view !== 'gallery',
        keepDrawer: drawerOpen,
        updateHash: false,
      });
    } else if (route.view && route.view !== currentView) {
      setView(route.view, { updateHash: false });
    }
  });

  // 8. Global Keyboard Shortcuts
  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isEditableElement(event.target)) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.target.blur();
        if (stageHud.isJumpOpen?.()) {
          stageHud.closeJump();
        }
        if (beanStudio.isOpen()) {
          beanStudio.close();
        }
      }
      return;
    }

    const key = event.key;
    const lower = key.toLowerCase();

    if (key === 'Escape') {
      if (helpModalOpen) {
        event.preventDefault();
        closeHelpModal();
        return;
      }
      if (beanStudio.isOpen()) {
        event.preventDefault();
        beanStudio.close();
        return;
      }
      if (posterModalOpen) {
        event.preventDefault();
        closePosterModal();
        return;
      }
      if (stageHud.isPopoverOpen()) {
        event.preventDefault();
        stageHud.closePopover();
        return;
      }
      if (drawerOpen) {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (currentView === 'quiz') {
        event.preventDefault();
        setView('gallery');
        return;
      }
      if (currentView === 'stage' && stageMode === 'focus') {
        event.preventDefault();
        setStageMode('bending');
        return;
      }
      if (currentView === 'gallery' || currentView === 'compare') {
        event.preventDefault();
        setView('stage');
      }
      return;
    }

    if (beanStudio.isOpen()) return;

    if (key === '?' || (key === '/' && event.shiftKey)) {
      event.preventDefault();
      if (helpModalOpen) closeHelpModal();
      else openHelpModal();
      return;
    }

    if (helpModalOpen) return;

    if (currentView === 'quiz' && quizView.handleKeyDown(event)) {
      return;
    }

    if (lower === 'k' || (key === '/' && !event.shiftKey)) {
      event.preventDefault();
      if (currentView !== 'stage') setView('stage');
      if (stageHud.isJumpOpen?.()) stageHud.closeJump();
      else stageHud.openJump?.();
      return;
    }

    if (lower === 't') {
      event.preventDefault();
      toggleTheme();
      return;
    }

    if (lower === 'n') {
      event.preventDefault();
      stageCursorCtrl.hide();
      requestAnimationFrame(() => beanStudio.open());
      return;
    }

    if (lower === 'q') {
      event.preventDefault();
      setView(currentView === 'quiz' ? 'gallery' : 'quiz');
      return;
    }

    if (lower === 'm') {
      event.preventDefault();
      if (currentView !== 'gallery') {
        setView('gallery');
        galleryView.setMapOpen(true);
      } else {
        galleryView.toggleMap();
      }
      return;
    }

    if (lower === 'g') {
      event.preventDefault();
      setView(currentView === 'gallery' ? 'stage' : 'gallery');
      return;
    }

    if (lower === 'c') {
      event.preventDefault();
      setView(currentView === 'compare' ? 'stage' : 'compare');
      return;
    }

    if (lower === 'i') {
      event.preventDefault();
      if (currentView !== 'stage') {
        setView('stage');
        setDrawerOpen(true);
      } else {
        setDrawerOpen(!drawerOpen);
      }
      return;
    }

    if (lower === 'f') {
      event.preventDefault();
      if (currentView !== 'stage') setView('stage');
      dismissGestureHint();
      if (stageMode === 'bending') {
        selectCard(currentCard.id, { switchToStage: true, targetStageMode: 'focus', keepDrawer: drawerOpen }).then(() => {
          stage.toggleFlip();
          stageHud.syncState(stage.getState());
        });
      } else {
        stage.toggleFlip();
        stageHud.syncState(stage.getState());
      }
      return;
    }

    if (lower === 'r') {
      if (currentView !== 'stage') return;
      event.preventDefault();
      if (stageMode === 'bending') {
        bendingGallery.centerOnCardId(activeCards[0]?.id);
        showToast('已复位弯曲画廊至首张图鉴');
      } else {
        stage.resetView();
        stageHud.syncState(stage.getState());
        showToast('已复位 3D 展台视角');
      }
      return;
    }

    if (lower === 's') {
      if (currentView !== 'stage') return;
      event.preventDefault();
      if (posterModalOpen) closePosterModal();
      else if (stageMode === 'bending') {
        selectCard(currentCard.id, { switchToStage: true, targetStageMode: 'focus', keepDrawer: drawerOpen }).then(() => {
          openPosterModal();
        });
      } else {
        openPosterModal();
      }
      return;
    }

    if (key === ' ') {
      if (currentView !== 'stage' || stageMode !== 'focus') return;
      // Avoid hijacking Space when focused on a button
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      event.preventDefault();
      const nextAuto = !stage.getState().auto;
      stage.setAutoPlay(nextAuto);
      stageHud.syncState(stage.getState());
      showToast(nextAuto ? '已开启自动微摆' : '已暂停自动微摆');
      return;
    }

    if (key === 'ArrowLeft') {
      if (currentView !== 'stage') return;
      event.preventDefault();
      if (stageMode === 'bending') bendingGallery.stepBy(-1);
      else stepCard(-1);
      return;
    }

    if (key === 'ArrowRight') {
      if (currentView !== 'stage') return;
      event.preventDefault();
      if (stageMode === 'bending') bendingGallery.stepBy(1);
      else stepCard(1);
    }
  });

  // Expose lightweight runtime inspection hook
  window.__atelier = {
    getView: () => currentView,
    setView,
    getTheme: () => currentTheme,
    setTheme: (theme) => applyTheme(theme, { persist: true, notify: false }),
    toggleTheme,
    getCardId: () => currentCard?.id,
    getCardCount: () => activeCards.length,
    getCustomBeans: () => [...customBeans],
    openBeanStudio: (card) => beanStudio.open(card || null),
    selectCard: (id) => selectCard(id, { switchToStage: true }),
    openCompare,
    getComparePair: () => compareView.getPair(),
    openQuiz: (mode) => {
      if (mode) quizView.startSession(mode);
      setView('quiz');
    },
    openTerroirMap: (regionId) => {
      setView('gallery');
      if (regionId) galleryView.selectMapRegion(regionId);
      else galleryView.setMapOpen(true);
    },
    getStageMode: () => stageMode,
    setStageMode: (mode) => setStageMode(mode),
    toggleTerroirMap: () => galleryView.toggleMap(),
    getMasteryStats: () => quizView.getMasteryStats(),
    openPosterModal,
    closePosterModal,
    isPosterModalOpen: () => posterModalOpen,
    openHelpModal,
    closeHelpModal,
    isHelpModalOpen: () => helpModalOpen,
    exportPoster: (opts) => triggerExportPoster(opts),
    setDrawerOpen,
    isDrawerOpen: () => drawerOpen,
  };

  // Boot Initial Experience
  applyTheme(currentTheme, { persist: false, notify: false });
  applyStageGlow(currentCard);
  updateStageEdgeNav();
  setView(currentView, { updateHash: Boolean(initialRoute.comparePair) });
  selectCard(currentCard.id, {
    switchToStage: false,
    keepDrawer: false,
    updateHash: Boolean(initialRoute.cardId) && currentView === 'stage',
  });

  // Gracefully auto-fade the stage gesture hint so the luminous glass viewport stays uncluttered
  window.setTimeout(() => {
    dismissGestureHint();
  }, 4500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
  initApp();
}
