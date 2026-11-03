import { Link } from "~/lib/app/locale-router"
import { LightbulbIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
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

/**
 * お題の提案を誘うカード（最近の提案を並べて見せる）
 */
export function ThemeProposalCta(props: Props) {
  const t = useTranslation()

  // 同じ人が続けて並ばないように、提案者ごとに1件だけ見せる
  const proposals = props.proposals
    .filter(
      (proposal, index, list) =>
        list.findIndex(
          (item) => item.proposerUserId === proposal.proposerUserId,
        ) === index,
    )
    .slice(0, 4)

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 p-4 md:flex-row md:items-center md:justify-between md:p-5 dark:border-amber-900/60 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/20">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-sm">
          <LightbulbIcon className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-base">
            {t(
              "あなたのアイデアがお題になるかも",
              "Your idea could be the next theme",
            )}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(
              "8日後以降のお題を誰でも提案できます。いいねが多い案ほど採用されやすくなります。",
              "Anyone can propose themes from 8 days ahead. Proposals with more likes are more likely to be picked.",
            )}
          </p>
          {proposals.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {proposals.map((proposal) => (
                <Link
                  key={proposal.id}
                  to="/themes/proposals"
                  className="inline-flex max-w-52 items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 py-0.5 pr-2.5 pl-0.5 text-xs transition hover:border-amber-400 dark:border-amber-900 dark:bg-zinc-900/70"
                >
                  <Avatar className="size-5">
                    <AvatarImage
                      resizeWidth={64}
                      src={withIconUrlFallback(proposal.proposerIconUrl)}
                      alt=""
                    />
                    <AvatarFallback className="text-[9px]">
                      {proposal.proposerName.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">「{proposal.inputTheme}」</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button asChild variant="outline" className="rounded-full bg-white/70 dark:bg-zinc-900/60">
          <Link to="/themes/proposals">{t("みんなの提案", "All proposals")}</Link>
        </Button>
        <Button
          asChild
          className="rounded-full bg-amber-500 font-bold text-white hover:bg-amber-600"
        >
          <Link to="/themes/proposals/new">
            {t("お題を提案する", "Propose a theme")}
          </Link>
        </Button>
      </div>
    </section>
  )
}
