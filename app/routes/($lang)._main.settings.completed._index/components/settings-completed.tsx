import {} from "react"
import {} from "~/components/ui/toggle-group"
import {} from "~/components/ui/avatar"
import {} from "~/components/ui/card"
import {} from "~/components/ui/carousel"
import { Button } from "~/components/ui/button"
import { useNavigate } from "@remix-run/react"

/**
 * 設定完了ページ
 */
export function SettingsCompleted() {
  const navigate = useNavigate()

  return (
    <>
      <p className="text-center font-bold text-xl">{"🎊"}</p>
      <p className="text-center font-bold text-xl">
        {"おめでとうございます！設定が完了いたしました！"}
      </p>
      <p className="text-center font-bold text-md">{"Aipictorsへようこそ！"}</p>
      <p className="text-center font-bold text-md">
        {"生成機能や、投稿作品を楽しんでみましょう♪"}
      </p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-4">
        <Button
          onClick={() => {
            navigate("/generation")
          }}
          variant={"secondary"}
        >
          {"生成してみる！"}
        </Button>
        <Button
          onClick={() => {
            navigate("/new/image")
          }}
          variant={"secondary"}
        >
          {"投稿してみる！"}
        </Button>
        <Button
          onClick={() => {
            navigate("/")
          }}
          variant={"secondary"}
        >
          {"作品を楽しむ！"}
        </Button>
      </div>
    </>
  )
}
