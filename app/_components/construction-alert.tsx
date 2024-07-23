import { Alert, AlertDescription, AlertTitle } from "@/_components/ui/alert"
import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"

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

export const ConstructionAlert: React.FC<Props> = (props: Props) => {
  const alertTitle = () => {
    if (props.type === "BUG") {
      return "不具合を修正中です。"
    }
    if (props.type === "WARNING") {
      return "このページは現在開発中です。"
    }
    return "このページは現在開発中です。"
  }

  return (
    <Alert className="space-y-2 border">
      <AlertTitle>{alertTitle()}</AlertTitle>
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        {props.message && <AlertDescription>{props.message}</AlertDescription>}
        <div className="flex justify-end gap-2">
          <Link
            to={props.fallbackURL ?? "https://www.aipictors.com"}
            className="flex-1 md:flex-auto"
          >
            <Button size={"sm"} variant={"secondary"} className="w-full">
              {"旧バージョンへ"}
            </Button>
          </Link>
          <Link to={"https://discord.com/invite/aipictors"}>
            <Button size={"sm"} variant={"secondary"}>
              {"不具合報告"}
            </Button>
          </Link>
        </div>
      </div>
    </Alert>
  )
}
