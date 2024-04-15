import { Button } from "@/_components/ui/button"
import Link from "next/link"

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
    <Link href={`${props.link}`}>
      <Button variant={"link"}>#{props.text}</Button>
    </Link>
  )
}
