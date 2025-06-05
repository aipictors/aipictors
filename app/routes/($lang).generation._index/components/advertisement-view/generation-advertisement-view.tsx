import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 広告
 */
export function GenerationAdvertisementView() {
  const t = useTranslation()

  return (
    <Link to="/plus" className="block sm:hidden">
      <p className="mt-2 text-left text-sm">
        {t(
          "生成速度と生成枚数を上げるには、",
          "To increase generation speed and number of images, please register for ",
        )}
        <span className="text-blue-500">Aipictors+</span>
        {t("に登録してください。", " registration.")}
      </p>
    </Link>
  )
}
