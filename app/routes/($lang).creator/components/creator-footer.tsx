import { Link } from "@remix-run/react"
import { SnsIconLink } from "~/components/sns-icon"

export function CreatorFooter() {
  return (
    <div className="container-shadcn-ui flex flex-col items-start gap-y-3 py-8 sm:flex-row sm:items-center sm:gap-y-0">
      <div className="flex flex-1 gap-x-4">
        <Link to={"/app/terms"} className="text-sm">
          {"利用規約"}
        </Link>
        <Link to={"/app/privacy"} className="text-sm">
          {"プライバシーポリシー"}
        </Link>
      </div>

      {/* SNSアイコン */}
      <div className="flex items-center gap-x-3">
        <span className="font-medium text-sm">Follow us:</span>
        <SnsIconLink url="https://x.com/AIPICTORS" />
        <SnsIconLink url="https://discord.gg/7jA2MmtvtR" />
        <SnsIconLink url="https://github.com/aipictors" />
      </div>

      <p className="font-bold text-sm">{"© 2023 Aipictors"}</p>
    </div>
  )
}
