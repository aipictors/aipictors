import { AppPageCenter } from "@/_components/app/app-page-center"
import { Separator } from "@/_components/ui/separator"
import { SettingFcmForm } from "@/routes/($lang).settings.push-notification/_components/setting-fcm-form"

/**
 * 通知設定ページ
 * @returns
 */
export default function SettingNotification() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"Push通知設定"}</p>
        <p>Push通知を設定することができます。</p>
        <p>
          PCブラウザに対応しています。スマートフォンのブラウザは対応していません。スマートフォンの場合は、今後アプリで通知に対応する予定です。
          通知を受信できるブラウザは1つのみとなります。最後に設定したブラウザ宛に通知されます。
        </p>
        <p>
          Push通知内容、サイト上の通知内容と共通です。現行サイトの右上プロフィールアイコン
          → 設定 → 通知・いいね、から選択できます。
        </p>
        <Separator />
        <SettingFcmForm />
        <Separator />
        <p>
          Push通知を受け取るためには、上記ボタンクリック後に、ブラウザの設定で通知を許可してください。
        </p>
        <p>
          設定後にテスト通知が届きます。通知が表示されない場合は以下を確認してください。
        </p>
        <p>■Windows11の場合</p>
        <p>
          設定 →
          通知、で通知がONになっていること、ご利用のブラウザの通知がONになっていることを確認してください。
        </p>
        <p>
          設定 → フォーカス、でフォーカスをONにしていないか確認してください。
        </p>
      </div>
    </AppPageCenter>
  )
}
