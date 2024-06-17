import { Button } from "@/_components/ui/button"
import {
  RiFacebookBoxLine,
  RiGithubLine,
  RiInstagramLine,
  RiTwitterXLine,
} from "@remixicon/react"
import { MailIcon } from "lucide-react"

type Props = {
  number: string
}

/**
 * SNSアイコンリンク
 */
export const HoverNumber = (props: Props) => {


  return (
    <a href={props.url} target="_blank" rel="noreferrer">
      <Button variant={"secondary"} className="h-8 w-8 rounded-full p-1">
        {icon()}
      </Button>
    </a>
  )
}
