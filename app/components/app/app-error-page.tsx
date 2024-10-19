import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { useAppErrorMessage } from "~/lib/app/hooks/use-app-error-message"

type Props = Readonly<{
  status: number
  message: string
}>

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YFhY3hdw0jD
 */
export function AppErrorPage(props: Props) {
  const t = useTranslation()

  const message = useAppErrorMessage(props.message)

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
