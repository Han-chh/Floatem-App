(function () {
  const NOTES_KEY = 'floatem.notes';
  const TODOS_KEY = 'floatem.todos';
  const SETTINGS_KEY = 'floatem.settings';
  const WEBSITE_LANGUAGE_KEY = 'floatplane.website-language';
  const COOKIE_PREFIX = 'floatplane_app_demo_';
  const params = new URLSearchParams(window.location.search);
  const requestedLanguage = params.get('language') === 'zh' ? 'zh-CN' : 'en';
  let lastPointer = { x: 0, y: 0, screenX: 0, screenY: 0 };
  let activeDragPreview = null;
  let didFloatActivePreview = false;
  let activePointer = null;
  let dragPreviewMoveFrame = 0;
  let pendingDragPreviewPoint = null;

  const read = (key, fallback) => {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const mirrorCookie = (key, value) => {
    try {
      const encoded = encodeURIComponent(JSON.stringify(value));
      const chunks = encoded.match(/.{1,3000}/g) || [];
      if (!chunks.length || chunks.length > 20) return;
      const cookieKey = COOKIE_PREFIX + key.replace(/[^a-z0-9]/gi, '_');
      const previous = Number((document.cookie.match(new RegExp('(?:^|; )' + cookieKey + '_count=([^;]*)')) || [])[1] || 0);
      const attributes = 'path=/; max-age=31536000; SameSite=Lax';
      document.cookie = cookieKey + '_count=' + chunks.length + '; ' + attributes;
      chunks.forEach((chunk, index) => { document.cookie = cookieKey + '_' + index + '=' + chunk + '; ' + attributes; });
      for (let index = chunks.length; index < previous; index += 1) {
        document.cookie = cookieKey + '_' + index + '=; path=/; max-age=0; SameSite=Lax';
      }
    } catch {
      // The exact app preview remains usable when cookies are unavailable.
    }
  };

  const write = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      mirrorCookie(key, value);
    } catch {
      // Keep the demo interactive even in storage-restricted browser contexts.
    }
  };

  const storedSettings = read(SETTINGS_KEY, null);
  let previousWebsiteLanguage = null;
  try {
    previousWebsiteLanguage = window.localStorage.getItem(WEBSITE_LANGUAGE_KEY);
  } catch {
    previousWebsiteLanguage = null;
  }

  if (!storedSettings) {
    write(SETTINGS_KEY, {
      language: requestedLanguage,
      theme: 'classic',
      activeTab: 'notes',
      lastActiveTab: 'notes',
      defaultOpenSection: 'last',
      transitionStyle: 'page',
      animationSpeed: 'mediate',
      launchAtLogin: true,
      suppressLaunchAtLoginPrompt: true,
      suppressBackgroundActivityPrompt: true,
      suppressLanguageMismatchPrompt: true,
      hasSeenHelpEntryHint: true,
      enableParticles: true,
      enableReminderSound: true,
    });
  } else if (previousWebsiteLanguage !== requestedLanguage) {
    write(SETTINGS_KEY, Object.assign({}, storedSettings, { language: requestedLanguage }));
  }

  try {
    window.localStorage.setItem(WEBSITE_LANGUAGE_KEY, requestedLanguage);
  } catch {
    // The current preview still receives the requested language through its URL.
  }

  const post = (type, detail) => window.parent.postMessage({ source: 'floatplane-web-demo', type, detail }, window.location.origin);
  const settings = () => read(SETTINGS_KEY, {});
  const isSandboxFullscreen = () => {
    try {
      return Boolean(window.parent.document.fullscreenElement);
    } catch {
      return false;
    }
  };
  const cardReference = (payload) => payload && (payload.kind === 'note'
    ? { kind: 'note', id: payload.note && payload.note.id }
    : { kind: 'todo', id: payload.todo && payload.todo.id });

  const showFullscreenGuideNotice = () => {
    if (document.querySelector('[data-floatem-fullscreen-guide]')) return;
    const isChinese = requestedLanguage === 'zh-CN';
    const overlay = document.createElement('div');
    overlay.dataset.floatemFullscreenGuide = 'true';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', isChinese ? '悬浮卡片需要全屏沙盒' : 'Floating cards require fullscreen');
    overlay.innerHTML = '<div><span></span><h2></h2><p></p><button type="button"></button></div>';
    overlay.querySelector('span').textContent = isChinese ? '交互式教程' : 'Interactive guide';
    overlay.querySelector('h2').textContent = isChinese ? '请先进入全屏沙盒' : 'Enter fullscreen first';
    overlay.querySelector('p').textContent = isChinese
      ? '当前嵌入预览不提供悬浮卡片功能。请点击沙盒右上角的全屏按钮，再重新开始交互式教程，即可体验卡片拖出、拖动预览与悬浮。'
      : 'Floating cards are unavailable in the embedded preview. Use the sandbox fullscreen button, then restart the interactive guide to try dragging, drag previews, and floating cards.';
    overlay.querySelector('button').textContent = isChinese ? '知道了' : 'Got it';
    overlay.querySelector('button').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    post('floating-unavailable');
  };

  const fullscreenGuideStyle = document.createElement('style');
  fullscreenGuideStyle.textContent = `
    [data-floatem-fullscreen-guide] { position: fixed; z-index: 9999; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(30,25,21,.28); backdrop-filter: blur(7px); }
    [data-floatem-fullscreen-guide] > div { width: min(350px, 100%); padding: 22px; border: 1px solid rgba(213,198,180,.92); border-radius: 24px; color: #1e1915; background: linear-gradient(145deg, rgba(255,253,248,.98), rgba(247,239,229,.98)); box-shadow: 0 28px 58px rgba(61,49,34,.24); font-family: Manrope, Inter, -apple-system, BlinkMacSystemFont, sans-serif; }
    [data-floatem-fullscreen-guide] span { color: #9b6048; font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
    [data-floatem-fullscreen-guide] h2 { margin: 9px 0 8px; font-family: Sora, Manrope, sans-serif; font-size: 22px; line-height: 1.2; letter-spacing: -.04em; }
    [data-floatem-fullscreen-guide] p { margin: 0; color: #655b53; font-size: 12px; line-height: 1.75; }
    [data-floatem-fullscreen-guide] button { display: block; margin: 18px 0 0 auto; padding: 9px 15px; border: 1px solid rgba(30,25,21,.88); border-radius: 13px; color: #fff; background: #2a2420; font-size: 12px; font-weight: 700; cursor: pointer; }
  `;
  document.head.appendChild(fullscreenGuideStyle);

  const floatingCardStateStyle = document.createElement('style');
  floatingCardStateStyle.textContent = `
    @layer properties {
      html[data-floatem-floating-card-window="true"]
        .content-card-classic[data-card-grouped]:not([data-dragging="true"]),
      html[data-floatem-floating-card-window="true"]
        .content-card-classic[data-card-grouped]:not([data-dragging="true"]):is(:hover, :focus, :focus-within) {
        box-shadow: none !important;
        filter: none !important;
      }
    }
    html[data-floatem-web-note-collapsed="true"] [data-testid="note-card"] {
      min-height: 0 !important;
    }
  `;
  document.head.appendChild(floatingCardStateStyle);

  const syncFloatingNoteCollapseState = () => {
    const reference = cardReference(window.__FLOATEM_FLOATING_CARD_STATE__);
    if (!reference || reference.kind !== 'note') return;
    const card = document.querySelector('[data-testid="note-card"]');
    if (!(card instanceof HTMLElement)) return;
    // The title field also carries the edit-region marker. The rich-text
    // contenteditable is the reliable distinction between an open and folded
    // note.
    const collapsed = !card.querySelector('[data-floating-note-edit-region="true"] [contenteditable="true"]');
    document.documentElement.dataset.floatemWebNoteCollapsed = String(collapsed);
    window.requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      post('floating-note-collapse-state', {
        card: reference,
        collapsed,
        collapsedHeight: Math.ceil(rect.height),
      });
    });
  };

  window.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-action="note-collapse"]') : null;
    if (!button || !window.__FLOATEM_FLOATING_CARD_STATE__) return;
    window.requestAnimationFrame(syncFloatingNoteCollapseState);
  });

  window.addEventListener('floatem:floating-card-state', () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(syncFloatingNoteCollapseState));
  });

  window.addEventListener('click', (event) => {
    if (isSandboxFullscreen()) return;
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    const label = button && button.textContent ? button.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!button || (!label.includes('Start interactive guide') && !label.includes('开始交互式指引'))) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showFullscreenGuideNotice();
  }, true);

  window.addEventListener('pointerdown', (event) => {
    lastPointer = { x: event.clientX, y: event.clientY, screenX: event.screenX, screenY: event.screenY };
    activePointer = {
      id: event.pointerId,
      target: event.target instanceof Element ? event.target : null,
    };
  }, true);

  const captureActivePointer = () => {
    if (!activePointer || !activePointer.target || typeof activePointer.target.setPointerCapture !== 'function') return;
    try {
      activePointer.target.setPointerCapture(activePointer.id);
    } catch {
      // Pointer capture is an enhancement; the drag still works inside the iframe without it.
    }
  };

  const releaseActivePointer = () => {
    if (!activePointer || !activePointer.target || typeof activePointer.target.releasePointerCapture !== 'function') {
      activePointer = null;
      return;
    }
    try {
      if (activePointer.target.hasPointerCapture(activePointer.id)) activePointer.target.releasePointerCapture(activePointer.id);
    } catch {
      // The browser may already have released capture after pointerup.
    }
    activePointer = null;
  };

  const flushDragPreviewMove = () => {
    dragPreviewMoveFrame = 0;
    if (!pendingDragPreviewPoint || !activeDragPreview) return;
    const point = pendingDragPreviewPoint;
    pendingDragPreviewPoint = null;
    post('move-drag-preview', { payload: activeDragPreview, x: point.x, y: point.y });
  };

  window.addEventListener('pointermove', (event) => {
    const coalesced = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    const point = coalesced.length ? coalesced[coalesced.length - 1] : event;
    lastPointer = { x: point.clientX, y: point.clientY, screenX: point.screenX, screenY: point.screenY };
    if (!activeDragPreview) return;
    if (!isSandboxFullscreen()) return;
    pendingDragPreviewPoint = lastPointer;
    if (!dragPreviewMoveFrame) dragPreviewMoveFrame = window.requestAnimationFrame(flushDragPreviewMove);
    const reachedWindowEdge = point.clientX <= 8 || point.clientX >= window.innerWidth - 8 || point.clientY <= 8 || point.clientY >= window.innerHeight - 8;
    if (!reachedWindowEdge || didFloatActivePreview) return;
    if (dragPreviewMoveFrame) {
      window.cancelAnimationFrame(dragPreviewMoveFrame);
      dragPreviewMoveFrame = 0;
    }
    flushDragPreviewMove();
    didFloatActivePreview = true;
    post('commit-drag-preview', { payload: activeDragPreview, x: point.clientX, y: point.clientY });
  }, true);

  window.addEventListener('pointerup', () => {
    if (dragPreviewMoveFrame) {
      window.cancelAnimationFrame(dragPreviewMoveFrame);
      dragPreviewMoveFrame = 0;
    }
    if (pendingDragPreviewPoint) flushDragPreviewMove();
    if (activeDragPreview && didFloatActivePreview) {
      post('end-drag-preview', { payload: activeDragPreview, x: lastPointer.x, y: lastPointer.y });
    } else if (activeDragPreview) {
      post('hide-drag-preview');
    }
    pendingDragPreviewPoint = null;
    releaseActivePointer();
    window.setTimeout(() => {
      activeDragPreview = null;
      didFloatActivePreview = false;
    }, 0);
  }, true);

  window.floatemHost = {
    platform: 'macos',
    async getCapabilities() {
      const fullscreen = isSandboxFullscreen();
      return {
        platform: 'macos',
        runtime: 'floatplane-web-demo',
        capabilities: {
          'window.show': true,
          'window.hide': true,
          'window.toggle': true,
          'window.alwaysOnTop': true,
          'window.dragPreview': fullscreen,
          'window.floatingCards': fullscreen,
          'notifications.send': true,
          'notifications.schedule': true,
          'notifications.openSettings': false,
          'shortcuts.global': false,
          'settings.persist': true,
          'clipboard.read': Boolean(navigator.clipboard && navigator.clipboard.readText),
          'clipboard.write': Boolean(navigator.clipboard && navigator.clipboard.writeText),
          'devtools.open': false,
          'app.quit': true,
        },
        limitations: [fullscreen
          ? 'System-level behavior is simulated inside the Floatplane browser sandbox.'
          : 'Floating cards are available after entering the Floatplane fullscreen sandbox.'],
      };
    },
    async loadAllData() {
      const todos = read(TODOS_KEY, []);
      post('sync-todo-reminders', todos);
      return { notes: read(NOTES_KEY, []), todos, settings: settings() };
    },
    async saveNotes(notes) {
      write(NOTES_KEY, notes);
      post('notes-updated', notes);
    },
    async saveTodos(todos) {
      write(TODOS_KEY, todos);
      post('todos-updated', todos);
      post('sync-todo-reminders', todos);
    },
    async saveSettings(next) {
      const merged = Object.assign({}, settings(), next || {});
      write(SETTINGS_KEY, merged);
      post('settings-updated', merged);
    },
    async getSystemLanguage() { return requestedLanguage; },
    async getLaunchAtLoginStatus() { return { enabled: settings().launchAtLogin !== false, status: 'enabled' }; },
    async getBackgroundActivityStatus() { return { activationEpoch: 1, enabled: true, status: 'enabled' }; },
    async getHotkeyRegistrationState() {
      return { shortcut: settings().hotkey || 'Shift+Space', registration: 'registered', message: null };
    },
    async registerHotkey(shortcut) { post('shortcut-updated', shortcut); },
    async registerGlobalShortcut(shortcut) { post('shortcut-updated', shortcut); },
    async unregisterHotkey() {},
    async showFloatingCard(payload) {
      if (!isSandboxFullscreen()) {
        post('floating-unavailable');
        return;
      }
      post('show-floating-card', payload);
    },
    async closeFloatingCard(card) { post('close-floating-card', card); },
    async resizeFloatingCard(size) {
      post('resize-floating-card', Object.assign({
        card: cardReference(window.__FLOATEM_FLOATING_CARD_STATE__),
        dialogOpen: Boolean(document.querySelector('.floatem-modal-backdrop')),
      }, size));
    },
    async getFloatingCardScreenPlacement() {
      try {
        const frame = window.frameElement;
        const desktop = frame && frame.closest('.floatplane-desktop');
        if (!frame || !desktop) return null;
        const frameRect = frame.getBoundingClientRect();
        const desktopRect = desktop.getBoundingClientRect();
        return {
          availableFrame: {
            left: desktopRect.left,
            top: desktopRect.top,
            width: desktopRect.width,
            height: desktopRect.height,
          },
          cardFrame: {
            left: frameRect.left,
            top: frameRect.top,
            width: frameRect.width,
            height: frameRect.height,
          },
        };
      } catch {
        return null;
      }
    },
    async startFloatingCardDrag(card) {
      const origin = { x: lastPointer.screenX, y: lastPointer.screenY };
      captureActivePointer();
      post('start-floating-card-drag', { card, x: lastPointer.x, y: lastPointer.y });
      let moveFrame = 0;
      let pendingMove = null;
      const flushMove = () => {
        moveFrame = 0;
        if (!pendingMove) return;
        post('move-floating-card', { card, dx: pendingMove.x - origin.x, dy: pendingMove.y - origin.y });
        pendingMove = null;
      };
      const move = (event) => {
        const coalesced = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
        const point = coalesced.length ? coalesced[coalesced.length - 1] : event;
        pendingMove = { x: point.screenX, y: point.screenY };
        if (!moveFrame) moveFrame = window.requestAnimationFrame(flushMove);
      };
      const up = () => {
        if (moveFrame) {
          window.cancelAnimationFrame(moveFrame);
          moveFrame = 0;
        }
        flushMove();
        window.removeEventListener('pointermove', move, true);
        window.removeEventListener('pointerup', up, true);
        releaseActivePointer();
        post('end-floating-card-drag', { card });
      };
      window.addEventListener('pointermove', move, true);
      window.addEventListener('pointerup', up, true);
    },
    async setFloatingCardDesktopPinned(card, pinned) {
      post('pin-floating-card', { card, pinned });
      return { pinned, launchAtLoginEnabled: settings().launchAtLogin !== false, requiresLaunchAtLogin: false };
    },
    async requestDesktopWidget(card) {
      post('pin-floating-card', { card, pinned: true });
      return { requested: true, requiresSystemPlacement: false };
    },
    async removeDesktopWidgetAssociation(card) { post('pin-floating-card', { card, pinned: false }); },
    async getDesktopWidgetState(card) { return { requested: false, systemManaged: true, card }; },
    async showDragPreview(payload) {
      activeDragPreview = payload;
      didFloatActivePreview = false;
      if (!isSandboxFullscreen()) {
        post('floating-unavailable');
        return;
      }
      captureActivePointer();
      post('show-drag-preview', { payload, x: lastPointer.x, y: lastPointer.y });
    },
    async hideDragPreview() {
      if (dragPreviewMoveFrame) {
        window.cancelAnimationFrame(dragPreviewMoveFrame);
        dragPreviewMoveFrame = 0;
      }
      pendingDragPreviewPoint = null;
      activeDragPreview = null;
      didFloatActivePreview = false;
      releaseActivePointer();
      post('hide-drag-preview');
    },
    async resizeFloatingWindow(size) {
      post('resize-floating-card', Object.assign({
        card: cardReference(window.__FLOATEM_FLOATING_CARD_STATE__),
        dialogOpen: Boolean(document.querySelector('.floatem-modal-backdrop')),
      }, size));
    },
    async checkNotificationPermission() {
      // The Floatplane demo owns its notification surface. Treat that in-sandbox
      // surface as available without asking the browser for system permission.
      return { allowed: true };
    },
    async sendNotification(request) {
      post('notification', request);
    },
    async showNotification(request) { return this.sendNotification(request); },
    async scheduleNotification(request) { post('schedule-notification', request); },
    async testReminderNotification(options) { post('test-notification', options); },
    async openNotificationSettings() {},
    async openBackgroundActivitySettings() {},
    async setEditableInputActive() {},
    async setTextCompositionActive() {},
    async setWindowTheme() {},
    async openTextColorPanel() {},
    async pickScreenColor() { return null; },
    async readClipboardText() { try { return await navigator.clipboard.readText(); } catch { return ''; } },
    async writeClipboardText(text) { try { await navigator.clipboard.writeText(text); } catch {} },
    async showWindow() { post('show-window'); },
    async hideWindow() { post('hide-window'); },
    async hidePanelWindow() { post('hide-window'); },
    async toggleWindow() { post('toggle-window'); },
    async setAlwaysOnTop() {},
    async quitApplication() { post('quit-application'); },
    async openDevTools() {},
    reportFrontendReady() { post('frontend-ready'); },
    reportFrontendError(message, source) { post('frontend-error', { message, source }); },
  };
}());
