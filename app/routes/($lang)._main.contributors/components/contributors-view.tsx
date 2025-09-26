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
export function ContributorsView() {
  const t = useTranslation()

  return (
    <>
      <div className="space-y-2 py-4">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex flex-grow-3">
            <div className="relative">
              <img
                alt={t(
                  "コントリビュータ一覧ページトップ",
                  "Contributors List Page Top",
                )}
                src={"https://assets.aipictors.com/geometric_shapes.webp"}
                className="w-full rounded-t-md rounded-br-3xl rounded-bl-md object-cover object-top"
              />
              <Link
                className="absolute right-4 bottom-4"
                to={"https://beta.aipictors.com"}
                target={"_blank"}
                rel={"noreferrer noopener"}
              >
                <Button className="rounded-full">
                  <MousePointerClickIcon />
                  <span className="ml-2">{t("Aipictors", "Aipictors")}</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full flex-2 space-y-8 py-8 md:px-4">
            <div className="space-y-4">
              <h1 className={"font-bold text-4xl"}>
                {t("コントリビュータ一覧", "Contributors List")}
              </h1>
              <p className={"font-bold text-md"}>
                {t("Contributors", "Contributors")}
              </p>
            </div>
            <div className="flex flex-col">
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
            <Link
              to="https://beta.aipictors.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"outline"} className="m-4 font-bold text-lg">
                {t("Aipictors（β版）", "Aipictors (Beta)")}
                <MousePointerClickIcon className="ml-2" />
              </Button>
            </Link>
            <Link
              to="https://github.com/aipictors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"outline"} className="m-4 font-bold text-lg">
                GitHub
                <MousePointerClickIcon className="ml-2" />
              </Button>
            </Link>
            <Link
              to="https://zenn.dev/p/aipics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"outline"} className="m-4 font-bold text-lg">
                Zenn
                <MousePointerClickIcon className="ml-2" />
              </Button>
            </Link>
            <Link
              to="https://discord.gg/7jA2MmtvtR"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"outline"} className="m-4 font-bold text-lg">
                {t("Discordで開発に参加する", "Join Development on Discord")}
                <MousePointerClickIcon className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <h2 className="py-4 font-bold text-2xl">
          {t("コントリビュータ一覧", "Contributors List")}
        </h2>
        <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
          {contributors.map((user: Contributor) => (
            <ContributorCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </>
  )
}
