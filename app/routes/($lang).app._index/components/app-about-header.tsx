import { AppCanvas } from "~/routes/($lang).app._index/components/app-canvas"
import { Link } from "react-router"
import { useTranslation } from "~/hooks/use-translation"

export function AppAboutHeader() {
  const t = useTranslation()

  return (
    <div className="relative mx-auto w-full px-4 pb-32">
      <div className="absolute inset-0 top-[-8%] z-[-1] h-full w-full opacity-20">
        <AppCanvas />
      </div>
      <div className="relative flex justify-center py-16">
        <img src="/icon.svg" alt="icon" className="w-64" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-4">
            <p className="text-center font-bold text-3xl">
              {t("Aipictorsのアプリが登場", "The Aipictors App is Here")}
            </p>
            <p className="leading-relaxed">
              {t(
                "AIイラスト投稿サイト「Aipictors」のSNS機能がアプリになりました。アプリならどこにいても通知を受け取ったりフォローしているクリエーターの作品をチェックできます。",
                "The AI illustration posting site 'Aipictors' now has an app! With the app, you can receive notifications and check the works of creators you follow wherever you are.",
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-8">
          <Link to="https://apps.apple.com/jp/app/aipictors-ai%E3%83%94%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%BA/id6466581636">
            <img src="/apple/download.svg" alt="download" className="h-12" />
          </Link>
          <Link to="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja">
            <img src="/google/download.png" alt="download" className="h-16" />
          </Link>
        </div>
      </div>
    </div>
  )
}
