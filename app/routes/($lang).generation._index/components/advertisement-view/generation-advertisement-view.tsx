import { useEffect, useState } from "react"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { Button } from "~/components/ui/button"
import { XIcon } from "lucide-react"

/**
 * 広告（× で閉じると再表示しない）
 */
export function GenerationAdvertisementView () {
  const t = useTranslation()
  const [hidden, setHidden] = useState(false)

  // 初回マウント時に「閉じた履歴」があれば非表示
  useEffect(() => {
    if (typeof window !== "undefined") {
      const closed = localStorage.getItem("hideGenerationAd")
      if (closed === "true") setHidden(true)
    }
  }, [])

  // × を押したとき
  const handleClose = () => {
    setHidden(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("hideGenerationAd", "true")
    }
  }

  if (hidden) return null

  return (
    <div className="relative block bg-white sm:hidden">
      {/* 閉じるボタン */}
      <Button
        onClick={handleClose}
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 p-2 text-gray-500 text-lg leading-none"
      >
        <XIcon className="size-6" />
      </Button>

      {/* 広告リンク本体 */}
      <Link to="/plus" target="_blank" className="block pr-8">
        <p className="mt-2 text-left text-sm">
          {t(
            "生成速度と生成枚数を上げるには、",
            "To increase generation speed and number of images, please register for ",
          )}
          <span className="text-blue-500">Aipictors+</span>
          {t("に登録してください。", " registration.")}
        </p>
      </Link>
    </div>
  )
}
