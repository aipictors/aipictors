import { Link } from "@remix-run/react"
import { ChevronRight, KeyRoundIcon, LinkIcon, SmileIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { SNSConnectSection } from "~/routes/($lang).settings.account._index/components/sns-connect-section"

export function AccountSettingsContainer() {
  const t = useTranslation()

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card">
        <Link
          to="/settings/account/login"
          className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <SmileIcon className="size-4 text-muted-foreground" />
            <span>{t("ユーザID", "User ID")}</span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <div className="border-t" />
        <Link
          to="/settings/account/password"
          className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <KeyRoundIcon className="size-4 text-muted-foreground" />
            <span>{t("パスワード", "Password")}</span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <div className="border-t" />
        <Link
          to="#sns-connect"
          className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <LinkIcon className="size-4 text-muted-foreground" />
            <span>{t("SNS紐付け", "Link SNS Accounts")}</span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>

      <div id="sns-connect">
        <SNSConnectSection />
      </div>

      <div className="border-t pt-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-auto px-0 py-0 font-normal text-muted-foreground text-xs underline underline-offset-2 hover:bg-transparent hover:text-foreground"
        >
          <Link to="/settings/account/withdrawal">
            {t("退会", "Withdraw Account")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
