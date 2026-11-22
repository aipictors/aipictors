import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { SettingsSection } from "~/routes/($lang).settings/components/settings-section"
import { SettingFcmForm } from "~/routes/($lang).settings.push-notification/components/setting-fcm-form"

/**
 * Push通知の設定ページ
 */
export default function SettingPushNotification() {
  const t = useTranslation()

  const kinds = [
    t(
      "リクエストの申し込み・メッセージ・承諾・納品など",
      "Requests: new requests, messages, acceptance, delivery and more",
    ),
    t(
      "作品へのコメント・コメントへの返信",
      "Comments on your works and replies",
    ),
    t("フォロー", "New followers"),
    t(
      "いいね（同じ時間に続いたときは10分に1回まで）",
      "Likes (at most once every 10 minutes)",
    ),
  ]

  return (
    <div className="w-full space-y-5">
      <div className="block md:hidden">
        <SettingsHeader title={t("Push通知", "Push notifications")} />
      </div>

      <p className="text-muted-foreground text-sm leading-6">
        {t(
          "サイトを開いていないときも、ブラウザの通知でお知らせします。",
          "Get browser notifications even when the site is not open.",
        )}
      </p>

      <SettingFcmForm />

      <SettingsSection
        title={t("届くお知らせ", "What you will be notified about")}
      >
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6">
          {kinds.map((kind) => (
            <li key={kind}>{kind}</li>
          ))}
        </ul>
        <p className="mt-3 text-muted-foreground text-xs leading-5">
          {t(
            "コメント・いいねの通知を受け取るかどうかは「通知・いいね」の設定で選べます（Push通知にも反映されます）。",
            "You can choose whether to get comment and like notifications in “Notifications & Likes” (also applies to push).",
          )}{" "}
          <Link to="/settings/notification" className="underline">
            {t("通知・いいねの設定", "Notifications & Likes settings")}
          </Link>
        </p>
      </SettingsSection>

      <SettingsSection
        title={t("通知が届かないとき", "Not receiving notifications?")}
      >
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="site">
            <AccordionTrigger className="text-sm">
              {t(
                "ブラウザでこのサイトの通知を許可しているか",
                "Allow notifications for this site",
              )}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-6">
              {t(
                "アドレスバーの左の鍵（サイト情報）アイコン →「通知」が「許可」になっているか確認してください。変えたらページを再読み込みして、もう一度ボタンを押してください。",
                "Click the lock (site info) icon on the left of the address bar and make sure Notifications is set to Allow. Then reload the page and press the button again.",
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="windows">
            <AccordionTrigger className="text-sm">Windows</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-6">
              {t(
                "「設定」→「システム」→「通知」で、通知とお使いのブラウザがオンになっているか確認してください。「応答不可（集中モード）」がオンだと表示されません。",
                "Open Settings → System → Notifications and make sure notifications and your browser are on. Nothing is shown while Do not disturb (Focus) is on.",
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="mac">
            <AccordionTrigger className="text-sm">Mac</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-6">
              {t(
                "「システム設定」→「通知」でお使いのブラウザ（Chrome など）の通知を許可してください。「集中モード」がオンだと表示されません。",
                "Open System Settings → Notifications and allow notifications for your browser (Chrome etc.). Nothing is shown while Focus is on.",
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="one-browser">
            <AccordionTrigger className="text-sm">
              {t("いくつかのブラウザで使っている", "Using several browsers")}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-6">
              {t(
                "通知が届くのは最後に設定したブラウザ1つだけです。別のパソコンやブラウザで設定すると、こちらには届かなくなります。届けたいブラウザでこのページを開き、「このブラウザに切り替える」を押してください。",
                "Only the browser you set up last receives notifications. Open this page in the browser you want and press “Switch to this browser”.",
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="phone">
            <AccordionTrigger className="text-sm">
              {t("スマートフォン", "Smartphones")}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-6">
              {t(
                "AndroidはChromeで使えます。iPhone・iPadのブラウザには対応していません。",
                "On Android, use Chrome. Browsers on iPhone and iPad are not supported.",
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SettingsSection>
    </div>
  )
}
