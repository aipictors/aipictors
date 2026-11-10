import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

/**
 * アカウント削除（退会）の案内ページ
 * Google Play のデータセーフティに登録している公開 URL なので、ログインなしで読めるようにする
 */
export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.HELP_WITHDRAWAL, undefined, props.params.lang)
}

export default function HelpWithdrawalPage() {
  const t = useTranslation()

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-sm leading-7">
      <header className="space-y-2">
        <h1 className="font-bold text-2xl">
          {t(
            "アカウントの削除（退会）について",
            "How to delete your account",
          )}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "Aipictors（アプリ名: Aipictors - AIピクターズ、提供: Aipictors）のアカウントと関連データを削除する方法を説明します。",
            "This page explains how to delete your account and related data for Aipictors (app name: Aipictors - AIピクターズ, developer: Aipictors).",
          )}
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="font-bold text-lg">
          {t("削除の手順", "Steps to delete your account")}
        </h2>
        <ol className="list-decimal space-y-1 pl-6">
          <li>
            {t(
              "ブラウザで Aipictors にログインします。",
              "Log in to Aipictors in your browser.",
            )}
          </li>
          <li>
            <Link
              to="/settings/account/withdrawal"
              className="text-primary underline"
            >
              {t("退会ページ", "The account deletion page")}
            </Link>
            {t(
              "を開きます（設定 > アカウント > 退会）。",
              " is at Settings > Account > Withdraw Account. Open it.",
            )}
          </li>
          <li>
            {t(
              "アカウントIDの先頭6文字を入力し、確認項目にチェックを入れて退会します。",
              "Enter the first 6 characters of your account ID, complete the confirmations, and withdraw.",
            )}
          </li>
        </ol>
        <p>
          {t(
            "ログインできない場合は、",
            "If you cannot log in, please contact ",
          )}
          <Link to="/support" className="text-primary underline">
            {t("サポート", "support")}
          </Link>
          {t(
            "からご連絡ください。退会すると元に戻せません。",
            ". Deleting your account cannot be undone.",
          )}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-lg">
          {t("削除されるデータ", "Data that is deleted")}
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            {t(
              "表示名、アイコン画像、ヘッダー画像、自己紹介、SNSなどのリンク",
              "Display name, icon image, header image, bio, and links such as social accounts",
            )}
          </li>
          <li>
            {t(
              "プロフィールのメールアドレス、通知用のトークン",
              "Profile email address and notification tokens",
            )}
          </li>
          <li>
            {t(
              "ログイン情報、Google や X などの連携情報",
              "Login credentials and links to providers such as Google and X",
            )}
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-lg">
          {t("削除されずに残るデータ", "Data that is kept")}
        </h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            {t(
              "投稿した作品は削除されず、非公開になります。作品そのものを削除したい場合は、退会する前に各作品を削除してください。",
              "Your works are not deleted; they become private. To delete the works themselves, delete each work before withdrawing.",
            )}
          </li>
          <li>
            {t(
              "スタンプの履歴は残りますが、どのユーザーのものかは表示されなくなります。",
              "Sticker history remains, but it no longer shows which user it belonged to.",
            )}
          </li>
          <li>
            {t(
              "退会の記録として、退会時のログインID、表示名、メールアドレス、URL、登録日時、退会日時を保持します。",
              "As a record of the withdrawal, we keep the login ID, display name, email address, URL, registration date, and withdrawal date.",
            )}
          </li>
        </ul>
        <p>
          {t(
            "上記の残るデータに保持期間の定めはありません。",
            "There is no fixed retention period for the data listed above.",
          )}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-lg">
          {t("有料プランについて", "Paid plans")}
        </h2>
        <p>
          {t(
            "Web（クレジットカード）で加入した有料プランは、退会と同時に解約されます。App Store または Google Play で加入した定期購入は、各ストアの定期購入の管理画面から解約してください。",
            "Paid plans purchased on the web (credit card) are canceled when you withdraw. Subscriptions purchased through the App Store or Google Play must be canceled from each store's subscription settings.",
          )}
        </p>
      </section>
    </article>
  )
}
