import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import './floatplane-demo.css'

type DemoLanguage = 'zh' | 'en'
type CardReference = { kind: 'note' | 'todo', id: string }
type CardSize = { width: number, height: number }
type PointerOffset = { x: number, y: number }

type NotePayload = {
  kind: 'note'
  language: string
  size: CardSize
  pointerOffset?: PointerOffset
  minimumSize?: CardSize
  desktopPinned?: boolean
  note: { id: string, title: string, previewText: string, collapsed: boolean }
  groups: Array<{ id: string, name: string, color: string }>
}

type TodoPayload = {
  kind: 'todo'
  language: string
  timeZone: string
  timeFormat: '24h' | '12h'
  size: CardSize
  pointerOffset?: PointerOffset
  minimumSize?: CardSize
  desktopPinned?: boolean
  todo: { id: string, text: string, done: boolean }
  groups: Array<{ id: string, name: string, color: string }>
}

type DemoPayload = NotePayload | TodoPayload

type FloatingCard = {
  key: string
  payload: DemoPayload
  x: number
  y: number
  width: number
  height: number
  expandedHeight: number
  collapsed: boolean
  pinned: boolean
}

type DragPreview = {
  payload: DemoPayload
  clientX: number
  clientY: number
  x: number
  y: number
  width: number
  height: number
  committing: boolean
  detached: boolean
  returning: boolean
}

type HostMessage = { source?: string, type?: string, detail?: unknown }
type FloatingWindow = Window & { __FLOATEM_FLOATING_CARD_STATE__?: DemoPayload | null }
type DragPreviewWindow = Window & { __FLOATEM_DRAG_PREVIEW_STATE__?: DemoPayload | null }

const WEBVIEW_PATH = `${import.meta.env.BASE_URL}floatem-webview`
const WEBVIEW_REVISION = '20261002-slogan-your-thoughts'
const SANDBOX_MENU_BAR_HEIGHT = 28

function referenceFromPayload(payload: DemoPayload): CardReference {
  return payload.kind === 'note' ? { kind: 'note', id: payload.note.id } : { kind: 'todo', id: payload.todo.id }
}

function cardKey(reference: CardReference) {
  return `${reference.kind}:${reference.id}`
}

function isCardReference(value: unknown): value is CardReference {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CardReference>
  return (candidate.kind === 'note' || candidate.kind === 'todo') && typeof candidate.id === 'string'
}

function isDemoPayload(value: unknown): value is DemoPayload {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<DemoPayload>
  if (!candidate.size || typeof candidate.size.width !== 'number' || typeof candidate.size.height !== 'number') return false
  return candidate.kind === 'note'
    ? Boolean(candidate.note && typeof candidate.note.id === 'string')
    : candidate.kind === 'todo' && Boolean(candidate.todo && typeof candidate.todo.id === 'string')
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function FloatplaneDemo({ siteLocale, onCollapse }: { siteLocale: DemoLanguage, onCollapse: () => void }) {
  const [appOpen, setAppOpen] = useState(true)
  const [dockPlacement, setDockPlacement] = useState<'corner' | 'center'>('corner')
  const [iframeKey, setIframeKey] = useState(0)
  const [floatingCards, setFloatingCards] = useState<FloatingCard[]>([])
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(Date.now())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)
  const [dragPreviewReady, setDragPreviewReady] = useState(false)
  const [mainFrameReady, setMainFrameReady] = useState(false)
  const [appWindowMinimizing, setAppWindowMinimizing] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLElement>(null)
  const dockAppButtonRef = useRef<HTMLButtonElement>(null)
  const mainFrameRef = useRef<HTMLIFrameElement>(null)
  const dragPreviewFrameRef = useRef<HTMLIFrameElement>(null)
  const floatingFrameRefs = useRef(new Map<string, HTMLIFrameElement>())
  const floatingWindowRefs = useRef(new Map<string, HTMLDivElement>())
  const floatingCardsRef = useRef<FloatingCard[]>([])
  const dragOriginsRef = useRef(new Map<string, { x: number, y: number }>())
  const floatingDragPositionsRef = useRef(new Map<string, { x: number, y: number }>())
  const floatingPointerOriginsRef = useRef(new Map<string, { x: number, y: number }>())
  const floatingReturnTargetsRef = useRef(new Map<string, boolean>())
  const floatingReleaseInsideRef = useRef(new Map<string, boolean>())
  const floatingDragFrameRef = useRef<number | undefined>(undefined)
  const dragPreviewRef = useRef<DragPreview | null>(null)
  const dragPreviewElementRef = useRef<HTMLDivElement>(null)
  const dragPreviewMoveFrameRef = useRef<number | undefined>(undefined)
  const dragPreviewTimerRef = useRef<number | undefined>(undefined)
  const appWindowDragRef = useRef<{ pointerId: number, pointerX: number, pointerY: number, windowX: number, windowY: number } | null>(null)
  const appWindowDragFrameRef = useRef<number | undefined>(undefined)
  const appWindowPositionRef = useRef<{ x: number, y: number } | null>(null)
  const appWindowActionRef = useRef<'hide' | 'close' | 'reload' | 'quit'>('hide')
  const appWindowMinimizeTimerRef = useRef<number | undefined>(undefined)
  const reminderTimersRef = useRef(new Map<string, number>())
  const tr = (zh: string, en: string) => siteLocale === 'zh' ? zh : en

  const mainSource = useMemo(() => new URL(`${WEBVIEW_PATH}/index.html?language=${siteLocale}&revision=${WEBVIEW_REVISION}`, window.location.href).href, [siteLocale])
  const mainFrameDocument = useMemo(() => {
    const webviewBase = new URL(`${WEBVIEW_PATH}/`, window.location.href).href
    const runtimeUrl = mainSource.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    return `<!doctype html><html lang="${siteLocale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="floatem-webview-url" content="${runtimeUrl}"><base href="${webviewBase}"><title>Floatem</title><script src="./bridge.js"><\/script><script type="module" crossorigin src="./assets/main-DDm2Uk6T.js"><\/script><link rel="stylesheet" crossorigin href="./assets/main-B6VhQnt5.css"></head><body><div id="root"></div></body></html>`
  }, [mainSource, siteLocale])
  const dragPreviewSource = useMemo(() => `${WEBVIEW_PATH}/index.html?mode=drag-preview&language=${siteLocale}&revision=${WEBVIEW_REVISION}`, [siteLocale])
  const systemClock = useMemo(() => {
    const clockPreference = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions()
    const timeZone = clockPreference.timeZone
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', timeZone }
    if (clockPreference.hourCycle) timeOptions.hourCycle = clockPreference.hourCycle
    return {
      timeZone,
      date: new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone }),
      weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone }),
      time: new Intl.DateTimeFormat(undefined, timeOptions),
    }
  }, [])
  // Match the macOS host: inside the app window, dnd-kit owns the reorder
  // preview and its guide animation. The desktop preview only becomes visible
  // after the card has crossed the window boundary.
  const showDetachedDragPreview = Boolean(
    dragPreview
      && dragPreviewReady
      && dragPreview.detached
      && !dragPreview.returning
      && !dragPreview.committing,
  )

  const dispatchMainEvent = useCallback((name: string, detail: unknown) => {
    const target = mainFrameRef.current?.contentWindow
    if (!target) return
    const event = target.document.createEvent('CustomEvent')
    event.initCustomEvent(name, false, false, detail)
    target.dispatchEvent(event)
  }, [])

  const syncFloatingState = useCallback((cards: FloatingCard[]) => {
    dispatchMainEvent('floatem:floating-cards-state', {
      noteIds: cards.filter((card) => card.payload.kind === 'note').map((card) => referenceFromPayload(card.payload).id),
      todoIds: cards.filter((card) => card.payload.kind === 'todo').map((card) => referenceFromPayload(card.payload).id),
      pinnedNoteIds: cards.filter((card) => card.pinned && card.payload.kind === 'note').map((card) => referenceFromPayload(card.payload).id),
      pinnedTodoIds: cards.filter((card) => card.pinned && card.payload.kind === 'todo').map((card) => referenceFromPayload(card.payload).id),
    })
  }, [dispatchMainEvent])

  const returnAllFloatingCards = useCallback(() => {
    if (floatingDragFrameRef.current) {
      window.cancelAnimationFrame(floatingDragFrameRef.current)
      floatingDragFrameRef.current = undefined
    }
    floatingCardsRef.current = []
    setFloatingCards([])
    syncFloatingState([])
    dragOriginsRef.current.clear()
    floatingDragPositionsRef.current.clear()
    floatingPointerOriginsRef.current.clear()
    floatingReturnTargetsRef.current.clear()
    floatingReleaseInsideRef.current.clear()
  }, [syncFloatingState])

  const syncDragPreviewFrame = useCallback((payload: DemoPayload | null) => {
    const target = dragPreviewFrameRef.current?.contentWindow as DragPreviewWindow | null
    if (!target) return
    target.__FLOATEM_DRAG_PREVIEW_STATE__ = payload
    const event = target.document.createEvent('CustomEvent')
    event.initCustomEvent('floatem:drag-preview-state', false, false, payload)
    target.dispatchEvent(event)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    floatingCardsRef.current = floatingCards
  }, [floatingCards])

  useEffect(() => {
    if (appOpen) setMainFrameReady(false)
  }, [appOpen, iframeKey, siteLocale])

  useEffect(() => {
    const language = siteLocale === 'zh' ? 'zh-CN' : 'en'
    setFloatingCards((current) => current.map((card) => card.payload.language === language ? card : {
      ...card,
      payload: { ...card.payload, language },
    }))
  }, [siteLocale])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 6_000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === shellRef.current
      setIsFullscreen(fullscreen)
      if (!fullscreen) {
        returnAllFloatingCards()
        if (dragPreviewMoveFrameRef.current) {
          window.cancelAnimationFrame(dragPreviewMoveFrameRef.current)
          dragPreviewMoveFrameRef.current = undefined
        }
        dragPreviewRef.current = null
        setDragPreview(null)
        setDragPreviewReady(false)
        syncDragPreviewFrame(null)
        appWindowPositionRef.current = null
        const preview = previewRef.current
        if (preview) {
          preview.classList.remove('is-dragging')
          preview.style.removeProperty('left')
          preview.style.removeProperty('top')
          preview.style.removeProperty('bottom')
          preview.style.removeProperty('transform')
        }
      }
      dispatchMainEvent('floatem:sandbox-fullscreen-state', { fullscreen })
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [dispatchMainEvent, returnAllFloatingCards, syncDragPreviewFrame])

  useEffect(() => {
    const preview = previewRef.current
    const desktop = desktopRef.current
    if (!preview || !desktop) return
    const syncScale = () => {
      const compactViewport = window.matchMedia('(max-width: 640px)').matches
      const verticalClearance = compactViewport ? 160 : 56
      // Keep the app proportional to the sandbox instead of subtracting a
      // fixed Dock gutter. A proportional width stays visually consistent
      // when Chrome stores a different per-origin page zoom.
      const availableWidth = compactViewport ? desktop.clientWidth - 20 : desktop.clientWidth * 0.8
      const width = Math.min(440, availableWidth, (desktop.clientHeight - verticalClearance) * (100 / 177))
      preview.style.width = `${Math.max(compactViewport ? 240 : 280, width)}px`
      const previewWidth = Number.parseFloat(window.getComputedStyle(preview).width)
      preview.style.setProperty('--floatem-app-scale', String(previewWidth / 400))
      shellRef.current?.style.setProperty('--floatem-preview-width', `${previewWidth}px`)
    }
    const observer = new ResizeObserver(syncScale)
    observer.observe(desktop)
    const frame = window.requestAnimationFrame(syncScale)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [appOpen])

  useEffect(() => () => {
    reminderTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    if (dragPreviewTimerRef.current) window.clearTimeout(dragPreviewTimerRef.current)
    if (dragPreviewMoveFrameRef.current) window.cancelAnimationFrame(dragPreviewMoveFrameRef.current)
    if (floatingDragFrameRef.current) window.cancelAnimationFrame(floatingDragFrameRef.current)
    if (appWindowDragFrameRef.current) window.cancelAnimationFrame(appWindowDragFrameRef.current)
    if (appWindowMinimizeTimerRef.current) window.clearTimeout(appWindowMinimizeTimerRef.current)
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent<HostMessage>) => {
      if (event.origin !== window.location.origin || event.data?.source !== 'floatplane-web-demo') return
      const { type, detail } = event.data

      if (type === 'frontend-ready' && event.source === mainFrameRef.current?.contentWindow) {
        setMainFrameReady(true)
        return
      }

      const readPreviewMessage = () => {
        if (!detail || typeof detail !== 'object') return null
        const message = detail as { payload?: unknown, x?: unknown, y?: unknown }
        if (!isDemoPayload(message.payload) || typeof message.x !== 'number' || typeof message.y !== 'number') return null
        const desktop = desktopRef.current?.getBoundingClientRect()
        const frame = mainFrameRef.current?.getBoundingClientRect()
        const frameWindow = mainFrameRef.current?.contentWindow
        if (!desktop || !frame || !frameWindow) return null
        const coordinateScaleX = frame.width / Math.max(1, frameWindow.innerWidth)
        const coordinateScaleY = frame.height / Math.max(1, frameWindow.innerHeight)
        const pointerX = frame.left - desktop.left + message.x * coordinateScaleX
        const pointerY = frame.top - desktop.top + message.y * coordinateScaleY
        const contentWidth = Math.max(1, message.payload.size.width)
        const contentHeight = Math.max(1, message.payload.size.height)
        // The application iframe has a 400px layout viewport but is displayed
        // wider in the desktop sandbox. DOMRect values in the payload are still
        // expressed in that inner viewport's coordinates, so both card size and
        // pointer offset must be converted to desktop pixels. Keeping them
        // unscaled makes the detached preview visibly smaller than its source.
        const width = contentWidth * coordinateScaleX
        const height = contentHeight * coordinateScaleY
        const pointerOffsetX = (message.payload.pointerOffset?.x ?? contentWidth / 2) * coordinateScaleX
        const pointerOffsetY = (message.payload.pointerOffset?.y ?? contentHeight / 2) * coordinateScaleY
        const payload: DemoPayload = {
          ...message.payload,
          size: { width, height },
          pointerOffset: { x: pointerOffsetX, y: pointerOffsetY },
          minimumSize: message.payload.minimumSize
            ? {
                width: message.payload.minimumSize.width * coordinateScaleX,
                height: message.payload.minimumSize.height * coordinateScaleY,
              }
            : undefined,
        }
        const detached = dragPreviewRef.current?.detached ?? false
        const panel = previewRef.current?.getBoundingClientRect()
        const screenPointerX = desktop.left + pointerX
        const screenPointerY = desktop.top + pointerY
        const returning = detached
          && Boolean(panel)
          && screenPointerX >= (panel?.left ?? 0)
          && screenPointerX <= (panel?.right ?? 0)
          && screenPointerY >= (panel?.top ?? 0)
          && screenPointerY <= (panel?.bottom ?? 0)
        return {
          payload,
          clientX: message.x,
          clientY: message.y,
          x: pointerX - pointerOffsetX,
          y: pointerY - pointerOffsetY,
          width,
          height,
          committing: false,
          detached,
          returning,
        } satisfies DragPreview
      }

      const floatCard = (payload: DemoPayload, preview?: DragPreview | null) => {
        const key = cardKey(referenceFromPayload(payload))
        const desktop = desktopRef.current?.getBoundingClientRect()
        const contentWidth = Math.max(1, payload.size.width)
        const contentHeight = Math.max(1, payload.size.height)
        const width = contentWidth
        const height = contentHeight
        setFloatingCards((current) => {
          if (current.some((card) => card.key === key)) return current
          const offset = current.length * 26
          const card: FloatingCard = {
            key,
            payload,
            x: preview ? clamp(preview.x, 8, Math.max(8, (desktop?.width ?? 900) - width - 8)) : Math.max(16, (desktop?.width ?? 900) - width - 34 - offset),
            y: preview ? clamp(preview.y, 31, Math.max(31, (desktop?.height ?? 700) - height - 8)) : 64 + offset,
            width,
            height,
            expandedHeight: height,
            collapsed: payload.kind === 'note' && payload.note.collapsed,
            pinned: Boolean(payload.desktopPinned),
          }
          const next = [...current, card]
          window.setTimeout(() => syncFloatingState(next), 0)
          return next
        })
        setToast(tr('卡片已悬浮到桌面', 'Card floated onto the desktop'))
      }

      const revealExactDragPreview = (preview: DragPreview) => {
        setDragPreviewReady(false)
        syncDragPreviewFrame(preview.payload)
        window.requestAnimationFrame(() => {
          syncDragPreviewFrame(preview.payload)
          window.requestAnimationFrame(() => {
            const current = dragPreviewRef.current
            if (current && cardKey(referenceFromPayload(current.payload)) === cardKey(referenceFromPayload(preview.payload))) setDragPreviewReady(true)
          })
        })
      }

      const emitDockZoneEnter = (payload: DemoPayload, source: 'preview' | 'floating', clientX: number, clientY: number) => {
        const reference = referenceFromPayload(payload)
        dispatchMainEvent('floatem:floating-dock-zone-enter', {
          ...reference,
          source,
          clientX,
          clientY,
        })
      }

      const emitDockZoneLeave = (payload: DemoPayload) => {
        dispatchMainEvent('floatem:floating-dock-zone-leave', referenceFromPayload(payload))
      }

      const retireDragPreview = () => {
        if (dragPreviewMoveFrameRef.current) {
          window.cancelAnimationFrame(dragPreviewMoveFrameRef.current)
          dragPreviewMoveFrameRef.current = undefined
        }
        if (dragPreviewTimerRef.current) {
          window.clearTimeout(dragPreviewTimerRef.current)
          dragPreviewTimerRef.current = undefined
        }
        dragPreviewRef.current = null
        setDragPreview(null)
        setDragPreviewReady(false)
        syncDragPreviewFrame(null)
      }

      if (type === 'floating-unavailable') {
        setToast(tr('请先进入全屏沙盒，再体验悬浮卡片', 'Enter fullscreen to try floating cards'))
        return
      }

      if (type === 'show-drag-preview') {
        if (!isFullscreen) return
        const preview = readPreviewMessage()
        if (!preview) return
        dragPreviewRef.current = preview
        setDragPreview(preview)
        revealExactDragPreview(preview)
        return
      }

      if (type === 'move-drag-preview') {
        if (!isFullscreen) return
        const preview = readPreviewMessage()
        if (!preview) return
        const previous = dragPreviewRef.current
        dragPreviewRef.current = preview
        if (previous?.returning !== preview.returning || previous?.detached !== preview.detached) setDragPreview(preview)
        if (preview.detached && preview.returning) emitDockZoneEnter(preview.payload, 'preview', preview.clientX, preview.clientY)
        else if (previous?.returning) emitDockZoneLeave(preview.payload)
        if (!dragPreviewElementRef.current) {
          setDragPreview(preview)
          return
        }
        if (!dragPreviewMoveFrameRef.current) {
          dragPreviewMoveFrameRef.current = window.requestAnimationFrame(() => {
            dragPreviewMoveFrameRef.current = undefined
            const position = dragPreviewRef.current
            const element = dragPreviewElementRef.current
            if (!position || !element) return
            element.style.setProperty('--drag-preview-x', `${position.x - 16}px`)
            element.style.setProperty('--drag-preview-y', `${position.y - 16}px`)
          })
        }
        return
      }

      if (type === 'hide-drag-preview') {
        if (dragPreviewRef.current?.committing) return
        const previous = dragPreviewRef.current
        retireDragPreview()
        if (previous?.returning) emitDockZoneLeave(previous.payload)
        return
      }

      if (type === 'commit-drag-preview') {
        if (!isFullscreen) {
          setToast(tr('请先进入全屏沙盒，再体验悬浮卡片', 'Enter fullscreen to try floating cards'))
          return
        }
        const measured = readPreviewMessage()
        const preview = measured ?? dragPreviewRef.current
        if (!preview) return
        const detached = { ...preview, detached: true, returning: false }
        dragPreviewRef.current = detached
        setDragPreview(detached)
        return
      }

      if (type === 'end-drag-preview') {
        if (!isFullscreen) return
        const measured = readPreviewMessage()
        const preview = measured ?? dragPreviewRef.current
        if (!preview) return
        const returning = preview.detached && preview.returning
        // The browser demo renders its preview in a separate iframe. Retire it
        // before mounting the permanent card so the two card surfaces cannot
        // overlap for a frame at the hand-off point.
        retireDragPreview()
        if (preview.returning) emitDockZoneLeave(preview.payload)
        if (returning) {
          setToast(tr('卡片已返回 Floatem', 'Card returned to Floatem'))
        } else {
          floatCard(preview.payload, preview)
        }
        return
      }

      if (type === 'show-floating-card' && isDemoPayload(detail)) {
        if (!isFullscreen) {
          setToast(tr('请先进入全屏沙盒，再体验悬浮卡片', 'Enter fullscreen to try floating cards'))
          return
        }
        const preview = dragPreviewRef.current
        // `show-floating-card` and `hide-drag-preview` arrive as separate
        // browser messages. Clearing here, rather than waiting for the second
        // message, prevents their two iframe renderings from appearing
        // together at the card edge.
        retireDragPreview()
        floatCard(preview?.payload ?? detail, preview)
        return
      }

      if (type === 'close-floating-card' && isCardReference(detail)) {
        setFloatingCards((current) => {
          const next = current.filter((card) => card.key !== cardKey(detail))
          window.setTimeout(() => syncFloatingState(next), 0)
          return next
        })
        return
      }

      if (type === 'resize-floating-card' && detail && typeof detail === 'object') {
        const resize = detail as {
          card?: unknown
          width?: unknown
          height?: unknown
          anchor?: unknown
          horizontalAnchor?: unknown
          dialogOpen?: unknown
        }
        if (!isCardReference(resize.card) || typeof resize.width !== 'number' || typeof resize.height !== 'number') return
        const desktop = desktopRef.current?.getBoundingClientRect()
        setFloatingCards((current) => current.map((card) => {
          if (card.key !== cardKey(resize.card as CardReference)) return card
          const contentWidth = clamp(Math.ceil(resize.width as number), 220, Math.max(220, desktop?.width ?? 1_600))
          const minimumHeight = card.payload.kind === 'todo' ? 40 : 72
          const availableHeight = Math.max(minimumHeight, (desktop?.height ?? 1_000) - SANDBOX_MENU_BAR_HEIGHT)
          const contentHeight = clamp(Math.ceil(resize.height as number), minimumHeight, availableHeight)
          const horizontalAnchor = resize.horizontalAnchor === 'right' ? 'right' : 'left'
          const verticalAnchor = resize.anchor === 'bottom' ? 'bottom' : 'top'
          const anchoredX = horizontalAnchor === 'right'
            ? card.x + card.width - contentWidth
            : card.x
          const anchoredY = verticalAnchor === 'bottom'
            ? card.y + card.height - contentHeight
            : card.y
          const maxX = Math.max(0, (desktop?.width ?? contentWidth) - contentWidth)
          const minY = Math.min(SANDBOX_MENU_BAR_HEIGHT, Math.max(0, (desktop?.height ?? contentHeight) - contentHeight))
          const maxY = Math.max(minY, (desktop?.height ?? contentHeight) - contentHeight)
          return {
            ...card,
            x: clamp(anchoredX, 0, maxX),
            // A dialog enlarges the iframe so its controls can sit beside the
            // card. Keeping that temporary frame within the desktop bounds
            // would move a short Todo upward as soon as it opens. Preserve
            // the card's on-screen origin until the dialog closes instead.
            y: resize.dialogOpen === true ? anchoredY : clamp(anchoredY, minY, maxY),
            width: contentWidth,
            height: contentHeight,
            expandedHeight: card.collapsed || resize.dialogOpen === true ? card.expandedHeight : contentHeight,
          }
        }))
        return
      }

      if (type === 'floating-note-collapse-state' && detail && typeof detail === 'object') {
        const collapse = detail as { card?: unknown, collapsed?: unknown, collapsedHeight?: unknown }
        if (!isCardReference(collapse.card) || collapse.card.kind !== 'note' || typeof collapse.collapsed !== 'boolean') return
        setFloatingCards((current) => current.map((card) => {
          if (card.key !== cardKey(collapse.card as CardReference) || card.payload.kind !== 'note') return card
          const expandedHeight = card.collapsed ? card.expandedHeight : card.height
          const collapsedHeight = typeof collapse.collapsedHeight === 'number'
            ? clamp(Math.ceil(collapse.collapsedHeight), 72, expandedHeight)
            : Math.min(96, expandedHeight)
          return {
            ...card,
            payload: {
              ...card.payload,
              note: { ...card.payload.note, collapsed: collapse.collapsed as boolean },
            },
            collapsed: collapse.collapsed as boolean,
            expandedHeight,
            height: collapse.collapsed ? collapsedHeight : expandedHeight,
          }
        }))
        return
      }

      if (type === 'pin-floating-card' && detail && typeof detail === 'object') {
        const pin = detail as { card?: unknown, pinned?: unknown }
        if (!isCardReference(pin.card) || typeof pin.pinned !== 'boolean') return
        setFloatingCards((current) => {
          const next = current.map((card) => card.key === cardKey(pin.card as CardReference) ? { ...card, pinned: pin.pinned as boolean } : card)
          window.setTimeout(() => syncFloatingState(next), 0)
          return next
        })
        return
      }

      if (type === 'start-floating-card-drag' && detail && typeof detail === 'object') {
        const drag = detail as { card?: unknown, x?: unknown, y?: unknown }
        if (!isCardReference(drag.card)) return
        const key = cardKey(drag.card)
        const card = floatingCardsRef.current.find((item) => item.key === key)
        if (card) {
          dragOriginsRef.current.set(key, { x: card.x, y: card.y })
          floatingDragPositionsRef.current.set(key, { x: card.x, y: card.y })
          const desktop = desktopRef.current?.getBoundingClientRect()
          const element = floatingWindowRefs.current.get(key)?.getBoundingClientRect()
          const frameWindow = floatingFrameRefs.current.get(key)?.contentWindow
          if (desktop && element && frameWindow && typeof drag.x === 'number' && typeof drag.y === 'number') {
            floatingPointerOriginsRef.current.set(key, {
              x: element.left - desktop.left + drag.x * (element.width / Math.max(1, frameWindow.innerWidth)),
              y: element.top - desktop.top + drag.y * (element.height / Math.max(1, frameWindow.innerHeight)),
            })
          }
          floatingReturnTargetsRef.current.set(key, false)
          floatingReleaseInsideRef.current.set(key, false)
        }
        return
      }

      if (type === 'move-floating-card' && detail && typeof detail === 'object') {
        const move = detail as { card?: unknown, dx?: unknown, dy?: unknown }
        if (!isCardReference(move.card) || typeof move.dx !== 'number' || typeof move.dy !== 'number') return
        const key = cardKey(move.card)
        const origin = dragOriginsRef.current.get(key)
        const desktop = desktopRef.current?.getBoundingClientRect()
        const card = floatingCardsRef.current.find((item) => item.key === key)
        if (!origin || !desktop || !card) return
        const pointerOrigin = floatingPointerOriginsRef.current.get(key)
        const app = previewRef.current?.getBoundingClientRect()
        const mainFrame = mainFrameRef.current?.getBoundingClientRect()
        const mainWindow = mainFrameRef.current?.contentWindow
        if (pointerOrigin && app) {
          const pointerX = desktop.left + pointerOrigin.x + (move.dx as number)
          const pointerY = desktop.top + pointerOrigin.y + (move.dy as number)
          const cursorInside = pointerX >= app.left && pointerX <= app.right && pointerY >= app.top && pointerY <= app.bottom
          const nextX = origin.x + (move.dx as number)
          const nextY = origin.y + (move.dy as number)
          const floatingRect = {
            left: desktop.left + nextX,
            top: desktop.top + nextY,
            right: desktop.left + nextX + card.width,
            bottom: desktop.top + nextY + card.height,
          }
          const overlaps = floatingRect.left < app.right && floatingRect.right > app.left && floatingRect.top < app.bottom && floatingRect.bottom > app.top
          const returning = cursorInside || overlaps
          const wasReturning = floatingReturnTargetsRef.current.get(key) === true
          floatingReturnTargetsRef.current.set(key, returning)
          floatingReleaseInsideRef.current.set(key, cursorInside)
          if (returning && mainFrame && mainWindow) {
            emitDockZoneEnter(
              card.payload,
              'floating',
              (pointerX - mainFrame.left) * (mainWindow.innerWidth / Math.max(1, mainFrame.width)),
              (pointerY - mainFrame.top) * (mainWindow.innerHeight / Math.max(1, mainFrame.height)),
            )
          } else if (wasReturning) {
            emitDockZoneLeave(card.payload)
          }
        }
        floatingDragPositionsRef.current.set(key, {
          x: clamp(origin.x + (move.dx as number), 0, desktop.width - card.width),
          y: clamp(origin.y + (move.dy as number), 28, desktop.height - card.height),
        })
        if (!floatingDragFrameRef.current) {
          floatingDragFrameRef.current = window.requestAnimationFrame(() => {
            floatingDragFrameRef.current = undefined
            floatingDragPositionsRef.current.forEach((position, dragKey) => {
              const element = floatingWindowRefs.current.get(dragKey)
              if (!element) return
              element.style.setProperty('--float-x', `${position.x}px`)
              element.style.setProperty('--float-y', `${position.y}px`)
            })
          })
        }
        return
      }

      if (type === 'end-floating-card-drag' && detail && typeof detail === 'object') {
        const drag = detail as { card?: unknown }
        if (!isCardReference(drag.card)) return
        const key = cardKey(drag.card)
        const position = floatingDragPositionsRef.current.get(key)
        const card = floatingCardsRef.current.find((item) => item.key === key)
        const returning = floatingReleaseInsideRef.current.get(key) === true
        if (card && floatingReturnTargetsRef.current.get(key) === true) emitDockZoneLeave(card.payload)
        if (returning) {
          setFloatingCards((current) => {
            const next = current.filter((card) => card.key !== key)
            window.setTimeout(() => syncFloatingState(next), 0)
            return next
          })
          setToast(tr('卡片已返回 Floatem', 'Card returned to Floatem'))
        } else if (position) {
          const element = floatingWindowRefs.current.get(key)
          element?.style.setProperty('--float-x', `${position.x}px`)
          element?.style.setProperty('--float-y', `${position.y}px`)
          setFloatingCards((current) => current.map((card) => card.key === key ? { ...card, ...position } : card))
        }
        dragOriginsRef.current.delete(key)
        floatingDragPositionsRef.current.delete(key)
        floatingPointerOriginsRef.current.delete(key)
        floatingReturnTargetsRef.current.delete(key)
        floatingReleaseInsideRef.current.delete(key)
        return
      }

      if (type === 'notes-updated') dispatchMainEvent('floatem:notes-updated', detail)
      if (type === 'todos-updated') dispatchMainEvent('floatem:todos-updated', detail)
      if (type === 'quit-application') {
        minimizeAppWindow('quit')
        return
      }
      if (type === 'hide-window') minimizeAppWindow('hide')
      if (type === 'show-window') {
        setDockPlacement('corner')
        setAppOpen(true)
      }
      if (type === 'toggle-window') setAppOpen((current) => {
        if (current) {
          window.setTimeout(() => minimizeAppWindow('hide'), 0)
          return current
        }
        setDockPlacement('corner')
        return true
      })
      if (type === 'test-notification' || type === 'notification') setToast(tr('提醒通知已触发', 'Reminder notification delivered'))
      // `todos-updated` is emitted by both old and current webview bridges.
      // Schedule from it directly so an already-open sandbox does not need a
      // manual page refresh before reminders start working.
      if (type === 'sync-todo-reminders' || type === 'todos-updated') {
        const document = detail && typeof detail === 'object' && !Array.isArray(detail)
          ? detail as { items?: unknown }
          : null
        const items = Array.isArray(detail) ? detail : Array.isArray(document?.items) ? document.items : null
        if (!items) return

        const activeKeys = new Set<string>()
        const now = Date.now()
        items.forEach((value) => {
          if (!value || typeof value !== 'object') return
          const todo = value as { id?: unknown, text?: unknown, done?: unknown, reminderAt?: unknown }
          if (typeof todo.id !== 'string') return
          const key = `todo-reminder:${todo.id}`
          const previous = reminderTimersRef.current.get(key)
          if (previous) window.clearTimeout(previous)
          reminderTimersRef.current.delete(key)
          if (todo.done === true || typeof todo.reminderAt !== 'number' || todo.reminderAt <= now) return

          activeKeys.add(key)
          const title = tr('待办提醒', 'Todo reminder')
          const body = typeof todo.text === 'string' && todo.text.trim()
            ? todo.text.trim()
            : tr('提醒时间到了', 'Your reminder is due')
          const schedule = () => {
            const remaining = (todo.reminderAt as number) - Date.now()
            if (remaining <= 0) {
              reminderTimersRef.current.delete(key)
              setToast(`${title} · ${body}`)
              return
            }
            const timer = window.setTimeout(schedule, Math.min(remaining, 2_147_000_000))
            reminderTimersRef.current.set(key, timer)
          }
          schedule()
        })

        reminderTimersRef.current.forEach((timer, key) => {
          if (!key.startsWith('todo-reminder:') || activeKeys.has(key)) return
          window.clearTimeout(timer)
          reminderTimersRef.current.delete(key)
        })
        return
      }
      if (type === 'schedule-notification' && detail && typeof detail === 'object') {
        const notification = detail as { id?: string, title?: string, body?: string, scheduledAt?: number }
        if (typeof notification.scheduledAt !== 'number') return
        const id = `notification:${notification.id ?? `${notification.title}:${notification.scheduledAt}`}`
        const previous = reminderTimersRef.current.get(id)
        if (previous) window.clearTimeout(previous)
        const timer = window.setTimeout(() => {
          setToast(`${notification.title ?? 'Floatem'} · ${notification.body ?? tr('提醒时间到了', 'Your reminder is due')}`)
        }, Math.max(0, notification.scheduledAt - Date.now()))
        reminderTimersRef.current.set(id, timer)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [dispatchMainEvent, isFullscreen, returnAllFloatingCards, siteLocale, syncDragPreviewFrame, syncFloatingState])

  function initializeFloatingFrame(card: FloatingCard, frame: HTMLIFrameElement | null) {
    if (!frame) {
      floatingFrameRefs.current.delete(card.key)
      return
    }
    floatingFrameRefs.current.set(card.key, frame)
    const sendPayload = () => {
      const target = frame.contentWindow as FloatingWindow | null
      if (!target) return
      target.__FLOATEM_FLOATING_CARD_STATE__ = card.payload
      const event = target.document.createEvent('CustomEvent')
      event.initCustomEvent('floatem:floating-card-state', false, false, card.payload)
      target.dispatchEvent(event)
    }
    frame.addEventListener('load', () => {
      sendPayload()
      window.setTimeout(sendPayload, 80)
    }, { once: true })
  }

  function beginAppWindowDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isFullscreen || event.button !== 0 || (event.target as Element).closest('button')) return
    const desktop = desktopRef.current?.getBoundingClientRect()
    const preview = previewRef.current?.getBoundingClientRect()
    if (!desktop || !preview) return
    const windowX = preview.left - desktop.left
    const windowY = preview.top - desktop.top
    appWindowDragRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      windowX,
      windowY,
    }
    appWindowPositionRef.current = { x: windowX, y: windowY }
    event.currentTarget.setPointerCapture(event.pointerId)
    previewRef.current?.classList.add('is-dragging')
    event.preventDefault()
  }

  function moveAppWindow(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = appWindowDragRef.current
    const desktop = desktopRef.current?.getBoundingClientRect()
    const preview = previewRef.current?.getBoundingClientRect()
    if (!drag || drag.pointerId !== event.pointerId || !desktop || !preview) return
    appWindowPositionRef.current = {
      x: clamp(drag.windowX + event.clientX - drag.pointerX, 0, Math.max(0, desktop.width - preview.width)),
      y: clamp(drag.windowY + event.clientY - drag.pointerY, 29, Math.max(29, desktop.height - preview.height)),
    }
    if (!appWindowDragFrameRef.current) {
      appWindowDragFrameRef.current = window.requestAnimationFrame(() => {
        appWindowDragFrameRef.current = undefined
        const position = appWindowPositionRef.current
        const element = previewRef.current
        if (!position || !element) return
        element.style.left = '0px'
        element.style.top = '0px'
        element.style.bottom = 'auto'
        element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`
      })
    }
  }

  function endAppWindowDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = appWindowDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (appWindowDragFrameRef.current) {
      window.cancelAnimationFrame(appWindowDragFrameRef.current)
      appWindowDragFrameRef.current = undefined
    }
    const position = appWindowPositionRef.current
    const element = previewRef.current
    if (position && element) {
      element.style.left = '0px'
      element.style.top = '0px'
      element.style.bottom = 'auto'
      element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`
      element.classList.remove('is-dragging')
    }
    appWindowDragRef.current = null
  }

  function minimizeAppWindow(action: 'hide' | 'close' | 'reload' | 'quit') {
    // A full quit is visually collected by the Dock just like the window's
    // close control, but it also returns every detached card first.
    if (action === 'quit') returnAllFloatingCards()
    if (!appOpen || appWindowMinimizing) return
    // Every action that leaves Floatem closed collects the app into the
    // center launcher. Reload is the only transition that reopens it.
    const centerDock = action !== 'reload'
    setDockPlacement(centerDock ? 'center' : 'corner')
    const element = previewRef.current
    const desktop = desktopRef.current?.getBoundingClientRect()
    const preview = element?.getBoundingClientRect()
    const dockIcon = dockAppButtonRef.current?.querySelector('img')?.getBoundingClientRect()
    if (!element || !desktop || !preview || !dockIcon) {
      setAppOpen(false)
      return
    }
    const left = preview.left - desktop.left
    const top = preview.top - desktop.top
    const targetCenterX = centerDock ? desktop.left + desktop.width / 2 : dockIcon.left + dockIcon.width / 2
    const targetCenterY = centerDock ? desktop.top + desktop.height / 2 : dockIcon.top + dockIcon.height / 2
    const targetX = targetCenterX - (preview.left + preview.width / 2)
    const targetY = targetCenterY - (preview.top + preview.height / 2)
    element.style.left = `${left}px`
    element.style.top = `${top}px`
    element.style.bottom = 'auto'
    element.style.transform = 'translate3d(0, 0, 0)'
    element.style.setProperty('--app-minimize-x', `${targetX}px`)
    element.style.setProperty('--app-minimize-y', `${targetY}px`)
    element.style.setProperty('--app-minimize-scale-x', String(dockIcon.width / preview.width))
    element.style.setProperty('--app-minimize-scale-y', String(dockIcon.height / preview.height))
    appWindowActionRef.current = action
    setAppWindowMinimizing(true)
    if (appWindowMinimizeTimerRef.current) window.clearTimeout(appWindowMinimizeTimerRef.current)
    appWindowMinimizeTimerRef.current = window.setTimeout(finishAppWindowMinimize, 410)
  }

  function finishAppWindowMinimize() {
    if (!appWindowMinimizing && !appWindowMinimizeTimerRef.current) return
    if (appWindowMinimizeTimerRef.current) {
      window.clearTimeout(appWindowMinimizeTimerRef.current)
      appWindowMinimizeTimerRef.current = undefined
    }
    const action = appWindowActionRef.current
    setAppWindowMinimizing(false)
    setAppOpen(false)
    appWindowPositionRef.current = null
    if (action !== 'reload') return
    window.setTimeout(() => {
      let launchAtLogin = true
      try {
        const settings = JSON.parse(window.localStorage.getItem('floatem.settings') ?? '{}') as { launchAtLogin?: boolean }
        launchAtLogin = settings.launchAtLogin !== false
      } catch {
        launchAtLogin = true
      }
      setIframeKey((current) => current + 1)
      setDockPlacement(launchAtLogin ? 'corner' : 'center')
      setAppOpen(launchAtLogin)
      setToast(launchAtLogin ? tr('Floatem 已随沙盒启动', 'Floatem launched with the sandbox') : tr('沙盒已启动，Floatem 保持关闭', 'Sandbox started with Floatem closed'))
    }, 180)
  }

  function restartSandbox() {
    returnAllFloatingCards()
    setToast(tr('正在重新启动 Floatplane 沙盒…', 'Restarting the Floatplane sandbox…'))
    if (!appOpen) {
      setIframeKey((current) => current + 1)
      setDockPlacement('corner')
      setAppOpen(true)
      return
    }
    minimizeAppWindow('reload')
  }

  async function toggleBrowserFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await shellRef.current?.requestFullscreen()
  }

  return <div className={`floatplane-shell ${appOpen ? 'is-app-open' : 'is-app-closed'}`} ref={shellRef}>
    <header className="floatplane-toolbar">
      <div className="floatplane-wordmark"><b>Floatem</b><span>Sandbox Preview</span></div>
      <div className="floatplane-toolbar-actions">
        <button onClick={restartSandbox} aria-label={tr('重启沙盒', 'Restart sandbox')} title={tr('重启沙盒', 'Restart sandbox')}>↻</button>
        <button
          className="floatplane-collapse-control"
          onClick={onCollapse}
          aria-label={isFullscreen ? tr('请先退出全屏再折叠', 'Exit fullscreen before collapsing') : tr('收起系统沙盒', 'Collapse system sandbox')}
          title={isFullscreen ? tr('请先退出全屏再折叠', 'Exit fullscreen before collapsing') : tr('收起系统沙盒', 'Collapse system sandbox')}
          disabled={isFullscreen}
        >›</button>
        <button onClick={toggleBrowserFullscreen} aria-label={tr('切换浏览器全屏', 'Toggle browser fullscreen')} title={tr('切换浏览器全屏', 'Toggle browser fullscreen')}>{isFullscreen ? '↙' : '↗'}</button>
      </div>
    </header>

    <div className="floatplane-desktop" ref={desktopRef}>
      <div className="floatplane-menubar">
        <div><img className="fp-menubar-icon" src={`${import.meta.env.BASE_URL}floatem-app-icon-64.png`} alt="" /><span className="fp-menubar-slogan">Don't lose your thoughts. Float'em.</span></div>
        <div className="fp-system-meta"><span className="fp-system-label">{tr('系统沙盒', 'System Sandbox')}</span><time dateTime={new Date(now).toISOString()} title={systemClock.timeZone}><span className="fp-system-date">{systemClock.date.format(now)}</span><span className="fp-system-weekday">{systemClock.weekday.format(now)}</span><span className="fp-system-time">{systemClock.time.format(now)}</span></time></div>
      </div>

      <div className="floatplane-wallpaper-copy" aria-hidden="true"><span>FLOATPLANE SYSTEM SANDBOX</span><strong>{tr('在浏览器中体验完整Floatem', 'Explore the complete Floatem experience.')}</strong><small>{tr('模拟桌面环境；演示数据只保存在你的浏览器中。', 'A desktop-like sandbox. Demo data stays in your browser.')}</small></div>

      {appOpen && <section
        className={`floatem-original-window${appWindowMinimizing ? ' is-minimizing' : ''}${mainFrameReady ? ' is-ready' : ' is-loading'}`}
        ref={previewRef}
        aria-label={tr('Floatem 互动网页版', 'Floatem interactive web demo')}
        onAnimationEnd={(event) => {
          if (event.animationName === 'floatem-window-minimize') finishAppWindowMinimize()
        }}
      >
        <div
          className="floatem-native-titlebar"
          aria-label={tr('Floatem 窗口控制栏', 'Floatem window controls')}
          onPointerDown={beginAppWindowDrag}
          onPointerMove={moveAppWindow}
          onPointerUp={endAppWindowDrag}
          onPointerCancel={endAppWindowDrag}
        >
          <div className="floatem-traffic-lights">
            <button
              type="button"
              className="floatem-traffic-light is-close"
              aria-label={tr('关闭 Floatem 并缩回程序坞', 'Close Floatem to the Dock')}
              title={tr('关闭', 'Close')}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => minimizeAppWindow('close')}
            />
            <button
              type="button"
              className="floatem-traffic-light is-minimize"
              aria-label={tr('最小化 Floatem 到程序坞', 'Minimize Floatem to the Dock')}
              title={tr('最小化', 'Minimize')}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => minimizeAppWindow('hide')}
            />
          </div>
        </div>
        <div className="floatem-window-shadow" />
        <div className="floatem-frame-loading" role="status" aria-live="polite">
          <img src={`${import.meta.env.BASE_URL}floatem-app-icon-64.png`} alt="" />
          <span>{tr('正在打开 Floatem…', 'Opening Floatem…')}</span>
        </div>
        <iframe
          key={`${iframeKey}-${siteLocale}`}
          ref={mainFrameRef}
          srcDoc={mainFrameDocument}
          title={tr('Floatem 互动网页版', 'Floatem interactive web demo')}
          onLoad={() => {
            syncFloatingState(floatingCards)
            dispatchMainEvent('floatem:sandbox-fullscreen-state', { fullscreen: isFullscreen })
          }}
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </section>}

      <div
        className={`fp-drag-preview${showDetachedDragPreview ? ' is-active' : ''}`}
        ref={dragPreviewElementRef}
        style={{
          '--drag-preview-x': `${(dragPreview?.x ?? 0) - 16}px`,
          '--drag-preview-y': `${(dragPreview?.y ?? 0) - 16}px`,
          width: dragPreview ? dragPreview.payload.size.width + 32 : 1,
          height: dragPreview ? dragPreview.payload.size.height + 32 : 1,
        } as CSSProperties}
        aria-hidden="true"
      >
        {dragPreview && <iframe
            ref={dragPreviewFrameRef}
            src={dragPreviewSource}
            title=""
            tabIndex={-1}
            style={{
              width: dragPreview.payload.size.width + 32,
              height: dragPreview.payload.size.height + 32,
            }}
            onLoad={() => {
              const preview = dragPreviewRef.current
              syncDragPreviewFrame(preview?.payload ?? null)
              if (!preview) return
              window.requestAnimationFrame(() => {
                syncDragPreviewFrame(dragPreviewRef.current?.payload ?? null)
                window.requestAnimationFrame(() => {
                  if (dragPreviewRef.current) setDragPreviewReady(true)
                })
              })
            }}
          />}
      </div>

      {floatingCards.map((card, index) => <div
        className={`fp-native-floating-window${card.pinned ? ' is-pinned' : ''}`}
        key={card.key}
        ref={(element) => {
          if (element) floatingWindowRefs.current.set(card.key, element)
          else floatingWindowRefs.current.delete(card.key)
        }}
        style={{
          '--float-x': `${card.x}px`,
          '--float-y': `${card.y}px`,
          width: card.width,
          height: card.height,
          zIndex: card.pinned ? 6 : 20 + index,
        } as CSSProperties}
      >
        <iframe
          ref={(frame) => initializeFloatingFrame(card, frame)}
          src={`${WEBVIEW_PATH}/floating.html?language=${siteLocale}&card=${encodeURIComponent(card.key)}&revision=${WEBVIEW_REVISION}`}
          title={card.payload.kind === 'note' ? card.payload.note.title || tr('悬浮便签', 'Floating note') : card.payload.todo.text}
          allow="clipboard-read; clipboard-write"
        />
      </div>)}

      <nav className={`floatplane-dock${appOpen && !appWindowMinimizing ? '' : ' is-compact'}${dockPlacement === 'center' ? ' is-centered' : ''}`} aria-label={tr('沙盒程序坞', 'Sandbox dock')}>
        {appOpen && !appWindowMinimizing && <button onClick={restartSandbox}><span>↻</span><small>{tr('重新加载', 'Reload')}</small></button>}
        <button
          ref={dockAppButtonRef}
          className={appOpen && !appWindowMinimizing ? 'active' : ''}
          onClick={() => {
            returnAllFloatingCards()
            if (appOpen) minimizeAppWindow('hide')
            else {
              setDockPlacement('corner')
              setAppOpen(true)
            }
          }}
          aria-label={appOpen ? tr('隐藏 Floatem', 'Hide Floatem') : tr('打开 Floatem', 'Open Floatem')}
        >
          <img src={`${import.meta.env.BASE_URL}floatem-app-icon-64.png`} alt="" />
          {appOpen && !appWindowMinimizing && <small>Floatem</small>}
        </button>
      </nav>

      {toast && <div className="fp-system-toast" role="alert" aria-live="assertive"><img src={`${import.meta.env.BASE_URL}floatem-app-icon-64.png`} alt="" /><div><b>Floatem</b><p>{toast}</p></div><button onClick={() => setToast('')} aria-label={tr('关闭通知', 'Dismiss notification')}>×</button></div>}
    </div>
  </div>
}
