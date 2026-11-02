import { PictorChanSays } from "~/components/pictor-chan-says"
import { Button } from "~/components/ui/button"
import { contributors } from "~/routes/($lang)._main.contributors/assets/contributors"
import { ContributorCard } from "~/routes/($lang)._main.contributors/components/contributors-card"
import type { Contributor } from "~/routes/($lang)._main.contributors/types/contributor"
import { Link } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * コントリビュータ一覧
 */
export function ContributorsView () {
  const t = useTranslation()

  const links = [
    { href: "https://beta.aipictors.com", label: t("Aipictors（β版）", "Aipictors (Beta)") },
    { href: "https://github.com/aipictors", label: "GitHub" },
    { href: "https://zenn.dev/p/aipics", label: "Zenn" },
    {
      href: "https://discord.gg/7jA2MmtvtR",
      label: t("Discordで開発に参加する", "Join Development on Discord"),
    },
  ]

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
        <img
          alt={t(
            "コントリビュータ一覧ページトップ",
            "Contributors List Page Top",
          )}
          src={"https://assets.aipictors.com/geometric_shapes.webp"}
          width={675}
          height={675}
          fetchPriority="high"
          decoding="async"
          className="aspect-square w-full max-w-xs shrink-0 rounded-t-md rounded-br-3xl rounded-bl-md object-cover object-top md:max-w-sm"
        />
        <div className="w-full flex-1 space-y-5">
          <div className="space-y-1">
            <h1 className="font-bold text-3xl md:text-4xl">
              {t("コントリビュータ一覧", "Contributors List")}
            </h1>
            <p className="font-bold text-muted-foreground text-sm">
              {t("Contributors", "Contributors")}
            </p>
          </div>
          <div className="flex flex-col leading-relaxed">
            <div>
              {t(
                "AipictorsのContributors一覧ページです！",
                "This is the Contributors List page for Aipictors!",
              )}
            </div>
            <div>
              {t(
                "AipictorsはOSSプロジェクトです！",
                "Aipictors is an OSS project!",
              )}
            </div>
            <div>
              {t(
                "誰でも開発に参加して機能追加などを行うことができます",
                "Anyone can participate in development and add features.",
              )}
            </div>
            <div>
              {t(
                "新しいAIコンテンツ創作、交流SNSへのご参加をお待ちしております",
                "We look forward to your participation in creating new AI content and joining our social network!",
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Button
                key={link.href}
                asChild
                variant={"outline"}
                className="h-11 font-bold"
              >
                <Link to={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <MousePointerClickIcon className="ml-2 size-4" />
                </Link>
              </Button>
            ))}
          </div>
          <PictorChanSays>
            {t(
              `Aipictorsは、ここにいる ${contributors.length} 人のみなさんに支えられています。いつもありがとうございます！`,
              `Aipictors is supported by these ${contributors.length} people. Thank you, always!`,
            )}
          </PictorChanSays>
        </div>
      </div>

      <h2 className="py-4 font-bold text-2xl">
        {t("コントリビュータ一覧", "Contributors List")}
      </h2>
      <div className={"grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"}>
        {contributors.map((user: Contributor) => (
          <ContributorCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}
