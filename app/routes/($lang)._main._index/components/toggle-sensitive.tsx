import { useEffect, useState } from "react"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useNavigate, useLocation } from "react-router-dom" // React Routerを使用
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale" // 追加

export function ToggleSensitive() {
  const [sensitive, setSensitive] = useState(false)

  const navigate = useNavigate() // リダイレクト用
  const location = useLocation() // 現在のURLを取得
  const locale = useLocale() // 言語を取得

  // URLから"sensitive"フラグをチェック
  useEffect(() => {
    // URLに"/r"が含まれているかを確認 (正規表現を使用)
    if (/\/r($|\/)/.test(location.pathname)) {
      setSensitive(true)
    } else {
      setSensitive(false)
    }
  }, [location.pathname])

  const toggleSensitive = () => {
    const isEnglish = locale === "en"
    let newPathname = location.pathname

    if (sensitive) {
      // センシティブモードをOFFにする（"/r"を削除）
      newPathname = location.pathname.replace(/\/r/, "")
    } else {
      // センシティブモードをONにする
      if (isEnglish) {
        newPathname = location.pathname.startsWith("/en")
          ? location.pathname.replace("/en", "/en/r") // "/en"が既にある場合
          : `/en/r${location.pathname}`
      } else {
        newPathname = `/r${location.pathname}`
      }
    }

    // リダイレクト
    window.location.href = newPathname
    setSensitive(!sensitive)
  }

  const t = useTranslation()

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="sensitive-toggle"
        checked={sensitive}
        onCheckedChange={toggleSensitive}
        aria-label="Toggle sensitive content"
      />
      <Label htmlFor="sensitive-toggle" className="font-medium text-sm">
        {t("センシティブ", "Sensitive")}
      </Label>
    </div>
  )
}
