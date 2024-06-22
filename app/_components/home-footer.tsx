import { Separator } from "@/_components/ui/separator"
import { Link } from "@remix-run/react"
import {
  RiDiscordLine,
  RiThreadsLine,
  RiTwitterXLine,
  RiYoutubeLine,
} from "@remixicon/react"

/**
 * フッター
 */
export const HomeFooter = () => {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="flex items-center justify-between md:h-24 md:flex-row">
        <div className="flex h-5 items-center space-x-4 text-sm">
          <a
            href={"https://www.aipictors.com/terms/"}
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"利用規約"}
          </a>
          <Separator orientation="vertical" />
          <a
            href={"https://www.aipictors.com/privacy/"}
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"プライバシーポリシー"}
          </a>
          <Separator orientation="vertical" />
          <a
            href={"https://www.aipictors.com/company/"}
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"運営会社"}
          </a>
          <Separator orientation="vertical" />
          <a
            href={"https://www.aipictors.com/commercialtransaction/"}
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"特定商取引法に基づく表記"}
          </a>
        </div>
        <div className="absolute items-center justify-center space-x-4">
          <Link to="https://twitter.com/Aipictors">
            <RiTwitterXLine />
          </Link>
          <Separator orientation="vertical" />
          <Link to={"https://discord.gg/CsSbTHYY"}>
            <RiDiscordLine />
          </Link>
          <Separator orientation="vertical" />
          <Link to={"https://www.threads.net/@aipictors"}>
            <RiThreadsLine />
          </Link>
          <Separator orientation="vertical" />
          <Link to={"https://www.youtube.com/@aipictors"}>
            <RiYoutubeLine />
          </Link>
        </div>
        <Link
          to="https://www.aipictors.com"
          className="font-bold text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {"© 2024 Aipictors.com"}
        </Link>
      </div>
    </footer>
  )
}
