import { Link } from "@remix-run/react"

export function CreatorFooter() {
  return (
    <div className="container flex flex-col items-start gap-y-2 px-8 py-8 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-x-4">
        <Link to={"/app/terms"} className="text-sm">
          {"利用規約"}
        </Link>
        <Link to={"/app/privacy"} className="text-sm">
          {"プライバシーポリシー"}
        </Link>
      </div>
      <p className="font-bold text-sm">{"© 2023 Aipictors"}</p>
    </div>
  )
}
