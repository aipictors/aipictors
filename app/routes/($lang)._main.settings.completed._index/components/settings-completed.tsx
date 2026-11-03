import { Button } from "~/components/ui/button"
import { useNavigate } from "~/lib/app/locale-router"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 設定完了ページ
 */
export function SettingsCompleted () {
  const navigate = useNavigate()
  const t = useTranslation()

  return (
    <>
      <p className="text-center font-bold text-xl">{"🎊"}</p>
      <p className="text-center font-bold text-xl">
        {t(
          "おめでとうございます！設定が完了いたしました！",
          "Congratulations! Your settings have been completed!",
        )}
      </p>
      <p className="text-center font-bold text-md">
        {t("Aipictorsへようこそ！", "Welcome to Aipictors!")}
      </p>
      <p className="text-center font-bold text-md">
        {t(
          "生成機能や、投稿作品を楽しんでみましょう♪",
          "Enjoy generating and exploring posted works!",
        )}
      </p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-4">
        <Button
          onClick={() => {
            navigate("/generation")
          }}
          variant={"secondary"}
        >
          {t("生成してみる！", "Try generating!")}
        </Button>
        <Button
          onClick={() => {
            navigate("/new/image")
          }}
          variant={"secondary"}
        >
          {t("投稿してみる！", "Try posting!")}
        </Button>
        <Button
          onClick={() => {
            navigate("/")
          }}
          variant={"secondary"}
        >
          {t("作品を楽しむ！", "Enjoy the works!")}
        </Button>
      </div>
    </>
  )
}
