import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"

type Props = {
  text: string
  link: string
}

/**
 * ヘッダーの通知アイテム
 * @param props
 * @returns
 */
export const HeaderNotificationItem = (props: Props) => {
  return (
    <Link to={`${props.link}`}>
      <Button variant={"link"}>#{props.text}</Button>
    </Link>
  )
}
