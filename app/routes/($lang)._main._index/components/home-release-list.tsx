import { Link, useNavigate } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { ReleaseTagBadge } from "~/components/release-tag-badge"
import { useTranslation } from "~/hooks/use-translation"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"
import { ChevronRight } from "lucide-react"
import { cn } from "~/lib/utils"
import { useRotatingHomeEvents } from "~/routes/($lang)._main._index/components/use-rotating-home-events"

type Props = {
  featuredReleases: MicroCmsApiRelease[]
  releaseList: MicroCmsApiReleaseResponse
}

export function HomeReleaseList ({ featuredReleases, releaseList }: Props) {
  const navigate = useNavigate()

  const onMore = () => {
    navigate("/releases")
  }

  const t = useTranslation()
  const { currentIndex, isVisible } = useRotatingHomeEvents(featuredReleases, {
    intervalMs: 4200,
    fadeMs: 260,
  })
  const featuredRelease = featuredReleases[currentIndex] ?? releaseList.contents[0]

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}.${month}.${day}`
  }

  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-left font-semibold text-sm">
            {t("サイトのお知らせ", "Site announcements")}
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            {t(
              "最新のお知らせを少しだけ表示しています",
              "A quick peek at the latest announcements",
            )}
          </p>
        </div>
        <Button
          onClick={onMore}
          variant={"ghost"}
          size="icon"
          className="size-8 shrink-0 rounded-full"
          aria-label={t("お知らせ一覧へ", "Go to announcements")}
          title={t("お知らせ一覧へ", "Go to announcements")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {featuredRelease && (
        <div
          className={cn(
            "mt-3 rounded-xl border bg-muted/30 p-3 transition-all duration-500 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-20 translate-y-1",
          )}
        >
          <Link to={`/releases/${featuredRelease.id}`} className="block space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <ReleaseTagBadge tag={featuredRelease.tag} />
              <span className="text-muted-foreground text-xs">
                {formatDate(featuredRelease.createdAt)}
              </span>
            </div>
            <p className="line-clamp-2 font-medium text-sm sm:text-base">
              {featuredRelease.title}
            </p>
          </Link>
        </div>
      )}
      <div className="mt-3 space-y-2">
        {releaseList.contents.map((release) => (
          <Link
            key={release.id}
            className="group flex items-center justify-between gap-2 rounded-lg border p-2.5 transition-colors hover:bg-muted/40 sm:gap-3"
            to={`/releases/${release.id}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-[11px] opacity-80 sm:text-xs">
                <span>{formatDate(release.createdAt)}</span>
                <ReleaseTagBadge tag={release.tag} className="px-1.5 py-0 text-[10px]" />
              </div>
              <p className="line-clamp-1 text-sm">{release.title}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </Link>
        ))}

        {releaseList.contents.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-muted-foreground text-xs">
            {t(
              "表示できるお知らせはまだありません。",
              "There are no announcements to show yet.",
            )}
          </div>
        )}
      </div>
    </div>
  )
}
