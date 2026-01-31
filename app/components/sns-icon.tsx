import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"
import {
  RiFacebookBoxLine,
  RiGithubLine,
  RiInstagramLine,
  RiTwitterXLine,
  RiDiscordLine,
} from "@remixicon/react"
import { MailIcon } from "lucide-react"

type Props = {
  url: string
}

/**
 * SNSアイコンリンク
 */
export function SnsIconLink (props: Props): React.ReactNode {
  const icon = () => {
    if (props.url.includes("twitter") || props.url.includes("x.com")) {
      return <RiTwitterXLine className="size-5" />
    }
    if (props.url.includes("instagram")) {
      return <RiInstagramLine className="size-5" />
    }
    if (props.url.includes("facebook")) {
      return <RiFacebookBoxLine className="size-5" />
    }
    if (props.url.includes("github")) {
      return <RiGithubLine className="size-5" />
    }
    if (props.url.includes("discord")) {
      return <RiDiscordLine className="size-5" />
    }
    // メールアドレス
    if (props.url.includes("mailto")) {
      return <MailIcon className="size-5" />
    }
    // その他
    return (
      // biome-ignore lint/a11y/noSvgWithoutTitle: generic icon
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-5"
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
      <Button
        variant={"outline"}
        size={"sm"}
        className="h-9 w-9 p-2 transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {icon()}
      </Button>
    </Link>
  )
}
