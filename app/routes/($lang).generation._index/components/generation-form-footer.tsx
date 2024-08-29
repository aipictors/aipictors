import { Link } from "@remix-run/react"

/**
 * 画像生成
 */
export function GenerationFormFooter() {
  return (
    <footer className="flex justify-start space-x-4 pb-2 opacity-80">
      <Link className="text-sm" to="/generation/terms">
        {"利用規約"}
      </Link>
      <Link className="text-sm" to="/generation/plans">
        {"プラン一覧"}
      </Link>
      <Link className="text-sm" to="/generation/about">
        {"生成機能について"}
      </Link>
    </footer>
  )
}
