/**
 * フッター
 * @returns
 */
export const HomeFooter = () => {
  return (
    <footer className="px-4 md:px-8 py-4 border-t space-y-2">
      <div className="flex flex-col md:flex-row gap-y-2 gap-x-2">
        <div className="flex gap-x-4">
          <a
            href={"https://www.aipictors.com/terms/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"利用規約"}
          </a>
          <a
            href={"https://www.aipictors.com/privacy/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"プライバシーポリシー"}
          </a>
        </div>
        <div className="flex gap-x-4">
          <a
            href={"https://www.aipictors.com/company/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"運営会社"}
          </a>
          <a
            href={"https://www.aipictors.com/commercialtransaction/"}
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"特定商取引法に基づく表記"}
          </a>
        </div>
      </div>
      <p className="text-sm">
        {
          "AipictorsはAIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。10万以上の沢山のAIコンテンツが投稿されています！無料AIイラスト、グラビア生成機も搭載されています！"
        }
      </p>
      <div>
        <a
          href={"https://www.aipictors.com"}
          className="font-bold text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {"© 2023 Aipictors.com"}
        </a>
      </div>
    </footer>
  )
}
