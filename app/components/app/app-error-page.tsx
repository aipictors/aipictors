import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { useAppErrorMessage } from "~/lib/app/hooks/use-app-error-message"

type Props = Readonly<{
  status: number
  message: string
}>

/**
 * エラー時に .data URL を検知してリダイレクトする
 */
export function AppErrorPage (props: Props): React.ReactNode {
  const t = useTranslation()

  const message = useAppErrorMessage(props.message)

  // .data の URL を含むエラーの場合にリダイレクト処理を実行
  if (
    props.message.includes(
      "Unable to decode turbo-stream response from URL:",
    ) &&
    props.message.includes(".data")
  ) {
    // 正規表現でエラー内の URL を抽出
    const match = props.message.match(
      /https:\/\/www\.aipictors\.com\/[^\s]+\.data/,
    )
    if (match) {
      const originalUrl = match[0]
      const redirectUrl = originalUrl.replace(/\.data$/, "") // .data を取り除く
      window.location.replace(redirectUrl)
      return null // リダイレクト中は何も表示しない
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="mt-4 text-center font-bold text-md md:text-xl">
        {t(
          "通信エラーが発生したため、",
          "An error occurred due to a communication error,",
        )}
      </p>
      <p className="mt-0 text-center font-bold text-md md:text-xl">
        {t(
          "しばらくしてから画面更新をお願いいたします。",
          "Please refresh the screen after a while.",
        )}
      </p>
      <img
        src="https://files.aipictors.com/cry-pictorchan-with-shadow.webp"
        className="mt-16 mb-16 w-40"
        alt="cry-pictor-chan"
      />
      <div className="mt-8 flex items-center space-x-2 space-y-1 md:space-y-0">
        <Button
          className="rounded-md px-8 py-2"
          onClick={() => {
            window.location.href = "https://www.aipictors.com/"
          }}
          variant={"secondary"}
        >
          {t("トップ", "Home")}
        </Button>
        <Button
          className="rounded-md px-8 py-2"
          onClick={() => {
            window.location.reload()
          }}
        >
          {t("再読み込み", "Reload")}
        </Button>
      </div>

      <div className="mt-8">
        <p className="text-center">{message}</p>
      </div>
    </div>
  )
}
