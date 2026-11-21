/**
 * 3D 展台底栏控制与景深浮雕面板 (Stage HUD)
 * 暗房手冲吧台克制交互：切卡、正反翻转、4种全息质感、光泽度、4项景深与浮雕/微摆开关
 */

const FINISH_META = [
  { id: 'gold', label: '烫金', title: '烫金 · 香槟暖铜层压扫光' },
  { id: 'pearl', label: '珠光', title: '珠光 · 珍珠母贝柔滑虹彩' },
  { id: 'silver', label: '银箔', title: '银箔 · 高山冷泉清冽银光' },
  { id: 'original', label: '原画', title: '原画 · 素颜手工棉纸质感' },
];

const DEPTH_SLIDERS = [
  {
    key: 'subjectScale',
    label: '画面比例',
    min: 0.75,
    max: 1.35,
    step: 0.01,
    format: (v) => `${Number(v).toFixed(2)}×`,
  },
  {
    key: 'subjectDepth',
    label: '主体景深',
    min: 0,
    max: 0.8,
    step: 0.01,
    format: (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}`,
  },
  {
    key: 'effectsDepth',
    label: '粒子景深',
    min: 0,
    max: 0.9,
    step: 0.01,
    format: (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}`,
  },
  {
    key: 'backgroundDepth',
    label: '背景景深',
    min: -0.6,
    max: 0.2,
    step: 0.01,
    format: (v) => `${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(2)}`,
  },
];

function updateRangeFill(inputEl) {
  const min = Number(inputEl.min);
  const max = Number(inputEl.max);
  const val = Number(inputEl.value);
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  inputEl.style.setProperty('--pct', `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`);
}

export function createStageHud(mountEl, handlers = {}) {
  let popoverOpen = false;
  let currentCard = null;

  mountEl.innerHTML = `
    <div class="stage-hud" role="region" aria-label="3D 展台控制栏">
      <div class="hud-left">
        <div class="hud-nav-group">
          <button type="button" class="hud-icon-btn" id="hud-prev" aria-label="上一张卡片" title="上一张 (←)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button type="button" class="hud-icon-btn" id="hud-next" aria-label="下一张卡片" title="下一张 (→)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <button type="button" class="hud-card-meta" id="hud-card-trigger" title="点击展开本卡精读档案 (I)" style="text-align:left">
          <div class="hud-card-headline">
            <span class="hud-code-badge" id="hud-code">--</span>
            <h1 class="hud-card-title" id="hud-title">正在加载图鉴</h1>
          </div>
          <p class="hud-card-tagline" id="hud-tagline"></p>
        </button>
      </div>

      <div class="hud-center">
        <div class="face-segment" role="group" aria-label="正背面切换">
          <button type="button" class="face-btn is-active" id="hud-face-front" data-face="front" aria-pressed="true">正面</button>
          <button type="button" class="face-btn" id="hud-face-back" data-face="back" aria-pressed="false">背面</button>
        </div>
        <span class="face-indicator" id="hud-face-indicator">01 / 正面</span>
      </div>

      <div class="hud-right">
        <div class="finish-group" role="group" aria-label="卡面质感">
          <div class="finish-swatches" id="hud-finish-swatches">
            ${FINISH_META.map(
              (f) => `
                <button
                  type="button"
                  class="finish-swatch"
                  data-finish="${f.id}"
                  title="${f.title}"
                  aria-label="卡面质感：${f.label}"
                  aria-pressed="false"
                ></button>
              `,
            ).join('')}
          </div>
          <span class="finish-name" id="hud-finish-name">烫金</span>
        </div>

        <span class="hud-divider" aria-hidden="true"></span>

        <label class="foil-control" for="hud-foil-slider">
          <span class="foil-label">光泽</span>
          <input
            type="range"
            id="hud-foil-slider"
            class="atelier-range"
            min="0"
            max="100"
            step="1"
            value="65"
            aria-label="卡面光泽度"
          />
          <span class="foil-value" id="hud-foil-value">65%</span>
        </label>

        <button
          type="button"
          class="hud-btn"
          id="hud-depth-toggle"
          aria-expanded="false"
          aria-controls="hud-depth-popover"
          title="调节景深构图、物理浮雕与自动微摆"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <circle cx="9" cy="7" r="2"></circle>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <circle cx="15" cy="12" r="2"></circle>
            <line x1="4" y1="17" x2="20" y2="17"></line>
            <circle cx="11" cy="17" r="2"></circle>
          </svg>
          <span>景深</span>
        </button>
      </div>

      <!-- 可折叠景深与浮雕浮层 -->
      <div class="depth-popover" id="hud-depth-popover" role="dialog" aria-label="景深与浮雕调节面板" hidden>
        <div class="popover-head">
          <h2 class="popover-title">景深与浮雕参数</h2>
          <button type="button" class="popover-reset" id="hud-params-reset">恢复默认</button>
        </div>

        <div class="popover-switches">
          <div class="switch-row" id="hud-relief-row">
            <div class="switch-copy">
              <span class="switch-label">物理浮雕模式</span>
              <span class="switch-desc">分离主体与粒子平面，开启立体切边</span>
            </div>
            <button
              type="button"
              role="switch"
              id="hud-relief-switch"
              class="atelier-toggle"
              aria-checked="false"
              aria-label="切换物理浮雕模式"
            ></button>
          </div>

          <div class="switch-row" id="hud-auto-row">
            <div class="switch-copy">
              <span class="switch-label">自动微摆</span>
              <span class="switch-desc">暗房轻柔摆动观赏扫光 (Space)</span>
            </div>
            <button
              type="button"
              role="switch"
              id="hud-auto-switch"
              class="atelier-toggle"
              aria-checked="false"
              aria-label="切换自动微摆"
            ></button>
          </div>
        </div>

        <div class="popover-sliders" id="hud-depth-sliders">
          ${DEPTH_SLIDERS.map(
            (s) => `
              <label class="param-row" for="hud-param-${s.key}">
                <div class="param-head">
                  <span class="param-label">${s.label}</span>
                  <span class="param-value" id="hud-val-${s.key}">0.00</span>
                </div>
                <input
                  type="range"
                  id="hud-param-${s.key}"
                  class="atelier-range"
                  data-param-key="${s.key}"
                  min="${s.min}"
                  max="${s.max}"
                  step="${s.step}"
                  value="${s.min}"
                />
              </label>
            `,
          ).join('')}
        </div>

        <div class="popover-footer">
          <button type="button" class="popover-export-btn" id="hud-export-poster" title="导出 1400×1800 高清典藏海报 PNG (S)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3v12"></path>
              <polyline points="7 11 12 16 17 11"></polyline>
              <path d="M5 20h14"></path>
            </svg>
            <span>导出高清海报 PNG</span>
            <span class="popover-export-dim">1400×1800</span>
          </button>
          <button type="button" class="popover-help-btn" id="hud-open-help" title="查看快捷键与操作指南 (?)">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M9.5 9.2a2.5 2.5 0 0 1 4.9.8c0 1.6-2.4 2.1-2.4 3.5"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>快捷键与指南</span>
            <kbd class="popover-help-kbd">?</kbd>
          </button>
        </div>
      </div>
    </div>
  `;

  const elCode = mountEl.querySelector('#hud-code');
  const elTitle = mountEl.querySelector('#hud-title');
  const elTagline = mountEl.querySelector('#hud-tagline');
  const elPrev = mountEl.querySelector('#hud-prev');
  const elNext = mountEl.querySelector('#hud-next');
  const elCardTrigger = mountEl.querySelector('#hud-card-trigger');
  const elFaceFront = mountEl.querySelector('#hud-face-front');
  const elFaceBack = mountEl.querySelector('#hud-face-back');
  const elFaceIndicator = mountEl.querySelector('#hud-face-indicator');
  const elSwatches = Array.from(mountEl.querySelectorAll('.finish-swatch'));
  const elFinishName = mountEl.querySelector('#hud-finish-name');
  const elFoilSlider = mountEl.querySelector('#hud-foil-slider');
  const elFoilValue = mountEl.querySelector('#hud-foil-value');
  const elDepthToggle = mountEl.querySelector('#hud-depth-toggle');
  const elDepthPopover = mountEl.querySelector('#hud-depth-popover');
  const elParamsReset = mountEl.querySelector('#hud-params-reset');
  const elExportPoster = mountEl.querySelector('#hud-export-poster');
  const elOpenHelp = mountEl.querySelector('#hud-open-help');
  const elReliefSwitch = mountEl.querySelector('#hud-relief-switch');
  const elAutoSwitch = mountEl.querySelector('#hud-auto-switch');
  const elReliefRow = mountEl.querySelector('#hud-relief-row');
  const elAutoRow = mountEl.querySelector('#hud-auto-row');

  const sliderMap = new Map();
  for (const cfg of DEPTH_SLIDERS) {
    const input = mountEl.querySelector(`#hud-param-${cfg.key}`);
    const readout = mountEl.querySelector(`#hud-val-${cfg.key}`);
    sliderMap.set(cfg.key, { cfg, input, readout });
  }

  function setPopoverOpen(nextOpen) {
    popoverOpen = Boolean(nextOpen);
    elDepthPopover.hidden = !popoverOpen;
    elDepthToggle.setAttribute('aria-expanded', String(popoverOpen));
    elDepthToggle.classList.toggle('is-active', popoverOpen);
  }

  function handleDocumentPointerDown(event) {
    if (!popoverOpen) return;
    if (elDepthPopover.contains(event.target) || elDepthToggle.contains(event.target)) {
      return;
    }
    setPopoverOpen(false);
  }

  elPrev.addEventListener('click', () => handlers.onPrev?.());
  elNext.addEventListener('click', () => handlers.onNext?.());
  elCardTrigger.addEventListener('click', () => handlers.onOpenDrawer?.());

  elFaceFront.addEventListener('click', () => handlers.onSetFlipped?.(false));
  elFaceBack.addEventListener('click', () => handlers.onSetFlipped?.(true));

  for (const swatch of elSwatches) {
    swatch.addEventListener('click', () => {
      const finish = swatch.dataset.finish;
      if (finish) handlers.onSetFinish?.(finish);
    });
  }

  elFoilSlider.addEventListener('input', () => {
    const pct = Number(elFoilSlider.value);
    elFoilValue.textContent = `${Math.round(pct)}%`;
    updateRangeFill(elFoilSlider);
    handlers.onSetFoil?.(pct / 100);
  });

  elDepthToggle.addEventListener('click', () => {
    setPopoverOpen(!popoverOpen);
  });

  elParamsReset.addEventListener('click', () => {
    handlers.onResetParams?.(currentCard);
  });

  elExportPoster?.addEventListener('click', () => {
    setPopoverOpen(false);
    handlers.onExportPoster?.();
  });

  elOpenHelp?.addEventListener('click', () => {
    setPopoverOpen(false);
    handlers.onOpenHelp?.();
  });

  elReliefRow.addEventListener('click', () => {
    const next = elReliefSwitch.getAttribute('aria-checked') !== 'true';
    handlers.onSetRelief?.(next);
  });

  elAutoRow.addEventListener('click', () => {
    const next = elAutoSwitch.getAttribute('aria-checked') !== 'true';
    handlers.onSetAutoPlay?.(next);
  });

  for (const [key, { cfg, input, readout }] of sliderMap.entries()) {
    input.addEventListener('input', () => {
      const val = Number(input.value);
      readout.textContent = cfg.format(val);
      updateRangeFill(input);
      handlers.onSetParam?.(key, val);
    });
  }

  document.addEventListener('pointerdown', handleDocumentPointerDown);

  function setCard(card) {
    currentCard = card;
    if (!card) return;
    elCode.textContent = card.code || '--';
    elTitle.textContent = card.title || '';
    const sub = card.tagline || card.subtitle || '';
    elTagline.textContent = sub;
    elTagline.title = sub;
  }

  function syncState(state) {
    if (!state) return;

    // 1. Face flip state
    const flipped = Boolean(state.flipped);
    elFaceFront.classList.toggle('is-active', !flipped);
    elFaceFront.setAttribute('aria-pressed', String(!flipped));
    elFaceBack.classList.toggle('is-active', flipped);
    elFaceBack.setAttribute('aria-pressed', String(flipped));
    elFaceIndicator.textContent = flipped ? '02 / 背面' : '01 / 正面';

    // 2. Finish swatches
    const finish = state.finish || 'gold';
    const meta = FINISH_META.find((m) => m.id === finish) || FINISH_META[0];
    elFinishName.textContent = meta.label;
    for (const swatch of elSwatches) {
      const active = swatch.dataset.finish === finish;
      swatch.classList.toggle('is-active', active);
      swatch.setAttribute('aria-pressed', String(active));
    }

    // 3. Foil slider
    const foilRaw = typeof state.foil === 'number' ? state.foil : 0.65;
    const foilPct = Math.round(Math.max(0, Math.min(1, foilRaw)) * 100);
    if (document.activeElement !== elFoilSlider) {
      elFoilSlider.value = String(foilPct);
    }
    elFoilValue.textContent = finish === 'original' ? '原画' : `${foilPct}%`;
    elFoilSlider.style.opacity = finish === 'original' ? '0.45' : '1';
    updateRangeFill(elFoilSlider);

    // 4. Relief & Auto switches
    elReliefSwitch.setAttribute('aria-checked', String(Boolean(state.relief)));
    elAutoSwitch.setAttribute('aria-checked', String(Boolean(state.auto)));

    // 5. Depth parameters
    const params = state.params || state;
    for (const [key, { cfg, input, readout }] of sliderMap.entries()) {
      const val = typeof params[key] === 'number' ? params[key] : Number(input.value);
      if (document.activeElement !== input) {
        input.value = String(val);
      }
      readout.textContent = cfg.format(val);
      updateRangeFill(input);
    }
  }

  return {
    setCard,
    syncState,
    openPopover: () => setPopoverOpen(true),
    closePopover: () => setPopoverOpen(false),
    isPopoverOpen: () => popoverOpen,
    destroy: () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    },
  };
}
