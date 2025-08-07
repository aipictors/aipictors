import { cn } from "~/lib/utils"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { SnsIconLink } from "~/components/sns-icon"

export function AppFooter() {
  const t = useTranslation()

  return (
    <footer
      className={cn(
        "container-shadcn-ui max-w-none",
        "space-y-2 border-t py-4",
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex space-x-4">
          <Link to={"/app/terms"} className="text-sm">
            {t("利用規約", "Terms of Service")}
          </Link>
          <Link to={"/app/privacy"} className="text-sm">
            {t("プライバシーポリシー", "Privacy Policy")}
          </Link>
        </div>

        {/* SNSアイコン */}
        <div className="mt-2 flex items-center gap-x-3 md:mt-0">
          <span className="font-medium text-sm">Follow us:</span>
          <SnsIconLink url="https://x.com/AIPICTORS" />
          <SnsIconLink url="https://discord.gg/hcQggQEYfn" />
          <SnsIconLink url="https://github.com/aipictors" />
        </div>
      </div>

      <p className="text-sm">
        {t(
          "Aipictorsアプリは、AIイラスト・AIフォト・AI小説を投稿できるSNSアプリです。",
          "The Aipictors app is a social media app where you can post AI illustrations, AI photos, and AI novels.",
        )}
      </p>

      <div className="flex">
        <p className="font-bold text-sm">{"© 2023 Aipictors"}</p>
      </div>
    </footer>
  )
}
