import { useEffect, useMemo, useRef, useState } from "react"
import {
  type GachaDirection,
  type GachaHint,
  type GachaItem,
  gachaRarityRank,
  hintOf,
} from "~/components/gacha/gacha-direction"
import { gachaSound } from "~/components/gacha/gacha-sound"
import { cn } from "~/lib/utils"

/**
 * 3D を使わないガチャ演出（派手め）。読み込むのは景品の絵とぴくたーちゃんの絵 3 枚だけ。
 * 光る玉が落ちてきて力をため（集中線・吸い込まれる光・揺れ）→ 昇格 → 大爆発（閃光・衝撃波・後光・紙吹雪）
 * → SSR 以上はぴくたーちゃんのカットイン → カードを低いレア度から 1 枚ずつめくる（SSR 以上はためてから）。
 * 確定の文字は出さず、色で見せる。画面を押すと次へ進む
 */

const PICTOR = {
  hello: "/images/pictor-chan/gacha-loading.webp",
  wow: "/images/pictor-chan/gacha-wow.webp",
  nice: "/images/pictor-chan/gacha-nice.webp",
}

type Phase = "intro" | "charge" | "promote" | "burst" | "cutIn" | "cards"

const PHASE_SECONDS: Record<Exclude<Phase, "cards">, number> = {
  intro: 0.9,
  charge: 1.7,
  promote: 1.0,
  burst: 0.9,
  cutIn: 1.7,
}

const HINT_COLOR: Record<GachaHint, string> = {
  blue: "#4fb2ff",
  purple: "#b76bff",
  gold: "#ffc53d",
  rainbow: "#ff7ad9",
  legend: "#fff4d0",
}

const rainbowAt = (t: number, offset = 0) =>
  `hsl(${(((t * 240 + offset) % 360) + 360) % 360} 100% 65%)`

/** UUR の白金の光（白・金・淡い水色を行き来する） */
const legendAt = (t: number, offset = 0) => {
  const k = Math.sin(t * 5 + offset / 40)
  return `hsl(${48 + 150 * Math.max(0, -k) ** 3} ${70 + 30 * Math.abs(k)}% ${82 + 12 * k}%)`
}

const colorOf = (hint: GachaHint, t: number, offset = 0) =>
  hint === "rainbow"
    ? rainbowAt(t, offset)
    : hint === "legend"
      ? legendAt(t, offset)
      : HINT_COLOR[hint]

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  spin: number
  angle: number
  color: string
  kind: "confetti" | "spark" | "star" | "coin" | "inward"
}

const RARITY_FRAME: Record<GachaItem["rarity"], string> = {
  N: "from-slate-300 to-slate-500",
  R: "from-sky-300 to-blue-600",
  SR: "from-fuchsia-300 to-violet-600",
  SSR: "from-yellow-200 via-amber-400 to-orange-500",
  UR: "from-pink-400 via-yellow-300 to-sky-400",
  UUR: "from-amber-100 via-white to-amber-300",
}

const RARITY_BADGE: Record<GachaItem["rarity"], string> = {
  N: "bg-zinc-500",
  R: "bg-blue-600",
  SR: "bg-violet-600",
  SSR: "bg-gradient-to-r from-amber-300 to-orange-500 text-black",
  UR: "bg-gradient-to-r from-pink-400 via-yellow-300 to-sky-400 text-black",
  UUR: "bg-gradient-to-r from-zinc-950 via-amber-700 to-zinc-950 text-amber-50 ring-1 ring-amber-200",
}

const STYLE = `
@keyframes g2d-pop { 0% { transform: translate(-50%, 40%) scale(.2) rotate(-20deg); opacity: 0 } 60% { transform: translate(-50%, -6%) scale(1.12) rotate(6deg); opacity: 1 } 100% { transform: translate(-50%, 0) scale(1) rotate(0) } }
@keyframes g2d-hop { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, -10px) } }
@keyframes g2d-cutin { 0% { transform: translateX(120%) skewX(-12deg) } 18% { transform: translateX(0) skewX(-12deg) } 82% { transform: translateX(-4%) skewX(-12deg) } 100% { transform: translateX(-130%) skewX(-12deg) } }
@keyframes g2d-cutin-chara { 0% { transform: translateX(80%) scale(1.3) } 20% { transform: translateX(0) scale(1.05) } 80% { transform: translateX(-6%) scale(1.1) } 100% { transform: translateX(-120%) scale(1.2) } }
@keyframes g2d-deal { 0% { transform: translateY(70vh) rotate(25deg) scale(.4); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes g2d-shake { 0%, 100% { transform: translate(0, 0) rotate(0) } 20% { transform: translate(-3px, 1px) rotate(-2deg) } 40% { transform: translate(3px, -1px) rotate(2deg) } 60% { transform: translate(-2px, -1px) rotate(-1deg) } 80% { transform: translate(2px, 1px) rotate(1deg) } }
@keyframes g2d-rays { to { transform: translate(-50%, -50%) rotate(360deg) } }
@keyframes g2d-glow { 0%, 100% { box-shadow: 0 0 14px 3px var(--glow) } 50% { box-shadow: 0 0 34px 10px var(--glow) } }
@keyframes g2d-new { 0% { transform: scale(0) rotate(-30deg) } 70% { transform: scale(1.3) rotate(8deg) } 100% { transform: scale(1) rotate(-8deg) } }
@keyframes g2d-hue { to { filter: hue-rotate(360deg) } }
@keyframes g2d-stamp { 0% { transform: translate(-50%, -50%) scale(3.2) rotate(-14deg); opacity: 0 } 18% { transform: translate(-50%, -50%) scale(.9) rotate(-8deg); opacity: 1 } 28% { transform: translate(-50%, -50%) scale(1.08) rotate(-8deg) } 80% { transform: translate(-50%, -50%) scale(1) rotate(-8deg); opacity: 1 } 100% { transform: translate(-50%, -60%) scale(1.1) rotate(-8deg); opacity: 0 } }
@keyframes g2d-flash { from { opacity: .85 } to { opacity: 0 } }
@keyframes g2d-sheen { from { background-position: 0% 50% } to { background-position: 200% 50% } }
`

/** めくったときに弾ける粒の色 */
const RARITY_SPARK: Record<GachaItem["rarity"], string> = {
  N: "#e2e8f0",
  R: "#60a5fa",
  SR: "#c084fc",
  SSR: "#fbbf24",
  UR: "rainbow",
  UUR: "legend",
}

/** めくったときの大きな文字（色で見せたあと、結果として出す） */
const STAMP_TEXT: Partial<Record<GachaItem["rarity"], string>> = {
  SR: "SR!",
  SSR: "SSR!!",
  UR: "UR!!!",
  UUR: "UUR!!!!",
}

const GLOW: Record<GachaItem["rarity"], string> = {
  N: "transparent",
  R: "rgba(96,165,250,.55)",
  SR: "rgba(192,132,252,.7)",
  SSR: "rgba(251,191,36,.9)",
  UR: "rgba(244,114,182,.95)",
  UUR: "rgba(255,244,208,1)",
}

type Props = {
  items: readonly GachaItem[]
  direction: GachaDirection
  onComplete: () => void
  /** 外から「スキップ」を押されたら増やす */
  skipSignal: number
  /** 結果の画面で下のボタンの帯が使う高さ（px）。カードをその上に収める */
  bottomInset?: number
}

export function GachaPerformance2D(props: Props): React.ReactNode {
  const { items, direction } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phases = useMemo(() => {
    const list: Phase[] = ["intro", "charge"]
    if (direction.promoteTo) list.push("promote")
    list.push("burst")
    if (direction.cutIn) list.push("cutIn")
    list.push("cards")
    return list
  }, [direction])
  const [phaseIndex, setPhaseIndex] = useState(0)
  const phase = phases[phaseIndex]
  /** めくった枚数（低いレア度から） */
  const [flipped, setFlipped] = useState(0)
  const [dealt, setDealt] = useState(false)
  /** SSR 以上をめくる前にためている */
  const [charging, setCharging] = useState(false)
  const [shake, setShake] = useState(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef(new Map<number, HTMLDivElement>())
  /** canvas に粒を出してもらう場所（カードをめくったとき） */
  const burstQueueRef = useRef<
    { x: number; y: number; rarity: GachaItem["rarity"] }[]
  >([])
  const [stamp, setStamp] = useState<{
    rarity: GachaItem["rarity"]
    key: number
  } | null>(null)
  const [flash, setFlash] = useState<{ color: string; key: number } | null>(
    null,
  )

  /** めくった瞬間: カードから粒が弾け、音が鳴り、SR 以上は大きな文字、SSR 以上は画面が光って跳ねる */
  const popCard = (index: number, rarity: GachaItem["rarity"]) => {
    const rank = gachaRarityRank(rarity)
    const card = cardRefs.current.get(index)
    const root = rootRef.current
    if (card && root) {
      const a = card.getBoundingClientRect()
      const b = root.getBoundingClientRect()
      burstQueueRef.current.push({
        x: a.left - b.left + a.width / 2,
        y: a.top - b.top + a.height / 2,
        rarity,
      })
    }
    gachaSound.flip(rank)
    if (STAMP_TEXT[rarity]) setStamp({ rarity, key: Date.now() })
    if (rank >= 3) {
      setFlash({
        color: rank >= 5 ? "#ffffff" : rank >= 4 ? "#ffd6f5" : "#fff3c4",
        key: Date.now(),
      })
      root?.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.06) translate(-6px, 4px)" },
          { transform: "scale(.98) translate(6px, -4px)" },
          { transform: "scale(1.02) translate(-3px, 2px)" },
          { transform: "scale(1)" },
        ],
        { duration: 450, easing: "ease-out" },
      )
      navigator.vibrate?.(
        rank >= 5 ? [60, 30, 60, 30, 160] : rank >= 4 ? [40, 30, 90] : 40,
      )
    }
  }

  // 画面を揺らす（要素を作り直すと canvas が消えるので、Web Animations で揺らす）
  useEffect(() => {
    if (shake === 0) return
    rootRef.current?.animate(
      [
        { transform: "translate(0, 0)" },
        { transform: "translate(-9px, 5px)" },
        { transform: "translate(8px, -6px)" },
        { transform: "translate(-5px, -3px)" },
        { transform: "translate(4px, 3px)" },
        { transform: "translate(0, 0)" },
      ],
      { duration: 380, easing: "ease-out" },
    )
  }, [shake])

  const revealOrder = useMemo(
    () =>
      items
        .map((item, index) => ({ item, index }))
        .sort(
          (a, b) =>
            gachaRarityRank(a.item.rarity) - gachaRarityRank(b.item.rarity) ||
            a.index - b.index,
        )
        .map((entry) => entry.index),
    [items],
  )
  const flippedSet = useMemo(
    () => new Set(revealOrder.slice(0, flipped)),
    [revealOrder, flipped],
  )
  const nextIndex = revealOrder[flipped]
  const nextItem = nextIndex === undefined ? null : items[nextIndex]

  const nextPhase = () =>
    setPhaseIndex((index) => Math.min(index + 1, phases.length - 1))

  /* ---- 場面の時間で進める ---- */
  useEffect(() => {
    if (phase === "cards") return
    const timer = window.setTimeout(nextPhase, PHASE_SECONDS[phase] * 1000)
    if (phase === "intro") gachaSound.drop()
    if (phase === "charge") gachaSound.charge(PHASE_SECONDS.charge)
    if (phase === "promote") gachaSound.promote()
    if (phase === "cutIn") gachaSound.cutIn()
    if (phase === "burst") {
      gachaSound.burst(gachaRarityRank(direction.top) >= 3)
      setShake((value) => value + 1)
      navigator.vibrate?.(
        direction.top === "UUR"
          ? [80, 40, 80, 40, 200]
          : direction.top === "UR"
            ? [60, 40, 120]
            : 50,
      )
    }
    return () => window.clearTimeout(timer)
  }, [phase])

  /* ---- カードを配って、1 枚ずつめくる ---- */
  useEffect(() => {
    if (phase !== "cards") return
    const timer = window.setTimeout(() => {
      setDealt(true)
      gachaSound.deal(items.length)
    }, 50)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== "cards" || !dealt) return
    if (!nextItem) {
      props.onComplete()
      return
    }
    const rank = gachaRarityRank(nextItem.rarity)
    const firstDelay = flipped === 0 ? 0.36 + items.length * 0.045 : 0
    if (rank >= 3) {
      // ためる → めくる
      const tension = rank >= 4 ? 1.1 : 0.75
      const start = window.setTimeout(
        () => {
          setCharging(true)
          gachaSound.tension(tension)
        },
        (firstDelay + 0.25) * 1000,
      )
      const flip = window.setTimeout(
        () => {
          setCharging(false)
          setFlipped((value) => value + 1)
          popCard(nextIndex, nextItem.rarity)
        },
        (firstDelay + 0.25 + tension) * 1000,
      )
      return () => {
        window.clearTimeout(start)
        window.clearTimeout(flip)
      }
    }
    const timer = window.setTimeout(
      () => {
        setFlipped((value) => value + 1)
        popCard(nextIndex, nextItem.rarity)
      },
      (firstDelay + 0.11) * 1000,
    )
    return () => window.clearTimeout(timer)
  }, [phase, dealt, flipped])

  /* ---- スキップ: カードの場面へ、カードなら全部めくる ---- */
  const skipRef = useRef(props.skipSignal)
  useEffect(() => {
    if (props.skipSignal === skipRef.current) return
    skipRef.current = props.skipSignal
    if (phaseRef.current !== "cards") {
      setPhaseIndex(phases.length - 1)
      return
    }
    setCharging(false)
    setFlipped(items.length)
  }, [props.skipSignal, phases.length, items.length])

  const onTap = () => {
    if (phase === "cards") return
    // 演出の途中は画面を押すと次の場面へ（爆発とカットインはそのまま見せる）
    if (phase === "intro" || phase === "charge" || phase === "promote")
      nextPhase()
  }

  /* ---- canvas の効果（玉・集中線・粒・閃光・後光） ---- */
  const burstAtRef = useRef(0)
  useEffect(() => {
    if (phase === "burst") burstAtRef.current = performance.now()
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const g = canvas.getContext("2d")
    if (!g) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    const particles: Particle[] = []
    let phaseStartedAt = performance.now()
    let lastPhase = phaseRef.current
    let lastTime = performance.now()
    let raf = 0
    const actual = hintOf(direction.top)

    const spawnBurst = (cx: number, cy: number, hint: GachaHint) => {
      const count =
        direction.top === "UUR"
          ? 380
          : direction.top === "UR"
            ? 260
            : direction.top === "SSR"
              ? 200
              : 140
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const speed = 260 + Math.random() * 900
        const kinds: Particle["kind"][] = [
          "confetti",
          "confetti",
          "spark",
          "star",
          "coin",
        ]
        const kind = kinds[Math.floor(Math.random() * kinds.length)]
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 200,
          life: 0,
          max: 1.6 + Math.random() * 1.6,
          size:
            kind === "spark" ? 2 + Math.random() * 3 : 6 + Math.random() * 9,
          spin: (Math.random() - 0.5) * 14,
          angle: Math.random() * Math.PI,
          color:
            kind === "coin"
              ? "#ffd34d"
              : hint === "rainbow" || Math.random() < 0.35
                ? `hsl(${Math.random() * 360} 95% 65%)`
                : HINT_COLOR[hint],
          kind,
        })
      }
    }

    /** カードをめくった場所から弾ける粒（レア度が高いほど多く・遠くへ） */
    const spawnPop = (cx: number, cy: number, rarity: GachaItem["rarity"]) => {
      const rank = gachaRarityRank(rarity)
      const count = [12, 20, 46, 130, 200][rank]
      const reach = [160, 220, 380, 700, 900][rank]
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const speed = reach * (0.3 + Math.random() * 0.7)
        const kind: Particle["kind"] =
          rank <= 1
            ? "spark"
            : (
                [
                  "confetti",
                  "spark",
                  "star",
                  rank >= 3 ? "coin" : "star",
                ] as const
              )[Math.floor(Math.random() * 4)]
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - (rank >= 3 ? 220 : 80),
          life: 0,
          max: 0.6 + rank * 0.35 + Math.random() * 0.5,
          size:
            kind === "spark"
              ? 2 + Math.random() * (2 + rank)
              : 5 + Math.random() * 8,
          spin: (Math.random() - 0.5) * 14,
          angle: Math.random() * Math.PI,
          color:
            RARITY_SPARK[rarity] === "legend"
              ? Math.random() < 0.5
                ? "#ffffff"
                : `hsl(${40 + Math.random() * 16} 100% ${70 + Math.random() * 20}%)`
              : RARITY_SPARK[rarity] === "rainbow"
                ? `hsl(${Math.random() * 360} 95% 65%)`
                : kind === "coin"
                  ? "#ffd34d"
                  : Math.random() < 0.25
                    ? "#ffffff"
                    : RARITY_SPARK[rarity],
          kind,
        })
      }
    }

    const drawStar = (r: number) => {
      g.beginPath()
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r
        const a = (i * Math.PI) / 5 - Math.PI / 2
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
      }
      g.closePath()
      g.fill()
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const current = phaseRef.current
      if (current !== lastPhase) {
        phaseStartedAt = now
        if (current === "burst") spawnBurst(w / 2, h * 0.42, actual)
        if (current === "promote")
          spawnBurst(w / 2, h * 0.42, direction.promoteTo ?? actual)
        lastPhase = current
      }
      for (const pop of burstQueueRef.current.splice(0)) {
        spawnPop(pop.x, pop.y, pop.rarity)
      }
      // カードの場面では、SSR 以上が出ていれば紙吹雪とコインを降らせ続ける
      if (
        current === "cards" &&
        gachaRarityRank(direction.top) >= 3 &&
        particles.length < 400 &&
        Math.random() <
          (direction.top === "UUR" ? 0.95 : direction.top === "UR" ? 0.7 : 0.45)
      ) {
        const kind: Particle["kind"] = Math.random() < 0.3 ? "coin" : "confetti"
        particles.push({
          x: Math.random() * w,
          y: -12,
          vx: (Math.random() - 0.5) * 40,
          vy: 60 + Math.random() * 60,
          life: 0,
          max: 4 + Math.random() * 2,
          size: 6 + Math.random() * 7,
          spin: (Math.random() - 0.5) * 10,
          angle: Math.random() * Math.PI,
          color:
            kind === "coin"
              ? "#ffd34d"
              : direction.top === "UUR"
                ? Math.random() < 0.5
                  ? "#ffffff"
                  : "#f8e7a8"
                : direction.top === "UR"
                  ? `hsl(${Math.random() * 360} 95% 65%)`
                  : Math.random() < 0.5
                    ? "#fbbf24"
                    : "#fff3c4",
          kind,
        })
      }
      const pt = (now - phaseStartedAt) / 1000
      const t = now / 1000
      const cx = w / 2
      const cy = h * 0.42
      const hint: GachaHint =
        current === "intro" || current === "charge"
          ? direction.hint
          : current === "promote" && pt < 0.25
            ? direction.hint
            : (direction.promoteTo ?? direction.hint)

      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, w, h)

      // 背景: 暗い夜空にうずまく色
      const bg = g.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h))
      const tint = current === "cards" ? colorOf(actual, t) : colorOf(hint, t)
      bg.addColorStop(0, tint)
      bg.addColorStop(0.18, "rgba(40,20,90,.95)")
      bg.addColorStop(1, "#07051a")
      g.globalAlpha = current === "cards" ? 0.55 : 1
      g.fillStyle = "#07051a"
      g.fillRect(0, 0, w, h)
      g.fillStyle = bg
      g.fillRect(0, 0, w, h)
      g.globalAlpha = 1

      // 回る後光（爆発のあと・カードの場面でも薄く）
      if (current !== "intro") {
        const strength =
          current === "charge"
            ? Math.min(1, pt / PHASE_SECONDS.charge) * 0.35
            : current === "cards"
              ? 0.18
              : 0.6
        g.save()
        g.translate(cx, cy)
        g.rotate(t * (current === "charge" ? 0.6 + pt : 0.5))
        const rays = 18
        for (let i = 0; i < rays; i++) {
          g.rotate((Math.PI * 2) / rays)
          g.fillStyle = colorOf(current === "cards" ? actual : hint, t, i * 20)
          g.globalAlpha = strength * (i % 2 ? 0.5 : 1)
          g.beginPath()
          g.moveTo(0, 0)
          g.lineTo(-Math.max(w, h) * 0.09, -Math.max(w, h))
          g.lineTo(Math.max(w, h) * 0.09, -Math.max(w, h))
          g.closePath()
          g.fill()
        }
        g.restore()
        g.globalAlpha = 1
      }

      // 集中線（ためているとき）
      if (current === "charge" || current === "promote") {
        const k =
          current === "charge" ? Math.min(1, pt / PHASE_SECONDS.charge) : 1
        g.strokeStyle = "rgba(255,255,255,.75)"
        g.lineCap = "round"
        for (let i = 0; i < 70; i++) {
          const a = Math.random() * Math.PI * 2
          const r0 = Math.max(w, h) * (0.32 + Math.random() * 0.1 - k * 0.1)
          const r1 = Math.max(w, h) * 0.8
          g.lineWidth = 0.6 + Math.random() * 2.2 * k
          g.globalAlpha = 0.25 + k * 0.5
          g.beginPath()
          g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
          g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
          g.stroke()
        }
        g.globalAlpha = 1
        // 吸い込まれる光
        if (Math.random() < 0.9) {
          for (let i = 0; i < 4; i++) {
            const a = Math.random() * Math.PI * 2
            const r = Math.max(w, h) * 0.55
            particles.push({
              x: cx + Math.cos(a) * r,
              y: cy + Math.sin(a) * r,
              vx: 0,
              vy: 0,
              life: 0,
              max: 0.6,
              size: 2 + Math.random() * 3,
              spin: 0,
              angle: a,
              color: colorOf(hint, t, Math.random() * 120),
              kind: "inward",
            })
          }
        }
      }

      // 光る玉
      if (
        current === "intro" ||
        current === "charge" ||
        current === "promote"
      ) {
        const drop = current === "intro" ? Math.min(1, pt / 0.6) : 1
        const bounce =
          current === "intro"
            ? (1 - drop) * -h * 0.6 +
              Math.sin(Math.min(1, pt / 0.9) * Math.PI) *
                -18 *
                (pt > 0.6 ? 1 : 0)
            : 0
        const k =
          current === "charge"
            ? pt / PHASE_SECONDS.charge
            : current === "promote"
              ? 1
              : 0
        const shakeAmp =
          current === "charge" ? k * k * 10 : current === "promote" ? 12 : 0
        const ox = (Math.random() - 0.5) * shakeAmp
        const oy = (Math.random() - 0.5) * shakeAmp
        const pulse = 1 + Math.sin(t * (8 + k * 20)) * 0.05 * (0.4 + k)
        const r =
          Math.min(w, h) *
          0.16 *
          pulse *
          (current === "promote"
            ? 1 + Math.sin(Math.min(1, pt / 0.3) * Math.PI) * 0.35
            : 1)
        const x = cx + ox
        const y = cy + oy + bounce
        const glow = g.createRadialGradient(x, y, r * 0.2, x, y, r * 3.2)
        glow.addColorStop(0, colorOf(hint, t))
        glow.addColorStop(1, "rgba(0,0,0,0)")
        g.fillStyle = glow
        g.globalAlpha = 0.55 + k * 0.4
        g.beginPath()
        g.arc(x, y, r * 3.2, 0, Math.PI * 2)
        g.fill()
        g.globalAlpha = 1
        const body = g.createRadialGradient(
          x - r * 0.35,
          y - r * 0.4,
          r * 0.1,
          x,
          y,
          r,
        )
        body.addColorStop(0, "#ffffff")
        body.addColorStop(0.35, colorOf(hint, t, 40))
        body.addColorStop(1, colorOf(hint, t, 120))
        g.fillStyle = body
        g.beginPath()
        g.arc(x, y, r, 0, Math.PI * 2)
        g.fill()
        // ひび（ための後半と昇格）
        if (k > 0.6) {
          g.strokeStyle = "#fff"
          g.lineWidth = 2.5
          g.globalAlpha = Math.min(1, (k - 0.6) * 3)
          for (let i = 0; i < 5; i++) {
            const a = i * 1.3 + 0.4
            g.beginPath()
            g.moveTo(x, y)
            g.lineTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5 + 6)
            g.lineTo(
              x + Math.cos(a + 0.3) * r * 0.95,
              y + Math.sin(a + 0.3) * r * 0.95,
            )
            g.stroke()
          }
          g.globalAlpha = 1
        }
      }

      // 衝撃波
      if (current === "burst" || current === "promote") {
        const p = Math.min(1, pt / 0.7)
        for (let i = 0; i < 3; i++) {
          const q = Math.max(0, p - i * 0.12)
          g.strokeStyle = colorOf(hint, t, i * 60)
          g.globalAlpha = (1 - q) * 0.9
          g.lineWidth = 18 * (1 - q) + 2
          g.beginPath()
          g.arc(cx, cy, q * Math.max(w, h) * 0.9, 0, Math.PI * 2)
          g.stroke()
        }
        g.globalAlpha = 1
      }

      // 粒
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life += dt
        if (p.life > p.max) {
          particles.splice(i, 1)
          continue
        }
        if (p.kind === "inward") {
          const k = p.life / p.max
          const r = Math.max(w, h) * 0.55 * (1 - k)
          p.x = cx + Math.cos(p.angle) * r
          p.y = cy + Math.sin(p.angle) * r
        } else {
          p.vy += (p.kind === "confetti" ? 380 : 620) * dt
          p.vx *= 1 - (p.kind === "confetti" ? 2.2 : 1.2) * dt
          p.vy *= 1 - (p.kind === "confetti" ? 2.2 : 0.6) * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.angle += p.spin * dt
        }
        g.globalAlpha = Math.min(1, (p.max - p.life) * 2)
        g.fillStyle = p.color
        g.save()
        g.translate(p.x, p.y)
        g.rotate(p.angle)
        if (p.kind === "confetti") {
          g.scale(1, Math.cos(p.life * 9 + p.spin))
          g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else if (p.kind === "star") {
          drawStar(p.size * 0.7)
        } else if (p.kind === "coin") {
          g.scale(Math.cos(p.life * 8), 1)
          g.beginPath()
          g.arc(0, 0, p.size * 0.6, 0, Math.PI * 2)
          g.fill()
          g.strokeStyle = "#b8860b"
          g.lineWidth = 1.5
          g.stroke()
        } else {
          g.beginPath()
          g.arc(0, 0, p.size, 0, Math.PI * 2)
          g.fill()
        }
        g.restore()
      }
      g.globalAlpha = 1

      // 閃光
      const sinceBurst = (now - burstAtRef.current) / 1000
      if (sinceBurst < 0.5) {
        g.fillStyle = "#fff"
        g.globalAlpha = Math.max(0, 1 - sinceBurst / 0.5)
        g.fillRect(0, 0, w, h)
        g.globalAlpha = 1
      }
      if (current === "promote" && pt < 0.35) {
        g.fillStyle = colorOf(direction.promoteTo ?? hint, t)
        g.globalAlpha = Math.max(0, 0.8 - pt * 2.3)
        g.fillRect(0, 0, w, h)
        g.globalAlpha = 1
      }

      // 画面のふちを景品の色で光らせる（SSR 以上）
      if (
        (current === "burst" || current === "cutIn" || current === "cards") &&
        gachaRarityRank(direction.top) >= 3
      ) {
        const edge = 26
        const pulse = 0.55 + Math.sin(t * 5) * 0.25
        for (const [x0, y0, x1, y1] of [
          [0, 0, 0, edge],
          [0, h, 0, h - edge],
          [0, 0, edge, 0],
          [w, 0, w - edge, 0],
        ] as const) {
          const grad = g.createLinearGradient(x0, y0, x1, y1)
          grad.addColorStop(0, colorOf(actual, t, x0 + y0))
          grad.addColorStop(1, "rgba(0,0,0,0)")
          g.fillStyle = grad
          g.globalAlpha = pulse
          if (x0 === x1) g.fillRect(0, Math.min(y0, y1), w, edge)
          else g.fillRect(Math.min(x0, x1), 0, edge, h)
        }
        g.globalAlpha = 1
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [direction])

  const isSingle = items.length === 1
  const topColor = HINT_COLOR[hintOf(direction.top)]

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 画面を押すと次へ（スキップのボタンは別にある）
    // biome-ignore lint/a11y/noStaticElementInteractions: 同上
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden"
      onClick={onTap}
    >
      <style>{STYLE}</style>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* ぴくたーちゃん（玉を見守る） */}
      {(phase === "intro" || phase === "charge" || phase === "promote") && (
        <img
          src={phase === "intro" ? PICTOR.hello : PICTOR.wow}
          alt=""
          className="pointer-events-none absolute bottom-[6%] left-1/2 h-[26vh] max-h-[240px] w-auto drop-shadow-[0_8px_16px_rgba(0,0,0,.5)]"
          style={{
            animation:
              phase === "intro"
                ? "g2d-pop .6s cubic-bezier(.2,1.6,.4,1) both"
                : "g2d-hop .5s ease-in-out infinite",
          }}
        />
      )}

      {/* カットイン（SSR 以上）: 斜めの帯にぴくたーちゃん */}
      {phase === "cutIn" && (
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div
            className="absolute inset-x-[-20%] h-[34%]"
            style={{
              background:
                direction.top === "UUR"
                  ? "linear-gradient(100deg,#05040a 0%,#3b2a06 22%,#f8e7a8 40%,#ffffff 50%,#f8e7a8 60%,#3b2a06 78%,#05040a 100%)"
                  : direction.top === "UR"
                    ? "linear-gradient(90deg,#ff5fae,#ffd84d,#5fe0ff,#b88cff,#ff5fae)"
                    : `linear-gradient(90deg,${topColor},#fff3c4,${topColor})`,
              backgroundSize: direction.top === "UUR" ? "200% 100%" : undefined,
              animation: `g2d-cutin ${PHASE_SECONDS.cutIn}s cubic-bezier(.2,.9,.3,1) both${direction.top === "UR" ? ", g2d-hue 1.2s linear infinite" : direction.top === "UUR" ? ", g2d-sheen .9s linear infinite" : ""}`,
              boxShadow: `0 0 40px 10px ${topColor}`,
            }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,.9) 0 3px, transparent 3px 34px)",
              }}
            />
          </div>
          <img
            src={PICTOR.nice}
            alt=""
            className="relative mx-auto h-[42%] w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,.45)]"
            style={{
              animation: `g2d-cutin-chara ${PHASE_SECONDS.cutIn}s cubic-bezier(.2,.9,.3,1) both`,
            }}
          />
        </div>
      )}

      {/* SSR 以上をめくった瞬間の光 */}
      {flash && (
        <div
          key={flash.key}
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background: `radial-gradient(circle, #fff 0%, ${flash.color} 45%, transparent 85%)`,
            animation: "g2d-flash .5s ease-out both",
          }}
        />
      )}

      {/* めくったときの大きな文字 */}
      {stamp && (
        <div
          key={stamp.key}
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 z-30 whitespace-nowrap font-black italic tracking-tight",
            stamp.rarity === "UUR"
              ? "text-[min(24vw,150px)]"
              : stamp.rarity === "UR"
                ? "text-[min(26vw,140px)]"
                : stamp.rarity === "SSR"
                  ? "text-[min(22vw,120px)]"
                  : "text-[min(16vw,84px)]",
          )}
          style={{
            animation: `g2d-stamp ${stamp.rarity === "SR" ? 0.8 : stamp.rarity === "UUR" ? 2 : 1.2}s cubic-bezier(.2,1.4,.4,1) both${stamp.rarity === "UR" ? ", g2d-hue 1s linear infinite" : ""}`,
            color: stamp.rarity === "SR" ? "#e9d5ff" : "#fff7d6",
            WebkitTextStroke:
              stamp.rarity === "SR"
                ? "3px #7c3aed"
                : stamp.rarity === "UUR"
                  ? "4px #1c1405"
                  : "4px #ea580c",
            textShadow:
              stamp.rarity === "UUR"
                ? "0 0 18px #fff, 0 0 42px #f8e7a8, 0 0 80px #fde68a, 0 7px 0 #3b2a06"
                : stamp.rarity === "UR"
                  ? "0 0 24px #ff5fae, 0 0 48px #5fe0ff, 0 6px 0 #9d174d"
                  : stamp.rarity === "SSR"
                    ? "0 0 24px #fbbf24, 0 6px 0 #9a3412"
                    : "0 0 18px #a855f7, 0 4px 0 #4c1d95",
          }}
        >
          {STAMP_TEXT[stamp.rarity]}
        </div>
      )}

      {/* カード */}
      {phase === "cards" && (
        <div
          className={cn(
            "absolute inset-x-0 top-[max(56px,env(safe-area-inset-top))] flex flex-wrap content-center items-center justify-center gap-2 px-3",
            isSingle && "gap-0",
          )}
          style={{ perspective: "900px", bottom: props.bottomInset ?? 176 }}
        >
          {items.map((item, index) => {
            const isFlipped = flippedSet.has(index)
            const isCharging = charging && index === nextIndex
            const rank = gachaRarityRank(item.rarity)
            const order = revealOrder.indexOf(index)
            return (
              <div
                key={item.id}
                ref={(element) => {
                  if (element) cardRefs.current.set(index, element)
                  else cardRefs.current.delete(index)
                }}
                className={cn(
                  "relative",
                  isSingle ? "w-[min(58vw,240px)]" : "w-[min(22vw,100px)]",
                )}
                style={{
                  aspectRatio: "3 / 4.3",
                  animation: dealt
                    ? `g2d-deal .36s ${index * 0.045}s cubic-bezier(.2,1.3,.4,1) both`
                    : undefined,
                  opacity: dealt ? undefined : 0,
                }}
              >
                {/* 後光（SSR 以上をめくったとき・ためているとき） */}
                {(isCharging || (isFlipped && rank >= 3)) && (
                  <div
                    className="pointer-events-none absolute top-1/2 left-1/2 h-[230%] w-[230%] rounded-full"
                    style={{
                      background: `repeating-conic-gradient(${GLOW[item.rarity]} 0 10deg, transparent 10deg 22deg)`,
                      animation: "g2d-rays 4s linear infinite",
                      maskImage:
                        "radial-gradient(circle, #000 20%, transparent 68%)",
                      WebkitMaskImage:
                        "radial-gradient(circle, #000 20%, transparent 68%)",
                    }}
                  />
                )}
                <div
                  className="relative h-full w-full transition-transform duration-[380ms]"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    animation: isCharging
                      ? "g2d-shake .18s linear infinite"
                      : undefined,
                  }}
                >
                  {/* 裏 */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-xl border-2 border-white/70 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400"
                    style={
                      {
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        "--glow": isCharging
                          ? GLOW[item.rarity]
                          : "rgba(255,255,255,.25)",
                        animation: isCharging
                          ? "g2d-glow .4s ease-in-out infinite"
                          : undefined,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 25% 25%, #fff 0 2px, transparent 3px), radial-gradient(circle at 75% 70%, #fff 0 2px, transparent 3px)",
                        backgroundSize: "22px 22px",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-white/90 drop-shadow">
                      ★
                    </div>
                    <div className="absolute bottom-1 w-full text-center font-bold text-[9px] text-white/70">
                      {order + 1}
                    </div>
                  </div>
                  {/* 表 */}
                  <div
                    className={cn(
                      "absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br p-[3px]",
                      RARITY_FRAME[item.rarity],
                    )}
                    style={
                      {
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        "--glow": GLOW[item.rarity],
                        animation:
                          isFlipped && rank >= 2
                            ? `g2d-glow 1.4s ease-in-out infinite${rank === 4 ? ", g2d-hue 2s linear infinite" : ""}`
                            : undefined,
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex h-full w-full flex-col items-center rounded-[10px] bg-slate-900/85 p-1.5 text-white">
                      <span
                        className={cn(
                          "self-start rounded-full px-1.5 font-black text-[10px]",
                          RARITY_BADGE[item.rarity],
                        )}
                      >
                        {item.rarity}
                      </span>
                      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="max-h-full w-full object-contain"
                        />
                      </div>
                      <div
                        className={cn(
                          "w-full truncate text-center font-bold",
                          isSingle ? "text-sm" : "text-[10px]",
                        )}
                      >
                        {item.name}
                      </div>
                      {item.note && (
                        <div className="text-[9px] opacity-70">{item.note}</div>
                      )}
                    </div>
                    {item.isNew && isFlipped && (
                      <span
                        className="absolute top-1 right-1 rounded-full bg-pink-500 px-1.5 font-black text-[9px] text-white shadow"
                        style={{
                          animation:
                            "g2d-new .4s cubic-bezier(.2,1.6,.4,1) both",
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
