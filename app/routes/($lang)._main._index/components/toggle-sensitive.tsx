import { useEffect, useState } from "react"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useNavigate, useLocation, useRevalidator } from "react-router-dom" // React Routerを使用

export function ToggleSensitive() {
  const [sensitive, setSensitive] = useState(false)

  const navigate = useNavigate() // リダイレクト用

  const location = useLocation() // 現在のURLを取得

  const revalidator = useRevalidator()

  // Cookieから"sensitive"フラグをチェック
  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sensitive="))
      ?.split("=")[1]

    if (cookieValue === "1") {
      setSensitive(true)
    }
  }, [])

  const toggleSensitive = () => {
    if (sensitive) {
      // センシティブフラグを削除（Cookieの有効期限を過去に設定）
      document.cookie = "sensitive=1; max-age=0; path=/"

      // URLから/sensitiveを取り除きリダイレクト
      const newUrl = location.pathname.replace("/sensitive", "")

      navigate(newUrl === "" ? "/" : newUrl, { replace: true }) // URLを更新してリダイレクト
    } else {
      // センシティブフラグを設定
      document.cookie = "sensitive=1; path=/"

      revalidator.revalidate()
    }

    setSensitive(!sensitive)
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="sensitive-toggle"
        checked={sensitive}
        onCheckedChange={toggleSensitive}
        aria-label="Toggle sensitive content"
      />
      <Label htmlFor="sensitive-toggle" className="font-medium text-sm">
        {"センシティブ"}
      </Label>
    </div>
  )
}
