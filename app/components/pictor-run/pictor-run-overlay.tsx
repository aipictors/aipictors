import { XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "~/hooks/use-translation"
import type { PictorRunGame } from "~/components/pictor-run/pictor-run-game.client"

type Props = Readonly<{
  onClose: () => void
}>

type Phase = "loading" | "ready" | "running" | "over" | "failed"

const MODEL_URL = "/images/pictor-chan/pictor-chan-3d-v2.glb"
const BEST_KEY = "pictor-run-best"

const readBest = () => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * 404 ページの隠しゲーム「ぴくたーちゃんラン」の画面。
 * 開いたときに初めて、ゲーム本体（three.js）と 3D モデルを読み込む
 */
export default function PictorRunOverlay(props: Props): React.ReactNode {
  const t = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<PictorRunGame | null>(null)
  const [phase, setPhase] = useState<Phase>("loading")
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    setBest(readBest())

    void (async () => {
      try {
        const { createPictorRunGame } = await import(
          "~/components/pictor-run/pictor-run-game.client"
        )
        if (cancelled) return
        const game = await createPictorRunGame(canvas, MODEL_URL, {
          onStart: () => {
            setScore(0)
            setCoins(0)
            setPhase("running")
          },
          onScore: (nextScore, nextCoins) => {
            setScore(nextScore)
            setCoins(nextCoins)
          },
          onGameOver: (finalScore) => {
            const previous = readBest()
            setIsNewBest(finalScore > previous)
            if (finalScore > previous) {
              setBest(finalScore)
              try {
                window.localStorage.setItem(BEST_KEY, String(finalScore))
              } catch {
                // 保存できなくても遊べる
              }
            }
            setPhase("over")
          },
        })
        if (cancelled) {
          game.dispose()
          return
        }
        gameRef.current = game
        setPhase("ready")
      } catch {
        if (!cancelled) setPhase("failed")
      }
    })()

    return () => {
      cancelled = true
      gameRef.current?.dispose()
      gameRef.current = null
    }
  }, [])

  const { onClose } = props

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const retry = () => {
    gameRef.current?.restart()
    setScore(0)
    setCoins(0)
    setPhase("ready")
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("ぴくたーちゃんラン", "Pictor-chan Run")}
      className="fixed inset-0 z-100 select-none overflow-hidden text-slate-800"
      style={{
        background:
          "linear-gradient(180deg, #7cc8ff 0%, #b9e6ff 48%, #e9f9ff 78%, #f4fff1 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full touch-none"
        style={{ width: "100%", height: "100%" }}
      />

      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 font-black text-lg tabular-nums md:text-2xl">
        <span className="rounded-full bg-white/80 px-4 py-1.5 shadow-sm">
          {score}
          <span className="ml-1 font-bold text-xs md:text-sm">m</span>
        </span>
        <span className="rounded-full bg-white/80 px-4 py-1.5 text-amber-500 shadow-sm">
          ● {coins}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={t("とじる", "Close")}
        className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
      >
        <XIcon aria-hidden="true" className="size-5" />
      </button>

      {phase === "loading" && (
        <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center font-bold text-lg">
          {t("よみこみ中…", "Loading…")}
        </p>
      )}

      {phase === "failed" && (
        <p className="absolute inset-x-0 top-1/3 px-6 text-center font-bold">
          {t(
            "ごめんなさい、この端末ではゲームを表示できませんでした。",
            "Sorry, the game could not be displayed on this device.",
          )}
        </p>
      )}

      {phase === "ready" && (
        <div className="pointer-events-none absolute inset-x-0 top-[18%] flex flex-col items-center gap-2 px-6 text-center">
          <p className="font-black text-3xl text-white drop-shadow-[0_2px_0_rgba(29,47,143,0.55)] md:text-5xl">
            {t("ぴくたーちゃんラン", "Pictor-chan Run")}
          </p>
          <p className="rounded-full bg-white/85 px-5 py-2 font-bold text-sm shadow-sm md:text-base">
            {t(
              "タップ / スペースキーでジャンプ（空中でもう 1 回）",
              "Tap / Space to jump (once more in mid-air)",
            )}
          </p>
        </div>
      )}

      {phase === "over" && (
        <div className="absolute inset-x-0 top-[14%] flex justify-center px-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-white/92 px-6 py-5 text-center shadow-lg">
            <p className="font-black text-xl">
              {isNewBest
                ? t("じこベスト更新！", "New best!")
                : t("ころんじゃった…！", "Oops, I tripped!")}
            </p>
            <p className="font-black text-5xl tabular-nums">
              {score}
              <span className="ml-1 font-bold text-base">m</span>
            </p>
            <p className="font-medium text-slate-500 text-sm tabular-nums">
              {t(
                `コイン ${coins} まい ・ ベスト ${best} m`,
                `${coins} coins · Best ${best} m`,
              )}
            </p>
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={retry}
                className="h-11 flex-1 cursor-pointer rounded-full bg-clear-bright-blue font-bold text-sm text-white transition-opacity hover:opacity-90"
              >
                {t("もう一度", "Play again")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-11 flex-1 cursor-pointer rounded-full border bg-white font-bold text-sm transition-colors hover:bg-slate-50"
              >
                {t("おわる", "Quit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
