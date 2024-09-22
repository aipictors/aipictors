import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { XIcon } from "lucide-react"

type Props = {
  type?: "BUG" | "WARNING" | "INFO" | "CONSTRUCTION"
  message: string | null
  fallbackURL: string | null
  deadline?: string
}

export function ConstructionAlert(props: Props) {
  const t = useTranslation()

  // CookieからisVisibleの状態を読み取る
  const [isVisible, setIsVisible] = useState(() => {
    return !document.cookie
      .split("; ")
      .find((row) => row.startsWith("alertDismissed="))
  })

  const handleClose = () => {
    setIsVisible(false)
    // Cookieに「alertDismissed=true」を設定、期限を設定することも可能
    document.cookie = `alertDismissed=true; path=/; max-age=${60 * 60 * 24 * 30}` // 30日間有効
  }

  const alertTitle = () => {
    if (props.type === "BUG") {
      return t("不具合を修正中です。", "We are fixing bugs.")
    }
    if (props.type === "WARNING") {
      return t(
        "このページは現在開発中です。",
        "This page is currently under development.",
      )
    }
    return t(
      "このページは現在開発中です。",
      "This page is currently under development.",
    )
  }

  if (!isVisible) {
    return null
  }

  return (
    <Alert className="space-y-2 border bg-primary text-white dark:text-black">
      <div className="flex items-center justify-between">
        <AlertTitle>{alertTitle()}</AlertTitle>
        <Button size="sm" variant="secondary" onClick={handleClose}>
          {<XIcon size={16} />}
        </Button>
      </div>
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        {props.message && <AlertDescription>{props.message}</AlertDescription>}
        <div className="flex justify-end gap-2">
          <Link
            to={props.fallbackURL ?? "https://www.aipictors.com"}
            className="flex-1 md:flex-auto"
          >
            <Button size="sm" variant="secondary" className="w-full">
              {t("旧バージョンへ", "Go to the old version")}
            </Button>
          </Link>
          <Link to="https://discord.com/invite/aipictors">
            <Button size="sm" variant="secondary">
              {t("不具合報告", "Report a bug")}
            </Button>
          </Link>
        </div>
      </div>
    </Alert>
  )
}
