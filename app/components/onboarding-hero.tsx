import { cn } from "~/lib/utils"

const PICTOR_IMAGES = {
  wow: "/images/pictor-chan/gacha-wow.webp",
  nice: "/images/pictor-chan/gacha-nice.webp",
} as const

type Props = Readonly<{
  /** ぴくたーちゃんの表情 */
  pose: keyof typeof PICTOR_IMAGES
  /** ふきだしの一言（変わるたびにふわっと出し直す） */
  line: string
  title: string
  description?: string
  className?: string
}>

/**
 * 登録の手順の見出し。ぴくたーちゃんがふきだしで話しかける
 */
export function OnboardingHero(props: Props): React.ReactNode {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-50 via-teal-50 to-orange-50 p-4 pr-32 dark:from-cyan-950/40 dark:via-teal-950/30 dark:to-orange-950/30",
        props.className,
      )}
    >
      {/* 背景の丸いぼかし */}
      <div className="-top-10 -left-8 pointer-events-none absolute size-32 rounded-full bg-cyan-300/30 blur-2xl" />
      <div className="-bottom-12 pointer-events-none absolute right-16 size-36 rounded-full bg-orange-300/30 blur-2xl" />

      <div className="relative space-y-2">
        <p
          key={props.line}
          className="relative inline-block rounded-2xl rounded-br-sm bg-white px-3 py-1.5 font-semibold text-sm text-teal-700 shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-90 motion-safe:duration-300 dark:bg-white/10 dark:text-teal-200"
        >
          {props.line}
        </p>
        <h1 className="font-bold text-xl leading-tight md:text-2xl">
          {props.title}
        </h1>
        {props.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {props.description}
          </p>
        )}
      </div>

      <img
        src={PICTOR_IMAGES[props.pose]}
        alt=""
        width={112}
        height={150}
        fetchPriority="high"
        className="-bottom-3 pointer-events-none absolute right-1 h-[150px] w-auto drop-shadow-md motion-safe:animate-[aip-float_3.2s_ease-in-out_infinite]"
      />
    </div>
  )
}
