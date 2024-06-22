import { Alert, AlertDescription, AlertTitle } from "@/_components/ui/alert"
import { Link } from "@remix-run/react"

type Props = {
  type: "BUG" | "WARNING" | "INFO"
  message: string
  fallbackURL: string
  date: string
}

export const ConstructionAlert: React.FC<Props> = (props: Props) => {
  return (
    <Link to={props.fallbackURL}>
      <Alert className="container border-2">
        <AlertTitle>
          {props.type === "BUG"
            ? "バグ"
            : props.type === "WARNING"
              ? "警告"
              : "情報"}
        </AlertTitle>
        <AlertDescription>
          {`${props.message}`}
          元のバージョンはこちらをクリックしてください。
          {`${props.date}までに完了予定です。`}
        </AlertDescription>
      </Alert>
    </Link>
  )
}
