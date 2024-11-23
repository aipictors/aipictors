import { Link } from "react-router";
import { useTranslation } from "~/hooks/use-translation"

/**
 * 画像生成
 */
export function GenerationFormFooter() {
  const t = useTranslation()

  return (
    <footer className="flex justify-start space-x-4 pb-2 opacity-80">
      <Link className="text-sm" to="/generation/terms">
        {t("利用規約", "Terms of Service")}
      </Link>
      <Link className="text-sm" to="/generation/plans">
        {t("プラン一覧", "Plan List")}
      </Link>
      <Link className="text-sm" to="/generation/about">
        {t("生成機能について", "About Image Generation")}
      </Link>
    </footer>
  )
}
