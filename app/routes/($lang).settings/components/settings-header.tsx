import { Link } from "@remix-run/react"
import { ChevronLeftIcon } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  title: string
}

/**
 * 設定画面のヘッダー
 */
export function SettingsHeader(props: Props) {
  return (
    <Card className="h-16">
      <CardContent className="relative flex h-16 w-full items-center p-2 text-center">
        <Link to={"/settings"} className="absolute text-left">
          <ChevronLeftIcon />
        </Link>
        <p className="m-auto text-center font-bold">{props.title}</p>
      </CardContent>
    </Card>
  )
}
