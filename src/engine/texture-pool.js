import * as THREE from 'three';

/**
 * GPU Texture LRU Cache Pool for multi-card 3D holographic flashcards.
 *
 * Keeps at most `maxCards` (default 5) complete 6-texture bundles resident in WebGL memory:
 *   { tBackground, tSubject, tEffects, tLine, tText, tBack, hasLine, hasFx, sourceMode, heroLoaded }
 *
 * When capacity is exceeded, the least-recently-used bundle is evicted and every GPU
 * texture is strictly disposed (`texture.dispose()`) to prevent WebGL context loss.
 */

export class LRUTexturePool {
  constructor(maxCards = 5, renderer = null) {
    this.maxCards = Math.max(1, maxCards);
    this.renderer = renderer;
    /** @type {Map<string, object>} */
    this.cache = new Map();
    /** @type {Map<string, Promise<object | null>>} */
    this.inFlight = new Map();
    this.pinnedKey = null;
    this.sharedFallbacks = null;
    this._disposed = false;
  }

  /**
   * Pin the currently displayed cardId so rapid background loads never evict
   * textures that are actively bound to live WebGL shader uniforms.
   */
  setPinned(cardId) {
    this.pinnedKey = cardId || null;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  getMaxAnisotropy() {
    if (this.renderer && this.renderer.capabilities && typeof this.renderer.capabilities.getMaxAnisotropy === 'function') {
      return Math.max(1, this.renderer.capabilities.getMaxAnisotropy());
    }
    return 4;
  }

  _getSharedFallbacks() {
    if (!this.sharedFallbacks) {
      const transparent = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
      transparent.colorSpace = THREE.NoColorSpace;
      transparent.needsUpdate = true;

      const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
      white.colorSpace = THREE.NoColorSpace;
      white.needsUpdate = true;

      const dark = new THREE.DataTexture(new Uint8Array([20, 15, 12, 255]), 1, 1, THREE.RGBAFormat);
      dark.colorSpace = THREE.NoColorSpace;
      dark.needsUpdate = true;

      this.sharedFallbacks = { transparent, white, dark };
    }
    return this.sharedFallbacks;
  }

  _createTextureFromSource(source, { highAnisotropy = false, mipmaps = true } = {}) {
    if (!source) return null;

    const isCanvas = typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement;
    const texture = isCanvas ? new THREE.CanvasTexture(source) : new THREE.Texture(source);

    texture.colorSpace = THREE.NoColorSpace;
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = mipmaps;
    texture.minFilter = mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const maxAniso = this.getMaxAnisotropy();
    texture.anisotropy = highAnisotropy ? Math.min(8, maxAniso) : Math.min(4, maxAniso);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Convert resolved canvas/image layers into an optimized GPU texture bundle.
   */
  buildBundleFromLayers(resolved) {
    const fallbacks = this._getSharedFallbacks();
    const ownedTextures = [];

    const wrap = (src, opts, fallbackTex) => {
      if (!src) return fallbackTex;
      const tex = this._createTextureFromSource(src, opts);
      if (tex) ownedTextures.push(tex);
      return tex || fallbackTex;
    };

    const tBackground = wrap(resolved.background, { highAnisotropy: false }, fallbacks.dark);
    const tSubject = wrap(resolved.subject, { highAnisotropy: false }, fallbacks.transparent);
    const tEffects = wrap(resolved.effects, { highAnisotropy: false }, fallbacks.transparent);
    const tLine = wrap(resolved.lineart, { highAnisotropy: false }, fallbacks.white);
    // High anisotropy (up to 8x) keeps angled front typography & back 6D radar razor-sharp
    const tText = wrap(resolved.text, { highAnisotropy: true }, fallbacks.transparent);
    const tBack = wrap(resolved.back, { highAnisotropy: true }, fallbacks.white);

    return {
      tBackground,
      tSubject,
      tEffects,
      tLine,
      tText,
      tBack,
      hasLine: Boolean(resolved.hasLine && resolved.lineart),
      hasFx: Boolean(resolved.hasFx && resolved.effects),
      sourceMode: resolved.sourceMode || 'procedural',
      heroLoaded: Boolean(resolved.heroLoaded),
      ownedTextures,
      dispose() {
        for (const tex of ownedTextures) {
          tex.dispose();
        }
        ownedTextures.length = 0;
      },
    };
  }

  has(cardId) {
    return this.cache.has(cardId);
  }

  get(cardId) {
    if (!this.cache.has(cardId)) return null;
    const bundle = this.cache.get(cardId);
    // Refresh LRU recency
    this.cache.delete(cardId);
    this.cache.set(cardId, bundle);
    return bundle;
  }

  set(cardId, bundle) {
    if (this.cache.has(cardId)) {
      const old = this.cache.get(cardId);
      if (old && old !== bundle) old.dispose();
      this.cache.delete(cardId);
    }
    this.cache.set(cardId, bundle);
    this._evictIfNeeded();
    return bundle;
  }

  /**
   * Fetch from cache or invoke async `resolverFn()` with in-flight deduplication.
   * Optional `shouldCommit()` avoids allocating GPU textures for already-superseded requests.
   */
  async getOrCreate(cardId, resolverFn, { shouldCommit } = {}) {
    if (this._disposed) return null;
    const cached = this.get(cardId);
    if (cached) return cached;

    if (this.inFlight.has(cardId)) {
      return this.inFlight.get(cardId);
    }

    const promise = Promise.resolve()
      .then(() => resolverFn())
      .then((resolved) => {
        // Guard against stale in-flight resolution if evicted, superseded, or pool disposed
        if (this._disposed || this.inFlight.get(cardId) !== promise) {
          return null;
        }
        if (typeof shouldCommit === 'function' && !shouldCommit()) {
          return null;
        }
        const bundle = this.buildBundleFromLayers(resolved);
        this.set(cardId, bundle);
        return bundle;
      })
      .finally(() => {
        if (this.inFlight.get(cardId) === promise) {
          this.inFlight.delete(cardId);
        }
      });

    this.inFlight.set(cardId, promise);
    return promise;
  }

  /**
   * Remove a card bundle from the cache without immediately disposing its GPU textures.
   * Useful when the stage wants to keep rendering the current frame until the replacement binds.
   */
  detach(cardId) {
    this.inFlight.delete(cardId);
    if (this.pinnedKey === cardId) this.pinnedKey = null;
    const bundle = this.cache.get(cardId) || null;
    if (bundle) this.cache.delete(cardId);
    return bundle;
  }

  /**
   * Evict a card from cache and immediately dispose all GPU textures owned by it.
   */
  evict(cardId) {
    this.inFlight.delete(cardId);
    if (this.pinnedKey === cardId) this.pinnedKey = null;
    const bundle = this.cache.get(cardId);
    if (!bundle) return false;
    this.cache.delete(cardId);
    bundle.dispose();
    return true;
  }

  _evictIfNeeded() {
    while (this.cache.size > this.maxCards) {
      let victim = undefined;
      for (const key of this.cache.keys()) {
        if (key !== this.pinnedKey) {
          victim = key;
          break;
        }
      }
      if (victim === undefined) {
        victim = this.cache.keys().next().value;
      }
      if (victim === undefined) break;
      this.evict(victim);
    }
  }

  get size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  clear() {
    this.pinnedKey = null;
    for (const bundle of this.cache.values()) {
      bundle.dispose();
    }
    this.cache.clear();
    this.inFlight.clear();
  }

  dispose() {
    this._disposed = true;
    this.clear();
    if (this.sharedFallbacks) {
      this.sharedFallbacks.transparent.dispose();
      this.sharedFallbacks.white.dispose();
      this.sharedFallbacks.dark.dispose();
      this.sharedFallbacks = null;
    }
  }
}
