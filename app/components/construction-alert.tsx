import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Link } from "react-router"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  type?: "BUG" | "WARNING" | "INFO" | "CONSTRUCTION"
  message: string | null
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
        "旧版のサイトはこちら",
        "This page is currently under development。",
      )
    }
    return t(
      "旧版のサイトはこちら",
      "This page is currently under development。",
    )
  }

  return (
    <Alert className="space-y-2 border bg-primary text-white dark:text-black">
      <div className="flex items-center justify-between">
        <AlertTitle>{alertTitle()}</AlertTitle>
      </div>
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        {props.message && <AlertDescription>{props.message}</AlertDescription>}
        <div className="flex justify-end gap-2">
          <Link
            to={props.fallbackURL ?? "https://legacy.aipictors.com"}
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
