import { Button } from "@/components/ui/button"
import { Link } from "@remix-run/react"

type Props = {
  text: string
  link: string
}

/**
 * ヘッダーの通知アイテム
 */
export const HeaderNotificationItem = (props: Props) => {
  return (
    <Link to={`${props.link}`}>
      <Button variant={"link"}>#{props.text}</Button>
    </Link>
  )
}
