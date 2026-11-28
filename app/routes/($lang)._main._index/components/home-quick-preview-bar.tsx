import { ChevronRight, X } from "lucide-react"
import { useEffect, useLayoutEffect, useMemo } from "react"
import { ReleaseTagBadge } from "~/components/release-tag-badge"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"
import { useRotatingHomeEvents } from "~/routes/($lang)._main._index/components/use-rotating-home-events"
import {
  applyHiddenNoticeCards,
  buildHomeNoticeInlineScript,
  HOME_NOTICE_HIDDEN_ATTRIBUTE,
  type HomeNoticeCard,
  type HomeNoticeKeys,
  isPinnedRelease,
  saveDismissedNoticeCard,
  toEventNoticeKeys,
  toReleaseNoticeKeys,
} from "~/routes/($lang)._main._index/utils/home-notice-dismiss"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

type Props = {
  events: HomePreviewEvent[]
  featuredReleases: MicroCmsApiRelease[]
  releaseList: MicroCmsApiReleaseResponse
}

// イベントの日時は「日本時間の壁時計を UTC として扱った秒」なので UTC の値で取り出す
// （サーバーとブラウザで同じ文字にする）
const formatEventDate = (unixTime: number) => {
  const date = new Date(unixTime * 1000)
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${month}.${day}`
}

const formatReleaseDate = (timestamp: number) => {
  const date = toJstDisplayDate(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${month}.${day}`
}

const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect

/** スマホだけに出す閉じるボタン（PC はこれまでどおり） */
function DismissButton(props: { card: HomeNoticeCard; keys: HomeNoticeKeys }) {
  const t = useTranslation()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-6 shrink-0 rounded-full md:hidden"
      aria-label={t("このお知らせを閉じる", "Dismiss")}
      title={t("閉じる（新しいお知らせが来たらまた出ます）", "Dismiss")}
      onClick={() => saveDismissedNoticeCard(props.keys, props.card)}
    >
      <X className="h-3.5 w-3.5" />
    </Button>
  )
}

export function HomeQuickPreviewBar(props: Props) {
  const t = useTranslation()
  const { currentIndex } = useRotatingHomeEvents(props.events, {
    fadeMs: 0,
    startAfterInteraction: true,
  })
  const rotatingReleases = useRotatingHomeEvents(props.featuredReleases, {
    intervalMs: 3600,
    fadeMs: 0,
    startAfterInteraction: true,
  })

  const firstEvent = props.events[currentIndex]
  const firstRelease =
    props.featuredReleases[rotatingReleases.currentIndex] ??
    props.releaseList.contents[0]

  // スマホでは閉じたら次から出さない（中身が新しくなるとまた出る）。
  // メンテナンスなど大事なお知らせが入っているあいだは、サイトのお知らせの枠は閉じられない
  const releaseCandidates =
    props.featuredReleases.length > 0
      ? props.featuredReleases
      : props.releaseList.contents.slice(0, 1)
  const isReleasePinned = releaseCandidates.some((release) =>
    isPinnedRelease(release),
  )
  const eventKeysText = JSON.stringify(toEventNoticeKeys(props.events))
  const releaseKeysText = isReleasePinned
    ? null
    : JSON.stringify(toReleaseNoticeKeys(releaseCandidates))
  const noticeKeys = useMemo<HomeNoticeKeys>(
    () => ({
      events: JSON.parse(eventKeysText),
      ...(releaseKeysText === null
        ? {}
        : { releases: JSON.parse(releaseKeysText) }),
    }),
    [eventKeysText, releaseKeysText],
  )

  // クライアントでの画面の切り替えでは下のスクリプトが動かないので、描画の前に記録を当てる
  useIsomorphicLayoutEffect(() => {
    applyHiddenNoticeCards(noticeKeys)
    return () => {
      document.documentElement.removeAttribute(HOME_NOTICE_HIDDEN_ATTRIBUTE)
    }
  }, [noticeKeys])

  return (
    <div data-home-notice-bar="" className="grid gap-2 md:grid-cols-2">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: 閉じた記録で最初の描画から隠す（中身はこちらで作った鍵だけ）
        dangerouslySetInnerHTML={{
          __html: buildHomeNoticeInlineScript(noticeKeys),
        }}
      />
      <div
        data-home-notice-card="events"
        className="rounded-xl border bg-card px-3 py-2 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-xs">
              {t("開催イベント", "Current events")}
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-full"
          >
            <Link
              to="/events"
              aria-label={t("イベント一覧へ", "Go to events")}
              title={t("イベント一覧へ", "Go to events")}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <DismissButton card="events" keys={noticeKeys} />
        </div>

        {firstEvent ? (
          // 切り替えは下から少しずらして出すだけにする（薄くフェードさせると、途中の薄い文字が読みにくかった）
          <div
            key={currentIndex}
            className="motion-safe:slide-in-from-bottom-1 motion-safe:animate-in motion-safe:duration-300"
          >
            <Link
              to={`/events/${firstEvent.slug}`}
              className="mt-1.5 block rounded-md px-1 py-0.5 transition-colors hover:bg-muted/40"
            >
              {/* スマホでは題名だけにして（期間・主催者は省く）、作品が早く見えるようにする */}
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Badge className="shrink-0 px-1.5 py-0 text-[10px]">
                  {firstEvent.status === "ONGOING"
                    ? t("開催中", "Ongoing")
                    : t("予定", "Upcoming")}
                </Badge>
                <span className="line-clamp-1 min-w-0 flex-1 text-sm">
                  {t.text(firstEvent.title) || "See the event"}
                </span>
              </div>
              <div className="mt-0.5 hidden truncate text-[11px] text-muted-foreground md:block">
                {formatEventDate(firstEvent.startAt)} -{" "}
                {formatEventDate(firstEvent.endAt)}
                {firstEvent.tags[0] && t.text(firstEvent.tags[0])
                  ? `${t(" ・ ", " · ")}#${t.text(firstEvent.tags[0])}`
                  : ""}
              </div>
              <div className="mt-0.5 hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
                <Avatar className="size-4">
                  {firstEvent.userIconUrl && (
                    <AvatarImage
                      src={toIconImageUrl(firstEvent.userIconUrl)}
                      alt=""
                    />
                  )}
                  <AvatarFallback className="text-[9px]">
                    {(firstEvent.userName ?? "A").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="line-clamp-1">
                  {firstEvent.userName ?? "Aipictors"}
                </span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="mt-1.5 px-1 py-0.5 text-muted-foreground text-xs">
            {t("表示できるイベントはありません", "There are no events to show")}
          </div>
        )}
      </div>

      <div
        data-home-notice-card={isReleasePinned ? undefined : "releases"}
        className="rounded-xl border bg-card px-3 py-2 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-xs">
              {t("サイトのお知らせ", "Site announcements")}
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-full"
          >
            <Link
              to="/releases"
              aria-label={t("お知らせ一覧へ", "Go to announcements")}
              title={t("お知らせ一覧へ", "Go to announcements")}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {!isReleasePinned && (
            <DismissButton card="releases" keys={noticeKeys} />
          )}
        </div>

        {firstRelease ? (
          <div
            key={rotatingReleases.currentIndex}
            className="motion-safe:slide-in-from-bottom-1 motion-safe:animate-in motion-safe:duration-300"
          >
            <Link
              to={`/releases/${firstRelease.id}`}
              className="mt-1.5 block rounded-md px-1 py-0.5 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-2">
                <ReleaseTagBadge
                  tag={firstRelease.tag}
                  className="px-1.5 py-0 text-[10px]"
                />
                <span className="line-clamp-1 flex-1 text-sm">
                  {t.text(firstRelease.title) || "See the latest news"}
                </span>
              </div>
              <div className="mt-0.5 hidden text-[11px] text-muted-foreground md:block">
                {formatReleaseDate(firstRelease.createdAt)}
              </div>
            </Link>
          </div>
        ) : (
          <div className="mt-1.5 px-1 py-0.5 text-muted-foreground text-xs">
            {t(
              "表示できるお知らせはありません",
              "There are no announcements to show",
            )}
          </div>
        )}
      </div>
    </div>
  )
}
