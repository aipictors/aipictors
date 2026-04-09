import { Link } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type RecentThemeProposal = {
  id: string
  inputTheme: string
  proposerUserId: string
  proposerName: string
  proposerIconUrl: string | null
  createdAt: number
}

type Props = {
  proposals: RecentThemeProposal[]
}

const DISPLAY_INTERVAL = 4800
const FADE_DURATION = 320

export function RecentThemeProposalBubble(props: Props) {
  const t = useTranslation()
  const [activeIndex, setActiveIndex] = useState(() =>
    props.proposals.length > 0
      ? Math.floor(Math.random() * props.proposals.length)
      : 0,
  )
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (props.proposals.length === 0) {
      return
    }

    setActiveIndex((currentIndex) => {
      if (currentIndex < props.proposals.length) {
        return currentIndex
      }

      return 0
    })
  }, [props.proposals])

  useEffect(() => {
    if (props.proposals.length <= 1) {
      return
    }

    let fadeTimeout: number | undefined

    const intervalId = window.setInterval(() => {
      setIsVisible(false)

      fadeTimeout = window.setTimeout(() => {
        setActiveIndex((currentIndex) =>
          getNextRandomIndex(props.proposals.length, currentIndex),
        )
        setIsVisible(true)
      }, FADE_DURATION)
    }, DISPLAY_INTERVAL)

    return () => {
      window.clearInterval(intervalId)

      if (fadeTimeout) {
        window.clearTimeout(fadeTimeout)
      }
    }
  }, [props.proposals.length])

  if (props.proposals.length === 0) {
    return null
  }

  const proposal = props.proposals[activeIndex]

  return (
    <div className="relative min-h-16 max-w-[320px] flex-1">
      <div className="absolute top-[26px] left-5 z-0 size-3 rotate-45 rounded-[2px] border border-orange-200/70 bg-orange-50/95 dark:border-orange-800/70 dark:bg-orange-950/90" />
      <div className="relative z-10 overflow-hidden rounded-2xl border border-orange-200/70 bg-linear-to-r from-orange-50/95 via-white to-amber-50/95 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-orange-800/70 dark:from-zinc-900 dark:via-orange-950/50 dark:to-amber-950/40 dark:text-zinc-100">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
        >
          <Link
            to={`/users/${proposal.proposerUserId}`}
            className="shrink-0"
            aria-label={proposal.proposerName}
          >
            <Avatar className="size-10 border border-white/80 shadow-sm dark:border-zinc-700">
              <AvatarImage
                src={withIconUrlFallback(proposal.proposerIconUrl)}
                alt={proposal.proposerName}
              />
              <AvatarFallback>
                {proposal.proposerName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground dark:text-zinc-400">
              <span>{t("最近の提案", "Recent proposal")}</span>
              <Link
                to={`/users/${proposal.proposerUserId}`}
                className="truncate font-medium text-foreground/80 hover:text-foreground dark:text-zinc-200 dark:hover:text-zinc-50"
              >
                {proposal.proposerName}
              </Link>
            </div>
            <p className="line-clamp-2 text-sm leading-5 text-foreground/85 dark:text-zinc-100/90">
              「{proposal.inputTheme}」
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getNextRandomIndex(length: number, currentIndex: number) {
  if (length <= 1) {
    return 0
  }

  let nextIndex = currentIndex

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length)
  }

  return nextIndex
}