import { useEffect, useState } from "react"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useNavigate, useLocation } from "react-router-dom" // React Routerを使用
import { useTranslation } from "~/hooks/use-translation"

export function ToggleSensitive() {
  const [sensitive, setSensitive] = useState(false)

  const navigate = useNavigate() // リダイレクト用

  const location = useLocation() // 現在のURLを取得

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
    if (sensitive) {
      const newUrl =
        location.pathname.replace(/^\/r/, "") === ""
          ? "/"
          : location.pathname.replace(/^\/r/, "")
      window.location.href = newUrl
    } else {
      window.location.href = `/r${location.pathname}`
      console.log(`/r${location.pathname}`)
    }
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
