import { Alert, AlertTitle, AlertDescription } from "@/_components/ui/alert"
import {} from "@/_components/ui/card"
import { Link } from "@remix-run/react"

export const HeaderDevelopBanner = () => {
  return (
    <Link to={"https://www.aipictors.com"}>
      <Alert variant="destructive" className="border-2">
        <AlertTitle>{"こちらは開発中のベータ版です。"}</AlertTitle>
        <AlertDescription>
          {
            "正常に動作しない可能性があります。現行のサイトはこちらをクリックしてください。"
          }
        </AlertDescription>
      </Alert>
    </Link>
  )
}
