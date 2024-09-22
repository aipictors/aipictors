import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /**
   * 一旦は不要
   * @deprecated
   */
  type?: "BUG" | "WARNING" | "INFO" | "CONSTRUCTION"
  /**
   * メッセージ（任意）
   */
  message: string | null
  /**
   * 旧バージョンのURL
   * 値がnullの場合はhttps://www.aipictors.comに遷移する
   */
  fallbackURL: string | null
  deadline?: string
}

export function ConstructionAlert(props: Props) {
  const t = useTranslation()

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

  return (
    <Alert className="space-y-2 border bg-primary text-white dark:text-black">
      <AlertTitle>{alertTitle()}</AlertTitle>
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        {props.message && <AlertDescription>{props.message}</AlertDescription>}
        <div className="flex justify-end gap-2">
          <Link
            to={props.fallbackURL ?? "https://www.aipictors.com"}
            className="flex-1 md:flex-auto"
          >
            <Button size={"sm"} variant={"secondary"} className="w-full">
              {t("旧バージョンへ", "Go to the old version")}
            </Button>
          </Link>
          <Link to={"https://discord.com/invite/aipictors"}>
            <Button size={"sm"} variant={"secondary"}>
              {t("不具合報告", "Report a bug")}
            </Button>
          </Link>
        </div>
      </div>
    </Alert>
  )
}
