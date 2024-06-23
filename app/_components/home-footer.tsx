import { cn } from "@/_lib/cn"
import { Link } from "@remix-run/react"

/**
 * フッター
 */
export const HomeFooter = () => {
  return (
    <footer className={cn("container max-w-none", "space-y-2 border-t py-4")}>
      <div className="flex flex-col gap-x-2 gap-y-2 md:flex-row">
        <div className="flex gap-x-4">
          <Link
            to={"https://www.aipictors.com/terms/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"利用規約"}
          </Link>
          <Link
            to={"https://www.aipictors.com/privacy/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"プライバシーポリシー"}
          </Link>
        </div>
        <div className="flex gap-x-4">
          <Link
            to={"https://www.aipictors.com/company/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"運営会社"}
          </Link>
          <Link
            to={"https://www.aipictors.com/commercialtransaction/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"特定商取引法に基づく表記"}
          </Link>
        </div>
      </div>
      <p className="text-sm">
        {
          "AipictorsはAIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。10万以上の沢山のAIコンテンツが投稿されています！無料AIイラスト、グラビア生成機も搭載されています！"
        }
      </p>
      <div>
        <Link
          to={"https://www.aipictors.com"}
          className="font-bold text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {"© 2024 Aipictors.com"}
        </Link>
      </div>
    </footer>
  )
}
