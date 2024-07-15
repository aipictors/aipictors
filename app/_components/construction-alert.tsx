import { Alert, AlertDescription, AlertTitle } from "@/_components/ui/alert"
import { Link } from "@remix-run/react"

type Props = {
  type: "BUG" | "WARNING" | "INFO"
  title: string
  message?: string
  fallbackURL: string
  date?: string
}

export const ConstructionAlert: React.FC<Props> = (props: Props) => {
  return (
    <Link to={props.fallbackURL}>
      <Alert className="border-2">
        <AlertTitle>
          {props.type === "BUG"
            ? "バグ"
            : props.type === "WARNING"
              ? "ご注意"
              : "情報"}
        </AlertTitle>
        <AlertDescription>
          {`${props.title}`}
          {props.message
            ? `: ${props.message}`
            : "元のバージョンはこちらをクリックしてください。"}
          {props.date &&
            props.type === "WARNING" &&
            `(${props.date}までに完了予定です。)`}
        </AlertDescription>
      </Alert>
    </Link>
  )
}
