import { Link } from "@remix-run/react"
import { useRotatingHomeEvents } from "~/routes/($lang)._main._index/components/use-rotating-home-events"
import type { MicroCmsApiRelease } from "~/types/micro-cms-release-response"

type Props = {
  releases: MicroCmsApiRelease[]
}

export function HomeLoginNoticeMarquee(props: Props) {
  const { currentIndex, isVisible } = useRotatingHomeEvents(props.releases, {
    intervalMs: 4600,
    fadeMs: 900,
  })

  const currentRelease = props.releases[currentIndex]

  if (!currentRelease) {
    return null
  }

  return (
    <div className="-mx-4 border-border/40 border-b bg-muted/10 px-4 py-1.5">
      <Link
        to={`/releases/${currentRelease.id}`}
        className="flex min-h-5 items-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:text-xs"
      >
        <span className="shrink-0 uppercase tracking-[0.18em] opacity-60">
          Info
        </span>
        <p
          className={`truncate transition-opacity duration-900 ease-out ${
            isVisible ? "opacity-80" : "opacity-0"
          }`}
        >
          {currentRelease.title}
        </p>
      </Link>
    </div>
  )
}
