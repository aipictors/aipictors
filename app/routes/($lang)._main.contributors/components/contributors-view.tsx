import { Button } from "~/components/ui/button"
import { contributors } from "~/routes/($lang)._main.contributors/assets/contributors"
import { ContributorCard } from "~/routes/($lang)._main.contributors/components/contributors-card"
import type { Contributor } from "~/routes/($lang)._main.contributors/types/contributor"
import { Link } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"

/**
 * コントリビュータ一覧
 */
export const ContributorsView = () => {
  return (
    <>
      <div className="space-y-2 py-4">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex flex-grow-3">
            <div className="relative">
              <img
                alt={"コントリビュータ一覧ページトップ"}
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
                  <span className="ml-2">{"Aipictors"}</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full flex-2 space-y-8 py-8 md:px-4">
            <div className="space-y-4">
              <h1 className={"font-bold text-4xl"}>{"コントリビュータ一覧"}</h1>
              <p className={"font-bold text-md"}>{"Contributors"}</p>
            </div>
            <div className="flex flex-col">
              <div>{"AipictorsのContributors一覧ページです！"}</div>
              <div>{"AipictorsはOSSプロジェクトです！"}</div>
              <div>
                {"誰でも開発に参加して機能追加などを行うことができます"}
              </div>
              <div>
                {
                  "新しいAIコンテンツ創作、交流SNSへのご参加をお待ちしております"
                }
              </div>
            </div>
            <Link
              to="https://beta.aipictors.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"outline"} className="m-4 font-bold text-lg">
                Aipictors（β版）
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
              to="https://discord.gg/aipictors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"outline"} className="m-4 font-bold text-lg">
                Discordで開発に参加する
                <MousePointerClickIcon className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <h2 className="py-4 font-bold text-2xl">{"コントリビュータ一覧"}</h2>
        <div className={"grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"}>
          {contributors.map((user: Contributor) => (
            <ContributorCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </>
  )
}
