import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"
import {
  RiFacebookBoxLine,
  RiGithubLine,
  RiInstagramLine,
  RiTwitterXLine,
} from "@remixicon/react"
import { MailIcon } from "lucide-react"

type Props = {
  url: string
}

/**
 * SNSアイコンリンク
 */
export const SnsIconLink = (props: Props) => {
  const icon = () => {
    if (props.url.includes("twitter") || props.url.includes("x.com")) {
      return <RiTwitterXLine className="h-6 w-6" />
    }
    if (props.url.includes("instagram")) {
      return <RiInstagramLine className="h-6 w-6" />
    }
    if (props.url.includes("facebook")) {
      return <RiFacebookBoxLine className="h-6 w-6" />
    }
    if (props.url.includes("github")) {
      return <RiGithubLine className="h-6 w-6" />
    }
    // メールアドレス
    if (props.url.includes("mailto")) {
      return <MailIcon className="h-6 w-6" />
    }
    // その他
    return (
      // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M22 12h-4l-3 9L9 3l-3 9H2"
        />
      </svg>
    )
  }

  return (
    <Link className="block" to={props.url} target="_blank" rel="noreferrer">
      <Button variant={"secondary"} className="h-10 w-10 rounded-md p-2">
        {icon()}
      </Button>
    </Link>
  )
}
