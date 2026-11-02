import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { SnsIconLink } from "~/components/sns-icon"

export function AppFooter () {
  const t = useTranslation()

  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-1">
            <Link
              to={"/app/terms"}
              className="inline-flex min-h-11 items-center pr-3 text-sm underline-offset-4 hover:underline"
            >
              {t("利用規約", "Terms of Service")}
            </Link>
            <Link
              to={"/app/privacy"}
              className="inline-flex min-h-11 items-center px-3 text-sm underline-offset-4 hover:underline"
            >
              {t("プライバシーポリシー", "Privacy Policy")}
            </Link>
          </div>

          {/* SNSアイコン */}
          <div className="flex items-center gap-x-3">
            <span className="font-medium text-sm">Follow us:</span>
            <SnsIconLink url="https://x.com/AIPICTORS" />
            <SnsIconLink url="https://discord.gg/7jA2MmtvtR" />
            <SnsIconLink url="https://github.com/aipictors" />
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          {t(
            "Aipictorsアプリは、AIイラスト・AIフォト・AI小説を投稿できるSNSアプリです。",
            "The Aipictors app is a social media app where you can post AI illustrations, AI photos, and AI novels.",
          )}
        </p>

        <p className="font-bold text-sm">{"© Aipictors"}</p>
      </div>
    </footer>
  )
}
