import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type {
  HelpBubblePosition,
  HelpMangaPanel,
  HelpText,
} from "~/routes/($lang)._main.help._index/components/help-sections"

/** 4 コマの絵の置き場所（public/images/help-manga/） */
export const helpMangaImageUrl = (image: string) =>
  `/images/help-manga/${image}.webp`

const BUBBLE_POSITION_CLASS: Record<HelpBubblePosition, string> = {
  tl: "left-[3%] top-[4%]",
  tr: "right-[3%] top-[4%]",
  bl: "bottom-[16%] left-[3%]",
  br: "right-[3%] bottom-[16%]",
  tc: "left-1/2 top-[4%] -translate-x-1/2",
}

/** 吹き出しのしっぽの向き（コマの中央のほう＝ぴくたーちゃんのほうへ） */
const TAIL_CLASS: Record<HelpBubblePosition, string> = {
  tl: "-bottom-[9px] right-[22%] rotate-45 border-r-[3px] border-b-[3px]",
  tr: "-bottom-[9px] left-[22%] rotate-45 border-r-[3px] border-b-[3px]",
  bl: "-top-[9px] right-[22%] rotate-45 border-l-[3px] border-t-[3px]",
  br: "-top-[9px] left-[22%] rotate-45 border-l-[3px] border-t-[3px]",
  tc: "-bottom-[9px] left-1/2 -translate-x-1/2 rotate-45 border-r-[3px] border-b-[3px]",
}

/**
 * ぴくたーちゃんの 4 コマ。絵は文字なしの画像で、ナレーションと吹き出しは文字で重ねる
 * （日本語と英語を切り替えられ、検索エンジンにも読まれる）。スマホは縦に 4 つ、PC は 2×2
 */
export function HelpFourKoma(props: {
  title: HelpText
  panels: HelpMangaPanel[]
  /** 最初の章だけ画像を先に読む */
  isEager?: boolean
}) {
  const t = useTranslation()

  return (
    <figure className="overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#fffaf0] p-3 shadow-sm sm:p-4 dark:border-slate-300 dark:bg-slate-900">
      <figcaption className="mb-3 text-center font-bold text-lg text-orange-500 tracking-wide sm:text-xl">
        {t(props.title.ja, props.title.en)}
        <span className="block font-normal text-muted-foreground text-xs sm:ml-2 sm:inline sm:align-middle">
          {t("ぴくたーちゃんの4コマ", "A Pictor-chan 4-panel comic")}
        </span>
      </figcaption>
      <ol className="grid gap-3 md:grid-cols-2">
        {props.panels.map((panel, index) => {
          const caption = t(panel.caption.ja, panel.caption.en)
          return (
            <li
              key={panel.image}
              className="relative overflow-hidden rounded-md border-[3px] border-slate-800 bg-white dark:border-slate-300"
            >
              <img
                src={helpMangaImageUrl(panel.image)}
                alt={caption}
                width={960}
                height={656}
                loading={props.isEager && index < 2 ? "eager" : "lazy"}
                decoding="async"
                className="aspect-[960/656] w-full object-cover"
              />
              <span
                aria-hidden
                className="absolute bottom-1.5 left-1.5 flex size-7 items-center justify-center rounded-full bg-orange-500 font-bold text-sm text-white shadow"
              >
                {index + 1}
              </span>
              <p
                className={cn(
                  "absolute right-0 left-0 mx-auto w-fit max-w-[94%] border-2 border-slate-800 bg-amber-100 px-2 py-0.5 text-center font-medium text-[11px] text-slate-800 leading-snug shadow-sm sm:text-xs md:text-[11px] lg:text-xs",
                  panel.captionAt === "bottom" ? "bottom-2" : "top-2",
                )}
              >
                {caption}
              </p>
              {panel.bubbles.map((bubble) => (
                <p
                  key={bubble.ja}
                  className={cn(
                    "absolute max-w-[42%] rounded-2xl border-2 border-slate-800 bg-white px-2 py-1 text-center font-bold text-[11px] text-slate-800 leading-snug shadow-sm sm:max-w-[44%] sm:rounded-[1.4rem] sm:border-[3px] sm:px-3 sm:py-1.5 sm:text-sm md:text-[13px] lg:text-[15px]",
                    BUBBLE_POSITION_CLASS[bubble.at],
                    panel.captionAt === "bottom" ? "" : "mt-6 sm:mt-8",
                  )}
                >
                  {t(bubble.ja, bubble.en)}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute size-4 border-slate-800 bg-white",
                      TAIL_CLASS[bubble.at],
                    )}
                  />
                </p>
              ))}
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
