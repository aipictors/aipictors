import {
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  MaximizeIcon,
  MinimizeIcon,
  TypeIcon,
  XIcon,
} from "lucide-react"
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import {
  BOOK_READER_CSS,
  PALETTES,
  THEME_LABELS,
} from "~/components/book-reader/book-reader-styles"
import { prepareBookHtml } from "~/components/book-reader/prepare-book-html"
import {
  FONT_FAMILIES,
  FONT_LABELS,
  FONT_SIZES,
  LINE_HEIGHTS,
  loadProgress,
  loadSettings,
  type ReaderBookmark,
  type ReaderFont,
  type ReaderLayout,
  type ReaderLineHeight,
  type ReaderPosition,
  type ReaderSettings,
  type ReaderTheme,
  saveProgress,
  saveSettings,
  WEB_FONT_URLS,
} from "~/components/book-reader/reader-storage"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** tiptap が出した本文の HTML */
  html: string
  title: string
  authorName?: string
  coverUrl?: string
  workId: string
  workType: "NOVEL" | "COLUMN"
  onClose: () => void
}

/** 段の間（ページ送りの計算だけに使う。見えない） */
const COLUMN_GAP = 48
/** 1 分あたりに読む文字数（残り時間の目安） */
const CHARS_PER_MINUTE = 500
const HINT_KEY = "aipictors:book-reader:hint-shown"

type Geometry = {
  spread: boolean
  pageW: number
  pageH: number
  padX: number
  padTop: number
  padBottom: number
  textW: number
  textH: number
  /** 見開きの 2 ページの間（折りたたみ端末のヒンジの幅） */
  hingeGap: number
}

type Panel = "settings" | "toc" | "bookmarks" | null

type ViewportSegments = { width: number; x: number }[] | undefined

/** 折りたたみ端末で、画面が左右 2 つに分かれているか（Viewport Segments API） */
const readHorizontalSegments = (): ViewportSegments => {
  const segments = (
    window as unknown as {
      viewportSegments?: { x: number; y: number; width: number }[]
    }
  ).viewportSegments
  if (!segments || segments.length !== 2) return undefined
  const [first, second] = segments
  if (!first || !second || first.y !== second.y) return undefined
  return [first, second]
}

const computeGeometry = (
  stageW: number,
  stageH: number,
  layout: ReaderLayout,
  segments: ViewportSegments,
): Geometry => {
  const wide = stageW / Math.max(stageH, 1)
  const spread =
    layout === "spread"
      ? stageW >= 560
      : layout === "single"
        ? false
        : segments !== undefined || (stageW >= 700 && wide >= 1.15)
  const outer = stageW < 520 ? 10 : stageW < 960 ? 14 : 28
  const hingeGap =
    spread && segments?.[0] && segments[1]
      ? Math.max(0, segments[1].x - (segments[0].x + segments[0].width))
      : 0
  const pageH = Math.max(240, stageH - outer * 2)
  const available = spread
    ? (stageW - outer * 2 - hingeGap) / 2
    : stageW - outer * 2
  // 本らしい縦横比より横に広くしない（大きな画面で 1 行が長くなりすぎる）
  const pageW = Math.floor(
    Math.max(260, Math.min(available, pageH * (spread ? 0.8 : 0.78), 760)),
  )
  const padX = Math.round(Math.min(56, Math.max(18, pageW * 0.08)))
  const padTop = pageH < 520 ? 30 : 40
  const padBottom = pageH < 520 ? 30 : 38
  return {
    spread,
    pageW,
    pageH: Math.floor(pageH),
    padX,
    padTop,
    padBottom,
    textW: Math.floor(pageW - padX * 2),
    textH: Math.floor(pageH - padTop - padBottom),
    hingeGap,
  }
}

const loadWebFont = (font: ReaderFont): Promise<void> => {
  const url = WEB_FONT_URLS[font]
  if (url === undefined) return Promise.resolve()
  const id = `aipictors-book-reader-font-${font}`
  if (document.getElementById(id) === null) {
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = url
    document.head.appendChild(link)
  }
  const family = FONT_FAMILIES[font].split(",")[0] ?? ""
  return Promise.all([
    document.fonts.load(`400 16px ${family}`, "あ漢字カナ"),
    document.fonts.load(`700 16px ${family}`, "あ漢字カナ"),
  ])
    .then(() => undefined)
    .catch(() => undefined)
}

/** 段落ごとに、どのページに載っているか（複数ページにまたがる段落は複数） */
const measureBlockPages = (
  flow: HTMLElement,
  vertical: boolean,
  step: number,
): number[][] => {
  const flowRect = flow.getBoundingClientRect()
  const blocks = flow.querySelectorAll<HTMLElement>(":scope > [data-b]")
  const result: number[][] = []
  for (const block of Array.from(blocks)) {
    const pages = new Set<number>()
    for (const rect of Array.from(block.getClientRects())) {
      const start = vertical
        ? rect.top - flowRect.top
        : rect.left - flowRect.left
      const end = vertical
        ? rect.bottom - flowRect.top
        : rect.right - flowRect.left
      const first = Math.floor((start + 1) / step)
      const last = Math.max(first, Math.floor((end - 2) / step))
      for (let page = first; page <= last; page++) pages.add(Math.max(0, page))
    }
    if (pages.size === 0) {
      pages.add(result.at(-1)?.at(-1) ?? 0)
    }
    result.push([...pages].sort((a, b) => a - b))
  }
  return result
}

export function BookReader(props: Props): ReactNode {
  const t = useTranslation()
  const { onClose } = props

  const book = useMemo(() => prepareBookHtml(props.html), [props.html])

  const [settings, setSettings] = useState<ReaderSettings>(() =>
    loadSettings(props.workType),
  )
  const updateSettings = (patch: Partial<ReaderSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      saveSettings(props.workType, next)
      return next
    })
  }

  const [progress, setProgress] = useState(() => loadProgress(props.workId))
  const progressRef = useRef(progress)
  progressRef.current = progress

  const palette = PALETTES[settings.theme]
  const vertical = settings.writing === "vertical"
  const eink = settings.theme === "eink"
  const animate = settings.pageAnimation && !eink

  /* ───── 画面の大きさ ───── */

  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ width: 0, height: 0 })
  const [segments, setSegments] = useState<ViewportSegments>(undefined)

  useLayoutEffect(() => {
    const element = stageRef.current
    if (element === null) return
    const update = () => {
      setStage({ width: element.clientWidth, height: element.clientHeight })
      setSegments(readHorizontalSegments())
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const geometry = useMemo(
    () =>
      stage.width === 0
        ? null
        : computeGeometry(stage.width, stage.height, settings.layout, segments),
    [stage.width, stage.height, settings.layout, segments],
  )

  /* ───── 書体 ───── */

  const [fontTick, setFontTick] = useState(0)
  useEffect(() => {
    let alive = true
    loadWebFont(settings.font).then(() => {
      if (alive) setFontTick((tick) => tick + 1)
    })
    return () => {
      alive = false
    }
  }, [settings.font])

  /* ───── ページ割り ───── */

  const measureRef = useRef<HTMLDivElement>(null)
  const [blockPages, setBlockPages] = useState<number[][]>([])
  const [imageTick, setImageTick] = useState(0)
  const step = geometry
    ? (vertical ? geometry.textH : geometry.textW) + COLUMN_GAP
    : 1

  useLayoutEffect(() => {
    const flow = measureRef.current
    if (flow === null || geometry === null) return
    setBlockPages(measureBlockPages(flow, vertical, step))
    // fontTick・imageTick は書体・挿絵が届いたあとに測り直すためのもの
  }, [
    geometry,
    vertical,
    step,
    book.html,
    settings.fontSize,
    settings.font,
    settings.lineHeight,
    settings.compactBlankLines,
    fontTick,
    imageTick,
  ])

  // 挿絵が読み込まれたらページ割りが変わる
  useEffect(() => {
    const flow = measureRef.current
    if (flow === null) return
    const images = Array.from(flow.querySelectorAll("img"))
    const onLoad = () => setImageTick((tick) => tick + 1)
    for (const image of images) {
      if (!image.complete) image.addEventListener("load", onLoad)
    }
    return () => {
      for (const image of images) image.removeEventListener("load", onLoad)
    }
  }, [book.html])

  useEffect(() => {
    const onFontsDone = () => setFontTick((tick) => tick + 1)
    document.fonts.addEventListener("loadingdone", onFontsDone)
    return () => document.fonts.removeEventListener("loadingdone", onFontsDone)
  }, [])

  const contentPages = useMemo(() => {
    let max = 0
    for (const pages of blockPages) max = Math.max(max, pages.at(-1) ?? 0)
    return blockPages.length === 0 ? 1 : max + 1
  }, [blockPages])

  /** 扉（0）を含めたページ数 */
  const totalPages = contentPages + 1
  const pagesPerView = geometry?.spread ? 2 : 1

  const pageOfPosition = useCallback(
    (position: ReaderPosition) => {
      const pages = blockPages[position.block]
      if (!pages || pages.length === 0) return 0
      return pages[Math.min(position.fragment, pages.length - 1)] ?? 0
    },
    [blockPages],
  )

  const positionOfPage = useCallback(
    (contentPage: number): ReaderPosition | null => {
      for (let block = 0; block < blockPages.length; block++) {
        const fragment = blockPages[block]?.indexOf(contentPage) ?? -1
        if (fragment >= 0) return { block, fragment }
        if ((blockPages[block]?.[0] ?? 0) > contentPage) {
          return { block, fragment: 0 }
        }
      }
      return null
    },
    [blockPages],
  )

  /* ───── 今のページ ───── */

  // 扉を 0 とした通し番号。見開きでは偶数（左右の組の最初のページ）
  const [page, setPage] = useState(0)
  const [turn, setTurn] = useState<{ key: number; forward: boolean }>({
    key: 0,
    forward: true,
  })
  /** ページ割りが変わっても同じ場所を開くための目印 */
  const anchorRef = useRef<ReaderPosition | null>(progress.position)
  const [resumed, setResumed] = useState(progress.position !== null)

  const normalize = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, value))
      return pagesPerView === 2 ? clamped - (clamped % 2) : clamped
    },
    [totalPages, pagesPerView],
  )

  // ページ割りが変わったら目印の場所を開き直す
  useLayoutEffect(() => {
    if (blockPages.length === 0) return
    const anchor = anchorRef.current
    setPage(normalize(anchor === null ? 0 : pageOfPosition(anchor) + 1))
  }, [blockPages, normalize, pageOfPosition])

  const goTo = useCallback(
    (target: number, options?: { animate?: boolean }) => {
      const next = normalize(target)
      setResumed(false)
      if (next === page) return
      if (options?.animate !== false) {
        setTurn((previous) => ({
          key: previous.key + 1,
          forward: next > page,
        }))
      }
      // 扉だけを開いているときは「最初から」。見開きの扉の隣は本文の 1 ページ目
      anchorRef.current =
        next === 0 && pagesPerView === 1
          ? null
          : positionOfPage(Math.max(0, next - 1))
      setPage(next)
    },
    [normalize, page, pagesPerView, positionOfPage],
  )

  const goForward = useCallback(
    () => goTo(page + pagesPerView),
    [goTo, page, pagesPerView],
  )
  const goBackward = useCallback(
    () => goTo(page - pagesPerView),
    [goTo, page, pagesPerView],
  )

  // 続きの位置を覚える
  useEffect(() => {
    if (blockPages.length === 0) return
    const timer = window.setTimeout(() => {
      const next = { ...progressRef.current, position: anchorRef.current }
      saveProgress(props.workId, next)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [page, blockPages, props.workId])

  /* ───── しおり ───── */

  const visibleContentPages = useMemo(() => {
    const pages: number[] = []
    for (let offset = 0; offset < pagesPerView; offset++) {
      const value = page + offset
      if (value >= 1 && value < totalPages) pages.push(value - 1)
    }
    return pages
  }, [page, pagesPerView, totalPages])

  const bookmarkPages = useMemo(
    () =>
      progress.bookmarks.map((bookmark) => ({
        bookmark,
        page: pageOfPosition(bookmark),
      })),
    [progress.bookmarks, pageOfPosition],
  )

  const visibleBookmarks = bookmarkPages.filter((item) =>
    visibleContentPages.includes(item.page),
  )
  const isBookmarked = visibleBookmarks.length > 0

  const toggleBookmark = () => {
    const firstPage = visibleContentPages[0]
    if (firstPage === undefined) return
    const current = progressRef.current
    let bookmarks: ReaderBookmark[]
    if (isBookmarked) {
      const removing = new Set(visibleBookmarks.map((item) => item.bookmark))
      bookmarks = current.bookmarks.filter((item) => !removing.has(item))
    } else {
      const position = positionOfPage(firstPage)
      if (position === null) return
      bookmarks = [
        ...current.bookmarks,
        {
          ...position,
          createdAt: Date.now(),
          excerpt: book.blockExcerpts[position.block] ?? "",
        },
      ]
    }
    const next = { ...current, bookmarks }
    setProgress(next)
    saveProgress(props.workId, { ...next, position: anchorRef.current })
  }

  const removeBookmark = (target: ReaderBookmark) => {
    const current = progressRef.current
    const next = {
      ...current,
      bookmarks: current.bookmarks.filter((item) => item !== target),
    }
    setProgress(next)
    saveProgress(props.workId, { ...next, position: anchorRef.current })
  }

  /* ───── 表示の切り替え ───── */

  const [chromeVisible, setChromeVisible] = useState(true)
  const [panel, setPanel] = useState<Panel>(null)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(HINT_KEY) === null) {
        setHint(true)
        window.localStorage.setItem(HINT_KEY, "1")
      }
    } catch {
      // 覚えられなくても読める
    }
    // 開いてしばらくしたらツールバーを隠して本文だけにする
    const timer = window.setTimeout(() => setChromeVisible(false), 2600)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hint) return
    const timer = window.setTimeout(() => setHint(false), 4200)
    return () => window.clearTimeout(timer)
  }, [hint])

  // 後ろのページがスクロールしないようにする
  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = previous
    }
  }, [])

  const [fullscreen, setFullscreen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const canFullscreen =
    typeof document !== "undefined" && document.fullscreenEnabled === true
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement !== null)
    document.addEventListener("fullscreenchange", onChange)
    return () => {
      document.removeEventListener("fullscreenchange", onChange)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [])
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      rootRef.current?.requestFullscreen().catch(() => {})
    }
  }

  /* ───── 操作（キー・タップ・スワイプ・ホイール） ───── */

  const forwardIsLeft = vertical

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, select, textarea")) return
      if (event.key === "Escape") {
        if (panel !== null) setPanel(null)
        else onClose()
        return
      }
      if (panel !== null) return
      const forwardKeys = [
        forwardIsLeft ? "ArrowLeft" : "ArrowRight",
        "ArrowDown",
        "PageDown",
        " ",
      ]
      const backwardKeys = [
        forwardIsLeft ? "ArrowRight" : "ArrowLeft",
        "ArrowUp",
        "PageUp",
      ]
      if (forwardKeys.includes(event.key) && !event.shiftKey) {
        event.preventDefault()
        goForward()
      } else if (
        backwardKeys.includes(event.key) ||
        (event.key === " " && event.shiftKey)
      ) {
        event.preventDefault()
        goBackward()
      } else if (event.key === "Home") {
        goTo(0)
      } else if (event.key === "End") {
        goTo(totalPages - 1)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [panel, forwardIsLeft, goForward, goBackward, goTo, totalPages, onClose])

  const pointerRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    }
  }

  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointerRef.current
    pointerRef.current = null
    if (start === null) return
    if (panel !== null) {
      setPanel(null)
      return
    }
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    // 文字を選んでいるときはめくらない
    if ((window.getSelection()?.toString() ?? "") !== "") return
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const swipedLeft = dx < 0
      if (swipedLeft !== forwardIsLeft) goForward()
      else goBackward()
      return
    }
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) return
    if (Date.now() - start.time > 600) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = (event.clientX - rect.left) / rect.width
    if (ratio < 0.3) {
      if (forwardIsLeft) goForward()
      else goBackward()
    } else if (ratio > 0.7) {
      if (forwardIsLeft) goBackward()
      else goForward()
    } else {
      setChromeVisible((visible) => !visible)
    }
  }

  const wheelRef = useRef({ total: 0, lockedUntil: 0 })
  const onWheel = (event: React.WheelEvent) => {
    if (panel !== null) return
    const now = Date.now()
    const state = wheelRef.current
    if (now < state.lockedUntil) return
    state.total +=
      Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : forwardIsLeft
          ? -event.deltaX
          : event.deltaX
    if (Math.abs(state.total) < 60) return
    if (state.total > 0) goForward()
    else goBackward()
    state.total = 0
    state.lockedUntil = now + 380
  }

  /* ───── 目次・進み具合 ───── */

  const tocItems = useMemo(
    () =>
      book.headings.map((heading) => ({
        ...heading,
        page: (blockPages[heading.block]?.[0] ?? 0) + 1,
      })),
    [book.headings, blockPages],
  )

  const currentChapter = useMemo(() => {
    let chapter: string | null = null
    for (const item of tocItems) {
      if (item.page <= page + pagesPerView - 1) chapter = item.text
    }
    return chapter
  }, [tocItems, page, pagesPerView])

  const lastVisible = Math.min(totalPages - 1, page + pagesPerView - 1)
  const readRatio = totalPages <= 1 ? 1 : lastVisible / (totalPages - 1)
  const remainingMinutes = Math.ceil(
    (book.charCount * (1 - readRatio)) / CHARS_PER_MINUTE,
  )

  /* ───── 描画 ───── */

  const lineHeight = LINE_HEIGHTS[settings.lineHeight][settings.writing]
  const fontSize = FONT_SIZES[settings.fontSize] ?? 17

  const rootStyle = {
    "--rb-font": FONT_FAMILIES[settings.font],
    "--rb-size": `${fontSize}px`,
    "--rb-lh": String(lineHeight),
    "--rb-text": palette.text,
    "--rb-muted": palette.muted,
    "--rb-border": palette.border,
    "--rb-accent": palette.accent,
    "--rb-page": palette.page,
    "--rb-text-w": geometry ? `${geometry.textW}px` : "100%",
    "--rb-text-h": geometry ? `${geometry.textH}px` : "100%",
    "--rb-page-block": geometry
      ? `${vertical ? geometry.textW : geometry.textH}px`
      : "100%",
    "--rb-turn-dir": forwardIsLeft ? "-1" : "1",
    background: palette.desk,
    color: palette.chromeText,
  } as CSSProperties

  const flowStyle: CSSProperties | undefined = geometry
    ? vertical
      ? {
          writingMode: "vertical-rl",
          width: geometry.textW,
          height: geometry.textH,
          columnWidth: geometry.textH,
          columnGap: COLUMN_GAP,
        }
      : {
          width: geometry.textW,
          height: geometry.textH,
          columnWidth: geometry.textW,
          columnGap: COLUMN_GAP,
        }
    : undefined

  /** 画面に並べる順（横書きは左から、縦書きは右から読む） */
  const viewPages = geometry?.spread
    ? forwardIsLeft
      ? [page + 1, page]
      : [page, page + 1]
    : [page]

  const renderPage = (value: number, side: "left" | "right" | "single") => {
    if (geometry === null) return null
    const isTitle = value === 0
    const exists = value < totalPages
    const contentPage = value - 1
    const ribbon = bookmarkPages.some((item) => item.page === contentPage)
    const gutterShadow =
      side === "single" || eink
        ? undefined
        : side === "left"
          ? `linear-gradient(to left, ${palette.gutter}, transparent 9%)`
          : `linear-gradient(to right, ${palette.gutter}, transparent 9%)`
    const pageNumber = !isTitle && exists ? contentPage + 1 : null
    const numberAlign =
      side === "left" ? "flex-start" : side === "right" ? "flex-end" : "center"
    return (
      <div
        key={side}
        className="relative overflow-hidden"
        style={{
          width: geometry.pageW,
          height: geometry.pageH,
          background: palette.page,
          boxShadow: eink ? "inset 0 0 0 1px #000" : undefined,
        }}
      >
        {gutterShadow && (
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{ background: gutterShadow }}
          />
        )}
        {ribbon && (
          <div
            className="pointer-events-none absolute top-0 z-20"
            style={{
              [side === "left" ? "left" : "right"]: Math.max(
                12,
                geometry.padX - 8,
              ),
              width: 14,
              height: 46,
              background: palette.accent,
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
            }}
          />
        )}
        {isTitle ? (
          <TitlePage
            title={props.title}
            authorName={props.authorName}
            coverUrl={props.coverUrl}
            palette={palette}
            vertical={vertical}
            charCount={book.charCount}
            t={t}
          />
        ) : exists ? (
          <>
            <div
              className="absolute right-0 left-0 truncate text-center"
              style={{
                top: Math.max(8, geometry.padTop / 2 - 8),
                paddingInline: geometry.padX,
                fontSize: 10.5,
                letterSpacing: "0.12em",
                color: palette.muted,
                fontFamily: FONT_FAMILIES[settings.font],
              }}
            >
              {currentChapter && side !== "left" ? currentChapter : props.title}
            </div>
            <div
              className="absolute overflow-hidden"
              style={{
                left: geometry.padX,
                top: geometry.padTop,
                width: geometry.textW,
                height: geometry.textH,
              }}
            >
              <div
                className="rb-flow"
                style={{
                  ...flowStyle,
                  transform: vertical
                    ? `translateY(${-contentPage * step}px)`
                    : `translateX(${-contentPage * step}px)`,
                }}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: tiptap のスキーマを通した本文を DOM で組み直したもの（prepare-book-html.ts）
                dangerouslySetInnerHTML={{ __html: book.html }}
              />
            </div>
            <div
              className="absolute right-0 left-0 flex"
              style={{
                bottom: Math.max(8, geometry.padBottom / 2 - 8),
                paddingInline: geometry.padX,
                justifyContent: numberAlign,
                fontSize: 11,
                color: palette.muted,
                fontVariantNumeric: "tabular-nums",
                fontFamily: FONT_FAMILIES[settings.font],
              }}
            >
              {pageNumber}
            </div>
          </>
        ) : null}
      </div>
    )
  }

  /** 本の厚み（読んだ分と残りの分） */
  const renderEdge = (pages: number, side: "left" | "right") => {
    if (eink || geometry === null) return null
    const width = Math.round(Math.min(9, Math.max(1, pages / 12)))
    return (
      <div
        className="self-stretch"
        style={{
          width,
          marginBlock: 3,
          background: `repeating-linear-gradient(to ${side === "left" ? "left" : "right"}, ${palette.page} 0 1px, ${palette.border} 1px 2px)`,
          borderRadius: side === "left" ? "3px 0 0 3px" : "0 3px 3px 0",
          boxShadow: palette.shadow,
        }}
      />
    )
  }

  const readPages = page
  const unreadPages = Math.max(0, totalPages - 1 - lastVisible)
  const leftEdgePages = forwardIsLeft ? unreadPages : readPages
  const rightEdgePages = forwardIsLeft ? readPages : unreadPages

  const chromeButton = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
    active = false,
  ) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full transition-colors"
      style={{
        color: active ? palette.accent : palette.chromeText,
        background: active ? `${palette.border}` : "transparent",
      }}
    >
      {icon}
    </button>
  )

  const content = (
    <div
      ref={rootRef}
      className={[
        "fixed inset-0 z-[70] flex select-none flex-col overflow-hidden",
        vertical ? "rb-vertical" : "rb-horizontal",
        settings.compactBlankLines ? "rb-compact" : "",
        eink ? "rb-eink" : "",
      ].join(" ")}
      style={rootStyle}
      role="dialog"
      aria-modal="true"
      aria-label={t("本のように読む", "Book reader")}
    >
      <style>{BOOK_READER_CSS}</style>

      {/* ページ割りを測るための見えない本文 */}
      {geometry && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: -100000, top: 0, visibility: "hidden" }}
        >
          <div
            ref={measureRef}
            className="rb-flow"
            style={{ ...flowStyle, position: "relative" }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: 上と同じ本文
            dangerouslySetInnerHTML={{ __html: book.html }}
          />
        </div>
      )}

      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          touchAction: "pan-y pinch-zoom",
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        {geometry && (
          <div
            className="flex items-stretch"
            style={{ filter: eink ? undefined : "none" }}
          >
            {renderEdge(leftEdgePages, "left")}
            <div
              key={turn.key}
              className={[
                "relative flex",
                animate && turn.key > 0
                  ? turn.forward
                    ? "rb-turn-forward"
                    : "rb-turn-backward"
                  : "",
              ].join(" ")}
              style={{
                gap: geometry.hingeGap,
                boxShadow: geometry.hingeGap > 0 ? undefined : palette.shadow,
              }}
            >
              {viewPages.map((value, index) =>
                renderPage(
                  value,
                  geometry.spread ? (index === 0 ? "left" : "right") : "single",
                ),
              )}
              {animate && turn.key > 0 && <div className="rb-sheen" />}
            </div>
            {renderEdge(rightEdgePages, "right")}
          </div>
        )}
      </div>

      {/* 上のツールバー */}
      <div
        className="absolute top-0 right-0 left-0 z-30 transition-all duration-200"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          background: palette.chrome,
          borderBottom: `1px solid ${palette.border}`,
          transform: chromeVisible ? "none" : "translateY(-110%)",
          opacity: chromeVisible ? 1 : 0,
          backdropFilter: eink ? undefined : "blur(10px)",
        }}
      >
        <div className="mx-auto flex h-12 max-w-5xl items-center gap-1 px-2">
          {chromeButton(
            t("閉じる", "Close"),
            <XIcon className="size-5" />,
            onClose,
          )}
          <div className="min-w-0 flex-1 px-1">
            <div className="truncate font-bold text-sm">{props.title}</div>
            {props.authorName && (
              <div
                className="truncate text-xs"
                style={{ color: palette.muted }}
              >
                {props.authorName}
              </div>
            )}
          </div>
          {chromeButton(
            t("目次", "Contents"),
            <ListIcon className="size-5" />,
            () => setPanel(panel === "toc" ? null : "toc"),
            panel === "toc",
          )}
          {chromeButton(
            t("しおりの一覧", "Bookmarks"),
            <span className="relative">
              <BookmarkIcon className="size-5" />
              {progress.bookmarks.length > 0 && (
                <span
                  className="-top-1.5 -right-2 absolute min-w-4 rounded-full px-1 text-center font-bold text-[10px] leading-4"
                  style={{ background: palette.accent, color: palette.page }}
                >
                  {progress.bookmarks.length}
                </span>
              )}
            </span>,
            () => setPanel(panel === "bookmarks" ? null : "bookmarks"),
            panel === "bookmarks",
          )}
          {chromeButton(
            t("文字と表示の設定", "Display settings"),
            <TypeIcon className="size-5" />,
            () => setPanel(panel === "settings" ? null : "settings"),
            panel === "settings",
          )}
          {canFullscreen &&
            chromeButton(
              fullscreen
                ? t("全画面をやめる", "Exit full screen")
                : t("全画面", "Full screen"),
              fullscreen ? (
                <MinimizeIcon className="size-5" />
              ) : (
                <MaximizeIcon className="size-5" />
              ),
              toggleFullscreen,
            )}
          <button
            type="button"
            onClick={toggleBookmark}
            disabled={visibleContentPages.length === 0}
            className="ml-1 flex h-9 items-center gap-1 rounded-full px-3 font-bold text-xs disabled:opacity-40"
            style={{
              background: isBookmarked ? palette.accent : "transparent",
              color: isBookmarked ? palette.page : palette.chromeText,
              border: `1px solid ${isBookmarked ? palette.accent : palette.border}`,
            }}
          >
            <BookmarkIcon
              className="size-4"
              fill={isBookmarked ? "currentColor" : "none"}
            />
            {isBookmarked ? t("しおり済み", "Saved") : t("しおり", "Bookmark")}
          </button>
        </div>
      </div>

      {/* 下のツールバー */}
      <div
        className="absolute right-0 bottom-0 left-0 z-30 transition-all duration-200"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          background: palette.chrome,
          borderTop: `1px solid ${palette.border}`,
          transform: chromeVisible ? "none" : "translateY(110%)",
          opacity: chromeVisible ? 1 : 0,
          backdropFilter: eink ? undefined : "blur(10px)",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-0.5 px-4 pt-2 pb-2">
          <div
            className="flex items-center justify-between gap-2 text-xs"
            style={{ color: palette.muted }}
          >
            <span className="min-w-0 truncate">
              {currentChapter ?? props.title}
            </span>
            <span className="shrink-0 tabular-nums">
              {page === 0
                ? pagesPerView === 2
                  ? `${t("扉", "Title")}・1 / ${contentPages}`
                  : t("扉", "Title page")
                : `${Math.max(1, page)}${pagesPerView === 2 && page + 1 < totalPages ? `–${page + 1}` : ""} / ${contentPages}`}
              {remainingMinutes > 0 &&
                ` ・ ${t(`残り約${remainingMinutes}分`, `~${remainingMinutes} min left`)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {chromeButton(
              forwardIsLeft
                ? t("次のページ", "Next")
                : t("前のページ", "Previous"),
              <ChevronLeftIcon className="size-5" />,
              forwardIsLeft ? goForward : goBackward,
            )}
            <input
              type="range"
              className="rb-range min-w-0 flex-1"
              min={0}
              max={Math.max(0, totalPages - 1)}
              step={pagesPerView}
              value={page}
              dir={forwardIsLeft ? "rtl" : "ltr"}
              aria-label={t("ページを移動", "Go to page")}
              onChange={(event) =>
                goTo(Number(event.target.value), { animate: false })
              }
            />
            {chromeButton(
              forwardIsLeft
                ? t("前のページ", "Previous")
                : t("次のページ", "Next"),
              <ChevronRightIcon className="size-5" />,
              forwardIsLeft ? goBackward : goForward,
            )}
          </div>
        </div>
      </div>

      {/* 続きから開いたこと・操作の案内 */}
      {(resumed || hint) && (
        <div className="pointer-events-none absolute right-0 bottom-28 left-0 z-40 flex justify-center px-4">
          <div
            className="rb-fade-in pointer-events-auto flex max-w-md items-center gap-3 rounded-full px-4 py-2 text-sm shadow-lg"
            style={{
              background: palette.chrome,
              color: palette.chromeText,
              border: `1px solid ${palette.border}`,
            }}
          >
            {resumed ? (
              <>
                <span>
                  {t(
                    `前回の続き（${Math.max(1, page)}ページ）から開きました`,
                    `Resumed at page ${Math.max(1, page)}`,
                  )}
                </span>
                <button
                  type="button"
                  className="font-bold underline underline-offset-2"
                  style={{ color: palette.accent }}
                  onClick={() => {
                    anchorRef.current = null
                    goTo(0)
                  }}
                >
                  {t("最初から", "From start")}
                </button>
              </>
            ) : (
              <span>
                {forwardIsLeft
                  ? t(
                      "左をタップ・右へスワイプで次のページ。真ん中でメニュー",
                      "Tap left or swipe right for next page. Tap center for menu",
                    )
                  : t(
                      "右をタップ・左へスワイプで次のページ。真ん中でメニュー",
                      "Tap right or swipe left for next page. Tap center for menu",
                    )}
              </span>
            )}
          </div>
        </div>
      )}

      {panel !== null && (
        <div
          className="rb-fade-in absolute inset-x-0 bottom-0 z-50 mx-auto flex max-h-[78%] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:top-14 sm:right-3 sm:bottom-auto sm:left-auto sm:max-h-[80%] sm:w-[380px] sm:rounded-2xl"
          style={{
            // 後ろの本文が透けると読みにくいので、パネルは不透明にする
            background: palette.page,
            color: palette.chromeText,
            border: `1px solid ${palette.border}`,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="font-bold text-sm">
              {panel === "settings"
                ? t("文字と表示", "Display")
                : panel === "toc"
                  ? t("目次", "Contents")
                  : t("しおり", "Bookmarks")}
            </div>
            {chromeButton(
              t("閉じる", "Close"),
              <XIcon className="size-4" />,
              () => setPanel(null),
            )}
          </div>
          <div className="min-h-0 overflow-y-auto px-4 pb-4">
            {panel === "settings" && (
              <SettingsPanel
                settings={settings}
                onChange={updateSettings}
                palette={palette}
                fontSize={fontSize}
                t={t}
              />
            )}
            {panel === "toc" && (
              <ListPanel
                palette={palette}
                empty={t("見出しがありません", "No headings")}
                items={[
                  {
                    key: "title",
                    label: t("扉", "Title page"),
                    detail: "",
                    onClick: () => {
                      anchorRef.current = null
                      goTo(0)
                      setPanel(null)
                    },
                    active: page === 0,
                  },
                  ...tocItems.map((item) => ({
                    key: `h${item.block}`,
                    label: item.text,
                    detail: String(item.page),
                    indent: item.level >= 3,
                    active: currentChapter === item.text,
                    onClick: () => {
                      goTo(item.page)
                      setPanel(null)
                    },
                  })),
                ]}
              />
            )}
            {panel === "bookmarks" && (
              <ListPanel
                palette={palette}
                empty={t(
                  "しおりはまだありません。上の「しおり」で今のページにはさめます",
                  "No bookmarks yet. Use the Bookmark button to save this page.",
                )}
                items={[...bookmarkPages]
                  .sort((a, b) => a.page - b.page)
                  .map((item) => ({
                    key: `${item.bookmark.block}-${item.bookmark.fragment}-${item.bookmark.createdAt}`,
                    label:
                      item.bookmark.excerpt || t("（挿絵など）", "(image)"),
                    detail: `${item.page + 1}${t("ページ", "")}`,
                    sub: new Date(item.bookmark.createdAt).toLocaleDateString(),
                    onClick: () => {
                      goTo(item.page + 1)
                      setPanel(null)
                    },
                    onRemove: () => removeBookmark(item.bookmark),
                  }))}
                removeLabel={t("しおりを外す", "Remove")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(content, document.body)
}

type Translate = ReturnType<typeof useTranslation>

function TitlePage(props: {
  title: string
  authorName?: string
  coverUrl?: string
  palette: (typeof PALETTES)[ReaderTheme]
  vertical: boolean
  charCount: number
  t: Translate
}): ReactNode {
  const minutes = Math.max(1, Math.ceil(props.charCount / CHARS_PER_MINUTE))
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 py-10 text-center">
      {props.coverUrl && (
        <div
          className="flex min-h-0 w-full flex-1 items-center justify-center"
          style={{ maxHeight: "52%" }}
        >
          <img
            src={props.coverUrl}
            alt=""
            className="max-h-full max-w-[82%] rounded-sm object-contain"
            style={{
              boxShadow:
                props.palette.shadow === "none"
                  ? "0 0 0 1px #000"
                  : "0 10px 24px -10px rgba(0,0,0,0.45)",
            }}
          />
        </div>
      )}
      <div
        className="h-px w-16"
        style={{ background: props.palette.accent, opacity: 0.6 }}
      />
      <h1
        className="font-bold"
        style={{
          fontFamily: "var(--rb-font)",
          fontSize: "clamp(18px, 4.2vmin, 30px)",
          lineHeight: 1.5,
          letterSpacing: "0.08em",
          color: props.palette.text,
          fontFeatureSettings: '"palt"',
        }}
      >
        {props.title}
      </h1>
      {props.authorName && (
        <div
          style={{
            fontFamily: "var(--rb-font)",
            fontSize: 14,
            letterSpacing: "0.2em",
            color: props.palette.muted,
          }}
        >
          {props.authorName}
        </div>
      )}
      <div
        className="text-xs"
        style={{ color: props.palette.muted, letterSpacing: "0.08em" }}
      >
        {props.t(
          `${props.charCount.toLocaleString()}文字・約${minutes}分`,
          `${props.charCount.toLocaleString()} chars · ~${minutes} min`,
        )}
        {props.vertical ? props.t("・縦書き", " · vertical") : ""}
      </div>
    </div>
  )
}

function Segmented<T extends string>(props: {
  value: T
  options: { value: T; label: string; style?: CSSProperties }[]
  onChange: (value: T) => void
  palette: (typeof PALETTES)[ReaderTheme]
}): ReactNode {
  return (
    <div
      className="grid gap-1 rounded-xl p-1"
      style={{
        gridTemplateColumns: `repeat(${props.options.length}, minmax(0, 1fr))`,
        background: props.palette.border,
      }}
    >
      {props.options.map((option) => {
        const active = option.value === props.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => props.onChange(option.value)}
            className="rounded-lg px-1 py-2 text-xs leading-tight transition-colors [word-break:keep-all]"
            style={{
              background: active ? props.palette.page : "transparent",
              color: active ? props.palette.text : props.palette.chromeText,
              fontWeight: active ? 700 : 400,
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.15)" : undefined,
              ...option.style,
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function SettingsPanel(props: {
  settings: ReaderSettings
  onChange: (patch: Partial<ReaderSettings>) => void
  palette: (typeof PALETTES)[ReaderTheme]
  fontSize: number
  t: Translate
}): ReactNode {
  const { settings, onChange, palette, t } = props
  const row = (label: string, control: ReactNode) => (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="text-xs" style={{ color: palette.muted }}>
        {label}
      </div>
      {control}
    </div>
  )
  const sizeButton = (delta: number, label: string, size: number) => (
    <button
      type="button"
      aria-label={label}
      disabled={
        settings.fontSize + delta < 0 ||
        settings.fontSize + delta > FONT_SIZES.length - 1
      }
      onClick={() => onChange({ fontSize: settings.fontSize + delta })}
      className="flex size-10 shrink-0 items-center justify-center rounded-full font-bold disabled:opacity-30"
      style={{ border: `1px solid ${palette.border}`, fontSize: size }}
    >
      あ
    </button>
  )
  return (
    <div
      className="flex flex-col divide-y"
      style={{ borderColor: palette.border }}
    >
      {row(
        t(
          `文字の大きさ（${props.fontSize}px）`,
          `Text size (${props.fontSize}px)`,
        ),
        <div className="flex items-center gap-3">
          {sizeButton(-1, t("小さく", "Smaller"), 12)}
          <input
            type="range"
            className="rb-range min-w-0 flex-1"
            min={0}
            max={FONT_SIZES.length - 1}
            value={settings.fontSize}
            aria-label={t("文字の大きさ", "Text size")}
            onChange={(event) =>
              onChange({ fontSize: Number(event.target.value) })
            }
          />
          {sizeButton(1, t("大きく", "Larger"), 19)}
        </div>,
      )}
      {row(
        t("書体", "Font"),
        <Segmented<ReaderFont>
          palette={palette}
          value={settings.font}
          onChange={(font) => onChange({ font })}
          options={(Object.keys(FONT_LABELS) as ReaderFont[]).map((font) => ({
            value: font,
            label: FONT_LABELS[font],
            style: { fontFamily: FONT_FAMILIES[font] },
          }))}
        />,
      )}
      {row(
        t("組み方", "Writing mode"),
        <Segmented
          palette={palette}
          value={settings.writing}
          onChange={(writing) => onChange({ writing })}
          options={[
            { value: "vertical", label: t("縦書き", "Vertical") },
            { value: "horizontal", label: t("横書き", "Horizontal") },
          ]}
        />,
      )}
      {row(
        t("背景", "Theme"),
        <Segmented<ReaderTheme>
          palette={palette}
          value={settings.theme}
          onChange={(theme) => onChange({ theme })}
          options={(Object.keys(THEME_LABELS) as ReaderTheme[]).map(
            (theme) => ({
              value: theme,
              label: t(THEME_LABELS[theme], theme),
              style: {
                background:
                  theme === settings.theme ? PALETTES[theme].page : undefined,
                color:
                  theme === settings.theme ? PALETTES[theme].text : undefined,
              },
            }),
          )}
        />,
      )}
      {row(
        t("ページの表示", "Pages"),
        <Segmented<ReaderLayout>
          palette={palette}
          value={settings.layout}
          onChange={(layout) => onChange({ layout })}
          options={[
            { value: "auto", label: t("自動", "Auto") },
            { value: "single", label: t("1ページ", "Single") },
            { value: "spread", label: t("見開き", "Spread") },
          ]}
        />,
      )}
      {row(
        t("行間", "Line spacing"),
        <Segmented<ReaderLineHeight>
          palette={palette}
          value={settings.lineHeight}
          onChange={(lineHeight) => onChange({ lineHeight })}
          options={[
            { value: "tight", label: t("狭い", "Tight") },
            { value: "normal", label: t("標準", "Normal") },
            { value: "loose", label: t("広い", "Loose") },
          ]}
        />,
      )}
      <ToggleRow
        palette={palette}
        label={t("空行を詰める", "Compact blank lines")}
        description={t(
          "1行ずつ空いた文章を、本のように詰めて表示します",
          "Show blank lines at half height like a printed book",
        )}
        checked={settings.compactBlankLines}
        onChange={(compactBlankLines) => onChange({ compactBlankLines })}
      />
      <ToggleRow
        palette={palette}
        label={t("めくるときの動き", "Page turn animation")}
        checked={settings.pageAnimation}
        onChange={(pageAnimation) => onChange({ pageAnimation })}
      />
    </div>
  )
}

function ToggleRow(props: {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
  palette: (typeof PALETTES)[ReaderTheme]
}): ReactNode {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-3">
      <span className="flex flex-col">
        <span className="text-sm">{props.label}</span>
        {props.description && (
          <span className="text-xs" style={{ color: props.palette.muted }}>
            {props.description}
          </span>
        )}
      </span>
      <input
        type="checkbox"
        className="size-5 shrink-0"
        style={{ accentColor: props.palette.accent }}
        checked={props.checked}
        onChange={(event) => props.onChange(event.target.checked)}
      />
    </label>
  )
}

function ListPanel(props: {
  items: {
    key: string
    label: string
    detail: string
    sub?: string
    indent?: boolean
    active?: boolean
    onClick: () => void
    onRemove?: () => void
  }[]
  empty: string
  removeLabel?: string
  palette: (typeof PALETTES)[ReaderTheme]
}): ReactNode {
  if (props.items.length === 0) {
    return (
      <div
        className="py-6 text-center text-sm"
        style={{ color: props.palette.muted }}
      >
        {props.empty}
      </div>
    )
  }
  return (
    <ul className="flex flex-col">
      {props.items.map((item) => (
        <li
          key={item.key}
          className="flex items-center gap-2"
          style={{ borderBottom: `1px solid ${props.palette.border}` }}
        >
          <button
            type="button"
            onClick={item.onClick}
            className="flex min-w-0 flex-1 items-baseline gap-3 py-3 text-left"
            style={{
              paddingLeft: item.indent ? 14 : 0,
              color: item.active ? props.palette.accent : undefined,
              fontWeight: item.active ? 700 : 400,
            }}
          >
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-sm">{item.label}</span>
              {item.sub && (
                <span
                  className="text-xs"
                  style={{ color: props.palette.muted }}
                >
                  {item.sub}
                </span>
              )}
            </span>
            <span
              className="shrink-0 text-xs tabular-nums"
              style={{ color: props.palette.muted }}
            >
              {item.detail}
            </span>
          </button>
          {item.onRemove && (
            <button
              type="button"
              aria-label={props.removeLabel}
              title={props.removeLabel}
              onClick={item.onRemove}
              className="flex size-8 shrink-0 items-center justify-center rounded-full"
              style={{ color: props.palette.muted }}
            >
              <XIcon className="size-4" />
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
