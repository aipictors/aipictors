import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { HomeSectionHeading } from "~/routes/($lang)._main._index/components/home-section-heading"
import type { HomeTopCreator } from "~/routes/($lang)._main._index/home-loader.server"
import {
  type GridColumnBreakpoint,
  incompleteRowHiddenClassName,
} from "~/utils/grid-layout"
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

/** クリエイターのアイコンの列数（4 / sm:6 / lg:12）。最後の段が埋まらない人はその幅でだけ隠す */
const CREATOR_BREAKPOINTS: GridColumnBreakpoint[] = [
  { columns: 4, hiddenClassName: "max-sm:hidden" },
  { columns: 6, hiddenClassName: "sm:max-lg:hidden" },
  { columns: 12, hiddenClassName: "lg:hidden" },
]

/**
 * 新規クリエイター（はじめて作品を投稿した人）。PC は右カラムの新規コメントの上（variant="sidebar"）、
 * 右カラムのないスマホは作品の一覧の後ろに出す
 */
export function HomeNewCreators(props: {
  users: { id: string; login: string; name: string; iconUrl: string | null }[]
  isSensitive?: boolean
  /** 右カラム用（4 列・小さめの見出しとアイコン） */
  variant?: "main" | "sidebar"
  className?: string
}) {
  const t = useTranslation()
  const prefix = props.isSensitive ? "/r" : ""
  const isSidebar = props.variant === "sidebar"
  // 1 段（4 人）に満たないときは出さない
  if (props.users.length < 4) return null
  // 右カラムは 4 列。最後の段が埋まらない人は隠す
  const sidebarVisibleCount = props.users.length - (props.users.length % 4)
  return (
    <section className={cn("space-y-2.5", props.className)}>
      {isSidebar ? (
        <h2 className="font-bold text-sm">
          {t("新規クリエイター", "New creators")}
        </h2>
      ) : (
        <HomeSectionHeading
          title={t("新規クリエイター", "New creators")}
          description={t(
            "はじめて作品を投稿した人たち",
            "People who just posted their first work",
          )}
        />
      )}
      <ul
        className={cn(
          "grid grid-cols-4 gap-x-2 gap-y-3",
          !isSidebar && "sm:grid-cols-6 lg:grid-cols-12",
        )}
      >
        {props.users.map((user, index) => {
          const name = user.name?.length ? user.name : "名無し"
          return (
            <li
              key={user.id}
              className={cn(
                "min-w-0",
                isSidebar
                  ? index >= sidebarVisibleCount && "hidden"
                  : incompleteRowHiddenClassName(
                      index,
                      props.users.length,
                      CREATOR_BREAKPOINTS,
                    ),
              )}
            >
              <Link
                to={`${prefix}/users/${encodeURIComponent(user.login)}`}
                className="group flex flex-col items-center gap-1.5"
              >
                {user.iconUrl ? (
                  <img
                    src={toResizedImageUrl(user.iconUrl, 128) ?? user.iconUrl}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "rounded-full bg-muted object-cover",
                      isSidebar ? "size-12" : "size-14",
                    )}
                  />
                ) : (
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-full bg-muted font-bold text-lg text-muted-foreground",
                      isSidebar ? "size-12" : "size-14",
                    )}
                  >
                    {name.slice(0, 1)}
                  </span>
                )}
                <span className="w-full truncate text-center text-xs group-hover:underline">
                  {name}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
