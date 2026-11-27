import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { HomeSectionHeading } from "~/routes/($lang)._main._index/components/home-section-heading"
import type { HomeTopCreator } from "~/routes/($lang)._main._index/home-loader.server"
import { toResizedImageUrl } from "~/utils/resized-image-url"

/**
 * トップの作品以外の入口（ちちぷいのトップの「モデルから作品をさがす」「おすすめのユーザー」にあたる）
 */

/**
 * モデルから作品をさがすに並べるモデル（作品の多い順。モデルのページ /models/{名前} がある名前だけ）
 */
const HOME_MODEL_NAMES = [
  "StableDiffusion",
  "NovelAI",
  "Chat GPT",
  "GeminiNanoBanana",
  "blazingDrive",
  "Midjourney",
  "Gemini",
  "Grok",
  "vxpILXL",
  "4o Image Generation",
]

export function HomeModelLinks(props: { isSensitive?: boolean }) {
  const t = useTranslation()
  const prefix = props.isSensitive ? "/r" : ""
  return (
    <section className="space-y-2.5">
      <HomeSectionHeading
        title={t("モデルから作品をさがす", "Browse by AI model")}
        link="/models"
        linkLabel={t("すべて見る", "See all")}
      />
      <ul className="flex flex-wrap gap-2">
        {HOME_MODEL_NAMES.map((name) => (
          <li key={name}>
            <Link
              to={`${prefix}/models/${encodeURIComponent(name)}`}
              className="block rounded-full border px-3.5 py-1.5 font-medium text-sm transition-colors hover:bg-muted"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * 人気のクリエイター（前日のユーザーランキングの上位）
 */
export function HomeTopCreators(props: {
  creators: HomeTopCreator[]
  isSensitive?: boolean
}) {
  const t = useTranslation()
  const prefix = props.isSensitive ? "/r" : ""
  if (props.creators.length === 0) return null
  return (
    <section className="space-y-2.5">
      <HomeSectionHeading
        title={t("人気のクリエイター", "Popular creators")}
        link={`${prefix}/rankings?type=users`}
        linkLabel={t("すべて見る", "See all")}
      />
      <ul className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-6 lg:grid-cols-12">
        {props.creators.map((creator, index) => (
          <li key={creator.id} className="min-w-0">
            <Link
              to={`${prefix}/users/${encodeURIComponent(creator.login)}`}
              className="group flex flex-col items-center gap-1.5"
            >
              <span className="relative">
                {creator.iconUrl ? (
                  <img
                    src={
                      toResizedImageUrl(creator.iconUrl, 128) ?? creator.iconUrl
                    }
                    alt={creator.name}
                    loading="lazy"
                    decoding="async"
                    className="size-14 rounded-full bg-muted object-cover"
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-full bg-muted font-bold text-lg text-muted-foreground">
                    {creator.name.slice(0, 1)}
                  </span>
                )}
                <span
                  className={cn(
                    "-top-1 -left-1 absolute flex size-5 items-center justify-center rounded-full font-bold text-[10px] text-white tabular-nums",
                    index === 0
                      ? "bg-amber-500"
                      : index === 1
                        ? "bg-slate-400"
                        : index === 2
                          ? "bg-orange-700"
                          : "bg-black/60",
                  )}
                >
                  {index + 1}
                </span>
              </span>
              <span className="w-full truncate text-center text-xs group-hover:underline">
                {creator.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
