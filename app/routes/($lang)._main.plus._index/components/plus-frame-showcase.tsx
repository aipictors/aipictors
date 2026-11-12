import { UserRoundIcon } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  getPlanSpec,
  type PlanKey,
} from "~/routes/($lang)._main.plus._index/utils/plan-specs"

type Frame = {
  /** public/avatar-frames/deco の画像の名前 */
  file: string
  ja: string
  en: string
}

const groups: { plan: Exclude<PlanKey, "FREE">; frames: Frame[] }[] = [
  {
    plan: "LITE",
    frames: [
      { file: "plan-lite-silver", ja: "銀細工の輪", en: "Silver filigree" },
      { file: "plan-lite-rose", ja: "ローズゴールドの小枝", en: "Rose gold sprig" },
    ],
  },
  {
    plan: "STANDARD",
    frames: [
      { file: "plan-standard-laurel", ja: "黄金の月桂冠", en: "Golden laurel" },
      { file: "plan-standard-sapphire", ja: "蒼玉の金環", en: "Sapphire gold ring" },
    ],
  },
  {
    plan: "PREMIUM",
    frames: [
      { file: "plan-premium-crown", ja: "白金とダイヤの王冠", en: "Platinum diamond crown" },
      { file: "plan-premium-aurora", ja: "極光の星冠", en: "Aurora star diadem" },
      { file: "plan-premium-noir", ja: "漆黒と黄金の王冠", en: "Onyx and gold crown" },
    ],
  },
]

/** 動かすのはプレミアムの 1 つだけ（動く絵は 600KB ほどあるので、画面に入ってから読む） */
const ANIMATED_FILE = "plan-premium-crown"

/**
 * プラン限定のアイコン枠の見本
 */
export function PlusFrameShowcase() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const ref = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (element === null || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsInView(true)
        observer.disconnect()
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-bold text-xl md:text-2xl">
          {t("プラン限定のアイコン枠", "Plan-exclusive avatar frames")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            "プロフィールやコメントのアイコンを飾れます。上のプランほど豪華な枠が増え、下のプランの枠もすべて使えます。",
            "Dress up your avatar on your profile and comments. Higher plans add more luxurious frames, and include every frame from the plans below.",
          )}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-[2fr_2fr_3fr]">
        {groups.map((group) => {
          const spec = getPlanSpec(group.plan)
          const isPremium = group.plan === "PREMIUM"
          return (
            <div
              key={group.plan}
              className={cn(
                "rounded-2xl border bg-card p-4",
                isPremium &&
                  "border-amber-400/60 bg-gradient-to-br from-amber-500/10 via-card to-violet-500/10",
              )}
            >
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-sm">
                  {t(spec.name, spec.enName)}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t(
                    `限定 ${group.frames.length}種・合わせて ${spec.avatarFrames}種`,
                    `${group.frames.length} exclusive · ${spec.avatarFrames} in total`,
                  )}
                </span>
              </p>
              <ul className="mt-2 flex justify-around gap-1">
                {group.frames.map((frame) => (
                  <li
                    key={frame.file}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
                  >
                    {/* 装飾がアイコンの外にはみ出すぶんの余白 */}
                    <span className="flex size-24 items-center justify-center">
                      <span className="relative inline-flex size-16 shrink-0 rounded-full">
                        <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-200 to-sky-200 dark:from-violet-900 dark:to-sky-900">
                          {authContext.avatarPhotoURL ? (
                            <img
                              alt=""
                              className="h-full w-full object-cover"
                              decoding="async"
                              loading="lazy"
                              src={authContext.avatarPhotoURL}
                            />
                          ) : (
                            <UserRoundIcon className="size-9 text-white/90" />
                          )}
                        </span>
                        <picture>
                          {isInView && frame.file === ANIMATED_FILE && (
                            <source
                              media="(prefers-reduced-motion: no-preference)"
                              srcSet={`/avatar-frames/deco/${frame.file}.anim.webp?v=1`}
                            />
                          )}
                          <img
                            alt=""
                            aria-hidden
                            className="pointer-events-none absolute top-1/2 left-1/2 h-[148.4%] w-[148.4%] max-w-none -translate-x-1/2 -translate-y-1/2"
                            decoding="async"
                            height={95}
                            loading="lazy"
                            src={`/avatar-frames/deco/${frame.file}.webp?v=1`}
                            width={95}
                          />
                        </picture>
                      </span>
                    </span>
                    <span className="line-clamp-2 text-xs leading-4">
                      {t(frame.ja, frame.en)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        {t("加入後は ", "After you join, pick one in ")}
        <Link className="underline underline-offset-2" to="/settings/profile">
          {t("プロフィールの設定", "your profile settings")}
        </Link>
        {t(
          " の「枠を選ぶ」から選べます。解約すると枠は表示されなくなります。",
          " under “Choose a frame”. Frames stop showing if you cancel.",
        )}
      </p>
    </section>
  )
}
